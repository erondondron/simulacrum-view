import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SimulacrumWindow from './simulacrum'
import { Project } from '../models'
import { PROJECTS_URL } from '../urls'

export function SimulacrumEditPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const project: Project = location.state
    const divRef = useRef<HTMLDivElement>(null)

    const deleteProject = async () => {
        try {
            await fetch(`${PROJECTS_URL}/${project.uid}`, { method: 'DELETE' })
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
                    <button>Cancel</button>
                    <button onClick={deleteProject}>Delete</button>
                </div>
            </div>
            <div className="simulacrum" ref={divRef}></div>
        </>
    )
}
