import { useNavigate } from "react-router-dom"
import { ControlPanel, PageHeader, MainWindow } from "./main-window"
import { Project } from "../data/models"
import { useEffect, useState } from "react"
import { createNewProject, fetchProjects } from "../data/requests"

function HomePageControlPanel() {
    const navigate = useNavigate()

    const onProjectCreate = async () => {
        const project = await createNewProject()
        navigate(`/projects/${project.uid}/edit`, { state: project })
    }

    return (
        <ControlPanel
            buttons={[
                <button key="newProjectButton" onClick={onProjectCreate}>
                    <img src="/assets/images/icons/plus-white.png" alt="Новый проект" />
                </button>,
                <button key="settingsButton">
                    <img src="/assets/images/icons/gear-white.png" alt="Новый проект" />
                </button>,
                <button key="infoButton">
                    <img src="/assets/images/icons/info-white.png" alt="Новый проект" />
                </button>,
            ]}
        />
    )
}

function ProjectsNavigation() {
    const navigate = useNavigate()
    const [projects, setProjects] = useState<Project[]>([])

    const onProjectsUpdate = async () => {
        const newProjects = await fetchProjects()
        setProjects(newProjects)
    }

    useEffect(() => { onProjectsUpdate() })

    return (
        <div>
            <h2>Доступные проекты:</h2>
            <ul>
                {projects.map(project => (
                    <li key={project.uid} onClick={() => navigate(`/projects/${project.uid}`, { state: project })}>
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
