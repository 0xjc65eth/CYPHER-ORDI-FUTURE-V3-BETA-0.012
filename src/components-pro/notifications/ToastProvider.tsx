'use client';

import React from 'react';
import * as Toast from '@radix-ui/react-toast';

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <Toast.Provider swipeDirection="right" duration={5000}>
      {children}
      
      {/* Viewport para renderizar os toasts */}
      <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
    </Toast.Provider>
  );
};

export default ToastProvider;