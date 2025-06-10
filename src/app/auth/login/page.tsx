import { LoginForm } from '@/components/auth/LoginForm';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { Bitcoin } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <Bitcoin className="h-10 w-10 text-orange-500" />
          <span className="text-2xl font-bold text-gray-100">CYPHER ORDI FUTURE</span>
        </Link>
        <h2 className="text-3xl font-bold text-gray-100">Welcome back</h2>
        <p className="mt-2 text-gray-400">Sign in to access your Bitcoin analytics</p>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <LoginForm />
          
          <div className="mt-6">
            <SocialLogin />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          By signing in, you agree to our{' '}
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