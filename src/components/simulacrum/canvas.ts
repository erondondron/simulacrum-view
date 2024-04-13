import * as THREE from 'three'
import { Queue, ObjectInfo, ObjectType, SimulacrumState } from '../../data/models'
import { SimulacrumObject } from './models'
import { MouseController } from './mouse-controller.ts'

export class SimulacrumCanvas {
    protected renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true })

    protected camera: THREE.OrthographicCamera = new THREE.OrthographicCamera()

    protected scene: THREE.Scene = new THREE.Scene()
    protected objects: Record<string, SimulacrumObject> = {}

    protected mouseController: MouseController = new MouseController(
        this.renderer.domElement, this.camera, this.objects
    )

    protected eventLoop: Queue<SimulacrumState> = new Queue()
    protected stepDuration: number = 1000 / 60
    protected stepTime: number = 0

    constructor() {
        this.scene.background = new THREE.Color(0xfbf0d1)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.registerEvents()
        this.fitCameraPosition()
        this.animate()
    }

    public createObject(type: ObjectType) {
        const info = new ObjectInfo()
        info.type = type
        const object = this.addObject(info)
        this.mouseController.draggingObject = object
        object.instance.position.copy(this.mouseController.absolutePointer)
    }

    public addObject(info: ObjectInfo): SimulacrumObject {
        const object = new SimulacrumObject(info)
        this.scene.add(object.instance)
        this.objects[object.uid] = object
        return object
    }

    public fitToContainer(container: HTMLDivElement): void {
        container.appendChild(this.renderer.domElement)
        this.resizeCanvas()
    }

    public fitCameraPosition(): void {
        // TODO(smirnovas): Нужно менять глубину в зависимости от максимального z + размер объекта
        this.camera.position.z = 2000
    }

    protected animate = (): void => {
        const currentStepTime = Date.now()
        const timePassed = currentStepTime - this.stepTime
        if (timePassed > this.stepDuration) {
            this.aplayStepChanges()
            this.stepTime = currentStepTime
        }
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.animate)
    }

    protected aplayStepChanges(): void {
        if (this.eventLoop.isEmpty())
            return

        const statement = this.eventLoop.dequeue()
        for (const objInfo of statement.objects) {
            if (objInfo.uid) {
                const object = this.objects[objInfo.uid]
                object.setObjectPosition(objInfo)
            }
        }
    }

    protected registerEvents() {
        window.addEventListener('resize', this.resizeCanvas.bind(this))
    }

    protected resizeCanvas(): void {
        const container = this.renderer.domElement.parentElement
        if (!container) return
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

export class EditableSimulacrumWindow extends SimulacrumCanvas {

    public getState(): SimulacrumState {
        const state = new SimulacrumState()
        state.objects = Object.values(this.objects).map(item => item.getInfo())
        return state
    }

    protected getObjectState(object: THREE.Object3D): ObjectInfo {
        const state = new ObjectInfo()
        state.id = object.id
        const mesh = object.children[0]
        const isCube = mesh instanceof THREE.Mesh && mesh.geometry instanceof THREE.BoxGeometry
        state.type = isCube ? ObjectType.Cube : ObjectType.Sphere
        state.position.x = object.position.x
        state.position.y = object.position.y
        state.position.z = object.position.z
        state.rotation.x = object.rotation.x
        state.rotation.y = object.rotation.y
        state.rotation.z = object.rotation.z
        return state
    }
}