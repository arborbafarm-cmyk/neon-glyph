import { useEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { useDirtyMoneyStore } from "@/store/dirtyMoneyStore";
import { useCleanMoneyStore } from "@/store/cleanMoneyStore";
import { usePlayerStore } from "@/store/playerStore";
import { useSpinVault } from "@/hooks/useSpinVault";
import { useNavigate } from "react-router-dom";
import { useMember } from "@/integrations";
import { LogOut } from "lucide-react";

const LOGO_SRC = "https://static.wixstatic.com/media/50f4bf_01590cb08b7048babbfed83e2830a27c\~mv2.png";

export default function Header() {
  const { dirtyMoney } = useDirtyMoneyStore();
  const { cleanMoney } = useCleanMoneyStore();
  const { playerName, setPlayerName, resetPlayer, level } = usePlayerStore();
  const { spins, timeUntilNextGain, formatTime } = useSpinVault();
  const { actions, member } = useMember();
  const navigate = useNavigate();

  const [avatarUrl, setAvatarUrl] = useState(
    "https://static.wixstatic.com/media/50f4bf_a888df3d639f415b853110e459edba8c\~mv2.png"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("playerName");
    const savedAvatar = localStorage.getItem("playerAvatar");

    if (savedName) setPlayerName(savedName);
    if (savedAvatar) setAvatarUrl(savedAvatar);
  }, []);

  const handleLogout = async () => {
    localStorage.clear();
    resetPlayer();
    if (member) await actions.logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black">
      {/* Barra principal - igual à imagem */}
      <div
        className="w-full py-3 px-6 border-b-2 border-[#d4af37]"
        style={{
          background: "linear-gradient(90deg, #1a0a07 0%, #2b0d09 40%, #120807 100%)",
        }}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">

          {/* ESQUERDA - Logo */}
          <div className="flex items-center">
            <Image
              src={LOGO_SRC}
              alt="Domínio do Comando"
              width={220}
              height={85}
              className="object-contain"
            />
          </div>

          {/* CENTRO - Avatar + Nome + Stats */}
          <div className="flex items-center gap-8">

            {/* Avatar + Nome */}
            <div className="flex items-center gap-4">
              <div className="w-[78px] h-[78px] rounded-full border-4 border-[#d4af37] overflow-hidden shadow-xl">
                <Image 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div>
                <div className="text-[#d4af37] font-bold text-2xl tracking-wide">
                  {playerName || "CAPO GHOST"}
                </div>
                <div className="bg-red-600 text-white text-xs px-5 py-1 font-bold uppercase tracking-widest inline-block">
                  COMANDANTE DE ELITE
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 text-white">

              <Stat label="NÍVEL" value={level} icon="★" />
              <Stat label="PODER" value="1.2M" icon="⚡" />
              <Stat label="DINHEIRO SUJO" value={`\[ {formatMoney(dirtyMoney)}`} icon="💰" />
              <Stat label="DINHEIRO LIMPO" value={` \]{formatMoney(cleanMoney)}`} icon="💵" />
              <Stat label="GIROS" value={spins} icon="♻️" />

            </div>
          </div>

          {/* DIREITA - Timer de Giros */}
          <div className="flex flex-col items-end">
            <div className="text-[#d4af37] text-xs uppercase tracking-widest font-bold mb-1">
              PRÓXIMO GANHO DE GIROS EM:
            </div>

            <div className="flex gap-1.5">
              {formatTimer(formatTime(timeUntilNextGain)).map((digit, index) => (
                <div
                  key={index}
                  className="bg-black border border-gray-600 text-white text-3xl font-bold px-4 py-2 min-w-[52px] text-center"
                >
                  {digit}
                </div>
              ))}
            </div>

            <div className="text-gray-400 text-xs mt-1">
              Tempo até próximo giro (Nível 45)
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 transition-colors ml-4"
            title="Sair"
          >
            <LogOut size={28} />
          </button>

        </div>
      </div>
    </header>
  );
}

/* Componente Stat */
function Stat({ label, value, icon }: { label: string; value: string | number; icon?: string }) {
  return (
    <div className="flex flex-col items-center min-w-[80px]">
      <div className="text-[#d4af37] text-[10px] font-bold tracking-widest uppercase">
        {label}
      </div>
      <div className="text-white font-bold text-lg flex items-center gap-1">
        {icon && <span className="text-xl">{icon}</span>}
        {value}
      </div>
    </div>
  );
}

/* Formatadores */
function formatMoney(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "K";
  return v.toString();
}

function formatTimer(t: string): string[] {
  const parts = t.split(":");
  return parts.length === 2 ? parts : ["45", "00"];
}
