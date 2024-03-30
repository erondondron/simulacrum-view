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
    id!: number;

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
    private objects: Record<number, THREE.Mesh> = {};

    private timeStep: number = 0;
    private stepDuration = 1000 / 30;

    constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ canvas });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    public async run(): Promise<void> {
        await this.getSceneParameters();
        this.getSceneChanges();
        this.animate();
    }

    private async getSceneParameters(): Promise<void> {
        const response = await fetch('http://localhost:8000/scene_params');
        const sceneJson = await response.json();
        const scene = plainToClass(SceneStatement, sceneJson);
        for (const objInfo of scene.objects) {
            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const obj = new THREE.Mesh(geometry, material);
            this.objects[objInfo.id] = obj;
            this.scene.add(obj)
        }
        this.renderer.render(this.scene, this.camera);
    }

    private getSceneChanges() {
        const socket = new WebSocket('ws://localhost:8000/scene_changes');

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

    private applyChanges(statement: SceneStatement): void {
        for (const objInfo of statement.objects) {
            const obj = this.objects[objInfo.id];
            if (!obj) continue;

            obj.position.x = objInfo.coordinates.x;
            obj.position.y = objInfo.coordinates.y;
            obj.position.z = objInfo.coordinates.z;

            obj.rotation.x = objInfo.rotation.x;
            obj.rotation.y = objInfo.rotation.y;
            obj.rotation.z = objInfo.rotation.z;
        }
    }

    private animate = (): void => {
        const timePassed = Date.now() - this.timeStep;
        if (timePassed > this.stepDuration && !this.changes.isEmpty()) {
            const statement = this.changes.dequeue();
            this.applyChanges(statement);
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
