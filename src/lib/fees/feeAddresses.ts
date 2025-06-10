/**
 * Fee Addresses Management for CYPHER TRADE
 * Manages fee collection addresses across different networks
 */

export interface FeeAddresses {
  ethereum: string;
  arbitrum: string;
  optimism: string;
  polygon: string;
  base: string;
  avalanche: string;
  bsc: string;
  solana: string;
  bitcoin: string;
}

const CYPHER_FEE_ADDRESSES: FeeAddresses = {
  ethereum: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  arbitrum: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  optimism: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  polygon: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  base: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  avalanche: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  bsc: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  solana: 'EPbE1ZmLXkEJDitNb9KNu9Hq8mThS3P7LpBxdF3EkUwT',
  bitcoin: 'bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6'
};

/**
 * Get fee addresses for specific network or all networks
 */
export function getFeeAddresses(network?: string): FeeAddresses | string {
  if (network && network in CYPHER_FEE_ADDRESSES) {
    return CYPHER_FEE_ADDRESSES[network as keyof FeeAddresses];
  }
  return CYPHER_FEE_ADDRESSES;
}

/**
 * Get fee address for specific network
 */
export function getFeeAddress(network: keyof FeeAddresses): string {
  return CYPHER_FEE_ADDRESSES[network];
}

/**
 * Validate if network is supported
 */
export function isNetworkSupported(network: string): boolean {
  return network in CYPHER_FEE_ADDRESSES;
}

export default {
  getFeeAddresses,
  getFeeAddress,
  isNetworkSupported,
  CYPHER_FEE_ADDRESSES
};