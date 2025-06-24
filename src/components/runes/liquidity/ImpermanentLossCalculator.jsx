import React, { useState } from 'react';
import { useImpermanentLoss, useFeesVsImpermanentLoss } from '../../../hooks/liquidity/useImpermanentLoss';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiCalculator, FiTrendingDown, FiDollarSign, FiPercent, FiInfo } from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ImpermanentLossCalculator = () => {
  const [inputs, setInputs] = useState({
    initialPrice: 50000,
    currentPrice: 55000,
    token0Amount: 1,
    token1Amount: 50000,
    feesEarned: 500,
    daysInPool: 30
  });

  const {
    impermanentLoss,
    hodlValue,
    liquidityValue,
    priceRatio,
    scenarios,
    level,
    formatCurrency,
    formatPercentage
  } = useImpermanentLoss(
    inputs.initialPrice,
    inputs.currentPrice,
    inputs.token0Amount,
    inputs.token1Amount
  );

  const {
    netGain,
    breakEvenFees,
    projectedAnnualReturn,
    recommendation,
    isPositive,
    daysToBreakEven
  } = useFeesVsImpermanentLoss(
    inputs.feesEarned,
    impermanentLoss,
    inputs.daysInPool,
    inputs.token0Amount * inputs.initialPrice + inputs.token1Amount
  );

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  // Dados para o gráfico
  const chartData = {
    labels: scenarios.map(s => `${s.priceChange > 0 ? '+' : ''}${s.priceChange.toFixed(0)}%`),
    datasets: [
      {
        label: 'Impermanent Loss (%)',
        data: scenarios.map(s => s.impermanentLoss),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Impermanent Loss por Mudança de Preço'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `IL: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Mudança de Preço (%)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Impermanent Loss (%)'
        },
        beginAtZero: false
      }
    }
  };

  const getLevelColor = (level) => {
    switch (level.level) {
      case 'minimal': return 'text-green-600 dark:text-green-400';
      case 'low': return 'text-yellow-600 dark:text-yellow-400';
      case 'moderate': return 'text-orange-600 dark:text-orange-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'extreme': return 'text-red-700 dark:text-red-300';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation.color) {
      case 'green': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'yellow': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'red': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FiCalculator className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Calculadora de Impermanent Loss
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Parâmetros da Posição
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço Inicial ($)
                </label>
                <input
                  type="number"
                  value={inputs.initialPrice}
                  onChange={(e) => handleInputChange('initialPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço Atual ($)
                </label>
                <input
                  type="number"
                  value={inputs.currentPrice}
                  onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="55000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantidade Token A
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.token0Amount}
                  onChange={(e) => handleInputChange('token0Amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="1.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantidade Token B ($)
                </label>
                <input
                  type="number"
                  value={inputs.token1Amount}
                  onChange={(e) => handleInputChange('token1Amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Taxas Ganhas ($)
                </label>
                <input
                  type="number"
                  value={inputs.feesEarned}
                  onChange={(e) => handleInputChange('feesEarned', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dias no Pool
                </label>
                <input
                  type="number"
                  value={inputs.daysInPool}
                  onChange={(e) => handleInputChange('daysInPool', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Análise dos Resultados
          </h3>
          
          <div className="space-y-4">
            {/* Impermanent Loss */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Impermanent Loss
                </span>
                <span className={`text-lg font-bold ${getLevelColor(level)}`}>
                  {formatPercentage(impermanentLoss)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  level.level === 'minimal' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  level.level === 'low' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  level.level === 'moderate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {level.description}
                </span>
                <FiInfo className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Comparação de Valores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                  <FiDollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">HODL</span>
                </div>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(hodlValue)}
                </p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                  <FiTrendingDown className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Liquidez</span>
                </div>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(liquidityValue)}
                </p>
              </div>
            </div>

            {/* Ganho Líquido */}
            <div className={`p-4 rounded-lg border ${
              isPositive 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ganho Líquido (com taxas)
                </span>
                <span className={`text-lg font-bold ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isPositive ? '+' : ''}{formatCurrency(netGain)}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Taxas ganhas menos impermanent loss
              </p>
            </div>

            {/* Projeção Anual */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Retorno Anual Projetado
                </span>
                <span className={`font-bold ${
                  projectedAnnualReturn > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercentage(projectedAnnualReturn)}
                </span>
              </div>
            </div>

            {/* Taxas para Break-even */}
            {breakEvenFees > inputs.feesEarned && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Taxas para Break-even
                  </span>
                  <span className="font-bold text-yellow-600 dark:text-yellow-400">
                    {formatCurrency(breakEvenFees)}
                  </span>
                </div>
                {daysToBreakEven > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    ~{daysToBreakEven} dias no ritmo atual
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recomendação */}
      <div className={`p-4 rounded-lg border ${getRecommendationColor(recommendation)}`}>
        <div className="flex items-center gap-3">
          <FiInfo className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold mb-1">Recomendação</h4>
            <p className="text-sm">{recommendation.message}</p>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cenários de Impermanent Loss
        </h3>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Tabela de Cenários */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tabela de Cenários
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mudança de Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Novo Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Impermanent Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valor HODL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valor Liquidez
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {scenarios.map((scenario, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {scenario.priceChange > 0 ? '+' : ''}{scenario.priceChange.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(scenario.price)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    scenario.impermanentLoss < -0.1 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {formatPercentage(scenario.impermanentLoss)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(scenario.hodlValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(scenario.liquidityValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ImpermanentLossCalculator;