import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { 
  FaDiscord, 
  FaTelegram, 
  FaGithub, 
  FaGoogle,
  FaWallet 
} from 'react-icons/fa';

interface SocialProvider {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  oauth: {
    authUrl: string;
    clientId: string;
    scope: string;
    redirectUri: string;
  };
}

export const SocialLoginEnhanced: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const socialProviders: SocialProvider[] = [
    {
      name: 'Discord',
      icon: FaDiscord,
      color: 'bg-[#5865F2] hover:bg-[#4752C4]',
      oauth: {
        authUrl: 'https://discord.com/api/oauth2/authorize',
        clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '',
        scope: 'identify email guilds',
        redirectUri: `${window.location.origin}/api/auth/discord/callback`,
      },
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      color: 'bg-[#0088cc] hover:bg-[#006ba6]',
      oauth: {
        authUrl: 'https://oauth.telegram.org/auth',
        clientId: process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || '',
        scope: 'basic',
        redirectUri: `${window.location.origin}/api/auth/telegram/callback`,
      },
    },
    {
      name: 'GitHub',
      icon: FaGithub,
      color: 'bg-[#24292e] hover:bg-[#1a1e22]',
      oauth: {
        authUrl: 'https://github.com/login/oauth/authorize',
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
        scope: 'user:email',
        redirectUri: `${window.location.origin}/api/auth/github/callback`,
      },
    },
    {
      name: 'Google',
      icon: FaGoogle,
      color: 'bg-[#4285F4] hover:bg-[#357ae8]',
      oauth: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        scope: 'openid email profile',
        redirectUri: `${window.location.origin}/api/auth/google/callback`,
      },
    },
  ];

  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(provider.name);

    try {
      // Generate state for CSRF protection
      const state = generateRandomState();
      sessionStorage.setItem('oauth_state', state);

      // Build OAuth URL
      const params = new URLSearchParams({
        client_id: provider.oauth.clientId,
        redirect_uri: provider.oauth.redirectUri,
        response_type: 'code',
        scope: provider.oauth.scope,
        state: state,
      });

      // Special handling for Telegram
      if (provider.name === 'Telegram') {
        // Telegram uses a different OAuth flow
        initTelegramLogin(provider);
      } else {
        // Standard OAuth flow
        const authUrl = `${provider.oauth.authUrl}?${params.toString()}`;
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error(`${provider.name} login error:`, error);
      toast({
        title: "Login Failed",
        description: `Could not connect to ${provider.name}. Please try again.`,
        variant: "destructive",
      });
      setIsLoading(null);
    }
  };

  const initTelegramLogin = (provider: SocialProvider) => {
    // Telegram Web App authentication
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', provider.oauth.clientId);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '4');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    // Define callback
    (window as any).onTelegramAuth = async (user: any) => {
      try {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });

        if (response.ok) {
          const data = await response.json();
          handleLoginSuccess(data);
        } else {
          throw new Error('Telegram authentication failed');
        }
      } catch (error) {
        toast({
          title: "Authentication Failed",
          description: "Could not verify Telegram credentials.",
          variant: "destructive",
        });
      }
      setIsLoading(null);
    };

    document.body.appendChild(script);
  };

  const handleWalletConnect = async () => {
    setIsLoading('Wallet');
    
    try {
      // This would integrate with your existing wallet connection logic
      const walletConnectButton = document.getElementById('wallet-connect-button');
      if (walletConnectButton) {
        walletConnectButton.click();
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleLoginSuccess = async (authData: any) => {
    // Store auth data
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_provider', authData.provider);
    localStorage.setItem('user_data', JSON.stringify(authData.user));

    // Update user context
    await updateUserContext(authData.user);

    // Show success message
    toast({
      title: "Login Successful! 🎉",
      description: `Welcome back, ${authData.user.name || authData.user.username}!`,
    });

    // Redirect to dashboard
    router.push('/dashboard');
  };

  const updateUserContext = async (userData: any) => {
    // This would update your global user context/state
    // For example, if using Redux or Context API
    console.log('Updating user context:', userData);
  };

  const generateRandomState = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  return (
    <Card className="p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Sign In to Cypher AI</h2>
      
      <div className="space-y-3">
        {/* Social Login Buttons */}
        {socialProviders.map((provider) => {
          const Icon = provider.icon;
          return (
            <Button
              key={provider.name}
              onClick={() => handleSocialLogin(provider)}
              disabled={isLoading !== null}
              className={`w-full ${provider.color} text-white`}
            >
              {isLoading === provider.name ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              ) : (
                <Icon className="w-5 h-5 mr-2" />
              )}
              Continue with {provider.name}
            </Button>
          );
        })}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">Or</span>
          </div>
        </div>

        {/* Wallet Connect */}
        <Button
          onClick={handleWalletConnect}
          disabled={isLoading !== null}
          variant="outline"
          className="w-full"
        >
          {isLoading === 'Wallet' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          ) : (
            <FaWallet className="w-5 h-5 mr-2" />
          )}
          Connect Wallet
        </Button>
      </div>

      {/* Terms and Privacy */}
      <p className="text-xs text-gray-500 text-center mt-6">
        By signing in, you agree to our{' '}
        <a href="/terms" className="text-blue-500 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</a>
      </p>

      {/* Benefits */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-sm font-semibold mb-3">Sign in to access:</h3>
        <ul className="text-sm text-gray-400 space-y-2">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Real-time portfolio tracking
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            AI-powered trading signals
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Custom alerts and notifications
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Quick trade execution
          </li>
        </ul>
      </div>
    </Card>
  );
};