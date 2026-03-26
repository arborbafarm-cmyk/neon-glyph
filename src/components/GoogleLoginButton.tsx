import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { useNavigate } from 'react-router-dom';
import { registerPlayer } from '@/services/playerService';
import { resetPlayerSession } from '@/services/sessionResetService';
import { usePlayerStore } from '@/store/playerStore';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function GoogleLoginButton() {
  const { member, actions } = useMember();
  const navigate = useNavigate();

  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const reset = usePlayerStore((state) => state.reset);

  const [isLoading, setIsLoading] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await actions.login();
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handlePlayerRegistration = async () => {
      if (!member || !member.loginEmail || hasRegistered) return;

      try {
        setHasRegistered(true);

        console.log('🔄 Resetting session before Google login registration...');

        // Limpa stores legadas e sessão persistida
        await resetPlayerSession();

        // Garante que a store principal também comece limpa
        reset();

        const playerName =
          member.contact?.firstName || member.profile?.nickname || 'Player';
        const nickname =
          member.profile?.nickname || member.contact?.firstName || 'Anonymous';

        const player = await registerPlayer(
          member.loginEmail,
          playerName,
          nickname
        );

        // Sincroniza a UI com o player completo retornado do banco
        setPlayer(player);

        navigate('/star-map');
      } catch (error) {
        console.error('Error registering player:', error);
        reset();
        setHasRegistered(false);
      } finally {
        setIsLoading(false);
      }
    };

    handlePlayerRegistration();
  }, [member, hasRegistered, navigate, setPlayer, reset]);

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full bg-primary hover:bg-orange-600 text-white font-heading text-lg py-6 rounded-lg transition-colors"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner />
          <span>Conectando...</span>
        </div>
      ) : (
        <span>🔐 Login com Google</span>
      )}
    </Button>
  );
}