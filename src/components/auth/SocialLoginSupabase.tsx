import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { authHelpers } from '@/lib/auth/supabase';
import { 
  FaDiscord, 
  FaTelegram, 
  FaGithub, 
  FaGoogle,
  FaWallet 
} from 'react-icons/fa';

interface SocialProvider {
  name: string;
  provider: 'google' | 'github' | 'discord';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const SocialLoginSupabase: React.FC = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const socialProviders: SocialProvider[] = [
    {
      name: 'Google',
      provider: 'google',
      icon: FaGoogle,
      color: 'bg-[#4285F4] hover:bg-[#357ae8]',
    },
    {
      name: 'GitHub',
      provider: 'github',
      icon: FaGithub,
      color: 'bg-[#24292e] hover:bg-[#1a1e22]',
    },
    {
      name: 'Discord',
      provider: 'discord',
      icon: FaDiscord,
      color: 'bg-[#5865F2] hover:bg-[#4752C4]',
    },
  ];

  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(provider.name);

    try {
      const { url, error } = await authHelpers.signInWithOAuth(provider.provider);

      if (error) {
        console.error(`${provider.name} login error:`, error);
        
        // Check if provider is not enabled
        if (error.message.includes('not enabled')) {
          toast({
            title: "OAuth Provider Not Enabled",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: `Could not connect to ${provider.name}. Please try again.`,
            variant: "destructive",
          });
        }
        setIsLoading(null);
        return;
      }

      if (url) {
        // Redirect to OAuth provider
        window.location.href = url;
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

        {/* Telegram Login Notice */}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <div className="flex items-center text-sm text-blue-400">
            <FaTelegram className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              Telegram login coming soon! Join our{' '}
              <a href="https://t.me/cypheraicommunity" className="underline hover:text-blue-300" target="_blank" rel="noopener noreferrer">
                community channel
              </a>
              {' '}for updates.
            </span>
          </div>
        </div>
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