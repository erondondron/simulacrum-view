import * as THREE from 'three'
import {ObjectInfo, ObjectType} from "./project.ts";
import {makeAutoObservable} from "mobx";

export enum MouseButton {
    Left,
    Wheel,
    Right,
}

type DefinedVector = {x: number, y: number, z: number}
type UndefinedVector = {x?: number, y?: number, z?: number}

class Vector {
    protected _x: number = 0
    protected _y: number = 0
    protected _z: number = 0
    protected _bound: DefinedVector | null = null

    constructor(values?: UndefinedVector) {
        if (values) Object.assign(this, values)
        makeAutoObservable(this)
    }

    bind(object: DefinedVector) {this._bound = object}
    get values(): DefinedVector {return {x: this.x, y: this.y, z: this.z}}
    set values(values: UndefinedVector) {
        if (values.x !== undefined) this.x = values.x
        if (values.y !== undefined) this.y = values.y
        if (values.z !== undefined) this.z = values.z
    }

    get x(): number {return this._x}
    set x(value: number) {
        this._x = value
        if (this._bound) this._bound.x = value
    }
    get y(): number {return this._y}
    set y(value: number) {
        this._y = value
        if (this._bound) this._bound.y = value
    }
    get z(): number {return this._z}
    set z(value: number) {
        this._z = value
        if (this._bound) this._bound.z = value
    }
}

class ObjectView{
    instance: THREE.Object3D
    bodyGeometry: THREE.BufferGeometry
    bodyMaterial: THREE.MeshBasicMaterial
    body: THREE.Mesh
    edgesGeometry: THREE.EdgesGeometry
    edgesMaterial: THREE.LineBasicMaterial
    edges: THREE.LineSegments

    constructor(info: ObjectInfo) {
        switch (info.type) {
            case ObjectType.Cube:
                this.bodyGeometry = new THREE.BoxGeometry(50, 50, 50)
                break
            default:
                this.bodyGeometry = new THREE.SphereGeometry(25, 16, 16)
                break
        }
        this.edgesGeometry = new THREE.EdgesGeometry(this.bodyGeometry)

        this.bodyMaterial = new THREE.MeshBasicMaterial({ color: 'white' })
        this.body = new THREE.Mesh(this.bodyGeometry, this.bodyMaterial)

        this.edgesMaterial = new THREE.LineBasicMaterial({ color: 'black' })
        this.edges = new THREE.LineSegments(this.edgesGeometry, this.edgesMaterial)

        this.instance = new THREE.Group()
        this.instance.add(this.body)
        this.instance.add(this.edges)
    }

    public hover() { this.bodyMaterial.color.set('#c8a2c8') }
    public select() { this.bodyMaterial.color.set('#7851a9') }
    public release() { this.bodyMaterial.color.set("white") }
}

export class SimulacrumObject {
    uid: string
    type: ObjectType
    view!: ObjectView
    position: Vector = new Vector()
    rotation: Vector = new Vector()

    constructor(info: ObjectInfo) {
        this.view = new ObjectView(info)
        this.type = info.type
        this.position.bind(this.view.instance.position)
        this.rotation.bind(this.view.instance.rotation)
        this.uid = info.uid || this.view.instance.uuid
        this.setObjectPosition(info)
        makeAutoObservable(this)
    }

    public setObjectPosition(info: ObjectInfo) {
        Object.assign(this.position, info.position)
        Object.assign(this.rotation, info.rotation)
    }

    public getInfo(): ObjectInfo {
        const state = new ObjectInfo()
        state.uid = this.uid
        state.type = this.type
        Object.assign(state.position, this.position.values)
        Object.assign(state.rotation, this.rotation.values)
        return state
    }
}
