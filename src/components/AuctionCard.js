import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCountdown } from '../hooks/useCountdown';
import './AuctionCard.css';

const AuctionCard = ({ item, userId, onBid, getServerTime }) => {

    const [isFlashing, setIsFlashing] = useState(false);
    const [prevBid, setPrevBid] = useState(item.currentBid);
    const [isBidding, setIsBidding] = useState(false);
    const countdown = useCountdown(item.endTime, getServerTime);

    const isWinning = item.highestBidder === userId;
    const hasEnded = countdown.isExpired;
    const bidIncrement = 10;

    useEffect(() => {
        if (item.currentBid !== prevBid) {
            setIsFlashing(true);
            setPrevBid(item.currentBid);

            const timer = setTimeout(() => setIsFlashing(false), 600)
            return () => clearTimeout(timer);   
        }
    }, [item?.currentBid, prevBid, item]);

       if (!item) {
        return null;
    }

    const handleBid = async () => {
        if (hasEnded || isBidding) return;

        setIsBidding(true);
        await onBid(item.id, item.currentBid + bidIncrement);

        setTimeout(() => setIsBidding(false), 1000);
    };

    return (
        <motion.div
          className={`auction-card ${hasEnded ? 'ended' : ''} ${isFlashing ? 'flashing' : ''}`}
          initial ={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          layout
        >
        <div className='card-image-wrapper'>
            <img src={item.imageUrl} alt={item.title} className='card-image' />
            <div className='card-overlay' />
        </div>
        <AnimatePresence mode='wait'>
            {hasEnded ? (
                <motion.div
                  key="ended"
                  className="status-badge ended-badge"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
            >
                ENDED
            </motion.div>
            ) : isWinning ? (
                <motion.div
                  key="winning"
                  className="status-badge winning-badge"
                  initial={{ scale: 0, y: -10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: -10 }}
                >
                     ⚡winning
                </motion.div>
            ) : null}
        </AnimatePresence>
        <div className={`countdown-timer ${countdown.isCritical ? 'critical' : countdown.isWarning ? 'warning' : ''}`}>
            <div className='timer-icon'>⏱️</div>
            <div className='timer-display'>{countdown.display}</div>
        </div>
        <div className='card-content'>
            <div className='card-header'>
                <div className='card-category'>{item.category}</div>
                <div className='bid-count'>{item.bidCount || 0} bids</div>
            </div>

            <h3 className='card-title'>{item.title}</h3>
            <p className='card-description'>{item.description}</p>
        </div>
        <motion.div
          className="price-section"
          animate={isFlashing ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
            <div className='price-label'>Current Bid</div>
            <div className='price-value'>
                ${item.currentBid.toLocaleString()}
            </div>
        </motion.div>
        <motion.button 
          className={`bid-button ${isBidding ? 'bidding' : ''} ${hasEnded ? 'disabled' : ''}`}
          onClick={handleBid}
          disabled={hasEnded || isBidding}
          whileHover={!hasEnded && !isBidding ? { scale: 1.02 } : {}}
          whileTap={!hasEnded && !isBidding ? { scale: 0.98 } : {}}
        >
            {hasEnded ? (
                'Auction Ended'
            ) : isBidding ? (
                <span className='bidding-text'>
                    <span className='spinner' />
                    Placing Bid...
                </span>
            ) : (
                `Bid $${(item.currentBid + bidIncrement).toLocaleString()}`
            )}
        </motion.button>
        </motion.div>

      
    )
}

export default AuctionCard;