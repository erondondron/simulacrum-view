import { useEffect, useRef } from 'react'
import SimulacrumWindow from './simulacrum'
import './page.css'

function SimulacrumPage({ title }: { title: string }) {
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
            <div className="controlPanel">
                <h3 className="title">{ title }</h3>
                <button>Edit</button>
            </div>
            <div ref={divRef}></div>
        </>
    )
}

export default SimulacrumPage
