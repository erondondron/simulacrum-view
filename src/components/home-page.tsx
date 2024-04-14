import { useNavigate } from "react-router-dom"
import { PageHeader, MainWindow, ControlPanelButton } from "./main-window.tsx"
import {useContext, useEffect} from "react"
import {observer} from "mobx-react-lite"
import {ProjectStoreContext} from "../core/project-store.ts"

enum HomePageButton {
    NewProject = "new-project",
    Settings = "settings",
    Information = "information",
}

const ProjectsNavigation = observer(() => {
    const projectStore = useContext(ProjectStoreContext)
    const navigate = useNavigate()

    function selectProject(uid: string) {
        projectStore.selected.info = projectStore.publicProjects[uid]
        navigate(`/projects/${uid}`)
    }

    useEffect(() => {void projectStore.fetchProjects()}, [projectStore])

    return (
        <div className="projectsNavigation">
            <h2>Доступные проекты:</h2>
            <ul>
                {Object.values(projectStore.publicProjects).map(project => (
                    <li key={project.uid}
                        onClick={() => selectProject(project.uid)}>
                        {project.name}
                    </li>
                ))}
            </ul>
        </div>
    )
})

export function HomePage() {
    const projectStore = useContext(ProjectStoreContext)
    const navigate = useNavigate()

    async function createNewProject() {
        const project = await projectStore.createProject()
        projectStore.selected.info = project
        navigate(`/projects/${project.uid}/edit`)
    }

    return (
        <MainWindow
            header={
                <PageHeader title={"Simulacrum"}>
                    <ControlPanelButton
                        type={HomePageButton.NewProject}
                        onClick={createNewProject}/>
                    <ControlPanelButton
                        type={HomePageButton.Settings}/>
                    <ControlPanelButton
                        type={HomePageButton.Information}/>
                </PageHeader>
            }
            body={<ProjectsNavigation />}
        />
    )
}
