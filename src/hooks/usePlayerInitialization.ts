import { useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { getInitialComercioData } from '@/types/comercios';

export const usePlayerInitialization = () => {
  const { member } = useMember();

  useEffect(() => {
    const initializePlayer = async () => {
      if (!member?._id) return;

      try {
        let player = await BaseCrudService.getById<Players>('players', member._id);

        // Se o jogador não existe, criar um novo
        if (!player) {
          console.log('📝 Criando novo jogador para:', member._id);
          const comercios = getInitialComercioData();
          const newPlayer: Players = {
            _id: member._id,
            playerName: member.profile?.nickname || 'Jogador',
            cleanMoney: 0,
            dirtyMoney: 1000,
            level: 1,
            progress: 0,
            comercios: JSON.stringify(comercios),
            isGuest: false,
            profilePicture: member.profile?.photo?.url,
          };
          await BaseCrudService.create('players', newPlayer);
          console.log('✅ Jogador criado com sucesso');
          return;
        }

        // Se o jogador existe mas não tem dados de comércios, inicializar
        if (player && !player.comercios) {
          console.log('📝 Inicializando comércios para jogador existente');
          const comercios = getInitialComercioData();
          const dirtyMoney = player.dirtyMoney || 1000;

          await BaseCrudService.update<Players>('players', {
            _id: member._id,
            comercios: JSON.stringify(comercios),
            dirtyMoney,
          });
          console.log('✅ Comércios inicializados');
        }
      } catch (error) {
        console.error('Erro ao inicializar jogador:', error);
      }
    };

    initializePlayer();
  }, [member?._id]);
};
