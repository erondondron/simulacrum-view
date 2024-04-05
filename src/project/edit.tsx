import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SimulacrumWindow from './simulacrum'
import { Project } from '../models'
import { PROJECTS_URL } from '../urls'
import { plainToClass } from 'class-transformer'

export function SimulacrumEditPage() {
    const divRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const location = useLocation()

    const project: Project = location.state
    const [projectName, setProjectName] = useState<string>(project.name)


    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(event.target.value)
        project.name = event.target.value
    }

    const saveProject = () => {
        fetch(`${PROJECTS_URL}/${project.uid}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(project),
        })
        navigate(`/${project.uid}`, { state: project })
    }

    const cancelChanges = async () => {
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

    useEffect(() => {
        if (divRef.current) {
            const scene = new SimulacrumWindow(divRef.current)
            scene.animate()
            return () => { scene.cleanup(); }
        }
    }, [])

    return (
        <>
            <div className="controlPanel">
                <input
                    className="editableProjectName"
                    type="text"
                    value={projectName}
                    onChange={handleNameChange}
                />
                <div className="controlButtons">
                    <button onClick={saveProject}>Save</button>
                    <button onClick={cancelChanges}>Cancel</button>
                    <button onClick={deleteProject}>Delete</button>
                </div>
            </div>
            <div className="editWindow">
                <div className="modelsPanel">
                    <text>Доступные объекты</text>
                    <div> <img src="/assets/images/models/cube.png" alt="Куб"></img> </div>
                    <div> <img src="/assets/images/models/sphere.png" alt="Сфера"></img> </div>
                </div>
                <div className="editableSimulacrum" ref={divRef}></div>
            </div>
        </>
    )
}
