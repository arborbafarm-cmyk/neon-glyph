import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { useNavigate } from 'react-router-dom';
import { registerPlayer } from '@/services/playerService';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function GoogleLoginButton() {
  const { member, actions } = useMember();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Trigger Wix login (redirects to Google OAuth)
      await actions.login();
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  // Register player when member data is available after login
  useEffect(() => {
    const handlePlayerRegistration = async () => {
      if (member && member.loginEmail && !hasRegistered) {
        try {
          setHasRegistered(true);
          const playerName = member.contact?.firstName || member.profile?.nickname || 'Player';
          const nickname = member.profile?.nickname || member.contact?.firstName || 'Anonymous';

          await registerPlayer(member.loginEmail, playerName, nickname);
          // Redirect to game page after successful registration
          navigate('/star-map');
        } catch (error) {
          console.error('Error registering player:', error);
          setHasRegistered(false);
        }
      }
    };

    handlePlayerRegistration();
  }, [member, hasRegistered, navigate]);

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
