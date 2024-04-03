import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SimulacrumWindow from './simulacrum'
import { Project } from '../models'
import { PROJECTS_URL } from '../urls'
import { plainToClass } from 'class-transformer'

export function SimulacrumEditPage() {
    const divRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const location = useLocation()
    let project: Project = location.state

    const cancelChanges = async () => {
        try {
            const response = await fetch(`${PROJECTS_URL}/${project.uid}`);
            if (!response.ok) {
                throw new Error('Не удалось получить исходный проект');
            }
            const json = await response.json();
            project = plainToClass(Project, json);
            navigate(`/${project.uid}`, { state: project })
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
                <h3>{project.name}</h3>
                <div className="controlButtons">
                    <button>Save</button>
                    <button onClick={cancelChanges}>Cancel</button>
                    <button onClick={deleteProject}>Delete</button>
                </div>
            </div>
            <div className="simulacrum" ref={divRef}></div>
        </>
    )
}
