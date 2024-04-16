import {
    OrthographicCamera,
    Plane,
    Raycaster,
    Vector2,
    Vector3
} from 'three';
import {DraggingMode, MouseButton, SimulacrumObject} from './simulacrum-object.ts'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import * as THREE from "three";
import {Project} from "./project.ts";
import {SelectObjectEventParams, SimulacrumEvent} from "./simulacrum.ts";
import {runInAction} from "mobx";

export class MouseController {
    protected orbitControls: OrbitControls
    protected rayCaster: Raycaster = new Raycaster()
    public relativePointer: Vector2 = new Vector2()
    public absolutePointer: Vector3 = new Vector3()

    protected plane: Plane

    public hoveredObject: SimulacrumObject | null = null
    public selectedObject: SimulacrumObject | null = null
    public draggingObject: SimulacrumObject | null = null

    public draggingMode: DraggingMode = DraggingMode.Movement

    constructor(
        protected canvas: HTMLCanvasElement,
        protected camera: OrthographicCamera,
        protected project: Project,
    ) {
        // TODO(erondondron): Плоскости должны задаваться сценой
        this.plane = new Plane(this.camera.getWorldDirection(new Vector3()))
        this.orbitControls = new OrbitControls(this.camera, this.canvas)
        this.setOrbitControls()
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

    protected setOrbitControls(): void {
        this.orbitControls.mouseButtons = {
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
            LEFT: null,
        }
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
        for (const obj of Object.values(this.project.objects)) {
            const intersection = this.rayCaster.intersectObject(obj.view.instance)
            if (intersection.length !== 0) return obj
        }
        return null
    }

    protected hoverObject(): void {
        const intersection = this.getIntersection()
        if (this.hoveredObject === intersection)
            return

        if (this.hoveredObject !== this.selectedObject)
            this.hoveredObject?.view.release()

        this.hoveredObject = intersection
        if (this.hoveredObject !== this.selectedObject)
            this.hoveredObject?.view.hover()
    }

    protected moveObject(): void {
        if (!this.draggingObject) return
        const intersection = this.rayCaster.ray.intersectPlane(this.plane, new Vector3())
        if (!intersection) return
        Object.assign(this.draggingObject.position, intersection)
    }

    protected onPointerMove(event: MouseEvent): void {
        this.setPointerPosition(event)
        if (!this.draggingObject){
            this.hoverObject()
            this.setPointer()
            return
        }
        if (this.draggingMode === DraggingMode.Movement){
            runInAction(() => {this.moveObject()})
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
        this.selectedObject?.view.release()
        this.hoveredObject?.view.select()

        const selectEvent = new CustomEvent<SelectObjectEventParams>(
            SimulacrumEvent.SelectObject,
            {detail: {object: this.hoveredObject}},
        )
        document.dispatchEvent(selectEvent)
    }

    protected onPointerUp(event: MouseEvent): void {
        if (event.button !== MouseButton.Left)
            return
        if (this.draggingObject) {
            this.draggingObject = null
            this.setPointer()
            return
        }
        this.selectedObject?.view.release()
        this.selectedObject = this.hoveredObject
        this.selectedObject?.view.select()
        this.setPointer()
    }
}
