'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export default function page() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const usernameParam = searchParams.get('username');
    if (usernameParam) {
      setUsername(usernameParam);
    }
    fetchRepos();
  }, [searchParams]);

  const fetchRepos = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/github-repos/', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const data = await response.json();
      setRepos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome, {username}!</h1>
        <h2 className="text-2xl font-semibold mb-4">Your Repositories (Most Recently Active First)</h2>
        <div className="space-y-4">
          {repos.map(repo => (
            <div key={repo.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-xl font-semibold mb-2">{repo.name}</h3>
              <p className="text-gray-600 mb-2">{repo.description || 'No description'}</p>
              <p className="text-sm text-gray-500">Language: {repo.language || 'Not specified'}</p>
              <p className="text-sm text-gray-500">{repo.private ? 'Private' : 'Public'}</p>
              <p className="text-sm text-gray-500">Last updated: {formatDate(repo.updated_at)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}