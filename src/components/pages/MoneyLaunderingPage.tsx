import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MoneyLaunderingBusiness from '@/components/MoneyLaunderingBusiness';
import { usePlayerStore } from '@/store/playerStore';
import { useMoneyLaunderingStore } from '@/store/moneyLaunderingStore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { MoneyLaunderingBusinesses } from '@/entities';
import { motion } from 'framer-motion';

export default function MoneyLaunderingPage() {
  const navigate = useNavigate();
  const playerStore = usePlayerStore();
  const launderingStore = useMoneyLaunderingStore();
  
  const [businesses, setBusinesses] = useState<MoneyLaunderingBusinesses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);

  // Load businesses from CMS
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await BaseCrudService.getAll<MoneyLaunderingBusinesses>('moneylaunderingbusinesses');
        
        if (!result.items || result.items.length === 0) {
          setError('Nenhum negócio de lavagem disponível. Verifique o CMS.');
          setBusinesses([]);
        } else {
          setBusinesses(result.items);
        }
      } catch (err) {
        console.error('Erro ao carregar negócios:', err);
        setError(`Erro ao carregar dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        setBusinesses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  // Test mode - simulate a complete money laundering operation
  const runCompleteTest = async () => {
    setTestMode(true);
    setError(null);

    try {
      // Step 1: Verify player data
      console.log('🧪 TESTE COMPLETO DE LAVAGEM DE DINHEIRO');
      console.log('📊 Dados do Jogador:', {
        playerName: playerStore.playerName,
        level: playerStore.level,
        money: playerStore.playerMoney,
      });

      if (!playerStore.playerName || playerStore.playerName === 'COMANDANTE') {
        throw new Error('Dados do jogador não carregados. Faça login primeiro.');
      }

      // Step 2: Verify businesses loaded
      if (businesses.length === 0) {
        throw new Error('Nenhum negócio carregado do CMS.');
      }

      console.log(`✅ ${businesses.length} negócios carregados`);

      // Step 3: Simulate operation on first business
      const testBusiness = businesses[0];
      console.log('🏪 Negócio de Teste:', testBusiness.businessName);

      const testAmount = Math.min(testBusiness.initialValue || 1000, playerStore.playerMoney);
      const testRate = testBusiness.initialRate || 10;
      const testTime = testBusiness.baseTime || 3600;

      console.log('💰 Simulação:', {
        amount: testAmount,
        rate: testRate,
        estimatedTime: testTime,
      });

      // Step 4: Calculate cleaned amount
      const cleanedAmount = testAmount * (1 - testRate / 100);
      console.log('✨ Resultado:', {
        dirtyMoney: testAmount,
        cleanMoney: cleanedAmount,
        loss: testAmount - cleanedAmount,
      });

      // Step 5: Add operation to store
      launderingStore.addOperation({
        businessId: testBusiness._id,
        businessName: testBusiness.businessName || 'Negócio Teste',
        amount: testAmount,
        rate: testRate,
        timeRemaining: testTime,
        completionTime: testTime,
        cleanedAmount,
        status: 'processing',
        startedAt: new Date(),
        lastOperationDate: new Date().toISOString().split('T')[0],
      });

      console.log('✅ Operação iniciada com sucesso!');
      console.log('🎯 Status: PROCESSANDO');
      
      // Simulate completion after 3 seconds
      setTimeout(() => {
        launderingStore.updateOperation(testBusiness._id, {
          status: 'completed',
          timeRemaining: 0,
        });
        console.log('✅ Operação CONCLUÍDA!');
        console.log('💵 Dinheiro Limpo Recebido:', cleanedAmount);
        setTestMode(false);
      }, 3000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ ERRO NO TESTE:', errorMsg);
      setError(errorMsg);
      setTestMode(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />

      {/* Navigation Buttons */}
      <div className="absolute top-24 left-6 z-20 flex gap-3">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="sm"
          className="bg-[#FF4500]/20 border-[#FF4500] text-white hover:bg-[#FF4500]/40"
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="bg-[#00eaff]/20 border-[#00eaff] text-white hover:bg-[#00eaff]/40"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-heading font-bold text-white mb-2">
            Operações de Lavagem
          </h1>
          <p className="text-gray-400 text-lg">
            Gerencie seus negócios de lavagem de dinheiro
          </p>
        </motion.div>

        {/* Player Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Jogador</p>
              <p className="text-white text-xl font-semibold">{playerStore.playerName}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Nível</p>
              <p className="text-cyan-400 text-xl font-semibold">{playerStore.level}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Dinheiro Disponível</p>
              <p className="text-green-400 text-xl font-semibold">
                ${playerStore.playerMoney.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Test Mode Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Button
            onClick={runCompleteTest}
            disabled={isLoading || testMode || businesses.length === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${testMode ? 'animate-spin' : ''}`} />
            {testMode ? 'Executando Teste...' : 'Executar Teste Completo'}
          </Button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-8 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold">Erro</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 mt-4">Carregando negócios...</p>
          </motion.div>
        )}

        {/* Businesses Grid */}
        {!isLoading && businesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {businesses.map((business, index) => (
              <motion.div
                key={business._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <MoneyLaunderingBusiness
                  businessId={business._id}
                  businessName={business.businessName || 'Negócio'}
                  initialValue={business.initialValue || 1000}
                  initialRate={business.initialRate || 10}
                  baseTime={business.baseTime || 3600}
                  businessImage={business.businessImage || ''}
                  currentRate={business.initialRate || 10}
                  currentMaxValue={business.initialValue || 1000}
                  currentTimeMultiplier={1}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Businesses State */}
        {!isLoading && businesses.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            <p className="text-gray-400 text-lg">Nenhum negócio de lavagem disponível</p>
            <p className="text-gray-500 text-sm mt-2">
              Adicione negócios no CMS para começar
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
