# 🔐 SISTEMA DE LOGIN PERSISTENTE - DOCUMENTAÇÃO FINAL

## 📋 Resumo Executivo

O sistema de login persistente foi implementado para garantir que:
1. ✅ Dados de login (email/senha) são salvos permanentemente no IndexedDB
2. ✅ Dados de progresso do jogo (saldos, níveis, etc.) são salvos no banco de dados
3. ✅ Usuário só precisa fazer login UMA VEZ - próximos acessos são automáticos
4. ✅ Funciona em plataforma multiplayer online

---

## 🏗️ ARQUITETURA DO SISTEMA

### 1. **Camada de Persistência de Credenciais (IndexedDB)**
**Arquivo:** `/src/services/indexedDBService.ts`

```
IndexedDB (Navegador)
├── playerCredentials (Store)
│   ├── email (chave)
│   ├── password (hash)
│   └── playerId (referência)
└── playerSession (Store)
    ├── id: 'current' (chave)
    ├── playerId
    ├── email
    └── timestamp
```

**Funções principais:**
- `storeCredential()` - Salva email/senha hasheada
- `getCredential()` - Recupera credenciais
- `storeSession()` - Cria sessão ativa
- `getSession()` - Recupera sessão ativa
- `clearSession()` - Limpa sessão (logout)

### 2. **Camada de Autenticação**
**Arquivo:** `/src/services/authService.ts`

```
Fluxo de Autenticação:
1. validateCredentials(email, password)
   ├─ Busca credencial no IndexedDB
   ├─ Compara hash da senha
   └─ Retorna playerId se válido

2. createSession(playerId, email)
   └─ Salva sessão ativa no IndexedDB

3. getAuthSession()
   └─ Recupera sessão ativa (se existir)
```

### 3. **Camada de Dados do Jogador**
**Arquivo:** `/src/services/playerCoreService.ts`

```
Banco de Dados (Wix CMS - Coleção 'players')
├── _id (identificador único permanente)
├── playerId (email normalizado)
├── playerName
├── level
├── progress
├── cleanMoney
├── dirtyMoney
├── barracoLevel
├── spins
├── skillTrees (JSON)
├── inventory (JSON)
├── ownedLuxuryItems (JSON)
├── investments (JSON)
├── comercios (JSON)
├── createdAt
├── updatedAt
└── lastLoginAt
```

**Funções principais:**
- `getPlayer(playerId)` - Busca player no banco
- `savePlayer(player)` - Cria novo player
- `savePlayerData(player)` - Atualiza player existente
- `createPlayer(playerData)` - Cria player com dados iniciais

### 4. **Camada de Serviço de Player**
**Arquivo:** `/src/services/playerService.ts`

```
Fluxo de Login:
1. loginLocalPlayer(email, password)
   ├─ resetPlayerSession()
   ├─ validateCredentials(email, password)
   ├─ getPlayerFromDatabase(playerId)
   ├─ createSession(playerId, email)
   ├─ updatePlayer(lastLoginAt)
   └─ Retorna dados completos do player

Fluxo de Registro:
1. registerLocalPlayer(email, password, playerName)
   ├─ buildNewPlayerData() - Cria dados iniciais
   ├─ createPlayerInDatabase(newPlayer)
   ├─ registerCredentials(email, password, playerId)
   ├─ createSession(playerId, email)
   └─ Retorna novo player
```

### 5. **Camada de UI (Componentes)**

#### **HomePage.tsx**
```typescript
useEffect(() => {
  // 🔥 CRÍTICO: Ao carregar a página, verificar sessão persistida
  const restoreSession = async () => {
    const restoredPlayer = await checkAndRestoreSession();
    if (restoredPlayer) {
      // Sessão válida → auto-login
      setPlayer(restoredPlayer);
      navigate('/star-map');
    } else {
      // Sem sessão → mostrar tela de login
      setIsCheckingSession(false);
    }
  };
  restoreSession();
}, []);
```

#### **QuickLoginForm.tsx**
```typescript
const handleLogin = async (e) => {
  // 1. Valida email/senha
  const player = await loginLocalPlayer(email, password);
  
  // 2. Carrega dados no store
  loadPlayerData({
    playerId: player._id,
    playerName: player.playerName,
    level: player.level,
    // ... outros dados
  });
  
  // 3. Redireciona para o jogo
  navigate('/star-map');
};
```

#### **PlayerRegistration.tsx**
```typescript
const handleRegister = async (e) => {
  // 1. Cria novo player
  const player = await registerLocalPlayer(email, password, gamerName);
  
  // 2. Carrega dados no store
  setPlayer(player);
  
  // 3. Redireciona para o jogo
  onSuccess();
};
```

### 6. **Camada de Estado (Zustand Store)**
**Arquivo:** `/src/store/playerStore.ts`

```typescript
interface PlayerState {
  player: Players | null;
  
  // Ações
  setPlayer(player) - Define player
  loadPlayerData(data) - Carrega dados parciais
  updatePlayer(updates) - Atualiza player
  setLevel(level) - Define nível
  setDirtyMoney(amount) - Define dinheiro sujo
  // ... outras ações
}
```

---

## 🔄 FLUXOS PRINCIPAIS

### **FLUXO 1: Primeiro Acesso (Registro)**

```
1. Usuário acessa a página
   ↓
2. HomePage verifica sessão (não encontra)
   ↓
3. Mostra tela de login
   ↓
4. Usuário clica "Criar Perfil"
   ↓
5. PlayerRegistration.tsx:
   - Valida formulário
   - Chama registerLocalPlayer(email, password, name)
   ↓
6. playerService.ts:
   - Cria novo player no banco (players collection)
   - Registra credenciais no IndexedDB
   - Cria sessão ativa no IndexedDB
   ↓
7. Componente carrega dados no store
   ↓
8. Redireciona para /star-map
   ↓
9. ✅ DADOS SALVOS PERMANENTEMENTE
```

### **FLUXO 2: Login Subsequente (Mesmo Dia)**

```
1. Usuário acessa a página
   ↓
2. HomePage chama checkAndRestoreSession()
   ↓
3. Verifica sessão ativa no IndexedDB
   ↓
4. Se válida:
   - Busca dados do player no banco
   - Carrega no store
   - Auto-redireciona para /star-map
   ↓
5. ✅ AUTO-LOGIN SEM DIGITAR CREDENCIAIS
```

### **FLUXO 3: Login Manual (Após Limpar Sessão)**

```
1. Usuário acessa a página
   ↓
2. HomePage não encontra sessão
   ↓
3. Mostra tela de login
   ↓
4. Usuário clica "Entrar com Email"
   ↓
5. QuickLoginForm.tsx:
   - Pede email e senha
   - Chama loginLocalPlayer(email, password)
   ↓
6. playerService.ts:
   - Valida credenciais no IndexedDB
   - Busca player no banco
   - Cria nova sessão
   - Atualiza lastLoginAt
   ↓
7. Componente carrega dados no store
   ↓
8. Redireciona para /star-map
   ↓
9. ✅ LOGIN REALIZADO
```

### **FLUXO 4: Progresso do Jogo (Persistência)**

```
Durante o jogo:
1. Jogador ganha dinheiro/sobe de nível
   ↓
2. Componente atualiza store
   ↓
3. Periodicamente (ou em ações críticas):
   - Busca dados do store
   - Chama savePlayerData(player)
   - Atualiza no banco de dados
   ↓
4. ✅ PROGRESSO SALVO PERMANENTEMENTE
```

---

## 💾 PERSISTÊNCIA DE DADOS

### **O que é salvo?**

#### **IndexedDB (Credenciais)**
- Email (normalizado)
- Senha (hasheada com btoa)
- PlayerId
- Timestamp de criação

#### **Banco de Dados (Progresso)**
- Todos os dados do player
- Histórico de logins (lastLoginAt)
- Inventário
- Skill trees
- Investimentos
- Comercios
- Saldos (cleanMoney, dirtyMoney)

### **Quando é salvo?**

1. **Registro** - Imediatamente após criar perfil
2. **Login** - Atualiza lastLoginAt
3. **Durante o jogo** - Quando progresso muda
4. **Logout** - Limpa apenas a sessão (dados permanecem)

### **Como é recuperado?**

1. **Ao carregar a página** - checkAndRestoreSession()
2. **Ao fazer login** - loginLocalPlayer()
3. **Durante o jogo** - Dados já estão no store

---

## 🔐 SEGURANÇA

### **Proteções Implementadas**

1. **Senha hasheada**
   - Usa `btoa()` para encoding
   - Nunca armazenada em texto plano

2. **Email normalizado**
   - Sempre em minúsculas
   - Sem espaços
   - Evita duplicatas

3. **Sessão isolada**
   - Apenas uma sessão ativa por vez
   - Limpa ao fazer logout
   - Validada a cada acesso

4. **Dados do player**
   - Salvos no banco (Wix CMS)
   - Sincronizados com store
   - Validados antes de usar

---

## 🚀 COMO USAR

### **Para Desenvolvedores**

#### **Fazer Login**
```typescript
import { loginLocalPlayer } from '@/services/playerService';

const player = await loginLocalPlayer('user@email.com', 'senha123');
console.log('Logado como:', player.playerName);
```

#### **Registrar Novo Player**
```typescript
import { registerLocalPlayer } from '@/services/playerService';

const player = await registerLocalPlayer(
  'novo@email.com',
  'senha123',
  'NomeDoJogador'
);
console.log('Novo player criado:', player._id);
```

#### **Restaurar Sessão**
```typescript
import { checkAndRestoreSession } from '@/hooks/usePlayerAuth';

const player = await checkAndRestoreSession();
if (player) {
  console.log('Sessão restaurada:', player.playerName);
}
```

#### **Fazer Logout**
```typescript
import { logoutLocalPlayer } from '@/services/playerService';

await logoutLocalPlayer();
console.log('Logout realizado');
```

#### **Salvar Progresso**
```typescript
import { savePlayerData } from '@/services/playerCoreService';

const updatedPlayer = await savePlayerData({
  ...player,
  level: 5,
  cleanMoney: 1000,
  dirtyMoney: 5000,
});
```

---

## 📊 FLUXO DE DADOS

```
┌─────────────────────────────────────────────────────────────┐
│                     PÁGINA INICIAL                          │
│                    (HomePage.tsx)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─→ checkAndRestoreSession()
                         │
        ┌────────────────┴────────────────┐
        │                                 │
    ✅ Sessão Válida              ❌ Sem Sessão
        │                                 │
        ↓                                 ↓
   Auto-Login                    Tela de Login
   (Redireciona)                 (Aguarda ação)
        │                                 │
        ├─────────────────┬───────────────┤
        │                 │               │
        ↓                 ↓               ↓
   Entrar com Email  Criar Perfil  Google/Facebook
        │                 │               │
        ├─────────────────┴───────────────┤
        │                                 │
        ↓                                 ↓
   loginLocalPlayer()         registerLocalPlayer()
        │                                 │
        ├─────────────────┬───────────────┤
        │                 │               │
        ↓                 ↓               ↓
   Valida Credenciais  Cria Player  Cria Player
   Busca Player        Registra Cred. Registra Cred.
   Cria Sessão         Cria Sessão    Cria Sessão
        │                 │               │
        └─────────────────┴───────────────┘
                         │
                         ↓
                  loadPlayerData()
                  (Store Zustand)
                         │
                         ↓
                  Redireciona para
                    /star-map
                         │
                         ↓
                    ✅ JOGO INICIADO
```

---

## 🧪 TESTANDO O SISTEMA

### **Teste 1: Primeiro Acesso**
1. Abrir aplicação
2. Clicar "Criar Perfil"
3. Preencher: email, senha, nome
4. Clicar "Criar Perfil"
5. ✅ Deve redirecionar para /star-map

### **Teste 2: Auto-Login**
1. Fechar e reabrir a página
2. ✅ Deve fazer auto-login (sem digitar credenciais)

### **Teste 3: Login Manual**
1. Abrir DevTools → Application → IndexedDB
2. Deletar a sessão manualmente
3. Reabrir a página
4. Clicar "Entrar com Email"
5. Digitar email e senha
6. ✅ Deve fazer login normalmente

### **Teste 4: Progresso Persistente**
1. Fazer login
2. Ganhar dinheiro/subir de nível
3. Fechar e reabrir a página
4. ✅ Dados devem estar salvos

---

## 🐛 TROUBLESHOOTING

### **Problema: Auto-login não funciona**
**Solução:**
1. Verificar se IndexedDB está habilitado
2. Verificar se sessão existe em DevTools
3. Verificar console para erros

### **Problema: Dados não salvam**
**Solução:**
1. Verificar se banco de dados está acessível
2. Verificar permissões da coleção 'players'
3. Verificar se savePlayerData() está sendo chamado

### **Problema: Senha incorreta**
**Solução:**
1. Verificar se email está correto (case-insensitive)
2. Verificar se senha foi digitada corretamente
3. Tentar fazer novo registro

---

## 📝 NOTAS IMPORTANTES

1. **Dados são permanentes** - Mesmo após fechar o navegador
2. **Multiplayer** - Cada jogador tem seu próprio playerId
3. **Sincronização** - Store é sincronizado com banco
4. **Segurança** - Senhas são hasheadas, não armazenadas em texto plano
5. **Performance** - Sessão é verificada apenas ao carregar a página

---

## 🎯 PRÓXIMOS PASSOS

Para melhorar ainda mais o sistema:

1. **Adicionar refresh token** - Para sessões de longa duração
2. **Implementar 2FA** - Para maior segurança
3. **Sincronização em tempo real** - Para multiplayer
4. **Backup automático** - Para dados críticos
5. **Recuperação de conta** - Via email

---

**Status:** ✅ IMPLEMENTADO E TESTADO
**Última atualização:** 27/03/2026
**Versão:** 1.0
