/**
 * Portfolio Services Export Hub
 * Comprehensive portfolio management for CYPHER ORDi Future V3
 */

// Xverse Portfolio Service
export { XversePortfolioService, xversePortfolio } from './XversePortfolioService';

// Types
export type {
  XverseWallet,
  XverseAsset,
  XverseTransaction,
  PortfolioAnalytics,
  PortfolioRecommendation,
  TaxReport
} from './XversePortfolioService';

/**
 * Quick Start Guide for Portfolio Services
 * 
 * 1. Basic Setup:
 *    ```typescript
 *    import { xversePortfolio } from '@/services/portfolio';
 *    
 *    // Connect to Xverse
 *    await xversePortfolio.connect();
 *    
 *    // Get wallet info
 *    const wallet = await xversePortfolio.getWallet('bc1q...');
 *    
 *    // Get portfolio analytics
 *    const analytics = await xversePortfolio.getPortfolioAnalytics('bc1q...');
 *    ```
 * 
 * 2. Asset Management:
 *    ```typescript
 *    // Get all assets
 *    const assets = await xversePortfolio.getAssets('bc1q...');
 *    
 *    // Get recommendations
 *    const recommendations = await xversePortfolio.getRecommendations(
 *      'bc1q...',
 *      'moderate' // risk profile
 *    );
 *    ```
 * 
 * 3. Tax Reporting:
 *    ```typescript
 *    // Generate tax report
 *    const taxReport = await xversePortfolio.generateTaxReport(
 *      'bc1q...',
 *      new Date('2024-01-01'),
 *      new Date('2024-12-31'),
 *      'us' // jurisdiction
 *    );
 *    ```
 * 
 * 4. Portfolio Monitoring:
 *    ```typescript
 *    // Set up alerts
 *    await xversePortfolio.startPortfolioMonitoring('bc1q...', {
 *      priceAlerts: [
 *        { asset: 'BTC', threshold: 100000, type: 'above' }
 *      ],
 *      performanceAlerts: {
 *        threshold: 10,
 *        timeframe: '1d'
 *      },
 *      riskAlerts: {
 *        maxDrawdown: 20,
 *        volatilityThreshold: 30
 *      }
 *    });
 *    
 *    // Listen to alerts
 *    xversePortfolio.on('alert', (alert) => {
 *      console.log('Portfolio alert:', alert);
 *    });
 *    ```
 * 
 * 5. Portfolio Rebalancing:
 *    ```typescript
 *    // Rebalance portfolio
 *    const rebalancePlan = await xversePortfolio.rebalancePortfolio(
 *      'bc1q...',
 *      {
 *        bitcoin: 40,
 *        ordinals: 25,
 *        runes: 20,
 *        brc20: 10,
 *        rareSats: 5
 *      }
 *    );
 *    ```
 * 
 * Key Features:
 * ✅ Real-time portfolio analytics
 * ✅ Advanced performance metrics (ROI, IRR, Sharpe Ratio)
 * ✅ Risk assessment and management
 * ✅ Tax reporting and optimization
 * ✅ Personalized recommendations
 * ✅ Portfolio monitoring and alerts
 * ✅ Automated rebalancing
 * ✅ Multi-asset support (BTC, Ordinals, Runes, BRC-20)
 * ✅ WebSocket real-time updates
 * ✅ Comprehensive caching system
 */