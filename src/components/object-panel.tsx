import {ChangeEvent, useContext, useEffect, useState} from "react";
import {ProjectContext} from "../core/project-store.ts";
import {runInAction} from "mobx";
import {observer} from "mobx-react-lite";
import {SimulacrumEvent} from "../core/simulacrum.ts";
import {SimulacrumObject} from "../core/simulacrum-object.ts";

export const ObjectPanel = observer(() => {
    const project = useContext(ProjectContext)
    const [object, setObject] = useState<SimulacrumObject | null>(null)

    function changeProjectName(event: ChangeEvent<HTMLInputElement>): void {
        runInAction(() => {project.name = event.target.value})
    }

    function objectPositionChanged(position: {x?: number, y?: number}){
        if (object) runInAction(() => {object.position.values = position})
    }

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
        <div className="objectPanel">
            <h3>Параметры</h3>
            {!object && (
                <><span>Название проекта</span>
                <input
                    type="text"
                    value={project.name}
                    onChange={changeProjectName}/><p></p></>
            )}
            {object && (
                <>
                    <span>Начальные координаты, м</span>
                    <label>
                        x:
                        <input
                            type="number"
                            value={object.position.x.toFixed(2)}
                            onChange={(e) => objectPositionChanged({x: parseFloat(e.target.value)})}
                        />
                    </label>
                    <label>
                        y:
                        <input
                            type="number"
                            value={object.position.y.toFixed(2)}
                            onChange={(e) => objectPositionChanged({y: parseFloat(e.target.value)})}
                        />
                    </label>
                    <p></p>
                </>
            )}
        </div>
    )
})
