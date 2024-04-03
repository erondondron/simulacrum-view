import * as THREE from 'three'
import Queue from '../queue'
import { SCENE_CHANGES_WS, SCENE_PARAMS_URL } from '../urls'
import { Type, plainToClass } from 'class-transformer'
import GraphicsWindow from './graphics'

enum MessageType {
    Request = "request",
    Response = "response",
}

class WebSocketMessage {
    public type: MessageType = MessageType.Response
    public payload?: string
}

class Vector3 {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
    ) { }
}

class ObjectStatement {
    id!: number

    @Type(() => Vector3)
    coordinates!: Vector3

    @Type(() => Vector3)
    rotation!: Vector3
}

class SceneStatement {
    @Type(() => ObjectStatement)
    objects: Array<ObjectStatement> = []
}

class BufferStatement {
    constructor(public length: number = 0) { }
}

class SimulacrumWindow extends GraphicsWindow {
    private eventLoop: Queue<SceneStatement> = new Queue()
    private objects: Record<number, THREE.Object3D> = {}

    protected addObject(objectInfo: ObjectStatement): void {

        let objectGeometry: THREE.BufferGeometry = new THREE.BoxGeometry(150, 150, 150)
        let edgeGeometry = new THREE.EdgesGeometry(objectGeometry);

        if (objectInfo.id % 2 === 1) {
            objectGeometry = new THREE.SphereGeometry(100, 32, 32)
            edgeGeometry = new THREE.EdgesGeometry(objectGeometry)
        }

        const objectMaterial = new THREE.MeshBasicMaterial({ color: 'white' })
        const object = new THREE.Mesh(objectGeometry, objectMaterial)

        const edgeMaterial = new THREE.LineBasicMaterial({ color: 'black', linewidth: 100 })
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)

        const group = new THREE.Group();
        group.add(object);
        group.add(edges);

        this.objects[objectInfo.id] = group;
        this.scene.add(group)
    }

    protected async sceneInit(): Promise<void> {
        this.scene.background = new THREE.Color(0xfbf0d1);
        const response = await fetch(SCENE_PARAMS_URL)
        const sceneJson = await response.json()
        const scene = plainToClass(SceneStatement, sceneJson)
        this.eventLoop.enqueue(scene)
        for (const objInfo of scene.objects)
            this.addObject(objInfo)
        this.applayStepChanges()
        this.renderer.render(this.scene, this.camera);
    }

    public runCalculations(): void {
        const socket = new WebSocket(SCENE_CHANGES_WS);

        socket.onmessage = (event: MessageEvent) => {
            const message = plainToClass(WebSocketMessage, JSON.parse(event.data));
            if (message.type == MessageType.Request) {
                const bufferInfo = new BufferStatement(this.eventLoop.length());
                const message = new WebSocketMessage();
                message.payload = JSON.stringify(bufferInfo);
                socket.send(JSON.stringify(message));
                return;
            }
            if (message.payload) {
                const statement = plainToClass(SceneStatement, JSON.parse(message.payload));
                this.eventLoop.enqueue(statement);
            }
        };
    }

    protected applayStepChanges(): void {
        if (this.eventLoop.isEmpty())
            return

        const statement = this.eventLoop.dequeue();
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
}

export default SimulacrumWindow;
