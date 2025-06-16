'use client';

import React from 'react';

// Cache para evitar re-imports
let laserEyesModule: any = null;
let importPromise: Promise<any> | null = null;

export async function safeLaserEyesImport() {
  // Se já temos o módulo, retornar
  if (laserEyesModule) {
    return laserEyesModule;
  }

  // Se já estamos importando, aguardar
  if (importPromise) {
    return importPromise;
  }

  // Iniciar importação
  importPromise = performImport();
  laserEyesModule = await importPromise;
  return laserEyesModule;
}

async function performImport() {
  // Sempre usar mock para evitar problemas
  return createMockModule();
}

function applyBigIntPatch() {
  if (typeof BigInt !== 'undefined' && !(BigInt.prototype as any).toJSON) {
    (BigInt.prototype as any).toJSON = function() {
      return this.toString();
    };
  }
}

function createMockModule() {
  // Mock seguro e completo
  const MockLaserEyesProvider = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children);
  };

  const useLaserEyes = () => ({
    connected: false,
    isConnected: false,
    isInitializing: false,
    publicKey: '',
    address: '',
    balance: 0,
    network: 'mainnet',
    library: null,
    provider: null,
    accounts: [],
    hasProvider: false,
    connect: async () => {
      console.log('Mock: Connect called');
      return false;
    },
    disconnect: async () => {
      console.log('Mock: Disconnect called');
    },
  });

  return {
    LaserEyesProvider: MockLaserEyesProvider,
    useLaserEyes,
    XVERSE: 'xverse',
  };
}