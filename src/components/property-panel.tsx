import {ChangeEvent, useContext, useEffect, useState} from "react";
import {ProjectContext} from "../core/project-store.ts";
import {runInAction} from "mobx";
import {observer} from "mobx-react-lite";
import {SimulacrumEvent} from "../core/simulacrum.ts";
import {SimulacrumObject} from "../core/simulacrum-object.ts";

const ProjectPanel = observer(() => {
    const project = useContext(ProjectContext)

    function nameChanged(event: ChangeEvent<HTMLInputElement>): void {
        runInAction(() => {project.name = event.target.value})
    }

    return (
        <>
            <span>Название проекта</span>
            <input
                type="text"
                value={project.name}
                onChange={nameChanged}/>
            <p></p>
        </>
    )
})

type ObjectPanelProps = {object: SimulacrumObject}

const ObjectPanel = observer((props: ObjectPanelProps) => {
    function positionChanged(position: {x?: number, y?: number}){
        runInAction(() => {props.object.position.values = position})
    }

    function motionEquationChanged(equation: {x?: string, y?: string}){
        runInAction(() => {props.object.motionEquation.values = equation})
    }

    return (
        <>
            <span>Начальные координаты, м</span>
            <label>
                x:
                <input
                    type="number"
                    value={props.object.position.x.toFixed(2)}
                    onChange={(e) => positionChanged({x: parseFloat(e.target.value)})}
                />
            </label>
            <label>
                y:
                <input
                    type="number"
                    value={props.object.position.y.toFixed(2)}
                    onChange={(e) => positionChanged({y: parseFloat(e.target.value)})}
                />
            </label>
            <p></p>
            <span>Уравнение движения</span>
            <label>
                x:
                <input
                    type="string"
                    value={props.object.motionEquation.x}
                    onChange={(e) => motionEquationChanged({x: e.target.value})}
                />
            </label>
            <label>
                y:
                <input
                    type="string"
                    value={props.object.motionEquation.y}
                    onChange={(e) => motionEquationChanged({y: e.target.value})}
                />
            </label>
        </>
    )
})

export const PropertyPanel = observer(() => {
    const [object, setObject] = useState<SimulacrumObject | null>(null)

    useEffect(() => {
        const selectObject = ((event: CustomEvent) => {
            setObject(event.detail.object)
        }) as EventListener
        document.addEventListener(SimulacrumEvent.SelectObject, selectObject)
        return () => {
            document.removeEventListener(SimulacrumEvent.SelectObject, selectObject)
        }
    }, [])

    return (
        <div className="propertyPanel">
            <h3>Параметры</h3>
            {!object && <ProjectPanel/>}
            {object && <ObjectPanel object={object}/>}
        </div>
    )
})
