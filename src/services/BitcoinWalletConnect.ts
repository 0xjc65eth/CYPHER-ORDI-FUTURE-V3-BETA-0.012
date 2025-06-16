export * from '../components/WalletConnect/BitcoinWalletConnect';
export { default } from '../components/WalletConnect/BitcoinWalletConnect';

// Also export the named class for compatibility
import { BitcoinWalletConnect as BWC, getBitcoinWallet as getBW } from '../components/WalletConnect/BitcoinWalletConnect';
export { BWC as BitcoinWalletConnect, getBW as getBitcoinWallet };