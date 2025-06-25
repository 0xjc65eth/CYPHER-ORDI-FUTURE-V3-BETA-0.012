// src/lib/logger.ts
export interface ILogger {
  info(message: string, data?: any): void
  error(message: string, error?: any): void
  warn(message: string, data?: any): void
  debug(message: string, data?: any): void
}

class UniversalLogger implements ILogger {
  private static instance: UniversalLogger
  private isDev = process.env.NODE_ENV === 'development'
  private isServer = typeof window === 'undefined'

  static getInstance(): UniversalLogger {
    if (!UniversalLogger.instance) {
      UniversalLogger.instance = new UniversalLogger()
    }
    return UniversalLogger.instance
  }

  info(message: string, data?: any): void {
    if (this.isDev || this.isServer) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '')
    }
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '')
  }

  warn(message: string, data?: any): void {
    if (this.isDev || this.isServer) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '')
    }
  }

  debug(message: string, data?: any): void {
    if (this.isDev) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '')
    }
  }

  // Métodos de compatibilidade com versões anteriores
  log(category: string, message: string, data?: any) {
    this.info(`[${category}] ${message}`, data)
  }

  milestone(title: string, details: string) {
    this.info(`🎯 MILESTONE: ${title}`, details)
  }

  progress(feature: string, percentage: number) {
    this.info(`${feature}: ${percentage}% complete`)
  }

  performance(metric: string, value: number, unit: string = 'ms') {
    this.info(`${metric}: ${value}${unit}`)
  }
}

export const logger = UniversalLogger.getInstance()
export default logger

// Exports para compatibilidade
export const devLogger = logger
export const loggerService = logger