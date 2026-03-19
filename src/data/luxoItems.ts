import { ItensdeLuxo } from '@/entities';

/**
 * Estrutura de dados para os itens de luxo
 * Cada item contém: nível, nome, preço e descrição
 */
export const luxoItemsData: ItensdeLuxo[] = [
  {
    _id: 'luxo-item-1',
    level: 1,
    itemName: 'Relógio de Pulso',
    price: 5000,
    description: 'Um relógio elegante de entrada',
    category: 'Acessórios',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-2',
    level: 2,
    itemName: 'Óculos de Sol Premium',
    price: 8000,
    description: 'Óculos de designer com proteção UV',
    category: 'Acessórios',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-3',
    level: 3,
    itemName: 'Bolsa de Couro',
    price: 12000,
    description: 'Bolsa de couro genuíno importada',
    category: 'Acessórios',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-4',
    level: 4,
    itemName: 'Jaqueta de Couro',
    price: 18000,
    description: 'Jaqueta de couro premium',
    category: 'Roupas',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-5',
    level: 5,
    itemName: 'Sapatos Italianos',
    price: 15000,
    description: 'Sapatos feitos à mão na Itália',
    category: 'Calçados',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-6',
    level: 6,
    itemName: 'Relógio Suíço',
    price: 25000,
    description: 'Relógio mecânico suíço de luxo',
    category: 'Acessórios',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-7',
    level: 7,
    itemName: 'Cinto de Designer',
    price: 10000,
    description: 'Cinto com fivela de ouro',
    category: 'Acessórios',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-8',
    level: 8,
    itemName: 'Perfume Francês',
    price: 8500,
    description: 'Perfume importado da França',
    category: 'Fragrâncias',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-9',
    level: 9,
    itemName: 'Anel de Ouro',
    price: 20000,
    description: 'Anel de ouro 18 quilates',
    category: 'Joias',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-10',
    level: 10,
    itemName: 'Corrente de Ouro',
    price: 30000,
    description: 'Corrente de ouro maciço',
    category: 'Joias',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-11',
    level: 11,
    itemName: 'Diamante Certificado',
    price: 50000,
    description: 'Diamante com certificado internacional',
    category: 'Joias',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-12',
    level: 12,
    itemName: 'Rolex Submariner',
    price: 75000,
    description: 'Relógio Rolex Submariner original',
    category: 'Acessórios',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-13',
    level: 13,
    itemName: 'Óculos Gucci',
    price: 12000,
    description: 'Óculos de sol Gucci autêntico',
    category: 'Acessórios',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-14',
    level: 14,
    itemName: 'Bolsa Louis Vuitton',
    price: 45000,
    description: 'Bolsa Louis Vuitton edição limitada',
    category: 'Acessórios',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
  {
    _id: 'luxo-item-15',
    level: 15,
    itemName: 'Joia de Platina',
    price: 100000,
    description: 'Joia exclusiva de platina com diamantes',
    category: 'Joias',
    imageUrl: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  },
];

/**
 * Função auxiliar para obter item por nível
 */
export const getLuxoItemByLevel = (level: number): ItensdeLuxo | undefined => {
  return luxoItemsData.find(item => item.level === level);
};

/**
 * Função auxiliar para obter itens por categoria
 */
export const getLuxoItemsByCategory = (category: string): ItensdeLuxo[] => {
  return luxoItemsData.filter(item => item.category === category);
};

/**
 * Função auxiliar para obter itens dentro de um intervalo de preço
 */
export const getLuxoItemsByPriceRange = (minPrice: number, maxPrice: number): ItensdeLuxo[] => {
  return luxoItemsData.filter(item => item.price && item.price >= minPrice && item.price <= maxPrice);
};
