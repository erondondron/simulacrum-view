import * as THREE from 'three'
import {ObjectInfo, ObjectType} from "./project.ts";
import {makeAutoObservable} from "mobx";

export enum MouseButton {
    Left,
    Wheel,
    Right,
}

type DefinedVector<T> = {x: T, y: T, z: T}
type UndefinedVector<T> = {x?: T, y?: T, z?: T}

class Vector<T> {
    protected _x!: T
    protected _y!: T
    protected _z!: T
    protected _bound: DefinedVector<T> | null = null

    constructor(values: DefinedVector<T>) {
        Object.assign(this, values)
        makeAutoObservable(this)
    }

    bind(object: DefinedVector<T>) {this._bound = object}
    get values(): DefinedVector<T> {return {x: this.x, y: this.y, z: this.z}}
    set values(values: UndefinedVector<T>) {
        if (values.x !== undefined) this.x = values.x
        if (values.y !== undefined) this.y = values.y
        if (values.z !== undefined) this.z = values.z
    }

    get x(): T {return this._x}
    set x(value: T) {
        this._x = value
        if (this._bound) this._bound.x = value
    }
    get y(): T {return this._y}
    set y(value: T) {
        this._y = value
        if (this._bound) this._bound.y = value
    }
    get z(): T {return this._z}
    set z(value: T) {
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
    position: Vector<number> = new Vector<number>({x: 0, y: 0, z: 0})
    rotation: Vector<number> = new Vector<number>({x: 0, y: 0, z: 0})
    motionEquation: Vector<string> = new Vector<string>({x: "", y: "", z: ""})

    constructor(info: ObjectInfo) {
        this.view = new ObjectView(info)
        this.type = info.type
        this.position.bind(this.view.instance.position)
        this.rotation.bind(this.view.instance.rotation)
        this.motionEquation = new Vector<string>(info.motionEquation)
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
        Object.assign(state.motionEquation, this.motionEquation.values)
        return state
    }
}
