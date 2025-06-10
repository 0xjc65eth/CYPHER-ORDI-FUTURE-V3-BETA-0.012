import { Portfolio, AssetHolding, Transaction } from '@/types/portfolio';
import { format } from 'date-fns';

export class PortfolioExporter {
  async exportToCSV(portfolio: Portfolio): Promise<void> {
    const csvData = this.generateCSVData(portfolio);
    this.downloadFile(csvData, 'portfolio_report.csv', 'text/csv');
  }

  async exportToPDF(portfolio: Portfolio): Promise<void> {
    const htmlContent = this.generateHTMLReport(portfolio);
    
    // Convert HTML to PDF using browser's print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Add styles and print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
  }

  async exportTransactionsCSV(transactions: Transaction[]): Promise<void> {
    const headers = [
      'Date',
      'Type',
      'Asset',
      'Amount',
      'Price',
      'Total Value',
      'Fee (USD)',
      'P&L',
      'Status',
      'Transaction ID'
    ];

    const rows = transactions.map(tx => [
      format(new Date(tx.date), 'yyyy-MM-dd HH:mm:ss'),
      tx.type,
      tx.asset,
      tx.amount.toString(),
      tx.price.toString(),
      tx.totalValue.toString(),
      tx.feeUSD.toString(),
      tx.realizedPNL?.toString() || '',
      tx.status,
      tx.txid
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    this.downloadFile(csvContent, 'transactions.csv', 'text/csv');
  }

  async exportHoldingsCSV(holdings: AssetHolding[]): Promise<void> {
    const headers = [
      'Asset',
      'Type',
      'Amount',
      'Avg Buy Price',
      'Current Price',
      'Total Cost',
      'Current Value',
      'Unrealized P&L',
      'Unrealized P&L %',
      'Realized P&L',
      'Total P&L',
      'Total P&L %',
      'Day Change %',
      'Week Change %',
      'Month Change %',
      'First Purchase',
      'Last Purchase',
      'Buy Count',
      'Sell Count',
      'Volatility 30d',
      'Sharpe Ratio'
    ];

    const rows = holdings.map(holding => [
      holding.asset,
      holding.assetType,
      holding.totalAmount.toString(),
      holding.averageBuyPrice.toString(),
      holding.currentPrice.toString(),
      holding.totalCost.toString(),
      holding.currentValue.toString(),
      holding.unrealizedPNL.toString(),
      holding.unrealizedPNLPercentage.toString(),
      holding.realizedPNL.toString(),
      holding.totalPNL.toString(),
      holding.totalPNLPercentage.toString(),
      holding.dayChangePercentage.toString(),
      holding.weekChangePercentage.toString(),
      holding.monthChangePercentage.toString(),
      holding.firstPurchaseDate,
      holding.lastPurchaseDate,
      holding.buyCount.toString(),
      holding.sellCount.toString(),
      holding.volatility30d.toString(),
      holding.sharpeRatio.toString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    this.downloadFile(csvContent, 'holdings.csv', 'text/csv');
  }

  private generateCSVData(portfolio: Portfolio): string {
    const summary = [
      ['Portfolio Summary', ''],
      ['Address', portfolio.address],
      ['Last Updated', portfolio.lastUpdated],
      ['Total Value', portfolio.metrics.totalValue.toString()],
      ['Total Cost', portfolio.metrics.totalCost.toString()],
      ['Total P&L', portfolio.metrics.totalPNL.toString()],
      ['Total P&L %', portfolio.metrics.totalPNLPercentage.toString()],
      ['Unrealized P&L', portfolio.metrics.unrealizedPNL.toString()],
      ['Realized P&L', portfolio.metrics.realizedPNL.toString()],
      ['Day Return %', portfolio.metrics.dayReturnPercentage.toString()],
      ['Week Return %', portfolio.metrics.weekReturnPercentage.toString()],
      ['Month Return %', portfolio.metrics.monthReturnPercentage.toString()],
      ['Year Return %', portfolio.metrics.yearReturnPercentage.toString()],
      ['Volatility', portfolio.metrics.volatility.toString()],
      ['Sharpe Ratio', portfolio.metrics.sharpeRatio.toString()],
      ['Max Drawdown', portfolio.metrics.maxDrawdown.toString()],
      ['Win Rate', portfolio.metrics.winRate.toString()],
      ['Total Transactions', portfolio.metrics.totalTransactions.toString()],
      ['Total Fees', portfolio.metrics.totalFees.toString()],
      ['', ''], // Empty row
      ['Holdings', ''],
      ['Asset', 'Current Value', 'P&L', 'P&L %', 'Day Change %']
    ];

    const holdings = portfolio.holdings.map(h => [
      h.asset,
      h.currentValue.toString(),
      h.totalPNL.toString(),
      h.totalPNLPercentage.toString(),
      h.dayChangePercentage.toString()
    ]);

    const performance = [
      ['', ''], // Empty row
      ['Performance History', ''],
      ['Date', 'Total Value', 'P&L', 'P&L %', 'Day Return %']
    ];

    const performanceData = portfolio.performanceHistory.slice(-30).map(p => [
      p.date,
      p.totalValue.toString(),
      p.pnl.toString(),
      p.pnlPercentage.toString(),
      p.dayReturnPercentage.toString()
    ]);

    const allData = [...summary, ...holdings, ...performance, ...performanceData];
    
    return allData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  }

  private generateHTMLReport(portfolio: Portfolio): string {
    const riskMetrics = this.calculateAdvancedRiskMetrics(portfolio);
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Portfolio Report - ${portfolio.address}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f97316;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #f97316;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #f97316;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    .section {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .text-right {
      text-align: right;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body { margin: 0; }
      .header { page-break-after: avoid; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CYPHER ORDI FUTURE</div>
    <h1>Professional Portfolio Report</h1>
    <div class="subtitle">
      Address: ${portfolio.address}<br>
      Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm:ss')}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Portfolio Overview</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Total Value</div>
        <div class="metric-value">$${portfolio.metrics.totalValue.toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total P&L</div>
        <div class="metric-value ${portfolio.metrics.totalPNL >= 0 ? 'positive' : 'negative'}">
          ${portfolio.metrics.totalPNL >= 0 ? '+' : ''}$${portfolio.metrics.totalPNL.toFixed(2)}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Return %</div>
        <div class="metric-value ${portfolio.metrics.totalPNLPercentage >= 0 ? 'positive' : 'negative'}">
          ${portfolio.metrics.totalPNLPercentage >= 0 ? '+' : ''}${portfolio.metrics.totalPNLPercentage.toFixed(2)}%
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Win Rate</div>
        <div class="metric-value">${portfolio.metrics.winRate.toFixed(1)}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Risk Metrics</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Sharpe Ratio</div>
        <div class="metric-value">${riskMetrics.sharpeRatio}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Sortino Ratio</div>
        <div class="metric-value">${riskMetrics.sortinoRatio}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Max Drawdown</div>
        <div class="metric-value negative">-${riskMetrics.maxDrawdown}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">VaR (95%)</div>
        <div class="metric-value">${riskMetrics.valueAtRisk}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Holdings</h2>
    <table>
      <thead>
        <tr>
          <th>Asset</th>
          <th class="text-right">Amount</th>
          <th class="text-right">Avg Buy Price</th>
          <th class="text-right">Current Price</th>
          <th class="text-right">Value</th>
          <th class="text-right">P&L</th>
          <th class="text-right">% of Portfolio</th>
        </tr>
      </thead>
      <tbody>
        ${portfolio.holdings.map(holding => `
          <tr>
            <td>${holding.asset}</td>
            <td class="text-right">${holding.totalAmount.toFixed(8)}</td>
            <td class="text-right">$${holding.averageBuyPrice.toLocaleString()}</td>
            <td class="text-right">$${holding.currentPrice.toLocaleString()}</td>
            <td class="text-right">$${holding.currentValue.toLocaleString()}</td>
            <td class="text-right ${holding.totalPNL >= 0 ? 'positive' : 'negative'}">
              ${holding.totalPNL >= 0 ? '+' : ''}$${holding.totalPNL.toFixed(2)}
              (${holding.totalPNLPercentage.toFixed(2)}%)
            </td>
            <td class="text-right">${((holding.currentValue / portfolio.metrics.totalValue) * 100).toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">Recent Transactions</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Asset</th>
          <th class="text-right">Amount</th>
          <th class="text-right">Price</th>
          <th class="text-right">Total Value</th>
        </tr>
      </thead>
      <tbody>
        ${portfolio.transactions.slice(-10).map(tx => `
          <tr>
            <td>${format(new Date(tx.date), 'MMM dd, yyyy')}</td>
            <td>${tx.type.toUpperCase()}</td>
            <td>${tx.asset}</td>
            <td class="text-right">${tx.amount?.toFixed(8) || 'N/A'}</td>
            <td class="text-right">$${tx.price?.toLocaleString() || 'N/A'}</td>
            <td class="text-right">$${tx.totalValue?.toLocaleString() || 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">AI Insights</h2>
    ${portfolio.aiInsights.slice(0, 5).map(insight => `
      <div class="metric-card" style="margin-bottom: 15px;">
        <div class="metric-label">${insight.type.toUpperCase()} - Confidence: ${insight.confidence}%</div>
        <div style="font-weight: bold; margin-bottom: 5px;">${insight.title}</div>
        <div style="font-size: 14px; color: #666;">${insight.description}</div>
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p>This report was generated by CYPHER ORDI FUTURE Professional Analytics</p>
    <p>Report generated on ${format(new Date(), 'MMMM dd, yyyy')} at ${format(new Date(), 'HH:mm:ss')}</p>
    <p style="font-size: 10px; margin-top: 10px;">
      This report is for informational purposes only and does not constitute financial advice.
      Past performance does not guarantee future results. Cryptocurrency investments carry significant risk.
    </p>
  </div>
</body>
</html>`;
  }

  private calculateAdvancedRiskMetrics(portfolio: Portfolio): any {
    if (!portfolio.performanceHistory || portfolio.performanceHistory.length < 2) {
      return {
        sharpeRatio: 0,
        sortinoRatio: 0,
        maxDrawdown: 0,
        valueAtRisk: 0
      };
    }

    const returns = portfolio.performanceHistory.map((d, i) => {
      if (i === 0) return 0;
      const prevValue = portfolio.performanceHistory[i - 1].totalValue;
      return prevValue > 0 ? (d.totalValue - prevValue) / prevValue : 0;
    }).slice(1);

    const riskFreeRate = 0.05;
    const periodsPerYear = 365;
    const dailyRiskFree = riskFreeRate / periodsPerYear;

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Sharpe Ratio
    const sharpeRatio = stdDev > 0 ? ((avgReturn - dailyRiskFree) * Math.sqrt(periodsPerYear)) / (stdDev * Math.sqrt(periodsPerYear)) : 0;

    // Sortino Ratio
    const downsideReturns = returns.filter(r => r < dailyRiskFree);
    const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r - dailyRiskFree, 2), 0) / downsideReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance);
    const sortinoRatio = downsideDeviation > 0 ? ((avgReturn - dailyRiskFree) * Math.sqrt(periodsPerYear)) / (downsideDeviation * Math.sqrt(periodsPerYear)) : 0;

    // Maximum Drawdown
    let peak = portfolio.performanceHistory[0].totalValue;
    let maxDrawdown = 0;
    portfolio.performanceHistory.forEach(point => {
      if (point.totalValue > peak) peak = point.totalValue;
      const drawdown = peak > 0 ? (peak - point.totalValue) / peak : 0;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    // Value at Risk (95% confidence)
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const varIndex = Math.floor(sortedReturns.length * 0.05);
    const valueAtRisk = Math.abs(sortedReturns[varIndex] || 0) * 100;

    return {
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      sortinoRatio: Math.round(sortinoRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
      valueAtRisk: Math.round(valueAtRisk * 100) / 100
    };
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}