import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import SimulacrumWindow from './simulacrum'
import { Project } from '../models'
import './page.css'

export function SimulacrumEditPage() {
    const location = useLocation()
    const project: Project = location.state
    const divRef = useRef<HTMLDivElement>(null)

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
                <h3 className="title">{project.name}</h3>
                <button>Save</button>
                <button>Cancel</button>
            </div>
            <div ref={divRef}></div>
        </>
    )
}
