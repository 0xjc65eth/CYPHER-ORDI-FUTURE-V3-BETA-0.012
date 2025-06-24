/**
 * ⚡ INTERVAL OPTIMIZER - CYPHER ORDi FUTURE V3
 * Sistema otimizado de gerenciamento de intervalos e tarefas periódicas
 */

import { EnhancedLogger } from '../enhanced-logger';
import { ErrorReporter } from '../ErrorReporter';

export interface IntervalTask {
  id: string;
  callback: () => void | Promise<void>;
  frequency: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  singleton?: boolean;
  maxExecutionTime?: number;
  retryOnError?: boolean;
  maxRetries?: number;
  enabled: boolean;
  lastExecution?: number;
  executionCount: number;
  errorCount: number;
  averageExecutionTime: number;
  isRunning: boolean;
}

export class IntervalOptimizer {
  private static instance: IntervalOptimizer;
  private tasks: Map<string, IntervalTask> = new Map();
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  static getInstance(): IntervalOptimizer {
    if (!IntervalOptimizer.instance) {
      IntervalOptimizer.instance = new IntervalOptimizer();
    }
    return IntervalOptimizer.instance;
  }

  registerTask(taskConfig: Omit<IntervalTask, 'enabled' | 'executionCount' | 'errorCount' | 'averageExecutionTime' | 'isRunning'>): void {
    const task: IntervalTask = {
      ...taskConfig,
      enabled: true,
      executionCount: 0,
      errorCount: 0,
      averageExecutionTime: 0,
      isRunning: false,
      singleton: taskConfig.singleton ?? false,
      maxExecutionTime: taskConfig.maxExecutionTime || 30000,
      retryOnError: taskConfig.retryOnError ?? true,
      maxRetries: taskConfig.maxRetries || 3
    };

    if (this.tasks.has(task.id)) {
      this.removeTask(task.id);
    }

    this.tasks.set(task.id, task);
    this.startTask(task.id);

    EnhancedLogger.info(`Task registered: ${task.id}`, {
      component: 'IntervalOptimizer',
      taskId: task.id,
      frequency: task.frequency,
      priority: task.priority
    });
  }

  removeTask(taskId: string): boolean {
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }

    const removed = this.tasks.delete(taskId);
    if (removed) {
      EnhancedLogger.info(`Task removed: ${taskId}`, {
        component: 'IntervalOptimizer',
        taskId
      });
    }
    return removed;
  }

  private startTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task || !task.enabled) return;

    const existingInterval = this.intervals.get(taskId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const interval = setInterval(() => {
      this.executeTask(taskId).catch(error => {
        ErrorReporter.report(error, {
          component: 'IntervalOptimizer',
          action: 'executeTask',
          metadata: { taskId }
        });
      });
    }, task.frequency);

    this.intervals.set(taskId, interval);
  }

  private async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || !task.enabled) return;

    if (task.singleton && task.isRunning) {
      return;
    }

    const startTime = performance.now();
    task.isRunning = true;
    task.lastExecution = Date.now();

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Task execution timeout')), task.maxExecutionTime);
      });

      await Promise.race([
        Promise.resolve(task.callback()),
        timeoutPromise
      ]);

      const executionTime = performance.now() - startTime;
      task.executionCount++;
      const totalTime = task.averageExecutionTime * (task.executionCount - 1) + executionTime;
      task.averageExecutionTime = totalTime / task.executionCount;

    } catch (error) {
      task.errorCount++;
      EnhancedLogger.error(`Task execution failed: ${taskId}`, {
        component: 'IntervalOptimizer',
        taskId,
        error: error instanceof Error ? error.message : String(error),
        errorCount: task.errorCount
      });

      if (task.errorCount >= 5) {
        task.enabled = false;
        this.removeTask(taskId);
      }
    } finally {
      task.isRunning = false;
    }
  }

  clear(taskId?: string): void {
    if (taskId) {
      this.removeTask(taskId);
    } else {
      for (const interval of this.intervals.values()) {
        clearInterval(interval);
      }
      this.intervals.clear();
      this.tasks.clear();
    }
  }

  getTaskStatus(taskId: string): IntervalTask | null {
    return this.tasks.get(taskId) || null;
  }

  // Método start para compatibilidade com código existente
  start(): void {
    EnhancedLogger.info('IntervalOptimizer started', {
      component: 'IntervalOptimizer',
      activeTasks: this.tasks.size
    });
  }

  // Método stop para compatibilidade
  stop(): void {
    this.clear();
    EnhancedLogger.info('IntervalOptimizer stopped', {
      component: 'IntervalOptimizer'
    });
  }

  // Método isActive para verificação de status
  isActive(): boolean {
    return this.tasks.size > 0;
  }

  // Método getTasks para obter todas as tarefas
  getTasks(): Map<string, IntervalTask> {
    return new Map(this.tasks);
  }
}

export const intervalOptimizer = IntervalOptimizer.getInstance();
export default IntervalOptimizer;