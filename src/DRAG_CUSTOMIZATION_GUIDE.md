# Sistema de Personalização por Arrasto (Drag Customization)

## Visão Geral

O sistema de personalização por arrasto permite que qualquer elemento ou container seja movido livremente em todas as telas do aplicativo. Quando ativado, os usuários podem reorganizar a interface conforme desejarem, e as posições são salvas automaticamente no localStorage.

## Como Usar

### 1. Ativar o Modo de Personalização

No Header, há um botão com ícone de movimento (Move3D). Clique nele para ativar/desativar o modo de personalização.

- **Botão desativado**: Interface normal, sem possibilidade de arrasto
- **Botão ativado** (azul ciano): Todos os elementos com `DraggableElement` podem ser movidos

### 2. Mover Elementos

Quando o modo de personalização está ativado:
1. Passe o mouse sobre qualquer elemento com `DraggableElement`
2. Uma barra de controle aparecerá acima do elemento com um ícone de grip
3. Clique e arraste o elemento para a posição desejada
4. A posição é salva automaticamente

### 3. Resetar Posições

Para resetar todas as posições dos elementos:
```typescript
import { useDragCustomizationStore } from '@/store/dragCustomizationStore';

const { resetAllPositions } = useDragCustomizationStore();
resetAllPositions(); // Remove todas as posições salvas
```

## Implementação

### Para Desenvolvedores

#### Envolver um Elemento com DraggableElement

```typescript
import DraggableElement from '@/components/DraggableElement';

export default function MyPage() {
  return (
    <DraggableElement 
      id="my-unique-element-id"
      title="Meu Elemento"
      className="my-custom-class"
    >
      {/* Seu conteúdo aqui */}
      <div>Conteúdo do elemento</div>
    </DraggableElement>
  );
}
```

#### Props do DraggableElement

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `id` | string | ✅ | ID único para o elemento (usado para salvar posição) |
| `children` | ReactNode | ✅ | Conteúdo do elemento |
| `title` | string | ❌ | Título exibido na barra de controle (padrão: "Element") |
| `className` | string | ❌ | Classes CSS adicionais |

#### Usar o Store de Personalização

```typescript
import { useDragCustomizationStore } from '@/store/dragCustomizationStore';

export default function MyComponent() {
  const isDragModeEnabled = useDragCustomizationStore((state) => state.isDragModeEnabled);
  const toggleDragMode = useDragCustomizationStore((state) => state.toggleDragMode);
  const position = useDragCustomizationStore((state) => state.getPosition('element-id'));
  const setPosition = useDragCustomizationStore((state) => state.setPosition);
  const resetAllPositions = useDragCustomizationStore((state) => state.resetAllPositions);

  return (
    <div>
      <button onClick={toggleDragMode}>
        {isDragModeEnabled ? 'Desativar' : 'Ativar'} Personalização
      </button>
    </div>
  );
}
```

## Armazenamento

### localStorage

As posições dos elementos são salvas em `localStorage` sob a chave `drag-positions`:

```json
{
  "element-id-1": { "x": 100, "y": 50 },
  "element-id-2": { "x": 200, "y": 150 }
}
```

### Carregamento Automático

As posições são carregadas automaticamente quando o componente `DraggableElement` é renderizado.

## Exemplos de Uso

### Exemplo 1: Elemento Simples

```typescript
import DraggableElement from '@/components/DraggableElement';

export default function Dashboard() {
  return (
    <div>
      <DraggableElement id="stats-panel" title="Estatísticas">
        <div className="bg-black/50 p-4 border border-cyan-500">
          <h3>Suas Estatísticas</h3>
          <p>Nível: 50</p>
          <p>Experiência: 5000</p>
        </div>
      </DraggableElement>
    </div>
  );
}
```

### Exemplo 2: Múltiplos Elementos

```typescript
import DraggableElement from '@/components/DraggableElement';

export default function GameScreen() {
  return (
    <div className="relative w-full h-screen">
      <DraggableElement id="inventory" title="Inventário">
        <div className="bg-black/70 p-4 border border-yellow-500">
          {/* Conteúdo do inventário */}
        </div>
      </DraggableElement>

      <DraggableElement id="minimap" title="Mapa">
        <div className="bg-black/70 p-4 border border-green-500">
          {/* Conteúdo do mapa */}
        </div>
      </DraggableElement>

      <DraggableElement id="chat" title="Chat">
        <div className="bg-black/70 p-4 border border-blue-500">
          {/* Conteúdo do chat */}
        </div>
      </DraggableElement>
    </div>
  );
}
```

## Comportamento Visual

### Quando Modo Desativado
- Elementos aparecem normalmente
- Sem barra de controle
- Sem possibilidade de arrasto

### Quando Modo Ativado
- Ao passar o mouse sobre um elemento, uma barra aparece acima dele
- A barra mostra:
  - Ícone de grip (GripHorizontal)
  - Título do elemento
- Cursor muda para "grab" ao passar sobre o grip
- Cursor muda para "grabbing" ao arrastar

## Notas Importantes

1. **ID Único**: Cada elemento deve ter um ID único para que a posição seja salva corretamente
2. **localStorage**: As posições são persistidas no navegador. Limpar o cache/localStorage resetará as posições
3. **Responsividade**: O sistema funciona em todas as telas, mas as posições são absolutas em relação ao container pai
4. **Performance**: O arrasto usa event listeners nativos e Framer Motion para suavidade

## Troubleshooting

### Elementos não se movem
- Verifique se o modo de personalização está ativado (botão azul ciano no Header)
- Certifique-se de que o elemento está envolvido com `DraggableElement`
- Verifique se o ID é único

### Posições não são salvas
- Verifique se o localStorage está habilitado no navegador
- Abra o DevTools (F12) e verifique a aba "Application" > "Local Storage"
- Procure pela chave `drag-positions`

### Elementos desaparecem
- Verifique se o container pai tem `position: relative` ou similar
- Certifique-se de que o elemento não está fora dos limites do viewport

## Integração com Páginas Existentes

Para adicionar personalização a uma página existente:

1. Importe `DraggableElement`
2. Envolva os elementos que deseja tornar móveis
3. Forneça IDs únicos
4. Pronto! O sistema funciona automaticamente

Exemplo:
```typescript
// Antes
<div className="stats-panel">
  <h3>Estatísticas</h3>
</div>

// Depois
<DraggableElement id="stats-panel" title="Estatísticas">
  <div className="stats-panel">
    <h3>Estatísticas</h3>
  </div>
</DraggableElement>
```

## API Completa do Store

```typescript
interface DragCustomizationState {
  // Estado
  isDragModeEnabled: boolean;
  positions: Record<string, DragPosition>;

  // Ações
  toggleDragMode: () => void;
  setDragMode: (enabled: boolean) => void;
  setPosition: (id: string, position: DragPosition) => void;
  getPosition: (id: string) => DragPosition | undefined;
  resetAllPositions: () => void;
  resetPosition: (id: string) => void;
  loadPositions: () => void;
  savePositions: () => void;
}
```

## Suporte

Para dúvidas ou problemas, consulte a documentação do Framer Motion e localStorage do navegador.
