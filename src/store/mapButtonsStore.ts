import { create } from 'zustand';

export interface MapButton {
  id: string;
  x: number; // Coordenada X no mapa
  y: number; // Coordenada Y no mapa
  width: number; // Largura base do botão
  height: number; // Altura base do botão
  label: string; // Texto do botão
  icon?: string; // URL do ícone (opcional)
  color?: string; // Cor do botão (Tailwind class)
  onClick: () => void; // Função ao clicar
  visible?: boolean; // Se está visível
  isUserCreated?: boolean; // Se foi criado pelo usuário (para diferenciar dos botões padrão)
}

interface MapButtonsStore {
  buttons: MapButton[];
  addButton: (button: MapButton) => void;
  removeButton: (id: string) => void;
  updateButton: (id: string, updates: Partial<MapButton>) => void;
  clearButtons: () => void;
  clearUserCreatedButtons: () => void;
  getButton: (id: string) => MapButton | undefined;
}

export const useMapButtonsStore = create<MapButtonsStore>((set, get) => ({
  buttons: [],
  
  addButton: (button) => {
    set((state) => ({
      buttons: [...state.buttons, button],
    }));
  },
  
  removeButton: (id) => {
    set((state) => ({
      buttons: state.buttons.filter((btn) => btn.id !== id),
    }));
  },
  
  updateButton: (id, updates) => {
    set((state) => ({
      buttons: state.buttons.map((btn) =>
        btn.id === id ? { ...btn, ...updates } : btn
      ),
    }));
  },
  
  clearButtons: () => {
    set({ buttons: [] });
  },
  
  clearUserCreatedButtons: () => {
    set((state) => ({
      buttons: state.buttons.filter((btn) => !btn.isUserCreated),
    }));
  },
  
  getButton: (id) => {
    return get().buttons.find((btn) => btn.id === id);
  },
}));
