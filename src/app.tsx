import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SimulacrumViewPage } from './view-page'
import { SimulacrumEditPage } from './edit-page'
import { HomePage } from './components/home-page'

export function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/:uuid" element={<SimulacrumViewPage />} />
                <Route path="/:uuid/edit" element={<SimulacrumEditPage />} />
            </Routes>
        </Router>
    )
}
