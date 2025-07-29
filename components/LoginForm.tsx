'use client';

import React, { useState, FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(''); // Clear previous error

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/dashboard';
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setMessage('Invalid email or password. Please try again, or sign up.');
      } else {
        setMessage(error.message || 'Login failed. Try again.');
      }
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 bg-gray-900 p-6 rounded-lg shadow-lg">
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
      <button
        type="submit"
        className="w-full bg-blue-600 py-3 rounded-lg font-semibold text-white hover:brightness-110 transition"
      >
        Log In
      </button>
      {/* Show error message if any */}
      {message && <div className="text-red-500 text-center">{message}</div>}
    </form>
  );
}
