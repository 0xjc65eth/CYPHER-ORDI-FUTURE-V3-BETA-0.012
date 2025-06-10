'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-stub';
import { Github, Mail, MessageCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SocialLoginFixed() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Using stub Supabase client for development

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'discord') => {
    try {
      setLoading(provider);
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error(`${provider} auth error:`, error);
        setError(`Failed to connect with ${provider}: ${error.message}`);
      }
    } catch (err) {
      console.error('OAuth error:', err);
      setError(`Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  };

  const handleTelegramLogin = async () => {
    setError('Telegram login requires special setup. Please use other providers for now.');
  };

  return (
    <Card className="p-6 bg-gray-900 border-gray-800">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white text-center mb-6">
          Sign in with Social Account
        </h3>

        {error && (
          <Alert className="border-red-600 bg-red-900/20">
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {/* Google */}
          <Button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading === 'google'}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-gray-300"
          >
            <Mail className="w-5 h-5 mr-2" />
            {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </Button>

          {/* GitHub */}
          <Button
            onClick={() => handleOAuthLogin('github')}
            disabled={loading === 'github'}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          >
            <Github className="w-5 h-5 mr-2" />
            {loading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
          </Button>

          {/* Discord */}
          <Button
            onClick={() => handleOAuthLogin('discord')}
            disabled={loading === 'discord'}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {loading === 'discord' ? 'Connecting...' : 'Continue with Discord'}
          </Button>

          {/* Telegram */}
          <Button
            onClick={handleTelegramLogin}
            disabled={true}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white opacity-50"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Continue with Telegram (Coming Soon)
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </Card>
  );
}

// Component to check provider status
export function OAuthProviderStatus() {
  const [providerStatus, setProviderStatus] = useState<any>(null);

  React.useEffect(() => {
    fetch('/api/auth/test')
      .then(res => res.json())
      .then(data => setProviderStatus(data))
      .catch(console.error);
  }, []);

  if (!providerStatus) return null;

  return (
    <Card className="p-4 bg-gray-800 border-gray-700 mt-4">
      <h4 className="text-sm font-semibold text-white mb-2">Provider Status</h4>
      <div className="text-xs space-y-1">
        {Object.entries(providerStatus.providers || {}).map(([provider, enabled]) => (
          <div key={provider} className="flex justify-between">
            <span className="text-gray-400 capitalize">{provider}</span>
            <span className={enabled ? 'text-green-500' : 'text-red-500'}>
              {enabled ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}