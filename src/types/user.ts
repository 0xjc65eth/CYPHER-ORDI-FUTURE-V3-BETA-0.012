export interface UserState {
  address: string | null;
  nftData: {
    name: string;
    collection: string;
    image: string;
    isVerified: boolean;
  } | null;
  isConnected: boolean;
} 