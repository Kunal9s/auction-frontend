import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useSocket } from './hooks/useSocket';
import AuctionCard from './components/AuctionCard';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId] = useState(() => {
        let id = localStorage.getItem('userId');
        if (!id) {
            id = `user_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('userId', id);
        }
        return id;
    });
    
    const { placeBid, on, off, isConnected, getServerTime } = useSocket(userId);

    const fetchItems = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/items`);
            const data = await response.json();
            setItems(data.items || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Failed to load auctions');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]); 
    
    useEffect(() => {
        const handleBidUpdate = (data) => {
            const { itemId, currentBid, highestBidder, bidCount } = data;

            setItems(prevItems => 
                prevItems.map(item => 
                    item.id === itemId 
                        ? { ...item, currentBid, highestBidder, bidCount }
                        : item
                )
            );

            const isMyBid = highestBidder === userId;
            if (isMyBid) {
                toast.success(`You're winning! $${currentBid.toLocaleString()}`, {
                    icon: '🎯',
                    duration: 3000
                });
            } else {
                const item = items.find(i => i.id === itemId);
                if (item && item.highestBidder === userId) {
                    toast.error(`You've been outbid on ${item.title}!`, {
                        icon: '⚠️',
                        duration: 4000
                    });
                }
            }    
        };

        const handleBidError = (data) => {
            const { error, message } = data;

            if (error === 'BID_TOO_LOW') {
                toast.error(message, {
                    icon: '💨',
                    duration: 3000
                });  
            } else if (error === 'AUCTION_ENDED') {
                toast.error('This auction has ended', {
                    icon: '⏰',
                    duration: 3000
                });
            } else {
                toast.error(message || 'Bid failed', {
                    icon: '❌',
                    duration: 3000
                });
            }
        };

        const handleItemsUpdate = (data) => {
            setItems(data.items || []);
        };

        on('onBidUpdate', handleBidUpdate);
        on('onBidError', handleBidError);
        on('onItemsUpdate', handleItemsUpdate);

        return () => {
            off('onBidUpdate');
            off('onBidError');
            off('onItemsUpdate');
        };
    }, [on, off, userId, items]);

    const handleBid = useCallback((itemId, bidAmount) => {
        placeBid(itemId, bidAmount);
    }, [placeBid]);

    if (loading) {
        return (
            <div className="loading-screen">
                <motion.div
                    className="loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    ⚡
                </motion.div>
                <p>Loading auctions...</p>
            </div>
        );
    }

    return (
        <div className="app">
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'custom-toast',
                    duration: 3000,
                    style: {
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontFamily: 'Archivo, sans-serif',
                        fontSize: '14px'
                    }
                }}
            />

            <header className="header">
                <motion.div
                    className="header-content"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="logo-section">
                        <h1 className="logo">
                            <span className="logo-icon">⚡</span>
                            LIVE AUCTION
                        </h1>
                        <p className="tagline">Premium items. Real-time bidding.</p>
                    </div>
                    
                    <div className="header-status">
                        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                            <span className="status-dot" />
                            {isConnected ? 'Live' : 'Connecting...'}
                        </div>
                        <div className="user-badge">
                            <span className="user-icon">👤</span>
                            {userId.slice(0, 12)}
                        </div>
                    </div>
                </motion.div>
            </header>

            <main className="main-content">
                <motion.div
                    className="stats-bar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat">
                        <span className="stat-label">Active Auctions</span>
                        <span className="stat-value">
                            {items.filter(i => getServerTime() < i.endTime).length}
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Total Items</span>
                        <span className="stat-value">{items.length}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Your Bids</span>
                        <span className="stat-value">
                            {items.filter(i => i.highestBidder === userId).length}
                        </span>
                    </div>
                </motion.div>

                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
                        <p>No auction items available. Make sure the backend is running!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        <motion.div
                            className="auction-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <AuctionCard
                                        item={item}
                                        userId={userId}
                                        onBid={handleBid}
                                        getServerTime={getServerTime}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </main>

            <footer className="footer">
                <p>A perfect destination to buy luxury items of your choice.</p>
            </footer>
        </div>
    );
}

export default App;