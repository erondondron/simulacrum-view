import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

class GraphicsWindow {
    protected camera: THREE.OrthographicCamera = new THREE.OrthographicCamera()
    protected renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true })
    protected scene: THREE.Scene = new THREE.Scene()
    protected sceneChanged: boolean = true

    private FPS: number = 60
    private timeStep: number = 0
    private stepDuration: number = 1000 / this.FPS

    constructor(protected container: HTMLDivElement) {
        this.container.appendChild(this.renderer.domElement)
        new OrbitControls(this.camera, this.renderer.domElement)

        this.camera.position.z = this.container.clientWidth
        this.resizeWindow()
        this.sceneInit()

        window.addEventListener('resize', () => this.resizeWindow())
    }

    public runCalculations(): void { }

    protected async sceneInit(): Promise<void> { }

    protected applayStepChanges(): void { }

    public animate = (): void => {
        const currentTimeStep = Date.now()
        const timePassed = currentTimeStep - this.timeStep
        if (timePassed > this.stepDuration) {
            this.applayStepChanges()
            this.timeStep = currentTimeStep
            this.sceneChanged = true
        }
        if (this.sceneChanged) {
            this.renderer.render(this.scene, this.camera)
            this.sceneChanged = false
        }
        requestAnimationFrame(this.animate)
    }

    private resizeWindow(): void {
        this.camera.left = this.container.clientWidth / -2
        this.camera.right = this.container.clientWidth / 2
        this.camera.top = this.container.clientHeight / 2
        this.camera.bottom = this.container.clientHeight / -2
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight,
        )
    }

    // TODO(erondondron): Позаботиться об очистке ресурсов
    // https://threejs.org/docs/index.html#manual/en/introduction/How-to-dispose-of-objects
    public cleanup(): void { }
}

export default GraphicsWindow
