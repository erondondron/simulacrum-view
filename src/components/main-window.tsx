import {ReactElement, ReactNode, forwardRef} from "react"
import {useNavigate} from "react-router-dom"

type ControlPanelProps = { buttons?: ReactElement<HTMLButtonElement>[] }

export const ControlPanel = forwardRef<HTMLDivElement, ControlPanelProps>(
    ({buttons = []}, ref) => {
        return (
            <div ref={ref} className="controlPanel">
                {buttons}
            </div>
        )
    })

type PageHeaderProps = {
   title: string,
   controls: ReactElement<typeof ControlPanel>,
}

export function PageHeader({title, controls}: PageHeaderProps) {
    const navigate = useNavigate()

    return (
        <div className="pageHeader">
            <img src="/assets/logo.svg" alt="Логотип" onClick={() => {
                navigate("/")
            }}/>
            <h1 className="pageTitle">{title}</h1>
            {controls}
        </div>
    )
}

type MainWindowProps = {
    header: ReactElement<typeof PageHeader>,
    body: ReactNode,
}

export function MainWindow({header, body}: MainWindowProps) {
    return (
        <>
            {header}
            {body}
        </>
    )
}
