'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Github, 
  MessageCircle, 
  Mail,
  Chrome
} from 'lucide-react';

interface SocialLoginButtonsProps {
  className?: string;
  onAuthStart?: (provider: string) => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ 
  className = '',
  onAuthStart 
}) => {
  const [mounted, setMounted] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleSocialLogin = (provider: string) => {
    if (!mounted) return;
    
    onAuthStart?.(provider);
    
    // Redirect to OAuth endpoint
    window.location.href = `${baseUrl}/api/auth/${provider}`;
  };

  const socialProviders = [
    {
      id: 'discord',
      name: 'Discord',
      icon: MessageCircle,
      color: 'bg-[#5865F2] hover:bg-[#4752C4]',
      textColor: 'text-white'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'bg-gray-900 hover:bg-gray-800',
      textColor: 'text-white'
    },
    {
      id: 'google',
      name: 'Google',
      icon: Chrome,
      color: 'bg-white hover:bg-gray-50 border border-gray-300',
      textColor: 'text-gray-900'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: MessageCircle,
      color: 'bg-[#0088cc] hover:bg-[#006699]',
      textColor: 'text-white'
    }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {socialProviders.map((provider) => {
          const IconComponent = provider.icon;
          
          return (
            <Button
              key={provider.id}
              variant="outline"
              onClick={() => handleSocialLogin(provider.id)}
              className={`
                flex items-center justify-center gap-2 py-2 px-4 
                transition-all duration-200 transform hover:scale-[1.02]
                ${provider.color} ${provider.textColor}
                border-0 shadow-lg hover:shadow-xl
              `}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-sm font-medium">{provider.name}</span>
            </Button>
          );
        })}
      </div>

      {/* Quick Telegram Login Widget */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="text-xs text-gray-400 mb-2 text-center">
          Quick Telegram Login
        </div>
        <div 
          id="telegram-login-widget"
          className="flex justify-center"
        >
          <script
            async
            src="https://telegram.org/js/telegram-widget.js?22"
            data-telegram-login={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'CypherOrdiBot'}
            data-size="medium"
            data-radius="10"
            data-auth-url={`${baseUrl}/api/auth/telegram`}
            data-request-access="write"
          />
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Click above to authenticate with Telegram
        </div>
      </div>

      {/* Configuration Notice */}
      <div className="text-xs text-center mt-4 p-2 bg-amber-500/10 border border-amber-500/20 rounded">
        <div className="text-amber-400 font-medium">⚠️ OAuth Configuration Required</div>
        <div className="text-gray-400 mt-1">
          Configure OAuth providers in .env.local to enable social login
        </div>
      </div>

      {/* Security Notice */}
      <div className="text-xs text-gray-500 text-center mt-2">
        🔒 All OAuth connections are secure and encrypted. We only access basic profile information.
      </div>
    </div>
  );
};