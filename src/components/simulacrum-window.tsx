import { useContext, useEffect, useRef } from 'react'
import {ProjectContext} from "../core/project-store.ts"
import {observer} from "mobx-react-lite";
import {Simulacrum} from "../core/simulacrum.ts";

type SimulacrumWindowProps = {editable?: boolean}

export const SimulacrumWindow = observer(({editable = false}: SimulacrumWindowProps) => {
    const project = useContext(ProjectContext)
    const container = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!container.current) return
        const simulacrum = new Simulacrum(project, editable)
        simulacrum.fitToContainer(container.current)
        return () => {simulacrum.dispose()}
    }, [project, editable])

    return <div className="simulacrumWindow" ref={container} />
})
