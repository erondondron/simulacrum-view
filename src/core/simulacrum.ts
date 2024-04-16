import * as THREE from 'three'
import {Queue} from './queue.ts'
import {SimulacrumObject} from './simulacrum-object.ts'
import {DraggingMode, MouseController} from './mouse-controller.ts'
import {ObjectInfo, ObjectType, Project, SimulacrumState} from "./project.ts";

export enum SimulacrumEvent {
    ResizeWindow = "resize",
    CreateObject = "createSimulacrumObject",
    SelectObject = "selectObject",
    MoveObject = "MoveObject",
}
export type CreateObjectEventParams = {type: ObjectType}
export type SelectObjectEventParams = {object: SimulacrumObject | null}

export class Simulacrum {
    protected renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true })
    protected camera: THREE.OrthographicCamera = new THREE.OrthographicCamera()
    protected scene: THREE.Scene = new THREE.Scene()

    protected mouseController: MouseController

    protected eventLoop: Queue<SimulacrumState> = new Queue()
    protected stepDuration: number = 1000 / 60
    protected stepTime: number = 0

    protected removeEventHandlers: () => void = () => {}

    constructor( protected project: Project, editable: boolean = false) {
        this.scene.background = new THREE.Color(0xfbf0d1)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.mouseController = new MouseController(
            this.renderer.domElement, this.camera, project
        )
        if (editable) this.mouseController.draggingMode = DraggingMode.Movement
        this.removeEventHandlers = this.registerEventHandlers()
        void this.initObjects()
        this.animate()
    }

    public async initObjects() {
        await this.project.fetchObjects()
        for (const obj of Object.values(this.project.objects))
            this.scene.add(obj.view.instance)
        this.fitCameraPosition()
    }

    public dispose() { this.removeEventHandlers() }

    public createNewObject(event: CustomEvent<CreateObjectEventParams>): void{
        const info = new ObjectInfo()
        info.type = event.detail.type as ObjectType
        Object.assign(info.position, this.mouseController.absolutePointer)
        const object = new SimulacrumObject(info)
        this.project.objects[object.uid] = object
        this.mouseController.draggingObject = object
        this.scene.add(object.view.instance)
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
                const object = this.project.objects[objInfo.uid]
                object.setObjectPosition(objInfo)
            }
        }
    }

    protected registerEventHandlers(): () => void {
        const resize = this.resizeCanvas.bind(this) as EventListener
        window.addEventListener(SimulacrumEvent.ResizeWindow, resize)
        const createObject = this.createNewObject.bind(this) as EventListener
        document.addEventListener(SimulacrumEvent.CreateObject, createObject)
        return () => {
            window.removeEventListener(SimulacrumEvent.ResizeWindow, resize)
            document.removeEventListener(SimulacrumEvent.CreateObject, createObject)
        }
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
