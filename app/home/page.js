'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import WordFadeIn from "@/components/magicui/word-fade-in";

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
      setRepos(data.slice(0, 4));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-[#FAFAFA] p-8">
      <div className="max-w-4xl mx-auto">
        <WordFadeIn className="text-[#DC2626] text-3xl font-bold mb-2" words={`Welcome ${username} !`}/>
        <WordFadeIn className="text-[#FAFAFA] text-xl mb-6" words="How can I help you today?" />
        <h2 className="text-2xl font-semibold mb-4">Your Top Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map(repo => (
            <div key={repo.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-[#DC2626]">{repo.name}</h3>
              <p className="text-sm text-gray-300">
                Language: {repo.language || 'Not specified'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}