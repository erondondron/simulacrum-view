import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { SimulacrumPage, Project } from './project/page';
import { plainToClass } from 'class-transformer';
import { PROJECTS_URL } from './urls';

function HomePage() {
    const navigate = useNavigate()

    const createNewProject = async () => {
        try {
            const response = await fetch(PROJECTS_URL, { method: 'POST' })
            if (!response.ok)
                throw new Error('Не удалось создать проект')
            const json = await response.json()
            const project = plainToClass(Project, json)
            navigate(`/${project.uuid}`, { state: project });
        } catch (error) {
            console.error('При создании проекта возникла ошибка: ', error);
        }
    };

    return (
        <>
            <h1>Simulacrum</h1>
            <div className='navigation'>
                <button onClick={createNewProject}>Создать новый проект</button>
            </div>
        </>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/:uuid" element={<SimulacrumPage/>} />
            </Routes>
        </Router>
    );
}

export default App;
