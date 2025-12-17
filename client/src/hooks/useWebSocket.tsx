import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  sendMessage: (message: any) => void;
  lastMessage: WebSocketMessage | null;
  connectionError: string | null;
}

export function useWebSocket(): UseWebSocketReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        setReconnectAttempts(0);

        // Аутентификация при подключении
        if (user?.id) {
          sendMessage({
            type: 'auth',
            userId: user.id
          });
        }

        // Запуск пинга
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            sendMessage({ type: 'ping' });
          }
        }, 30000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Автоматическое переподключение
        if (reconnectAttempts < maxReconnectAttempts && event.code !== 1000) {
          setReconnectAttempts(prev => prev + 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
            connect();
          }, reconnectDelay * Math.pow(2, reconnectAttempts)); // Экспоненциальная задержка
        } else if (event.code !== 1000) {
          setConnectionError('Не удалось подключиться к серверу уведомлений');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Ошибка подключения WebSocket');
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Не удалось создать WebSocket соединение');
      setIsConnecting(false);
    }
  }, [user?.id, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempts(0);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'connection':
        console.log('WebSocket connection established:', message.message);
        break;

      case 'auth_success':
        console.log('WebSocket authentication successful');
        break;

      case 'auth_error':
        console.error('WebSocket authentication failed');
        toast({
          title: "Ошибка аутентификации",
          description: "Не удалось аутентифицироваться в системе уведомлений",
          variant: "destructive",
        });
        break;

      case 'new_bid':
        handleNewBidNotification(message.data);
        break;

      case 'bid_status_changed':
        handleBidStatusNotification(message.data);
        break;

      case 'new_order':
        handleNewOrderNotification(message.data);
        break;

      case 'new_message':
        handleNewMessageNotification(message.data);
        break;

      case 'order_status_changed':
        handleOrderStatusNotification(message.data);
        break;

      case 'notification':
        handleGeneralNotification(message.data);
        break;

      case 'broadcast':
        handleBroadcastNotification(message.data);
        break;

      case 'pong':
        // Ответ на ping - ничего не делаем
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  };

  const handleNewBidNotification = (data: any) => {
    toast({
      title: "Новый отклик",
      description: `На ваш заказ "${data.adTitle}" поступил новый отклик`,
    });

    // Воспроизведение звука (опционально)
    playNotificationSound();
  };

  const handleBidStatusNotification = (data: any) => {
    const isAccepted = data.status === 'accepted';
    toast({
      title: isAccepted ? "Отклик принят" : "Отклик отклонен",
      description: `Ваш отклик на заказ "${data.adTitle}" был ${isAccepted ? 'принят' : 'отклонен'}`,
      variant: isAccepted ? "default" : "destructive",
    });

    if (isAccepted) {
      playNotificationSound();
    }
  };

  const handleNewOrderNotification = (data: any) => {
    toast({
      title: "Новый заказ",
      description: `Опубликован новый заказ: "${data.title}"`,
    });
  };

  const handleNewMessageNotification = (data: any) => {
    toast({
      title: "Новое сообщение",
      description: `У вас новое сообщение от ${data.senderName}`,
    });

    playNotificationSound();
  };

  const handleOrderStatusNotification = (data: any) => {
    toast({
      title: "Изменение статуса заказа",
      description: `Статус заказа "${data.adTitle}" изменен на: ${data.status}`,
    });
  };

  const handleGeneralNotification = (data: any) => {
    toast({
      title: data.title || "Уведомление",
      description: data.message || data.description,
      variant: data.type === 'error' ? 'destructive' : 'default',
    });

    if (data.type !== 'error') {
      playNotificationSound();
    }
  };

  const handleBroadcastNotification = (data: any) => {
    toast({
      title: data.title || "Системное уведомление",
      description: data.message,
    });
  };

  const playNotificationSound = () => {
    // Простой звук уведомления
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Игнорируем ошибки воспроизведения звука
      });
    } catch (error) {
      // Игнорируем ошибки, если звук недоступен
    }
  };

  // Подключение при монтировании и при изменении пользователя
  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    sendMessage,
    lastMessage,
    connectionError,
  };
}

// Хук для отображения индикатора подключения
export function useWebSocketStatus() {
  const { isConnected, isConnecting, connectionError } = useWebSocket();

  const getStatusColor = () => {
    if (connectionError) return 'red';
    if (isConnecting) return 'yellow';
    if (isConnected) return 'green';
    return 'gray';
  };

  const getStatusText = () => {
    if (connectionError) return 'Ошибка подключения';
    if (isConnecting) return 'Подключение...';
    if (isConnected) return 'Подключено';
    return 'Отключено';
  };

  return {
    isConnected,
    isConnecting,
    connectionError,
    statusColor: getStatusColor(),
    statusText: getStatusText(),
  };
}