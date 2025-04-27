import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const useWebSocket = (postId, callbacks = {}) => {
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!postId) return;

    const connect = () => {
      const socket = new SockJS('http://localhost:8081/ws');
      const client = Stomp.over(socket);
      client.debug = null; // Disable debug logs

      client.connect({}, () => {
        setConnected(true);
        stompClientRef.current = client;

        // Subscribe to like updates
        client.subscribe(`/topic/likes/${postId}`, (message) => {
          const data = JSON.parse(message.body);
          if (callbacks.onLikeUpdate) {
            callbacks.onLikeUpdate(data);
          }
        });

        // Subscribe to comment updates
        client.subscribe(`/topic/comments/${postId}`, (message) => {
          const data = JSON.parse(message.body);
          if (callbacks.onCommentUpdate) {
            callbacks.onCommentUpdate(data);
          }
        });
      }, (error) => {
        console.error('WebSocket connection error:', error);
        setConnected(false);
        setTimeout(connect, 5000); // Retry connection after 5s
      });
    };

    connect();

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect();
      }
    };
  }, [postId]);

  return { connected };
};

export default useWebSocket;
