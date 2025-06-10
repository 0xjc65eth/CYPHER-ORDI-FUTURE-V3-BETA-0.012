/**
 * WalletConnect Module - Index
 * 
 * Exportações principais do módulo BitcoinWalletConnect
 * 
 * @author CypherAI v3.0
 * @version 3.0.0
 */

export { default as BitcoinWalletConnect } from './BitcoinWalletConnect.js';

// Re-exportar para compatibilidade
export { default } from './BitcoinWalletConnect.js';

// Utilitários auxiliares
export const SUPPORTED_WALLETS = [
  'unisat',
  'xverse', 
  'oyl',
  'magiceden'
];

export const WALLET_ICONS = {
  unisat: '/wallets/unisat.svg',
  xverse: '/wallets/xverse.svg',
  oyl: '/wallets/oyl.svg',
  magiceden: '/wallets/magiceden.svg'
};

export const WALLET_NAMES = {
  unisat: 'UniSat',
  xverse: 'Xverse',
  oyl: 'OYL Wallet',
  magiceden: 'Magic Eden'
};

// Configurações padrão
export const DEFAULT_CONFIG = {
  network: 'mainnet',
  autoDetect: true,
  retryAttempts: 3,
  retryDelay: 1000,
  apiTimeout: 30000,
  enableLogging: false
};

// URLs das APIs
export const HIRO_API_URLS = {
  mainnet: 'https://api.hiro.so',
  testnet: 'https://api.testnet.hiro.so'
};

// Tipos de endereços Bitcoin suportados
export const BITCOIN_ADDRESS_TYPES = {
  P2PKH: 'p2pkh',      // Legacy (1...)
  P2SH: 'p2sh',        // Script Hash (3...)
  P2WPKH: 'p2wpkh',    // Segwit (bc1...)
  P2WSH: 'p2wsh',      // Segwit Script (bc1...)
  P2TR: 'p2tr'         // Taproot (bc1p...)
};

// Eventos disponíveis
export const WALLET_EVENTS = [
  'connected',
  'disconnected',
  'accountChanged',
  'networkChanged',
  'balanceUpdated',
  'ordinalsUpdated',
  'runesUpdated',
  'walletsDetected',
  'connectionError',
  'stateChanged',
  'initialDataLoaded'
];