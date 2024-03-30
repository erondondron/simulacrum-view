import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function renderScheme(canvas: HTMLCanvasElement) {
    // Создаем сцену
    const scene = new THREE.Scene();

    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Создаем рендерер
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Создаем куб
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Функция анимации
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();

    // Очистка ресурсов при размонтировании компонента
    return () => {
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    };
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
