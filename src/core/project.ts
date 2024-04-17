import {plainToClass, Type} from "class-transformer"
import {REST_URL, WS_URL} from "../env.ts"
import {makeAutoObservable, runInAction} from "mobx"
import {SimulacrumObject} from "./simulacrum-object.ts";
import {Queue} from "./queue.ts";

type ResponsePayload = Record<string, unknown>

class WebSocketMessage {
    type: WSMessageType = WSMessageType.Response
    payload?: string
}

enum WSMessageType {
    Request = "request",
    Response = "response",
}

export class Project {
    uid: string = ""
    name: string = ""
    objects: {[uid: string]: SimulacrumObject} = {}
    eventLoop: Queue<SimulacrumState> = new Queue()

    get info(): ProjectInfo{
        const data = {uid: this.uid, name: this.name}
        return plainToClass(ProjectInfo, data)
    }
    set info(value: ProjectInfo){
        this.uid = value.uid
        this.name = value.name
    }

    constructor() { makeAutoObservable(this) }

    async fetchObjects(): Promise<void> {
        const response = await fetch(`${REST_URL}/projects/${this.uid}/objects`)
        if (!response.ok) return
        const json: ResponsePayload = await response.json()
        runInAction(() => {
            const state = plainToClass(SimulacrumState, json)
            this.objects = Object.fromEntries(state.objects.map(
                info => [info.uid, new SimulacrumObject(info)]
            ))
        })
    }

    async saveObjects(): Promise<void> {
        const objects = Object.values(this.objects).map(o => o.getInfo())
        const state = plainToClass(SimulacrumState, {objects: objects})
        await fetch(`${REST_URL}/projects/${this.uid}/objects`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state),
        })
    }

    public run(): WebSocket {
        const socket = new WebSocket(`${WS_URL}/projects/${this.uid}/run`)
        socket.onmessage = (event: MessageEvent) => {
            const json: ResponsePayload = JSON.parse(event.data)
            const message = plainToClass(WebSocketMessage, json)
            if (message.type == WSMessageType.Request) {
                const message = new WebSocketMessage()
                const payload = { length: this.eventLoop.length() }
                message.payload = JSON.stringify(payload)
                socket.send(JSON.stringify(message))
                return
            }
            if (message.payload) {
                const json: ResponsePayload = JSON.parse(message.payload)
                const state = plainToClass(SimulacrumState, json)
                this.eventLoop.enqueue(state)
            }
        }
        return socket
    }
}

export class ProjectInfo {
    uid!: string
    name!: string
}

export class SimulacrumState {
    @Type(() => ObjectInfo)
    objects: Array<ObjectInfo> = []
}

export class ObjectInfo {
    uid?: string
    type!: ObjectType

    @Type(() => NumericVector)
    position: NumericVector = new NumericVector()

    @Type(() => NumericVector)
    rotation: NumericVector = new NumericVector()

    @Type(() => StringVector)
    motionEquation: StringVector = new StringVector()
}

export enum ObjectType {
    Sphere = "sphere",
    Cube = "cube",
}

export class NumericVector {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
    ) {
    }
}

export class StringVector {
    constructor(
        public x: string = "",
        public y: string = "",
        public z: string = "",
    ) {
    }
}
