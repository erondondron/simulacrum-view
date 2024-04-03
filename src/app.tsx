import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SimulacrumPage from './graphics/page';

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
                <Route path="/kinemathic" element={<SimulacrumPage title="Кинематика"/>} />
            </Routes>
        </Router>
    );
}

export default App;
