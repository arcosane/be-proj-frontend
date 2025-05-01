"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Oval } from 'react-loader-spinner';

const API_BASE_URL = 'http://localhost:8000/api';

const CodeAnalysis = ({ activeRepo }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (activeRepo) {
            fetchAnalysis();
        }
    }, [activeRepo]);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);

        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        try {
            const response = await axios.post(`${API_BASE_URL}/code-analysis/`, {
                repo_name: activeRepo.name
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken  // Add CSRF token to the request
                }
            });
            setAnalysis(response.data);
        } catch (err) {
            setError('Failed to fetch code analysis');
            console.error('Error fetching code analysis:', err);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white flex justify-center items-center z-50">
                <Oval
                    color="#00BFFF"
                    height={80}
                    width={80}
                />
            </div>
        );
    }
    if (error) return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-semibold">Error: </strong>
            <span className="block sm:inline">{error}</span>
        </div>
    );
    if (!analysis) return null;

    const { language_stats, file_summaries, improvement_suggestions } = analysis;

    const COLORS = ['#2563eb', '#059669', '#eab308', '#dc2626', '#6d28d9', '#14b8a6']; // More modern colors

    const languageData = Object.entries(language_stats).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
    }));

    return (
        <div className="code-analysis p-6 rounded-lg shadow-md bg-white">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">Code Analysis for {activeRepo.name}</h2>

            <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 text-gray-700">Language Distribution</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={languageData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}  // Slightly larger for better visual impact
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}  // Add percentage to label
                        >
                            {languageData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 text-gray-700">File Summaries</h3>
                <div className="space-y-4">
                    {Object.entries(file_summaries).map(([path, summary]) => (
                        <div key={path} className="bg-gray-50 rounded-md p-4 border border-gray-200">
                            <h4 className="text-lg font-medium text-gray-800 mb-2">{path}</h4>
                            <p className="text-gray-700 leading-relaxed">{summary}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-700">Improvement Suggestions</h3>
                <div className="space-y-4">
                    {Object.entries(improvement_suggestions).map(([path, suggestion]) => (
                        <div key={path} className="bg-gray-50 rounded-md p-4 border border-gray-200">
                            <h4 className="text-lg font-medium text-gray-800 mb-2">{path}</h4>
                            <p className="text-gray-700 leading-relaxed">{suggestion}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function Page() {
    const [repositories, setRepositories] = useState([]);
    const [activeRepo, setActiveRepo] = useState(null);

    useEffect(() => {
        fetchRepositories();
    }, []);

    const fetchRepositories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/github-repos/`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch repositories');
            }
            const data = await response.json();
            setRepositories(data);
        } catch (error) {
            console.error('Error fetching repositories:', error);
        }
    };

    const handleSelectRepo = (repo) => {
        setActiveRepo(repo);
    };

    return (
        <div className="flex flex-row w-full min-h-screen bg-gray-100">
            {/* Left Sidebar - Repositories */}
            <aside className="w-1/4 border-r border-gray-200 p-6 bg-white shadow-md">
                <h2 className="font-semibold text-2xl mb-4 text-gray-800">Repositories</h2>
                <nav className="space-y-2">
                    {repositories.map((repo) => (
                        <button
                            key={repo.id}
                            className={`w-full text-left py-3 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${activeRepo?.id === repo.id ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-700'}`}
                            onClick={() => handleSelectRepo(repo)}
                        >
                            {repo.name}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content - Code Analysis */}
            <main className="w-3/4 p-6 overflow-y-auto">
                {activeRepo ? (
                    <CodeAnalysis activeRepo={activeRepo} />
                ) : (
                    <div className="text-center text-gray-500 mt-20">Select a repository to view code analysis</div>
                )}
            </main>
        </div>
    );
}