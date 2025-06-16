export class EnhancedVoiceService {
  private recognition: any;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private language: string = 'pt-BR';
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      
      // Configurar reconhecimento de voz
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.language;
        this.recognition.maxAlternatives = 3;
      }
    }
  }
  
  startListening(onResult: (text: string) => void, onError?: (error: any) => void): void {
    if (!this.recognition) {
      console.error('Reconhecimento de voz não suportado');
      return;
    }
    
    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      onResult(text);
    };
    
    this.recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento:', event.error);
      if (onError) onError(event.error);
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      // Reiniciar automaticamente se ainda estiver ativo
      if (this.isListening) {
        this.recognition.start();
      }
    };
    
    this.recognition.start();
    this.isListening = true;
  }
  
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }
  
  speak(text: string, options?: { rate?: number; pitch?: number; voice?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Síntese de voz não suportada'));
        return;
      }
      
      // Cancelar qualquer fala anterior
      this.synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.language;
      utterance.rate = options?.rate || 1.1;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = 1.0;
      
      // Selecionar voz em português se disponível
      const voices = this.synthesis.getVoices();
      const ptVoice = voices.find(voice => voice.lang.includes('pt'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }
      
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      
      this.synthesis.speak(utterance);
    });
  }
  
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }
  
  setLanguage(lang: string): void {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
  
  isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }
}

export class EnhancedVoiceCommandProcessor {
  private commands: Map<string, (params?: any) => void> = new Map();
  
  constructor() {
    this.initializeCommands();
  }
  
  private initializeCommands(): void {
    // Comandos de trading
    this.commands.set('iniciar bot', () => console.log('Iniciando bot...'));
    this.commands.set('parar bot', () => console.log('Parando bot...'));
    this.commands.set('comprar bitcoin', () => console.log('Comprando Bitcoin...'));
    this.commands.set('vender bitcoin', () => console.log('Vendendo Bitcoin...'));
    
    // Comandos de análise
    this.commands.set('análise de mercado', () => console.log('Analisando mercado...'));
    this.commands.set('mostrar portfolio', () => console.log('Mostrando portfolio...'));
    this.commands.set('oportunidades', () => console.log('Buscando oportunidades...'));
  }
  
  processCommand(text: string): { command: string; confidence: number; action?: () => void } {
    const lowerText = text.toLowerCase().trim();
    
    // Procurar comando exato
    for (const [command, action] of this.commands) {
      if (lowerText.includes(command)) {
        return { command, confidence: 0.9, action };
      }
    }
    
    // Análise de intenção mais flexível
    if (lowerText.includes('bot') && (lowerText.includes('iniciar') || lowerText.includes('começar'))) {
      return { command: 'iniciar bot', confidence: 0.8, action: this.commands.get('iniciar bot') };
    }
    
    if (lowerText.includes('mercado') || lowerText.includes('análise')) {
      return { command: 'análise de mercado', confidence: 0.7, action: this.commands.get('análise de mercado') };
    }
    
    return { command: 'unknown', confidence: 0.3 };
  }
  
  addCommand(trigger: string, action: (params?: any) => void): void {
    this.commands.set(trigger.toLowerCase(), action);
  }
  
  removeCommand(trigger: string): void {
    this.commands.delete(trigger.toLowerCase());
  }
  
  getCommands(): string[] {
    return Array.from(this.commands.keys());
  }
}