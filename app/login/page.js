"use client"
import { useRouter } from 'next/navigation';

export default function page() {
  const router = useRouter();

  const handleGitHubLogin = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/github-login/', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">Login</h1>
        <button
          onClick={handleGitHubLogin}
          className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700"
        >
          Login with GitHub
        </button>
      </div>
    </div>
  );
}