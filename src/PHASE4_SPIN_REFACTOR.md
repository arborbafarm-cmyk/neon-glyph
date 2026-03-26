# PHASE 4 — UNIFICAR OS GIROS (Spin System Refactor)

## Objetivo
Centralizar o sistema de giros com o banco de dados como **única fonte de verdade**.

## Problema Anterior
- `spinVaultStore` era a fonte principal de spins
- Operações de giro dependiam apenas do estado local
- Sem persistência automática no banco
- Risco de perda de dados e inconsistências

## Solução Implementada

### 1. **Spins agora são campo do jogador no banco**
```typescript
// players collection
{
  _id: string;
  spins: number; // ← NOVA FONTE DE VERDADE
  dirtyMoney: number;
  cleanMoney: number;
  // ... outros campos
}
```

### 2. **spinVaultStore → Visual Effects Only**
- Mantém o store para efeitos visuais temporários
- Não é mais a fonte de verdade
- Sincroniza com o banco de dados

### 3. **Novo Serviço: spinEconomyService**
Centraliza toda operação de giro com fluxo garantido:

```typescript
// Fluxo completo de uma rotação:
1. Verificar spins no banco
2. Descontar spins
3. Calcular resultado
4. Aplicar prêmio
5. Salvar saldo atualizado
6. Salvar spins atualizados
7. Sincronizar store
```

#### Funções Principais:
- `verifySpinsInDatabase()` - Verifica spins no banco
- `getSpinsFromDatabase()` - Obtém spins atuais
- `deductSpinsFromDatabase()` - Desconta spins e salva
- `addSpinsToDatabase()` - Adiciona spins (ganho passivo)
- `applySpinResult()` - Aplica resultado (dinheiro/multiplicador)
- `executeSpinOperation()` - Executa operação completa
- `syncSpinsFromDatabase()` - Sincroniza store com banco

### 4. **SlotMachine.tsx Refatorado**
```typescript
// ANTES: Dependia de spinVaultStore
const { spins, deductSpins } = useSpinVaultStore();
if (!deductSpins(selectedMultiplier)) return; // ❌ Local only

// DEPOIS: Usa spinEconomyService
const spinResult = await executeSpinOperation(
  playerId,
  selectedMultiplier,
  moneyGain,
  multiplierGain,
  moneyLoss
);
if (!spinResult.success) {
  // ✅ Banco é a fonte de verdade
}
```

### 5. **useSpinVault Hook Refatorado**
```typescript
// Ganho passivo agora salva no banco
const interval = setInterval(async () => {
  const gainAmount = Math.max(1, barracoLevel);
  
  // PHASE 4: Salva no banco imediatamente
  const result = await addSpinsToDatabase(playerId, gainAmount);
  
  if (result.success) {
    updateLastGainTime();
    setShowNotification(true);
  }
}, 60000);
```

### 6. **Inicialização de Novos Jogadores**
```typescript
// registerLocalPlayer() e registerPlayer()
const newPlayer: Players = {
  // ...
  spins: 0, // ← Inicializa spins no banco
};
```

### 7. **Sincronização ao Carregar Jogador**
```typescript
// BarracoPage.tsx
if (currentPlayerId) {
  await syncSpinsFromDatabase(currentPlayerId);
}
```

## Fluxo de Operação Completo

### Rotação da Máquina de Slots
```
1. Jogador clica "GIRAR"
   ↓
2. SpinButton verifica spins locais (UI)
   ↓
3. Dispara evento 'spinSlots' com playerId
   ↓
4. SlotsDisplay recebe evento
   ↓
5. executeSpinOperation() é chamado:
   a. Verifica spins no BANCO
   b. Desconta spins do BANCO
   c. Calcula resultado
   d. Aplica prêmio no BANCO
   e. Sincroniza store com banco
   ↓
6. UI atualiza com resultado
   ↓
7. Banco é a fonte de verdade ✅
```

### Ganho Passivo (Barraco)
```
1. useSpinVault hook inicia
   ↓
2. A cada 60 segundos:
   a. Calcula ganho (barracoLevel)
   b. Chama addSpinsToDatabase()
   c. Salva no BANCO
   d. Sincroniza store
   ↓
3. Banco é a fonte de verdade ✅
```

## Benefícios

✅ **Banco como única fonte de verdade**
- Sem inconsistências entre store e banco
- Dados persistem automaticamente

✅ **Operações atômicas**
- Cada giro é uma transação completa
- Tudo salva ou nada salva

✅ **Sem perda de dados**
- Ganho passivo salva no banco
- Rotações salvam resultado imediatamente

✅ **Sincronização garantida**
- Store sempre reflete estado do banco
- Sem desvios

✅ **Escalabilidade**
- Pronto para multiplayer
- Cada jogador tem spins independentes no banco

## Arquivos Modificados

### Novos Arquivos
- `/src/services/spinEconomyService.ts` - Serviço centralizado de giros

### Modificados
- `/src/components/SlotMachine.tsx` - Usa spinEconomyService
- `/src/hooks/useSpinVault.ts` - Salva ganho passivo no banco
- `/src/components/pages/BarracoPage.tsx` - Sincroniza spins ao carregar
- `/src/services/playerService.ts` - Inicializa spins = 0
- `/src/services/sessionResetService.ts` - Comentários sobre PHASE 4

### Mantidos (Visual Effects Only)
- `/src/store/spinVaultStore.ts` - Ainda existe para efeitos visuais
- `/src/store/playerStore.ts` - Sincroniza com banco

## Próximos Passos (Futuro)

1. **Validação de Integridade**
   - Auditoria de todas as operações de giro
   - Logs de transações

2. **Otimização de Performance**
   - Cache de spins com invalidação
   - Batch updates para múltiplos giros

3. **Análise de Dados**
   - Estatísticas de giros por jogador
   - Taxa de ganho/perda

4. **Segurança**
   - Validação de spins no servidor
   - Proteção contra manipulação

## Testes Recomendados

```typescript
// 1. Verificar spins iniciais
const player = await getPlayerById(playerId);
expect(player.spins).toBe(0);

// 2. Testar ganho passivo
await addSpinsToDatabase(playerId, 5);
const updated = await getPlayerById(playerId);
expect(updated.spins).toBe(5);

// 3. Testar rotação completa
const result = await executeSpinOperation(
  playerId,
  1, // spins to deduct
  1000, // money gain
  0, // multiplier gain
  0 // money loss
);
expect(result.success).toBe(true);
expect(result.spinsRemaining).toBe(4);

// 4. Testar falha por spins insuficientes
const result = await executeSpinOperation(
  playerId,
  100, // mais que disponível
  0, 0, 0
);
expect(result.success).toBe(false);
expect(result.error).toContain('insuficientes');
```

## Status

✅ **IMPLEMENTADO**
- Serviço spinEconomyService criado
- SlotMachine refatorado
- useSpinVault refatorado
- Inicialização de novos jogadores
- Sincronização ao carregar

🔄 **EM PROGRESSO**
- Testes de integração
- Validação de edge cases

⏳ **FUTURO**
- Auditoria de transações
- Otimização de performance
- Análise de dados
