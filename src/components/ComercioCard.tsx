import { motion } from 'framer-motion';
import { ComercioKey, COMERCIOS_CONFIG, calcularValorLavagem, calcularTempoLavagem, calcularTaxaAplicada } from '@/types/comercios';
import { ComercioData } from '@/types/comercios';
import { Button } from '@/components/ui/button';

interface ComercioCardProps {
  comercioKey: ComercioKey;
  data: ComercioData;
  onIniciar: () => void;
  onFinalizar: () => void;
  isLoading?: boolean;
  dirtyMoney: number;
}

export default function ComercioCard({
  comercioKey,
  data,
  onIniciar,
  onFinalizar,
  isLoading = false,
  dirtyMoney,
}: ComercioCardProps) {
  const config = COMERCIOS_CONFIG[comercioKey];
  const valorLavagem = calcularValorLavagem(comercioKey, data.nivelNegocio);
  const tempoLavagem = calcularTempoLavagem(comercioKey, data.nivelNegocio);
  const taxaAplicada = calcularTaxaAplicada(comercioKey, data.nivelTaxa);
  const cleanMoneyGanho = Math.floor(data.valorAtual * (taxaAplicada / 100));

  const tempoRestante = data.horarioFim ? Math.max(0, data.horarioFim - Date.now()) : 0;
  const tempoRestanteFormatado = Math.ceil(tempoRestante / 1000);

  const podeIniciar = !data.emAndamento && dirtyMoney >= valorLavagem;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-500/60 transition-all"
    >
      <div className="mb-4">

      </div>
      <div className="space-y-2 mb-4 text-sm">

      </div>
      {data.emAndamento && (
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded">
          <div className="text-sm text-blue-300 mb-2">
            {tempoRestanteFormatado > 0 ? `Tempo restante: ${tempoRestanteFormatado}s` : 'Pronto para finalizar!'}
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: tempoRestante > 0 ? `${(tempoRestante / tempoLavagem) * 100}%` : '100%' }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </div>
      )}
      <div className="flex gap-2">

      </div>
      {!podeIniciar && !data.emAndamento && (
        <div className="mt-3 text-xs text-red-400 text-center">
          {dirtyMoney < valorLavagem ? 'Dinheiro sujo insuficiente' : 'Indisponível'}
        </div>
      )}
    </motion.div>
  );
}
