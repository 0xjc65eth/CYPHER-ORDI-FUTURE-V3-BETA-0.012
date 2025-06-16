export interface RareSat {
  id: string;
  rarity: string;
  value: number;
  inscription?: string;
  type: string;
  satNumber: number;
  block: number;
  offset: number;
  address?: string;
}

export interface RareSatData {
  type: 'RareSatData';
  sats: RareSat[];
  totalValue: number;
  count: number;
}

export type RareSatCategory = 
  | 'vintage' 
  | 'block9' 
  | 'block78' 
  | 'pizza' 
  | 'palindrome' 
  | 'fibonacci' 
  | 'perfect_square' 
  | 'prime' 
  | 'alpha'
  | 'omega'
  | 'nakamoto'
  | 'epic'
  | 'legendary'
  | 'mythic';