import { ReactElement, ReactNode } from "react"
import { useNavigate } from "react-router-dom"

export function ControlPanel({ buttons }:
    {
        buttons: ReactElement<HTMLButtonElement>[],
    }
) {
    return (
        <div className="controlPanel">
            {buttons}
        </div>
    )
}

export function PageHeader({ title, controls }:
    {
        title: ReactElement<HTMLHeadElement>,
        controls: ReactElement<typeof ControlPanel>,
    }
) {
    const navigate = useNavigate()

    return (
        <div className="pageHeader">
            <img src="/assets/logo.svg" alt="Логотип" onClick={() => { navigate("/") }}></img>
            {title}
            {controls}
        </div>
    )
}

export function MainWindow({ header, body }:
    {
        header: ReactElement<typeof PageHeader>,
        body: ReactNode,
    }
) {
    return (
        <>
            { header }
            { body }
        </>
    )
}
