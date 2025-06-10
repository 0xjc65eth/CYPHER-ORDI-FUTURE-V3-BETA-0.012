'use client';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const ClientOnlyComponent = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export default dynamic(() => Promise.resolve(ClientOnlyComponent), {
  ssr: false,
});