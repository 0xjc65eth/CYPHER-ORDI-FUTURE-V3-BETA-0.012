"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useInvestorProfile } from '@/hooks/useInvestorProfile'

interface InvestorProfileProps {
  address: string
}

export default function InvestorProfile({ address }: InvestorProfileProps) {
  const { data, isLoading, error } = useInvestorProfile(address)
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investor Profile</CardTitle>
          <CardDescription>Your investment style analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investor Profile</CardTitle>
          <CardDescription>Your investment style analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            <p>Error loading investor profile. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Helper function to get profile color
  const getProfileColor = (profile: string) => {
    switch (profile.toLowerCase()) {
      case 'safe':
        return 'from-blue-500 to-blue-700'
      case 'moderate':
        return 'from-green-500 to-green-700'
      case 'degen':
        return 'from-purple-500 to-purple-700'
      case 'degen lfg':
        return 'from-red-500 to-red-700'
      default:
        return 'from-gray-500 to-gray-700'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investor Profile</CardTitle>
        <CardDescription>Your investment style analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-center">
          <div className={`inline-block px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r ${getProfileColor(data?.profile || '')}`}>
            {data?.profile}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Risk Tolerance</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-green-500 to-red-500 h-2.5 rounded-full" 
                style={{ width: `${data?.riskTolerance}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Time Horizon</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-red-500 to-green-500 h-2.5 rounded-full" 
                style={{ width: `${data?.timeHorizon}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Short</span>
              <span>Long</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Portfolio Diversity</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-red-500 to-green-500 h-2.5 rounded-full" 
                style={{ width: `${data?.diversity}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Recommendations</h3>
          <ul className="space-y-2">
            {data?.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md">
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
