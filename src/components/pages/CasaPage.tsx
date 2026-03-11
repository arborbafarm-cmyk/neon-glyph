import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/playerStore';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';

// Level to dirty money mapping
const LEVEL_TO_MONEY: Record<number, number> = {
  9: 10000,
  19: 50000,
  29: 60000,
  39: 70000,
  49: 100000,
  59: 500000,
  69: 1000000,
  79: 2000000,
  89: 20000000,
};

export default function CasaPage() {
  const { level } = usePlayerStore();
  const { removeDirtyMoney, dirtyMoney } = useDirtyMoneyStore();

  const getMoneyForLevel = (playerLevel: number): number => {
    // Find the appropriate amount based on player level
    const sortedLevels = Object.keys(LEVEL_TO_MONEY)
      .map(Number)
      .sort((a, b) => a - b);

    for (const levelThreshold of sortedLevels) {
      if (playerLevel >= levelThreshold) {
        return LEVEL_TO_MONEY[levelThreshold];
      }
    }

    return 0; // No money for levels below 9
  };

  const handleButtonClick = () => {
    const moneyToRemove = getMoneyForLevel(level);
    
    if (moneyToRemove > 0) {
      if (dirtyMoney >= moneyToRemove) {
        removeDirtyMoney(moneyToRemove);
        alert(`Nível ${level}: R$ ${moneyToRemove.toLocaleString('pt-BR')} retirado do cofre!`);
      } else {
        alert(`Nível ${level}: Você não tem dinheiro suficiente no cofre. Disponível: R$ ${dirtyMoney.toLocaleString('pt-BR')}`);
      }
    } else {
      alert(`Nível ${level}: Você precisa atingir o nível 9 para retirar dinheiro sujo.`);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: 'url(https://static.wixstatic.com/media/50f4bf_c6c96e5e7b0c4b8b963f4138fdc7a35c~mv2.png)',
        backgroundSize: '120%',
        backgroundPosition: 'center 40%',
        backgroundAttachment: 'fixed',
      }}
    >
      <Header />
      <div className="w-full flex justify-center pt-32">
        <Button onClick={handleButtonClick} className="px-8 py-3 text-lg">
          Clique aqui
        </Button>
      </div>
      <main className="flex-1 flex items-center justify-center">
        {/* Content area - you can add content here */}
      </main>
      <Footer />
    </div>
  );
}
