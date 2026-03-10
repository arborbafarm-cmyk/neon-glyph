import React, { useState } from 'react';
import { Image } from '@/components/ui/image';

const SLOT_ITEMS = [
  {
    id: 'pistol',
    name: 'Pistola',
    image: 'https://static.wixstatic.com/media/50f4bf_7ceb0938617b41bbb7a55bb15b81510b~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'money',
    name: 'Dinheiro',
    image: 'https://static.wixstatic.com/media/50f4bf_c9d630f7a9084448858f4688d5fd2422~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'bank',
    name: 'Prédio de Banco',
    image: 'https://static.wixstatic.com/media/50f4bf_cdd14c9f000248668e089d213a781cc9~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'diamond',
    name: 'Diamante',
    image: 'https://static.wixstatic.com/media/50f4bf_6def4b759743405d9569d1492b237a35~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'police',
    name: 'Viatura de Polícia',
    image: 'https://static.wixstatic.com/media/50f4bf_c23536e6564e4839a021f9beee0bf22c~mv2.png?originWidth=384&originHeight=384'
  }
];

export default function SlotMachine() {
  const [slots, setSlots] = useState<number[]>([0, 1, 2]);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Slot Machine Container */}
      <div className="from-gray-900 to-black border-secondary rounded-lg p-3 shadow-2xl border border-none bg-transparent">
        {/* Slot Display - 3 slots centered */}
        {/* Slot Item Labels */}
        <div className="flex gap-2 justify-center mt-2 text-secondary text-xs font-heading">
          {slots.map((slotIndex, position) => (
            <div key={position} className="w-20 text-center truncate text-[10px]">
              {SLOT_ITEMS[slotIndex].name}
            </div>
          ))}
        </div>
      <div className="flex gap-2 justify-center items-center">
          {slots.map((slotIndex, position) => (
            <div
              key={position}
              className="w-20 h-24 bg-gradient-to-b from-gray-800 to-black border-2 border-secondary rounded-lg flex items-center justify-center overflow-hidden shadow-inner"
            >
              <Image
                src={SLOT_ITEMS[slotIndex].image}
                alt={SLOT_ITEMS[slotIndex].name}
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
          ))}
        </div>

        </div>
    </div>
  );
}
