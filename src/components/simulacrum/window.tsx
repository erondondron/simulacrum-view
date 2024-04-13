import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ObjectType, Project, Vector } from '../../data/models'
import { SimulacrumCanvas } from './canvas'
import { fetchProjectObjects } from '../../data/requests'
import { ControlPanel } from '../main-window'
import { DraggingMode } from './models'

type ControlPanelProps = { controlChangeHandler: (control: DraggingMode) => void }

export const SimulacrumControlPanel = forwardRef<HTMLDivElement, ControlPanelProps>(({ controlChangeHandler }, ref) => {
    return (
        <ControlPanel ref={ ref }
            buttons={[
                <button key={DraggingMode.Movement}
                    onClick={() => {controlChangeHandler(DraggingMode.Movement)}}>
                    <img src="/assets/images/icons/movement-white.png" alt="�����������" />
                </button>,
                <button key={DraggingMode.XYRotation}
                    onClick={() => { controlChangeHandler(DraggingMode.XYRotation) }}>
                    <img src="/assets/images/icons/front-rotation-white.png" alt="�������� � ��������� XY" />
                </button>,
                <button key={DraggingMode.XZRotation}
                    onClick={() => { controlChangeHandler(DraggingMode.XZRotation) }}>
                    <img src="/assets/images/icons/vertical-rotation-white.png" alt="�������� � ��������� XZ" />
                </button>,
                <button key={DraggingMode.YZRotation}
                    onClick={() => { controlChangeHandler(DraggingMode.YZRotation) }}>
                    <img src="/assets/images/icons/horizontal-rotation-white.png" alt="�������� � ��������� YZ" />
                </button>,
            ]}
        />
    )
}) 

export type SimulacrumWindowRef = {
    addObject: (type: ObjectType, position: Vector) => void,
}

export const SimulacrumWindow = forwardRef<SimulacrumWindowRef, { project: Project | null }>(({ project }, ref) => {
    const [simulacrum, setSimulacrum] = useState<SimulacrumCanvas | null>(null)
    const container = useRef<HTMLDivElement>(null)

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
            setSimulacrum(newSimulacrum)
        }
        if (project) createSimulacrum(project)
    }, [project])

    useImperativeHandle(ref, () => {
        async function addObject(type: ObjectType, position: Vector) {
            if (!simulacrum) return
            simulacrum.addRelativeObject(type, position)
        }
        return { addObject }
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
