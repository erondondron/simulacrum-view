import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Project, SimulacrumObjectType } from './models'
import { REST_URL } from './urls'
import { plainToClass } from 'class-transformer'
import { EditableSimulacrumWindow, Object3D } from './simulacrum'

export function SimulacrumEditPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const project: Project = location.state

    const simulacrumContainer = useRef<HTMLDivElement>(null)
    const [simulacrum, setSimulacrum] = useState<EditableSimulacrumWindow | null>(null)

    const [projectName, setProjectName] = useState<string>(project.name)
    const [draggedModel, setDraggedModel] = useState<SimulacrumObjectType | null>(null)
    const [selectedObject, setSelectedObject] = useState<Object3D | null>(null)

    useEffect(() => {
        if (simulacrumContainer.current) {
            const simulacrum = new EditableSimulacrumWindow(project)
            simulacrum.fitToContainer(simulacrumContainer.current)
            simulacrum.setDroppedHook(setDraggedModel)
            setSimulacrum(simulacrum)
            simulacrum.animate()
            return
        }
    }, [project])

    const onProjectNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(event.target.value)
        project.name = event.target.value
    }

    const onModelSelect = (object: SimulacrumObjectType) => {
        const toSelect = object === draggedModel ? null : object
        setDraggedModel(toSelect);
        if (simulacrum)
            simulacrum.setDraggedObject(toSelect)
    }

    const onObjectParamsChanged = () => { }

    const onProjectSave = () => {
        fetch(`${REST_URL}/projects/${project.uid}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(project),
        })
        if (simulacrum) {
            fetch(`${REST_URL}/projects/${project.uid}/objects`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(simulacrum.getState()),
            })
        }
        navigate(`/${project.uid}`, { state: project })
    }

    const onProjectChangesCancel = async () => {
        try {
            const response = await fetch(`${REST_URL}/projects/${project.uid}`);
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
            fetch(`${REST_URL}/projects/${project.uid}`, { method: 'DELETE' })
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
                    onChange={onProjectNameChange}
                />
                <div className="controlButtons">
                    <button onClick={onProjectSave}>Save</button>
                    <button onClick={onProjectChangesCancel}>Cancel</button>
                    <button onClick={deleteProject}>Delete</button>
                </div>
            </div>
            <div className="editWindow">
                <div className="modelsPanel">
                    <span>Доступные объекты</span>
                    <div className={draggedModel === SimulacrumObjectType.Cube ? "modelContainer clicked" : "modelContainer"}
                        onClick={() => onModelSelect(SimulacrumObjectType.Cube)}>
                        <img src="/assets/images/models/cube.png" alt="Куб"></img>
                    </div>
                    <div className={draggedModel === SimulacrumObjectType.Sphere ? "modelContainer clicked" : "modelContainer"}
                        onClick={() => onModelSelect(SimulacrumObjectType.Sphere)}>
                        <img src="/assets/images/models/sphere.png" alt="Сфера"></img>
                    </div>
                </div>
                <div className="editableSimulacrum" ref={simulacrumContainer}></div>
                <div className="objectPanel">
                    <h4>Параметры объекта</h4>
                    <p></p>
                    <span>В направлении оси x:</span>
                    <span>Уравнение перемещения (x)</span>
                    <input
                        type="text"
                        value={selectedObject?.instance.position.x}
                        onChange={onObjectParamsChanged}
                    />
                    <p></p>
                    <span>В направлении оси y:</span>
                    <span>Уравнение перемещения (y)</span>
                    <input
                        type="text"
                        value={selectedObject?.instance.position.y}
                        onChange={onObjectParamsChanged}
                    />
                </div>
            </div>
        </>
    )
}
