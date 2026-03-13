import { useState } from 'react';
import { useMember } from '@/integrations';
import { useNavigate } from 'react-router-dom';
import { playerService } from '@/services/playerService';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function GoogleLoginButton() {
  const { member, actions } = useMember();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
  const handlePlayerRegistration = async () => {
    if (member && member.loginEmail) {
      try {
        const playerName = member.contact?.firstName || member.profile?.nickname || 'Player';
        const nickname = member.profile?.nickname || member.contact?.firstName || 'Anonymous';

        await playerService.registerPlayer(member.loginEmail, playerName, nickname);
        // Redirect to game page after successful registration
        navigate('/game');
      } catch (error) {
        console.error('Error registering player:', error);
      }
    }
  };

  // Auto-register when member logs in
  if (member && member.loginEmail && !isLoading) {
    handlePlayerRegistration();
  }

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
