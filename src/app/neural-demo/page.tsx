"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SimpleNeuralStatus from '@/components/neural/SimpleNeuralStatus'

export default function NeuralDemoPage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Neural System Demo</CardTitle>
          <CardDescription>
            Demonstração do layout aprimorado da aba de aprendizagem neural
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status do Sistema</TabsTrigger>
              <TabsTrigger value="training">Dados de Treinamento</TabsTrigger>
              <TabsTrigger value="insights">Insights Neurais</TabsTrigger>
            </TabsList>
            <TabsContent value="status" className="mt-6">
              <SimpleNeuralStatus />
            </TabsContent>
            <TabsContent value="training" className="mt-6">
              <div className="p-6 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Dados de Treinamento</h2>
                <p>Esta seção mostraria os dados de treinamento do sistema neural.</p>
              </div>
            </TabsContent>
            <TabsContent value="insights" className="mt-6">
              <div className="p-6 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Insights Neurais</h2>
                <p>Esta seção mostraria os insights gerados pelo sistema neural.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
