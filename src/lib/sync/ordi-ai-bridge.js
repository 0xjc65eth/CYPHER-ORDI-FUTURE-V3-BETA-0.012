// 🔄 BRIDGE DE SINCRONIZAÇÃO ORDI <-> AI (JS Version)

const { EventEmitter } = require('events');
const Redis = require('ioredis');

class OrdiAIBridge extends EventEmitter {
  constructor() {
    super();
    this.redis = new Redis();
    this.pubClient = new Redis();
    this.subClient = new Redis();
    
    this.setupChannels();
  }

  setupChannels() {
    this.subClient.subscribe('ordi:events');
    this.subClient.subscribe('ai:events');
    
    this.subClient.on('message', (channel, message) => {
      const data = JSON.parse(message);
      this.emit(channel, data);
    });
  }

  ordiToAI(command, data) {
    this.pubClient.publish('ordi:events', JSON.stringify({
      type: 'ORDI_COMMAND',
      command,
      data,
      timestamp: Date.now()
    }));
  }

  aiToOrdi(response, data) {
    this.pubClient.publish('ai:events', JSON.stringify({
      type: 'AI_RESPONSE',
      response,
      data,
      timestamp: Date.now()
    }));
  }

  syncState(system, state) {
    this.redis.set(`state:${system}`, JSON.stringify(state));
  }

  async getState(system) {
    const state = await this.redis.get(`state:${system}`);
    return state ? JSON.parse(state) : null;
  }
}

module.exports = { bridge: new OrdiAIBridge() };