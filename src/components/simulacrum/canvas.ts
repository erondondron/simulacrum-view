import * as THREE from 'three'
import { Project, Queue, ObjectInfo, ObjectType, SimulacrumState } from '../../data/models'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { SimulacrumObject, MouseButton, DragControl } from './models'

/** 
 * @class - Класс визуализации трёхмерных объектов
 * 
 * @param renderer - Объект, занимающийся отрисовкой проекций объектов, попадающих в объектив камеры.
 *                   Содержит внутри html элемент canvas (renderer.domElement)
 * 
 * @param camera - Камера. Для 3D сцен рекомендуется использовать камеру с перспективой, для 2D - ортогональную
 * @param orbitControls - Контроль положения камеры с помощью мыши
 * 
 * @param scene - Пространство, в котором размещаются объекты
 * @param objects - Словарь объектов сцены по их uid
 * 
 * @param raycaster - Занимается расчётом пересечений лучей и объектов. Полезен при наведении указателя мыши на объкты
 * @param absPointer - Положение указателя мыши в абсолютных координатах сцены
 * @param relPointer - Положение указателя мыши относительно рамок камеры
 * 
 * @param hoveredObject - Объект, на который навели указатель мыши
 * @param selectedObject - Объект, выделенный нажатием мыши
 * 
 * @param onHoverObjectHook - Функция, вызываемая при наведении на объект
 * @param onSelectObjectHook - Функция, вызываемая при выделении объекта
 * 
 * @param eventLoop - Коллекция событий сцены. Каждое событие может нести в себе изменение координат объектов и пр 
 * @param stepDuration - События eventLoop должны происходить не чаще, чем длительность одного расчётного шага
 * @param stepTime - Время текущего расчётного шага
 * 
 * @param dragControl - Тип контроля при захвате в режиме редактирования
 */
export class SimulacrumCanvas {
    protected renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true })

    protected camera: THREE.OrthographicCamera = new THREE.OrthographicCamera()
    protected orbitControls: OrbitControls = new OrbitControls(this.camera, this.renderer.domElement)

    protected scene: THREE.Scene = new THREE.Scene()
    protected objects: Record<string, SimulacrumObject> = {}

    protected raycaster = new THREE.Raycaster();
    protected relPointer: THREE.Vector2 = new THREE.Vector2()
    protected absPointer: THREE.Vector3 = new THREE.Vector3()

    protected hoveredObject: SimulacrumObject | null = null
    protected selectedObject: SimulacrumObject | null = null

    public onHoverObjectHook: ((value: SimulacrumObject | null) => void) | null = null
    public onSelectObjectHook: ((value: SimulacrumObject | null) => void) | null = null

    protected eventLoop: Queue<SimulacrumState> = new Queue()
    protected stepDuration: number = 1000 / 60
    protected stepTime: number = 0

    public dragControl: DragControl = DragControl.Movement
    public dragControlPanel: HTMLDivElement | null = null

    constructor() {
        this.scene.background = new THREE.Color(0xfbf0d1)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.setOrbitControls()
        this.registerEvents()
        this.fitCameraPosition()
        this.animate()
    }

    public addObject(info: ObjectInfo): void {
        const object = new SimulacrumObject(info)
        this.scene.add(object.instance)
        this.objects[object.uid] = object
    }

    public fitToContainer(container: HTMLDivElement): void {
        container.appendChild(this.renderer.domElement)
        this.resizeCanvas(container)
    }

    public fitCameraPosition(): void {
        // TODO(smirnovas): Нужно менять глубину в зависимости от максимального z + размер объекта
        this.camera.position.z = 2000
    }

    protected animate = (): void => {
        const currentStepTime = Date.now()
        const timePassed = currentStepTime - this.stepTime
        if (timePassed > this.stepDuration) {
            this.applayStepChanges()
            this.stepTime = currentStepTime
        }
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.animate)
    }

    protected applayStepChanges(): void {
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
        window.addEventListener('resize', this.onResizeWindow.bind(this))
        window.addEventListener('wheel', this.onPointerMove.bind(this))
        window.addEventListener('mousemove', this.onPointerMove.bind(this))
        window.addEventListener('mousedown', this.onMouseDown.bind(this))
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this))
    }

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

    protected onPointerMove(event: MouseEvent): void {
        this.setPointerPosition(event)
        this.hoverObject()
    }

    protected onMouseDown(event: MouseEvent): void {
        if (event.button !== MouseButton.Left)
            return
        this.selectedObject?.unselect()
        this.hoveredObject?.preselect()
    }

    protected onMouseUp(event: MouseEvent): void {
        if (event.button !== MouseButton.Left)
            return
        this.selectedObject?.unselect()
        this.selectedObject = this.hoveredObject
        if (this.selectedObject) {
            this.selectedObject.select()
            if (this.dragControlPanel) {
                this.dragControlPanel.style.top = event.clientY + 'px'
                this.dragControlPanel.style.left = event.clientX + 'px'
            }
        }
        if (this.onSelectObjectHook)
            this.onSelectObjectHook(this.selectedObject)
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

    protected hoverObject(): void {
        this.raycaster.setFromCamera(this.relPointer, this.camera);
        let currentHoveredObject = null
        for (const obj of Object.values(this.objects)) {
            const intersection = this.raycaster.intersectObject(obj.instance);
            if (intersection.length === 0) continue
            currentHoveredObject = obj
            break
        }
        if (this.hoveredObject !== currentHoveredObject)
            this.hoveredObject?.unhover()
        this.hoveredObject = currentHoveredObject
        this.hoveredObject?.hover()
    }
}

export class EditableSimulacrumWindow extends SimulacrumCanvas {
    protected draggedObject: SimulacrumObject | null = null
    protected droppedHook: ((value: ObjectType | null) => void) | null = null

    constructor(project: Project) {
        super(project)
        this.renderer.domElement.addEventListener('click', this.onMouseClicked.bind(this));
    }

    public setDroppedHook(hook: (value: ObjectType | null) => void): void {
        this.droppedHook = hook
    }

    public setDraggedObject(type: ObjectType | null) {
        if (this.draggedObject)
            this.scene.remove(this.draggedObject.instance)
        if (!type)
            return
        const info = new ObjectInfo()
        info.type = type
        info.position.x = this.camera.left * 2
        info.position.y = this.camera.top * 2
        this.draggedObject = new SimulacrumObject(info)
        this.scene.add(this.draggedObject.instance)
    }

    public getState(): SimulacrumState {
        const state = new SimulacrumState()
        state.objects = Object.values(this.objects).map(item => itemgetInfot())
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
