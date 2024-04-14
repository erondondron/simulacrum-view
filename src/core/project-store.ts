import {plainToClass} from "class-transformer"
import {REST_URL} from "../env.ts"
import {makeAutoObservable, runInAction} from "mobx"
import {Project, ProjectInfo} from "./project.ts"
import {createContext} from "react"

type ResponsePayload = Record<string, unknown>

export class ProjectStore {
    publicProjects: { [uuid: string]: ProjectInfo } = {}
    selected: Project = new Project()

    constructor() { makeAutoObservable(this) }

    async fetchProjects(): Promise<{ [uuid: string]: ProjectInfo }> {
        const response = await fetch(`${REST_URL}/projects`)
        const json: ResponsePayload[] = await response.json()
        const projects = json.map(item => plainToClass(ProjectInfo, item))
        const publicProjects = Object.fromEntries(projects.map(p => [p.uid, p]))
        runInAction(() => { this.publicProjects = publicProjects })
        return this.publicProjects
    }

    async createProject(): Promise<ProjectInfo> {
        const response = await fetch(`${REST_URL}/projects`, {method: "POST"})
        const json: ResponsePayload = await response.json()
        const project = plainToClass(ProjectInfo, json)
        runInAction(() => {this.publicProjects[project.uid] = project})
        return project
    }

    async fetchProject(uid: string): Promise<ProjectInfo> {
        const response = await fetch(`${REST_URL}/projects/${uid}`)
        const json: ResponsePayload = await response.json()
        const project = plainToClass(ProjectInfo, json)
        runInAction(() => {this.publicProjects[project.uid] = project})
        return project
    }

    async saveProject(project: ProjectInfo): Promise<ProjectInfo> {
        const response = await fetch(`${REST_URL}/projects/${project.uid}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(project),
        })
        const json: ResponsePayload = await response.json()
        project = plainToClass(ProjectInfo, json)
        runInAction(() => {this.publicProjects[project.uid] = project})
        return project
    }

    async deleteProject(uid: string): Promise<void> {
        await fetch(`${REST_URL}/projects/${uid}`, { method: 'DELETE' })
        runInAction(() => {delete this.publicProjects[uid]})
    }
}

const projectStore = new ProjectStore()
export const ProjectStoreContext = createContext<ProjectStore>(projectStore)
export const ProjectContext = createContext<Project>(projectStore.selected)
