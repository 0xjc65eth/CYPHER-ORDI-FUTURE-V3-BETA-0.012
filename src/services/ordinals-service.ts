// Serviço para buscar e verificar Ordinals

import { fetchOrdiscanData } from '@/lib/ordiscan';

// Lista de coleções premium para verificação
export const PREMIUM_COLLECTIONS = [
  'OCM Genesis',
  'OCM GENESIS',
  'OCM Katoshi Prime',
  'OCM KATOSHI PRIME',
  'OCM Katoshi Classic',
  'OCM KATOSHI CLASSIC',
  'Multiverso Pass',
  'MULTIVERSO PASS',
  'Multiverse Pass',
  'MULTIVERSE PASS',
  'Seize CTRL',
  'SEIZE CTRL',
  'No Ordinary Kind',
  'N0 0RDINARY KIND',
  'Bitcoin Puppets',
  'BITCOIN PUPPETS',
  'The Wizards of Lords',
  'THE WIZARDS OF LORDS',
  'Yield Hacker Pass',
  'YIELD HACKER PASS',
  'Stack Sats',
  'STACK SATS'
];

// Interface para Ordinal
export interface Ordinal {
  id: string;
  number: number;
  address?: string;
  content_type?: string;
  content?: string;
  metadata?: {
    name?: string;
    description?: string;
    collection?: {
      name?: string;
      slug?: string;
    };
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
    [key: string]: any;
  };
  [key: string]: any;
}

// Função para normalizar nomes de coleções para comparação
export function normalizeCollectionName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Função para verificar se um Ordinal pertence a uma coleção premium
export function isOrdinalFromPremiumCollection(ordinal: Ordinal): boolean {
  // Normalizar nomes das coleções premium
  const normalizedPremiumCollections = PREMIUM_COLLECTIONS.map(normalizeCollectionName);
  
  // 1. Verificar no campo collection.name dos metadados
  if (ordinal.metadata?.collection?.name) {
    const collectionName = ordinal.metadata.collection.name;
    const normalizedName = normalizeCollectionName(collectionName);
    
    if (normalizedPremiumCollections.some(name => normalizedName.includes(name)) ||
        PREMIUM_COLLECTIONS.includes(collectionName)) {
      return true;
    }
  }
  
  // 2. Verificar no campo name dos metadados
  if (ordinal.metadata?.name) {
    const name = ordinal.metadata.name;
    const normalizedName = normalizeCollectionName(name);
    
    for (const collection of PREMIUM_COLLECTIONS) {
      if (name.includes(collection) || normalizedName.includes(normalizeCollectionName(collection))) {
        return true;
      }
    }
  }
  
  // 3. Verificar no campo content se for string
  if (ordinal.content && typeof ordinal.content === 'string') {
    const content = ordinal.content;
    const normalizedContent = normalizeCollectionName(content);
    
    for (const collection of PREMIUM_COLLECTIONS) {
      if (content.includes(collection) || normalizedContent.includes(normalizeCollectionName(collection))) {
        return true;
      }
    }
  }
  
  // 4. Verificar em atributos
  if (ordinal.metadata?.attributes && Array.isArray(ordinal.metadata.attributes)) {
    for (const attr of ordinal.metadata.attributes) {
      if (attr.value && typeof attr.value === 'string') {
        const value = attr.value;
        const normalizedValue = normalizeCollectionName(value);
        
        for (const collection of PREMIUM_COLLECTIONS) {
          if (value.includes(collection) || normalizedValue.includes(normalizeCollectionName(collection))) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}

// Função para buscar Ordinals de um endereço usando a API do Ordiscan
export async function fetchOrdinalsFromAddress(address: string): Promise<Ordinal[]> {
  try {
    // Buscar inscrições do endereço
    const endpoint = `/v1/address/${address}/inscriptions`;
    const data = await fetchOrdiscanData(endpoint);
    
    if (!data || !Array.isArray(data)) {
      console.error('Invalid data format from Ordiscan API');
      return [];
    }
    
    // Mapear os dados para o formato Ordinal
    return data.map((item: any) => ({
      id: item.inscription_id || item.id,
      number: item.inscription_number || item.number,
      address: item.owner_address || address,
      content_type: item.content_type,
      metadata: item.metadata || {},
      ...item
    }));
  } catch (error) {
    console.error('Error fetching ordinals from address:', error);
    return [];
  }
}

// Função para buscar Ordinals de um endereço usando a API do wallet
export async function fetchOrdinalsFromWallet(address: string, walletProvider: any): Promise<Ordinal[]> {
  try {
    if (!walletProvider || !walletProvider.getOrdinals) {
      throw new Error('Wallet provider does not support getOrdinals method');
    }
    
    const ordinals = await walletProvider.getOrdinals(address);
    
    if (!ordinals || !Array.isArray(ordinals)) {
      console.error('Invalid data format from wallet provider');
      return [];
    }
    
    return ordinals.map((ordinal: any) => ({
      id: ordinal.id || ordinal.inscription_id,
      number: ordinal.number || ordinal.inscription_number,
      address: address,
      content_type: ordinal.content_type,
      metadata: ordinal.metadata || {},
      ...ordinal
    }));
  } catch (error) {
    console.error('Error fetching ordinals from wallet:', error);
    return [];
  }
}

// Função para verificar se um endereço possui Ordinals de coleções premium
export async function checkPremiumAccess(address: string, walletProvider?: any): Promise<{
  hasAccess: boolean;
  premiumOrdinals: Ordinal[];
  premiumCollections: string[];
}> {
  try {
    // Tentar buscar Ordinals do wallet primeiro, se disponível
    let ordinals: Ordinal[] = [];
    
    if (walletProvider && walletProvider.getOrdinals) {
      try {
        ordinals = await fetchOrdinalsFromWallet(address, walletProvider);
      } catch (walletError) {
        console.error('Error fetching from wallet, falling back to API:', walletError);
      }
    }
    
    // Se não conseguir do wallet, tentar da API
    if (ordinals.length === 0) {
      ordinals = await fetchOrdinalsFromAddress(address);
    }
    
    // Verificar se algum Ordinal pertence a uma coleção premium
    const premiumOrdinals = ordinals.filter(isOrdinalFromPremiumCollection);
    
    // Extrair nomes das coleções premium encontradas
    const premiumCollections = premiumOrdinals
      .map(ordinal => {
        // Tentar extrair o nome da coleção de várias fontes possíveis
        if (ordinal.metadata?.collection?.name) {
          return ordinal.metadata.collection.name;
        }
        
        // Verificar no nome do Ordinal
        if (ordinal.metadata?.name) {
          for (const collection of PREMIUM_COLLECTIONS) {
            if (ordinal.metadata.name.includes(collection)) {
              return collection;
            }
          }
        }
        
        // Verificar nos atributos
        if (ordinal.metadata?.attributes && Array.isArray(ordinal.metadata.attributes)) {
          for (const attr of ordinal.metadata.attributes) {
            if (attr.trait_type === 'collection' || attr.trait_type === 'Collection') {
              return attr.value as string;
            }
          }
        }
        
        return 'Unknown Premium Collection';
      })
      .filter((value, index, self) => self.indexOf(value) === index); // Remover duplicados
    
    return {
      hasAccess: premiumOrdinals.length > 0,
      premiumOrdinals,
      premiumCollections
    };
  } catch (error) {
    console.error('Error checking premium access:', error);
    return {
      hasAccess: false,
      premiumOrdinals: [],
      premiumCollections: []
    };
  }
}
