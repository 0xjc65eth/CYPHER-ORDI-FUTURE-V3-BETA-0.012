"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SimpleNeuralStatus() {
  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Neural System Status</CardTitle>
            <CardDescription className="text-gray-200">
              Real-time learning and analysis metrics
            </CardDescription>
          </div>
          <div className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-200">
            <span className="flex items-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Training Active
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Learning Progress</h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Training neural models with latest data
                </span>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  78%
                </span>
              </div>
              <Progress value={78} className="h-2.5 bg-blue-100 dark:bg-blue-900/30" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/50 dark:bg-gray-800/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Stage</div>
                <div className="font-medium text-blue-700 dark:text-blue-300 capitalize">
                  training
                </div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tasks Completed</div>
                <div className="font-medium text-blue-700 dark:text-blue-300">
                  12 / 20
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="insights" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insights">Neural Insights</TabsTrigger>
            <TabsTrigger value="corrections">Auto Corrections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="mt-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-indigo-100 dark:bg-indigo-800/30 p-1 rounded-full mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M2 12h5"></path><path d="M9 12h5"></path><path d="M16 12h6"></path><path d="M3.5 5.5L7 3"></path><path d="M3.5 18.5L7 21"></path><path d="M20.5 5.5L17 3"></path><path d="M20.5 18.5L17 21"></path></svg>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Detected increasing correlation (0.78) between Bitcoin ETF inflows and Ordinals floor prices</span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="corrections" className="mt-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
              <div className="mb-3 text-sm text-amber-700 dark:text-amber-300">
                The neural system autonomously detects and corrects inconsistencies in data to improve accuracy.
              </div>
              <ul className="space-y-3">
                <li className="bg-white/50 dark:bg-gray-800/30 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-amber-700 dark:text-amber-300">
                      Market price
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      92% confidence
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Detected abnormal price variation of 22.5% in less than an hour. Value corrected based on adjacent data points.
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/30">
                      <span className="text-gray-500 dark:text-gray-400">Old Value:</span>
                      <span className="ml-1 font-medium text-red-700 dark:text-red-300">68452</span>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 p-2 rounded border border-green-100 dark:border-green-900/30">
                      <span className="text-gray-500 dark:text-gray-400">New Value:</span>
                      <span className="ml-1 font-medium text-green-700 dark:text-green-300">65789</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="bg-gray-50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-700/30 flex justify-between">
        <div className="text-xs text-gray-500">
          Neural system running on Degoo cloud storage with 24/7 learning capability and autonomous data correction
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
          >
            Run Auto-Correction
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
          >
            Refresh Status
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
