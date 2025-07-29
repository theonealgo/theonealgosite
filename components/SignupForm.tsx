'use client';

import React, { useState, FormEvent } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function SignupForm() {
  const [tvUser, setTvUser] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // 1. Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Save user data in Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        tradingViewUsername: tvUser,
        plan,
        billing,
        createdAt: serverTimestamp(),
        signupMethod: 'email',
        status: 'trial', // Default status
      });

      // 3. Go to dashboard (or /success if you want to hook up Stripe trial flow)
      window.location.href = '/dashboard';
    } catch (err: any) {
      setMessage(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignup} className="space-y-6 bg-gray-900 p-6 rounded-lg shadow-lg">
      <input
        type="text"
        placeholder="TradingView Username"
        required
        value={tvUser}
        onChange={(e) => setTvUser(e.currentTarget.value)}
        className="w-full px-4 py-3 bg-gray-800 text-white rounded"
      />
      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        className="w-full px-4 py-3 bg-gray-800 text-white rounded"
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        className="w-full px-4 py-3 bg-gray-800 text-white rounded"
      />
      <input
        type="text"
        placeholder="Plan key"
        required
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        className="w-full px-4 py-3 bg-gray-800 text-white rounded"
      />
      <select
        value={billing}
        onChange={(e) => setBilling(e.target.value as 'monthly' | 'yearly')}
        className="w-full px-4 py-3 bg-gray-800 text-white rounded"
      >
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
      <button
        type="submit"
        className="w-full bg-teal-500 py-3 rounded-lg font-semibold text-white hover:brightness-110 transition"
        disabled={loading}
      >
        {loading ? 'Signing Up…' : 'Sign Up'}
      </button>
      {message && <div className="text-red-500 text-center">{message}</div>}
    </form>
  );
}
