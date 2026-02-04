import { useEffect, useRef, useCallback, useState } from "react";
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

export const useSocket = (userId) => {

    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [serverTimeOffset, setServerTimeOffset] = useState(0);
    const listenersRef = useRef({});

    useEffect(() => {
        if (!userId) return;

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketRef.current = socket;
    

    socket.on('connect', () => {
        console.log('Connected to auction server');
        setIsConnected(true);
        toast.success('Connected to live auction', {
            icon: '🔗',
            duration: 2000    
        });
    });

    socket.on('disconnect', () => {
        console.log('Disconnected to auction server');
        setIsConnected(false);
        toast.error('Connection lost. Reconnecting...', {
            icon: '⚠️',
            duration: 3000    
        });
    });

    socket.on('SERVER_TIME', ({ serverTime }) => {
        const clientTime = Date.now();
        const offset = serverTime - clientTime;
        setServerTimeOffset(offset);
        console.log('Time synced. Offset:', offset, 'ms');
    })

    socket.on('UPDATE_BID', (data) => {
        if(listenersRef.current.onBidUpdate) {
            listenersRef.current.onBidUpdate(data);
        }
    });

      socket.on('BID_ERROR', (data) => {
        if(listenersRef.current.onBidError) {
            listenersRef.current.onBidError(data);
        }
    });

      socket.on('BID_SUCCESS', (data) => {
        if(listenersRef.current.onBidSuccess) {
            listenersRef.current.onBidSuccess(data);
        }
    });

      socket.on('ITEMS_UPDATED', (data) => {
        if(listenersRef.current.onItemsUpdate) {
            listenersRef.current.onItemsUpdate(data);
        }
    });

    return () => {
        socket.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      };
    }, [userId]);

    const placeBid = useCallback((itemId, bidAmount) => {
        if (!socketRef.current || !isConnected) {
            toast.error('Not connected to server');
            return;
        }

        socketRef.current.emit('BID_PLACED', {
            itemId,
            bidAmount,
            userId
        });
    }, [isConnected, userId]);

    const on = useCallback((event, callback) => {
        listenersRef.current[event] = callback;
    }, []);

    const off = useCallback((event) => {
        delete listenersRef.current[event];
    }, []);

    const getServerTime = useCallback(() => {
        return Date.now() + serverTimeOffset;
    }, [serverTimeOffset]);

    return {
        placeBid,
        on,
        off,
        isConnected,
        getServerTime,
        serverTimeOffset
    };  
};