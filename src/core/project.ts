import {plainToClass, Type} from "class-transformer"
import {REST_URL} from "../env.ts"
import {makeAutoObservable, runInAction} from "mobx"
import {SimulacrumObject} from "./simulacrum-object.ts";

type ResponsePayload = Record<string, unknown>

/*class WebSocketMessage {
    type: WSMessageType = WSMessageType.Response
    payload?: string
}

enum WSMessageType {
    Request = "request",
    Response = "response",
}*/

export class Project {
    uid: string = ""
    name: string = ""
    objects: {[uid: string]: SimulacrumObject} = {}

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

/*    public runCalculations(): void {
        const socket = new WebSocket(`${WS_URL}/project/${this.project.uid}/changes`)
        socket.onmessage = (event: MessageEvent) => {
            const message = plainToClass(WebSocketMessage, JSON.parse(event.data))
            if (message.type == WSMessageType.Request) {
                const message = new WebSocketMessage()
                message.payload = JSON.stringify({ length: this.eventLoop.length() })
                socket.send(JSON.stringify(message))
                return
            }
            if (message.payload) {
                const state = plainToClass(SimulacrumState, JSON.parse(message.payload))
                this.eventLoop.enqueue(state)
            }
        }
    }*/
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

    @Type(() => Vector)
    position: Vector = new Vector()

    @Type(() => Vector)
    rotation: Vector = new Vector()
}

export enum ObjectType {
    Sphere = "sphere",
    Cube = "cube",
}

export class Vector {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
    ) {
    }
}
