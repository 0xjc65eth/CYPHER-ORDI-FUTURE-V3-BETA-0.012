import React from 'react';
import { cn } from '@/lib/utils';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

export function Text({ className, children, ...props }: TextProps) {
  return (
    <p className={cn('text-sm text-gray-300', className)} {...props}>
      {children}
    </p>
  );
}
