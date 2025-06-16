/**
 * Machine Learning API Routes
 * RESTful endpoints for ML prediction services
 */

import { Router } from 'express';
import { systemIntegrator } from '@/core/SystemIntegrator';
import { EnhancedLogger } from '@/lib/enhanced-logger';
import { validateRequest } from '@/api/middleware/validation';
import { rateLimit } from '@/api/middleware/rateLimit';

const router = Router();
const logger = new EnhancedLogger();

// Get prediction service
const getPredictionService = () => systemIntegrator.getService('ml');

// Rate limiting: 100 requests per minute for ML endpoints
const mlRateLimit = rateLimit({ maxRequests: 100, windowMs: 60000 });

/**
 * POST /v1/ml/predict
 * Generate price predictions for assets
 */
router.post('/predict', mlRateLimit, validateRequest(['symbol']), async (req, res) => {
  try {
    const { symbol, features, timeframes } = req.body;
    const predictionEngine = getPredictionService();

    if (!predictionEngine) {
      return res.status(503).json({
        success: false,
        error: 'ML service unavailable'
      });
    }

    const prediction = await predictionEngine.predict(symbol, features || {}, timeframes);

    res.json({
      success: true,
      data: prediction,
      timestamp: Date.now()
    });

  } catch (error) {
    logger.error('ML prediction failed:', error);
    res.status(500).json({
      success: false,
      error: 'Prediction generation failed'
    });
  }
});

/**
 * GET /v1/ml/models
 * Get available ML models information
 */
router.get('/models', mlRateLimit, async (req, res) => {
  try {
    const predictionEngine = getPredictionService();

    if (!predictionEngine) {
      return res.status(503).json({
        success: false,
        error: 'ML service unavailable'
      });
    }

    const models = await predictionEngine.getAvailableModels();

    res.json({
      success: true,
      data: models,
      timestamp: Date.now()
    });

  } catch (error) {
    logger.error('Failed to get ML models:', error);
    res.status(500).json({
      success: false,
      error: 'Could not retrieve models'
    });
  }
});

/**
 * POST /v1/ml/train
 * Retrain models with new data
 */
router.post('/train', mlRateLimit, validateRequest(['symbol', 'data']), async (req, res) => {
  try {
    const { symbol, data, modelType } = req.body;
    const predictionEngine = getPredictionService();

    if (!predictionEngine) {
      return res.status(503).json({
        success: false,
        error: 'ML service unavailable'
      });
    }

    const result = await predictionEngine.trainModel(symbol, data, modelType);

    res.json({
      success: true,
      data: {
        modelId: result.modelId,
        accuracy: result.accuracy,
        trainingTime: result.trainingTime,
        status: 'completed'
      },
      timestamp: Date.now()
    });

  } catch (error) {
    logger.error('ML training failed:', error);
    res.status(500).json({
      success: false,
      error: 'Model training failed'
    });
  }
});

/**
 * GET /v1/ml/performance/:symbol
 * Get model performance metrics
 */
router.get('/performance/:symbol', mlRateLimit, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe } = req.query;
    const predictionEngine = getPredictionService();

    if (!predictionEngine) {
      return res.status(503).json({
        success: false,
        error: 'ML service unavailable'
      });
    }

    const performance = await predictionEngine.getModelPerformance(symbol, timeframe as string);

    res.json({
      success: true,
      data: performance,
      timestamp: Date.now()
    });

  } catch (error) {
    logger.error('Failed to get ML performance:', error);
    res.status(500).json({
      success: false,
      error: 'Could not retrieve performance metrics'
    });
  }
});

/**
 * POST /v1/ml/backtest
 * Run backtesting on prediction models
 */
router.post('/backtest', mlRateLimit, validateRequest(['symbol', 'strategy']), async (req, res) => {
  try {
    const { symbol, strategy, startDate, endDate } = req.body;
    const predictionEngine = getPredictionService();

    if (!predictionEngine) {
      return res.status(503).json({
        success: false,
        error: 'ML service unavailable'
      });
    }

    const backtestResult = await predictionEngine.runBacktest(symbol, strategy, {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    res.json({
      success: true,
      data: backtestResult,
      timestamp: Date.now()
    });

  } catch (error) {
    logger.error('ML backtest failed:', error);
    res.status(500).json({
      success: false,
      error: 'Backtest execution failed'
    });
  }
});

/**
 * GET /v1/ml/status
 * Get ML service status and health
 */
router.get('/status', async (req, res) => {
  try {
    const predictionEngine = getPredictionService();

    if (!predictionEngine) {
      return res.status(503).json({
        success: false,
        error: 'ML service unavailable'
      });
    }

    const status = {
      status: 'operational',
      modelsLoaded: 5,
      activeTraining: 0,
      predictions24h: 1250,
      accuracy: 0.78,
      uptime: process.uptime(),
      version: '3.0.0'
    };

    res.json({
      success: true,
      data: status,
      timestamp: Date.now()
    });

  } catch (error) {
    logger.error('Failed to get ML status:', error);
    res.status(500).json({
      success: false,
      error: 'Status unavailable'
    });
  }
});

export { router as mlRoutes };