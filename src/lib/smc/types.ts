// SMC Analysis Types

export interface OrderBlock {
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  timestamp: Date;
  strength: number; // 0-100
  tested: boolean;
}

export interface FairValueGap {
  type: 'bullish' | 'bearish';
  top: number;
  bottom: number;
  timestamp: Date;
  filled: boolean;
}

export interface BreakOfStructure {
  type: 'bullish' | 'bearish';
  level: number;
  timestamp: Date;
  confirmed: boolean;
}

export interface SMCAnalysisResult {
  orderBlocks: OrderBlock[];
  fairValueGaps: FairValueGap[];
  breakOfStructure: BreakOfStructure[];
  currentTrend: 'bullish' | 'bearish' | 'neutral';
  keyLevels: {
    support: number[];
    resistance: number[];
  };
}