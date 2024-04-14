import { useContext, useEffect, useRef } from 'react'
import {ProjectContext} from "../core/project-store.ts"
import {observer} from "mobx-react-lite";
import {Simulacrum} from "../core/simulacrum.ts";


export const SimulacrumWindow = observer(() => {
    const project = useContext(ProjectContext)
    const container = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!container.current) return
        const simulacrum = new Simulacrum(project)
        simulacrum.fitToContainer(container.current)
        return () => {simulacrum.dispose()}
    }, [project])

    return <div className="simulacrumWindow" ref={container} />
})
