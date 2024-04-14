import {useContext, useEffect} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {SimulacrumWindow} from "./simulacrum-window.tsx";
import {ProjectContext, ProjectStoreContext} from "../core/project-store.ts";
import {ControlPanelButton, MainWindow, PageHeader} from "./main-window.tsx";
import {observer} from "mobx-react-lite";

enum ViewPageButton {
    Run = "run",
    Edit = "edit",
}

export const ViewPage = observer(() => {
    const { uuid } = useParams()
    const navigate = useNavigate()
    const projectStore = useContext(ProjectStoreContext)
    const project = useContext(ProjectContext)

    function editProject(){ navigate(`/projects/${project.uid}/edit`) }

    useEffect(() => {
        async function loadProject(){
            if (!uuid) return
            if (project.uid != uuid)
                project.info = await projectStore.fetchProject(uuid)
        }
        void loadProject()
    }, [uuid, projectStore, project])

    return (
        <MainWindow
            header={
                <PageHeader title={project.name}>
                    <ControlPanelButton
                        type={ViewPageButton.Run}/>
                    <ControlPanelButton
                        type={ViewPageButton.Edit}
                        onClick={editProject}/>
                </PageHeader>
            }
            body={
                <ProjectContext.Provider value={project}>
                    <SimulacrumWindow/>
                </ProjectContext.Provider>
            }
        />
    )
})
