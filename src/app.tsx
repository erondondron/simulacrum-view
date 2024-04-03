import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { SimulacrumPage, Project } from './project/page'
import { plainToClass } from 'class-transformer'
import { PROJECTS_URL } from './urls'

function HomePage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([])

    const createNewProject = async () => {
        try {
            const response = await fetch(PROJECTS_URL, { method: 'POST' });
            if (!response.ok) {
                throw new Error('Не удалось создать проект');
            }
            const json = await response.json();
            const project = plainToClass(Project, json);
            navigate(`/${project.uid}`, { state: project });
        } catch (error) {
            console.error('При создании проекта возникла ошибка: ', error);
        }
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(PROJECTS_URL)
                if (!response.ok) {
                    throw new Error('Не удалось получить список проектов')
                }
                const json: [Record<string, unknown>] = await response.json();
                const projects: Project[] = json.map(item => plainToClass(Project, item))
                setProjects(projects)
            } catch (error) {
                console.error('При получении списка проектов возникла ошибка: ', error)
            }
        }
        fetchProjects()
    }, [])

    return (
        <>
            <h1>Simulacrum</h1>
            <div className='navigation'>
                <button onClick={createNewProject}>Создать новый проект</button>
                <h2>Доступные проекты:</h2>
                <ul>
                    {projects.map(project => (
                        <li key={project.uid} onClick={() => navigate(`/${project.uid}`, { state: project })}>
                            {project.name}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/:uuid" element={<SimulacrumPage />} />
            </Routes>
        </Router>
    );
}

export default App;
