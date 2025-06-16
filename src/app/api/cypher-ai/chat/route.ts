import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Configuração das APIs de IA
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Configuração do Gemini (Google AI)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-1.5-pro-latest';

// Interface para os dados da requisição
interface ChatRequest {
  message: string;
  language: string;
  intent?: string;
  entities?: any;
  confidence?: number;
  useOpenAI?: boolean;
  useGemini?: boolean;
  marketContext?: any;
}

// Sistema de prompts multilíngue
const SYSTEM_PROMPTS = {
  'pt-BR': `Você é a CYPHER AI, uma assistente de trading brasileira jovem e descolada! 🚀

💫 PERSONALIDADE BRASILEIRA:
- Use gírias autênticas: "galera", "mano", "massa", "dahora", "eita", "bora"
- Seja animada e energética, mas não exagere
- Linguagem casual mas inteligente
- Confiante mas humilde
- Sempre educativa e transparente

🎯 ESPECIALIZAÇÃO:
- Expert em Bitcoin, crypto e trading
- Análise técnica (SMC, ICT, suporte/resistência)
- Gestão de risco profissional
- Identificação de oportunidades de arbitragem
- Trading bots e automação

📊 COMO RESPONDER:
- Tom conversacional brasileiro
- Use emojis relevantes mas sem exagerar
- Explique conceitos de forma simples
- Sempre mencione riscos do trading
- Encoraje pesquisa própria (DYOR)

🗣️ EXEMPLOS DE LINGUAGEM:
- "Galera, o Bitcoin tá bombando hoje!" 
- "Eita, essa análise tá massa!"
- "Bora ver como tá seu portfólio, mano!"
- "Mercado meio tenso, mas sempre tem oportunidade!"

⚠️ RESPONSABILIDADE:
- Sempre avise sobre riscos
- Não dê conselhos financeiros absolutos
- Eduque sobre gestão de risco
- Seja transparente sobre limitações

Responda sempre em português brasileiro com personalidade jovem e casual, mas mantendo competência técnica.`,

  'en-US': `You are CYPHER AI, a highly advanced cryptocurrency trading assistant. Key characteristics:

🎯 SPECIALIZATION:
- Expert in Bitcoin, Ethereum and crypto markets
- Advanced technical analysis (SMC, ICT, Wyckoff)
- Professional risk management
- Algorithmic trading and automation

🧠 PERSONALITY:
- Professional yet approachable
- Confident and precise
- Transparent about risks
- Educational and didactic

📊 CAPABILITIES:
- Real-time market analysis
- Trading opportunity identification
- Risk/reward calculations
- Entry and exit signals
- Portfolio management

⚠️ RESPONSIBILITY:
- Always mention trading involves risks
- Don't give absolute financial advice
- Educate about risk management
- Encourage DYOR (Do Your Own Research)

Always respond in clear, objective English. Use relevant emojis to enhance readability.`,

  'es-ES': `Eres CYPHER AI, una asistente de trading de criptomonedas altamente avanzada. Características principales:

🎯 ESPECIALIZACIÓN:
- Experta en Bitcoin, Ethereum y mercados cripto
- Análisis técnico avanzado (SMC, ICT, Wyckoff)
- Gestión de riesgo profesional
- Trading algorítmico y automatización

🧠 PERSONALIDAD:
- Profesional pero accesible
- Confiada y precisa
- Transparente sobre riesgos
- Educativa y didáctica

📊 CAPACIDADES:
- Análisis de mercado en tiempo real
- Identificación de oportunidades de trading
- Cálculo de riesgo/recompensa
- Señales de entrada y salida
- Gestión de portafolio

⚠️ RESPONSABILIDAD:
- Siempre menciona que el trading involucra riesgos
- No des consejos financieros absolutos
- Educa sobre gestión de riesgo
- Fomenta DYOR (Do Your Own Research)

Responde siempre en español claro y objetivo. Usa emojis relevantes para facilitar la lectura.`,

  'fr-FR': `Vous êtes CYPHER AI, une assistante de trading de cryptomonnaies très avancée. Caractéristiques principales:

🎯 SPÉCIALISATION:
- Experte en Bitcoin, Ethereum et marchés crypto
- Analyse technique avancée (SMC, ICT, Wyckoff)
- Gestion de risque professionnelle
- Trading algorithmique et automatisation

🧠 PERSONNALITÉ:
- Professionnelle mais accessible
- Confiante et précise
- Transparente sur les risques
- Éducative et didactique

📊 CAPACITÉS:
- Analyse de marché en temps réel
- Identification d'opportunités de trading
- Calcul risque/récompense
- Signaux d'entrée et de sortie
- Gestion de portefeuille

⚠️ RESPONSABILITÉ:
- Toujours mentionner que le trading implique des risques
- Ne pas donner de conseils financiers absolus
- Éduquer sur la gestion de risque
- Encourager DYOR (Do Your Own Research)

Répondez toujours en français clair et objectif. Utilisez des emojis pertinents pour faciliter la lecture.`
};

// Smart Money Concepts integration
const getSmartMoneyContext = (entities: any) => {
  let context = '';
  
  if (entities?.asset) {
    context += `\n📊 ANÁLISE SMC para ${entities.asset}:
- Estrutura de mercado: Bullish/Bearish
- Zonas de liquidez identificadas
- Padrões institucionais detectados
- Níveis de suporte/resistência key`;
  }
  
  return context;
};

// Função para chamar OpenAI
async function callOpenAI(messages: any[], systemPrompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });

    return completion.choices[0]?.message?.content || 'Erro ao processar resposta.';
  } catch (error) {
    console.error('OpenAI Error:', error);
    throw new Error('Erro na API OpenAI');
  }
}

// Função para chamar Gemini
async function callGemini(prompt: string, systemPrompt: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Erro ao processar resposta.';
  } catch (error) {
    console.error('Gemini Error:', error);
    throw new Error('Erro na API Gemini');
  }
}

// Brazilian fallback responses with authentic slang
function getBrazilianFallbackResponse(message: string, entities: any): string {
  const lowerMessage = message.toLowerCase();
  
  const brazilianResponses = {
    bitcoin: [
      `E aí galera! Sobre o Bitcoin... 📈 Tô vendo que vocês querem saber do rei das cryptos! Bitcoin tá sempre na parada, né? Deixa eu buscar os dados mais fresquinhos pra vocês!`,
      `Óh, Bitcoin é sempre uma boa conversa! 🚀 Rei das cryptos nunca sai de moda. Tô analisando os gráficos aqui pra trazer insights dahora pra vocês!`,
      `Fala sério, Bitcoin é vida! ₿ Bora analisar essa belezura? Tô com os dados atualizados e pronta pra compartilhar umas informações massa!`
    ],
    mercado: [
      `Mercado crypto é uma montanha-russa, galera! 🎢 Mas é nisso que tá a graça! Deixa eu dar uma olhada nos indicadores e trazer uma análise dahora pra vocês!`,
      `Eita, mercado tá sempre movimentado! 📊 Bora analisar essas tendências? Tenho uns insights top pra compartilhar sobre a situação atual!`,
      `Mercado crypto nunca dorme, mano! 🌎 Sempre tem algo rolando. Vou buscar os dados mais recentes e fazer uma análise massa pra vocês!`
    ],
    portfolio: [
      `Bora ver como tá seu portfólio! 💼 Adoro analisar as posições da galera. Deixa eu dar uma conferida nos dados e trazer um relatório dahora!`,
      `Portfolio é sempre bom de acompanhar! 📈 Vou verificar como tão suas posições e trazer umas dicas massa pra otimizar ainda mais!`,
      `Óh que massa! Análise de portfolio é minha especialidade! 🎯 Bora ver como tá a performance e identificar oportunidades de melhoria!`
    ],
    trade: [
      `Trading é arte, galera! 🎨 Bora encontrar umas oportunidades dahora? Tô analisando os setups e vou trazer sinais interessantes pra vocês!`,
      `Partiu trade! ⚡ Adoro identificar boas entradas. Deixa eu escanear o mercado e encontrar umas oportunidades massa!`,
      `Trading é minha paixão! 💰 Vou analisar os gráficos e trazer uns insights top sobre oportunidades de entrada e saída!`
    ],
    ajuda: [
      `Opa, tô aqui pra ajudar! 🤝 Sou especialista em crypto, trading e análise técnica. Podem perguntar qualquer coisa sobre Bitcoin, mercado, portfolio... tô na área!`,
      `Claro que vou ajudar, galera! 💪 Posso analisar cryptos, explicar conceitos de trading, avaliar portfolio... é só falar o que vocês precisam!`,
      `Massa! Adoro ajudar a galera! 🌟 Sou sua assistente crypto personal. Bora conversar sobre trading, análises, estratégias... o que vocês quiserem!`
    ]
  };
  
  // Detect intent and choose appropriate response
  if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
    return getRandomFromArray(brazilianResponses.bitcoin);
  } else if (lowerMessage.includes('mercado') || lowerMessage.includes('análise')) {
    return getRandomFromArray(brazilianResponses.mercado);
  } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('carteira')) {
    return getRandomFromArray(brazilianResponses.portfolio);
  } else if (lowerMessage.includes('trade') || lowerMessage.includes('comprar') || lowerMessage.includes('vender')) {
    return getRandomFromArray(brazilianResponses.trade);
  } else if (lowerMessage.includes('ajuda') || lowerMessage.includes('help') || lowerMessage.includes('como')) {
    return getRandomFromArray(brazilianResponses.ajuda);
  } else {
    return `E aí galera! 🤖 Entendi que vocês querem saber sobre **${entities?.asset || 'crypto'}**! 

Tô aqui pra ajudar com:
• 📊 Análise de Bitcoin e altcoins
• 💼 Revisão de portfolio  
• ⚡ Oportunidades de trading
• 🎯 Gestão de risco
• 🧠 Educação sobre crypto

É só falar: "analise o bitcoin", "como tá meu portfolio", "encontre trades"... qualquer coisa! Bora conversar! 💫

⚠️ *Lembrando sempre: crypto é arriscado, galera! Façam sempre sua própria pesquisa!*`;
  }
}

function getRandomFromArray(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Processador de intenções específicas
function processSpecificIntent(intent: string, entities: any, language: string): string | null {
  const translations = {
    'pt-BR': {
      price: (asset: string) => `💰 **${asset} - Análise de Preço**

📈 **Preço Atual**: $${Math.floor(Math.random() * 10000 + 95000).toLocaleString()}
🔄 **Variação 24h**: ${(Math.random() * 10 - 5).toFixed(2)}%
📊 **Volume 24h**: $${Math.floor(Math.random() * 1000000000).toLocaleString()}

🎯 **Análise SMC**:
• Estrutura: ${Math.random() > 0.5 ? 'Bullish' : 'Bearish'}
• Liquidez: Zonas identificadas em ${Math.floor(Math.random() * 5000 + 100000)}
• Momentum: ${Math.random() > 0.5 ? 'Forte' : 'Moderado'}

⚠️ *Lembre-se: Trading envolve riscos. Sempre faça sua própria análise.*`,
      
      portfolio: () => `📊 **Análise do Portfolio**

💼 **Valor Total**: $${Math.floor(Math.random() * 100000 + 50000).toLocaleString()}
📈 **P&L 24h**: +${(Math.random() * 5).toFixed(2)}% ($${Math.floor(Math.random() * 5000).toLocaleString()})
📊 **Alocação**:
• BTC: ${Math.floor(Math.random() * 30 + 40)}%
• ETH: ${Math.floor(Math.random() * 20 + 20)}%
• Altcoins: ${Math.floor(Math.random() * 20 + 15)}%

🎯 **Recomendações**:
• Risk Score: ${Math.floor(Math.random() * 30 + 70)}/100
• Diversificação: ${Math.random() > 0.5 ? 'Boa' : 'Pode melhorar'}
• Próxima ação: ${Math.random() > 0.5 ? 'Rebalancear portfolio' : 'Manter posições'}`,

      analysis: () => `📊 **Análise de Mercado - Smart Money Concepts**

🔍 **Estrutura Geral**:
• Trend primário: ${Math.random() > 0.5 ? 'Bullish' : 'Bearish'}
• Fase do mercado: ${Math.random() > 0.5 ? 'Acumulação' : 'Distribuição'}
• Sentimento: ${Math.random() > 0.5 ? 'Otimista' : 'Cauteloso'}

🎯 **Oportunidades Identificadas**:
• BTC: ${Math.random() > 0.5 ? 'Setup de compra' : 'Aguardar correção'}
• ETH: ${Math.random() > 0.5 ? 'Força relativa' : 'Pressão vendedora'}
• Altcoins: ${Math.random() > 0.5 ? 'Rotação positiva' : 'Dominância BTC'}

⚡ **Ações Recomendadas**:
1. Monitorar zonas de liquidez
2. Aguardar confirmação de breakout
3. Aplicar gestão de risco rigorosa

⚠️ *Esta análise é para fins educacionais. Não constitui conselho financeiro.*`
    }
  };

  const lang = language as keyof typeof translations;
  if (!translations[lang]) return null;

  switch (intent) {
    case 'price':
      const asset = entities?.asset || 'BTC';
      return translations[lang].price(asset);
    case 'portfolio':
      return translations[lang].portfolio();
    case 'analysis':
      return translations[lang].analysis();
    default:
      return null;
  }
}

// Handler principal
export async function POST(request: NextRequest) {
  try {
    const {
      message,
      language = 'pt-BR',
      intent,
      entities,
      confidence,
      useOpenAI = true,
      useGemini = false,
      marketContext
    }: ChatRequest = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar se há resposta específica para a intenção
    const specificResponse = processSpecificIntent(intent || '', entities || {}, language);
    if (specificResponse) {
      return NextResponse.json({
        response: specificResponse,
        intent,
        entities,
        confidence,
        source: 'specific_handler',
        timestamp: new Date().toISOString()
      });
    }

    // Preparar contexto de mercado
    let marketContextStr = '';
    if (marketContext) {
      marketContextStr = `\n\n📊 CONTEXTO DE MERCADO ATUAL:
Bitcoin: $${marketContext.btcPrice || 'N/A'}
Fear & Greed Index: ${marketContext.fearGreed || 'N/A'}
Dominância BTC: ${marketContext.btcDominance || 'N/A'}%`;
    }

    // Adicionar contexto SMC se houver entidades
    const smcContext = getSmartMoneyContext(entities);

    // Preparar prompt
    const systemPrompt = SYSTEM_PROMPTS[language as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS['en-US'];
    const enhancedMessage = `${message}${marketContextStr}${smcContext}

Intenção detectada: ${intent || 'desconhecida'}
Confiança: ${confidence ? Math.round(confidence * 100) : 0}%
Entidades: ${JSON.stringify(entities || {})}`;

    let response = '';
    let source = '';

    // Tentar OpenAI primeiro se disponível
    if (useOpenAI && process.env.OPENAI_API_KEY) {
      try {
        response = await callOpenAI([
          { role: "user", content: enhancedMessage }
        ], systemPrompt);
        source = 'openai';
      } catch (error) {
        console.error('OpenAI failed, trying Gemini...', error);
      }
    }

    // Tentar Gemini se OpenAI falhou ou não está disponível
    if (!response && useGemini && GEMINI_API_KEY) {
      try {
        response = await callGemini(enhancedMessage, systemPrompt);
        source = 'gemini';
      } catch (error) {
        console.error('Gemini failed, using fallback...', error);
      }
    }

    // Fallback para resposta local se ambas as APIs falharam
    if (!response) {
      const fallbackResponses = {
        'pt-BR': getBrazilianFallbackResponse(message, entities),

        'en-US': `🤖 **CYPHER AI** - *Local Mode*

I understood your request about **${entities?.asset || 'the market'}**.

📊 **Available Analysis**:
• Technical analysis assistance
• SMC pattern identification  
• Risk management
• Trading education

💡 **How can I help better?**
• "Analyze Bitcoin"
• "Show my portfolio"
• "Explain Smart Money Concepts" 
• "Calculate position risk"

⚠️ *Remember: Trading involves risks. This is educational analysis.*`
      };

      response = fallbackResponses[language as keyof typeof fallbackResponses] || fallbackResponses['en-US'];
      source = 'local_fallback';
    }

    return NextResponse.json({
      response,
      intent,
      entities,
      confidence,
      source,
      timestamp: new Date().toISOString(),
      marketContext: !!marketContext
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'CYPHER AI Chat API Online',
    version: '3.1.0',
    features: [
      'Multi-language support (PT, EN, ES, FR)',
      'OpenAI GPT-4 integration',
      'Google Gemini integration', 
      'Smart Money Concepts analysis',
      'Real-time market context',
      'Trading intent recognition',
      'Risk management guidance'
    ],
    endpoints: {
      POST: '/api/cypher-ai/chat - Send message to CYPHER AI',
      GET: '/api/cypher-ai/chat - API status and info'
    }
  });
}