/**
 * Neural Network Interfaces
 * 
 * This file contains interfaces for neural network models, predictions, and training data.
 */

/**
 * Neural model interface
 */
export interface NeuralModel {
  id: string;
  symbol: string;
  model_type: 'price_prediction' | 'trend_analysis' | 'sentiment_correlation';
  accuracy: number;
  last_trained: string;
  training_iterations: number;
  hyperparameters: Record<string, any>;
  features: string[];
}

/**
 * Neural prediction interface
 */
export interface NeuralPrediction {
  symbol: string;
  current_price: number;
  predicted_prices: {
    short_term: number; // 24 hours
    medium_term: number; // 7 days
    long_term: number; // 30 days
  };
  confidence: {
    short_term: number;
    medium_term: number;
    long_term: number;
  };
  factors: {
    technical: number; // -1 to 1
    fundamental: number; // -1 to 1
    sentiment: number; // -1 to 1
    market_correlation: number; // -1 to 1
    developer_activity: number; // -1 to 1
  };
  trend: 'bullish' | 'bearish' | 'neutral';
  supporting_data: {
    technical_indicators: {
      name: string;
      value: number;
      signal: 'buy' | 'sell' | 'neutral';
    }[];
    sentiment_analysis: {
      source: string;
      sentiment: number; // -1 to 1
      volume: number;
    }[];
    market_correlations: {
      symbol: string;
      correlation: number; // -1 to 1
    }[];
  };
  last_updated: string;
}

/**
 * Training data interface
 */
export interface TrainingData {
  id: string;
  symbol: string;
  timestamp: string;
  features: Record<string, number>;
  target: {
    price: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
}

/**
 * Market data interface
 */
export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  market_cap: number;
  volume_24h: number;
  change_percent_24h: number;
  change_percent_7d: number;
  high_24h: number;
  low_24h: number;
  supply: {
    circulating: number;
    total: number;
    max?: number;
  };
  social_sentiment?: number; // -1 to 1
  last_updated: string;
}

/**
 * Market prediction interface
 */
export interface MarketPrediction {
  id: string;
  symbol: string;
  timestamp: string;
  targetTimestamp: string;
  timeframe: '24h' | '7d' | '30d';
  predictedPrice: number;
  predictedTrend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  actualPrice?: number;
  actualTrend?: 'bullish' | 'bearish' | 'neutral';
  accuracy?: number;
  model: string;
}

/**
 * Neural network training metrics
 */
export interface TrainingMetrics {
  id: string;
  model_id: string;
  timestamp: string;
  epoch: number;
  loss: number;
  accuracy: number;
  val_loss: number;
  val_accuracy: number;
  learning_rate: number;
}

/**
 * Neural network training configuration
 */
export interface TrainingConfig {
  batchSize: number;
  epochs: number;
  learningRate: number;
  validationSplit: number;
  earlyStoppingPatience: number;
  featureColumns: string[];
  targetColumn: string;
  shuffle: boolean;
  timeSeriesLength?: number;
}

/**
 * Neural network model evaluation
 */
export interface ModelEvaluation {
  id: string;
  model_id: string;
  timestamp: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    mean_absolute_error?: number;
    mean_squared_error?: number;
    root_mean_squared_error?: number;
    r_squared?: number;
  };
  confusion_matrix?: number[][];
  roc_curve?: { fpr: number[]; tpr: number[]; thresholds: number[] };
  pr_curve?: { precision: number[]; recall: number[]; thresholds: number[] };
}

/**
 * Feature importance
 */
export interface FeatureImportance {
  id: string;
  model_id: string;
  timestamp: string;
  features: {
    name: string;
    importance: number;
  }[];
}

/**
 * Neural network architecture
 */
export interface NeuralNetworkArchitecture {
  id: string;
  model_id: string;
  layers: {
    type: string;
    units?: number;
    activation?: string;
    dropout?: number;
    filters?: number;
    kernel_size?: number | number[];
    pool_size?: number | number[];
    strides?: number | number[];
    padding?: string;
    input_shape?: number[];
    output_shape?: number[];
  }[];
  optimizer: string;
  loss: string;
  metrics: string[];
}

/**
 * Learning curve
 */
export interface LearningCurve {
  id: string;
  model_id: string;
  timestamp: string;
  training_size: number[];
  training_scores: number[];
  validation_scores: number[];
}

/**
 * Hyperparameter tuning result
 */
export interface HyperparameterTuningResult {
  id: string;
  model_id: string;
  timestamp: string;
  hyperparameters: Record<string, any>;
  score: number;
  rank: number;
}

/**
 * Neural network prediction log
 */
export interface PredictionLog {
  id: string;
  model_id: string;
  timestamp: string;
  input: Record<string, any>;
  output: Record<string, any>;
  actual?: Record<string, any>;
  error?: number;
}

/**
 * Neural network training job
 */
export interface TrainingJob {
  id: string;
  model_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  config: TrainingConfig;
  progress?: number;
  error?: string;
  result?: {
    accuracy: number;
    loss: number;
    training_time: number;
  };
}

/**
 * Neural network deployment
 */
export interface NeuralNetworkDeployment {
  id: string;
  model_id: string;
  version: string;
  status: 'active' | 'inactive';
  deployed_at: string;
  endpoint?: string;
  metrics?: {
    requests: number;
    errors: number;
    latency: number;
    last_updated: string;
  };
}
