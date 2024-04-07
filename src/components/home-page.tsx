import { useNavigate } from "react-router-dom"
import { ControlPanel, PageHeader, MainWindow } from "./main-window"
import { REST_URL } from "../urls"
import { plainToClass } from "class-transformer"
import { Project } from "../models"
import { useEffect, useState } from "react"

function HomePageControlPanel() {
    const navigate = useNavigate()

    const createNewProject = async () => {
        fetch(`${REST_URL}/projects`, { method: "POST" })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Не удалось создать проект")
                }
                return response.json()
            })
            .then(json => {
                const project = plainToClass(Project, json)
                navigate(`/${project.uid}/edit`, { state: project })
            })
    }

    return (
        <ControlPanel
            buttons={[
                <button key="newProjectButton" onClick={createNewProject}>
                    <img src="assets/images/icons/plus-white.png" alt="Новый проект" />
                </button>,
                <button key="settingsButton">
                    <img src="assets/images/icons/gear-white.png" alt="Новый проект" />
                </button>,
                <button key="infoButton">
                    <img src="assets/images/icons/info-white.png" alt="Новый проект" />
                </button>,
            ]}
        />
    )
}

function ProjectsNavigation() {
    const navigate = useNavigate()
    const [projects, setProjects] = useState<Project[]>([])

    const fetchProjects = async () => {
        fetch(`${REST_URL}/projects`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Не удалось получить список проектов")
                }
                return response.json() as Promise<Record<string, unknown>[]>
            })
            .then(json => {
                const projects = json.map(item => plainToClass(Project, item))
                setProjects(projects)
            })
    }

    useEffect(() => { fetchProjects() })

    return (
        <div>
            <h2>Доступные проекты:</h2>
            <ul>
                {projects.map(project => (
                    <li key={project.uid} onClick={() => navigate(`/${project.uid}`, { state: project })}>
                        {project.name}
                    </li>
                ))}
            </ul>
        </div>
    )
}


export function HomePage() {
    return (
        <MainWindow
            header={
                <PageHeader
                    title={<h1>Simulacrum</h1>}
                    controls={<HomePageControlPanel />}
                />
            }
            body={<ProjectsNavigation />}
        />
    )
}
