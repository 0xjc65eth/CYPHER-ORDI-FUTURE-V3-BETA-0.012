import fs from 'fs';
import path from 'path';

/**
 * Sistema de Logging para Desenvolvimento
 * Registra progresso, erros e métricas de performance
 */

export class DevelopmentLogger {
  private logDir: string;
  
  constructor() {
    // Em ambiente browser, não usar fs
    if (typeof window !== 'undefined') {
      this.logDir = '';
      return;
    }
    
    this.logDir = path.join(process.cwd(), 'logs');
    
    // Criar diretório se não existir
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error('Erro ao criar diretório de logs:', error);
    }
  }

  log(category: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${category}] ${message}\n${data ? JSON.stringify(data, null, 2) : ''}\n---\n`;
    
    // Log no console
    console.log(`🔍 [${category}]`, message, data || '');
    
    // Em ambiente browser, apenas console
    if (typeof window !== 'undefined') {
      return;
    }
    
    // Salvar em arquivo apenas no servidor
    try {
      const logFile = path.join(this.logDir, 'development-log.md');
      fs.appendFileSync(logFile, logEntry);
      
      // Log específico por categoria
      if (category === 'ERROR') {
        fs.appendFileSync(path.join(this.logDir, 'errors.log'), logEntry);
      } else if (category === 'PERFORMANCE') {
        fs.appendFileSync(path.join(this.logDir, 'performance.log'), logEntry);
      }
    } catch (error) {
      console.error('Erro ao escrever log:', error);
    }
  }

  milestone(title: string, details: string) {
    const entry = `\n## 🎯 MILESTONE: ${title}\n${new Date().toISOString()}\n${details}\n\n`;
    
    // Log no console
    console.log('🎯 MILESTONE:', title);
    console.log(details);
    
    // Em ambiente browser, apenas console
    if (typeof window !== 'undefined') {
      return;
    }
    
    // Salvar em arquivo apenas no servidor
    try {
      fs.appendFileSync(path.join(this.logDir, 'development-log.md'), entry);
    } catch (error) {
      console.error('Erro ao escrever milestone:', error);
    }
  }

  progress(feature: string, percentage: number) {
    this.log('PROGRESS', `${feature}: ${percentage}% complete`);
  }

  error(error: Error, context?: string) {
    this.log('ERROR', error.message, { 
      stack: error.stack, 
      context,
      timestamp: new Date().toISOString()
    });
  }

  performance(metric: string, value: number, unit: string = 'ms') {
    this.log('PERFORMANCE', `${metric}: ${value}${unit}`);
  }

  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: any) {
    this.log('WARN', message, data);
  }

  debug(message: string, data?: any) {
    this.log('DEBUG', message, data);
  }
}

// Exportar instância singleton
export const devLogger = new DevelopmentLogger();
export const logger = devLogger;
export const loggerService = devLogger;