import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SimulacrumWindow } from './simulacrum'
import { Project } from './models'

export function SimulacrumViewPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const project: Project = location.state

    const simulacrumContainer = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (simulacrumContainer.current) {
            const simulacrum = new SimulacrumWindow(project)
            simulacrum.fitToContainer(simulacrumContainer.current)
            // simulacrum.runCalculations()
            simulacrum.animate()
            return
        }
    }, [project])

    const onProjectEdit = () => {
        navigate(`/${project.uid}/edit`, { state: project })
    }

    return (
        <>
            <div className="controlPanel">
                <h3>{project.name}</h3>
                <div className="controlButtons">
                    <button onClick={onProjectEdit}>Edit</button>
                </div>
            </div>
            <div className="simulacrum" ref={simulacrumContainer}></div>
        </>
    )
}
