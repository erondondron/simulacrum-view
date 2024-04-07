import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './components/home-page'
import { VeiwPage } from './components/veiw-page'
import { EditPage } from './components/edit-page'

export function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects/:uuid" element={<VeiwPage />} />
                <Route path="/projects/:uuid/edit" element={<EditPage />} />
            </Routes>
        </Router>
    )
}
