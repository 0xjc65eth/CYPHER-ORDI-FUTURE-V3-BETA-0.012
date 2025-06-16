// AI Orchestrator for CYPHER AI v2
// Intelligent fallback system that manages all AI APIs

import { OpenAIIntegration } from './OpenAIIntegration';
import { GeminiIntegration } from '../gemini/GeminiIntegration';
import { ElevenLabsIntegration } from './ElevenLabsIntegration';
import { AssemblyAIIntegration } from './AssemblyAIIntegration';
import { SmartResponseGenerator } from '../conversation/SmartResponseGenerator';
import type { CypherAIConfig, EmotionType, Intent } from '../types';

interface ResponseResult {
  text: string;
  confidence: number;
  source: 'openai' | 'gemini' | 'smart-generator' | 'fallback';
  emotion?: EmotionType;
  metadata?: any;
}

interface VoiceResult {
  audioBuffer?: ArrayBuffer;
  success: boolean;
  source: 'elevenlabs' | 'browser-tts' | 'fallback';
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  source: 'assemblyai' | 'browser-speech' | 'fallback';
  metadata?: any;
}

export class AIOrchestrator {
  private openai: OpenAIIntegration | null = null;
  private gemini: GeminiIntegration | null = null;
  private elevenlabs: ElevenLabsIntegration | null = null;
  private assemblyai: AssemblyAIIntegration | null = null;
  private smartResponse: SmartResponseGenerator;
  private config: CypherAIConfig;
  private isInitialized: boolean = false;

  // API availability status
  private apiStatus = {
    openai: false,
    gemini: false,
    elevenlabs: false,
    assemblyai: false
  };

  constructor(config: CypherAIConfig) {
    this.config = config;
    this.smartResponse = new SmartResponseGenerator();
    
    // Initialize all available APIs
    this.initializeAPIs();
  }

  private async initializeAPIs(): Promise<void> {
    console.log('🚀 Inicializando todas as APIs de IA...');
    
    // Initialize OpenAI
    if (this.config.apiKeys?.openai) {
      try {
        this.openai = new OpenAIIntegration(this.config);
        await this.openai.initialize();
        this.apiStatus.openai = true;
        console.log('✅ OpenAI GPT-4 ativo');
      } catch (error) {
        console.warn('⚠️ OpenAI falhou:', error);
      }
    }

    // Initialize Gemini
    if (this.config.apiKeys?.gemini) {
      try {
        this.gemini = new GeminiIntegration(this.config);
        await this.gemini.initialize();
        this.apiStatus.gemini = true;
        console.log('✅ Google Gemini Pro ativo');
      } catch (error) {
        console.warn('⚠️ Gemini falhou:', error);
      }
    }

    // Initialize ElevenLabs
    if (this.config.apiKeys?.elevenlabs) {
      try {
        this.elevenlabs = new ElevenLabsIntegration(this.config);
        await this.elevenlabs.initialize();
        this.apiStatus.elevenlabs = true;
        console.log('✅ ElevenLabs TTS ativo');
      } catch (error) {
        console.warn('⚠️ ElevenLabs falhou:', error);
      }
    }

    // Initialize AssemblyAI
    if (this.config.apiKeys?.assemblyai) {
      try {
        this.assemblyai = new AssemblyAIIntegration(this.config);
        await this.assemblyai.initialize();
        this.apiStatus.assemblyai = true;
        console.log('✅ AssemblyAI STT ativo');
      } catch (error) {
        console.warn('⚠️ AssemblyAI falhou:', error);
      }
    }

    this.isInitialized = true;
    this.logApiStatus();
  }

  private logApiStatus(): void {
    const activeApis = Object.entries(this.apiStatus)
      .filter(([_, active]) => active)
      .map(([name, _]) => name.toUpperCase());
    
    console.log(`🤖 CYPHER AI v2 - APIs ativas: ${activeApis.join(', ')}`);
    console.log(`📊 Status: ${activeApis.length}/4 APIs funcionando`);
  }

  // RESPONSE GENERATION with intelligent fallback
  async generateResponse(params: {
    prompt: string;
    context?: string;
    intent?: Intent;
    marketData?: any;
    temperature?: number;
  }): Promise<ResponseResult> {
    const { prompt, context, intent, marketData, temperature = 0.7 } = params;

    // Try OpenAI first (highest quality)
    if (this.apiStatus.openai && this.openai) {
      try {
        console.log('🧠 Usando OpenAI GPT-4 para resposta...');
        
        const systemPrompt = this.buildSystemPrompt(intent, marketData);
        const response = await this.openai.generateResponse({
          prompt,
          context,
          systemPrompt,
          temperature
        });

        return {
          text: response.text,
          confidence: response.confidence,
          source: 'openai',
          emotion: this.inferEmotion(response.text, intent),
          metadata: response.metadata
        };
      } catch (error) {
        console.warn('⚠️ OpenAI falhou, tentando Gemini...', error);
        this.apiStatus.openai = false;
      }
    }

    // Fallback to Gemini
    if (this.apiStatus.gemini && this.gemini?.isReady) {
      try {
        console.log('🤖 Usando Google Gemini Pro para resposta...');
        
        const response = await this.gemini.generateResponse(
          prompt,
          context || this.buildContextString(intent, marketData)
        );

        return {
          text: response,
          confidence: 0.85,
          source: 'gemini',
          emotion: this.inferEmotion(response, intent),
          metadata: {}
        };
      } catch (error) {
        console.warn('⚠️ Gemini falhou, usando SmartResponseGenerator...', error);
        this.apiStatus.gemini = false;
      }
    }

    // Fallback to Smart Response Generator
    console.log('💡 Usando SmartResponseGenerator...');
    const smartResponse = this.smartResponse.generateIntelligentResponse(
      prompt,
      intent || this.inferBasicIntent(prompt),
      marketData
    );

    return {
      text: smartResponse,
      confidence: 0.8,
      source: 'smart-generator',
      emotion: this.inferEmotion(smartResponse, intent)
    };
  }

  // VOICE SYNTHESIS with fallback
  async synthesizeVoice(
    text: string,
    emotion: EmotionType = 'neutral'
  ): Promise<VoiceResult> {
    // Try ElevenLabs first (highest quality)
    if (this.apiStatus.elevenlabs && this.elevenlabs) {
      try {
        console.log('🔊 Usando ElevenLabs para síntese de voz...');
        
        const audioBuffer = await this.elevenlabs.synthesize(text, emotion);
        if (audioBuffer) {
          return {
            audioBuffer,
            success: true,
            source: 'elevenlabs'
          };
        }
      } catch (error) {
        console.warn('⚠️ ElevenLabs falhou, usando TTS do navegador...', error);
        this.apiStatus.elevenlabs = false;
      }
    }

    // Fallback to Browser TTS
    return this.browserTextToSpeech(text, emotion);
  }

  private async browserTextToSpeech(text: string, emotion: EmotionType): Promise<VoiceResult> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return { success: false, source: 'fallback' };
    }

    try {
      console.log('🗣️ Usando TTS do navegador...');
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure based on emotion
      switch (emotion) {
        case 'excited':
        case 'happy':
          utterance.rate = 1.1;
          utterance.pitch = 1.2;
          break;
        case 'concerned':
          utterance.rate = 0.9;
          utterance.pitch = 0.8;
          break;
        case 'confident':
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          break;
        default:
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
      }

      // Find Portuguese voice if available
      const voices = speechSynthesis.getVoices();
      const ptVoice = voices.find(voice => 
        voice.lang.includes('pt') || voice.lang.includes('br')
      );
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      speechSynthesis.speak(utterance);
      
      return {
        success: true,
        source: 'browser-tts'
      };
    } catch (error) {
      console.error('Erro no TTS do navegador:', error);
      return { success: false, source: 'fallback' };
    }
  }

  // SPEECH RECOGNITION with fallback
  async startTranscription(params: {
    onPartialResult: (text: string) => void;
    onFinalResult: (text: string, confidence: number) => void;
    onError?: (error: Error) => void;
  }): Promise<{
    stop: () => void;
    source: 'assemblyai' | 'browser-speech';
  }> {
    // Try AssemblyAI first (highest accuracy)
    if (this.apiStatus.assemblyai && this.assemblyai) {
      try {
        console.log('🎤 Usando AssemblyAI para transcrição...');
        
        const transcription = await this.assemblyai.startRealtimeTranscription({
          onPartialTranscript: params.onPartialResult,
          onFinalTranscript: params.onFinalResult,
          onError: params.onError,
          languageCode: 'pt'
        });

        return {
          stop: transcription.stop,
          source: 'assemblyai'
        };
      } catch (error) {
        console.warn('⚠️ AssemblyAI falhou, usando Speech Recognition do navegador...', error);
        this.apiStatus.assemblyai = false;
      }
    }

    // Fallback to Browser Speech Recognition
    return this.browserSpeechRecognition(params);
  }

  private browserSpeechRecognition(params: {
    onPartialResult: (text: string) => void;
    onFinalResult: (text: string, confidence: number) => void;
    onError?: (error: Error) => void;
  }): {
    stop: () => void;
    source: 'browser-speech';
  } {
    console.log('🎙️ Usando Speech Recognition do navegador...');
    
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      params.onError?.(new Error('Speech Recognition não suportado'));
      return {
        stop: () => {},
        source: 'browser-speech'
      };
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      const confidence = event.results[current][0].confidence || 0.8;

      if (event.results[current].isFinal) {
        params.onFinalResult(transcript, confidence);
      } else {
        params.onPartialResult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      params.onError?.(new Error(`Speech Recognition error: ${event.error}`));
    };

    recognition.start();

    return {
      stop: () => recognition.stop(),
      source: 'browser-speech'
    };
  }

  // ADVANCED ANALYSIS using multiple APIs
  async performAdvancedAnalysis(topic: string, data?: any): Promise<{
    analysis: string;
    confidence: number;
    sources: string[];
  }> {
    const analyses: Array<{ text: string; source: string; confidence: number }> = [];

    // Try OpenAI analysis
    if (this.apiStatus.openai && this.openai) {
      try {
        const analysis = await this.openai.performDeepAnalysis(topic, data);
        analyses.push({
          text: analysis,
          source: 'OpenAI GPT-4',
          confidence: 0.95
        });
      } catch (error) {
        console.warn('OpenAI analysis failed:', error);
      }
    }

    // Try Gemini analysis
    if (this.apiStatus.gemini && this.gemini?.isReady) {
      try {
        const prompt = `Faça uma análise detalhada sobre ${topic} no contexto de criptomoedas.`;
        const response = await this.gemini.generateResponse(
          prompt, 
          data ? JSON.stringify(data) : undefined
        );
        
        analyses.push({
          text: response,
          source: 'Google Gemini',
          confidence: 0.9
        });
      } catch (error) {
        console.warn('Gemini analysis failed:', error);
      }
    }

    // Combine analyses
    if (analyses.length > 0) {
      const combinedAnalysis = this.combineAnalyses(analyses);
      return {
        analysis: combinedAnalysis.text,
        confidence: combinedAnalysis.confidence,
        sources: analyses.map(a => a.source)
      };
    }

    // Fallback to smart response
    const fallback = this.smartResponse.generateIntelligentResponse(
      `Analise ${topic}`,
      { name: 'analysis_request', category: 'analysis', confidence: 0.7, entities: {} },
      data
    );

    return {
      analysis: fallback,
      confidence: 0.7,
      sources: ['SmartResponseGenerator']
    };
  }

  private combineAnalyses(analyses: Array<{ text: string; source: string; confidence: number }>): {
    text: string;
    confidence: number;
  } {
    if (analyses.length === 1) {
      return { text: analyses[0].text, confidence: analyses[0].confidence };
    }

    // Combine multiple analyses intelligently
    const combined = `📊 **Análise Combinada de Múltiplas IAs**\n\n` +
      analyses.map((analysis, index) => 
        `**${analysis.source}:**\n${analysis.text}\n`
      ).join('\n---\n\n') +
      `\n**Consenso:** Análise baseada em ${analyses.length} fontes diferentes de IA.`;

    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;
    
    return {
      text: combined,
      confidence: Math.min(0.98, avgConfidence + 0.1) // Bonus for multiple sources
    };
  }

  // Helper methods
  private buildSystemPrompt(intent?: Intent, marketData?: any): string {
    let prompt = `Você é CYPHER AI, um assistente avançado especializado em Bitcoin, criptomoedas, trading, ordinals, runes e análise de mercado.`;
    
    if (intent) {
      prompt += ` A consulta atual é sobre: ${intent.category} (${intent.name}).`;
    }
    
    if (marketData?.bitcoin) {
      prompt += ` Preço atual do Bitcoin: $${marketData.bitcoin.price}`;
      if (marketData.bitcoin.change24h !== undefined) {
        prompt += `, variação 24h: ${marketData.bitcoin.change24h.toFixed(2)}%`;
      }
    }
    
    prompt += ` Responda de forma natural, informativa e envolvente em português brasileiro.`;
    
    return prompt;
  }

  private buildContextString(intent?: Intent, marketData?: any): string {
    const parts: string[] = [];
    
    if (intent) {
      parts.push(`Intent: ${intent.name} (${intent.category})`);
    }
    
    if (marketData?.bitcoin) {
      parts.push(`Bitcoin: $${marketData.bitcoin.price}`);
      if (marketData.bitcoin.change24h !== undefined) {
        parts.push(`24h: ${marketData.bitcoin.change24h.toFixed(2)}%`);
      }
    }
    
    return parts.join(' | ');
  }

  private inferBasicIntent(text: string): Intent {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('preço') || lowerText.includes('quanto')) {
      return { name: 'price_check', category: 'market', confidence: 0.8, entities: {} };
    }
    if (lowerText.includes('comprar') || lowerText.includes('vender')) {
      return { name: 'trading_query', category: 'trading', confidence: 0.7, entities: {} };
    }
    if (lowerText.includes('análise') || lowerText.includes('analisar')) {
      return { name: 'analysis_request', category: 'analysis', confidence: 0.7, entities: {} };
    }
    
    return { name: 'general_question', category: 'general', confidence: 0.5, entities: {} };
  }

  private inferEmotion(text: string, intent?: Intent): EmotionType {
    if (text.includes('excelente') || text.includes('ótimo') || text.includes('🚀')) {
      return 'excited';
    }
    if (text.includes('cuidado') || text.includes('risco') || text.includes('⚠️')) {
      return 'concerned';
    }
    if (text.includes('análise') || text.includes('dados') || text.includes('📊')) {
      return 'analytical';
    }
    if (intent?.category === 'trading') {
      return 'confident';
    }
    
    return 'neutral';
  }

  // Status methods
  getApiStatus() {
    return { ...this.apiStatus };
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getActiveApiCount(): number {
    return Object.values(this.apiStatus).filter(Boolean).length;
  }
}

export default AIOrchestrator;