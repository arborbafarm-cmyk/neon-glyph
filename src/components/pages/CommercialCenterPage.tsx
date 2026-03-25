import { Image } from '@/components/ui/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useMember } from '@/integrations';
import { comerciosService } from '@/services/comerciosService';
import { Comercios, COMERCIOS_KEYS, ComercioKey } from '@/types/comercios';
import ComercioCard from '@/components/ComercioCard';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import CommercialCenterHotspots from '@/components/CommercialCenterHotspots';
import CommerceOperationModal from '@/components/CommerceOperationModal';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';
import { usePlayerStore } from '@/store/playerStore';
import { Building2, Landmark, Sparkles, ShieldCheck, Clock3, Banknote } from 'lucide-react';

interface CompletedOperation {
  id: string;
  name: string;
  cleanValue: number;
  profit: number;
  date: string;
}

const INITIAL_COMERCIOS_DATA: Comercios = {
  pizzaria: {
    nivelNegocio: 0,
    nivelTaxa: 0,
    ultimaDataUso: null,
    emAndamento: false,
    horarioFim: null,
    valorAtual: 0,
    taxaAplicada: 0,
  },
  admBens: {
    nivelNegocio: 0,
    nivelTaxa: 0,
    ultimaDataUso: null,
    emAndamento: false,
    horarioFim: null,
    valorAtual: 0,
    taxaAplicada: 0,
  },
  lavanderia: {
    nivelNegocio: 0,
    nivelTaxa: 0,
    ultimaDataUso: null,
    emAndamento: false,
    horarioFim: null,
    valorAtual: 0,
    taxaAplicada: 0,
  },
  academia: {
    nivelNegocio: 0,
    nivelTaxa: 0,
    ultimaDataUso: null,
    emAndamento: false,
    horarioFim: null,
    valorAtual: 0,
    taxaAplicada: 0,
  },
  templo: {
    nivelNegocio: 0,
    nivelTaxa: 0,
    ultimaDataUso: null,
    emAndamento: false,
    horarioFim: null,
    valorAtual: 0,
    taxaAplicada: 0,
  },
};

const TEST_DIRTY_MONEY = 1000000000;
const TEST_CLEAN_MONEY = 1000000000;

export default function CommercialCenterPage() {
  const { member } = useMember();

  const [comercios, setComercios] = useState<Comercios | null>(null);
  const [playerData, setPlayerData] = useState<Players | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedOps] = useState<CompletedOperation[]>([]);
  const [activeCommerceModal, setActiveCommerceModal] = useState<ComercioKey | null>(null);

  const { dirtyMoney, setDirtyMoney } = useDirtyMoneyStore();
  const { cleanMoney, setCleanMoney } = useCleanMoneyStore();
  const { setLevel, setPlayerId, setPlayerName } = usePlayerStore();

  const syncPlayerToStores = (player: Players) => {
    setDirtyMoney(player.dirtyMoney || 0);
    setCleanMoney(player.cleanMoney || 0);
    setLevel(player.level || 1);
    setPlayerId(player._id);
    setPlayerName(player.playerName || 'Jogador');
  };

  useEffect(() => {
    const load = async () => {
      if (!member?._id) {
        setIsLoading(false);
        return;
      }

      try {
        const playerId = member._id;

        let player = await BaseCrudService.getById<Players>('players', playerId);

        if (!player) {
          player = {
            _id: playerId,
            playerName: member.profile?.nickname || 'Jogador',
            cleanMoney: TEST_CLEAN_MONEY,
            dirtyMoney: TEST_DIRTY_MONEY,
            level: 1,
            progress: 0,
            comercios: JSON.stringify(INITIAL_COMERCIOS_DATA),
            isGuest: false,
            profilePicture: member.profile?.photo?.url,
          };

          await BaseCrudService.create('players', player);
        } else {
          const payload: Partial<Players> & { _id: string } = { _id: playerId };
          let needsUpdate = false;

          if (player.dirtyMoney !== TEST_DIRTY_MONEY) {
            payload.dirtyMoney = TEST_DIRTY_MONEY;
            needsUpdate = true;
          }

          if (player.cleanMoney !== TEST_CLEAN_MONEY) {
            payload.cleanMoney = TEST_CLEAN_MONEY;
            needsUpdate = true;
          }

          if (!player.comercios) {
            payload.comercios = JSON.stringify(INITIAL_COMERCIOS_DATA);
            needsUpdate = true;
          }

          if (needsUpdate) {
            await BaseCrudService.update<Players>('players', payload);
            const refreshed = await BaseCrudService.getById<Players>('players', playerId);
            if (refreshed) player = refreshed;
          }
        }

        setPlayerData(player);
        syncPlayerToStores(player);

        const parsed = player.comercios
          ? JSON.parse(player.comercios)
          : INITIAL_COMERCIOS_DATA;
setComercios(parsed);
      } catch (error) {
        console.error('Erro ao carregar dados do jogador:', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [member?._id]);

  useEffect(() => {
    if (!member?._id) return;

    const interval = setInterval(async () => {
      try {
        const player = await BaseCrudService.getById<Players>('players', member._id);

        if (player) {
          setPlayerData(player);
          syncPlayerToStores(player);

          const parsed = player.comercios
            ? JSON.parse(player.comercios)
            : INITIAL_COMERCIOS_DATA;

          setComercios(parsed);
        }
      } catch (error) {
        console.error('Erro ao atualizar dados:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [member?._id]);

  const handleIniciarLavagem = async (key: ComercioKey) => {
    if (!member?._id) return;

    try {
      const result = await comerciosService.iniciarLavagem(member._id, key, dirtyMoney);

      if (!result.sucesso) {
        alert(result.mensagem);
        return;
      }

      const updatedPlayer = await BaseCrudService.getById<Players>('players', member._id);
      if (updatedPlayer) {
        setPlayerData(updatedPlayer);
        syncPlayerToStores(updatedPlayer);

        const parsed = updatedPlayer.comercios
          ? JSON.parse(updatedPlayer.comercios)
          : INITIAL_COMERCIOS_DATA;

        setComercios(parsed);
      }
    } catch (error) {
      console.error('Erro ao iniciar lavagem:', error);
      alert('Erro ao iniciar lavagem');
    }
  };

  const handleFinalizarLavagem = async (key: ComercioKey) => {
    if (!member?._id) return;

    try {
      const result = await comerciosService.finalizarLavagem(member._id, key);

      if (!result.sucesso) {
        alert(result.mensagem);
        return;
      }

      const updatedPlayer = await BaseCrudService.getById<Players>('players', member._id);
      if (updatedPlayer) {
        setPlayerData(updatedPlayer);
        syncPlayerToStores(updatedPlayer);

        const parsed = updatedPlayer.comercios
          ? JSON.parse(updatedPlayer.comercios)
          : INITIAL_COMERCIOS_DATA;

        setComercios(parsed);
      }
    } catch (error) {
      console.error('Erro ao finalizar lavagem:', error);
      alert('Erro ao finalizar lavagem');
    }
  };

  const handleStartOperation = async (key: ComercioKey) => {
    await handleIniciarLavagem(key);
    setActiveCommerceModal(null);
  };

  const handleCompleteOperation = async (key: ComercioKey) => {
    await handleFinalizarLavagem(key);
    setActiveCommerceModal(null);
  };

  const openCommerceModal = (id: string) => {
    const map: Record<string, ComercioKey> = {
      pizzaria: 'pizzaria',
      admBens: 'admBens',
      templo: 'templo',
      academia: 'academia',
      lavanderia: 'lavanderia',
    };

    if (map[id]) setActiveCommerceModal(map[id]);
  };

  const closeCommerceModal = () => setActiveCommerceModal(null);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(v);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gridMove {
        from { background-position: 0 0; }
        to { background-position: 120px 120px; }
      }

      @keyframes pulse {
        from {
          text-shadow:
            0 0 10px #00f0ff,
            0 0 20px #00f0ff,
            0 0 30px #00f0ff;
          opacity: 0.92;
        }
        to {
          text-shadow:
            0 0 18px #00f0ff,
            0 0 38px #00f0ff,
            0 0 70px #00f0ff;
          opacity: 1;
        }
      }

      .neon-sign {
        color: #00f0ff;
        text-shadow:
          0 0 5px #00f0ff,
          0 0 10px #00f0ff,
          0 0 20px #00f0ff,
          0 0 40px #00f0ff;
        animation: pulse 3s infinite alternate;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .commercial-grid {
        background:
          radial-gradient(circle at top, rgba(0,240,255,0.08), transparent 24%),
          radial-gradient(circle at bottom right, rgba(157,0,255,0.10), transparent 22%),
          linear-gradient(to bottom, #070012, #05040f 35%, #000814 100%);
        position: relative;
        overflow: hidden;
      }

      .commercial-grid::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 12px,
          rgba(0, 240, 255, 0.025) 12px,
          rgba(0, 240, 255, 0.025) 24px
        );
        animation: gridMove 70s linear infinite;
        pointer-events: none;
      }

      .banner-container {
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(0,240,255,0.28);
        border-radius: 24px;
        box-shadow:
          0 0 30px rgba(0, 240, 255, 0.18),
          inset 0 0 20px rgba(0, 240, 255, 0.08);
        min-height: 620px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, rgba(0,0,0,0.20), rgba(0,0,0,0.35));
      }

      .panel-glass {
        border: 1px solid rgba(0,240,255,0.22);
        background: rgba(8, 16, 35, 0.55);
        backdrop-filter: blur(12px);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
      }

      .history-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }

      .history-table th,
      .history-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid rgba(0,240,255,0.28);
        color: #9fe7ff;
      }

      .history-table th {
        background: rgba(0, 240, 255, 0.08);
        font-weight: bold;
      }

      .history-table tr:hover {
        background: rgba(0, 240, 255, 0.05);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="commercial-grid min-h-screen flex flex-col">
      <Header />

      <div className="w-full pt-[92px] md:pt-[100px] px-4 relative z-10">
        <div className="max-w-[100rem] mx-auto mb-8">
          <div className="panel-glass rounded-2xl px-6 py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="neon-sign text-3xl md:text-5xl">
                CENTRO COMERCIAL
 </h1>
              <p className="text-cyan-100/80 mt-2 text-sm md:text-base">
                Administração dos comércios usados para lavagem de dinheiro, expansão operacional e retorno financeiro.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="panel-glass rounded-xl px-4 py-3 flex items-center gap-2 text-cyan-200">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-semibold">5 comércios</span>
              </div>

              <div className="panel-glass rounded-xl px-4 py-3 flex items-center gap-2 text-cyan-200">
                <Landmark className="w-4 h-4" />
                <span className="text-sm font-semibold">Lavagem estratégica</span>
              </div>

              <div className="panel-glass rounded-xl px-4 py-3 flex items-center gap-2 text-cyan-200">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm font-semibold">Controle do complexo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER */}
      <div className="w-full relative z-10 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="banner-container w-full relative">
            <div className="absolute top-4 left-4 z-20 panel-glass rounded-xl px-3 py-2 flex items-center gap-2 text-cyan-100 text-xs md:text-sm">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              Clique nas placas do prédio para abrir cada operação
            </div>

            <div className="relative w-full max-w-[1100px] mx-auto z-0 px-4">
              <Image
                src="https://static.wixstatic.com/media/50f4bf_fd64ac461d5d41c2a6bc7639af7590ac~mv2.png"
                alt="Centro Comercial"
                className="block h-auto w-full max-h-[600px] object-contain border-none"
              />
              <CommercialCenterHotspots onCommerceClick={openCommerceModal} />
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL FINANCEIRO */}
      <div className="w-full px-4 py-6 relative z-10">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="panel-glass rounded-2xl px-5 py-5">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Dinheiro Sujo</span>
            <div className="mt-2 text-2xl font-black text-green-400">
              {formatCurrency(dirtyMoney)}
            </div>
          </div>

          <div className="panel-glass rounded-2xl px-5 py-5">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Dinheiro Limpo</span>
            <div className="mt-2 text-2xl font-black text-yellow-400">
              {formatCurrency(cleanMoney)}
            </div>
          </div>

          <div className="panel-glass rounded-2xl px-5 py-5">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</span>
            <div className="mt-2 text-lg font-black text-cyan-300">
              {isLoading ? 'Carregando' : 'Operacional'}
            </div>
          </div>

          <div className="panel-glass rounded-2xl px-5 py-5">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Jogador</span>
            <div className="mt-2 text-lg font-black text-white">
              {playerData?.playerName || 'COMANDANTE'}
            </div>
          </div>
        </div>
      </div>

      {/* INFORMAÇÕES EXTRAS */}
      <div className="w-full px-4 py-2 relative z-10">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="panel-glass rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Clock3 className="w-4 h-4" />
              Ritmo operacional
            </div>
            <p className="text-sm text-slate-300 mt-2">
              Cada comércio opera com tempo, taxa e retorno próprios. Quanto melhor o negócio, melhor a eficiência.
            </p>
          </div>

          <div className="panel-glass rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Banknote className="w-4 h-4" />
              Conversão de capital
            </div>
            <p className="text-sm text-slate-300 mt-2">
              O valor lavado sai do dinheiro sujo e retorna como dinheiro limpo após a conclusão da operação.
            </p>
          </div>

          <div className="panel-glass rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              Limite diário
            </div>
            <p className="text-sm text-slate-300 mt-2">
              Cada comércio respeita limite diário e só pode ser reutilizado conforme a lógica definida no sistema.
            </p>
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div className="w-full px-4 py-10 relative z-10">
        <div className="max-w-[100rem] mx-auto">
          {isLoading ? (
            <div className="panel-glass rounded-2xl px-6 py-12 text-center text-cyan-300">
              Carregando comércios...
            </div>
          ) : comercios ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMERCIOS_KEYS.map((key) => (
                <ComercioCard
                  key={key}
                  comercioKey={key}
                  data={comercios[key]}
                  onIniciar={() => handleIniciarLavagem(key)}
                  onFinalizar={() => handleFinalizarLavagem(key)}
                  dirtyMoney={dirtyMoney}
                />
              ))}
            </div>
          ) : (
            <div className="panel-glass rounded-2xl px-6 py-12 text-center text-cyan-300">
              Erro ao carregar comércios
            </div>
          )}
        </div>
      </div>

      {/* HISTÓRICO */}
      {completedOps.length > 0 && (
        <div className="w-full px-4 py-10 relative z-10">
          <div className="max-w-[100rem] mx-auto panel-glass rounded-2xl p-6">
            <h2 className="neon-sign text-2xl mb-6">Histórico de Operações</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Comércio</th>
                  <th>Data</th>
                  <th>Valor Lavado</th>
                  <th>Lucro</th>
                </tr>
              </thead>
              <tbody>
                {completedOps.map((op) => (
                  <tr key={op.id}>
                    <td>{op.name}</td>
                    <td>{op.date}</td>
                    <td>{formatCurrency(op.cleanValue)}</td>
                    <td className="text-green-400 font-bold">
                      {formatCurrency(op.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {activeCommerceModal && (
        <CommerceOperationModal
          isOpen={true}
          commerceId={activeCommerceModal}
          commerceData={
            comercios?.[activeCommerceModal] || {
              nivelNegocio: 1,
              nivelTaxa: 1,
              emAndamento: false,
              ultimaDataUso: '',
              horarioFim: null,
              valorAtual: 0,
              taxaAplicada: 0,
            }
          }
          dirtyMoney={dirtyMoney}
          cleanMoney={cleanMoney}
          onClose={closeCommerceModal}
          onStartOperation={handleStartOperation}
          onCompleteOperation={handleCompleteOperation}
        />
      )}

{/* BOTÃO TESTE */}
      <Button
        onClick={() => setActiveCommerceModal('pizzaria')}
        className="fixed bottom-10 right-10 z-[9999] bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-[0_0_24px_rgba(255,120,0,0.35)]"
      >
        TESTAR MODAL
      </Button>

      <Footer />
    </div>
  );
}

