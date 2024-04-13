import { EventDispatcher, OrthographicCamera, Raycaster, Vector2, Vector3} from 'three';
import {MouseButton, SimulacrumObject} from './models';

// TODO(erondondron): Если сигналы не планируется посылать, тогда EventDispatcher не нужен
export class MouseController extends EventDispatcher {
    protected rayCaster: Raycaster = new Raycaster()
    protected relativePointer: Vector2 = new Vector2()
    protected absolutePointer: Vector3 = new Vector3()

    protected hoveredObject: SimulacrumObject | null = null
    protected selectedObject: SimulacrumObject | null = null
    protected draggingObject: SimulacrumObject | null = null

    constructor(
        protected canvas: HTMLCanvasElement,
        protected camera: OrthographicCamera,
        protected objects: Record<string, SimulacrumObject>
    ) {
        super()
        this.activate()
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
        // if selected - drag or rotate mode
        // if hovered - selection mode
        if (!this.hoveredObject) {
            this.canvas.style.cursor = 'auto'
            return
        }
        this.canvas.style.cursor = 'pointer'
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

    protected onPointerMove(event: MouseEvent): void {
        this.setPointerPosition(event)
        if (!this.draggingObject){
            this.hoverObject()
            this.setPointer()
            return
        }
        // move or rotate
    }

    protected onPointerDown(event: MouseEvent): void {
        if (event.button !== MouseButton.Left)
            return
        this.selectedObject?.release()
        this.hoveredObject?.select()
    }

    protected onPointerUp(event: MouseEvent): void {
        if (event.button !== MouseButton.Left)
            return
        this.selectedObject?.release()
        this.selectedObject = this.hoveredObject
        if (this.selectedObject) {
            this.selectedObject.select()
        }
    }
}
