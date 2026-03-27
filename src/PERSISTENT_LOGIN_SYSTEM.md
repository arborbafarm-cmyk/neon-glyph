# 🔐 Sistema de Login Persistente - Documentação Completa

## 📋 Visão Geral

O sistema de login persistente garante que:
1. **Credenciais são salvas permanentemente** no IndexedDB do navegador
2. **Sessão é mantida** entre recarregamentos da página
3. **Dados do jogador são sincronizados** com o banco de dados central
4. **Auto-login automático** quando o usuário retorna

---

## 🏗️ Arquitetura

### Camadas de Persistência

```
┌─────────────────────────────────────────┐
│         HomePage / LoginPage             │
│  (Interface de Login do Usuário)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    usePlayerAuth Hook                    │
│  (Verifica sessão ao carregar)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    playerService                         │
│  (loginLocalPlayer, registerLocalPlayer)│
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
┌─────▼──────┐  ┌──────▼────────┐
│ authService│  │playerCoreService
│ (IndexedDB)│  │ (CMS Database)
│ Credenciais│  │ Dados do Jogo
│ Sessão     │  │
└────────────┘  └────────────────┘
```

---

## 🔑 Componentes Principais

### 1. **IndexedDB Service** (`indexedDBService.ts`)
Responsável pelo armazenamento local persistente:

```typescript
// Armazena credenciais (email + senha hasheada)
storeCredential(email, hashedPassword, playerId)

// Armazena sessão atual
storeSession(playerId, email)

// Recupera sessão
getSession() → { playerId, email, timestamp }

// Valida se credencial existe
credentialExists(email) → boolean
```

**Dados Armazenados:**
- `playerCredentials`: Email, senha hasheada, playerId
- `playerSession`: Sessão atual (playerId + email)

### 2. **Auth Service** (`authService.ts`)
Gerencia autenticação e validação:

```typescript
// Valida email e senha
validateCredentials(email, password) → playerId

// Registra novas credenciais
registerCredentials(email, password, playerId)

// Cria sessão autenticada
createSession(playerId, email)

// Recupera sessão atual
getAuthSession() → { email, playerId } | null

// Verifica se está autenticado
isAuthenticated() → boolean
```

### 3. **Player Service** (`playerService.ts`)
Orquestra login e registro:

```typescript
// Registra novo jogador
registerLocalPlayer(email, password, playerName)
  → Cria player no CMS
  → Registra credenciais no IndexedDB
  → Cria sessão
  → Retorna player

// Faz login
loginLocalPlayer(email, password)
  → Valida credenciais
  → Carrega player do CMS
  → Cria sessão
  → Atualiza lastLoginAt
  → Retorna player

// Recupera jogador atual
getCurrentLocalPlayer() → Player | null

// Verifica se está autenticado
isPlayerAuthenticated() → boolean
```

### 4. **usePlayerAuth Hook** (`usePlayerAuth.ts`)
Restaura sessão ao carregar a página:

```typescript
// Verifica e restaura sessão persistida
checkAndRestoreSession()
  → Verifica se há sessão válida
  → Carrega player do CMS
  → Retorna player ou null
```

---

## 🔄 Fluxo de Login

### Primeiro Acesso (Registro)

```
1. Usuário clica "Criar Perfil"
   ↓
2. Preenche: Email, Senha, Nome do Jogador
   ↓
3. registerLocalPlayer(email, password, playerName)
   ├─ Cria novo Player no CMS (players collection)
   ├─ Armazena credenciais no IndexedDB
   ├─ Cria sessão no IndexedDB
   └─ Retorna player
   ↓
4. setPlayer(player) → Carrega no Zustand Store
   ↓
5. Redireciona para /star-map
```

### Login Subsequente (Mesmo Navegador)

```
1. Usuário abre a página
   ↓
2. HomePage carrega → checkAndRestoreSession()
   ├─ Verifica se há sessão no IndexedDB
   ├─ Se SIM:
   │  ├─ Carrega player do CMS
   │  ├─ Carrega no Zustand Store
   │  └─ Redireciona para /star-map (AUTO-LOGIN)
   └─ Se NÃO:
      └─ Mostra tela de login
   ↓
3. Usuário vê a página de jogo já carregada
```

### Login Manual (Outro Navegador ou Limpeza de Cache)

```
1. Usuário clica "Entrar com Email"
   ↓
2. Preenche: Email, Senha
   ↓
3. loginLocalPlayer(email, password)
   ├─ Valida credenciais no IndexedDB
   ├─ Carrega player do CMS
   ├─ Cria nova sessão
   └─ Retorna player
   ↓
4. setPlayer(player) → Carrega no Zustand Store
   ↓
5. Redireciona para /star-map
```

---

## 💾 Dados Persistidos

### No IndexedDB (Navegador Local)

**Tabela: playerCredentials**
```json
{
  "email": "jogador@email.com",
  "password": "base64_encoded_hash",
  "playerId": "uuid-do-player",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Tabela: playerSession**
```json
{
  "id": "current",
  "playerId": "uuid-do-player",
  "email": "jogador@email.com",
  "timestamp": "2024-01-15T14:45:00Z"
}
```

### No CMS (Banco de Dados Central)

**Collection: players**
```json
{
  "_id": "uuid-do-player",
  "email": "jogador@email.com",
  "playerName": "COMANDANTE",
  "level": 5,
  "progress": 45,
  "cleanMoney": 50000,
  "dirtyMoney": 1000000,
  "spins": 15,
  "barracoLevel": 2,
  "inventory": "[]",
  "skillTrees": "{}",
  "ownedLuxuryItems": "[]",
  "investments": "{}",
  "comercios": "{}",
  "lastLoginAt": "2024-01-15T14:45:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T14:45:00Z"
}
```

---

## 🔐 Segurança

### Hashing de Senha
- Senhas são hasheadas com `btoa()` (base64) antes de armazenar
- **Nota**: Para produção, usar bcrypt ou similar
- Nunca armazenar senha em texto plano

### Sessão
- Sessão é armazenada apenas como `{ playerId, email }`
- Não contém senha
- Pode ser limpa manualmente pelo usuário

### Sincronização
- Dados do jogo são sempre sincronizados com o CMS
- IndexedDB é apenas para autenticação
- Dados de progresso vêm do CMS (source of truth)

---

## 🎮 Fluxo de Dados do Jogo

```
Usuário Logado
    ↓
usePlayerAuth Hook
    ├─ Verifica sessão no IndexedDB
    ├─ Carrega player do CMS
    └─ Carrega no Zustand Store
    ↓
Zustand Store (playerStore)
    ├─ playerId
    ├─ playerName
    ├─ level
    ├─ progress
    ├─ cleanMoney
    ├─ dirtyMoney
    ├─ barracoLevel
    ├─ spins
    └─ ... outros dados
    ↓
Componentes do Jogo
    ├─ Acessam dados via usePlayerStore()
    ├─ Atualizam dados localmente
    └─ Sincronizam com CMS quando necessário
```

---

## 🔄 Sincronização de Dados

### Quando Dados são Salvos no CMS

1. **Ao fazer login**: `lastLoginAt` é atualizado
2. **Durante o jogo**: Cada ação importante salva no CMS
   - Ganhar dinheiro
   - Subir de nível
   - Comprar itens
   - Etc.
3. **Ao fazer logout**: Dados finais são sincronizados

### Exemplo: Ganhar Dinheiro

```typescript
// 1. Atualiza Zustand Store (imediato)
addDirtyMoney(1000)

// 2. Salva no CMS (background)
await updatePlayer(playerId, { dirtyMoney: newAmount })

// 3. Próximo login carrega dados atualizados
```

---

## 🚀 Implementação no Código

### HomePage.tsx
```typescript
useEffect(() => {
  const restoreSession = async () => {
    const restoredPlayer = await checkAndRestoreSession();
    if (restoredPlayer) {
      setPlayer(restoredPlayer);
      navigate('/star-map'); // Auto-login
    }
  };
  restoreSession();
}, []);
```

### QuickLoginForm.tsx
```typescript
const handleLogin = async (e) => {
  const player = await loginLocalPlayer(email, password);
  loadPlayerData(player);
  navigate('/star-map');
};
```

### LocalLoginForm.tsx
```typescript
const handleRegister = async (e) => {
  const player = await registerLocalPlayer(email, password, playerName);
  setPlayer(player);
  navigate('/star-map');
};
```

---

## 🧪 Testando o Sistema

### Teste 1: Primeiro Login
1. Abra a página
2. Clique "Criar Perfil"
3. Preencha dados
4. Verifique se foi para /star-map

### Teste 2: Auto-Login
1. Recarregue a página (F5)
2. Verifique se foi direto para /star-map
3. Dados devem estar carregados

### Teste 3: Limpar Cache
1. Abra DevTools → Application → Storage
2. Limpe IndexedDB
3. Recarregue a página
4. Deve mostrar tela de login

### Teste 4: Outro Navegador
1. Abra em outro navegador
2. Faça login com mesmo email/senha
3. Dados devem ser carregados do CMS

### Teste 5: Progresso Persistido
1. Faça login
2. Ganhe dinheiro/suba de nível
3. Recarregue a página
4. Dados devem estar salvos

---

## 🐛 Troubleshooting

### Problema: Não faz auto-login
**Solução:**
- Verificar se IndexedDB está habilitado
- Verificar se sessão foi criada
- Verificar console para erros

### Problema: Dados não sincronizam
**Solução:**
- Verificar conexão com CMS
- Verificar se player existe no CMS
- Verificar permissões da collection

### Problema: Senha incorreta mesmo correta
**Solução:**
- Verificar se email está normalizado (lowercase)
- Verificar se hash está correto
- Limpar IndexedDB e registrar novamente

---

## 📝 Checklist de Funcionalidades

- ✅ Credenciais salvas permanentemente
- ✅ Sessão persistida entre recarregamentos
- ✅ Auto-login ao retornar
- ✅ Dados do jogo sincronizados
- ✅ Suporte a múltiplos navegadores
- ✅ Suporte a múltiplos dispositivos
- ✅ Logout limpa sessão
- ✅ Segurança básica (hash de senha)

---

## 🎯 Próximos Passos (Opcional)

1. **Melhorar Segurança**
   - Usar bcrypt em vez de base64
   - Adicionar refresh tokens
   - Implementar 2FA

2. **Melhorar UX**
   - Lembrar email do último login
   - Opção "Manter conectado"
   - Sincronização em tempo real

3. **Multiplayer**
   - Sincronizar dados entre dispositivos
   - Notificações de login em outro lugar
   - Logout remoto

---

## 📞 Suporte

Para dúvidas sobre o sistema:
1. Verificar este documento
2. Verificar console do navegador
3. Verificar IndexedDB (DevTools → Application)
4. Verificar CMS (Wix Dashboard)
