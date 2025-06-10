import { Wallet } from 'lucide-react';

interface WalletIconProps {
  name: string;
  className?: string;
}

export function WalletIcon({ name, className = "w-5 h-5" }: WalletIconProps) {
  // Return a generic wallet icon for now
  // In production, you would use actual wallet logos
  return <Wallet className={`${className} text-orange-500`} />;
}