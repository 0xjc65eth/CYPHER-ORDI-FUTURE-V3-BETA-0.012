/**
 * Serviço de Gerenciamento de Web Workers
 * Facilita o uso de workers para processamento em background
 */

import { devLogger } from '@/lib/logger';

export interface WorkerMessage {
  type: string;
  data?: any;
  id: string;
  success?: boolean;
  error?: string;
}

export interface WorkerTask<T = any> {
  id: string;
  type: string;
  data: any;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timeout?: NodeJS.Timeout;
}

export class WorkerService {
  private workers: Map<string, Worker> = new Map();
  private tasks: Map<string, WorkerTask> = new Map();
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  /**
   * Criar ou obter worker existente
   */
  getWorker(name: string, scriptPath: string): Worker {
    if (this.workers.has(name)) {
      return this.workers.get(name)!;
    }

    devLogger.log('WORKER', `Creating new worker: ${name}`);
    
    const worker = new Worker(scriptPath, { type: 'module' });
    
    // Setup message handler
    worker.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
      this.handleWorkerMessage(name, event.data);
    });
    
    // Setup error handler
    worker.addEventListener('error', (error) => {
      devLogger.error(new Error(`Worker ${name} error: ${error.message}`));
      this.handleWorkerError(name, error);
    });
    
    this.workers.set(name, worker);
    return worker;
  }

  /**
   * Enviar tarefa para worker
   */
  async sendTask<T = any>(
    workerName: string,
    type: string,
    data: any,
    timeoutMs: number = 30000
  ): Promise<T> {
    const worker = this.workers.get(workerName);
    if (!worker) {
      throw new Error(`Worker ${workerName} not found`);
    }

    const taskId = this.generateTaskId();
    
    return new Promise<T>((resolve, reject) => {
      // Setup timeout
      const timeout = setTimeout(() => {
        this.tasks.delete(taskId);
        reject(new Error(`Task ${taskId} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      // Store task
      this.tasks.set(taskId, {
        id: taskId,
        type,
        data,
        resolve,
        reject,
        timeout
      });
      
      // Send message to worker
      worker.postMessage({ id: taskId, type, data });
      
      devLogger.log('WORKER', `Task ${taskId} sent to ${workerName}`);
    });
  }

  /**
   * Registrar handler para mensagens específicas
   */
  onMessage(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Terminar worker
   */
  terminateWorker(name: string): void {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
      devLogger.log('WORKER', `Worker ${name} terminated`);
    }
  }

  /**
   * Terminar todos os workers
   */
  terminateAll(): void {
    this.workers.forEach((worker, name) => {
      worker.terminate();
      devLogger.log('WORKER', `Worker ${name} terminated`);
    });
    this.workers.clear();
    this.tasks.clear();
  }

  /**
   * Handler para mensagens do worker
   */
  private handleWorkerMessage(workerName: string, message: WorkerMessage): void {
    const { id, type, success, data, error } = message;
    
    // Check if it's a task response
    const task = this.tasks.get(id);
    if (task) {
      clearTimeout(task.timeout);
      this.tasks.delete(id);
      
      if (success) {
        task.resolve(data);
      } else {
        task.reject(new Error(error || 'Worker task failed'));
      }
      
      return;
    }
    
    // Check for registered message handlers
    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(data);
    }
    
    devLogger.log('WORKER', `Message from ${workerName}:`, { type, data });
  }

  /**
   * Handler para erros do worker
   */
  private handleWorkerError(workerName: string, error: ErrorEvent): void {
    // Reject all pending tasks for this worker
    this.tasks.forEach((task) => {
      task.reject(new Error(`Worker ${workerName} crashed: ${error.message}`));
    });
    
    // Remove worker
    this.workers.delete(workerName);
  }

  /**
   * Gerar ID único para tarefa
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Instância singleton
export const workerService = new WorkerService();

/**
 * Hook para usar workers facilmente
 */
import { useEffect, useRef, useCallback } from 'react';

export function useWorker<T = any>(
  workerName: string,
  workerPath: string
) {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Criar worker
    workerRef.current = workerService.getWorker(workerName, workerPath);
    
    return () => {
      // Não terminar o worker ao desmontar, pois pode ser reutilizado
      // workerService.terminateWorker(workerName);
    };
  }, [workerName, workerPath]);

  const sendTask = useCallback(async (
    type: string,
    data: any,
    timeout?: number
  ): Promise<T> => {
    return workerService.sendTask<T>(workerName, type, data, timeout);
  }, [workerName]);

  const onMessage = useCallback((
    messageType: string,
    handler: (data: any) => void
  ) => {
    workerService.onMessage(messageType, handler);
  }, []);

  return {
    sendTask,
    onMessage,
    isReady: !!workerRef.current
  };
}