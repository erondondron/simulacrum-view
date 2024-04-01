import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

class GraphicsWindow {
    protected scene: THREE.Scene = new THREE.Scene()
    protected renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true })
    protected camera: THREE.PerspectiveCamera =new THREE.PerspectiveCamera(25)

    private FPS: number = 60
    private timeStep: number = 0
    private stepDuration: number = 1000 / this.FPS

    constructor(protected container: HTMLDivElement) {
        this.container.appendChild(this.renderer.domElement)
        this.resizeWindow()
        this.renderer.render(this.scene, this.camera)

        window.addEventListener('resize', () => this.resizeWindow())
        new OrbitControls(this.camera, this.renderer.domElement)
    }

    public async run(): Promise<void> {
        await this.sceneInit()
        this.sceneEventLoopInit()
        this.animate()
    }

    protected async sceneInit(): Promise<void> { }

    protected sceneEventLoopInit(): void { }

    protected applayStepChanges(): void { }

    private animate = (): void => {
        const currentTimeStep = Date.now()
        const timePassed = currentTimeStep - this.timeStep
        if (timePassed > this.stepDuration) {
            this.applayStepChanges()
            this.timeStep = currentTimeStep
            this.renderer.render(this.scene, this.camera);
        }
        requestAnimationFrame(this.animate)
    }

    private resizeWindow(): void {
        const aspectRatio = this.container.clientWidth / this.container.clientHeight

        this.camera.aspect = aspectRatio
        this.camera.updateProjectionMatrix()
        
        this.renderer.setPixelRatio(aspectRatio)
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    }

    // TODO(erondondron): Позаботиться об очистке ресурсов
    // https://threejs.org/docs/index.html#manual/en/introduction/How-to-dispose-of-objects
    public cleanup(): void { }
}

export default GraphicsWindow
