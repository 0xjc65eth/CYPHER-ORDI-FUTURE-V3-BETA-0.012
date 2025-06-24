/**
 * WebSocket Server for CYPHER ORDi Future V3
 * Real-time data streaming and live updates
 */

import { WebSocketServer as WSServer } from 'ws';
import { createServer } from 'http';
import { EventEmitter } from 'events';
import jwt from 'jsonwebtoken';
import { systemIntegrator } from '@/core/SystemIntegrator';
import { EnhancedLogger } from '@/lib/enhanced-logger';

interface WebSocketClient {
  id: string;
  ws: any;
  userId?: string;
  subscriptions: Set<string>;
  authenticated: boolean;
  lastPing: number;
  metadata: {
    ip: string;
    userAgent: string;
    connectedAt: number;
  };
}

interface SubscriptionRequest {
  type: 'subscribe' | 'unsubscribe';
  channels: string[];
  params?: Record<string, any>;
}

interface WebSocketMessage {
  type: string;
  channel?: string;
  data: any;
  timestamp: number;
  id?: string;
}

export class WebSocketServer extends EventEmitter {
  private server: any;
  private wss: WSServer | null = null;
  private clients = new Map<string, WebSocketClient>();
  private channels = new Map<string, Set<string>>(); // channel -> client IDs
  private messageQueue = new Map<string, WebSocketMessage[]>(); // client ID -> messages
  private pingInterval: NodeJS.Timeout | null = null;
  private port: number;
  private isRunning = false;

  constructor(port: number = 8080) {
    super();
    this.port = port;
    this.setupEventHandlers();
  }

  /**
   * Start WebSocket server
   */
  async start(): Promise<void> {
    try {
      this.server = createServer();
      this.wss = new WSServer({ 
        server: this.server,
        path: '/ws',
        clientTracking: true
      });

      this.setupWebSocketHandlers();
      this.startPingInterval();

      await new Promise<void>((resolve, reject) => {
        this.server.listen(this.port, (error: any) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      this.isRunning = true;
      EnhancedLogger.info(`WebSocket server started on port ${this.port}`);
      this.emit('serverStarted', { port: this.port });

    } catch (error) {
      EnhancedLogger.error('Failed to start WebSocket server:', error);
      throw error;
    }
  }

  /**
   * Stop WebSocket server
   */
  async stop(): Promise<void> {
    try {
      this.isRunning = false;

      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }

      // Close all client connections
      for (const client of this.clients.values()) {
        client.ws.close(1000, 'Server shutting down');
      }

      if (this.wss) {
        this.wss.close();
      }

      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server.close(() => resolve());
        });
      }

      this.clients.clear();
      this.channels.clear();
      this.messageQueue.clear();

      EnhancedLogger.info('WebSocket server stopped');
      this.emit('serverStopped');

    } catch (error) {
      EnhancedLogger.error('Error stopping WebSocket server:', error);
      throw error;
    }
  }

  /**
   * Setup WebSocket connection handlers
   */
  private setupWebSocketHandlers(): void {
    if (!this.wss) return;

    this.wss.on('connection', (ws, request) => {
      const clientId = this.generateClientId();
      const client: WebSocketClient = {
        id: clientId,
        ws,
        subscriptions: new Set(),
        authenticated: false,
        lastPing: Date.now(),
        metadata: {
          ip: request.socket.remoteAddress || 'unknown',
          userAgent: request.headers['user-agent'] || 'unknown',
          connectedAt: Date.now()
        }
      };

      this.clients.set(clientId, client);
      EnhancedLogger.info('WebSocket client connected', { clientId, ip: client.metadata.ip });

      // Handle authentication with token from query
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token');
      if (token) {
        this.authenticateClient(client, token);
      }

      // Message handler
      ws.on('message', (data: Buffer) => {
        this.handleClientMessage(client, data);
      });

      // Pong handler
      ws.on('pong', () => {
        client.lastPing = Date.now();
      });

      // Close handler
      ws.on('close', (code: number, reason: Buffer) => {
        this.handleClientDisconnect(client, code, reason.toString());
      });

      // Error handler
      ws.on('error', (error: Error) => {
        EnhancedLogger.error('WebSocket client error:', { clientId, error: error.message });
        this.handleClientDisconnect(client, 1011, 'Client error');
      });

      // Send welcome message
      this.sendToClient(client, {
        type: 'welcome',
        data: {
          clientId,
          serverTime: Date.now(),
          availableChannels: this.getAvailableChannels()
        },
        timestamp: Date.now()
      });

      this.emit('clientConnected', { clientId, client });
    });

    this.wss.on('error', (error) => {
      EnhancedLogger.error('WebSocket server error:', error);
      this.emit('serverError', error);
    });
  }

  /**
   * Handle client message
   */
  private handleClientMessage(client: WebSocketClient, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'auth':
          this.authenticateClient(client, message.token);
          break;
        
        case 'subscribe':
        case 'unsubscribe':
          this.handleSubscription(client, message);
          break;
        
        case 'ping':
          this.sendToClient(client, {
            type: 'pong',
            data: { timestamp: Date.now() },
            timestamp: Date.now()
          });
          break;

        case 'request':
          this.handleClientRequest(client, message);
          break;

        default:
          EnhancedLogger.warn('Unknown message type', { clientId: client.id, type: message.type });
      }

    } catch (error) {
      EnhancedLogger.error('Error handling client message:', { clientId: client.id, error });
      this.sendToClient(client, {
        type: 'error',
        data: { message: 'Invalid message format' },
        timestamp: Date.now()
      });
    }
  }

  /**
   * Authenticate client
   */
  private async authenticateClient(client: WebSocketClient, token: string): Promise<void> {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as any;
      
      client.userId = decoded.userId;
      client.authenticated = true;
      
      EnhancedLogger.info('Client authenticated', { clientId: client.id, userId: client.userId });
      
      this.sendToClient(client, {
        type: 'auth_success',
        data: { 
          userId: client.userId,
          authenticated: true
        },
        timestamp: Date.now()
      });

      this.emit('clientAuthenticated', { clientId: client.id, userId: client.userId });

    } catch (error) {
      EnhancedLogger.warn('Client authentication failed', { clientId: client.id, error: error.message });
      
      this.sendToClient(client, {
        type: 'auth_error',
        data: { message: 'Authentication failed' },
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle subscription requests
   */
  private handleSubscription(client: WebSocketClient, request: SubscriptionRequest): void {
    const { type, channels } = request;

    for (const channel of channels) {
      if (type === 'subscribe') {
        this.subscribeClient(client, channel);
      } else {
        this.unsubscribeClient(client, channel);
      }
    }

    this.sendToClient(client, {
      type: 'subscription_response',
      data: {
        action: type,
        channels,
        success: true,
        activeSubscriptions: Array.from(client.subscriptions)
      },
      timestamp: Date.now()
    });
  }

  /**
   * Subscribe client to channel
   */
  private subscribeClient(client: WebSocketClient, channel: string): void {
    // Check if channel requires authentication
    if (this.requiresAuth(channel) && !client.authenticated) {
      this.sendToClient(client, {
        type: 'subscription_error',
        data: { 
          channel,
          message: 'Authentication required for this channel' 
        },
        timestamp: Date.now()
      });
      return;
    }

    client.subscriptions.add(channel);
    
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(client.id);

    EnhancedLogger.info('Client subscribed to channel', { 
      clientId: client.id, 
      channel,
      totalSubscribers: this.channels.get(channel)!.size
    });

    this.emit('clientSubscribed', { clientId: client.id, channel });
  }

  /**
   * Unsubscribe client from channel
   */
  private unsubscribeClient(client: WebSocketClient, channel: string): void {
    client.subscriptions.delete(channel);
    
    const channelClients = this.channels.get(channel);
    if (channelClients) {
      channelClients.delete(client.id);
      if (channelClients.size === 0) {
        this.channels.delete(channel);
      }
    }

    EnhancedLogger.info('Client unsubscribed from channel', { clientId: client.id, channel });
    this.emit('clientUnsubscribed', { clientId: client.id, channel });
  }

  /**
   * Handle client requests
   */
  private async handleClientRequest(client: WebSocketClient, message: any): Promise<void> {
    try {
      const { id, endpoint, data } = message;
      
      // Route request to appropriate service
      let response;
      switch (endpoint) {
        case 'orderbook':
          const orderbook = systemIntegrator.getService('orderbook');
          response = await orderbook?.getOrderBook(data.symbol, data.depth);
          break;
        
        case 'portfolio':
          response = { 
            balance: 50000,
            positions: [],
            pnl: 1250.75
          };
          break;

        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }

      this.sendToClient(client, {
        type: 'response',
        id,
        data: response,
        timestamp: Date.now()
      });

    } catch (error) {
      this.sendToClient(client, {
        type: 'error',
        id: message.id,
        data: { message: error.message },
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle client disconnect
   */
  private handleClientDisconnect(client: WebSocketClient, code: number, reason: string): void {
    // Remove from all channels
    for (const channel of client.subscriptions) {
      this.unsubscribeClient(client, channel);
    }

    // Remove client
    this.clients.delete(client.id);
    this.messageQueue.delete(client.id);

    EnhancedLogger.info('Client disconnected', { 
      clientId: client.id, 
      userId: client.userId,
      code, 
      reason,
      duration: Date.now() - client.metadata.connectedAt
    });

    this.emit('clientDisconnected', { clientId: client.id, code, reason });
  }

  /**
   * Broadcast message to channel
   */
  public broadcast(channel: string, data: any): void {
    const message: WebSocketMessage = {
      type: 'broadcast',
      channel,
      data,
      timestamp: Date.now()
    };

    const channelClients = this.channels.get(channel);
    if (!channelClients) return;

    let sent = 0;
    for (const clientId of channelClients) {
      const client = this.clients.get(clientId);
      if (client && this.sendToClient(client, message)) {
        sent++;
      }
    }

    logger.debug('Broadcast sent', { channel, recipients: sent, total: channelClients.size });
  }

  /**
   * Send message to specific client
   */
  private sendToClient(client: WebSocketClient, message: WebSocketMessage): boolean {
    try {
      if (client.ws.readyState === 1) { // WebSocket.OPEN
        client.ws.send(JSON.stringify(message));
        return true;
      } else {
        // Queue message for later delivery
        if (!this.messageQueue.has(client.id)) {
          this.messageQueue.set(client.id, []);
        }
        this.messageQueue.get(client.id)!.push(message);
        return false;
      }
    } catch (error) {
      EnhancedLogger.error('Error sending message to client:', { clientId: client.id, error });
      return false;
    }
  }

  /**
   * Setup event handlers for system events
   */
  private setupEventHandlers(): void {
    // Listen to system integrator events
    systemIntegrator.on('mlPrediction', (data) => {
      this.broadcast('ml.predictions', data);
    });

    systemIntegrator.on('tradingSignal', (data) => {
      this.broadcast('social.signals', data);
    });

    systemIntegrator.on('paymentCompleted', (data) => {
      this.broadcast(`user.${data.userId}.payments`, data);
    });

    // Listen to service-specific events
    const orderbook = systemIntegrator.getService('orderbook');
    if (orderbook) {
      orderbook.on('tradeExecuted', (trade: any) => {
        this.broadcast(`orderbook.${trade.symbol}.trades`, trade);
        this.broadcast('trades.all', trade);
      });

      orderbook.on('orderBookUpdated', (update: any) => {
        this.broadcast(`orderbook.${update.symbol}`, update);
      });
    }
  }

  /**
   * Start ping interval to keep connections alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      const staleClients: string[] = [];

      for (const [clientId, client] of this.clients) {
        // Check if client is stale (no pong for 60 seconds)
        if (now - client.lastPing > 60000) {
          staleClients.push(clientId);
        } else {
          // Send ping
          try {
            client.ws.ping();
          } catch (error) {
            staleClients.push(clientId);
          }
        }
      }

      // Remove stale clients
      for (const clientId of staleClients) {
        const client = this.clients.get(clientId);
        if (client) {
          this.handleClientDisconnect(client, 1001, 'Ping timeout');
        }
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Check if channel requires authentication
   */
  private requiresAuth(channel: string): boolean {
    const authChannels = [
      'user.',
      'portfolio.',
      'orders.',
      'trades.user'
    ];
    
    return authChannels.some(prefix => channel.startsWith(prefix));
  }

  /**
   * Get available channels
   */
  private getAvailableChannels(): string[] {
    return [
      'orderbook.BTC',
      'orderbook.ETH',
      'orderbook.SOL',
      'trades.all',
      'ml.predictions',
      'social.signals',
      'news.sentiment',
      'system.health'
    ];
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get server statistics
   */
  public getStats(): any {
    return {
      isRunning: this.isRunning,
      port: this.port,
      clients: {
        total: this.clients.size,
        authenticated: Array.from(this.clients.values()).filter(c => c.authenticated).length,
        anonymous: Array.from(this.clients.values()).filter(c => !c.authenticated).length
      },
      channels: {
        total: this.channels.size,
        list: Array.from(this.channels.keys())
      },
      messages: {
        queued: Array.from(this.messageQueue.values()).reduce((sum, queue) => sum + queue.length, 0)
      }
    };
  }
}

// Singleton instance
export const webSocketServer = new WebSocketServer(parseInt(process.env.WS_PORT || '8080'));