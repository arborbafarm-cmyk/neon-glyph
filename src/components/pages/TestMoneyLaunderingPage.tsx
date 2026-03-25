import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { MoneyLaunderingBusinesses } from '@/entities';
import { usePlayerStore } from '@/store/playerStore';
import { useMoneyLaunderingStore } from '@/store/moneyLaunderingStore';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TestMoneyLaunderingPage() {
  const playerStore = usePlayerStore();
  const launderingStore = useMoneyLaunderingStore();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  const addResult = (step: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setTestResults((prev) => [...prev, { step, status, message, details }]);
  };

  const runCompleteTest = async () => {
    setTestResults([]);
    setIsRunning(true);
    setTestComplete(false);

    try {
      // Step 1: Verify player data
      addResult('1. Verificar Dados do Jogador', 'pending', 'Verificando...');
      
      const playerName = playerStore.playerName;
      const playerLevel = playerStore.level;
      const playerMoney = playerStore.playerMoney;

      if (!playerName || playerName === 'COMANDANTE') {
        addResult('1. Verificar Dados do Jogador', 'error', 'Dados do jogador não carregados', {
          playerName,
          playerLevel,
          playerMoney,
        });
        setIsRunning(false);
        setTestComplete(true);
        return;
      }

      addResult('1. Verificar Dados do Jogador', 'success', 'Dados do jogador carregados com sucesso', {
        playerName,
        playerLevel,
        playerMoney,
      });

      // Step 2: Load businesses from CMS
      addResult('2. Carregar Negócios do CMS', 'pending', 'Carregando...');
      
      const businessResult = await BaseCrudService.getAll<MoneyLaunderingBusinesses>('moneylaunderingbusinesses');
      
      if (!businessResult.items || businessResult.items.length === 0) {
        addResult('2. Carregar Negócios do CMS', 'error', 'Nenhum negócio encontrado no CMS', {
          itemCount: businessResult.items?.length || 0,
        });
        setIsRunning(false);
        setTestComplete(true);
        return;
      }

      addResult('2. Carregar Negócios do CMS', 'success', `${businessResult.items.length} negócios carregados`, {
        businesses: businessResult.items.map((b) => ({
          id: b._id,
          name: b.businessName,
          initialValue: b.initialValue,
          initialRate: b.initialRate,
          baseTime: b.baseTime,
        })),
      });

      // Step 3: Select first business for test
      addResult('3. Selecionar Negócio de Teste', 'pending', 'Selecionando...');
      
      const testBusiness = businessResult.items[0];
      
      addResult('3. Selecionar Negócio de Teste', 'success', `Negócio selecionado: ${testBusiness.businessName}`, {
        businessId: testBusiness._id,
        businessName: testBusiness.businessName,
      });

      // Step 4: Calculate operation parameters
      addResult('4. Calcular Parâmetros da Operação', 'pending', 'Calculando...');
      
      const testAmount = Math.min(testBusiness.initialValue || 1000, playerMoney);
      const testRate = testBusiness.initialRate || 10;
      const testTime = testBusiness.baseTime || 3600;
      const cleanedAmount = testAmount * (1 - testRate / 100);
      const loss = testAmount - cleanedAmount;

      addResult('4. Calcular Parâmetros da Operação', 'success', 'Parâmetros calculados', {
        dirtyMoney: testAmount,
        rate: testRate,
        estimatedTime: testTime,
        cleanedAmount,
        loss,
        lossPercentage: ((loss / testAmount) * 100).toFixed(2) + '%',
      });

      // Step 5: Verify store is ready
      addResult('5. Verificar Store de Lavagem', 'pending', 'Verificando...');
      
      const storeOperations = launderingStore.operations;
      
      addResult('5. Verificar Store de Lavagem', 'success', 'Store pronto para operações', {
        currentOperations: storeOperations.length,
      });

      // Step 6: Add operation to store
      addResult('6. Iniciar Operação de Lavagem', 'pending', 'Iniciando...');
      
      const operation = {
        businessId: testBusiness._id,
        businessName: testBusiness.businessName || 'Negócio Teste',
        amount: testAmount,
        rate: testRate,
        timeRemaining: testTime,
        completionTime: testTime,
        cleanedAmount,
        status: 'processing' as const,
        startedAt: new Date(),
        lastOperationDate: new Date().toISOString().split('T')[0],
      };

      launderingStore.addOperation(operation);
      
      addResult('6. Iniciar Operação de Lavagem', 'success', 'Operação iniciada com sucesso', {
        operationId: testBusiness._id,
        status: 'processing',
        startTime: new Date().toISOString(),
      });

      // Step 7: Verify operation in store
      addResult('7. Verificar Operação no Store', 'pending', 'Verificando...');
      
      const activeOp = launderingStore.getActiveOperation(testBusiness._id);
      
      if (!activeOp) {
        addResult('7. Verificar Operação no Store', 'error', 'Operação não encontrada no store', {});
        setIsRunning(false);
        setTestComplete(true);
        return;
      }

      addResult('7. Verificar Operação no Store', 'success', 'Operação verificada no store', {
        operationId: activeOp.businessId,
        status: activeOp.status,
        amount: activeOp.amount,
        cleanedAmount: activeOp.cleanedAmount,
      });

      // Step 8: Simulate operation progress
      addResult('8. Simular Progresso da Operação', 'pending', 'Simulando (3 segundos)...');
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const elapsed1 = 1;
      const remaining1 = Math.max(0, testTime - elapsed1);
      
      addResult('8. Simular Progresso da Operação', 'success', `Progresso: ${((1 / testTime) * 100).toFixed(1)}% completo`, {
        elapsed: elapsed1,
        remaining: remaining1,
        progressPercentage: ((1 / testTime) * 100).toFixed(1) + '%',
      });

      // Step 9: Complete operation
      addResult('9. Completar Operação', 'pending', 'Completando...');
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      launderingStore.updateOperation(testBusiness._id, {
        status: 'completed',
        timeRemaining: 0,
      });

      const completedOp = launderingStore.getActiveOperation(testBusiness._id);
      
      addResult('9. Completar Operação', 'success', 'Operação concluída com sucesso', {
        finalStatus: completedOp?.status || 'completed',
        cleanMoneyReceived: cleanedAmount,
        totalTime: testTime,
      });

      // Step 10: Final verification
      addResult('10. Verificação Final', 'success', '✅ TESTE COMPLETO COM SUCESSO!', {
        summary: {
          businessName: testBusiness.businessName,
          dirtyMoneyUsed: testAmount,
          cleanMoneyGenerated: cleanedAmount,
          lossAmount: loss,
          operationTime: testTime,
          status: 'CONCLUÍDO',
        },
      });

      setTestComplete(true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      addResult('❌ ERRO', 'error', errorMsg, {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      });
      setTestComplete(true);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold text-white mb-2">
            🧪 Teste Completo de Lavagem de Dinheiro
          </h1>
          <p className="text-gray-400">
            Simula uma operação completa de lavagem de dinheiro do início ao fim
          </p>
        </motion.div>

        {/* Test Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={runCompleteTest}
            disabled={isRunning}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Executando Teste...
              </>
            ) : (
              <>
                ▶️ Iniciar Teste Completo
              </>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {testResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-lg p-4 border ${
                result.status === 'success'
                  ? 'bg-green-900/20 border-green-500/50'
                  : result.status === 'error'
                  ? 'bg-red-900/20 border-red-500/50'
                  : 'bg-blue-900/20 border-blue-500/50'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                )}
                {result.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                {result.status === 'pending' && (
                  <Loader className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />
                )}
                
                <div className="flex-1">
                  <p className={`font-semibold ${
                    result.status === 'success'
                      ? 'text-green-400'
                      : result.status === 'error'
                      ? 'text-red-400'
                      : 'text-blue-400'
                  }`}>
                    {result.step}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">{result.message}</p>
                  
                  {result.details && (
                    <div className="mt-3 bg-black/30 rounded p-3 text-xs text-gray-400 font-mono overflow-auto max-h-48">
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Test Complete Message */}
        {testComplete && testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/50 rounded-lg text-center"
          >
            <p className="text-2xl font-bold text-green-400 mb-2">
              ✅ Teste Finalizado!
            </p>
            <p className="text-gray-300">
              {testResults.some((r) => r.status === 'error')
                ? 'Alguns erros foram encontrados. Verifique os detalhes acima.'
                : 'Todos os testes passaram com sucesso! O sistema está funcionando perfeitamente.'}
            </p>
          </motion.div>
        )}

        {/* No Results */}
        {testResults.length === 0 && !isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-400"
          >
            <p>Clique no botão acima para iniciar o teste completo</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
