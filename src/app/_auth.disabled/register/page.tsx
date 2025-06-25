import { RegisterForm } from '@/components/auth/RegisterForm';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { Bitcoin } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <Bitcoin className="h-10 w-10 text-orange-500" />
          <span className="text-2xl font-bold text-gray-100">CYPHER ORDI FUTURE</span>
        </Link>
        <h2 className="text-3xl font-bold text-gray-100">Create your account</h2>
        <p className="mt-2 text-gray-400">Join the future of Bitcoin analytics</p>
      </div>

      {/* Register Form */}
      <div className="w-full max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <RegisterForm />
          
          <div className="mt-6">
            <SocialLogin />
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-8 w-full max-w-md">
        <h3 className="text-sm font-medium text-gray-400 text-center mb-4">
          Why join CYPHER ORDI FUTURE?
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span className="text-gray-300">AI-powered predictions</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span className="text-gray-300">Real-time market data</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span className="text-gray-300">Ordinals & Runes tracking</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span className="text-gray-300">Mining analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
}