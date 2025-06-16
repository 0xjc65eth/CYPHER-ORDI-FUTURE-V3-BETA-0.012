// CYPHER AI v2 - Advanced Dialog Manager
// Gemini-like multi-turn conversation management

import EventEmitter from 'events';
import type { 
  ConversationMessage, 
  Intent, 
  EmotionType, 
  CypherAIConfig 
} from '../types';
import type { AdvancedIntent, ConversationContext } from '../nlu/AdvancedNLU';

export interface DialogState {
  phase: 'greeting' | 'exploration' | 'deep_dive' | 'action' | 'conclusion' | 'idle';
  topic?: string;
  subTopic?: string;
  pendingActions: string[];
  waitingForInput: boolean;
  lastResponse?: string;
  confidence: number;
  userSatisfaction?: 'high' | 'medium' | 'low';
  isActive: boolean;
  context?: any;
  metadata?: any;
}

export interface DialogNode {
  id: string;
  type: 'question' | 'information' | 'action' | 'clarification' | 'follow_up';
  content: string;
  nextNodes?: string[];
  conditions?: (context: ConversationContext) => boolean;
  requiredEntities?: string[];
  priority: number;
}

export interface ConversationPlan {
  id: string;
  currentNode?: DialogNode;
  nextNodes: DialogNode[];
  alternativeNodes: DialogNode[];
  context: any;
  goals: string[];
  steps?: any[];
  metadata?: any;
}

export class DialogManager extends EventEmitter {
  private config: CypherAIConfig;
  private state: DialogState = {
    phase: 'idle',
    pendingActions: [],
    waitingForInput: false,
    confidence: 0.7,
    isActive: false,
    context: {},
    metadata: {
      currentStep: 'idle',
      awaitingResponse: false,
      conversationActive: false,
      lastInteraction: new Date(),
      sessionId: ''
    }
  };
  private conversationPlan: ConversationPlan = {
    id: 'default',
    nextNodes: [],
    alternativeNodes: [],
    goals: [],
    context: {},
    steps: [],
    metadata: {
      currentStep: 0,
      goal: '',
      progress: 0
    }
  };
  private dialogNodes: Map<string, DialogNode> = new Map();
  private conversationHistory: ConversationMessage[] = [];
  private maxHistoryLength: number = 50;

  constructor(config: CypherAIConfig) {
    super();
    this.config = config;
    this.initializeState();
    this.buildDialogNodes();
    this.initializeConversationPlan();
  }

  private initializeState(): void {
    this.state = {
      phase: 'idle',
      pendingActions: [],
      waitingForInput: false,
      confidence: 0.5,
      isActive: false,
      context: {},
      metadata: {}
    };
  }

  private buildDialogNodes(): void {
    // Greeting nodes
    this.dialogNodes.set('greeting_initial', {
      id: 'greeting_initial',
      type: 'question',
      content: 'Olá! Sou a CYPHER AI, sua assistente especializada em Bitcoin e criptomoedas. Como posso ajudar você hoje?',
      nextNodes: ['price_inquiry', 'market_analysis', 'trading_help', 'general_help'],
      priority: 10
    });

    this.dialogNodes.set('greeting_returning', {
      id: 'greeting_returning',
      type: 'question',
      content: 'Que bom te ver novamente! Continuamos nossa conversa sobre {topic}?',
      nextNodes: ['continue_topic', 'new_topic'],
      priority: 9
    });

    // Price inquiry flow
    this.dialogNodes.set('price_inquiry', {
      id: 'price_inquiry',
      type: 'information',
      content: 'Claro! O Bitcoin está cotado a ${price}, {change} nas últimas 24h. Quer que eu aprofunde em algum aspecto específico?',
      nextNodes: ['technical_analysis', 'market_context', 'trading_suggestion'],
      priority: 8
    });

    this.dialogNodes.set('technical_analysis', {
      id: 'technical_analysis',
      type: 'information',
      content: 'Baseado na análise técnica, vejo {trend_description}. Os principais níveis de suporte estão em ${support} e resistência em ${resistance}.',
      nextNodes: ['trading_strategy', 'risk_assessment', 'more_indicators'],
      priority: 7
    });

    // Market analysis flow
    this.dialogNodes.set('market_analysis', {
      id: 'market_analysis',
      type: 'information',
      content: 'O mercado crypto está {market_sentiment} hoje. Bitcoin mostra {btc_trend} com volume de ${volume}. Quer uma análise mais específica?',
      nextNodes: ['fundamental_analysis', 'sentiment_analysis', 'correlation_analysis'],
      priority: 8
    });

    this.dialogNodes.set('sentiment_analysis', {
      id: 'sentiment_analysis',
      type: 'information',
      content: 'O sentimento do mercado está {sentiment_level} com Fear & Greed Index em {fear_greed}. Isso indica {sentiment_interpretation}.',
      nextNodes: ['trading_implication', 'historical_comparison', 'market_psychology'],
      priority: 6
    });

    // Trading flow
    this.dialogNodes.set('trading_help', {
      id: 'trading_help',
      type: 'question',
      content: 'Perfeito para trading! Você está pensando em comprar, vender, ou quer uma análise geral primeiro?',
      nextNodes: ['buy_analysis', 'sell_analysis', 'general_strategy'],
      priority: 8
    });

    this.dialogNodes.set('buy_analysis', {
      id: 'buy_analysis',
      type: 'information',
      content: 'Para uma entrada em Bitcoin, considere: Preço atual ${price}, próximo suporte ${support}. {risk_assessment}',
      nextNodes: ['position_sizing', 'entry_strategy', 'risk_management'],
      requiredEntities: ['amount'],
      priority: 7
    });

    this.dialogNodes.set('position_sizing', {
      id: 'position_sizing',
      type: 'question',
      content: 'Qual percentual do seu portfolio você está pensando em alocar? Recomendo não mais que {recommended_percentage}% para esta operação.',
      nextNodes: ['calculate_position', 'risk_explanation'],
      priority: 6
    });

    // Deep dive nodes
    this.dialogNodes.set('deep_analysis', {
      id: 'deep_analysis',
      type: 'information',
      content: 'Vamos mais fundo! {detailed_analysis}. Isso impacta {implications}.',
      nextNodes: ['actionable_insights', 'comparative_analysis', 'future_outlook'],
      priority: 5
    });

    // Action nodes
    this.dialogNodes.set('execute_trade', {
      id: 'execute_trade',
      type: 'action',
      content: 'Entendi! Você quer {action} {amount} de {asset} a ${price}. Confirma os detalhes?',
      nextNodes: ['confirm_trade', 'modify_trade', 'cancel_trade'],
      requiredEntities: ['action', 'amount', 'asset'],
      priority: 9
    });

    // Clarification nodes
    this.dialogNodes.set('clarify_amount', {
      id: 'clarify_amount',
      type: 'clarification',
      content: 'Qual quantidade você tem em mente? Pode me dizer em BTC, USD ou percentual do portfolio?',
      nextNodes: ['amount_specified'],
      priority: 8
    });

    this.dialogNodes.set('clarify_timeframe', {
      id: 'clarify_timeframe',
      type: 'clarification',
      content: 'Para qual período você está analisando? Curto prazo (dias), médio prazo (semanas) ou longo prazo (meses)?',
      nextNodes: ['timeframe_specified'],
      priority: 7
    });

    // Follow-up nodes
    this.dialogNodes.set('satisfaction_check', {
      id: 'satisfaction_check',
      type: 'follow_up',
      content: 'Esta informação foi útil? Há mais alguma coisa que posso esclarecer sobre {topic}?',
      nextNodes: ['continue_exploration', 'new_topic', 'end_conversation'],
      priority: 4
    });

    this.dialogNodes.set('proactive_suggestion', {
      id: 'proactive_suggestion',
      type: 'follow_up',
      content: 'Baseado no que conversamos, você pode se interessar por {suggestion}. Quer que eu explique?',
      nextNodes: ['explore_suggestion', 'decline_suggestion'],
      priority: 3
    });
  }

  private initializeConversationPlan(): void {
    this.conversationPlan = {
      id: 'main_conversation_flow',
      nextNodes: [this.dialogNodes.get('greeting_initial')!],
      alternativeNodes: [],
      context: {},
      goals: ['understand_user_needs', 'provide_value', 'maintain_engagement']
    };
  }

  async planNextResponse(
    userIntent: AdvancedIntent, 
    marketContext: any,
    conversationContext: ConversationContext
  ): Promise<{
    content: string;
    emotion: EmotionType;
    confidence: number;
    suggestions?: string[];
    requiresFollowUp?: boolean;
    nextTopics?: string[];
  }> {
    // Update state based on intent
    this.updateStateFromIntent(userIntent);
    
    // Select appropriate dialog node
    const selectedNode = this.selectDialogNode(userIntent, conversationContext);
    
    // Generate contextual response
    const response = await this.generateContextualResponse(
      selectedNode, 
      userIntent, 
      marketContext, 
      conversationContext
    );
    
    // Plan next conversation steps
    const nextSteps = this.planNextSteps(selectedNode, userIntent);
    
    // Update conversation plan
    this.updateConversationPlan(selectedNode, nextSteps);
    
    return {
      content: response.content,
      emotion: response.emotion,
      confidence: response.confidence,
      suggestions: response.suggestions,
      requiresFollowUp: response.requiresFollowUp,
      nextTopics: nextSteps.nextTopics
    };
  }

  private updateStateFromIntent(intent: AdvancedIntent): void {
    // Update phase based on intent
    switch (intent.category) {
      case 'conversation':
        this.state.phase = intent.name === 'greeting' ? 'greeting' : this.state.phase;
        break;
      case 'market':
      case 'analysis':
        this.state.phase = 'exploration';
        break;
      case 'trading':
        this.state.phase = 'action';
        break;
      case 'information':
        this.state.phase = 'deep_dive';
        break;
    }

    // Update topic
    if (intent.category !== 'conversation') {
      if (this.state.metadata) {
        this.state.metadata.topic = intent.category;
        this.state.metadata.subTopic = intent.subIntent;
      }
    }

    // Update confidence
    if (this.state.metadata) {
      this.state.metadata.confidence = intent.confidence || 0.5;
    }

    // Handle pending actions
    if (intent.requiresAction) {
      this.state.pendingActions.push(intent.name);
    }
  }

  private selectDialogNode(
    intent: AdvancedIntent, 
    context: ConversationContext
  ): DialogNode {
    // Get candidate nodes based on current phase and intent
    const candidateNodes = this.getCandidateNodes(intent);
    
    // Score nodes based on relevance
    const scoredNodes = candidateNodes.map(node => ({
      node,
      score: this.scoreNode(node, intent, context)
    }));
    
    // Sort by score and return best match
    scoredNodes.sort((a, b) => b.score - a.score);
    
    return scoredNodes[0]?.node || this.getDefaultNode(intent);
  }

  private getCandidateNodes(intent: AdvancedIntent): DialogNode[] {
    const nodes: DialogNode[] = [];
    
    // Add nodes based on intent category
    switch (intent.category) {
      case 'conversation':
        if (intent.name === 'greeting') {
          nodes.push(
            this.dialogNodes.get('greeting_initial')!,
            this.dialogNodes.get('greeting_returning')!
          );
        }
        break;
        
      case 'market':
        nodes.push(
          this.dialogNodes.get('price_inquiry')!,
          this.dialogNodes.get('market_analysis')!
        );
        break;
        
      case 'trading':
        nodes.push(
          this.dialogNodes.get('trading_help')!,
          this.dialogNodes.get('buy_analysis')!,
          this.dialogNodes.get('execute_trade')!
        );
        break;
        
      case 'analysis':
        nodes.push(
          this.dialogNodes.get('technical_analysis')!,
          this.dialogNodes.get('sentiment_analysis')!,
          this.dialogNodes.get('deep_analysis')!
        );
        break;
    }
    
    // Add clarification nodes if needed
    if (this.needsClarification(intent)) {
      nodes.push(...this.getClarificationNodes(intent));
    }
    
    return nodes.filter(Boolean);
  }

  private scoreNode(
    node: DialogNode, 
    intent: AdvancedIntent, 
    context: ConversationContext
  ): number {
    let score = node.priority;
    
    // Boost for matching type
    if (this.nodeMatchesIntent(node, intent)) {
      score += 5;
    }
    
    // Boost for having required entities
    if (node.requiredEntities) {
      const hasEntities = node.requiredEntities.every(entity => 
        intent.entities && intent.entities[entity as keyof typeof intent.entities]
      );
      score += hasEntities ? 3 : -2;
    }
    
    // Boost for conversation flow continuity
    if (this.conversationPlan.currentNode?.nextNodes?.includes(node.id)) {
      score += 4;
    }
    
    // Boost for conditions match
    if (node.conditions && node.conditions(context)) {
      score += 2;
    }
    
    return score;
  }

  private nodeMatchesIntent(node: DialogNode, intent: AdvancedIntent): boolean {
    const intentNodeMap: Record<string, string[]> = {
      'greeting': ['greeting_initial', 'greeting_returning'],
      'price_check': ['price_inquiry'],
      'market_analysis': ['market_analysis', 'technical_analysis'],
      'trading_intent': ['trading_help', 'buy_analysis', 'execute_trade'],
      'help_request': ['general_help']
    };
    
    return intentNodeMap[intent.name]?.includes(node.id) || false;
  }

  private needsClarification(intent: AdvancedIntent): boolean {
    // Check if intent requires clarification
    if (intent.category === 'trading' && !intent.entities?.amount) {
      return true;
    }
    
    if (intent.category === 'analysis' && !intent.entities?.timeframe) {
      return true;
    }
    
    return false;
  }

  private getClarificationNodes(intent: AdvancedIntent): DialogNode[] {
    const nodes: DialogNode[] = [];
    
    if (intent.category === 'trading' && !intent.entities?.amount) {
      nodes.push(this.dialogNodes.get('clarify_amount')!);
    }
    
    if (intent.category === 'analysis' && !intent.entities?.timeframe) {
      nodes.push(this.dialogNodes.get('clarify_timeframe')!);
    }
    
    return nodes.filter(Boolean);
  }

  private getDefaultNode(intent: AdvancedIntent): DialogNode {
    // Return appropriate default based on phase
    switch (this.state.phase) {
      case 'idle':
        return this.dialogNodes.get('greeting_initial')!;
      case 'greeting':
        return this.dialogNodes.get('greeting_initial')!;
      default:
        return {
          id: 'fallback',
          type: 'information',
          content: 'Entendi sua pergunta. Deixe-me te dar uma resposta abrangente sobre isso.',
          priority: 1
        };
    }
  }

  private async generateContextualResponse(
    node: DialogNode,
    intent: AdvancedIntent,
    marketContext: any,
    conversationContext: ConversationContext
  ): Promise<{
    content: string;
    emotion: EmotionType;
    confidence: number;
    suggestions?: string[];
    requiresFollowUp?: boolean;
  }> {
    // Template replacement
    let content = this.interpolateTemplate(node.content, {
      ...intent.entities,
      ...marketContext,
      ...conversationContext,
      topic: this.state.topic,
      phase: this.state.phase
    });
    
    // Add personality and emotional context
    content = this.applyPersonalityToResponse(content);
    
    // Generate follow-up suggestions
    const suggestions = this.generateSmartSuggestions(node, intent);
    
    // Determine emotion
    const emotion = this.determineResponseEmotion(intent, marketContext);
    
    // Calculate response confidence
    const confidence = this.calculateResponseConfidence(node, intent, marketContext);
    
    return {
      content,
      emotion,
      confidence,
      suggestions,
      requiresFollowUp: node.type === 'question' || suggestions.length > 0
    };
  }

  private interpolateTemplate(template: string, context: any): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const value = context[key];
      if (value !== undefined) {
        if (typeof value === 'number') {
          return value.toLocaleString();
        }
        return String(value);
      }
      return match;
    });
  }

  private applyPersonalityToResponse(content: string): string {
    // Apply personality based on config
    switch (this.config.personality.name) {
      case 'friendly':
        content = '😊 ' + content;
        break;
      case 'professional':
        content = content.replace(/!/g, '.');
        break;
      case 'expert':
        content = content.replace(/simples/g, 'técnico');
        break;
    }
    
    return content;
  }

  private generateSmartSuggestions(node: DialogNode, intent: AdvancedIntent): string[] {
    const suggestions: string[] = [];
    
    // Add node-specific suggestions
    if (node.nextNodes) {
      const nextNodes = node.nextNodes
        .map(id => this.dialogNodes.get(id))
        .filter(Boolean);
        
      suggestions.push(...nextNodes.slice(0, 3).map(node => 
        this.nodeToSuggestion(node!)
      ));
    }
    
    // Add intent-specific suggestions
    if (intent.followUp) {
      suggestions.push(...intent.followUp.slice(0, 2));
    }
    
    // Add contextual suggestions
    suggestions.push(...this.getContextualSuggestions());
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
  }

  private nodeToSuggestion(node: DialogNode): string {
    const suggestionMap: Record<string, string> = {
      'technical_analysis': 'Ver análise técnica',
      'market_context': 'Contexto do mercado',
      'trading_suggestion': 'Sugestões de trading',
      'risk_assessment': 'Avaliação de risco',
      'position_sizing': 'Calcular posição'
    };
    
    return suggestionMap[node.id] || node.content.split('.')[0];
  }

  private getContextualSuggestions(): string[] {
    const suggestions: string[] = [];
    
    switch (this.state.topic) {
      case 'market':
        suggestions.push('Ver gráficos', 'Análise on-chain');
        break;
      case 'trading':
        suggestions.push('Gerenciar risco', 'Configurar alertas');
        break;
      case 'analysis':
        suggestions.push('Dados históricos', 'Correlações');
        break;
    }
    
    return suggestions;
  }

  private determineResponseEmotion(intent: AdvancedIntent, marketContext: any): EmotionType {
    // Use intent emotion if available
    if (intent.emotionalTone) {
      return intent.emotionalTone;
    }
    
    // Determine based on market context
    if (marketContext?.bitcoin?.change24h > 5) {
      return 'excited';
    } else if (marketContext?.bitcoin?.change24h < -5) {
      return 'concerned';
    }
    
    // Default based on intent category
    switch (intent.category) {
      case 'conversation':
        return 'happy';
      case 'analysis':
        return 'analytical';
      case 'trading':
        return 'confident';
      default:
        return 'neutral';
    }
  }

  private calculateResponseConfidence(
    node: DialogNode, 
    intent: AdvancedIntent, 
    marketContext: any
  ): number {
    let confidence = intent.confidence || 0.5;
    
    // Boost for high-priority nodes
    confidence += (node.priority / 10) * 0.1;
    
    // Boost for having market data
    if (marketContext && Object.keys(marketContext).length > 0) {
      confidence += 0.1;
    }
    
    // Boost for conversation continuity
    if (this.state.metadata?.phase !== 'idle') {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 0.98);
  }

  private planNextSteps(node: DialogNode, intent: AdvancedIntent): {
    nextTopics: string[];
    suggestedActions: string[];
  } {
    const nextTopics: string[] = [];
    const suggestedActions: string[] = [];
    
    // Plan based on current node
    if (node.nextNodes) {
      nextTopics.push(...node.nextNodes.slice(0, 3));
    }
    
    // Plan based on intent
    if (intent.requiresAction) {
      suggestedActions.push(`execute_${intent.name}`);
    }
    
    if (intent.requiresData) {
      suggestedActions.push(`fetch_data_for_${intent.category}`);
    }
    
    return { nextTopics, suggestedActions };
  }

  private updateConversationPlan(
    currentNode: DialogNode, 
    nextSteps: { nextTopics: string[]; suggestedActions: string[] }
  ): void {
    this.conversationPlan.currentNode = currentNode;
    this.conversationPlan.nextNodes = nextSteps.nextTopics
      .map(id => this.dialogNodes.get(id))
      .filter(Boolean) as DialogNode[];
    
    // Update goals based on progress
    this.updateConversationGoals();
  }

  private updateConversationGoals(): void {
    const goals: string[] = ['maintain_engagement'];
    
    switch (this.state.phase) {
      case 'greeting':
        goals.push('understand_user_needs');
        break;
      case 'exploration':
        goals.push('provide_comprehensive_info');
        break;
      case 'action':
        goals.push('facilitate_safe_trading');
        break;
      case 'deep_dive':
        goals.push('deliver_expert_insights');
        break;
    }
    
    this.conversationPlan.goals = goals;
  }

  addToHistory(message: ConversationMessage): void {
    this.conversationHistory.push(message);
    
    // Maintain history length
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  getState(): DialogState {
    return { ...this.state };
  }

  getConversationPlan(): ConversationPlan {
    return { ...this.conversationPlan };
  }

  resetConversation(): void {
    this.initializeState();
    this.initializeConversationPlan();
    this.conversationHistory = [];
  }
}