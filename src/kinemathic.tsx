import { useEffect, useRef } from 'react';
import Scene from './scene';

function renderScheme(canvas: HTMLCanvasElement) {
    const scene = new Scene(canvas);
    scene.run();
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
