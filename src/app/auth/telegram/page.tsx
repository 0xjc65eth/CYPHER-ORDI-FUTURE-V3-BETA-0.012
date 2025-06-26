'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Bitcoin, ArrowLeft } from 'lucide-react';

export default function TelegramAuthPage() {
  useEffect(() => {
    // Load Telegram Login Widget Script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'CypherOrdiBot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-auth-url', `${window.location.origin}/api/auth/telegram`);
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    const container = document.getElementById('telegram-login-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      // Cleanup
      if (container && script.parentNode) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <Bitcoin className="h-10 w-10 text-orange-500" />
          <span className="text-2xl font-bold text-gray-100">CYPHER ORDI FUTURE</span>
        </Link>
        <h2 className="text-3xl font-bold text-gray-100">Telegram Login</h2>
        <p className="mt-2 text-gray-400">Authenticate with your Telegram account</p>
      </div>

      {/* Telegram Widget Container */}
      <div className="w-full max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-[#0088cc] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.68 8.1l-1.35 6.36c-.1.47-.37.59-.75.37l-2.07-1.53-1 .96c-.11.11-.2.2-.41.2l.15-2.07 3.8-3.43c.17-.15-.03-.23-.26-.08l-4.69 2.95-2.02-.63c-.44-.14-.45-.44.09-.65l7.89-3.04c.37-.14.69.09.57.59z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Connect with Telegram</h3>
              <p className="text-sm text-gray-400 mb-6">
                Click the button below to authenticate with your Telegram account
              </p>
            </div>

            {/* Telegram Login Widget */}
            <div id="telegram-login-container" className="flex justify-center mb-6">
              {/* Widget will be injected here */}
            </div>

            {/* Alternative Instructions */}
            <div className="text-xs text-gray-500 space-y-2">
              <p>🔹 Make sure you have a Telegram account</p>
              <p>🔹 The bot will request basic profile information</p>
              <p>🔹 You can revoke access anytime in Telegram settings</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-green-500 mt-0.5">🔒</div>
              <div className="text-xs text-gray-400">
                <strong className="text-gray-300">Secure Authentication:</strong> We use Telegram&apos;s official OAuth system. 
                Your login is encrypted and we only access basic profile information.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Login */}
      <div className="mt-6">
        <Link 
          href="/auth/login" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login options
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          By authenticating, you agree to our{' '}
          <Link href="/terms" className="text-orange-500 hover:text-orange-400">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-orange-500 hover:text-orange-400">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}