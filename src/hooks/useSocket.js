// useSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const RECONNECTION_ATTEMPTS = 3;
const RECONNECTION_DELAY = 2000;

export function useSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!user) return;

    try {
      // Initialize socket with authentication and configuration
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: user.token // Assuming token is stored in user object
        },
        transports: ['websocket'],
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
        reconnectionDelay: RECONNECTION_DELAY,
        query: {
          userId: user.id
        }
      });

      // Connection event handlers
      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        handleReconnection();
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, attempt reconnection
          handleReconnection();
        }
      });

      // Custom error handling
      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        setConnectionError(error.message);
      });

      // Game-specific error handling
      socketRef.current.on('game:error', (error) => {
        console.error('Game error:', error);
        // You can handle game-specific errors here
        // For example, showing a notification to the user
      });

    } catch (error) {
      console.error('Socket initialization error:', error);
      setConnectionError(error.message);
    }
  }, [user]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setConnectionError(null);
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const handleReconnection = useCallback(() => {
    if (reconnectAttemptsRef.current >= RECONNECTION_ATTEMPTS) {
      setConnectionError('Maximum reconnection attempts reached');
      return;
    }

    reconnectAttemptsRef.current += 1;
    console.log(`Reconnection attempt ${reconnectAttemptsRef.current}/${RECONNECTION_ATTEMPTS}`);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isConnected && socketRef.current) {
        console.log('Attempting to reconnect...');
        socketRef.current.connect();
      }
    }, RECONNECTION_DELAY);
  }, [isConnected]);

  // Enhanced emit function with error handling and validation
  const emit = useCallback((eventName, data) => {
    if (!socketRef.current?.connected) {
      console.error('Socket not connected. Cannot emit event:', eventName);
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        socketRef.current.emit(eventName, data, (response) => {
          if (response?.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        });

        // Set a timeout for the emit operation
        setTimeout(() => {
          reject(new Error('Socket emit timeout'));
        }, 5000);
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  // Enhanced on function with error handling
  const on = useCallback((eventName, callback) => {
    if (!socketRef.current) {
      console.error('Socket not initialized. Cannot add listener for:', eventName);
      return;
    }

    const wrappedCallback = (...args) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in ${eventName} handler:`, error);
      }
    };

    socketRef.current.on(eventName, wrappedCallback);
    
    // Return cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(eventName, wrappedCallback);
      }
    };
  }, []);

  // Enhanced off function
  const off = useCallback((eventName, callback) => {
    if (!socketRef.current) {
      console.error('Socket not initialized. Cannot remove listener for:', eventName);
      return;
    }

    socketRef.current.off(eventName, callback);
  }, []);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (user && !socketRef.current) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Expose socket interface
  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    connect,
    disconnect
  };
}
