// Enhanced Voice Service with better error handling and natural speech

interface EnhancedVoiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  audioContext?: AudioContext;
}

interface VoiceCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onStart: () => void;
  onEnd: () => void;
  onError: (error: string) => void;
}

export class EnhancedVoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private audioContext: AudioContext | null = null;
  private isListening = false;
  private isSpeaking = false;
  private config: EnhancedVoiceConfig;
  private callbacks: VoiceCallbacks;
  private voicesLoaded = false;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(config: EnhancedVoiceConfig, callbacks: VoiceCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.initializeServices();
  }

  private async initializeServices() {
    await this.initializeSpeechRecognition();
    await this.initializeSpeechSynthesis();
    await this.initializeAudioContext();
  }

  private async initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Optimized settings for better reliability
    this.recognition.lang = this.config.language;
    this.recognition.continuous = false; // Single shot for stability
    this.recognition.interimResults = false; // Final results only
    this.recognition.maxAlternatives = 1;
    this.recognition.serviceURI = 'https://www.google.com/speech-api/v2/recognize'; // Force Google service
    
    this.setupRecognitionHandlers();
  }

  private async initializeSpeechSynthesis() {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech Synthesis not supported');
      return;
    }

    this.synthesis = window.speechSynthesis;
    
    // Wait for voices to load
    const waitForVoices = () => {
      return new Promise<void>((resolve) => {
        const voices = this.synthesis!.getVoices();
        if (voices.length > 0) {
          this.voicesLoaded = true;
          console.log('🔊 Voices loaded:', voices.length);
          resolve();
        } else {
          this.synthesis!.addEventListener('voiceschanged', () => {
            this.voicesLoaded = true;
            console.log('🔊 Voices loaded:', this.synthesis!.getVoices().length);
            resolve();
          }, { once: true });
        }
      });
    };

    await waitForVoices();
  }

  private async initializeAudioContext() {
    try {
      // Only create AudioContext after user interaction
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        if (this.audioContext.state === 'suspended') {
          console.log('🔊 AudioContext suspended, will resume on user interaction');
        }
      }
    } catch (error) {
      console.warn('AudioContext initialization failed:', error);
    }
  }

  private setupRecognitionHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.retryCount = 0;
      this.callbacks.onStart();
      console.log('🎤 Voice recognition started');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onEnd();
      console.log('🎤 Voice recognition ended');
    };

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        
        if (transcript.trim()) {
          this.callbacks.onResult(transcript.trim(), isFinal);
          console.log('🎤 Transcript:', transcript, isFinal ? '(final)' : '(interim)');
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error('🎤 Recognition error:', event.error);
      
      let errorMessage = 'Erro no reconhecimento de voz';
      
      switch (event.error) {
        case 'network':
          errorMessage = 'Erro de conexão. Tente novamente.';
          // Auto-retry on network errors
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`🎤 Retrying... (${this.retryCount}/${this.maxRetries})`);
            setTimeout(() => {
              this.startListening();
            }, 2000);
            return;
          }
          break;
        case 'not-allowed':
          errorMessage = 'Permissão de microfone negada. Clique no ícone do cadeado para permitir.';
          break;
        case 'no-speech':
          errorMessage = 'Nenhuma fala detectada. Tente falar mais alto.';
          break;
        case 'audio-capture':
          errorMessage = 'Erro ao capturar áudio. Verifique seu microfone.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Serviço de reconhecimento não permitido.';
          break;
      }
      
      this.callbacks.onError(errorMessage);
    };

    this.recognition.onnomatch = () => {
      this.callbacks.onError('Não foi possível reconhecer a fala. Tente novamente.');
    };
  }

  async startListening(): Promise<boolean> {
    if (!this.recognition || this.isListening) {
      return false;
    }

    // Resume AudioContext if needed
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('🔊 AudioContext resumed');
      } catch (error) {
        console.warn('Could not resume AudioContext:', error);
      }
    }

    // Check permissions
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as any });
        if (permission.state === 'denied') {
          this.callbacks.onError('Permissão de microfone negada. Permitir acesso nas configurações do navegador.');
          return false;
        }
      }
    } catch (error) {
      console.warn('Could not check permissions:', error);
    }

    try {
      this.recognition.start();
      return true;
    } catch (error: any) {
      console.error('Failed to start recognition:', error);
      
      if (error.message?.includes('already started')) {
        this.recognition.stop();
        setTimeout(() => this.recognition?.start(), 100);
        return true;
      }
      
      this.callbacks.onError('Falha ao iniciar reconhecimento. Tente novamente.');
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  async speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
  }): Promise<void> {
    if (!this.synthesis || this.isSpeaking) {
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    // Wait for voices if not loaded yet
    if (!this.voicesLoaded) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Resume AudioContext if suspended
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Could not resume AudioContext for speech:', error);
      }
    }

    return new Promise((resolve) => {
      // Split text for better pronunciation
      const sentences = this.splitTextIntoSentences(text);
      let currentIndex = 0;

      const speakNext = () => {
        if (currentIndex >= sentences.length) {
          this.isSpeaking = false;
          if (options?.onEnd) options.onEnd();
          resolve();
          return;
        }

        const sentence = sentences[currentIndex];
        const utterance = new SpeechSynthesisUtterance(sentence);

        // Enhanced voice settings
        utterance.rate = options?.rate || 0.85; // Slightly slower for clarity
        utterance.pitch = options?.pitch || 1.0;
        utterance.volume = options?.volume || 0.9;

        // Select best Portuguese voice
        const voice = this.getBestPortugueseVoice();
        if (voice) {
          utterance.voice = voice;
          console.log('🔊 Using voice:', voice.name);
        }

        utterance.onstart = () => {
          if (currentIndex === 0) {
            this.isSpeaking = true;
            console.log('🔊 Started speaking');
          }
        };

        utterance.onend = () => {
          currentIndex++;
          setTimeout(speakNext, 200); // Pause between sentences
        };

        utterance.onerror = (event) => {
          console.error('🔊 Speech error:', event.error);
          // Continue with next sentence on error
          currentIndex++;
          setTimeout(speakNext, 100);
        };

        this.synthesis!.speak(utterance);
      };

      speakNext();
    });
  }

  private getBestPortugueseVoice(): SpeechSynthesisVoice | null {
    if (!this.synthesis) return null;

    const voices = this.synthesis.getVoices();
    
    // Priority list for best Portuguese voices
    const priorities = [
      'Microsoft Maria - Portuguese (Brazil)',
      'Google português do Brasil',
      'Luciana',
      'Joana',
      'Microsoft Helena - Portuguese (Portugal)',
      'Google português de Portugal',
      'Karen',
      'Fernanda'
    ];

    for (const priority of priorities) {
      const voice = voices.find(v => 
        v.name.includes(priority) || 
        v.name.toLowerCase().includes(priority.toLowerCase())
      );
      if (voice) return voice;
    }

    // Fallback to any Portuguese voice
    return voices.find(v => 
      v.lang.includes('pt') || 
      v.lang.includes('PT') ||
      v.name.toLowerCase().includes('portugu') ||
      v.name.toLowerCase().includes('brasil')
    ) || null;
  }

  private splitTextIntoSentences(text: string): string[] {
    // Clean the text first
    const cleanText = this.cleanTextForSpeech(text);
    
    // Split into sentences
    const sentences = cleanText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Ensure sentences end with periods
    return sentences.map(s => s.endsWith('.') ? s : s + '.');
  }

  private cleanTextForSpeech(text: string): string {
    return text
      // Remove markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      
      // Convert symbols to words
      .replace(/\$/g, 'dólares ')
      .replace(/(\d+)%/g, '$1 por cento')
      .replace(/24h/g, 'vinte e quatro horas')
      .replace(/BTC/g, 'Bitcoin')
      .replace(/ETH/g, 'Ethereum')
      .replace(/USD/g, 'dólares americanos')
      
      // Technical terms
      .replace(/RSI/g, 'R.S.I.')
      .replace(/MACD/g, 'M.A.C.D.')
      .replace(/API/g, 'A.P.I.')
      .replace(/AI/g, 'inteligência artificial')
      .replace(/NFT/g, 'N.F.T.')
      
      // Clean up formatting
      .replace(/•/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getListeningState(): boolean {
    return this.isListening;
  }

  getSpeakingState(): boolean {
    return this.isSpeaking;
  }

  isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }

  destroy(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
    }

    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Voice command processor with better recognition
export class EnhancedVoiceCommandProcessor {
  private static readonly COMMANDS = {
    'preço': ['preço', 'cotação', 'valor', 'quanto custa', 'price'],
    'comprar': ['comprar', 'investir', 'entrada', 'buy'],
    'vender': ['vender', 'sair', 'lucro', 'sell'],
    'análise': ['análise', 'analisar', 'situação', 'analysis'],
    'mercado': ['mercado', 'tendência', 'movimento', 'market'],
    'oportunidades': ['oportunidades', 'opportunities', 'chances'],
    'portfolio': ['portfolio', 'carteira', 'wallet'],
    'ajuda': ['ajuda', 'help', 'comandos'],
    'limpar': ['limpar', 'clear', 'novo', 'reset']
  };

  static processCommand(transcript: string): {
    command: string | null;
    confidence: number;
    originalText: string;
  } {
    const text = transcript.toLowerCase().trim();
    let bestMatch: string | null = null;
    let highestScore = 0;

    for (const [command, keywords] of Object.entries(this.COMMANDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          // Calculate confidence based on keyword length and position
          const position = text.indexOf(keyword);
          const lengthScore = keyword.length / text.length;
          const positionScore = position === 0 ? 1 : 0.8; // Bonus for starting with keyword
          const score = lengthScore * positionScore;
          
          if (score > highestScore) {
            highestScore = score;
            bestMatch = command;
          }
        }
      }
    }

    return {
      command: bestMatch,
      confidence: highestScore,
      originalText: transcript
    };
  }
}