import { useEffect, useRef } from 'react';
import * as THREE from 'three';

class Scene {
    public instance: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer

    constructor(canvas: HTMLCanvasElement) {
        this.instance = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ canvas });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    public addObject(): void {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.instance.add(cube);
    }

    public getObject(objectUUID: string): THREE.Object3D | undefined {
        return this.instance.getObjectByProperty('uuid', objectUUID);
    }

    public animate = (): void => {
        requestAnimationFrame(this.animate);
        const cube = this.instance.children[0];
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        this.renderer.render(this.instance, this.camera);
    }

    // TODO(erondondron): Позаботиться об очистке ресурсов
    // https://threejs.org/docs/index.html#manual/en/introduction/How-to-dispose-of-objects
    public cleanup(): void { }
}

function renderScheme(canvas: HTMLCanvasElement) {
    const scene = new Scene(canvas);
    scene.addObject();
    scene.animate();
    return () => { scene.cleanup(); };
}

function KinematicPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            return renderScheme(canvasRef.current);
        }
    }, []);

    return (
        <div>
            <h2>Кинематика</h2>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default KinematicPage;
