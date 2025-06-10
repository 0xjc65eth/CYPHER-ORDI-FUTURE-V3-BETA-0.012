'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'skeleton'
  className?: string
  fullScreen?: boolean
  text?: string
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  className,
  fullScreen = false,
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            {children}
          </div>
        </div>
      )
    }
    return <div className={cn("flex flex-col items-center justify-center gap-4", className)}>{children}</div>
  }

  if (variant === 'skeleton') {
    return <SkeletonLoader className={className} />
  }

  if (variant === 'dots') {
    return (
      <Wrapper>
        <DotsLoader size={size} />
        {text && <p className="text-sm text-white/70">{text}</p>}
      </Wrapper>
    )
  }

  if (variant === 'pulse') {
    return (
      <Wrapper>
        <PulseLoader size={size} />
        {text && <p className="text-sm text-white/70">{text}</p>}
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <motion.div
        className={cn(sizeClasses[size], "relative")}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </motion.div>
      {text && <p className="text-sm text-white/70">{text}</p>}
    </Wrapper>
  )
}

// Dots Loader Component
function DotsLoader({ size }: { size: 'sm' | 'md' | 'lg' | 'xl' }) {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  }

  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(dotSizes[size], "bg-orange-500 rounded-full")}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

// Pulse Loader Component
function PulseLoader({ size }: { size: 'sm' | 'md' | 'lg' | 'xl' }) {
  const pulseSize = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  return (
    <div className="relative">
      <motion.div
        className={cn(pulseSize[size], "absolute inset-0 bg-orange-500/20 rounded-full")}
        animate={{
          scale: [1, 2],
          opacity: [0.5, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
      />
      <motion.div
        className={cn(pulseSize[size], "bg-orange-500/30 rounded-full")}
        animate={{
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      />
    </div>
  )
}

// Skeleton Loader Component
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="space-y-3">
        <div className="h-2 bg-white/10 rounded w-3/4" />
        <div className="h-2 bg-white/10 rounded" />
        <div className="h-2 bg-white/10 rounded w-5/6" />
      </div>
    </div>
  )
}

// Card Skeleton Component
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-white/5 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-2 bg-white/10 rounded w-1/3" />
            <div className="h-2 bg-white/10 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-2 bg-white/10 rounded" />
          <div className="h-2 bg-white/10 rounded w-5/6" />
          <div className="h-2 bg-white/10 rounded w-3/4" />
        </div>
      </div>
    </div>
  )
}

// Table Skeleton Component
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="bg-white/5 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-white/10 p-4 grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-2 bg-white/20 rounded" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 grid grid-cols-4 gap-4 border-t border-white/5">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-2 bg-white/10 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Chart Skeleton Component
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-2 bg-white/10 rounded w-32" />
            <div className="h-2 bg-white/10 rounded w-24" />
          </div>
          <div className="flex gap-2">
            <div className="w-16 h-8 bg-white/10 rounded" />
            <div className="w-16 h-8 bg-white/10 rounded" />
          </div>
        </div>
        <div className="h-64 bg-white/10 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

// Progressive Loading Component
export function ProgressiveLoader({
  stages,
  currentStage,
  className
}: {
  stages: string[]
  currentStage: number
  className?: string
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {stages.map((stage, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: index <= currentStage ? 1 : 0.3,
            x: 0
          }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3"
        >
          <div className={cn(
            "w-2 h-2 rounded-full",
            index < currentStage ? "bg-green-500" :
            index === currentStage ? "bg-orange-500 animate-pulse" :
            "bg-white/20"
          )} />
          <span className={cn(
            "text-sm",
            index <= currentStage ? "text-white" : "text-white/30"
          )}>
            {stage}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

// Shimmer Effect Component
export function ShimmerEffect({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  )
}