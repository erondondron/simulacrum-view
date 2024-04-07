import * as THREE from 'three'
import { ObjectInfo, ObjectType } from '../../data/models';

export enum MouseButton {
    Left,
    Wheel,
    Right,
}

export class CanvasObject {
    uid: string
    instance: THREE.Object3D;
    bodyGeometry: THREE.BufferGeometry;
    bodyMaterial: THREE.MeshBasicMaterial;
    body: THREE.Mesh;
    edgesGeometry: THREE.EdgesGeometry;
    edgesMaterial: THREE.LineBasicMaterial;
    edges: THREE.LineSegments;

    constructor(info: ObjectInfo) {
        switch (info.type) {
            case ObjectType.Cube:
                this.bodyGeometry = new THREE.BoxGeometry(50, 50, 50);
                break;
            default:
                this.bodyGeometry = new THREE.SphereGeometry(25, 16, 16);
                break;
        }
        this.edgesGeometry = new THREE.EdgesGeometry(this.bodyGeometry);

        this.bodyMaterial = new THREE.MeshBasicMaterial({ color: 'white' });
        this.body = new THREE.Mesh(this.bodyGeometry, this.bodyMaterial);

        this.edgesMaterial = new THREE.LineBasicMaterial({ color: 'black' });
        this.edges = new THREE.LineSegments(this.edgesGeometry, this.edgesMaterial);

        this.instance = new THREE.Group();
        this.instance.add(this.body);
        this.instance.add(this.edges);

        this.uid = info.uid ? info.uid : this.instance.uuid

        this.setObjectPosition(info);
    }

    public setObjectPosition(info: ObjectInfo) {
        this.instance.position.x = info.position.x;
        this.instance.position.y = info.position.y;
        this.instance.position.z = info.position.z;
        this.instance.rotation.x = info.rotation.x;
        this.instance.rotation.y = info.rotation.y;
        this.instance.rotation.z = info.rotation.z;
    }

    public asSimulacrumObject(): ObjectInfo {
        const state = new ObjectInfo();
        state.id = this.instance.id;
        const isCube = this.bodyGeometry instanceof THREE.BoxGeometry;
        state.type = isCube ? ObjectType.Cube : ObjectType.Sphere;
        state.position.x = this.instance.position.x;
        state.position.y = this.instance.position.y;
        state.position.z = this.instance.position.z;
        state.rotation.x = this.instance.rotation.x;
        state.rotation.y = this.instance.rotation.y;
        state.rotation.z = this.instance.rotation.z;
        return state;
    }
}
