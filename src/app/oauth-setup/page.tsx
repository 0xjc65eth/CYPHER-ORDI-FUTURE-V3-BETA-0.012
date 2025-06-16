'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Copy,
  AlertTriangle,
  Globe,
  Github,
  MessageCircle
} from 'lucide-react';

export default function OAuthSetupPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    setEnvVars({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    });
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const callbackUrl = 'https://tsmevnomziouyffdvwya.supabase.co/auth/v1/callback';
  const dashboardUrl = 'https://supabase.com/dashboard/project/tsmevnomziouyffdvwya';

  const providers = [
    {
      name: 'Google',
      icon: <Globe className="w-5 h-5" />,
      consoleUrl: 'https://console.developers.google.com',
      steps: [
        'Acesse Google Console',
        'APIs & Services → Credentials',
        'Create Credentials → OAuth 2.0 Client IDs',
        'Application type: Web application',
        'Authorized redirect URIs: Cole a URL abaixo'
      ],
      color: 'border-blue-500 bg-blue-900/20'
    },
    {
      name: 'GitHub',
      icon: <Github className="w-5 h-5" />,
      consoleUrl: 'https://github.com/settings/developers',
      steps: [
        'Acesse GitHub Developer Settings',
        'New OAuth App',
        'Application name: CYPHER ORDI Future',
        'Homepage URL: http://localhost:4444',
        'Authorization callback URL: Cole a URL abaixo'
      ],
      color: 'border-gray-500 bg-gray-900/20'
    },
    {
      name: 'Discord',
      icon: <MessageCircle className="w-5 h-5" />,
      consoleUrl: 'https://discord.com/developers/applications',
      steps: [
        'Acesse Discord Developer Portal',
        'New Application',
        'Nome: CYPHER ORDI Future',
        'OAuth2 → Redirects → Add Redirect',
        'Cole a URL de callback abaixo'
      ],
      color: 'border-purple-500 bg-purple-900/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔐 Configuração OAuth
          </h1>
          <p className="text-gray-400 text-lg">
            Configure os providers OAuth para resolver o erro &quot;Unsupported provider&quot;
          </p>
        </div>

        {/* Informações do Projeto */}
        <Card className="p-6 bg-gray-800 border-blue-600">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">
            📋 Informações do Seu Projeto
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Supabase URL:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-700 px-2 py-1 rounded text-blue-300">
                  https://tsmevnomziouyffdvwya.supabase.co
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard('https://tsmevnomziouyffdvwya.supabase.co', 'url')}
                >
                  {copied === 'url' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Callback URL:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-700 px-2 py-1 rounded text-green-300">
                  {callbackUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(callbackUrl, 'callback')}
                >
                  {copied === 'callback' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Dashboard:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(dashboardUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Supabase
              </Button>
            </div>
          </div>
        </Card>

        {/* Status das Variáveis */}
        <Card className="p-6 bg-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">
            ⚙️ Status das Variáveis de Ambiente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              {envVars.supabaseUrl ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-gray-300">SUPABASE_URL</span>
            </div>
            <div className="flex items-center gap-3">
              {envVars.hasAnonKey ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-gray-300">SUPABASE_ANON_KEY</span>
            </div>
            <div className="flex items-center gap-3">
              {envVars.siteUrl ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-gray-300">SITE_URL</span>
            </div>
          </div>
        </Card>

        {/* Configuração dos Providers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {providers.map((provider, index) => (
            <Card key={provider.name} className={`p-6 border ${provider.color}`}>
              <div className="flex items-center gap-3 mb-4">
                {provider.icon}
                <h3 className="text-xl font-semibold text-white">{provider.name}</h3>
              </div>
              
              <div className="space-y-3 mb-4">
                {provider.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-start gap-2">
                    <span className="text-gray-400 text-sm mt-1">{stepIndex + 1}.</span>
                    <span className="text-gray-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full mb-3"
                onClick={() => window.open(provider.consoleUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Console
              </Button>

              <div className="bg-gray-700 p-2 rounded text-xs">
                <p className="text-gray-400 mb-1">Callback URL:</p>
                <code className="text-green-300 break-all">{callbackUrl}</code>
              </div>
            </Card>
          ))}
        </div>

        {/* Instruções Finais */}
        <Alert className="border-yellow-600 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-yellow-200">
            <strong>Importante:</strong> Após configurar cada provider, vá ao{' '}
            <a 
              href={dashboardUrl} 
              target="_blank" 
              className="underline hover:text-yellow-100"
            >
              Supabase Dashboard
            </a>{' '}
            → Authentication → Providers e ative cada um com suas credenciais.
          </AlertDescription>
        </Alert>

        {/* Botões de Teste */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => window.location.href = '/oauth-test'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🧪 Testar OAuth
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
          >
            📊 Ir para Dashboard
          </Button>
        </div>

        {/* Environment Template */}
        <Card className="p-6 bg-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">
            📝 Template .env.local
          </h3>
          <div className="bg-gray-900 p-4 rounded-lg relative">
            <pre className="text-sm text-gray-300">
{`# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tsmevnomziouyffdvwya.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Site URLs
NEXT_PUBLIC_SITE_URL=http://localhost:4444
NEXT_PUBLIC_VERCEL_URL=http://localhost:4444

# JWT Secret
JWT_SECRET=sua_jwt_secret_aqui`}
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(`# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tsmevnomziouyffdvwya.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Site URLs
NEXT_PUBLIC_SITE_URL=http://localhost:4444
NEXT_PUBLIC_VERCEL_URL=http://localhost:4444

# JWT Secret
JWT_SECRET=sua_jwt_secret_aqui`, 'env')}
            >
              {copied === 'env' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}