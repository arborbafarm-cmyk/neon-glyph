import { motion } from 'framer-motion';
import { ComercioKey, COMERCIOS_CONFIG, calcularCustoUpgradeNegocio, calcularCustoUpgradeTaxa, ComercioData } from '@/types/comercios';
import { Button } from '@/components/ui/button';

interface ComerciosUpgradePanelProps {
  comercioKey: ComercioKey;
  data: ComercioData;
  cleanMoney: number;
  onUpgradeCapacidade: () => void;
  onUpgradeEficiencia: () => void;
  isLoading?: boolean;
}

export default function ComerciosUpgradePanel({
  comercioKey,
  data,
  cleanMoney,
  onUpgradeCapacidade,
  onUpgradeEficiencia,
  isLoading = false,
}: ComerciosUpgradePanelProps) {
  const config = COMERCIOS_CONFIG[comercioKey];
  const custoCapacidade = calcularCustoUpgradeNegocio(data.nivelNegocio);
  const custoEficiencia = calcularCustoUpgradeTaxa(data.nivelTaxa);

  const podeUpgradeCapacidade = data.nivelNegocio < 50 && cleanMoney >= custoCapacidade;
  const podeUpgradeEficiencia = data.nivelTaxa < 30 && cleanMoney >= custoEficiencia;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-lg p-6"
    >
      <h3 className="text-lg font-heading text-purple-400 mb-4">{config.nome}</h3>

      <div className="space-y-4">
        {/* Capacidade */}
        <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-blue-300 font-semibold">Capacidade do Negócio</h4>
              <p className="text-xs text-gray-400 mt-1">Aumenta valor e tempo de lavagem</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-400">Nível {data.nivelNegocio}/50</div>
              <div className="text-xs text-gray-400">Custo: ${custoCapacidade}</div>
            </div>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(data.nivelNegocio / 50) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <Button
            onClick={onUpgradeCapacidade}
            disabled={!podeUpgradeCapacidade || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            {isLoading ? 'Atualizando...' : data.nivelNegocio >= 50 ? 'Máximo Atingido' : 'Fazer Upgrade'}
          </Button>

          {!podeUpgradeCapacidade && data.nivelNegocio < 50 && (
            <p className="text-xs text-red-400 mt-2">Dinheiro limpo insuficiente</p>
          )}
        </div>

        {/* Eficiência */}
        <div className="bg-slate-800/50 border border-orange-500/30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-orange-300 font-semibold">Eficiência Fiscal</h4>
              <p className="text-xs text-gray-400 mt-1">Reduz a taxa de lavagem</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-400">Nível {data.nivelTaxa}/30</div>
              <div className="text-xs text-gray-400">Custo: ${custoEficiencia}</div>
            </div>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-yellow-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(data.nivelTaxa / 30) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <Button
            onClick={onUpgradeEficiencia}
            disabled={!podeUpgradeEficiencia || isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:opacity-50"
          >
            {isLoading ? 'Atualizando...' : data.nivelTaxa >= 30 ? 'Máximo Atingido' : 'Fazer Upgrade'}
          </Button>

          {!podeUpgradeEficiencia && data.nivelTaxa < 30 && (
            <p className="text-xs text-red-400 mt-2">Dinheiro limpo insuficiente</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
