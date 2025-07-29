'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSetupClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  if (status === 'loading') return <p>Loading session...</p>;
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/save-tradingview-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/success');
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to save username');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-lg shadow-md space-y-4 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center">
          Enter Your TradingView Username
        </h1>
        <input
          type="text"
          placeholder="TradingView Username"
          className="w-full p-2 rounded bg-gray-800 text-white"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !username}
          className={`w-full py-2 rounded ${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
