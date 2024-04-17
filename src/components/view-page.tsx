import {useContext, useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {SimulacrumWindow} from "./simulacrum-window.tsx";
import {ProjectContext, ProjectStoreContext} from "../core/project-store.ts";
import {ControlPanelButton, MainWindow, PageHeader} from "./main-window.tsx";
import {observer} from "mobx-react-lite";

enum ViewPageButton {
    Run = "run",
    Stop = "stop",
    Edit = "edit",
}

export const ViewPage = observer(() => {
    const { uuid } = useParams()
    const navigate = useNavigate()
    const projectStore = useContext(ProjectStoreContext)
    const project = useContext(ProjectContext)
    const [calculation, setCalculation] = useState<WebSocket | null>(null)

    function editProject(){ navigate(`/projects/${project.uid}/edit`) }

    function runCalculation(){setCalculation(project.run())}

    function stopCalculation(){
        if (calculation) calculation.close()
        project.eventLoop.clear()
        setCalculation(null)
    }

    useEffect(() => {
        async function loadProject(){
            if (!uuid) return
            if (project.uid != uuid)
                project.info = await projectStore.fetchProject(uuid)
        }
        void loadProject()
        return () => {if (calculation) calculation.close()}
    }, [uuid, projectStore, project, calculation])

    return (
        <MainWindow
            header={
                <PageHeader title={project.name}>
                    {!calculation && <ControlPanelButton
                        type={ViewPageButton.Run}
                        onClick={runCalculation}/>}
                    {calculation && <ControlPanelButton
                        type={ViewPageButton.Stop}
                        onClick={stopCalculation}/>}
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
