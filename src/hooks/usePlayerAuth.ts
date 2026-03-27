import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { getCurrentLocalPlayer, isPlayerAuthenticated } from '@/services/playerService';
import { getPlayer } from '@/services/playerCoreService';
import { resetPlayerSession } from '@/services/sessionResetService';

export function usePlayerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setPlayer = usePlayerStore((state) => state.setPlayer);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 🔥 CORREÇÃO CRÍTICA: Verificar PRIMEIRO se há sessão válida
        // Só resetar se realmente não houver sessão
        const isAuth = await isPlayerAuthenticated();

        if (!isAuth) {
          // Sessão inválida → resetar tudo e sair
          await resetPlayerSession();
          setIsAuthenticated(false);
          return;
        }

        // Sessão válida → carregar o player
        const localPlayer = await getCurrentLocalPlayer();

        if (!localPlayer?._id) {
          // Sessão existe mas player não → resetar e sair
          await resetPlayerSession();
          setIsAuthenticated(false);
          return;
        }

        // 🔥 SEMPRE puxar do banco (source of truth)
        const fullPlayer = await getPlayer(localPlayer._id);

        if (!fullPlayer) {
          // Player não existe no banco → resetar e sair
          await resetPlayerSession();
          setIsAuthenticated(false);
          return;
        }

        // ✅ Tudo válido → carregar player no store
        setPlayer(fullPlayer);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error initializing player auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [setPlayer]);

  return {
    isAuthenticated,
    isLoading,
  };
}

/**
 * Hook para verificar e restaurar sessão persistida
 * Usado na HomePage para auto-login
 * 🔥 CRÍTICO: Restaura dados de login e progresso do jogo
 */
export async function checkAndRestoreSession() {
  try {
    // 1️⃣ Verificar se há sessão válida no IndexedDB
    const isAuth = await isPlayerAuthenticated();
    if (!isAuth) {
      console.log('❌ Nenhuma sessão válida encontrada');
      return null;
    }

    // 2️⃣ Carregar dados do player do banco de dados
    const player = await getCurrentLocalPlayer();
    if (!player?._id) {
      console.log('❌ Player não encontrado na sessão');
      return null;
    }

    // 3️⃣ Buscar dados completos do player (source of truth)
    const fullPlayer = await getPlayer(player._id);
    if (!fullPlayer) {
      console.log('❌ Dados completos do player não encontrados');
      return null;
    }

    console.log('✅ Sessão restaurada com sucesso:', fullPlayer.playerName);
    return fullPlayer;
  } catch (error) {
    console.error('❌ Erro ao restaurar sessão:', error);
    return null;
  }
}