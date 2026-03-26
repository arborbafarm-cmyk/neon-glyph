import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';

/**
 * CONSOLIDATED SPIN VAULT HOOK (PHASE 1)
 * 
 * Previously used spinVaultStore separately
 * Now uses playerStore as single source of truth
 * 
 * Spin Vault data is now part of playerStore:
 * - spins: number
 * - lastGainTime: number
 * - barracoLevel: number
 */
export const useSpinVault = () => {
  const { 
    spins, 
    addSpins, 
    subtractSpins, 
    barracoLevel, 
    lastGainTime,
    updateLastGainTime,
    getTimeUntilNextGain 
  } = usePlayerStore();
  
  const [timeUntilNextGain, setTimeUntilNextGain] = useState(0);
  const [lastGainAmount, setLastGainAmount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Handle spin gain every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const gainAmount = Math.max(1, barracoLevel);
      addSpins(gainAmount);
      updateLastGainTime();
      setLastGainAmount(gainAmount);
      setShowNotification(true);

      // Hide notification after 2 seconds
      const timeoutId = setTimeout(() => {
        setShowNotification(false);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }, 60000);

    return () => clearInterval(interval);
  }, [barracoLevel, addSpins, updateLastGainTime]);

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

  const deductSpins = (amount: number): boolean => {
    if (spins >= amount) {
      subtractSpins(amount);
      return true;
    }
    return false;
  };

  return {
    spins,
    barracoLevel,
    timeUntilNextGain,
    formatTime,
    deductSpins,
    lastGainAmount,
    showNotification,
  };
};
