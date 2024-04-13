import {
    EventDispatcher,
    OrthographicCamera,
    Plane,
    Raycaster,
    Vector2,
    Vector3
} from 'three';
import {DraggingMode, MouseButton, SimulacrumObject} from './models';

export class MouseController extends EventDispatcher {
    protected rayCaster: Raycaster = new Raycaster()
    protected relativePointer: Vector2 = new Vector2()
    protected absolutePointer: Vector3 = new Vector3()
    protected plane: Plane

    protected hoveredObject: SimulacrumObject | null = null
    protected selectedObject: SimulacrumObject | null = null
    protected draggingObject: SimulacrumObject | null = null

    public draggingMode: DraggingMode = DraggingMode.Movement

    constructor(
        protected canvas: HTMLCanvasElement,
        protected camera: OrthographicCamera,
        protected objects: Record<string, SimulacrumObject>
    ) {
        super()
        this.activate()

        // TODO(erondondron): Плоскости должны задаваться сценой
        this.plane = new Plane(this.camera.getWorldDirection(new Vector3()))
    }

    public dispose(): void { this.deactivate() }

    protected activate(): void {
        this.canvas.addEventListener('wheel', this.onPointerMove.bind(this))
        this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this))
        this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this))
        this.canvas.addEventListener('pointerup', this.onPointerUp.bind(this))
        // this.canvas.addEventListener('pointerleave', onPointerCancel)
    }

    protected deactivate(): void {
        this.canvas.removeEventListener('wheel', this.onPointerMove.bind(this))
        this.canvas.removeEventListener('pointermove', this.onPointerMove.bind(this))
        this.canvas.removeEventListener('pointerdown', this.onPointerDown.bind(this))
        this.canvas.removeEventListener('pointerup', this.onPointerUp.bind(this))
        // this.canvas.removeEventListener('pointerleave', onPointerCancel)
    }

    protected setPointer(): void {
        if (
            this.draggingObject
            || this.selectedObject !== null
            && this.selectedObject === this.hoveredObject
        ) {
            this.canvas.style.cursor = 'move'
            return
        }
        if (
            this.hoveredObject
            && this.hoveredObject !== this.selectedObject
        )
        {
            this.canvas.style.cursor = 'pointer'
            return
        }
        this.canvas.style.cursor = 'auto'
    }

    protected setPointerPosition(event: MouseEvent): void {
        const containerX = event.clientX - this.canvas.offsetLeft
        const containerY = event.clientY - this.canvas.offsetTop

        const sceneX = (this.camera.left + containerX) / this.camera.zoom
        const sceneY = (this.camera.top - containerY) / this.camera.zoom

        this.absolutePointer.x = this.camera.position.x + sceneX
        this.absolutePointer.y = this.camera.position.y + sceneY

        this.relativePointer.x = (this.camera.left + containerX) / this.camera.right
        this.relativePointer.y = (this.camera.top - containerY) / this.camera.top

        this.rayCaster.setFromCamera(this.relativePointer, this.camera)
    }

    protected getIntersection(): SimulacrumObject | null {
        this.rayCaster.setFromCamera(this.relativePointer, this.camera)
        for (const obj of Object.values(this.objects)) {
            const intersection = this.rayCaster.intersectObject(obj.instance)
            if (intersection.length !== 0) return obj
        }
        return null
    }

    protected hoverObject(): void {
        const intersection = this.getIntersection()
        if (this.hoveredObject === intersection)
            return

        if (this.hoveredObject !== this.selectedObject)
            this.hoveredObject?.release()

        this.hoveredObject = intersection
        if (this.hoveredObject !== this.selectedObject)
            this.hoveredObject?.hover()
    }

    protected moveObject(): void {
        if (!this.draggingObject) return
        const intersection = this.rayCaster.ray.intersectPlane(this.plane, new Vector3())
        if (!intersection) return
        this.draggingObject.instance.position.copy(intersection)
    }

    protected onPointerMove(event: MouseEvent): void {
        this.setPointerPosition(event)
        if (!this.draggingObject){
            this.hoverObject()
            this.setPointer()
            return
        }
        if (this.draggingMode === DraggingMode.Movement){
            this.moveObject()
            return
        }
    }

    protected onPointerDown(event: MouseEvent): void {
        if (event.button !== MouseButton.Left)
            return
        if (this.hoveredObject === this.selectedObject){
            this.draggingObject = this.selectedObject
            return
        }
        this.selectedObject?.release()
        this.hoveredObject?.select()
    }

    protected onPointerUp(event: MouseEvent): void {
        if (event.button !== MouseButton.Left)
            return
        if (this.draggingObject) {
            this.draggingObject = null
            this.setPointer()
            return
        }
        this.selectedObject?.release()
        this.selectedObject = this.hoveredObject
        if (this.selectedObject) {
            this.selectedObject.select()
        }
        this.setPointer()
    }
}
