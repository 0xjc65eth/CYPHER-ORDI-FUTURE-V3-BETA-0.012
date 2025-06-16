/**
 * Bitcoin Address Validation System
 * Comprehensive validation for Bitcoin addresses
 * 
 * @version 1.0.0
 * @author CYPHER ORDI FUTURE - Agent 5
 */

// Address Type Enum
export enum AddressType {
  P2PKH = 'P2PKH',         // Pay to Public Key Hash (Legacy)
  P2SH = 'P2SH',           // Pay to Script Hash
  P2WPKH = 'P2WPKH',       // Pay to Witness Public Key Hash (Bech32)
  P2WSH = 'P2WSH',         // Pay to Witness Script Hash (Bech32)
  P2TR = 'P2TR',           // Pay to Taproot (Bech32m)
  UNKNOWN = 'UNKNOWN'
}

// Address Validation Result
export interface AddressValidationResult {
  isValid: boolean;
  addressType: AddressType;
  network: 'mainnet' | 'testnet' | 'regtest';
  errors: string[];
  warnings: string[];
  normalizedAddress?: string;
  checksum?: boolean;
}

// Network Configuration
interface NetworkConfig {
  p2pkh: number[];
  p2sh: number[];
  bech32: string;
  bech32m: string;
}

const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  mainnet: {
    p2pkh: [0x00],
    p2sh: [0x05],
    bech32: 'bc',
    bech32m: 'bc'
  },
  testnet: {
    p2pkh: [0x6f],
    p2sh: [0xc4],
    bech32: 'tb',
    bech32m: 'tb'
  },
  regtest: {
    p2pkh: [0x6f],
    p2sh: [0xc4],
    bech32: 'bcrt',
    bech32m: 'bcrt'
  }
};

/**
 * Bitcoin Address Validator Class
 */
export class AddressValidator {
  private readonly bech32Charset = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  private readonly base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  /**
   * Main validation method
   */
  validateBitcoinAddress(
    address: string,
    allowedNetworks: string[] = ['mainnet', 'testnet']
  ): AddressValidationResult {
    const result: AddressValidationResult = {
      isValid: false,
      addressType: AddressType.UNKNOWN,
      network: 'mainnet',
      errors: [],
      warnings: []
    };

    try {
      // Basic format validation
      if (!this.basicFormatValidation(address, result)) {
        return result;
      }

      // Determine address type and validate accordingly
      if (this.isBech32Address(address)) {
        return this.validateBech32Address(address, allowedNetworks);
      } else if (this.isBase58Address(address)) {
        return this.validateBase58Address(address, allowedNetworks);
      } else {
        result.errors.push('Unknown address format');
        return result;
      }

    } catch (error: any) {
      result.errors.push(`Validation error: ${error.message}`);
      return result;
    }
  }

  /**
   * Basic format validation
   */
  private basicFormatValidation(
    address: string,
    result: AddressValidationResult
  ): boolean {
    // Check for empty or null address
    if (!address || typeof address !== 'string') {
      result.errors.push('Address cannot be empty');
      return false;
    }

    // Trim whitespace
    address = address.trim();
    if (address.length === 0) {
      result.errors.push('Address cannot be empty after trimming');
      return false;
    }

    // Length validation
    if (address.length < 26 || address.length > 62) {
      result.errors.push('Invalid address length');
      return false;
    }

    // Check for invalid characters
    const validChars = /^[a-zA-Z0-9]+$/;
    if (!validChars.test(address)) {
      result.errors.push('Address contains invalid characters');
      return false;
    }

    return true;
  }

  /**
   * Validate Bech32/Bech32m addresses (SegWit v0, v1+)
   */
  private validateBech32Address(
    address: string,
    allowedNetworks: string[]
  ): AddressValidationResult {
    const result: AddressValidationResult = {
      isValid: false,
      addressType: AddressType.UNKNOWN,
      network: 'mainnet',
      errors: [],
      warnings: []
    };

    try {
      // Parse HRP (Human Readable Part) and data
      const separatorIndex = address.lastIndexOf('1');
      if (separatorIndex === -1) {
        result.errors.push('Invalid bech32 format: missing separator');
        return result;
      }

      const hrp = address.substring(0, separatorIndex).toLowerCase();
      const data = address.substring(separatorIndex + 1).toLowerCase();

      // Validate HRP
      const network = this.getNetworkFromHRP(hrp);
      if (!network) {
        result.errors.push('Invalid network prefix');
        return result;
      }

      if (!allowedNetworks.includes(network)) {
        result.errors.push(`Network ${network} not allowed`);
        return result;
      }

      result.network = network as any;

      // Validate data part
      if (data.length < 6) {
        result.errors.push('Bech32 data too short');
        return result;
      }

      // Convert to 5-bit groups
      const decoded = this.bech32Decode(data);
      if (!decoded) {
        result.errors.push('Invalid bech32 encoding');
        return result;
      }

      // Extract witness version and program
      const witnessVersion = decoded[0];
      const witnessProgram = decoded.slice(1);

      if (witnessVersion > 16) {
        result.errors.push('Invalid witness version');
        return result;
      }

      // Validate witness program length
      if (witnessProgram.length < 2 || witnessProgram.length > 40) {
        result.errors.push('Invalid witness program length');
        return result;
      }

      // Determine address type based on witness version and program length
      if (witnessVersion === 0) {
        if (witnessProgram.length === 20) {
          result.addressType = AddressType.P2WPKH;
        } else if (witnessProgram.length === 32) {
          result.addressType = AddressType.P2WSH;
        } else {
          result.errors.push('Invalid witness program length for version 0');
          return result;
        }

        // Validate bech32 checksum for v0
        if (!this.validateBech32Checksum(hrp, decoded, false)) {
          result.errors.push('Invalid bech32 checksum');
          return result;
        }
      } else if (witnessVersion === 1) {
        if (witnessProgram.length === 32) {
          result.addressType = AddressType.P2TR;
        } else {
          result.errors.push('Invalid witness program length for version 1 (Taproot)');
          return result;
        }

        // Validate bech32m checksum for v1+
        if (!this.validateBech32Checksum(hrp, decoded, true)) {
          result.errors.push('Invalid bech32m checksum');
          return result;
        }
      } else {
        // Future witness versions
        result.addressType = AddressType.UNKNOWN;
        result.warnings.push(`Future witness version ${witnessVersion}`);
        
        // Use bech32m for v1+
        if (!this.validateBech32Checksum(hrp, decoded, true)) {
          result.errors.push('Invalid bech32m checksum');
          return result;
        }
      }

      result.isValid = true;
      result.normalizedAddress = address.toLowerCase();
      result.checksum = true;

      return result;

    } catch (error: any) {
      result.errors.push(`Bech32 validation error: ${error.message}`);
      return result;
    }
  }

  /**
   * Validate Base58 addresses (Legacy P2PKH, P2SH)
   */
  private validateBase58Address(
    address: string,
    allowedNetworks: string[]
  ): AddressValidationResult {
    const result: AddressValidationResult = {
      isValid: false,
      addressType: AddressType.UNKNOWN,
      network: 'mainnet',
      errors: [],
      warnings: []
    };

    try {
      // Decode base58check
      const decoded = this.base58CheckDecode(address);
      if (!decoded) {
        result.errors.push('Invalid base58check encoding');
        return result;
      }

      if (decoded.length !== 21) {
        result.errors.push('Invalid decoded address length');
        return result;
      }

      const versionByte = decoded[0];
      const hash = decoded.slice(1);

      // Determine network and address type
      const networkInfo = this.getNetworkFromVersionByte(versionByte);
      if (!networkInfo) {
        result.errors.push('Unknown version byte');
        return result;
      }

      if (!allowedNetworks.includes(networkInfo.network)) {
        result.errors.push(`Network ${networkInfo.network} not allowed`);
        return result;
      }

      result.network = networkInfo.network as any;
      result.addressType = networkInfo.type;

      // Validate hash length
      if (hash.length !== 20) {
        result.errors.push('Invalid hash length');
        return result;
      }

      result.isValid = true;
      result.normalizedAddress = address;
      result.checksum = true;

      return result;

    } catch (error: any) {
      result.errors.push(`Base58 validation error: ${error.message}`);
      return result;
    }
  }

  /**
   * Check if address is Bech32 format
   */
  private isBech32Address(address: string): boolean {
    return address.toLowerCase().startsWith('bc1') || 
           address.toLowerCase().startsWith('tb1') || 
           address.toLowerCase().startsWith('bcrt1');
  }

  /**
   * Check if address is Base58 format
   */
  private isBase58Address(address: string): boolean {
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
           /^[2mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
  }

  /**
   * Get network from HRP (Human Readable Part)
   */
  private getNetworkFromHRP(hrp: string): string | null {
    switch (hrp) {
      case 'bc': return 'mainnet';
      case 'tb': return 'testnet';
      case 'bcrt': return 'regtest';
      default: return null;
    }
  }

  /**
   * Get network and type from version byte
   */
  private getNetworkFromVersionByte(versionByte: number): {
    network: string;
    type: AddressType;
  } | null {
    for (const [network, config] of Object.entries(NETWORK_CONFIGS)) {
      if (config.p2pkh.includes(versionByte)) {
        return { network, type: AddressType.P2PKH };
      }
      if (config.p2sh.includes(versionByte)) {
        return { network, type: AddressType.P2SH };
      }
    }
    return null;
  }

  /**
   * Decode Bech32 data
   */
  private bech32Decode(data: string): number[] | null {
    try {
      const decoded: number[] = [];
      for (const char of data) {
        const value = this.bech32Charset.indexOf(char);
        if (value === -1) return null;
        decoded.push(value);
      }

      // Convert from 5-bit to 8-bit
      const converted = this.convertBits(decoded.slice(0, -6), 5, 8, false);
      return converted ? [decoded[0], ...converted] : null;
    } catch {
      return null;
    }
  }

  /**
   * Validate Bech32/Bech32m checksum
   */
  private validateBech32Checksum(
    hrp: string,
    data: number[],
    useBech32m: boolean
  ): boolean {
    const const1 = useBech32m ? 0x2bc830a3 : 1;
    return this.bech32Polymod([...this.hrpExpand(hrp), ...data]) === const1;
  }

  /**
   * Bech32 polymod calculation
   */
  private bech32Polymod(values: number[]): number {
    const generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    
    for (const value of values) {
      const top = chk >> 25;
      chk = (chk & 0x1ffffff) << 5 ^ value;
      for (let i = 0; i < 5; i++) {
        chk ^= (top >> i) & 1 ? generator[i] : 0;
      }
    }
    return chk;
  }

  /**
   * HRP expansion for checksum
   */
  private hrpExpand(hrp: string): number[] {
    const result: number[] = [];
    for (let i = 0; i < hrp.length; i++) {
      result.push(hrp.charCodeAt(i) >> 5);
    }
    result.push(0);
    for (let i = 0; i < hrp.length; i++) {
      result.push(hrp.charCodeAt(i) & 31);
    }
    return result;
  }

  /**
   * Convert between bit groups
   */
  private convertBits(
    data: number[],
    fromBits: number,
    toBits: number,
    pad: boolean
  ): number[] | null {
    let acc = 0;
    let bits = 0;
    const result: number[] = [];
    const maxv = (1 << toBits) - 1;
    const maxAcc = (1 << (fromBits + toBits - 1)) - 1;

    for (const value of data) {
      if (value < 0 || value >> fromBits) return null;
      acc = ((acc << fromBits) | value) & maxAcc;
      bits += fromBits;
      while (bits >= toBits) {
        bits -= toBits;
        result.push((acc >> bits) & maxv);
      }
    }

    if (pad) {
      if (bits) result.push((acc << (toBits - bits)) & maxv);
    } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
      return null;
    }

    return result;
  }

  /**
   * Base58Check decode
   */
  private base58CheckDecode(address: string): Uint8Array | null {
    try {
      const decoded = this.base58Decode(address);
      if (!decoded || decoded.length < 4) return null;

      // Extract payload and checksum
      const payload = decoded.slice(0, -4);
      const checksum = decoded.slice(-4);

      // Verify checksum
      const hash = this.doubleSha256(payload);
      const expectedChecksum = hash.slice(0, 4);

      if (!this.arraysEqual(checksum, expectedChecksum)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Base58 decode
   */
  private base58Decode(s: string): Uint8Array | null {
    try {
      let num = BigInt(0);
      const alphabet = this.base58Alphabet;
      
      for (const char of s) {
        const index = alphabet.indexOf(char);
        if (index === -1) return null;
        num = num * BigInt(58) + BigInt(index);
      }

      // Convert to bytes
      const bytes: number[] = [];
      while (num > 0) {
        bytes.unshift(Number(num % BigInt(256)));
        num = num / BigInt(256);
      }

      // Handle leading zeros
      for (const char of s) {
        if (char === '1') bytes.unshift(0);
        else break;
      }

      return new Uint8Array(bytes);
    } catch {
      return null;
    }
  }

  /**
   * Double SHA256 hash
   */
  private doubleSha256(data: Uint8Array): Uint8Array {
    // This is a simplified implementation
    // In a real scenario, you would use crypto.subtle.digest or a crypto library
    const hash1 = this.sha256(data);
    const hash2 = this.sha256(hash1);
    return hash2;
  }

  /**
   * Simplified SHA256 (placeholder)
   * In production, use crypto.subtle.digest or a proper crypto library
   */
  private sha256(data: Uint8Array): Uint8Array {
    // This is a placeholder - use actual SHA256 implementation
    // For now, return a mock hash for demonstration
    return new Uint8Array(32).fill(0);
  }

  /**
   * Compare arrays for equality
   */
  private arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Validate multiple addresses at once
   */
  validateMultipleAddresses(
    addresses: string[],
    allowedNetworks: string[] = ['mainnet', 'testnet']
  ): Map<string, AddressValidationResult> {
    const results = new Map<string, AddressValidationResult>();
    
    for (const address of addresses) {
      results.set(address, this.validateBitcoinAddress(address, allowedNetworks));
    }
    
    return results;
  }

  /**
   * Get address type from address string
   */
  getAddressType(address: string): AddressType {
    const result = this.validateBitcoinAddress(address);
    return result.addressType;
  }

  /**
   * Check if address is valid (quick check)
   */
  isValidAddress(address: string): boolean {
    const result = this.validateBitcoinAddress(address);
    return result.isValid;
  }
}

// Export singleton instance
export const addressValidator = new AddressValidator();