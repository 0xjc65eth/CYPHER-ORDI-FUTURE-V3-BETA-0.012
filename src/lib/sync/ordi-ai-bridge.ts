// 🔄 BRIDGE DE SINCRONIZAÇÃO ORDI <-> AI

import { EventEmitter } from 'events';
import Redis from 'ioredis';

export class OrdiAIBridge extends EventEmitter {
  private redis: Redis;
  private pubClient: Redis;
  private subClient: Redis;

  constructor() {
    super();
    this.redis = new Redis();
    this.pubClient = new Redis();
    this.subClient = new Redis();
    
    this.setupChannels();
  }

  private setupChannels() {
    // Canal ORDI -> AI
    this.subClient.subscribe('ordi:events');
    this.subClient.subscribe('ai:events');
    
    this.subClient.on('message', (channel, message) => {
      const data = JSON.parse(message);
      this.emit(channel, data);
    });
  }

  // ORDI envia comando para AI
  ordiToAI(command: string, data: any) {
    this.pubClient.publish('ordi:events', JSON.stringify({
      type: 'ORDI_COMMAND',
      command,
      data,
      timestamp: Date.now()
    }));
  }

  // AI envia resposta para ORDI
  aiToOrdi(response: string, data: any) {
    this.pubClient.publish('ai:events', JSON.stringify({
      type: 'AI_RESPONSE',
      response,
      data,
      timestamp: Date.now()
    }));
  }

  // Sincronizar estado
  syncState(system: 'ordi' | 'ai', state: any) {
    this.redis.set(`state:${system}`, JSON.stringify(state));
  }
  // Obter estado sincronizado
  async getState(system: 'ordi' | 'ai') {
    const state = await this.redis.get(`state:${system}`);
    return state ? JSON.parse(state) : null;
  }
}

export const bridge = new OrdiAIBridge();