"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

  if (loading) return <div className="text-center py-4">Loading analysis...</div>;
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{error}</span>
    </div>
  );
  if (!analysis) return null;

  const { language_stats, file_summaries, improvement_suggestions } = analysis;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  const languageData = Object.entries(language_stats).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  return (
    <div className="code-analysis h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Code Analysis for {activeRepo.name}</h2>
      
      <h3 className="text-xl font-semibold mb-2">Language Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={languageData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {languageData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <h3 className="text-xl font-semibold mt-6 mb-2">File Summaries</h3>
      {Object.entries(file_summaries).map(([path, summary]) => (
        <div key={path} className="mb-4">
          <h4 className="text-lg font-medium">{path}</h4>
          <p className="text-gray-700">{summary}</p>
        </div>
      ))}

      <h3 className="text-xl font-semibold mt-6 mb-2">Improvement Suggestions</h3>
      {Object.entries(improvement_suggestions).map(([path, suggestion]) => (
        <div key={path} className="mb-4">
          <h4 className="text-lg font-medium">{path}</h4>
          <p className="text-gray-700">{suggestion}</p>
        </div>
      ))}
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
    <div className="flex flex-row w-full min-h-screen">
      {/* Left Sidebar - Repositories */}
      <div className="w-1/4 border-r border-gray-300 p-4 h-screen overflow-y-auto">
        <div className="font-bold text-lg mb-4">Repositories</div>
        <div className="flex flex-col">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className={`py-2 px-4 rounded-md cursor-pointer ${activeRepo?.id === repo.id ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
              onClick={() => handleSelectRepo(repo)}
            >
              {repo.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Code Analysis */}
      <div className="w-3/4 p-4 h-screen overflow-y-auto">
        {activeRepo ? (
          <CodeAnalysis activeRepo={activeRepo} />
        ) : (
          <div className="text-center text-gray-500 mt-10">Select a repository to view code analysis</div>
        )}
      </div>
    </div>
  );
}
