# Sistema de Login Google Nativo - Guia de Configuração

## 📋 Visão Geral

Este documento descreve como o sistema de login Google foi implementado para o jogo multiplayer no Wix, utilizando apenas os recursos nativos do Wix (Wix Members) sem ferramentas externas como Firebase.

## 🔧 Componentes Implementados

### 1. **Serviço de Jogadores** (`/src/services/playerService.ts`)
- Gerencia dados de jogadores online
- Funções principais:
  - `registerPlayer()` - Registra ou atualiza um jogador quando faz login
  - `setPlayerOffline()` - Marca um jogador como offline
  - `getOnlinePlayers()` - Retorna lista de jogadores online
  - `getAllPlayers()` - Retorna todos os jogadores
  - `deletePlayer()` - Remove um jogador

### 2. **Botão de Login Google** (`/src/components/GoogleLoginButton.tsx`)
- Componente personalizado para login
- Integra com Wix Members para autenticação via Google
- Redireciona automaticamente para página do jogo após login bem-sucedido
- Registra o jogador na coleção `PlayersLogados`

### 3. **Página de Login** (`/src/components/pages/LoginPage.tsx`)
- Interface de login atraente
- Mostra benefícios do jogo
- Redireciona automaticamente se já estiver logado
- Botão de login com Google personalizado

### 4. **Página de Perfil** (`/src/components/pages/ProfilePage.tsx`)
- Exibe informações do jogador
- Mostra status da conta
- Opção para fazer logout
- Protegida por `MemberProtectedRoute`

### 5. **Lista de Jogadores Online** (`/src/components/OnlinePlayersList.tsx`)
- Exibe jogadores online em tempo real
- Atualiza a cada 10 segundos
- Mostra nickname e nome do jogador
- Integrada na página do jogo

### 6. **Coleção CMS** (`playerslogados`)
Campos:
- `memberId` - ID único do membro Wix
- `playerName` - Nome completo do jogador
- `nickname` - Apelido do jogador
- `lastSeen` - Última vez que foi visto online
- `isOnline` - Status online/offline

## 🚀 Fluxo de Funcionamento

### Login
1. Usuário clica em "Login com Google" na página `/login`
2. Wix Members redireciona para autenticação Google
3. Após autenticação bem-sucedida, usuário é redirecionado para `/game`
4. `GoogleLoginButton` registra o jogador na coleção `PlayersLogados`
5. Jogador aparece na lista de "Jogadores Online"

### Durante o Jogo
1. `GamePage` monitora o status de autenticação
2. Mantém o jogador marcado como online
3. `OnlinePlayersList` mostra todos os jogadores online
4. Lista atualiza a cada 10 segundos

### Logout
1. Usuário clica no botão de logout (ícone 🚪 no header)
2. Jogador é marcado como offline na coleção
3. Usuário é redirecionado para `/login`

## 📱 Rotas Disponíveis

- `/` - Página inicial
- `/login` - Página de login com Google
- `/game` - Página do jogo (requer autenticação)
- `/profile` - Perfil do jogador (requer autenticação)
- `/giro-no-asfalto` - Página de negócios
- `/luxury-showroom` - Loja de luxo
- `/casa` - Casa do jogador
- `/barraco` - Barracão

## 🔐 Segurança

- Autenticação gerenciada pelo Wix Members (OAuth Google)
- Dados de jogadores armazenados na coleção CMS do Wix
- Permissões configuradas para ANYONE (leitura/escrita)
- Tokens de sessão gerenciados automaticamente pelo Wix

## 📊 Dados do Jogador

Quando um jogador faz login, os seguintes dados são capturados:
```typescript
{
  memberId: "email@gmail.com",           // ID único do Wix
  playerName: "João Silva",              // Nome do perfil Google
  nickname: "JoãoGamer",                 // Apelido customizado
  lastSeen: "2026-03-13T10:30:00Z",     // Timestamp
  isOnline: true                         // Status
}
```

## 🎮 Integração com o Jogo

### Acessar dados do jogador logado
```typescript
import { useMember } from '@/integrations';

const { member, isAuthenticated } = useMember();

if (isAuthenticated && member) {
  console.log(member.loginEmail);           // Email do jogador
  console.log(member.contact?.firstName);   // Nome
  console.log(member.profile?.nickname);    // Apelido
}
```

### Registrar jogador online
```typescript
import { playerService } from '@/services/playerService';

await playerService.registerPlayer(
  memberId,
  playerName,
  nickname
);
```

### Obter jogadores online
```typescript
const onlinePlayers = await playerService.getOnlinePlayers();
```

## 🔄 Próximos Passos (Opcional)

Para expandir o sistema, você pode:

1. **Adicionar Estatísticas**
   - Adicionar campos como `level`, `experience`, `wins` na coleção

2. **Sistema de Amigos**
   - Criar coleção de amizades
   - Implementar convites

3. **Chat Multiplayer**
   - Integrar sistema de mensagens em tempo real
   - Usar WebSockets para comunicação

4. **Ranking Global**
   - Criar página de ranking
   - Ordenar por pontuação

5. **Notificações**
   - Notificar quando amigos entram online
   - Alertas de eventos do jogo

## 📝 Notas Importantes

- O Wix Members gerencia toda a autenticação
- A coleção `PlayersLogados` é sincronizada automaticamente
- Não há necessidade de backend externo
- Todos os dados são armazenados no Wix CMS
- O sistema é escalável para múltiplos jogadores

## 🆘 Troubleshooting

### Jogador não aparece na lista online
- Verifique se o `memberId` está sendo salvo corretamente
- Confirme que a coleção `PlayersLogados` tem permissões ANYONE

### Login não funciona
- Verifique se o Google OAuth está configurado no Wix
- Confirme que as rotas estão corretas no Router.tsx

### Dados não sincronizam
- Verifique a conexão com a internet
- Confirme que o `BaseCrudService` está importado corretamente

---

**Desenvolvido com ❤️ para o Wix Vibe**
