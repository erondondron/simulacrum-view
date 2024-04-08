import { ReactElement, ReactNode, forwardRef } from "react"
import { useNavigate } from "react-router-dom"

type ControlPanelProps = { buttons: ReactElement<HTMLButtonElement>[] }

export const ControlPanel = forwardRef<HTMLDivElement, ControlPanelProps>(({ buttons }, ref) => {
    return (
        <div ref={ref} className="controlPanel">
            {buttons}
        </div>
    )
}) 

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
