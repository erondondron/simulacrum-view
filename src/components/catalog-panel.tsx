import react, {useState, useRef, useEffect} from "react";
import {ObjectType} from "../data/models";

type CatalogPanelProps = {
    onObjectCreateHandler: (type: ObjectType) => void
}

export function CatalogPanel({ onObjectCreateHandler = () => {} }: CatalogPanelProps) {
    const [draggingObject, setDraggingObject] = useState<HTMLImageElement | null>(null)
    const panel = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const panelInstance = panel.current
        if (!panelInstance || !draggingObject) {
            setDraggingObject(null)
            return
        }

        const top = draggingObject.offsetTop
        const left = draggingObject.offsetLeft
        const width = draggingObject.width
        const height = draggingObject.height
        const borderX = panelInstance.offsetLeft + panelInstance.offsetWidth

        const handleDrag = (event: MouseEvent) => {
            if (event.clientX > borderX) {
                onObjectCreateHandler(draggingObject.className as ObjectType)
                handleDragEnd()
                return
            }
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

        panelInstance.addEventListener('mousemove', handleDrag)
        panelInstance.addEventListener('mouseup', handleDragEnd)

        return () => {
            panelInstance.removeEventListener('mouseup', handleDragEnd)
            panelInstance.removeEventListener('mousemove', handleDrag)
        }
    }, [draggingObject, onObjectCreateHandler]);

    const onModelClicked = (event: react.MouseEvent) => {
        if (event.target instanceof HTMLImageElement)
            setDraggingObject(event.target)
    }

    return (
        <div ref={panel} className="catalogPanel">
            <h3>Каталог объектов</h3>
            <div className="modelContainer">
                <img className={ObjectType.Cube} onMouseDown={onModelClicked}
                     src="/assets/images/models/cube.png" alt="Куб"></img>
            </div>
            <div className="modelContainer">
                <img className={ObjectType.Sphere} onMouseDown={onModelClicked}
                     src="/assets/images/models/sphere.png" alt="Сфера"></img>
            </div>
        </div>
    )
}
