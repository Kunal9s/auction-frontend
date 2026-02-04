import { useState, useEffect, useRef } from 'react';

export const useCountdown = (endTime, getServerTime) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        const updateCountdown = () => {
            const now = getServerTime();
            const remaining = Math.max(0, endTime - now);
            setTimeLeft(remaining);

            if (remaining === 0 && intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };

        updateCountdown();

        intervalRef.current = setInterval(updateCountdown, 100);
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [endTime, getServerTime]);

    const formatTime = () => {
        if (timeLeft <= 0) {
            return {display: 'ENDED', isExpired: true};
        }

        const totalSeconds = Math.floor(timeLeft / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return {
            display: `${minutes}:${seconds.toString().padStart(2, '0')}`, 
            minutes,
            seconds,
            isExpired: false,
            isCritical: totalSeconds < 30,
            isWarning: totalSeconds < 60
        };
    };

    return formatTime();
}