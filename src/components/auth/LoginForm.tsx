'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            placeholder="you@example.com"
            required
          />
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 pl-10 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            placeholder="••••••••"
            required
          />
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-700 rounded bg-gray-800"
          />
          <span className="ml-2 text-sm text-gray-400">Remember me</span>
        </label>
        <Link href="/auth/forgot-password" className="text-sm text-orange-500 hover:text-orange-400">
          Forgot password?
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <LogIn className="h-5 w-5 mr-2" />
            Sign In
          </>
        )}
      </button>

      <div className="text-center">
        <span className="text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-orange-500 hover:text-orange-400">
            Sign up
          </Link>
        </span>
      </div>
    </form>
  );
}