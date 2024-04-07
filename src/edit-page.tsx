import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Project, SimulacrumObjectType, Vector } from './data/models'
import { plainToClass } from 'class-transformer'
import { EditableSimulacrumWindow, Object3D } from './components/simulacrum/canvas'

export function SimulacrumEditPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const project: Project = location.state

    const simulacrumContainer = useRef<HTMLDivElement>(null)
    const [simulacrum, setSimulacrum] = useState<EditableSimulacrumWindow | null>(null)

    const [projectName, setProjectName] = useState<string>(project.name)
    const [draggedModel, setDraggedModel] = useState<SimulacrumObjectType | null>(null)
    const [selectedObject, setSelectedObject] = useState<Object3D | null>(null)
    const [selectedObjectPosition, setSelectedObjectPosition] = useState<Vector | null>(null)

    useEffect(() => {
        if (simulacrumContainer.current) {
            const simulacrum = new EditableSimulacrumWindow(project)
            simulacrum.fitToContainer(simulacrumContainer.current)
            simulacrum.setDroppedHook(setDraggedModel)
            const onSelectHook = (object: Object3D | null): void => {
                setSelectedObject(object)
                const position = object ? object.asSimulacrumObject().position : null
                setSelectedObjectPosition(position)
            } 
            simulacrum.setSelectObjectHook(onSelectHook)
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

    const onObjectParamsChanged = (event: React.ChangeEvent<HTMLInputElement>, param: string): void => {
        if (!selectedObject)
            return
        const updates = { [param]: parseFloat(event.target.value || "0") }
        Object.assign(selectedObject.instance.position, updates)
        const newPosition = new Vector()
        if (selectedObjectPosition)
            Object.assign(newPosition, selectedObjectPosition)
        Object.assign(newPosition, updates)
        setSelectedObjectPosition(newPosition)
    }

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
                        value={selectedObjectPosition?.x}
                        onChange={(event) => onObjectParamsChanged(event, 'x')}
                    />
                    <p></p>
                    <span>В направлении оси y:</span>
                    <span>Уравнение перемещения (y)</span>
                    <input
                        type="text"
                        value={selectedObjectPosition?.y}
                        onChange={(event) => onObjectParamsChanged(event, 'y')}
                    />
                </div>
            </div>
        </>
    )
}
