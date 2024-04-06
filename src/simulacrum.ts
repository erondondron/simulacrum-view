import * as THREE from 'three'
import Queue from './queue'
import { REST_URL, WS_URL } from './urls'
import { plainToClass } from 'class-transformer'
import { Project, SimulacrumObject, SimulacrumObjectType, SimulacrumState, WebSocketMessage, WSMessageType } from './models'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

class GraphicsWindow {
    protected camera: THREE.OrthographicCamera = new THREE.OrthographicCamera()
    protected renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true })
    protected orbitControls: OrbitControls = new OrbitControls(this.camera, this.renderer.domElement)
    protected scene: THREE.Scene = new THREE.Scene()

    private stepTime: number = 0
    private stepDuration: number = 1000 / 60

    constructor() {
        this.scene.background = new THREE.Color(0xfbf0d1)
        this.setOrbitControls()
    }

    public fitToContainer(container: HTMLDivElement): void {
        container.appendChild(this.renderer.domElement)
        container.addEventListener('resize', this.onResizeWindow.bind(this))
        this.resizeCanvas(container)
    }

    public animate = (): void => {
        const currentStepTime = Date.now()
        const timePassed = currentStepTime - this.stepTime
        if (timePassed > this.stepDuration) {
            this.applayStepChanges()
            this.stepTime = currentStepTime
        }
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.animate)
    }

    protected applayStepChanges(): void { }

    protected setOrbitControls(): void {
        this.orbitControls.mouseButtons = {
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
            LEFT: null,
        }
    }

    private onResizeWindow(event: UIEvent): void {
        if (event.target && event.target instanceof HTMLDivElement)
            this.resizeCanvas(event.target)
    }

    private resizeCanvas(container: HTMLDivElement): void {
        this.camera.left = container.clientWidth / -2
        this.camera.right = container.clientWidth / 2
        this.camera.top = container.clientHeight / 2
        this.camera.bottom = container.clientHeight / -2
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(
            container.clientWidth,
            container.clientHeight,
        )
    }
}

export class SimulacrumWindow extends GraphicsWindow {
    protected eventLoop: Queue<SimulacrumState> = new Queue()
    protected objects: Record<number, THREE.Object3D> = {}

    constructor(protected project: Project) {
        super()
        this.fetchProjectInitState()
        this.fitCameraPosition()
    }

    public runCalculations(): void {
        const socket = new WebSocket(`${WS_URL}/project/${this.project.uid}/changes`)
        socket.onmessage = (event: MessageEvent) => {
            const message = plainToClass(WebSocketMessage, JSON.parse(event.data))
            if (message.type == WSMessageType.Request) {
                const message = new WebSocketMessage()
                message.payload = JSON.stringify({ length: this.eventLoop.length() })
                socket.send(JSON.stringify(message))
                return
            }
            if (message.payload) {
                const state = plainToClass(SimulacrumState, JSON.parse(message.payload))
                this.eventLoop.enqueue(state)
            }
        }
    }

    protected fetchProjectInitState(): void {
        fetch(`${REST_URL}/projects/${this.project.uid}/objects`)
            .then(response => response.json())
            .then(stateJson => {
                const state = plainToClass(SimulacrumState, stateJson)
                for (const objInfo of state.objects) {
                    const object = this.createObject(objInfo)
                    this.objects[objInfo.id] = object
                }
                this.eventLoop.enqueue(state)
                this.applayStepChanges()
            })
    }

    protected fitCameraPosition(): void {
        // TODO(smirnovas): Нужно менять глубину в зависимости от максимального z + размер объекта
        this.camera.position.z = 2000
    }

    protected createObject(info: SimulacrumObject) {
        let objectGeometry: THREE.BufferGeometry
        switch (info.type) {
            case SimulacrumObjectType.Cube:
                objectGeometry = new THREE.BoxGeometry(50, 50, 50)
                break;
            default:
                objectGeometry = new THREE.SphereGeometry(25, 16, 16)
                break;
        }
        const edgeGeometry = new THREE.EdgesGeometry(objectGeometry);

        const objectMaterial = new THREE.MeshBasicMaterial({ color: 'white' })
        const object = new THREE.Mesh(objectGeometry, objectMaterial)

        const edgeMaterial = new THREE.LineBasicMaterial({ color: 'black'})
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)

        const group = new THREE.Group()
        group.add(object)
        group.add(edges)

        this.setObjectPosition(group, info)
        this.scene.add(group)
        return group
    }

    protected setObjectPosition(object: THREE.Object3D, info: SimulacrumObject) {
        object.position.x = info.position.x
        object.position.y = info.position.y
        object.position.z = info.position.z
        object.rotation.x = info.rotation.x
        object.rotation.y = info.rotation.y
        object.rotation.z = info.rotation.z
    }

    protected applayStepChanges(): void {
        if (this.eventLoop.isEmpty())
            return

        const statement = this.eventLoop.dequeue()
        for (const objInfo of statement.objects) {
            const obj = this.objects[objInfo.id]
            if (obj) this.setObjectPosition(obj, objInfo)
        }
    }
}

export class EditableSimulacrumWindow extends SimulacrumWindow {
    protected draggedObject: THREE.Object3D | null = null
    protected droppedHook: ((value: SimulacrumObjectType | null) => void) | null = null

    constructor(project: Project) {
        super(project)
        this.renderer.domElement.addEventListener('click', this.onMouseClicked.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    public setDroppedHook(hook: (value: SimulacrumObjectType | null) => void): void {
        this.droppedHook = hook
    }

    public setDraggedObject(type: SimulacrumObjectType | null) {
        if (this.draggedObject)
            this.scene.remove(this.draggedObject)
        if (!type)
            return
        const info = new SimulacrumObject()
        info.type = type
        info.position.x = this.camera.left * 2
        info.position.y = this.camera.top * 2
        this.draggedObject = this.createObject(info)
        this.scene.add(this.draggedObject)
    }

    public getState(): SimulacrumState {
        const state = new SimulacrumState()
        state.objects = Object.values(this.objects).map(item => this.getObjectState(item))
        return state
    }

    protected getObjectState(object: THREE.Object3D): SimulacrumObject {
        const state = new SimulacrumObject()
        state.id = object.id
        const mesh = object.children[0]
        const isCube = mesh instanceof THREE.Mesh && mesh.geometry instanceof THREE.BoxGeometry
        state.type = isCube ? SimulacrumObjectType.Cube : SimulacrumObjectType.Sphere
        state.position.x = object.position.x
        state.position.y = object.position.y
        state.position.z = object.position.z
        state.rotation.x = object.rotation.x
        state.rotation.y = object.rotation.y
        state.rotation.z = object.rotation.z
        return state
    }

    protected onMouseClicked() {
        if (!this.draggedObject)
            return
        this.objects[this.draggedObject.id] = this.draggedObject
        this.draggedObject = null
        if (this.droppedHook)
            this.droppedHook(null)
    }

    protected onMouseMove(event: MouseEvent) {
        if (!this.draggedObject)
            return
        const containerX = event.clientX - this.renderer.domElement.offsetLeft
        const containerY = event.clientY - this.renderer.domElement.offsetTop

        const cameraX = this.camera.position.x + this.camera.left
        const cameraY = this.camera.position.y + this.camera.top

        this.draggedObject.position.x = cameraX + containerX
        this.draggedObject.position.y = cameraY - containerY
    }
}
