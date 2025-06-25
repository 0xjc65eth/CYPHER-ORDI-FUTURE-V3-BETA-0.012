'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Github, 
  MessageCircle, 
  Chrome,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy
} from 'lucide-react';
import Link from 'next/link';

export default function OAuthTestPage() {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  
  const oauthProviders = [
    {
      id: 'discord',
      name: 'Discord',
      icon: MessageCircle,
      color: 'bg-[#5865F2]',
      testUrl: '/api/auth/discord',
      docs: 'https://discord.com/developers/applications',
      envVars: ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET']
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'bg-gray-900',
      testUrl: '/api/auth/github',
      docs: 'https://github.com/settings/developers',
      envVars: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET']
    },
    {
      id: 'google',
      name: 'Google',
      icon: Chrome,
      color: 'bg-red-600',
      testUrl: '/api/auth/google',
      docs: 'https://console.cloud.google.com/apis/credentials',
      envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: MessageCircle,
      color: 'bg-[#0088cc]',
      testUrl: '/api/auth/telegram',
      docs: 'https://core.telegram.org/bots/features#botfather',
      envVars: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_USERNAME']
    }
  ];

  const testOAuthEndpoint = async (provider: string, url: string) => {
    try {
      setTestResults(prev => ({ ...prev, [provider]: { status: 'testing' } }));
      
      const response = await fetch(url, { method: 'GET', redirect: 'manual' });
      
      if (response.status === 0 || response.type === 'opaqueredirect') {
        // Redirect occurred - this is expected for OAuth
        setTestResults(prev => ({ 
          ...prev, 
          [provider]: { 
            status: 'success', 
            message: 'OAuth redirect working correctly' 
          } 
        }));
      } else if (response.status === 500) {
        const text = await response.text();
        setTestResults(prev => ({ 
          ...prev, 
          [provider]: { 
            status: 'error', 
            message: 'Server error - check environment variables' 
          } 
        }));
      } else {
        setTestResults(prev => ({ 
          ...prev, 
          [provider]: { 
            status: 'partial', 
            message: `Status: ${response.status}` 
          } 
        }));
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [provider]: { 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing': return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🔐 OAuth Integration Test Center
          </h1>
          <p className="text-gray-400 mb-4">
            Test and configure OAuth integrations for Discord, GitHub, Google, and Telegram
          </p>
          <Link 
            href="/auth/login" 
            className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
          >
            ← Back to Login Page
          </Link>
        </div>

        {/* Environment Variables Check */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📋 Environment Variables</h2>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-3">
                Make sure these environment variables are set in your .env.local file:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {oauthProviders.flatMap(provider => 
                  provider.envVars.map(envVar => (
                    <div key={envVar} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded">
                      <code className="text-green-400">{envVar}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(envVar)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* OAuth Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {oauthProviders.map((provider) => {
            const IconComponent = provider.icon;
            const result = testResults[provider.id];
            
            return (
              <Card key={provider.id} className="bg-gray-800 border-gray-700">
                <div className="p-6">
                  {/* Provider Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${provider.color}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                        <p className="text-sm text-gray-400">OAuth Integration</p>
                      </div>
                    </div>
                    {result && getStatusIcon(result.status)}
                  </div>

                  {/* Test Result */}
                  {result && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      result.status === 'success' ? 'bg-green-900/20 border border-green-600/30' :
                      result.status === 'error' ? 'bg-red-900/20 border border-red-600/30' :
                      'bg-blue-900/20 border border-blue-600/30'
                    }`}>
                      <p className={`text-sm ${
                        result.status === 'success' ? 'text-green-400' :
                        result.status === 'error' ? 'text-red-400' :
                        'text-blue-400'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                  )}

                  {/* Environment Variables */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Required Environment Variables:</p>
                    <div className="space-y-1">
                      {provider.envVars.map(envVar => (
                        <code key={envVar} className="block text-xs bg-gray-900 px-2 py-1 rounded text-green-400">
                          {envVar}
                        </code>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => testOAuthEndpoint(provider.id, provider.testUrl)}
                      disabled={result?.status === 'testing'}
                      className="w-full"
                      variant="outline"
                    >
                      {result?.status === 'testing' ? 'Testing...' : 'Test OAuth Endpoint'}
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(provider.testUrl, '_blank')}
                        className="flex-1"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Try Login
                      </Button>
                      
                      <Button
                        onClick={() => window.open(provider.docs, '_blank')}
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                      >
                        📚 Docs
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Setup Instructions */}
        <Card className="mt-8 bg-gray-800 border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">🚀 Quick Setup Guide</h2>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">1. Discord OAuth Setup:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Go to Discord Developer Portal</li>
                  <li>Create a new application</li>
                  <li>Add redirect URI: <code className="bg-gray-900 px-1 rounded">http://localhost:4444/api/auth/discord</code></li>
                  <li>Copy Client ID and Client Secret to .env.local</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">2. GitHub OAuth Setup:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Go to GitHub Settings {'>'}  Developer settings {'>'} OAuth Apps</li>
                  <li>Create a new OAuth App</li>
                  <li>Set callback URL: <code className="bg-gray-900 px-1 rounded">http://localhost:4444/api/auth/github</code></li>
                  <li>Copy Client ID and Client Secret to .env.local</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">3. Google OAuth Setup:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Go to Google Cloud Console {'>'} APIs & Services {'>'} Credentials</li>
                  <li>Create OAuth 2.0 Client ID</li>
                  <li>Add redirect URI: <code className="bg-gray-900 px-1 rounded">http://localhost:4444/api/auth/google</code></li>
                  <li>Copy Client ID and Client Secret to .env.local</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">4. Telegram Bot Setup:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Message @BotFather on Telegram</li>
                  <li>Create a new bot with /newbot</li>
                  <li>Set domain with /setdomain: <code className="bg-gray-900 px-1 rounded">localhost:4444</code></li>
                  <li>Copy Bot Token and Username to .env.local</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}