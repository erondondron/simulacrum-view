import { useEffect, useRef, useState } from 'react'
import { Project } from '../../data/models'
import { SimulacrumCanvas } from './canvas'
import { fetchProjectObjects } from '../../data/requests'

export function SimulacrumWindow({ project }: { project: Project | null }) {
    const [simulacrum, setSimulacrum] = useState<SimulacrumCanvas | null>(null)
    const container = useRef<HTMLDivElement>(null)

    const createSimulacrum = async (simProject: Project) => {
        if (!container.current) return
        const projectState = await fetchProjectObjects(simProject.uid)
        const newSimulacrum = new SimulacrumCanvas()
        newSimulacrum.fitToContainer(container.current)
        for (const objInfo of projectState.objects) {
            newSimulacrum.addObject(objInfo)
        }
        newSimulacrum.fitCameraPosition()
        setSimulacrum(newSimulacrum)
    }

    useEffect(() => {if (project) createSimulacrum(project)}, [project])

    return <div className= "simulacrumWindow" ref = { container } > </div>
}
