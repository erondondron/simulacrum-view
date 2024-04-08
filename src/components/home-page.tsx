import { useNavigate } from "react-router-dom"
import { ControlPanel, PageHeader, MainWindow } from "./main-window"
import { Project } from "../data/models"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { createNewProject, fetchProjects } from "../data/requests"

enum HomePageButton {
    NewProject,
    Settings,
    Information,
}

function HomePageControlPanel({ handlers = {} }: {
    handlers?: Partial<Record<HomePageButton, () => void>>
}) {
    const defaultHandler = () => { }

    return (
        <ControlPanel
            buttons={[
                <button
                    key={HomePageButton.NewProject}
                    onClick={handlers[HomePageButton.NewProject] || defaultHandler}>
                    <img src="/assets/images/icons/plus-white.png" alt="Новый проект" />
                </button>,

                <button
                    key={HomePageButton.Settings}
                    onClick={handlers[HomePageButton.Settings] || defaultHandler}>
                    <img src="/assets/images/icons/gear-white.png" alt="Настройки" />
                </button>,

                <button
                    key={HomePageButton.Information}
                    onClick={handlers[HomePageButton.Information] || defaultHandler}>
                    <img src="/assets/images/icons/info-white.png" alt="Информация" />
                </button>,
            ]}
        />
    )
}

type ProjectNavigationRef = {
    createProject: () => void,
    updateProjectsList: () => void,
}

const ProjectsNavigation = forwardRef<ProjectNavigationRef, unknown>((_, ref) => {
    const navigate = useNavigate()
    const [projects, setProjects] = useState<Project[]>([])

    async function updateProjectsList() {
        const projectsUpdate = await fetchProjects()
        setProjects(projectsUpdate)
    }

    useEffect(() => { updateProjectsList() }, [navigate])
    useImperativeHandle(ref, () => {
        async function createProject() {
            const project = await createNewProject()
            navigate(`/projects/${project.uid}/edit`, { state: project })
        }
        return {
            createProject,
            updateProjectsList,
        };
    }, [navigate]);

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
})

export function HomePage() {
    const projectNavigation = useRef<ProjectNavigationRef>(null)

    const controlPanelHandlers = {
        [HomePageButton.NewProject]: () => { projectNavigation.current?.createProject() }
    }

    return (
        <MainWindow
            header={
                <PageHeader
                    title={ <h1>Simulacrum</h1> }
                    controls={ <HomePageControlPanel handlers={controlPanelHandlers} /> }
                />
            }
            body={<ProjectsNavigation ref={projectNavigation} />}
        />
    )
}
