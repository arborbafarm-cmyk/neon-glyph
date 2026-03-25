import { useState, useEffect } from 'react';
import { X, Clock3, DollarSign, Landmark, BadgeDollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ComercioKey,
  COMERCIOS_CONFIG,
  calcularValorLavagem,
  calcularTempoLavagem,
  calcularTaxaAplicada,
} from '@/types/comercios';
import { ComercioData } from '@/types/comercios';

interface CommerceOperationModalProps {
  isOpen: boolean;
  commerceId: ComercioKey | null;
  commerceData: ComercioData | null;
  dirtyMoney: number;
  cleanMoney: number;
  onClose: () => void;
  onStartOperation: (commerceId: ComercioKey) => Promise<void>;
  onCompleteOperation: (commerceId: ComercioKey) => Promise<void>;
}

export default function CommerceOperationModal({
  isOpen,
  commerceId,
  commerceData,
  dirtyMoney,
  cleanMoney,
  onClose,
  onStartOperation,
  onCompleteOperation,
}: CommerceOperationModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !commerceData?.emAndamento || !commerceData?.horarioFim) return;

    const updateTimer = () => {
      const remaining = Math.max(0, commerceData.horarioFim! - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 250);
    return () => clearInterval(interval);
  }, [isOpen, commerceData?.emAndamento, commerceData?.horarioFim]);

  if (!isOpen || !commerceId || !commerceData) return null;

  const config = COMERCIOS_CONFIG[commerceId];
  const valorLavagem = calcularValorLavagem(commerceId, commerceData.nivelNegocio);
  const tempoLavagem = calcularTempoLavagem(commerceId, commerceData.nivelNegocio);
  const taxaAplicada = calcularTaxaAplicada(commerceId, commerceData.nivelTaxa);
  const descontoEfetivo = COMERCIOS_CONFIG[commerceId].taxaBase - taxaAplicada;
  const cleanMoneyGanho = Math.floor(valorLavagem * (taxaAplicada / 100));

  const hoje = new Date().toDateString();
  const jaUsouHoje = commerceData.ultimaDataUso === hoje;

  let status = 'Disponível';
  let statusColor = 'text-emerald-400';
  let statusBg = 'from-emerald-500/20 to-emerald-300/10 border-emerald-400/40';

  if (commerceData.emAndamento) {
    status = 'Lavagem em andamento';
    statusColor = 'text-amber-300';
    statusBg = 'from-amber-500/20 to-orange-300/10 border-amber-400/40';
  } else if (jaUsouHoje && !commerceData.emAndamento) {
    status = 'Limite diário atingido';
    statusColor = 'text-red-300';
    statusBg = 'from-red-500/20 to-red-300/10 border-red-400/40';
  }

  const canStart =
    !commerceData.emAndamento &&
    !jaUsouHoje &&
    dirtyMoney >= valorLavagem;

  const canComplete =
    !!commerceData.emAndamento &&
    !!commerceData.horarioFim &&
    Date.now() >= commerceData.horarioFim;

  const handleStartClick = async () => {
    setError('');
    setIsStarting(true);
    try {
      await onStartOperation(commerceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar lavagem');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteClick = async () => {
    setError('');
    setIsCompleting(true);
    try {
      await onCompleteOperation(commerceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar lavagem');
    } finally {
      setIsCompleting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const StatCard = ({
    icon,
    title,
    value,
    valueClass = 'text-cyan-200',
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    valueClass?: string;
  }) => (
    <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
        {icon}
        <span>{title}</span>
      </div>
      <div className={`mt-3 text-lg md:text-xl font-black ${valueClass}`}>
        {value}
      </div>
    </div>
  );

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
        <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-cyan-400/30 bg-[linear-gradient(180deg,rgba(6,12,24,0.98)_0%,rgba(12,20,36,0.98)_100%)] shadow-[0_0_60px_rgba(0,240,255,0.18)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.08),transparent_35%),radial-gradient(circle_at_bottom,rgba(157,0,255,0.08),transparent_35%)]" />

          <div className="relative border-b border-cyan-400/20 bg-black/20 px-5 py-4 md:px-8 md:py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-400/70">
                  Operação de lavagem
                </p>
                <h2 className="mt-2 text-2xl md:text-3xl font-black uppercase tracking-wide text-cyan-200">
                  {config.nome}
                </h2>

                <div className={`mt-3 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusBg} ${statusColor}`}>
                  {commerceData.emAndamento ? (
                    <Clock3 className="h-4 w-4" />
                  ) : jaUsouHoje ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>{status}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full border border-cyan-400/20 bg-slate-900/70 p-2 text-cyan-300 transition hover:bg-slate-800 hover:text-cyan-100"
                aria-label="Fechar modal"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          <div className="relative px-5 py-5 md:px-8 md:py-7">
            {error && (
              <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm font-medium text-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatCard
                icon={<BadgeDollarSign className="h-4 w-4" />}
                title="Valor de lavagem"
                value={formatCurrency(valorLavagem)}
                valueClass="text-cyan-200"
              />

              <StatCard
                icon={<Clock3 className="h-4 w-4" />}
                title="Tempo da operação"
                value={formatTime(Math.floor(tempoLavagem / 1000))}
                valueClass="text-sky-200"
              />

              <StatCard
                icon={<DollarSign className="h-4 w-4" />}
                title="Taxa base"
                value={`${COMERCIOS_CONFIG[commerceId].taxaBase}%`}
                valueClass="text-orange-300"
              />

              <StatCard
                icon={<Landmark className="h-4 w-4" />}
                title="Desconto de eficiência"
                value={`-${descontoEfetivo.toFixed(1)}%`}
                valueClass="text-emerald-300"
              />

              <StatCard
                icon={<DollarSign className="h-4 w-4" />}
                title="Taxa final"
                value={`${taxaAplicada.toFixed(1)}%`}
                valueClass="text-yellow-300"
              />

              <StatCard
                icon={<BadgeDollarSign className="h-4 w-4" />}
                title="Dinheiro limpo recebido"
                value={formatCurrency(cleanMoneyGanho)}
                valueClass="text-emerald-400"
              />
            </div>

            {commerceData.emAndamento && timeLeft > 0 && (
              <div className="mt-6 rounded-3xl border border-purple-400/30 bg-gradient-to-r from-purple-950/40 to-cyan-950/30 p-5 text-center shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  Tempo restante
                </p>
                <p className="mt-3 text-3xl md:text-4xl font-black text-purple-300 font-mono">
                  {formatTime(timeLeft)}
                </p>
              </div>
            )}

            {commerceData.emAndamento && timeLeft === 0 && (
              <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-gradient-to-r from-emerald-950/40 to-cyan-950/30 p-5 text-center shadow-[0_0_30px_rgba(16,185,129,0.12)]">
                <p className="text-xl font-black uppercase text-emerald-300">
                  Operação concluída
                </p>
                <p className="mt-2 text-sm text-emerald-100/80">
                  Clique em <strong>Finalizar Lavagem</strong> para receber o dinheiro limpo.
                </p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <StatCard
                icon={<BadgeDollarSign className="h-4 w-4" />}
                title="Dinheiro sujo disponível"
                value={formatCurrency(dirtyMoney)}
                valueClass="text-red-300"
              />

              <StatCard
                icon={<BadgeDollarSign className="h-4 w-4" />}
                title="Dinheiro limpo total"
                value={formatCurrency(cleanMoney)}
                valueClass="text-emerald-400"
              />
            </div>
          </div>

          <div className="relative flex flex-col-reverse gap-3 border-t border-cyan-400/20 bg-black/20 px-5 py-4 md:flex-row md:justify-end md:px-8">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-cyan-400/40 bg-transparent text-cyan-200 hover:bg-cyan-500/10 hover:text-cyan-100"
            >
              Fechar
            </Button>

            {commerceData.emAndamento && timeLeft === 0 && canComplete ? (
              <Button
                onClick={handleCompleteClick}
                disabled={isCompleting}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black uppercase tracking-wide hover:from-emerald-400 hover:to-emerald-500"
              >
                {isCompleting ? 'Finalizando...' : 'Finalizar Lavagem'}
              </Button>
            ) : canStart ? (
              <Button
                onClick={handleStartClick}
                disabled={isStarting}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-wide hover:from-cyan-400 hover:to-blue-500"
              >
                {isStarting ? 'Iniciando...' : 'Iniciar Lavagem'}
              </Button>
            ) : (
              <Button
                disabled
                className="bg-slate-700 text-slate-300 cursor-not-allowed font-bold uppercase tracking-wide"
              >
                {jaUsouHoje ? 'Limite Diário Atingido' : 'Indisponível'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}