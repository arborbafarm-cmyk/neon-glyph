import { useEffect, useState } from "react";
import { Image } from "@/components/ui/image";
import { useDirtyMoneyStore } from "@/store/dirtyMoneyStore";
import { useCleanMoneyStore } from "@/store/cleanMoneyStore";
import { usePlayerStore } from "@/store/playerStore";
import { useSpinVault } from "@/hooks/useSpinVault";
import { useNavigate } from "react-router-dom";
import { usePlayerInitialization } from "@/hooks/usePlayerInitialization";
import { useMember } from "@/integrations";
import { Droplet, Shield, Zap, Coins, Gem } from "lucide-react";

const LOGO_SRC =
  "https://static.wixstatic.com/media/50f4bf_01590cb08b7048babbfed83e2830a27c~mv2.png";

export default function Header() {
  const { dirtyMoney } = useDirtyMoneyStore();
  const { cleanMoney } = useCleanMoneyStore();
  const { playerName, setPlayerName, level } = usePlayerStore();
  const { spins, timeUntilNextGain, formatTime } = useSpinVault();
  const navigate = useNavigate();
  const { member } = useMember();

  usePlayerInitialization();

  const [avatarUrl, setAvatarUrl] = useState(
    "https://static.wixstatic.com/media/50f4bf_a888df3d639f415b853110e459edba8c~mv2.png"
  );

  useEffect(() => {
    const savedName = localStorage.getItem("playerName");
    const savedAvatar = localStorage.getItem("playerAvatar");

    if (savedName) setPlayerName(savedName);
    if (savedAvatar) setAvatarUrl(savedAvatar);
  }, [setPlayerName]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-2 md:px-4 pt-2">
      <div
        className="mx-auto max-w-[1600px] rounded-2xl border overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]"
        style={{
          borderColor: "rgba(212,175,55,0.45)",
          background:
            "linear-gradient(90deg, rgba(10,5,5,0.97) 0%, rgba(28,10,10,0.98) 35%, rgba(14,8,8,0.97) 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" />

        <div className="relative px-3 md:px-5 py-3">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            {/* ESQUERDA */}
            <div className="flex items-center justify-center xl:justify-start min-w-[220px]">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-yellow-500/15" />
                <Image
                  src={LOGO_SRC}
                  alt="Logo"
                  width={210}
                  height={90}
                  className="relative object-contain drop-shadow-[0_0_18px_rgba(255,180,0,0.25)]"
                />
              </div>
            </div>

            {/* CENTRO */}
            <div className="flex-1">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md px-3 md:px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* AVATAR + IDENTIDADE */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 rounded-full blur-xl bg-yellow-400/30" />
                      <div className="relative w-[78px] h-[78px] rounded-full border-[3px] border-yellow-500 overflow-hidden shadow-[0_0_25px_rgba(255,215,0,0.35)]">
                        <Image
                          src={avatarUrl}
                          className="w-full h-full object-cover"
                          alt="Avatar do jogador"
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="text-yellow-300 font-black text-xl md:text-2xl truncate tracking-wide drop-shadow-[0_0_10px_rgba(255,200,0,0.18)]">
                        {playerName || "Jogador"}
                      </div>

                      <div className="mt-1 inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-600 text-white text-[10px] md:text-xs px-3 py-1 font-bold uppercase rounded-md tracking-[0.18em] shadow-[0_0_18px_rgba(255,0,0,0.18)]">
                        <Shield className="w-3.5 h-3.5" />
                        COMANDANTE DE ELITE
                      </div>
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                    <StatCard
                      icon={<Zap className="w-4 h-4" />}
                      label="Nível"
                      value={String(level)}
                    />
                    <StatCard
                      icon={<Shield className="w-4 h-4" />}
                      label="Poder"
                      value="1.2M"
                    />
                    <StatCard
                      icon={<Coins className="w-4 h-4" />}
                      label="Dinheiro Sujo"
                      value={formatMoney(dirtyMoney)}
                    />
                    <StatCard
                      icon={<Coins className="w-4 h-4" />}
                      label="Dinheiro Limpo"
                      value={formatMoney(cleanMoney)}
                    />
                    <StatCard
                      icon={<Gem className="w-4 h-4" />}
                      label="Giros"
                      value={String(spins)}
                    />
                  </div>

                  {/* BOTÃO */}
                  {member?._id && (
                    <div className="shrink-0">
                      <button
                        onClick={() => navigate("/money-laundering")}
                        className="w-full lg:w-auto flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-white font-bold tracking-wide border border-cyan-300/20 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_22px_rgba(0,180,255,0.22)] transition-all"
                        title="Operações de Lavagem"
                      >
                        <Droplet className="w-4 h-4" />
                        Lavagem
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DIREITA */}
            <div className="min-w-[220px]">
              <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="text-[10px] md:text-xs uppercase tracking-[0.22em] text-slate-300">
                  Próximo ganho de giros
                </div>

                <div className="flex gap-2 justify-center mt-3">
                  {formatTimer(formatTime(timeUntilNextGain)).map((t, i) => (
                    <div
                      key={i}
                      className="min-w-[58px] bg-gradient-to-b from-zinc-950 to-zinc-900 px-3 py-3 text-xl font-black border rounded-lg text-white shadow-[0_0_18px_rgba(0,0,0,0.28)]"
                      style={{ borderColor: "rgba(255,255,255,0.08)" }}
                    >
                      {t}
                    </div>
                  ))}
                </div>

                <div className="text-[11px] mt-2 text-slate-400">
                  Tempo até próximo giro
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-center gap-1 text-yellow-300 text-[11px] uppercase tracking-[0.14em]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-white font-black text-lg tracking-wide">
        {value}
      </div>
    </div>
  );
}

function formatMoney(v: number) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + "B";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "K";
  return String(v);
}

function formatTimer(t: string) {
  const parts = t.split(":");
  return parts.length === 2 ? parts : ["45", "00"];
}