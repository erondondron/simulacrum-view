import React, {useEffect, useRef, useState} from "react"
import {ObjectType} from "../core/project.ts"
import {CreateObjectEventParams, SimulacrumEvent} from "../core/simulacrum.ts";

type ModelContainerProps = {
    type: ObjectType,
    onClick?: (model: HTMLImageElement | null) => void,
}

function ModelContainer(props: ModelContainerProps){
    function handler(event: React.MouseEvent<HTMLImageElement>): void {
        if (props.onClick && event.target instanceof HTMLImageElement)
            props.onClick(event.target)
    }
    return (
        <div className="modelContainer">
            <img className={props.type}
                 onMouseDown={handler}
                 src={`/assets/images/models/${props.type}.png`}
                 alt={props.type}></img>
        </div>
    )
}

export function CatalogPanel() {
    const [draggingObject, setDraggingObject] = useState<HTMLImageElement | null>(null)
    const panel = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const panelInstance = panel.current
        if (!panelInstance || !draggingObject) return

        let objectCreated = false
        const top = draggingObject.offsetTop
        const left = draggingObject.offsetLeft
        const width = draggingObject.width
        const height = draggingObject.height
        const borderX = panelInstance.offsetLeft + panelInstance.offsetWidth

        const handleLeave = () => {
            if (objectCreated) return
            objectCreated = true
            const createEvent = new CustomEvent<CreateObjectEventParams>(
                SimulacrumEvent.CreateObject,
                {detail: {type: draggingObject.className as ObjectType}},
            )
            document.dispatchEvent(createEvent)
            handleDragEnd()
        }

        const handleDrag = (event: MouseEvent) => {
            if (event.clientX > borderX)
                return handleLeave()
            draggingObject.style.left = event.clientX - left - width / 2 + "px"
            draggingObject.style.top = event.clientY - top - height / 2 + "px"
        }

        const handleDragEnd = () => {
            draggingObject.style.position = "static"
            setDraggingObject(null)
        }

        draggingObject.style.height = height + "px"
        draggingObject.style.width = width + "px"
        draggingObject.style.top = "0px"
        draggingObject.style.left = "0px"
        draggingObject.style.position = "relative"

        window.addEventListener('mousemove', handleDrag)
        panelInstance.addEventListener('mouseup', handleDragEnd)

        return () => {
            panelInstance.removeEventListener('mouseup', handleDragEnd)
            window.removeEventListener('mousemove', handleDrag)
        }
    }, [draggingObject])

    return (
        <div ref={panel} className="catalogPanel">
            <h3>Каталог объектов</h3>
            <ModelContainer
                type={ObjectType.Cube}
                onClick={setDraggingObject}/>
            <ModelContainer
                type={ObjectType.Sphere}
                onClick={setDraggingObject}/>
        </div>
    )
}
