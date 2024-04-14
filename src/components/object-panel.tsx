import {ChangeEvent, useContext} from "react";
import {ProjectContext} from "../core/project-store.ts";
import {runInAction} from "mobx";
import {observer} from "mobx-react-lite";

export const ObjectPanel = observer(() => {
    const project = useContext(ProjectContext)

    const changeProjectName = (event: ChangeEvent<HTMLInputElement>) => {
        runInAction(() => {project.name = event.target.value})
    }

    return (
        <div className="objectPanel">
            <h3>Параметры</h3>
            <span>Название проекта</span>
            <input
                type="text"
                defaultValue={project.name}
                onChange={changeProjectName}
            />
        </div>
    )
})
