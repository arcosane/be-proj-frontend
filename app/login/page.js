"use client"
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Page() {
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
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="p-8 bg-gray-800 text-white rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Create an account</h2>
        <p className="mb-6">Enter your email below to create your account</p>
        
        <div className="flex justify-between mb-6">
          <button
            onClick={handleGitHubLogin}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <Image src="/github-icon.png" alt="GitHub" width={24} height={24} className="mr-2" />
            Github
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <Image src="/google-icon.png" alt="Google" width={24} height={24} className="mr-2" />
            Google
          </button>
        </div>

        <div className="relative mb-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative bg-gray-800 px-4 text-sm">OR CONTINUE WITH</div>
        </div>

        <form>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
            <input
              className="w-full px-3 py-2 text-gray-900 bg-gray-200 rounded"
              type="email"
              id="email"
              name="email"
              placeholder="m@example.com"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
            <input
              className="w-full px-3 py-2 text-gray-900 bg-gray-200 rounded"
              type="password"
              id="password"
              name="password"
            />
          </div>
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}