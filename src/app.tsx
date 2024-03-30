import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import KinematicPage from './kinemathic';

function HomePage() {
    return (
        <>
            <h1>Simulacrum</h1>
            <nav>
                <ul>
                    <li>
                        <Link to="/kinemathic">Кинематика</Link>
                    </li>
                </ul>
            </nav>
        </>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/kinemathic" element={<KinematicPage />} />
            </Routes>
        </Router>
    );
}

export default App;
