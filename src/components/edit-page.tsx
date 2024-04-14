import {useLocation, useNavigate, useParams} from "react-router-dom"
import { ObjectType, Project } from "../data/models"
import { ControlPanel, MainWindow, PageHeader } from "./main-window"
import { useEffect, useRef, useState } from "react"
import {
    deleteProject,
    getProject,
    saveProject,
    saveProjectObjects
} from "../data/requests"
import { SimulacrumWindow, SimulacrumWindowRef } from "../simulacrum/window"
import { CatalogPanel } from "./catalog-panel"
import {ObjectPanel} from "./object-panel.tsx";

enum EditPageButton {
    Save,
    Cancel,
    Delete,
}

function EditPageControlPanel({ handlers = {} }: {
    handlers?: Partial<Record<EditPageButton, () => void>>
}) {
    const defaultHandler = () => { }

    return (
        <ControlPanel
            buttons={[
                <button key={EditPageButton.Save}
                    onClick={handlers[EditPageButton.Save] || defaultHandler}>
                    <img src="/assets/images/icons/floppy-white.png" alt="Сохранить проект" />
                </button>,
                <button key={EditPageButton.Cancel}
                    onClick={handlers[EditPageButton.Cancel] || defaultHandler}>
                    <img src="/assets/images/icons/cross-white.png" alt="Отменить изменения" />
                </button>,
                <button key={EditPageButton.Delete}
                    onClick={handlers[EditPageButton.Delete] || defaultHandler}>
                    <img src="/assets/images/icons/trash-white.png" alt="Удалить проект" />
                </button>,
            ]}
        />
    )
}

export function EditPage() {
    const navigate = useNavigate()
    const { uuid } = useParams()
    const [project, setProject] = useState<Project | null>(useLocation().state)
    const simulacrumRef = useRef<SimulacrumWindowRef>(null)

    const loadProject = async (): Promise<void> => {
        if (project || !uuid) return
        const projectUpdate = await getProject(uuid)
        setProject(projectUpdate)
    }

    const onProjectSaveHandler = async (): Promise<void> => {
        if (!project || !simulacrumRef.current) return
        void saveProject(project)
        const objects = await simulacrumRef.current.getObjects()
        void saveProjectObjects(project.uid, objects)
        navigate(`/projects/${project.uid}`)
    }

    const onChangesCancelHandler = async (): Promise<void> => {
        if (!project) return
        navigate(`/projects/${project.uid}`)
    }

    const onProjectDeleteHandler = async (): Promise<void> => {
        if (!project) return
        void deleteProject(project.uid)
        navigate("/")
    }

    useEffect(() => { void loadProject() })

    const controlPanel = <EditPageControlPanel
        handlers={{
            [EditPageButton.Save]: onProjectSaveHandler,
            [EditPageButton.Delete]: onProjectDeleteHandler,
            [EditPageButton.Cancel]: onChangesCancelHandler,
    }}/>

    return (
        <MainWindow
            header={
                <PageHeader
                    title={project?.name || "Project"}
                    controls={controlPanel}/>
            }
            body={
                <div className="editPage">
                    <CatalogPanel onObjectCreateHandler={
                        (type: ObjectType) => {
                            if (simulacrumRef.current)
                                simulacrumRef.current.createObject(type)
                        }
                    } />
                    <SimulacrumWindow ref={simulacrumRef} project={project} />
                    <ObjectPanel project={project}/>
                </div>
            }
        />
    )
}
