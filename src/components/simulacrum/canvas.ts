import * as THREE from 'three'
import { Queue, ObjectInfo, ObjectType, SimulacrumState, Vector } from '../../data/models'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { SimulacrumObject, DraggingMode } from './models'
import { MouseController } from './mouse-controller.ts'

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

    protected mouseController: MouseController = new MouseController(
        this.renderer.domElement, this.camera, this.objects
    )

    protected eventLoop: Queue<SimulacrumState> = new Queue()
    protected stepDuration: number = 1000 / 60
    protected stepTime: number = 0

    public dragControl: DraggingMode = DraggingMode.Movement

    constructor() {
        this.scene.background = new THREE.Color(0xfbf0d1)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.setOrbitControls()
        this.registerEvents()
        this.fitCameraPosition()
        this.animate()
    }

    protected getScenePosition(outerPosition: Vector) {
        const containerX = outerPosition.x - this.renderer.domElement.offsetLeft
        const containerY = outerPosition.y - this.renderer.domElement.offsetTop

        const sceneX = (this.camera.left + containerX) / this.camera.zoom
        const sceneY = (this.camera.top - containerY) / this.camera.zoom

        return new Vector(
            this.camera.position.x + sceneX,
            this.camera.position.y + sceneY
        )
    }

    public addRelativeObject(type: ObjectType, position: Vector) {
        const info = new ObjectInfo()
        info.type = type
        info.position = this.getScenePosition(position)
        const object = this.addObject(info)
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
        window.addEventListener('resize', this.resizeCanvas.bind(this))
    }

    protected setOrbitControls(): void {
        this.orbitControls.mouseButtons = {
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
            LEFT: null,
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