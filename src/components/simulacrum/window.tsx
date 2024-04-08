import { forwardRef, useEffect, useRef, useState } from 'react'
import { Project } from '../../data/models'
import { SimulacrumCanvas } from './canvas'
import { fetchProjectObjects } from '../../data/requests'
import { ControlPanel } from '../main-window'
import { DragControl } from './models'

type ControlPanelProps = { controlChangeHandler: (control: DragControl) => void }

export const SimulacrumControlPanel = forwardRef<HTMLDivElement, ControlPanelProps>(({ controlChangeHandler }, ref) => {
    return (
        <ControlPanel ref={ ref }
            buttons={[
                <button key={DragControl.Movement}
                    onClick={() => {controlChangeHandler(DragControl.Movement)}}>
                    <img src="/assets/images/icons/movement-white.png" alt="Перемещение" />
                </button>,
                <button key={DragControl.XYRotation}
                    onClick={() => { controlChangeHandler(DragControl.XYRotation) }}>
                    <img src="/assets/images/icons/front-rotation-white.png" alt="Вращение в плоскости XY" />
                </button>,
                <button key={DragControl.XZRotation}
                    onClick={() => { controlChangeHandler(DragControl.XZRotation) }}>
                    <img src="/assets/images/icons/vertical-rotation-white.png" alt="Вращение в плоскости XZ" />
                </button>,
                <button key={DragControl.YZRotation}
                    onClick={() => { controlChangeHandler(DragControl.YZRotation) }}>
                    <img src="/assets/images/icons/horizontal-rotation-white.png" alt="Вращение в плоскости YZ" />
                </button>,
            ]}
        />
    )
}) 

export function SimulacrumWindow({ project }: { project: Project | null }) {
    const [simulacrum, setSimulacrum] = useState<SimulacrumCanvas | null>(null)
    const container = useRef<HTMLDivElement>(null)
    const controlPanel = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function createSimulacrum(simProject: Project) {
            if (!container.current) return
            const projectState = await fetchProjectObjects(simProject.uid)
            const newSimulacrum = new SimulacrumCanvas()
            newSimulacrum.fitToContainer(container.current)
            for (const objInfo of projectState.objects) {
                newSimulacrum.addObject(objInfo)
            }
            newSimulacrum.fitCameraPosition()
            newSimulacrum.dragControlPanel = controlPanel.current
            setSimulacrum(newSimulacrum)
        }
        if (project) createSimulacrum(project)
    }, [project])

    return (
        <div className="simulacrumWindow" ref={container} >
{/*            <SimulacrumControlPanel
                ref={controlPanel}
                controlChangeHandler={(control: DragControl) => { if (simulacrum) simulacrum.dragControl = control }}
            />*/}
        </div>
    )
}
