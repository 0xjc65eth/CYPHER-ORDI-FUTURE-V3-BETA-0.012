"use client"

import SimpleNeuralStatus from '@/components/neural/SimpleNeuralStatus'

export default function NeuralTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Neural System Status Test</h1>
      <SimpleNeuralStatus />
    </div>
  )
}
