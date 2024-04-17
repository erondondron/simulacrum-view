import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './components/home-page'
import { ViewPage } from './components/view-page.tsx'
import { EditPage } from './components/edit-page'
import { useContext } from "react"
import { ProjectStoreContext } from "./core/project-store.ts";

export function App() {
    const projectStore = useContext(ProjectStoreContext)

    return (
        <ProjectStoreContext.Provider value={projectStore}>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/projects/:uuid" element={<ViewPage />} />
                    <Route path="/projects/:uuid/edit" element={<EditPage />} />
                </Routes>
            </Router>
        </ProjectStoreContext.Provider>
    )
}
