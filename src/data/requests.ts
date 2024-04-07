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
