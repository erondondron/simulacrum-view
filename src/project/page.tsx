import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import SimulacrumWindow from './simulacrum'
import './page.css'

export class Project {
    public uid!: string
    public name: string = 'New Project'
}

export function SimulacrumPage() {
    const location = useLocation()
    const project = location.state
    const divRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (divRef.current) {
            const scene = new SimulacrumWindow(divRef.current)
            scene.run()
            return () => { scene.cleanup(); }
        }
    }, [])

    return (
        <>
            <div className="controlPanel">
                <h3 className="title">{ project.name }</h3>
                <button>Edit</button>
            </div>
            <div ref={divRef}></div>
        </>
    )
}
