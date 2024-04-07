import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SimulacrumEditPage } from './edit-page'
import { HomePage } from './components/home-page'
import { VeiwPage } from './components/veiw-page'

export function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects/:uuid" element={<VeiwPage />} />
                <Route path="/:uuid/edit" element={<SimulacrumEditPage />} />
            </Routes>
        </Router>
    )
}
