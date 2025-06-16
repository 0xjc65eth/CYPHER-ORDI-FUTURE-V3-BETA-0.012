import { EventEmitter } from 'events';
import { logger } from '../lib/logger';

/**
 * Status possíveis de um agente
 */
export enum AgentStatus {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  READY = 'ready',
  EXECUTING = 'executing',
  ERROR = 'error',
  STOPPED = 'stopped'
}

/**
 * Tipos de mensagens entre agentes
 */
export enum MessageType {
  COMMAND = 'command',
  DATA = 'data',
  STATUS = 'status',
  ERROR = 'error',
  RESULT = 'result'
}

/**
 * Interface para mensagens entre agentes
 */
export interface IAgentMessage {
  from: string;
  to: string;
  type: MessageType;
  payload: any;
  timestamp: Date;
  correlationId?: string;
}

/**
 * Interface para resultado de execução
 */
export interface IExecutionResult {
  success: boolean;
  data?: any;
  error?: Error;
  duration: number;
  timestamp: Date;
}

/**
 * Interface base para todos os agentes do sistema
 */
export interface IAgent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  
  /**
   * Inicializa o agente e seus recursos
   */
  initialize(): Promise<void>;
  
  /**
   * Executa a lógica principal do agente
   */
  execute(params?: any): Promise<IExecutionResult>;
  
  /**
   * Monitora o status e saúde do agente
   */
  monitor(): Promise<{
    status: AgentStatus;
    health: 'healthy' | 'degraded' | 'unhealthy';
    metrics: Record<string, any>;
  }>;
  
  /**
   * Para a execução do agente
   */
  stop(): Promise<void>;
  
  /**
   * Processa mensagens recebidas de outros agentes
   */
  handleMessage(message: IAgentMessage): Promise<void>;
}

/**
 * Classe base abstrata para implementação de agentes
 */
export abstract class BaseAgent extends EventEmitter implements IAgent {
  public status: AgentStatus = AgentStatus.IDLE;
  protected logger = logger;
  protected lastExecutionTime: Date | null = null;
  protected executionCount: number = 0;
  
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string
  ) {
    super();
    // Logger já inicializado como propriedade da classe
  }
  
  /**
   * Implementação base de inicialização
   */
  async initialize(): Promise<void> {
    try {
      this.status = AgentStatus.INITIALIZING;
      this.logger.info(`Inicializando agente ${this.name}...`);
      
      // Chama a inicialização específica do agente
      await this.onInitialize();
      
      this.status = AgentStatus.READY;
      this.logger.info(`Agente ${this.name} inicializado com sucesso`);
      this.emit('initialized', { agentId: this.id });
    } catch (error) {
      this.status = AgentStatus.ERROR;
      this.logger.error(error as Error, `Inicialização do agente ${this.name}`);
      throw error;
    }
  }
  
  /**
   * Implementação base de execução
   */
  async execute(params?: any): Promise<IExecutionResult> {
    const startTime = Date.now();
    
    try {
      this.status = AgentStatus.EXECUTING;
      this.logger.info(`Executando agente ${this.name}...`);
      
      // Chama a execução específica do agente
      const result = await this.onExecute(params);
      
      const duration = Date.now() - startTime;
      this.lastExecutionTime = new Date();
      this.executionCount++;
      
      this.status = AgentStatus.READY;
      this.logger.info(`Agente ${this.name} executado em ${duration}ms`);
      
      const executionResult: IExecutionResult = {
        success: true,
        data: result,
        duration,
        timestamp: new Date()
      };
      
      this.emit('executed', executionResult);
      return executionResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.status = AgentStatus.ERROR;
      this.logger.error(error as Error, `Execução do agente ${this.name}`);
      
      const executionResult: IExecutionResult = {
        success: false,
        error: error as Error,
        duration,
        timestamp: new Date()
      };
      
      this.emit('execution-error', executionResult);
      return executionResult;
    }
  }
  
  /**
   * Implementação base de monitoramento
   */
  async monitor(): Promise<{
    status: AgentStatus;
    health: 'healthy' | 'degraded' | 'unhealthy';
    metrics: Record<string, any>;
  }> {
    const health = this.status === AgentStatus.ERROR ? 'unhealthy' :
                   this.status === AgentStatus.READY ? 'healthy' : 'degraded';
    
    const metrics = await this.onMonitor();
    
    return {
      status: this.status,
      health,
      metrics: {
        ...metrics,
        executionCount: this.executionCount,
        lastExecutionTime: this.lastExecutionTime,
        uptime: process.uptime()
      }
    };
  }
  
  /**
   * Implementação base de parada
   */
  async stop(): Promise<void> {
    try {
      this.logger.info(`Parando agente ${this.name}...`);
      
      // Chama a parada específica do agente
      await this.onStop();
      
      this.status = AgentStatus.STOPPED;
      this.logger.info(`Agente ${this.name} parado com sucesso`);
      this.emit('stopped', { agentId: this.id });
    } catch (error) {
      this.logger.error(error as Error, `Parada do agente ${this.name}`);
      throw error;
    }
  }
  
  /**
   * Implementação base de tratamento de mensagens
   */
  async handleMessage(message: IAgentMessage): Promise<void> {
    this.logger.debug(`Mensagem recebida de ${message.from}:`, message);
    
    try {
      await this.onMessage(message);
      this.emit('message-processed', message);
    } catch (error) {
      this.logger.error(error as Error, `Processamento de mensagem`);
      this.emit('message-error', { message, error });
    }
  }
  
  /**
   * Métodos abstratos para implementação específica
   */
  protected abstract onInitialize(): Promise<void>;
  protected abstract onExecute(params?: any): Promise<any>;
  protected abstract onMonitor(): Promise<Record<string, any>>;
  protected abstract onStop(): Promise<void>;
  protected abstract onMessage(message: IAgentMessage): Promise<void>;
}

/**
 * Coordenador central do sistema de agentes
 */
export class AgentCoordinator extends EventEmitter {
  private agents: Map<string, IAgent> = new Map();
  private messageQueue: IAgentMessage[] = [];
  private isRunning: boolean = false;
  private readonly logger = logger;
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  constructor(private readonly config: {
    monitoringIntervalMs?: number;
    maxQueueSize?: number;
  } = {}) {
    super();
    // Logger já inicializado como propriedade da classe
    
    // Configurações padrão
    this.config.monitoringIntervalMs = this.config.monitoringIntervalMs || 30000; // 30 segundos
    this.config.maxQueueSize = this.config.maxQueueSize || 1000;
  }
  
  /**
   * Registra um novo agente no sistema
   */
  registerAgent(agent: IAgent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agente com ID ${agent.id} já está registrado`);
    }
    
    this.logger.info(`Registrando agente: ${agent.name} (${agent.id})`);
    this.agents.set(agent.id, agent);
    
    // Configura listeners para eventos do agente
    this.setupAgentListeners(agent);
    
    this.emit('agent-registered', { agentId: agent.id, agentName: agent.name });
  }
  
  /**
   * Remove um agente do sistema
   */
  async unregisterAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agente com ID ${agentId} não encontrado`);
    }
    
    this.logger.info(`Removendo agente: ${agent.name} (${agentId})`);
    
    // Para o agente antes de remover
    if (agent.status !== AgentStatus.STOPPED) {
      await agent.stop();
    }
    
    this.agents.delete(agentId);
    this.emit('agent-unregistered', { agentId, agentName: agent.name });
  }
  
  /**
   * Inicializa todos os agentes registrados
   */
  async initializeAllAgents(): Promise<void> {
    this.logger.info('Inicializando todos os agentes...');
    
    const initPromises = Array.from(this.agents.values()).map(agent => 
      agent.initialize().catch(error => {
        this.logger.error(error as Error, `Inicialização do agente ${agent.name}`);
        return { agentId: agent.id, error };
      })
    );
    
    const results = await Promise.allSettled(initPromises);
    
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      this.logger.warn(`${failures.length} agentes falharam na inicialização`);
    }
    
    this.logger.info('Inicialização de agentes concluída');
  }
  
  /**
   * Inicia o coordenador e todos os agentes
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Coordenador já está em execução');
      return;
    }
    
    this.logger.info('Iniciando AgentCoordinator...');
    
    // Inicializa todos os agentes
    await this.initializeAllAgents();
    
    // Inicia o processamento de mensagens
    this.isRunning = true;
    this.startMessageProcessing();
    
    // Inicia o monitoramento
    this.startMonitoring();
    
    this.logger.info('AgentCoordinator iniciado com sucesso');
    this.emit('coordinator-started');
  }
  
  /**
   * Para o coordenador e todos os agentes
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Coordenador não está em execução');
      return;
    }
    
    this.logger.info('Parando AgentCoordinator...');
    
    // Para o monitoramento
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    // Para o processamento de mensagens
    this.isRunning = false;
    
    // Para todos os agentes
    const stopPromises = Array.from(this.agents.values()).map(agent =>
      agent.stop().catch(error => {
        this.logger.error(error as Error, `Parada do agente ${agent.name}`);
        return { agentId: agent.id, error };
      })
    );
    
    await Promise.allSettled(stopPromises);
    
    this.logger.info('AgentCoordinator parado com sucesso');
    this.emit('coordinator-stopped');
  }
  
  /**
   * Envia uma mensagem de um agente para outro
   */
  sendMessage(message: Omit<IAgentMessage, 'timestamp'>): void {
    const fullMessage: IAgentMessage = {
      ...message,
      timestamp: new Date(),
      correlationId: message.correlationId || this.generateCorrelationId()
    };
    
    // Verifica se a fila não está cheia
    if (this.messageQueue.length >= this.config.maxQueueSize!) {
      this.logger.warn('Fila de mensagens cheia, descartando mensagem mais antiga');
      this.messageQueue.shift();
    }
    
    this.messageQueue.push(fullMessage);
    this.emit('message-queued', fullMessage);
  }
  
  /**
   * Executa um agente específico
   */
  async executeAgent(agentId: string, params?: any): Promise<IExecutionResult> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agente com ID ${agentId} não encontrado`);
    }
    
    if (agent.status !== AgentStatus.READY) {
      throw new Error(`Agente ${agent.name} não está pronto para execução (status: ${agent.status})`);
    }
    
    return await agent.execute(params);
  }
  
  /**
   * Obtém o status de todos os agentes
   */
  async getAllAgentsStatus(): Promise<Map<string, {
    agent: IAgent;
    monitoring: Awaited<ReturnType<IAgent['monitor']>>;
  }>> {
    const statusMap = new Map();
    
    for (const [id, agent] of this.agents) {
      try {
        const monitoring = await agent.monitor();
        statusMap.set(id, { agent, monitoring });
      } catch (error) {
        this.logger.error(error as Error, `Monitoramento do agente ${agent.name}`);
        statusMap.set(id, {
          agent,
          monitoring: {
            status: agent.status,
            health: 'unhealthy' as const,
            metrics: { error: (error as Error).message }
          }
        });
      }
    }
    
    return statusMap;
  }
  
  /**
   * Obtém um agente específico
   */
  getAgent(agentId: string): IAgent | undefined {
    return this.agents.get(agentId);
  }
  
  /**
   * Lista todos os agentes registrados
   */
  listAgents(): IAgent[] {
    return Array.from(this.agents.values());
  }
  
  /**
   * Configura os listeners de eventos para um agente
   */
  private setupAgentListeners(agent: IAgent): void {
    // Re-emite eventos do agente com prefixo
    const events = ['initialized', 'executed', 'execution-error', 'stopped', 'message-processed', 'message-error'];
    
    events.forEach(event => {
      (agent as BaseAgent).on(event, (data) => {
        this.emit(`agent:${event}`, { agentId: agent.id, agentName: agent.name, ...data });
      });
    });
  }
  
  /**
   * Processa mensagens na fila
   */
  private async startMessageProcessing(): Promise<void> {
    while (this.isRunning) {
      if (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()!;
        
        try {
          const targetAgent = this.agents.get(message.to);
          if (targetAgent) {
            await targetAgent.handleMessage(message);
            this.emit('message-delivered', message);
          } else {
            this.logger.warn(`Agente de destino não encontrado: ${message.to}`);
            this.emit('message-delivery-failed', { message, reason: 'Agent not found' });
          }
        } catch (error) {
          this.logger.error(error as Error, 'Processamento de mensagem na fila');
          this.emit('message-processing-error', { message, error });
        }
      }
      
      // Pequena pausa para evitar uso excessivo de CPU
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  /**
   * Inicia o monitoramento periódico dos agentes
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      const status = await this.getAllAgentsStatus();
      
      // Emite evento com o status de todos os agentes
      this.emit('monitoring-update', {
        timestamp: new Date(),
        agents: Array.from(status.entries()).map(([id, data]) => ({
          id,
          name: data.agent.name,
          ...data.monitoring
        }))
      });
      
      // Verifica agentes com problemas
      const unhealthyAgents = Array.from(status.entries())
        .filter(([_, data]) => data.monitoring.health !== 'healthy');
      
      if (unhealthyAgents.length > 0) {
        this.logger.warn(`${unhealthyAgents.length} agentes com problemas detectados`);
        this.emit('unhealthy-agents-detected', unhealthyAgents);
      }
    }, this.config.monitoringIntervalMs!);
  }
  
  /**
   * Gera um ID de correlação único
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Obtém estatísticas do coordenador
   */
  getStatistics(): {
    totalAgents: number;
    runningAgents: number;
    queueSize: number;
    isRunning: boolean;
    uptime: number;
  } {
    const runningAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === AgentStatus.READY || agent.status === AgentStatus.EXECUTING)
      .length;
    
    return {
      totalAgents: this.agents.size,
      runningAgents,
      queueSize: this.messageQueue.length,
      isRunning: this.isRunning,
      uptime: process.uptime()
    };
  }
}

// Exporta instância singleton do coordenador
export const agentCoordinator = new AgentCoordinator({
  monitoringIntervalMs: 30000, // 30 segundos
  maxQueueSize: 1000
});