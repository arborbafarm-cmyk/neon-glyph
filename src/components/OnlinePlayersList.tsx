import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { LoggedInPlayers } from '@/entities';

export default function OnlinePlayersList() {
  const [onlinePlayers, setOnlinePlayers] = useState<LoggedInPlayers[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchOnlinePlayers = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        // TODO: Implement fetching online players from database
        // For now, just set empty array
        if (isMounted) {
          setOnlinePlayers([]);
        }
      } catch (error) {
        console.error('Error fetching online players:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOnlinePlayers();

    // Refresh every 10 seconds
    const interval = setInterval(fetchOnlinePlayers, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-background/50 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-secondary" />
          <h2 className="font-heading text-xl font-bold text-foreground">
            Jogadores Online
          </h2>
        </div>
        <p className="font-paragraph text-foreground/50">Carregando...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-background/50 backdrop-blur-sm border border-secondary/30 rounded-lg p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-secondary" />
        <h2 className="font-heading text-xl font-bold text-foreground">
          Jogadores Online ({onlinePlayers.length})
        </h2>
      </div>

      {onlinePlayers.length === 0 ? (
        <p className="font-paragraph text-foreground/50">
          Nenhum jogador online no momento. Seja o primeiro!
        </p>
      ) : (
        <div className="space-y-2">
          {onlinePlayers.map((player, index) => (
            <motion.div
              key={player._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-secondary/20 hover:border-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="font-heading text-sm font-bold text-foreground">
                    {player.nickname}
                  </p>
                  <p className="font-paragraph text-xs text-foreground/50">
                    {player.playerName}
                  </p>
                </div>
              </div>
              <div className="text-xs text-secondary font-paragraph">
                Online agora
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
