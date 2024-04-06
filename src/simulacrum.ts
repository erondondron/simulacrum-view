import * as THREE from 'three'
import Queue from './queue'
import { REST_URL, WS_URL } from './urls'
import { plainToClass } from 'class-transformer'
import { Project, SimulacrumObject, SimulacrumObjectType, SimulacrumState, WebSocketMessage, WSMessageType } from './models'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

class Object3D {
    instance: THREE.Object3D
    bodyGeometry: THREE.BufferGeometry
    bodyMaterial: THREE.MeshBasicMaterial
    body: THREE.Mesh
    edgesGeometry: THREE.EdgesGeometry
    edgesMaterial: THREE.LineBasicMaterial
    edges: THREE.LineSegments

    constructor(info: SimulacrumObject) {
        switch (info.type) {
            case SimulacrumObjectType.Cube:
                this.bodyGeometry = new THREE.BoxGeometry(50, 50, 50)
                break;
            default:
                this.bodyGeometry = new THREE.SphereGeometry(25, 16, 16)
                break;
        }
        this.edgesGeometry = new THREE.EdgesGeometry(this.bodyGeometry)

        this.bodyMaterial = new THREE.MeshBasicMaterial({ color: 'white' })
        this.body = new THREE.Mesh(this.bodyGeometry, this.bodyMaterial)

        this.edgesMaterial = new THREE.LineBasicMaterial({ color: 'black' })
        this.edges = new THREE.LineSegments(this.edgesGeometry, this.edgesMaterial)

        this.instance = new THREE.Group()
        this.instance.add(this.body)
        this.instance.add(this.edges)

        this.setObjectPosition(info)
    }

    public setObjectPosition(info: SimulacrumObject) {
        this.instance.position.x = info.position.x
        this.instance.position.y = info.position.y
        this.instance.position.z = info.position.z
        this.instance.rotation.x = info.rotation.x
        this.instance.rotation.y = info.rotation.y
        this.instance.rotation.z = info.rotation.z
    }

    public asSimulacrumObject(): SimulacrumObject {
        const state = new SimulacrumObject()
        state.id = this.instance.id
        const isCube = this.bodyGeometry instanceof THREE.BoxGeometry
        state.type = isCube ? SimulacrumObjectType.Cube : SimulacrumObjectType.Sphere
        state.position.x = this.instance.position.x
        state.position.y = this.instance.position.y
        state.position.z = this.instance.position.z
        state.rotation.x = this.instance.rotation.x
        state.rotation.y = this.instance.rotation.y
        state.rotation.z = this.instance.rotation.z
        return state
    }
}

enum MouseButton {
    Left,
    Wheel,
    Right,
}

class GraphicsWindow {
    protected camera: THREE.OrthographicCamera = new THREE.OrthographicCamera()
    protected renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true })
    protected orbitControls: OrbitControls = new OrbitControls(this.camera, this.renderer.domElement)
    protected scene: THREE.Scene = new THREE.Scene()
    protected objects: Record<number, Object3D> = {}

    protected raycaster = new THREE.Raycaster();
    protected relPointer: THREE.Vector2 = new THREE.Vector2()
    protected absPointer: THREE.Vector3 = new THREE.Vector3()
    protected hoveredObject: Object3D | null = null
    protected selectedObject: Object3D | null = null

    private stepTime: number = 0
    private stepDuration: number = 1000 / 60

    constructor() {
        this.scene.background = new THREE.Color(0xfbf0d1)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.setOrbitControls()

        window.addEventListener('mousemove', this.onPointerMove.bind(this));
        window.addEventListener('wheel', this.onPointerMove.bind(this));
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
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

    protected hoverObject(): void {
        this.raycaster.setFromCamera(this.relPointer, this.camera);
        let currentHoveredObject = null
        for (const obj of Object.values(this.objects)) {
            const intersection = this.raycaster.intersectObject(obj.instance);
            if (intersection.length === 0) continue
            currentHoveredObject = obj
            break
        }
        if (this.hoveredObject && this.hoveredObject !== currentHoveredObject) {
            if (this.hoveredObject !== this.selectedObject)
                this.hoveredObject.bodyMaterial.color.set("white")
            this.hoveredObject = null
        }
        if (!this.hoveredObject && currentHoveredObject) {
            this.hoveredObject = currentHoveredObject
            if (this.hoveredObject !== this.selectedObject)
                this.hoveredObject.bodyMaterial.color.set('#c8a2c8');
        }
    }

    protected applayStepChanges(): void { }

    protected setOrbitControls(): void {
        this.orbitControls.mouseButtons = {
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
            LEFT: null,
        }
    }

    protected onResizeWindow(event: UIEvent): void {
        if (event.target && event.target instanceof HTMLDivElement)
            this.resizeCanvas(event.target)
    }

    protected resizeCanvas(container: HTMLDivElement): void {
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

    protected setPointerPosition(event: MouseEvent) {
        const containerX = event.clientX - this.renderer.domElement.offsetLeft
        const containerY = event.clientY - this.renderer.domElement.offsetTop

        const sceneX = (this.camera.left + containerX) / this.camera.zoom
        const sceneY = (this.camera.top - containerY) / this.camera.zoom

        this.absPointer.x = this.camera.position.x + sceneX
        this.absPointer.y = this.camera.position.y + sceneY

        this.relPointer.x = (this.camera.left + containerX) / this.camera.right
        this.relPointer.y = (this.camera.top - containerY) / this.camera.top
    }

    protected onPointerMove(event: MouseEvent): void {
        this.setPointerPosition(event)
        this.hoverObject()
    }

    protected onMouseDown(event: MouseEvent): void {
        if (event.button !== MouseButton.Left || !this.hoveredObject)
            return
        this.hoveredObject.bodyMaterial.color.set('#7851a9')
    }

    protected onMouseUp(event: MouseEvent): void {
        if (event.button !== MouseButton.Left || !this.hoveredObject)
            return
        if (this.selectedObject)
            this.selectedObject.bodyMaterial.color.set('white')
        this.selectedObject = this.hoveredObject
    }
}

export class SimulacrumWindow extends GraphicsWindow {
    protected eventLoop: Queue<SimulacrumState> = new Queue()

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
                    const object = new Object3D(objInfo)
                    this.scene.add(object.instance)
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

    protected applayStepChanges(): void {
        if (this.eventLoop.isEmpty())
            return

        const statement = this.eventLoop.dequeue()
        for (const objInfo of statement.objects) {
            const obj = this.objects[objInfo.id]
            if (obj) obj.setObjectPosition(objInfo)
        }
    }
}

export class EditableSimulacrumWindow extends SimulacrumWindow {
    protected draggedObject: Object3D | null = null
    protected droppedHook: ((value: SimulacrumObjectType | null) => void) | null = null

    constructor(project: Project) {
        super(project)
        this.renderer.domElement.addEventListener('click', this.onMouseClicked.bind(this));
    }

    public setDroppedHook(hook: (value: SimulacrumObjectType | null) => void): void {
        this.droppedHook = hook
    }

    public setDraggedObject(type: SimulacrumObjectType | null) {
        if (this.draggedObject)
            this.scene.remove(this.draggedObject.instance)
        if (!type)
            return
        const info = new SimulacrumObject()
        info.type = type
        info.position.x = this.camera.left * 2
        info.position.y = this.camera.top * 2
        this.draggedObject = new Object3D(info)
        this.scene.add(this.draggedObject.instance)
    }

    public getState(): SimulacrumState {
        const state = new SimulacrumState()
        state.objects = Object.values(this.objects).map(item => item.asSimulacrumObject())
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
        this.objects[this.draggedObject.instance.id] = this.draggedObject
        this.draggedObject = null
        if (this.droppedHook)
            this.droppedHook(null)
    }

    protected onPointerMove(event: MouseEvent) {
        this.setPointerPosition(event)
        if (!this.draggedObject) {
            this.hoverObject()
            return
        }
        this.draggedObject.instance.position.x = this.absPointer.x
        this.draggedObject.instance.position.y = this.absPointer.y
    }
}
