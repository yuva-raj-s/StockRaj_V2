import { useEffect, useRef, useCallback } from 'react';
import { toast } from '../components/ui/toast';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

interface WebSocketMessage {
  type: 'stockUpdate' | 'error' | 'connected';
  data?: StockData;
  message?: string;
}

export const useWebSocket = (symbol: string, onMessage: (data: StockData) => void) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        return;
      }

      ws.current = new WebSocket('ws://localhost:3001');

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0; // Reset attempts on successful connection
        
        // Subscribe to symbol
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'subscribe',
            symbol
          }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          if (data.type === 'error') {
            toast({
              title: 'WebSocket Error',
              description: data.message || 'Unknown error occurred',
              variant: 'destructive'
            });
            return;
          }
          if (data.type === 'stockUpdate' && data.data) {
            onMessage(data.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket closed');
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          toast({
            title: 'Connection Error',
            description: 'Failed to connect to server after multiple attempts',
            variant: 'destructive'
          });
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Let onclose handle reconnection
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to server',
        variant: 'destructive'
      });
    }
  }, [symbol, onMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect]);

  return ws.current;
}; 