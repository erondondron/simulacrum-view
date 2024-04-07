import { useEffect, useRef } from 'react'
import { Simulacrum } from '../simulacrum'
import { Project } from '../data/models'

export function SimulacrumWindow({ project }: { project: Project | null }) {
    const container = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!container.current || !project) return
        const simulacrum = new Simulacrum(project)
        simulacrum.fitToContainer(container.current)
        // simulacrum.runCalculations()
        simulacrum.animate()
        return
    }, [project])

    return <div className= "simulacrumWindow" ref = { container } > </div>
}
