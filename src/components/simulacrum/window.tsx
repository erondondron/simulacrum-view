import { useEffect, useRef } from 'react'
import { Project } from '../../data/models'
import { SimulacrumCanvas } from './canvas'

export function SimulacrumWindow({ project }: { project: Project | null }) {
    const container = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!container.current || !project) return
        const simulacrum = new SimulacrumCanvas()
        simulacrum.fitToContainer(container.current)
        // simulacrum.runCalculations()
        return
    }, [project])

    return <div className= "simulacrumWindow" ref = { container } > </div>
}
