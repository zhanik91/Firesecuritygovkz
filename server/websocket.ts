import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { parse } from 'url';
import { storage } from './storage';

interface WebSocketClient {
  ws: WebSocket;
  userId: string;
  isAuthenticated: boolean;
  lastPing: number;
}

class WebSocketManager {
  private clients = new Map<string, WebSocketClient>();
  private wss: WebSocketServer | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info) => {
        // Basic verification - можно добавить JWT проверку
        return true;
      }
    });

    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    // Пинг клиентов каждые 30 секунд
    setInterval(() => {
      this.pingClients();
    }, 30000);

    console.log('WebSocket server initialized on /ws');
  }

  private handleConnection(ws: WebSocket, request: any) {
    const clientId = this.generateClientId();
    
    const client: WebSocketClient = {
      ws,
      userId: '',
      isAuthenticated: false,
      lastPing: Date.now()
    };

    this.clients.set(clientId, client);

    ws.on('message', (data) => {
      this.handleMessage(clientId, data);
    });

    ws.on('close', () => {
      this.clients.delete(clientId);
      console.log(`WebSocket client ${clientId} disconnected`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.clients.delete(clientId);
    });

    // Отправляем приветственное сообщение
    this.sendToClient(clientId, {
      type: 'connection',
      message: 'Connected to Fire Safety KZ WebSocket server',
      timestamp: new Date().toISOString()
    });

    console.log(`WebSocket client ${clientId} connected`);
  }

  private handleMessage(clientId: string, data: any) {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);
      
      if (!client) return;

      switch (message.type) {
        case 'auth':
          this.handleAuth(clientId, message);
          break;
        case 'ping':
          this.handlePing(clientId);
          break;
        case 'subscribe':
          this.handleSubscribe(clientId, message);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(clientId, message);
          break;
        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleAuth(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Здесь можно добавить проверку JWT токена
    // Пока что используем простую проверку userId
    if (message.userId) {
      client.userId = message.userId;
      client.isAuthenticated = true;
      
      this.sendToClient(clientId, {
        type: 'auth_success',
        message: 'Authentication successful',
        userId: message.userId
      });

      console.log(`Client ${clientId} authenticated as user ${message.userId}`);
    } else {
      this.sendToClient(clientId, {
        type: 'auth_error',
        message: 'Authentication failed'
      });
    }
  }

  private handlePing(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastPing = Date.now();
    this.sendToClient(clientId, {
      type: 'pong',
      timestamp: new Date().toISOString()
    });
  }

  private handleSubscribe(clientId: string, message: any) {
    // Подписка на события (заказы, отклики и т.д.)
    console.log(`Client ${clientId} subscribed to: ${message.channel}`);
  }

  private handleUnsubscribe(clientId: string, message: any) {
    // Отписка от событий
    console.log(`Client ${clientId} unsubscribed from: ${message.channel}`);
  }

  private pingClients() {
    const now = Date.now();
    for (const [clientId, client] of Array.from(this.clients.entries())) {
      if (now - client.lastPing > 60000) { // 1 минута без пинга
        client.ws.terminate();
        this.clients.delete(clientId);
      }
    }
  }

  private sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Публичные методы для отправки уведомлений

  // Уведомление о новом отклике
  sendNewBidNotification(userId: string, notification: any) {
    for (const [clientId, client] of Array.from(this.clients.entries())) {
      if (client.userId === userId && client.isAuthenticated) {
        this.sendToClient(clientId, {
          type: 'new_bid',
          data: notification,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Уведомление о принятии/отклонении отклика
  sendBidStatusNotification(userId: string, notification: any) {
    for (const [clientId, client] of Array.from(this.clients.entries())) {
      if (client.userId === userId && client.isAuthenticated) {
        this.sendToClient(clientId, {
          type: 'bid_status_changed',
          data: notification,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Уведомление о новом заказе в категории
  sendNewOrderNotification(categoryId: string, notification: any) {
    for (const [clientId, client] of Array.from(this.clients.entries())) {
      if (client.isAuthenticated) {
        this.sendToClient(clientId, {
          type: 'new_order',
          data: notification,
          categoryId,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Уведомление о новом сообщении
  sendMessageNotification(userId: string, notification: any) {
    for (const [clientId, client] of Array.from(this.clients.entries())) {
      if (client.userId === userId && client.isAuthenticated) {
        this.sendToClient(clientId, {
          type: 'new_message',
          data: notification,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Уведомление о изменении статуса заказа
  sendOrderStatusNotification(userId: string, notification: any) {
    for (const [clientId, client] of Array.from(this.clients.entries())) {
      if (client.userId === userId && client.isAuthenticated) {
        this.sendToClient(clientId, {
          type: 'order_status_changed',
          data: notification,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Отправка уведомления конкретному пользователю
  sendUserNotification(userId: string, notification: any) {
    for (const [clientId, client] of Array.from(this.clients.entries())) {
      if (client.userId === userId && client.isAuthenticated) {
        this.sendToClient(clientId, {
          type: 'notification',
          data: notification,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Широковещательное уведомление всем авторизованным пользователям
  broadcastNotification(notification: any, excludeUserId?: string) {
    for (const [clientId, client] of Array.from(this.clients.entries())) {
      if (client.isAuthenticated && client.userId !== excludeUserId) {
        this.sendToClient(clientId, {
          type: 'broadcast',
          data: notification,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Получение статистики подключений
  getConnectionStats() {
    const totalConnections = this.clients.size;
    const authenticatedConnections = Array.from(this.clients.values())
      .filter(client => client.isAuthenticated).length;

    return {
      total: totalConnections,
      authenticated: authenticatedConnections,
      anonymous: totalConnections - authenticatedConnections
    };
  }

  // Закрытие WebSocket сервера
  close() {
    if (this.wss) {
      this.wss.close();
      this.clients.clear();
    }
  }
}

export const wsManager = new WebSocketManager();