import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {ObjectType, Project, SimulacrumState} from '../data/models.ts'
import { SimulacrumCanvas } from './canvas.ts'
import { getProjectObjects } from '../data/requests.ts'
import { ControlPanel } from '../components/main-window.tsx'
import { DraggingMode } from './models.ts'

type ControlPanelProps = { controlChangeHandler: (control: DraggingMode) => void }

export const SimulacrumControlPanel = forwardRef<HTMLDivElement, ControlPanelProps>(({ controlChangeHandler }, ref) => {
    return (
        <ControlPanel ref={ ref }
            buttons={[
                <button key={DraggingMode.Movement}
                    onClick={() => {controlChangeHandler(DraggingMode.Movement)}}>
                    <img src="/assets/images/icons/movement-white.png" alt="Перемещение" />
                </button>,
                <button key={DraggingMode.XYRotation}
                    onClick={() => { controlChangeHandler(DraggingMode.XYRotation) }}>
                    <img src="/assets/images/icons/front-rotation-white.png" alt="Вращение в плоскости XY" />
                </button>,
                <button key={DraggingMode.XZRotation}
                    onClick={() => { controlChangeHandler(DraggingMode.XZRotation) }}>
                    <img src="/assets/images/icons/vertical-rotation-white.png" alt="Вращение в плоскости XZ" />
                </button>,
                <button key={DraggingMode.YZRotation}
                    onClick={() => { controlChangeHandler(DraggingMode.YZRotation) }}>
                    <img src="/assets/images/icons/horizontal-rotation-white.png" alt="Вращение в плоскости YZ" />
                </button>,
            ]}
        />
    )
}) 

export type SimulacrumWindowRef = {
    createObject: (type: ObjectType) => Promise<void>,
    getObjects: () => Promise<SimulacrumState>,
}

export const SimulacrumWindow = forwardRef<SimulacrumWindowRef, { project: Project | null }>(({ project }, ref) => {
    const [simulacrum, setSimulacrum] = useState<SimulacrumCanvas | null>(null)
    const container = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function createSimulacrum(simProject: Project) {
            if (!container.current) return
            const projectState = await getProjectObjects(simProject.uid)
            const newSimulacrum = new SimulacrumCanvas()
            newSimulacrum.fitToContainer(container.current)
            for (const objInfo of projectState.objects) {
                newSimulacrum.addObject(objInfo)
            }
            newSimulacrum.fitCameraPosition()
            setSimulacrum(newSimulacrum)
        }
        if (project) createSimulacrum(project)
    }, [project])

    useImperativeHandle(ref, () => {
        async function createObject(type: ObjectType) {
            if (!simulacrum) return
            simulacrum.createObject(type)
        }
        async function getObjects() {
            if (!simulacrum) return new SimulacrumState()
            return simulacrum.getState()
        }

        return { createObject, getObjects }
    }, [simulacrum])

    return (
        <div className="simulacrumWindow" ref={container} >
{/*            <SimulacrumControlPanel
                ref={controlPanel}
                controlChangeHandler={(control: DragControl) => { if (simulacrum) simulacrum.dragControl = control }}
            />*/}
        </div>
    )
})
