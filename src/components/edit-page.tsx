import { useNavigate, useParams} from "react-router-dom"
import { useContext, useEffect } from "react"
import { CatalogPanel } from "./catalog-panel"
import {ObjectPanel} from "./object-panel.tsx";
import { ProjectInfo } from "../core/project.ts";
import {ProjectContext, ProjectStoreContext} from "../core/project-store.ts";
import {ControlPanelButton, MainWindow, PageHeader} from "./main-window.tsx";
import {SimulacrumWindow} from "./simulacrum-window.tsx";
import {observer} from "mobx-react-lite";

enum EditPageButton {
    Save = "save",
    Cancel = "cancel",
    Delete = "delete",
}

export const EditPage = observer(() => {
    const { uuid } = useParams()
    const navigate = useNavigate()
    const projectStore = useContext(ProjectStoreContext)
    const project = useContext(ProjectContext)

    async function saveProject(){
        await project.saveObjects()
        await projectStore.saveProject(project.info)
        navigate(`/projects/${project.uid}`)
    }

    async function cancelChanges(){
        projectStore.selected.info = new ProjectInfo()
        navigate(`/projects/${uuid}`)
    }

    async function deleteProject(){
        void projectStore.deleteProject(project.uid)
        projectStore.selected.info = new ProjectInfo()
        navigate(`/`)
    }

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
                        type={EditPageButton.Save}
                        onClick={saveProject}/>
                    <ControlPanelButton
                        type={EditPageButton.Cancel}
                        onClick={cancelChanges}/>
                    <ControlPanelButton
                        type={EditPageButton.Delete}
                        onClick={deleteProject}/>
                </PageHeader>
            }
            body={
                <ProjectContext.Provider value={project}>
                    <div className="editPage">
                        <CatalogPanel/>
                        <SimulacrumWindow editable={true}/>
                        <ObjectPanel/>
                    </div>
                </ProjectContext.Provider>
            }
        />
    )
})
