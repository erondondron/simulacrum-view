import {ComponentProps, ReactElement, ReactNode} from "react";
import {useNavigate} from "react-router-dom";

type ButtonProps = {
    type: string,
    onClick?: (type: string) => void,
}

export function ControlPanelButton(props: ButtonProps) {
    const handler = props.onClick || (() => {})
    return (
        <button key={props.type}
            onClick={() => {handler(props.type)}}>
            <img src={`/assets/icons/buttons/${props.type}-white.png`}
                 alt={props.type} />
        </button>
    )
}

export function ControlPanel(props: ComponentProps<"div">) {
    return (
        <div className="controlPanel">
            {props.children}
        </div>
    )
}

type PageHeaderProps = ComponentProps<"div"> & {title: ReactNode}

export function PageHeader(props: PageHeaderProps) {
    const navigate = useNavigate()
    function goToHome() { navigate("/") }
    return (
        <div className="pageHeader">
            <img src="/assets/logo.svg" alt="logo" onClick={goToHome}/>
            <h1 className="pageTitle">{props.title}</h1>
            <ControlPanel>
                {props.children}
            </ControlPanel>
        </div>
    )
}

type MainWindowProps = {
    header: ReactElement<typeof PageHeader>,
    body: ReactNode,
}

export function MainWindow(props: MainWindowProps) {
    return (
        <>
            {props.header}
            {props.body}
        </>
    )
}
