'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import WordFadeIn from "@/components/magicui/word-fade-in";
import { MagicCard } from "@/components/magicui/magic-card";
import { FaCode, FaStar, FaCodeBranch } from 'react-icons/fa';
import BlurFade from "@/components/magicui/blur-fade";
import Navbar from '@/components/navbar';
import Particles from "@/components/magicui/particles";
import Ripple from '@/components/magicui/ripple';

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white text-2xl">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-black text-red-500 text-2xl">Error: {error}</div>;

  return (
    <div className='bg-black'>
      <Navbar />
      <Particles
        className="absolute inset-0"
        quantity={500}
        ease={80}
        color="ffffff"
        refresh
      />

      <div className="min-h-screen pt-[100px] bg-black text-[#FAFAFA] p-8">
        <div className="max-w-6xl mx-auto">
          <WordFadeIn className="text-[#DC2626] text-4xl font-bold mb-2" words={`Welcome ${username} !`}/>
          <WordFadeIn className="text-[#FAFAFA] text-2xl mb-10" words="Here are your top repositories:" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {repos.map(repo => (
              <BlurFade key={repo.id} delay={0.2} inView>
                <MagicCard 
                  key={repo.id}
                  className="cursor-pointer flex flex-col justify-between p-6 shadow-2xl"
                  gradientColor="#D9D9D955"
                >
                  <div>
                    <h3 className="text-3xl font-bold mb-4 text-[#DC2626]">{repo.name}</h3>
                    <p className="text-lg text-black mb-4 line-clamp-2">
                      {repo.description || 'No description available'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-2">
                      <FaCode className="text-[#DC2626]" />
                      <span className="text-md text-black">
                        {repo.language || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaStar className="text-yellow-500" />
                      <span className="text-md text-black">
                        {repo.stargazers_count || 0} stars
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaCodeBranch className="text-green-500" />
                      <span className="text-md text-black">
                        {repo.forks_count || 0} forks
                      </span>
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
      <div className='min-h-screen pt-[100px] bg-black text-[#FAFAFA] p-8'>
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <WordFadeIn className="text-[#FAFAFA] text-2xl mb-10" words="How can we help you ?" />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className="relative flex h-[300px] w-[300px] p-6 flex-col items-center rounded-lg border md:shadow-xl">
              <h2 className='text-2xl text-center mb-4'>Code To Documentation</h2>
              <p className='text-center'>Automatically generates comprehensive documentation from codebase, improving code understandability and maintainability.</p>
              <a href='' className='mt-auto z-10 bg-white text-black px-4 py-2 cursor-pointer rounded-lg shadow-sm hover:shadow-xl'>Learn More</a>
              <Ripple />
            </div>
            <div className="relative flex h-[300px] w-[300px] p-6 flex-col items-center rounded-lg border md:shadow-xl">
              <h2 className='text-2xl text-center mb-4'>Code Analysis</h2>
              <p className='text-center'>Visualizes GitHub repository structure and code dependencies, aiding in code comprehension and identifying potential issues.</p>
              <a href='' className='mt-auto z-10 bg-white text-black px-4 py-2 cursor-pointer rounded-lg shadow-sm hover:shadow-xl'>Learn More</a>
              <Ripple />
            </div>
            <div className="relative flex h-[300px] w-[300px] p-6 flex-col items-center rounded-lg border md:shadow-xl">
              <h2 className='text-2xl text-center mb-4'>Project Roadmap Generator</h2>
              <p className='text-center'>Creates visual project roadmaps based on codebase and issue tracking information, facilitating project planning and management.</p>
              <a href='' className='mt-auto z-10 bg-white text-black px-4 py-2 cursor-pointer rounded-lg shadow-sm hover:shadow-xl'>Learn More</a>
              <Ripple />
            </div>
            <div className="relative flex h-[300px] w-[300px] p-6 flex-col items-center rounded-lg border md:shadow-xl">
              <h2 className='text-2xl text-center mb-4'>Document to Code</h2>
              <p className='text-center'>Translates natural language documentation into code snippets, potentially accelerating development and reducing errors.</p>
              <a href='' className='mt-auto z-10 bg-white text-black px-4 py-2 cursor-pointer rounded-lg shadow-sm hover:shadow-xl'>Learn More</a>
              <Ripple />
            </div>
          </div>
        </div>
      </div>
      <div className='footer h-screen'>
        {/* Footer content here */}
      </div>
    </div>
  );
}
