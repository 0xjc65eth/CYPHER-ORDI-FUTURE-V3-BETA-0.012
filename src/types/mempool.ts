export interface MempoolState {
  pendingTransactions: number;
  averageFeeRate: number;
  mempoolSize: number;
  lastUpdated: string;
} 