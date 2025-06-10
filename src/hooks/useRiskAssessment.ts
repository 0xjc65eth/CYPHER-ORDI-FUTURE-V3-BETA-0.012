import { useState, useEffect } from 'react';

interface RiskFactor {
  name: string;
  value: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface RiskAssessmentData {
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number;
  factors: RiskFactor[];
}

export function useRiskAssessment() {
  const [data, setData] = useState<{ assessment: RiskAssessmentData | null; loading: boolean }>({
    assessment: null,
    loading: true
  });

  useEffect(() => {
    const assessment: RiskAssessmentData = {
      overallRisk: 'medium',
      riskScore: 65,
      factors: [
        { name: 'Market Volatility', value: 'High', impact: 'negative' },
        { name: 'Portfolio Diversification', value: 'Good', impact: 'positive' },
        { name: 'Leverage Usage', value: 'Low', impact: 'positive' },
        { name: 'Correlation Risk', value: 'Medium', impact: 'neutral' },
        { name: 'Liquidity Risk', value: 'Low', impact: 'positive' }
      ]
    };
    setData({ assessment, loading: false });
  }, []);

  return data;
}