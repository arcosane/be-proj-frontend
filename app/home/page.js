'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function page() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const usernameParam = searchParams.get('username');
    if (usernameParam) {
      setUsername(usernameParam);
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h1 className="mb-4 text-2xl font-bold">Welcome, {username}!</h1>
      </div>
    </div>
  );
}