import * as THREE from 'three';
import Queue from './queue';
import { Type, plainToClass } from 'class-transformer';

class Point {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
    ) { }
}

class ObjectStatement {
    // uuid!: string;

    @Type(() => Point)
    coordinates!: Point;

    @Type(() => Point)
    rotation!: Point;
}

class CameraStatement {
    fieldOfView: number = 75;
    aspectRatio: number = window.innerWidth / window.innerHeight;
    nearPlane: number = 0.1;
    farPlane: number = 1000;

    @Type(() => Point)
    position: Point = new Point(0, 0, 5);
}

class SceneStatement {
    @Type(() => CameraStatement)
    camera?: CameraStatement;

    @Type(() => ObjectStatement)
    objects: Array<ObjectStatement> = [];
}

enum MessageType {
    Request = "request",
    Response = "response",
}

class WebSocketMessage {
    public type: MessageType = MessageType.Response;
    public payload?: string
}

class StatementsBuffer {
    constructor(public length: number = 0) { }
}

class SceneEventLoop {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private changes: Queue<SceneStatement> = new Queue();
    private timeStep: number = 0;
    private stepDuration = 1000 / 30;

    // FIXME(erondondron): удолить после доработок
    private cube: THREE.Mesh;

    constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ canvas });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // TODO(erondondron): Удалить после реализации getSceneParameters и addObject
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);
    }

    public run(): void {
        this.getSceneChanges();
        this.animate();
    }

    // TODO(erondondron): Получать начальные параметры сцены перед запуском отдельным rest запросом
    private getSceneParameters() { }

    private getSceneChanges() {
        const socket = new WebSocket('ws://localhost:8000/ws');

        socket.onmessage = (event: MessageEvent) => {
            const message = plainToClass(WebSocketMessage, JSON.parse(event.data));
            if (message.type == MessageType.Request) {
                const bufferInfo = new StatementsBuffer(this.changes.length());
                const message = new WebSocketMessage();
                message.payload = JSON.stringify(bufferInfo);
                socket.send(JSON.stringify(message));
                return;
            }
            if (message.payload) {
                const statement = plainToClass(SceneStatement, JSON.parse(message.payload));
                this.changes.enqueue(statement);
            } 
        };
    }

    // TODO(erondondron): Изучить разные возможности создания объектов
    private addObject(): void { }

    private getObject(objectUUID: string): THREE.Object3D | undefined {
        return this.scene.getObjectByProperty('uuid', objectUUID);
    }

    private animate = (): void => {
        const timePassed = Date.now() - this.timeStep;
        if (timePassed > this.stepDuration && !this.changes.isEmpty()) {
            const statement = this.changes.dequeue();
            this.cube.rotation.x = statement.objects[0].rotation.x;
            this.cube.rotation.y = statement.objects[0].rotation.y;
            this.timeStep = Date.now();
            this.renderer.render(this.scene, this.camera);
        }
        requestAnimationFrame(this.animate);
    }

    // TODO(erondondron): Позаботиться об очистке ресурсов
    // https://threejs.org/docs/index.html#manual/en/introduction/How-to-dispose-of-objects
    public cleanup(): void { }
}

export default SceneEventLoop;
