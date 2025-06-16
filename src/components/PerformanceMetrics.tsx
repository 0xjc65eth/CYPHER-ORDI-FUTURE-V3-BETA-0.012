/**
 * PerformanceMetrics Component
 * 
 * Componente para exibir métricas de desempenho de portfólio com gráficos,
 * estatísticas e análises preditivas.
 */

import React, { useState, useEffect } from 'react';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';
import { portfolioService, PerformanceData } from '../services/portfolio-service';
import { enhancedNeuralService } from '../services/enhanced-neural-service';
import { walletConnector } from '../services/wallet-connector';

// ...código truncado para brevidade...