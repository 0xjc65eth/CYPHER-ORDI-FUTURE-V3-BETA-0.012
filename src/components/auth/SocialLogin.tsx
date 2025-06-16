'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Github, Chrome, MessageCircle, Loader2 } from 'lucide-react';

interface SocialProvider {
  name: 'google' | 'github' | 'discord';
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  hoverBgColor: string;
}

export function SocialLogin() {
  const { signInWithOAuth } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const providers: SocialProvider[] = [
    {
      name: 'google',
      icon: <Chrome className="h-5 w-5" />,
      label: 'Continue with Google',
      bgColor: 'bg-gray-700',
      hoverBgColor: 'hover:bg-gray-600',
    },
    {
      name: 'github',
      icon: <Github className="h-5 w-5" />,
      label: 'Continue with GitHub',
      bgColor: 'bg-gray-700',
      hoverBgColor: 'hover:bg-gray-600',
    },
    {
      name: 'discord',
      icon: <MessageCircle className="h-5 w-5" />,
      label: 'Continue with Discord',
      bgColor: 'bg-gray-700',
      hoverBgColor: 'hover:bg-gray-600',
    },
  ];

  const handleSocialLogin = async (provider: 'google' | 'github' | 'discord') => {
    setError(null);
    setLoading(provider);

    try {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Failed to authenticate with ' + provider);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
        </div>
      </div>

      <div className="space-y-2">
        {providers.map((provider) => (
          <button
            key={provider.name}
            onClick={() => handleSocialLogin(provider.name)}
            disabled={loading !== null}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-gray-100 transition-colors ${
              provider.bgColor
            } ${provider.hoverBgColor} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading === provider.name ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              provider.icon
            )}
            <span>{provider.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}