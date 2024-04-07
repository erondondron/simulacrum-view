import { plainToClass } from "class-transformer"
import { Project } from "./models"

const REST_URL = 'http://localhost:8000/api'
const WS_URL = 'ws://localhost:8000/api'

export async function fetchProjects(): Promise<Array<Project>> {
    return (
        fetch(`${REST_URL}/projects`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Не удалось получить список проектов")
                }
                return response.json() as Promise<Record<string, unknown>[]>
            })
            .then(json => {
                return json.map(item => plainToClass(Project, item))
            })
    )
}

export async function createNewProject(): Promise<Project> {
    return (
        fetch(`${REST_URL}/projects`, { method: "POST" })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Не удалось создать проект")
                }
                return response.json()
            })
            .then(json => {
                return plainToClass(Project, json)
            })
    )
}

export async function fetchProject(uuid: string): Promise<Project> {
    return (
        fetch(`${REST_URL}/projects/${uuid}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Не удалось получить проект")
                }
                return response.json() as Promise<Record<string, unknown>>
            })
            .then(json => {
                return plainToClass(Project, json)
            })
    )
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
    }

    protected fetchProjectInitState(): void {
        fetch(`${REST_URL}/projects/${this.project.uid}/objects`)
            .then(response => response.json())
            .then(stateJson => {
                const state = plainToClass(SimulacrumState, stateJson)
                for (const objInfo of state.objects) {
                    const object = new CanvasObject(objInfo)
                    this.scene.add(object.instance)
                    this.objects[objInfo.id] = object
                }
                this.eventLoop.enqueue(state)
                this.applayStepChanges()
            })
    }*/
