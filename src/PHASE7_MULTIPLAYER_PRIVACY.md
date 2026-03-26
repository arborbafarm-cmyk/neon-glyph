# FASE 7 — PREPARAR PARA MULTIPLAYER

## 1. Estrutura de Dados Privados vs Públicos

### Dados PRIVADOS (Nunca compartilhados com outros jogadores)
- **email** - Informação sensível de conta
- **senha** - Nunca deve ser transmitida
- **inventário completo** - Detalhes de itens privados
- **saldo detalhado** - Valores exatos de dinheiro limpo e sujo
- **cooldowns internos** - Timers de ações
- **histórico financeiro completo** - Transações detalhadas
- **dados de skill trees internos** - Pontos não alocados
- **coordenadas exatas internas** - Posição precisa antes de sincronização

### Dados PÚBLICOS (Compartilhados no mapa multiplayer)
- **nome** - Nome do jogador
- **foto/profilePicture** - Avatar do jogador
- **nível** - Level atual
- **facção** - Facção do jogador
- **visual do barraco** - Aparência da casa
- **posição no mapa** - Localização aproximada
- **status online** - Se está online
- **poder** - Nível de poder/força
- **ranking** - Posição no ranking
- **status** - Status atual (ativo, ocioso, em combate)
- **complexo** - Qual complexo está visitando

---

## 2. Coleção PlayerPresence

A coleção `playerpresence` foi criada para rastrear a presença de jogadores online.

### Campos da Coleção:
```typescript
interface PlayerPresence {
  _id: string;
  playerId: string;              // ID único do jogador
  mapPosition: string;           // JSON serializado: { x, y, complexo }
  lastSeenAt: Date;              // Timestamp da última atividade
  status: string;                // 'active', 'idle', 'in_combat', 'offline'
  complexStatus: string;         // Status detalhado do complexo
  isOnline: boolean;             // Flag de online
  _createdDate: Date;            // Sistema
  _updatedDate: Date;            // Sistema
}
```

### Exemplo de mapPosition (JSON serializado):
```json
{
  "x": 150,
  "y": 200,
  "complexo": "centro-comercial",
  "area": "entrada"
}
```

---

## 3. Fluxo de Sincronização de Presença

### Quando um jogador entra no mapa:
1. Criar/atualizar registro em `playerpresence`
2. Carregar todos os outros jogadores online
3. Renderizar avatares dos outros jogadores

### Quando um jogador se move:
1. Atualizar `mapPosition` em `playerpresence`
2. Broadcast para clientes próximos
3. Atualizar `lastSeenAt`

### Quando um jogador sai:
1. Definir `isOnline = false`
2. Manter histórico por 5 minutos
3. Depois remover ou arquivar

---

## 4. Segurança de Dados

### No Frontend:
- Nunca enviar dados privados para o mapa
- Filtrar dados antes de enviar para `playerpresence`
- Validar dados recebidos de outros jogadores

### No Backend (API):
- Validar que o jogador só pode atualizar seus próprios dados
- Nunca retornar dados privados em queries de presença
- Usar permissões de coleção para proteger dados

### Exemplo de Validação:
```typescript
// ❌ ERRADO - Enviando dados privados
await BaseCrudService.create('playerpresence', {
  playerId: player._id,
  email: player.email,           // ❌ PRIVADO
  cleanMoney: player.cleanMoney, // ❌ PRIVADO
  mapPosition: JSON.stringify(pos),
  isOnline: true
});

// ✅ CORRETO - Apenas dados públicos
await BaseCrudService.create('playerpresence', {
  playerId: player._id,
  mapPosition: JSON.stringify(pos),
  status: 'active',
  complexStatus: 'in_centro_comercial',
  isOnline: true
});
```

---

## 5. Implementação de Presença Online

### Passo 1: Criar serviço de presença
```typescript
// src/services/playerPresenceService.ts
import { BaseCrudService } from '@/integrations';
import { PlayerPresence } from '@/entities';

export async function updatePlayerPresence(
  playerId: string,
  position: { x: number; y: number; complexo: string },
  status: string = 'active'
) {
  const presenceData = {
    playerId,
    mapPosition: JSON.stringify(position),
    status,
    lastSeenAt: new Date(),
    isOnline: true,
    _id: crypto.randomUUID()
  };
  
  return BaseCrudService.create('playerpresence', presenceData);
}

export async function getOnlinePlayersNearby(
  position: { x: number; y: number },
  radius: number = 500
) {
  const { items } = await BaseCrudService.getAll<PlayerPresence>('playerpresence');
  
  return items.filter(player => {
    if (!player.isOnline) return false;
    
    const pos = JSON.parse(player.mapPosition || '{}');
    const distance = Math.sqrt(
      Math.pow(pos.x - position.x, 2) + 
      Math.pow(pos.y - position.y, 2)
    );
    
    return distance <= radius;
  });
}

export async function setPlayerOffline(playerId: string) {
  // Encontrar presença do jogador
  const { items } = await BaseCrudService.getAll<PlayerPresence>('playerpresence');
  const presence = items.find(p => p.playerId === playerId);
  
  if (presence) {
    await BaseCrudService.update('playerpresence', {
      _id: presence._id,
      isOnline: false,
      status: 'offline'
    });
  }
}
```

### Passo 2: Integrar com o mapa
```typescript
// Em GameMapScreen.tsx ou similar
import { updatePlayerPresence, getOnlinePlayersNearby } from '@/services/playerPresenceService';

function GameMapScreen() {
  const playerPosition = { x: 100, y: 150, complexo: 'centro-comercial' };
  
  // Atualizar presença quando jogador se move
  useEffect(() => {
    updatePlayerPresence(playerId, playerPosition, 'active');
  }, [playerPosition]);
  
  // Carregar jogadores próximos
  useEffect(() => {
    const loadNearbyPlayers = async () => {
      const nearby = await getOnlinePlayersNearby(playerPosition);
      setVisiblePlayers(nearby);
    };
    
    const interval = setInterval(loadNearbyPlayers, 2000); // Atualizar a cada 2s
    return () => clearInterval(interval);
  }, [playerPosition]);
  
  return (
    <div>
      {/* Renderizar jogadores próximos */}
      {visiblePlayers.map(player => (
        <PlayerAvatar key={player._id} player={player} />
      ))}
    </div>
  );
}
```

---

## 6. Checklist de Implementação

- [ ] Coleção `playerpresence` criada ✅
- [ ] Tipos TypeScript atualizados
- [ ] Serviço `playerPresenceService.ts` criado
- [ ] Integração com GameMapScreen
- [ ] Sincronização de posição em tempo real
- [ ] Limpeza de jogadores offline
- [ ] Validação de dados privados vs públicos
- [ ] Testes de segurança
- [ ] Documentação de API

---

## 7. Próximos Passos (FASE 8)

- Implementar sincronização em tempo real com WebSockets
- Criar sistema de chat multiplayer
- Implementar PvP e combate
- Adicionar sistema de guild/facção
- Criar ranking global
