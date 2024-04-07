import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ControlPanel, MainWindow, PageHeader } from './main-window'
import { Project } from '../data/models'
import { SimulacrumWindow } from './simulacrum-window'
import { fetchProject } from '../data/requests'


function ViewPageControlPanel({ project }: { project: Project | null }) {
    const navigate = useNavigate()

    return (
        <ControlPanel
            buttons={[
                <button key="runButton">
                    <img src="/assets/images/icons/play-white.png" alt="Запустить проект" />
                </button>,
                <button key="editButton" onClick={() => { if (project) navigate(`/${project.uid}/edit`, { state: project }) }}>
                    <img src="/assets/images/icons/pencil-white.png" alt="Редактировать проект" />
                </button>,
            ]}
        />
    )
}

export function VeiwPage() {
    const { uuid } = useParams()
    const [project, setProject] = useState<Project | null>(useLocation().state)

    const onProjectUpdate = async () => {
        if (project || !uuid) return
        const projectUpdate = await fetchProject(uuid)
        setProject(projectUpdate)
    }

    useEffect(() => { onProjectUpdate() })

    return (
        <MainWindow
            header={
                <PageHeader
                    title={<h1>{project?.name}</h1>}
                    controls={<ViewPageControlPanel project={project} />}
                />
            }
            body={<SimulacrumWindow project={ project } />}
        />
    )
}
