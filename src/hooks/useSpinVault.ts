import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { addSpinsToDatabase } from '@/services/spinEconomyService';

/**
 * CONSOLIDATED SPIN VAULT HOOK (PHASE 4)
 * 
 * REFACTORED: Database is now the single source of truth
 * - Spins are stored in players.spins (database)
 * - Passive spin gain saves to database immediately
 * - Store is synced after database updates
 * 
 * Spin Vault data is now part of playerStore:
 * - spins: number (synced from database)
 * - lastGainTime: number
 * - barracoLevel: number
 */
export const useSpinVault = () => {
  const { 
    spins, 
    setSpins,
    barracoLevel, 
    lastGainTime,
    updateLastGainTime,
    getTimeUntilNextGain,
    playerId,
  } = usePlayerStore();
  
  const [timeUntilNextGain, setTimeUntilNextGain] = useState(0);
  const [lastGainAmount, setLastGainAmount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Handle spin gain every 60 seconds - saves to database
  useEffect(() => {
    if (!playerId) return;

    const interval = setInterval(async () => {
      const gainAmount = Math.max(1, barracoLevel);
      
      // PHASE 4: Save spin gain to database immediately
      const result = await addSpinsToDatabase(playerId, gainAmount);
      
      if (result.success) {
        // Update local state after database confirms
        updateLastGainTime();
        setLastGainAmount(gainAmount);
        setShowNotification(true);

        // Hide notification after 2 seconds
        const timeoutId = setTimeout(() => {
          setShowNotification(false);
        }, 2000);
        
        return () => clearTimeout(timeoutId);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [barracoLevel, updateLastGainTime, playerId]);

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilNextGain(getTimeUntilNextGain());
    }, 1000);

    return () => clearInterval(interval);
  }, [getTimeUntilNextGain]);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return {
    spins,
    barracoLevel,
    timeUntilNextGain,
    formatTime,
    lastGainAmount,
    showNotification,
  };
};
