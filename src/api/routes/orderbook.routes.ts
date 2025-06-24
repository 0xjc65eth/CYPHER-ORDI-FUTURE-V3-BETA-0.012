/**
 * OrderBook API Routes
 * RESTful endpoints for order management and trading
 */

import { Router } from 'express';
import { systemIntegrator } from '@/core/SystemIntegrator';
import { EnhancedLogger } from '@/lib/enhanced-logger';
import { validateRequest } from '@/api/middleware/validation';
import { rateLimit } from '@/api/middleware/rateLimit';

const router = Router();

// Get orderbook service
const getOrderBookService = () => systemIntegrator.getService('orderbook');

// Rate limiting: 500 requests per minute for trading endpoints
const tradingRateLimit = rateLimit({ maxRequests: 500, windowMs: 60000 });

/**
 * POST /v1/orderbook/order
 * Place a new trading order
 */
router.post('/order', tradingRateLimit, validateRequest(['symbol', 'side', 'type', 'quantity']), async (req, res) => {
  try {
    const orderRequest = req.body;
    const orderBookEngine = getOrderBookService();

    if (!orderBookEngine) {
      return res.status(503).json({
        success: false,
        error: 'OrderBook service unavailable'
      });
    }

    const result = await orderBookEngine.placeOrder(orderRequest);

    res.json({
      success: true,
      data: {
        orderId: result.order.id,
        status: result.order.status,
        fills: result.fills,
        remainingQuantity: result.order.remainingQuantity
      },
      timestamp: Date.now()
    });

  } catch (error) {
    EnhancedLogger.error('Order placement failed:', error);
    res.status(500).json({
      success: false,
      error: 'Order placement failed'
    });
  }
});

/**
 * DELETE /v1/orderbook/order/:orderId
 * Cancel an existing order
 */
router.delete('/order/:orderId', tradingRateLimit, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;
    const orderBookEngine = getOrderBookService();

    if (!orderBookEngine) {
      return res.status(503).json({
        success: false,
        error: 'OrderBook service unavailable'
      });
    }

    const success = await orderBookEngine.cancelOrder(orderId, userId);

    res.json({
      success,
      data: {
        orderId,
        status: success ? 'cancelled' : 'failed'
      },
      timestamp: Date.now()
    });

  } catch (error) {
    EnhancedLogger.error('Order cancellation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Order cancellation failed'
    });
  }
});

/**
 * GET /v1/orderbook/:symbol
 * Get order book depth for a symbol
 */
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { depth = 20 } = req.query;
    const orderBookEngine = getOrderBookService();

    if (!orderBookEngine) {
      return res.status(503).json({
        success: false,
        error: 'OrderBook service unavailable'
      });
    }

    const orderBook = await orderBookEngine.getOrderBook(symbol, parseInt(depth as string));

    res.json({
      success: true,
      data: {
        symbol,
        bids: orderBook.bids,
        asks: orderBook.asks,
        spread: orderBook.spread,
        depth: orderBook.totalDepth,
        lastUpdate: orderBook.lastUpdate
      },
      timestamp: Date.now()
    });

  } catch (error) {
    EnhancedLogger.error('Failed to get order book:', error);
    res.status(500).json({
      success: false,
      error: 'Could not retrieve order book'
    });
  }
});

/**
 * GET /v1/orderbook/orders/:userId
 * Get user's active orders
 */
router.get('/orders/:userId', tradingRateLimit, async (req, res) => {
  try {
    const { userId } = req.params;
    const { symbol, status } = req.query;
    const orderBookEngine = getOrderBookService();

    if (!orderBookEngine) {
      return res.status(503).json({
        success: false,
        error: 'OrderBook service unavailable'
      });
    }

    const orders = await orderBookEngine.getUserOrders(userId, {
      symbol: symbol as string,
      status: status as any
    });

    res.json({
      success: true,
      data: orders,
      count: orders.length,
      timestamp: Date.now()
    });

  } catch (error) {
    EnhancedLogger.error('Failed to get user orders:', error);
    res.status(500).json({
      success: false,
      error: 'Could not retrieve orders'
    });
  }
});

/**
 * GET /v1/orderbook/trades/:symbol
 * Get recent trades for a symbol
 */
router.get('/trades/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 50 } = req.query;
    const orderBookEngine = getOrderBookService();

    if (!orderBookEngine) {
      return res.status(503).json({
        success: false,
        error: 'OrderBook service unavailable'
      });
    }

    const trades = await orderBookEngine.getRecentTrades(symbol, parseInt(limit as string));

    res.json({
      success: true,
      data: trades,
      count: trades.length,
      timestamp: Date.now()
    });

  } catch (error) {
    EnhancedLogger.error('Failed to get trades:', error);
    res.status(500).json({
      success: false,
      error: 'Could not retrieve trades'
    });
  }
});

/**
 * GET /v1/orderbook/stats/:symbol
 * Get trading statistics for a symbol
 */
router.get('/stats/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const orderBookEngine = getOrderBookService();

    if (!orderBookEngine) {
      return res.status(503).json({
        success: false,
        error: 'OrderBook service unavailable'
      });
    }

    const stats = await orderBookEngine.getTradingStats(symbol);

    res.json({
      success: true,
      data: stats,
      timestamp: Date.now()
    });

  } catch (error) {
    EnhancedLogger.error('Failed to get trading stats:', error);
    res.status(500).json({
      success: false,
      error: 'Could not retrieve statistics'
    });
  }
});

/**
 * PUT /v1/orderbook/order/:orderId
 * Modify an existing order
 */
router.put('/order/:orderId', tradingRateLimit, validateRequest(['quantity']), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { quantity, price, userId } = req.body;
    const orderBookEngine = getOrderBookService();

    if (!orderBookEngine) {
      return res.status(503).json({
        success: false,
        error: 'OrderBook service unavailable'
      });
    }

    const result = await orderBookEngine.modifyOrder(orderId, { quantity, price }, userId);

    res.json({
      success: true,
      data: {
        orderId,
        newQuantity: result.quantity,
        newPrice: result.price,
        status: result.status
      },
      timestamp: Date.now()
    });

  } catch (error) {
    EnhancedLogger.error('Order modification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Order modification failed'
    });
  }
});

export { router as orderbookRoutes };