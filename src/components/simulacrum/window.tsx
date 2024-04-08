import { useEffect, useRef, useState } from 'react'
import { Project } from '../../data/models'
import { SimulacrumCanvas } from './canvas'
import { fetchProjectObjects } from '../../data/requests'
import { ControlPanel } from '../main-window'

enum SimulacrumControlButton {
    Movement,
    XYRotation,
    XZRotation,
    YZRotation,
}

function SimulacrumControlPanel({ handlers = {} }: {
    handlers?: Partial<Record<SimulacrumControlButton, () => void>>
}) {
    const defaultHandler = () => { }

    return (
        <ControlPanel
            buttons={[
                <button key={SimulacrumControlButton.Movement}
                    onClick={handlers[SimulacrumControlButton.Movement] || defaultHandler}>
                    <img src="/assets/images/icons/movement-white.png" alt="Перемещение" />
                </button>,
                <button key={SimulacrumControlButton.XYRotation}
                    onClick={handlers[SimulacrumControlButton.XYRotation] || defaultHandler}>
                    <img src="/assets/images/icons/front-rotation-white.png" alt="Вращение в плоскости XY" />
                </button>,
                <button key={SimulacrumControlButton.XZRotation}
                    onClick={handlers[SimulacrumControlButton.XZRotation] || defaultHandler}>
                    <img src="/assets/images/icons/vertical-rotation-white.png" alt="Вращение в плоскости XZ" />
                </button>,
                <button key={SimulacrumControlButton.YZRotation}
                    onClick={handlers[SimulacrumControlButton.YZRotation] || defaultHandler}>
                    <img src="/assets/images/icons/horizontal-rotation-white.png" alt="Вращение в плоскости YZ" />
                </button>,
            ]}
        />
    )
}

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

    const saveSimulacrum = async () => {
        // Объекты из simulacrum конвертируются в json и отправляются в бэкенд
    }

    useEffect(() => {if (project) createSimulacrum(project)}, [project])

    return (
        <div className="simulacrumWindow" ref={container} >
            <SimulacrumControlPanel />
        </div>
    )
}
