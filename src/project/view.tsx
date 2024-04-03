import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SimulacrumWindow from './simulacrum'
import { Project } from '../models'

export function SimulacrumViewPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const project: Project = location.state
    const divRef = useRef<HTMLDivElement>(null)

    const editProject = () => {
        navigate(`/${project.uid}/edit`, {state: project})
    }

    useEffect(() => {
        if (divRef.current) {
            const scene = new SimulacrumWindow(divRef.current)
            scene.runCalculations()
            scene.animate()
            return () => { scene.cleanup(); }
        }
    }, [])

    return (
        <>
            <div className="controlPanel">
                <h3>{project.name}</h3>
                <div className="controlButtons">
                    <button onClick={editProject}>Edit</button>
                </div>
            </div>
            <div className="simulacrum" ref={divRef}></div>
        </>
    )
}
