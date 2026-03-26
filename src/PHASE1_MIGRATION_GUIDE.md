# PHASE 1 — GUIA DE MIGRAÇÃO

## ✅ Mudanças Implementadas

### 1. **playerStore Consolidado**
- ✅ Adicionado `lastGainTime` ao playerStore
- ✅ Adicionado métodos Spin Vault: `setLastGainTime()`, `updateLastGainTime()`, `getTimeUntilNextGain()`
- ✅ playerStore agora é a única fonte de verdade para dados do jogador

### 2. **authService Refatorado**
- ✅ Removido localStorage para playerId
- ✅ Agora usa IndexedDB para sessão via `storeSession()` e `getSession()`
- ✅ Login carrega dados do banco automaticamente
- ✅ Logout limpa sessão e reseta store

### 3. **useSpinVault Hook Consolidado**
- ✅ Removido `useSpinVaultStore`
- ✅ Agora lê/escreve direto do playerStore
- ✅ Mantém mesma interface pública

### 4. **playerDataService Pronto**
- ✅ Já implementado com padrão correto
- ✅ Otimistic updates (UI atualiza, depois sincroniza)
- ✅ Revert automático em erro

---

## 🔄 Próximas Etapas (Fase 1b-1d)

### Fase 1b: Remover localStorage para progresso

**Arquivos a atualizar:**

1. `/src/components/pages/LuxuryShowroomPage.tsx`
   - ❌ `localStorage.getItem('currentPlayerId')`
   - ✅ Usar `usePlayerStore(s => s.playerId)`
   - ❌ `localStorage.setItem('currentPlayerId', ...)`
   - ✅ Usar `playerStore.setPlayerId()`

2. `/src/components/pages/BarracoPage.tsx`
   - ❌ `localStorage.getItem('currentPlayerId')`
   - ✅ Usar `usePlayerStore(s => s.playerId)`

3. `/src/components/pages/ResetAllPage.tsx`
   - ❌ `localStorage.getItem('currentPlayerId')`
   - ✅ Usar `usePlayerStore(s => s.playerId)`

4. `/src/components/pages/ResetInvestmentPage.tsx`
   - ❌ `localStorage.removeItem('investment-skill-tree-store')`
   - ✅ Usar `playerStore.resetPlayer()` ou limpar store específico

5. `/src/components/pages/ResetLuxuryPage.tsx`
   - ❌ `localStorage.removeItem('luxury-shop-store')`
   - ✅ Usar store específico ou playerStore

### Fase 1c: Atualizar componentes

**Padrão antigo (ERRADO):**
```typescript
const [money, setMoney] = useState(0);
const spinVault = useSpinVault();
const spins = spinVault.spins;

// Atualizar
setMoney(newMoney);
localStorage.setItem('money', newMoney);
```

**Padrão novo (CORRETO):**
```typescript
import { usePlayerStore } from '@/store/playerStore';
import { updatePlayerMoney } from '@/services/playerDataService';

const money = usePlayerStore(s => s.dirtyMoney);
const spins = usePlayerStore(s => s.spins);

// Atualizar
await updatePlayerMoney(playerId, newMoney);
// playerStore atualiza automaticamente
```

### Fase 1d: Validar sincronização

- [ ] Testar login/logout
- [ ] Testar persistência de dados entre sessões
- [ ] Testar sincronização com banco
- [ ] Testar revert em erro

---

## 📋 Checklist de Componentes

### Componentes que usam localStorage (REMOVER):

- [ ] `/src/components/pages/LuxuryShowroomPage.tsx` - currentPlayerId
- [ ] `/src/components/pages/BarracoPage.tsx` - currentPlayerId
- [ ] `/src/components/pages/ResetAllPage.tsx` - currentPlayerId
- [ ] `/src/components/pages/ResetInvestmentPage.tsx` - investment-skill-tree-store
- [ ] `/src/components/pages/ResetLuxuryPage.tsx` - luxury-shop-store, gameStore
- [ ] `/src/components/PositioningCanvas.tsx` - positioning-canvas-elements
- [ ] `/src/components/DraggableContainer.tsx` - container-pos-*
- [ ] `/src/store/dragCustomizationStore.ts` - drag-positions
- [ ] `/src/hooks/useDraggableContainers.ts` - container-pos-*
- [ ] `/src/components/CharacterDialog.tsx` - custom names

### Componentes que usam spinVaultStore (CONSOLIDAR):

- [ ] `/src/components/SlotMachine.tsx` - useSpinVaultStore
- [ ] `/src/components/pages/GiroNoAsfaltoPage.tsx` - useSpinVault
- [ ] `/src/components/pages/BarracoPage.tsx` - useSpinVaultStore

---

## 🎯 Benefícios da Consolidação

✅ **Uma única fonte de verdade** - Todos os dados em playerStore  
✅ **Sem duplicação** - Não há mais spinVaultStore separado  
✅ **Sincronização automática** - playerDataService cuida disso  
✅ **Melhor performance** - Menos re-renders  
✅ **Mais fácil debugar** - Dados centralizados  
✅ **Preparado para multiplayer** - Estrutura pronta  

---

## 📝 Notas Importantes

1. **localStorage** agora é APENAS para UI state (posições, customizações)
   - NÃO para progresso do jogador
   - NÃO para money/spins/level

2. **IndexedDB** é APENAS para:
   - Credenciais (email/senha)
   - Sessão atual (playerId, email)

3. **playerStore** é a ÚNICA fonte de verdade para:
   - Dados do jogador
   - Progresso
   - Money (clean + dirty)
   - Spins
   - Level/Progress

4. **playerDataService** é o ÚNICO jeito de atualizar dados:
   - Todas as mudanças passam por aqui
   - Otimistic updates
   - Sincronização com DB

---

## 🚀 Próximas Fases

- **Fase 2**: Sincronização periódica (auto-save)
- **Fase 3**: Validação de consistência
- **Fase 4**: Multiplayer sync
