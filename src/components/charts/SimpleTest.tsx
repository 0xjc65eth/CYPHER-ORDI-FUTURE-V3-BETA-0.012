'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Import individual chart components directly
import SimpleChart from './SimpleChart'
import RechartsChart from './RechartsChart'

// Simple test data
const testLineData = [
  { time: '10:00', value: 50000 },
  { time: '11:00', value: 51000 },
  { time: '12:00', value: 49500 },
  { time: '13:00', value: 52000 },
  { time: '14:00', value: 51500 },
]

const testBarData = [
  { category: 'BTC', value: 50000, color: '#F7931A' },
  { category: 'ETH', value: 3000, color: '#627EEA' },
  { category: 'ADA', value: 0.5, color: '#0033AD' },
]

export function SimpleTest() {
  const [currentTest, setCurrentTest] = useState<'simple' | 'recharts' | 'unified'>('simple')

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Chart System Test</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Testing individual chart components to diagnose issues
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => setCurrentTest('simple')}
              variant={currentTest === 'simple' ? 'default' : 'outline'}
            >
              Simple Chart
            </Button>
            <Button 
              onClick={() => setCurrentTest('recharts')}
              variant={currentTest === 'recharts' ? 'default' : 'outline'}
            >
              Recharts
            </Button>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            {currentTest === 'simple' && (
              <div className="space-y-4">
                <h3 className="font-medium">Simple SVG Chart (Line)</h3>
                <SimpleChart
                  type="line"
                  data={testLineData}
                  config={{
                    height: 300,
                    theme: 'auto',
                    showGrid: true,
                    colors: ['#F7931A']
                  }}
                />
                
                <h3 className="font-medium">Simple SVG Chart (Bar)</h3>
                <SimpleChart
                  type="bar"
                  data={testBarData}
                  config={{
                    height: 300,
                    theme: 'auto',
                    showGrid: true,
                    colors: ['#F7931A']
                  }}
                />
              </div>
            )}

            {currentTest === 'recharts' && (
              <div className="space-y-4">
                <h3 className="font-medium">Recharts Component (Line)</h3>
                <RechartsChart
                  type="line"
                  data={testLineData}
                  config={{
                    height: 300,
                    theme: 'auto',
                    showGrid: true,
                    colors: ['#F7931A']
                  }}
                />
                
                <h3 className="font-medium">Recharts Component (Bar)</h3>
                <RechartsChart
                  type="bar"
                  data={testBarData}
                  config={{
                    height: 300,
                    theme: 'auto',
                    showGrid: true,
                    colors: ['#F7931A']
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Raw data display */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Test Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Line Data:</h4>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(testLineData, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Bar Data:</h4>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(testBarData, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SimpleTest