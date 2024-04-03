import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import SimulacrumWindow from './simulacrum'
import { Project } from '../models'

export function SimulacrumViewPage() {
    const location = useLocation()
    const project: Project = location.state
    const divRef = useRef<HTMLDivElement>(null)

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
                <h3>{ project.name }</h3>
                <button>Edit</button>
            </div>
            <div className="simulacrum" ref={divRef}></div>
        </>
    )
}
