'use client'

import { useState, useEffect } from 'react'
import { useDecisionVariables } from '@/hooks/useDecisionVariables'
import { RiLineChartLine, RiExchangeDollarLine, RiScales3Line, RiPulseLine, RiChatSmileLine, RiShieldLine } from 'react-icons/ri'

export function DecisionVariablesCard() {
  const [mounted, setMounted] = useState(false)
  const { data: variables, isLoading } = useDecisionVariables()

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate overall market bias based on decision variables
  const calculateMarketBias = () => {
    if (!mounted || isLoading) return { bias: 'Neutral', confidence: 'Medium' };

    let bullishFactors = 0;
    let bearishFactors = 0;

    // Funding rate
    if (parseFloat(variables?.fundingRate || '0') > 0.01) bearishFactors++;
    else if (parseFloat(variables?.fundingRate || '0') < -0.01) bullishFactors++;

    // Long/Short ratio
    if (parseFloat(variables?.longShortRatio || '0') > 1.5) bullishFactors++;
    else if (parseFloat(variables?.longShortRatio || '0') < 0.8) bearishFactors++;

    // Volatility
    if (parseFloat(variables?.volatilityIndex?.replace('%', '') || '0') > 4) bearishFactors++;

    // Social sentiment
    if (variables?.socialSentiment === 'Positive') bullishFactors++;
    else if (variables?.socialSentiment === 'Negative') bearishFactors++;

    // Network health
    if (variables?.networkHealth === 'Strong') bullishFactors++;
    else if (variables?.networkHealth === 'Weak') bearishFactors++;

    // Calculate bias
    let bias = 'Neutral';
    let confidence = 'Medium';

    if (bullishFactors > bearishFactors + 1) bias = 'Bullish';
    else if (bearishFactors > bullishFactors + 1) bias = 'Bearish';

    // Calculate confidence
    const difference = Math.abs(bullishFactors - bearishFactors);
    if (difference >= 3) confidence = 'High';
    else if (difference <= 1) confidence = 'Low';

    return { bias, confidence };
  };

  const marketBias = calculateMarketBias();

  return (
    <div className="bg-gradient-to-br from-[#1A1A3A] to-[#2A2A5A] border border-amber-500/20 rounded-lg overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/20">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-white font-medium">Decision Variables & Insights</h3>
        </div>
        <div className="px-2 py-1 rounded-lg bg-amber-500/20 text-xs font-bold text-amber-300 flex items-center">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse mr-1"></span>
          Real-time
        </div>
      </div>

      <div className="p-4">
        {/* Market Bias Summary */}
        <div className={`mb-4 p-3 rounded-lg border ${
          marketBias.bias === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/30' :
          marketBias.bias === 'Bearish' ? 'bg-rose-500/10 border-rose-500/30' :
          'bg-amber-500/10 border-amber-500/30'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${
                marketBias.bias === 'Bullish' ? 'text-emerald-400' :
                marketBias.bias === 'Bearish' ? 'text-rose-400' :
                'text-amber-400'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-sm font-medium text-white">Market Bias</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              marketBias.confidence === 'High' ? 'bg-purple-500/20 text-purple-300' :
              marketBias.confidence === 'Medium' ? 'bg-blue-500/20 text-blue-300' :
              'bg-gray-500/20 text-gray-300'
            }`}>
              {marketBias.confidence} Confidence
            </span>
          </div>
          <div className="flex items-center">
            <span className={`text-lg font-bold ${
              marketBias.bias === 'Bullish' ? 'text-emerald-400' :
              marketBias.bias === 'Bearish' ? 'text-rose-400' :
              'text-amber-400'
            }`}>
              {marketBias.bias}
            </span>
          </div>
        </div>

        {isLoading && !mounted ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-slate-700/50 rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-slate-700/50 rounded w-1/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <div className="flex items-center">
                <RiExchangeDollarLine className="w-4 h-4 text-amber-400 mr-2" />
                <span className="text-amber-200 text-sm">Funding Rate:</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded ${parseFloat(variables?.fundingRate || '0') >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {mounted ? variables?.fundingRate || '+0.012%' : '+0.012%'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <div className="flex items-center">
                <RiLineChartLine className="w-4 h-4 text-amber-400 mr-2" />
                <span className="text-amber-200 text-sm">Open Interest:</span>
              </div>
              <span className="text-white text-sm font-medium px-2 py-0.5 rounded bg-blue-500/20">
                {mounted ? variables?.openInterest || '$1.2B' : '$1.2B'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <div className="flex items-center">
                <RiScales3Line className="w-4 h-4 text-amber-400 mr-2" />
                <span className="text-amber-200 text-sm">Long/Short Ratio:</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded ${parseFloat(variables?.longShortRatio || '0') >= 1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {mounted ? variables?.longShortRatio || '1.8' : '1.8'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <div className="flex items-center">
                <RiPulseLine className="w-4 h-4 text-amber-400 mr-2" />
                <span className="text-amber-200 text-sm">Volatility Index:</span>
              </div>
              <span className="text-white text-sm font-medium px-2 py-0.5 rounded bg-purple-500/20">
                {mounted ? variables?.volatilityIndex || '3.2%' : '3.2%'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <div className="flex items-center">
                <RiChatSmileLine className="w-4 h-4 text-amber-400 mr-2" />
                <span className="text-amber-200 text-sm">Social Sentiment:</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                variables?.socialSentiment === 'Positive' ? 'bg-emerald-500/20 text-emerald-300' :
                variables?.socialSentiment === 'Negative' ? 'bg-rose-500/20 text-rose-300' :
                'bg-amber-500/20 text-amber-300'
              }`}>
                {mounted ? variables?.socialSentiment || 'Positive' : 'Positive'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <div className="flex items-center">
                <RiShieldLine className="w-4 h-4 text-amber-400 mr-2" />
                <span className="text-amber-200 text-sm">Network Health:</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                variables?.networkHealth === 'Strong' ? 'bg-emerald-500/20 text-emerald-300' :
                variables?.networkHealth === 'Weak' ? 'bg-rose-500/20 text-rose-300' :
                'bg-amber-500/20 text-amber-300'
              }`}>
                {mounted ? variables?.networkHealth || 'Strong' : 'Strong'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-amber-200 text-sm">Market Momentum:</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                variables?.marketMomentum === 'Bullish' ? 'bg-emerald-500/20 text-emerald-300' :
                variables?.marketMomentum === 'Bearish' ? 'bg-rose-500/20 text-rose-300' :
                'bg-amber-500/20 text-amber-300'
              }`}>
                {mounted ? variables?.marketMomentum || 'Bullish' : 'Bullish'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-amber-200 text-sm">Liquidity Score:</span>
              </div>
              <span className="text-white text-sm font-medium px-2 py-0.5 rounded bg-blue-500/20">
                {mounted ? variables?.liquidityScore || '3.45' : '3.45'}
              </span>
            </div>
          </div>
        )}

        {/* Neural Analysis */}
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/20">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs text-amber-300 font-medium">Neural Analysis</span>
          </div>
          <p className="text-sm text-white">
            {marketBias.bias === 'Bullish'
              ? `Current market variables suggest a bullish bias with ${marketBias.confidence.toLowerCase()} confidence. Positive funding rate (${variables?.fundingRate || '+0.012%'}) and strong long/short ratio (${variables?.longShortRatio || '1.8'}) indicate potential upside momentum. Market momentum is ${variables?.marketMomentum || 'Bullish'} with a liquidity score of ${variables?.liquidityScore || '3.45'}.`
              : marketBias.bias === 'Bearish'
                ? `Market variables indicate a bearish bias with ${marketBias.confidence.toLowerCase()} confidence. Negative sentiment and elevated volatility (${variables?.volatilityIndex || '3.2%'}) suggest caution is warranted. Market momentum is ${variables?.marketMomentum || 'Bearish'} with a liquidity score of ${variables?.liquidityScore || '3.45'}.`
                : `Market variables show mixed signals with ${marketBias.confidence.toLowerCase()} confidence. Current volatility at ${variables?.volatilityIndex || '3.2%'} with ${variables?.socialSentiment || 'Neutral'} social sentiment. Monitor for clearer directional bias before taking significant positions.`
            }
          </p>
        </div>

        {/* Data Source */}
        <div className="mt-3 text-xs text-gray-400 flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {variables?.dataSource || 'Real-time market data with neural analysis'}
          </span>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {variables?.lastUpdated ? new Date(variables.lastUpdated).toLocaleTimeString() : new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  )
}
