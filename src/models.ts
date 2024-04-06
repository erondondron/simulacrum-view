import { Type } from "class-transformer"

export class WebSocketMessage {
    type: WSMessageType = WSMessageType.Response
    payload?: string
}

export enum WSMessageType {
    Request = "request",
    Response = "response",
}

export class Project {
    uid!: string
    name!: string
}

export class SimulacrumState {
    @Type(() => SimulacrumObject)
    objects: Array<SimulacrumObject> = []
}

export class SimulacrumObject {
    id!: number
    type!: SimulacrumObjectType

    @Type(() => Vector)
    position: Vector = new Vector()

    @Type(() => Vector)
    rotation: Vector = new Vector()
}

export enum SimulacrumObjectType {
    Sphere = "sphere",
    Cube = "cube",
}

export class Vector {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
    ) { }
}
