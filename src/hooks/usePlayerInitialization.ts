import { useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { getInitialComercioData } from '@/types/comercios';
import { usePlayerStore } from '@/store/playerStore';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';

const TEST_MODE = true;
const TEST_DIRTY_MONEY = 1000000000;
const TEST_CLEAN_MONEY = 0;

export const usePlayerInitialization = () => {
  const { member } = useMember();

  const {
    setPlayerId,
    setPlayerName,
    setLevel,
    setProgress,
    setProfilePicture,
  } = usePlayerStore();

  const { setDirtyMoney } = useDirtyMoneyStore();
  const { setCleanMoney } = useCleanMoneyStore();

  useEffect(() => {
    const initializePlayer = async () => {
      if (!member?._id) {
        console.log('⚠️ Membro não autenticado');
        return;
      }

      try {
        console.log('🔄 Inicializando jogador para:', member._id);

        let player = await BaseCrudService.getById<Players>('players', member._id);

        if (!player) {
          console.log('📝 Criando novo jogador para:', member._id);

          const comercios = getInitialComercioData();

          const newPlayer: Players = {
            _id: member._id,
            playerName: member.profile?.nickname || 'Jogador',
            cleanMoney: TEST_MODE ? TEST_CLEAN_MONEY : 0,
            dirtyMoney: TEST_MODE ? TEST_DIRTY_MONEY : 1000,
            level: 1,
            progress: 0,
            comercios: JSON.stringify(comercios),
            isGuest: false,
            profilePicture: member.profile?.photo?.url,
          };

          await BaseCrudService.create('players', newPlayer);
          console.log('✅ Jogador criado com sucesso');

          setPlayerId(member._id);
          setPlayerName(newPlayer.playerName || 'Jogador');
          setLevel(newPlayer.level || 1);
          setProgress(newPlayer.progress || 0);
          setProfilePicture(newPlayer.profilePicture || null);
          setDirtyMoney(newPlayer.dirtyMoney || 0);
          setCleanMoney(newPlayer.cleanMoney || 0);

          return;
        }

        console.log('✅ Jogador encontrado:', player._id);

        let updatedFields: Partial<Players> = {};
        let needsUpdate = false;

        if (!player.comercios) {
          console.log('📝 Inicializando comércios para jogador existente');
          updatedFields.comercios = JSON.stringify(getInitialComercioData());
          needsUpdate = true;
        }

        if (TEST_MODE) {
          if (player.dirtyMoney !== TEST_DIRTY_MONEY) {
            updatedFields.dirtyMoney = TEST_DIRTY_MONEY;
            needsUpdate = true;
          }

          if (player.cleanMoney !== TEST_CLEAN_MONEY) {
            updatedFields.cleanMoney = TEST_CLEAN_MONEY;
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          await BaseCrudService.update<Players>('players', {
            _id: member._id,
            ...updatedFields,
          });

          player = await BaseCrudService.getById<Players>('players', member._id);
        }

        if (!player) {
          console.error('❌ Jogador não encontrado após atualização');
          return;
        }

        setPlayerId(player._id);
        setPlayerName(player.playerName || 'Jogador');
        setLevel(player.level || 1);
        setProgress(player.progress || 0);
        setProfilePicture(player.profilePicture || null);
        setDirtyMoney(player.dirtyMoney || 0);
        setCleanMoney(player.cleanMoney || 0);
      } catch (error) {
        console.error('❌ Erro ao inicializar jogador:', error);
      }
    };

    initializePlayer();
  }, [
    member?._id,
    setPlayerId,
    setPlayerName,
    setLevel,
    setProgress,
    setProfilePicture,
    setDirtyMoney,
    setCleanMoney,
  ]);
};