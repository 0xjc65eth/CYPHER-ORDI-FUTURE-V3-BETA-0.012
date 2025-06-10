'use client';

// 📊 CYPHER ORDI FUTURE v3.0.0 - Base Chart Component
// Componente base para todos os charts da aplicação

import { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BaseChartProps } from '../types/chartTypes';

interface BaseChartWrapperProps extends BaseChartProps {
  children: ReactNode;
}

export function BaseChart({
  children,
  title,
  width = '100%',
  height = 400,
  loading = false,
  error,
  className,
  showLegend = true,
  ...props
}: BaseChartWrapperProps) {
  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Erro ao carregar gráfico: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="animate-pulse bg-gray-200 h-96 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width={width} height={height}>
          <>
            {children}
          </>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}