// CYPHER AI v2 - Core Module
// Enhanced with Gemini-like capabilities

import EventEmitter from 'events';
import { VoiceModule } from './voice/VoiceModule';
import { ConversationModule } from './conversation/ConversationModule';
import { KnowledgeModule } from './knowledge/KnowledgeModule';
import { ActionsModule } from './actions/ActionsModule';
import { ServicesModule } from './services/ServicesModule';
import { AdvancedNLU } from './nlu/AdvancedNLU';
import { DialogManager } from './dialog/DialogManager';
import { StreamingResponse } from './streaming/StreamingResponse';
import { CypherConfig } from './config';
import type { 
  CypherAIConfig, 
  ConversationMessage, 
  MarketData,
  VoiceConfig,
  AIPersonality,
  CommandResult
} from './types';
import type { AdvancedIntent, ConversationContext } from './nlu/AdvancedNLU';

export class CypherAI extends EventEmitter {
  private voice: VoiceModule;
  private conversation: ConversationModule;
  private knowledge: KnowledgeModule;
  private actions: ActionsModule;
  private services: ServicesModule;
  private nlu: AdvancedNLU;
  private dialogManager: DialogManager;
  private streamingResponse: StreamingResponse;
  private config: CypherAIConfig;
  private isInitialized: boolean = false;
  private conversationContext: ConversationContext;

  constructor(config: Partial<CypherAIConfig>) {
    super();
    this.config = { ...CypherConfig.defaultConfig, ...config };
    
    // Initialize core modules
    this.voice = new VoiceModule(this.config);
    this.conversation = new ConversationModule(this.config);
    this.knowledge = new KnowledgeModule(this.config);
    this.actions = new ActionsModule(this.config);
    this.services = new ServicesModule(this.config);
    
    // Initialize advanced modules
    this.nlu = new AdvancedNLU();
    this.dialogManager = new DialogManager(this.config);
    this.streamingResponse = new StreamingResponse({
      chunkSize: 12,
      delayBetweenChunks: 80,
      enableTypewriterEffect: true,
      adaptiveSpeed: true
    });
    
    // Initialize conversation context
    this.conversationContext = {
      entities: {},
      conversationFlow: [],
      topic: undefined,
      userProfile: {
        expertise: 'intermediate',
        interests: ['bitcoin', 'trading'],
        preferences: {}
      },
      sessionMemory: []
    };
    
    this.setupEventHandlers();
    this.setupStreamingHandlers();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Inicializando CYPHER AI v2 com capacidades Gemini-like...');
      
      // Initialize all modules
      await Promise.all([
        this.voice.initialize(),
        this.conversation.initialize(),
        this.knowledge.initialize(),
        this.actions.initialize(),
        this.services.initialize()
      ]);

      this.isInitialized = true;
      this.emit('initialized', {
        version: '2.0.0',
        capabilities: ['advanced_nlu', 'dialog_management', 'streaming_responses'],
        personality: this.config.personality
      });
      
      console.log('✅ CYPHER AI v2 inicializada com sucesso!');
      
      // Start market monitoring
      this.startMarketMonitoring();
      
    } catch (error) {
      console.error('❌ Erro ao inicializar CYPHER AI:', error);
      throw error;
    }
  }

  // Método principal para processar comandos de voz
  async startListening(): Promise<void> {
    this.emit('stateChange', { isListening: true });
    
    try {
      // Setup voice module event listeners
      this.voice.removeAllListeners('transcription');
      this.voice.removeAllListeners('voiceAmplitude');
      
      this.voice.on('transcription', async (text: string) => {
        console.log('🎤 Transcrição recebida:', text);
        await this.processText(text);
      });
      
      this.voice.on('voiceAmplitude', (amplitude: number) => {
        this.emit('voiceAmplitude', amplitude);
      });
      
      // Start listening
      await this.voice.startListening();

    } catch (error) {
      console.error('Erro ao iniciar escuta:', error);
      this.emit('stateChange', { isListening: false });
    }
  }

  async stopListening(): Promise<void> {
    await this.voice.stopListening();
    this.emit('stateChange', { isListening: false });
  }

  // Enhanced text processing with Gemini-like capabilities
  async processText(text: string): Promise<void> {
    console.log('🧠 Processando entrada com NLU avançado:', text.substring(0, 50) + '...');
    
    // Add user message
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    this.emit('message', userMessage);
    this.dialogManager.addToHistory(userMessage);
    this.conversationContext.sessionMemory.push(userMessage);

    // Indicate processing with streaming awareness
    this.emit('stateChange', { 
      isProcessing: true, 
      isThinking: true,
      useStreaming: true
    });

    try {
      // 1. Advanced NLU processing
      const advancedIntent = await this.nlu.processInput(text, this.conversationContext.sessionMemory);
      console.log('🎯 Intent detectado:', advancedIntent.name, 'Confiança:', advancedIntent.confidence);
      
      // 2. Fetch market context if needed
      let marketContext = {};
      if (advancedIntent.requiresData) {
        console.log('📊 Buscando dados de mercado...');
        marketContext = await this.knowledge.getMarketContext(advancedIntent.entities);
      }

      // 3. Generate enhanced response with Gemini integration
      console.log('🧠 Gerando resposta com Gemini integration...');
      const responseData = await this.conversation.generateEnhancedResponse({
        text,
        intent: advancedIntent,
        marketContext,
        conversationContext: this.conversationContext
      });
      
      const isUsingGemini = this.conversation.isUsingGemini();
      console.log(isUsingGemini ? '🤖 Resposta gerada com Gemini Pro' : '📝 Resposta gerada com sistema básico');

      // 4. Execute actions if needed
      if (advancedIntent.requiresAction) {
        console.log('⚡ Executando ação:', advancedIntent.action);
        await this.executeAction(advancedIntent.action!, advancedIntent.entities);
      }

      // 5. Stream response in chunks (Gemini-like)
      const aiMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '', // Will be built through streaming
        timestamp: new Date(),
        emotion: responseData.emotion,
        confidence: responseData.confidence,
        data: { 
          ...marketContext, 
          suggestions: responseData.suggestions,
          followUpQuestions: responseData.data?.followUpQuestions,
          source: responseData.data?.source
        }
      };
      
      // Emit empty message first, then stream content
      this.emit('message', aiMessage);
      this.emit('stateChange', { isProcessing: false, isThinking: false, isStreaming: true });
      
      // Stream the response
      const streamedContent = await this.streamingResponse.streamResponse(
        responseData.text,
        responseData.emotion,
        { confidence: responseData.confidence }
      );
      
      // Update message with complete content
      aiMessage.content = streamedContent;
      this.emit('messageUpdate', aiMessage);
      this.dialogManager.addToHistory(aiMessage);
      
      // Stream market data if available
      if (marketContext && Object.keys(marketContext).length > 0) {
        await this.streamingResponse.streamMarketData(marketContext);
      }
      
      // Stream suggestions and follow-up questions
      if (responseData.suggestions && responseData.suggestions.length > 0) {
        this.emit('suggestions', responseData.suggestions);
      }
      
      if (responseData.data?.followUpQuestions && responseData.data.followUpQuestions.length > 0) {
        this.emit('followUpQuestions', responseData.data.followUpQuestions);
      }
      
      this.emit('stateChange', { isStreaming: false });

      // 6. Voice synthesis (if enabled)
      if (this.config.voiceEnabled && streamedContent) {
        try {
          console.log('🔊 Iniciando síntese de voz streaming...');
          this.emit('stateChange', { isSpeaking: true });
          await this.voice.speak(streamedContent, responseData.emotion || 'neutral');
          this.emit('stateChange', { isSpeaking: false });
        } catch (error) {
          console.error('❌ Erro na síntese de voz:', error);
          this.emit('stateChange', { isSpeaking: false });
        }
      }

    } catch (error) {
      console.error('❌ Erro no processamento avançado:', error);
      this.handleError(error);
    } finally {
      this.emit('stateChange', { 
        isProcessing: false, 
        isThinking: false, 
        isStreaming: false 
      });
    }
  }

  // Processar comando direto
  async processCommand(command: string): Promise<CommandResult> {
    try {
      const result = await this.actions.executeCommand(command);
      
      // Gerar mensagem sobre o resultado
      const message = await this.conversation.generateCommandResponse(command, result);
      
      const aiMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: message,
        timestamp: new Date(),
        data: result
      };
      this.emit('message', aiMessage);
      
      return result;
    } catch (error) {
      console.error('Erro ao processar comando:', error);
      throw error;
    }
  }

  // Executar ação baseada na intenção
  private async executeAction(action: string, entities: any): Promise<void> {
    switch (action) {
      case 'buy_crypto':
        await this.actions.executeTrade({
          type: 'buy',
          asset: entities.asset,
          amount: entities.amount
        });
        break;
        
      case 'sell_crypto':
        await this.actions.executeTrade({
          type: 'sell',
          asset: entities.asset,
          amount: entities.amount
        });
        break;
        
      case 'set_alert':
        await this.actions.setAlert({
          asset: entities.asset,
          price: entities.price,
          condition: entities.condition
        });
        break;
        
      case 'analyze_market':
        const analysis = await this.knowledge.analyzeMarket(entities.asset);
        this.emit('marketAnalysis', analysis);
        break;
    }
  }

  // Monitoramento contínuo de mercado
  private startMarketMonitoring(): void {
    setInterval(async () => {
      try {
        const marketData = await this.knowledge.getMarketData();
        this.emit('marketUpdate', marketData);
        
        // Verificar alertas
        const alerts = await this.actions.checkAlerts(marketData);
        if (alerts.length > 0) {
          for (const alert of alerts) {
            const message: ConversationMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: alert.message,
              timestamp: new Date(),
              emotion: 'excited',
              data: alert.data
            };
            this.emit('message', message);
            
            if (this.config.voiceEnabled && alert.message) {
              try {
                await this.voice.speak(alert.message, 'excited');
              } catch (error) {
                console.error('Erro ao falar alerta:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro no monitoramento de mercado:', error);
      }
    }, 30000); // A cada 30 segundos
  }

  // Verificar se precisa dados de mercado
  private requiresMarketData(intent: any): boolean {
    const marketIntents = [
      'price_check',
      'market_analysis',
      'portfolio_status',
      'trading_opportunity',
      'technical_analysis'
    ];
    return marketIntents.includes(intent.name);
  }

  // Calcular amplitude do áudio
  private calculateAmplitude(audioData: any): number {
    // Implementação simplificada
    return Math.random() * 100;
  }

  // Enhanced event handlers for all modules
  private setupEventHandlers(): void {
    // Core module events
    this.voice.on('error', (error) => this.emit('error', error));
    this.conversation.on('emotion', (emotion) => this.emit('emotion', emotion));
    this.knowledge.on('insight', (insight) => this.emit('insight', insight));
    this.actions.on('actionCompleted', (action) => this.emit('actionCompleted', action));
    
    // Advanced module events
    this.nlu.on('intentDetected', (intent) => {
      console.log('🎯 Intent detectado:', intent.name);
      this.emit('intentDetected', intent);
    });
    
    this.dialogManager.on('stateChange', (state) => {
      this.emit('dialogStateChange', state);
    });
    
    // Voice amplitude for visual feedback
    this.voice.on('amplitude', (amplitude) => {
      this.emit('voiceAmplitude', amplitude);
    });
  }
  
  private setupStreamingHandlers(): void {
    // Setup streaming response handlers
    this.streamingResponse.on('chunk', (data) => {
      this.emit('streamChunk', {
        content: data.chunk.content,
        progress: data.progress,
        emotion: data.chunk.emotion,
        isComplete: data.chunk.isComplete
      });
    });
    
    this.streamingResponse.on('marketData', (data) => {
      this.emit('streamMarketData', data);
    });
    
    this.streamingResponse.on('tradingAnalysis', (data) => {
      this.emit('streamTradingAnalysis', data);
    });
    
    this.streamingResponse.on('streamComplete', (data) => {
      console.log('✅ Stream completo:', data.streamId);
      this.emit('streamComplete', data);
    });
  }

  // Tratamento de erros
  private handleError(error: any): void {
    const errorMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Ops! Tive um probleminha técnico. Pode repetir, por favor? 🤔',
      timestamp: new Date(),
      emotion: 'concerned'
    };
    this.emit('message', errorMessage);
  }

  // Métodos de configuração
  setPersonality(personality: AIPersonality): void {
    this.config.personality = personality;
    this.conversation.setPersonality(personality);
  }

  setVoiceConfig(config: Partial<VoiceConfig> & { enabled?: boolean }): void {
    // Update main config
    if (config.enabled !== undefined) {
      this.config.voiceEnabled = config.enabled;
      console.log('🔊 VoiceEnabled configurado para:', config.enabled);
    }
    
    // Propagate to voice module
    this.voice.setConfig(config);
  }

  // Destruir instância
  async destroy(): Promise<void> {
    console.log('🔄 Desligando CYPHER AI v2...');
    
    // Cancel all active streams
    this.streamingResponse.cancelAllStreams();
    
    // Destroy all modules
    await Promise.all([
      this.voice.destroy(),
      this.conversation.destroy(),
      this.knowledge.destroy(),
      this.actions.destroy(),
      this.services.destroy()
    ]);
    
    // Clear advanced module states
    this.nlu.clearSession();
    this.dialogManager.resetConversation();
    
    this.removeAllListeners();
    this.isInitialized = false;
    
    console.log('✅ CYPHER AI v2 desligada com sucesso');
  }
  
  // New advanced methods
  async setUserExpertise(level: 'beginner' | 'intermediate' | 'expert'): Promise<void> {
    this.nlu.updateUserProfile({ expertise: level });
    console.log(`👤 Nível de expertise atualizado para: ${level}`);
  }
  
  async addUserInterest(interest: string): Promise<void> {
    const currentInterests = this.nlu.getContext().userProfile.interests;
    if (!currentInterests.includes(interest)) {
      this.nlu.updateUserProfile({ 
        interests: [...currentInterests, interest] 
      });
      console.log(`🎯 Novo interesse adicionado: ${interest}`);
    }
  }
  
  getConversationInsights(): any {
    const context = this.nlu.getContext();
    const dialogState = this.dialogManager.getState();
    
    return {
      userProfile: context.userProfile,
      currentTopic: dialogState.topic,
      conversationPhase: dialogState.phase,
      confidence: dialogState.confidence,
      recentFlow: context.conversationFlow.slice(-5)
    };
  }

  // Enhanced getters for advanced features
  get isListening(): boolean {
    return this.voice.isListening;
  }

  get isSpeaking(): boolean {
    return this.voice.isSpeaking;
  }

  get marketData(): MarketData | null {
    return this.knowledge.currentMarketData;
  }

  get conversationHistory(): ConversationMessage[] {
    return this.conversation.getHistory();
  }
  
  get dialogState() {
    return this.dialogManager.getState();
  }
  
  get conversationPlan() {
    return this.dialogManager.getConversationPlan();
  }
  
  get nluContext() {
    return this.nlu.getContext();
  }
  
  get streamingStats() {
    return {
      activeStreams: this.streamingResponse.getActiveStreamsCount(),
      isStreaming: this.streamingResponse.getActiveStreamsCount() > 0
    };
  }
  
  // Gemini integration control methods
  async enableGemini(): Promise<boolean> {
    return await this.conversation.switchToGemini();
  }
  
  disableGemini(): void {
    this.conversation.switchToBasic();
  }
  
  get isUsingGemini(): boolean {
    return this.conversation.isUsingGemini();
  }
  
  async clearGeminiHistory(): Promise<void> {
    await this.conversation.clearGeminiHistory();
  }
}

// Exportar tipos
export * from './types';