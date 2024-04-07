import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ControlPanel, MainWindow, PageHeader } from './main-window'
import { REST_URL } from '../urls'
import { plainToClass } from 'class-transformer'
import { Project } from '../models'
import { SimulacrumWindow } from './simulacrum-window'


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

    const fetchProject = async () => {
        fetch(`${REST_URL}/projects/${uuid}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Не удалось получить проект")
                }
                return response.json() as Promise<Record<string, unknown>>
            })
            .then(json => {
                const project = plainToClass(Project, json)
                setProject(project)
            })
    }

    useEffect(() => { if (!project) fetchProject() })

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
