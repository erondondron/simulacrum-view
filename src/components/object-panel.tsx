import {ChangeEvent, useState} from "react";
import {Project} from "../data/models.ts";

export function ObjectPanel({ project = null}: {project: Project | null}) {
    const [projectName, setProjectName] = useState<string>(project?.name || "")

    const onProjectNameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        if (!project) return
        setProjectName(event.target.value)
        project.name = event.target.value
        const titles = document.getElementsByClassName("pageTitle")
        if (titles.length > 0) titles[0].innerHTML = event.target.value
    }

    return (
        <div className="objectPanel">
            <h3>Параметры</h3>
            <span>Название проекта</span>
            <input
                type="text"
                value={projectName}
                onChange={onProjectNameChangeHandler}
            />
        </div>
    )
}
