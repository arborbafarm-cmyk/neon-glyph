# FASE 1 — ARQUITETURA DE DADOS UNIFICADA

## Objetivo
Estabelecer uma **única fonte de verdade** para dados do jogador, eliminando duplicação e inconsistência.

## Hierarquia de Dados (Nova)

```
┌─────────────────────────────────────────┐
│  Players Collection (Database)          │  ← FONTE DE VERDADE
│  - Dados persistentes                   │
│  - Sincronização entre sessões          │
└─────────────────────────────────────────┘
                    ↓ (carrega)
┌─────────────────────────────────────────┐
│  playerStore (Zustand)                  │  ← CACHE EM MEMÓRIA
│  - Cópia em tempo real                  │
│  - Rápido acesso                        │
│  - Sincroniza com DB em mudanças        │
└─────────────────────────────────────────┘
                    ↓ (lê)
┌─────────────────────────────────────────┐
│  Componentes React                      │  ← CONSUMIDORES
│  - Leem do playerStore                  │
│  - Escrevem via playerDataService       │
└─────────────────────────────────────────┘
```

## O que Muda

### ❌ REMOVER (Eliminar Completamente)

1. **localStorage para progresso do jogador**
   - ~~localStorage.getItem('currentPlayerId')~~
   - ~~localStorage.setItem('playerMoney', ...)~~
   - ~~localStorage.getItem('investment-skill-tree-store')~~
   - Usar: `playerStore` + `playerDataService`

2. **spinVaultStore (Consolidar em playerStore)**
   - ~~useSpinVaultStore()~~
   - Usar: `playerStore.spins`, `playerStore.addSpins()`

3. **Estados locais duplicados em páginas**
   - ~~useState para money, level, progress~~
   - Usar: `playerStore` diretamente

### ✅ MANTER (Com Novo Propósito)

1. **IndexedDB** - APENAS para:
   - Credenciais de login (email/senha hasheada)
   - Sessão atual (playerId, email)
   - NÃO para progresso do jogador

2. **playerStore** - Agora é:
   - Cache único em memória
   - Sincroniza automaticamente com DB
   - Fonte de verdade local durante a sessão

3. **playerDataService** - Novo padrão:
   - Todas as mudanças passam por aqui
   - Otimistic updates (UI atualiza, depois sincroniza)
   - Revert automático em erro

## Fluxo de Dados (Novo)

### Leitura
```
Componente → playerStore.getState() → Valor atual em memória
```

### Escrita
```
Componente → playerDataService.updatePlayerMoney()
           → playerStore.setDirtyMoney() [imediato]
           → BaseCrudService.update() [async]
           → Revert em erro
```

## Campos Consolidados

### Players Collection (Fonte de Verdade)
```typescript
{
  _id: string;                    // ID único
  playerName: string;             // Nome do jogador
  level: number;                  // Nível atual
  progress: number;               // Progresso (0-100)
  cleanMoney: number;             // Dinheiro legítimo
  dirtyMoney: number;             // Dinheiro ilegal (playerMoney)
  barracoLevel: number;           // Nível do barraco
  isGuest: boolean;               // É guest?
  profilePicture: string | null;  // URL da foto
  lastUpdated: Date;              // Última sincronização
}
```

### playerStore (Cache)
Espelha exatamente os campos acima + campos de sessão:
```typescript
{
  // Espelha Players collection
  playerId: string | null;
  playerName: string;
  level: number;
  progress: number;
  cleanMoney: number;
  dirtyMoney: number;
  barracoLevel: number;
  isGuest: boolean;
  profilePicture: string | null;
  
  // Campos de sessão (não persistem)
  spins: number;                  // Spins do Spin Vault
  multiplier: number;
  hasInitialized: boolean;
  isSpinning: boolean;
  lastResult: string[] | null;
  players: Record<string, Players>;
}
```

## Padrão de Uso

### ❌ ERRADO (Antigo)
```typescript
// Múltiplas fontes de verdade
const money = localStorage.getItem('playerMoney');
const spins = useSpinVaultStore(s => s.spins);
const [level, setLevel] = useState(10);
```

### ✅ CORRETO (Novo)
```typescript
// Uma única fonte de verdade
import { usePlayerStore } from '@/store/playerStore';
import { updatePlayerMoney } from '@/services/playerDataService';

const money = usePlayerStore(s => s.dirtyMoney);
const spins = usePlayerStore(s => s.spins);
const level = usePlayerStore(s => s.level);

// Para atualizar
await updatePlayerMoney(playerId, newMoney);
// playerStore atualiza automaticamente
```

## Checklist de Migração

- [ ] **Phase 1a**: Consolidar spinVaultStore em playerStore
- [ ] **Phase 1b**: Remover localStorage para progresso do jogador
- [ ] **Phase 1c**: Atualizar componentes para usar playerStore
- [ ] **Phase 1d**: Validar sincronização com DB
- [ ] **Phase 2**: Implementar sincronização periódica
- [ ] **Phase 3**: Testes de consistência de dados

## Benefícios

✅ Uma única fonte de verdade  
✅ Sem duplicação de dados  
✅ Sincronização automática  
✅ Melhor performance (menos re-renders)  
✅ Mais fácil debugar  
✅ Preparado para multiplayer  
