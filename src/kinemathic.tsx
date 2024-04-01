import { useEffect, useRef } from 'react'
import SimulacrumWindow from './graphics/simulacrum'

function KinematicPage() {
    const divRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (divRef.current) {
            const scene = new SimulacrumWindow(divRef.current)
            scene.run()
            return () => { scene.cleanup(); }
        }
    }, [])

    return (
        <>
            <div ref={divRef}></div>
        </>
    )
}

export default KinematicPage
