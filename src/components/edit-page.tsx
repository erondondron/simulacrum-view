import { useLocation, useParams } from "react-router-dom"
import { Project } from "../data/models"
import { ControlPanel, MainWindow, PageHeader } from "./main-window"
import { useEffect, useState } from "react"
import { fetchProject } from "../data/requests"
import { SimulacrumWindow } from "./simulacrum/window"

enum EditPageButton {
    Run,
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
                <button key={EditPageButton.Run}
                    onClick={handlers[EditPageButton.Run] || defaultHandler}>
                    <img src="/assets/images/icons/play-white.png" alt="��������� ������" />
                </button>,
                <button key={EditPageButton.Save}
                    onClick={handlers[EditPageButton.Save] || defaultHandler}>
                    <img src="/assets/images/icons/floppy-white.png" alt="��������� ������" />
                </button>,
                <button key={EditPageButton.Cancel}
                    onClick={handlers[EditPageButton.Cancel] || defaultHandler}>
                    <img src="/assets/images/icons/cross-white.png" alt="�������� ���������" />
                </button>,
                <button key={EditPageButton.Delete}
                    onClick={handlers[EditPageButton.Delete] || defaultHandler}>
                    <img src="/assets/images/icons/trash-white.png" alt="������� ������" />
                </button>,
            ]}
        />
    )
}

export function EditPage() {
    const { uuid } = useParams()
    const [project, setProject] = useState<Project | null>(useLocation().state)

    const loadProject = async () => {
        if (project || !uuid) return
        const projectUpdate = await fetchProject(uuid)
        setProject(projectUpdate)
    }

    useEffect(() => { loadProject() })

    return (
        <MainWindow
            header={
                <PageHeader
                    title={<h1>{project?.name}</h1>}
                    controls={<EditPageControlPanel />}
                />
            }
            body={<SimulacrumWindow project={project} />}
        />
    )
}