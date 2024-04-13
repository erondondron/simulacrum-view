import { plainToClass } from "class-transformer"
import { Project, SimulacrumState } from "./models"

const REST_URL = 'http://localhost:8000/api'
const WS_URL = 'ws://localhost:8000/api'

export async function getProjects(): Promise<Array<Project>> {
    return (
        fetch(`${REST_URL}/projects`)
            .then(response => {
                if (!response.ok)
                    throw new Error("Не удалось получить список проектов")
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
                if (!response.ok)
                    throw new Error("Не удалось создать проект")
                return response.json()
            })
            .then(json => {
                return plainToClass(Project, json)
            })
    )
}

export async function getProject(uid: string): Promise<Project> {
    return (
        fetch(`${REST_URL}/projects/${uid}`)
            .then(response => {
                if (!response.ok)
                    throw new Error("Не удалось получить проект")
                return response.json() as Promise<Record<string, unknown>>
            })
            .then(json => {
                return plainToClass(Project, json)
            })
    )
}

export async function saveProject(project: Project): Promise<void> {
    return (
        fetch(`${REST_URL}/projects/${project.uid}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(project),
        })
        .then(response => {
            if (!response.ok)
                throw new Error("Не удалось сохранить проект")
            return
        })
    )
}

export async function deleteProject(project_uid: string): Promise<void> {
        return (
        fetch(`${REST_URL}/projects/${project_uid}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok)
                throw new Error("Не удалось удалить проект")
            return
        })
    )
}

export async function getProjectObjects(project_uid: string): Promise<SimulacrumState> {
    return (
        fetch(`${REST_URL}/projects/${project_uid}/objects`)
            .then(response => {
                if (!response.ok)
                    throw new Error("Не удалось получить список объектов для проекта")
                return response.json() as Promise<Record<string, unknown>>
            })
            .then(stateJson => {
                return plainToClass(SimulacrumState, stateJson)
            })
    )
}

export async function saveProjectObjects(project_uid: string, objects: SimulacrumState): Promise<void> {
    return (
        fetch(`${REST_URL}/projects/${project_uid}/objects`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(objects),
            })
            .then(response => {
                if (!response.ok)
                    throw new Error("Не удалось сохранить объекты")
                return
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
    }*/
