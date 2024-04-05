import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SimulacrumWindow, { SimulacrumObjectType } from './simulacrum'
import { Project } from '../models'
import { PROJECTS_URL } from '../urls'
import { plainToClass } from 'class-transformer'

export function SimulacrumEditPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const project: Project = location.state

    const simulacrumContainer = useRef<HTMLDivElement>(null)
    const [simulacrum, setSimulacrum] = useState<SimulacrumWindow | null>(null)

    const [projectName, setProjectName] = useState<string>(project.name)
    const [selectedModel, setSelectedModel] = useState<SimulacrumObjectType | null>(null)

    useEffect(() => {
        if (simulacrumContainer.current) {
            const newSimulacrum = new SimulacrumWindow(simulacrumContainer.current)
            newSimulacrum.setDragAndDropHook(setSelectedModel)
            setSimulacrum(newSimulacrum)
            newSimulacrum.animate()
            return () => { newSimulacrum.cleanup(); }
        }
    }, [])

    const editProjectName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(event.target.value)
        project.name = event.target.value
    }

    const selectModel = (object: SimulacrumObjectType) => {
        const toSelect = object === selectedModel ? null : object
        if (simulacrum)
            simulacrum.setDraggedObject(toSelect)
        setSelectedModel(toSelect);
    }

    const saveProject = () => {
        fetch(`${PROJECTS_URL}/${project.uid}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(project),
        })
        navigate(`/${project.uid}`, { state: project })
    }

    const cancelProjectChanges = async () => {
        try {
            const response = await fetch(`${PROJECTS_URL}/${project.uid}`);
            if (!response.ok) {
                throw new Error('Не удалось получить исходный проект');
            }
            const json = await response.json();
            const initProject = plainToClass(Project, json);
            navigate(`/${project.uid}`, { state: initProject })
        } catch (error) {
            console.error('При отмене изменений возникла ошибка: ', error);
        }
    }

    const deleteProject = async () => {
        try {
            fetch(`${PROJECTS_URL}/${project.uid}`, { method: 'DELETE' })
            navigate(`/`)
        } catch (error) {
            console.error('При удалении проекта возникла ошибка: ', error)
        }
    }

    return (
        <>
            <div className="controlPanel">
                <input
                    className="editableProjectName"
                    type="text"
                    value={projectName}
                    onChange={editProjectName}
                />
                <div className="controlButtons">
                    <button onClick={saveProject}>Save</button>
                    <button onClick={cancelProjectChanges}>Cancel</button>
                    <button onClick={deleteProject}>Delete</button>
                </div>
            </div>
            <div className="editWindow">
                <div className="modelsPanel">
                    <span>Доступные объекты</span>
                    <div className={selectedModel === SimulacrumObjectType.Cube ? "modelContainer clicked" : "modelContainer"}
                        onClick={() => selectModel(SimulacrumObjectType.Cube)}>
                        <img src="/assets/images/models/cube.png" alt="Куб"></img>
                    </div>
                    <div className={selectedModel === SimulacrumObjectType.Sphere ? "modelContainer clicked" : "modelContainer"}
                        onClick={() => selectModel(SimulacrumObjectType.Sphere)}>
                        <img src="/assets/images/models/sphere.png" alt="Сфера"></img>
                    </div>
                </div>
                <div className="editableSimulacrum" ref={simulacrumContainer}></div>
            </div>
        </>
    )
}
