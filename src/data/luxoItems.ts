// ==========================================
// LUXURY ITEMS SYSTEM
// ==========================================

// Estrutura de um item
type LuxuryItem = {
  name: string;
    price: number;
    };

    // Estrutura de todos os níveis
    type LuxuryItemsByLevel = {
      [level: number]: LuxuryItem[];
      };

      // Função pra pegar os itens pelo nível
      export function getItemsByLevel(level: number, data: LuxuryItemsByLevel) {
        return data[level] || [];
        }

        // ==========================================
        // ITENS DE LUXO (COLE ABAIXO)
        // ==========================================

        export const luxuryItems: LuxuryItemsByLevel = {

          //const luxuryItems = {
            1: [
                { name: "Corrente de Prata", price: 120 },
                    { name: "Anel Simples", price: 120 },
                        { name: "Pulseira Fina", price: 120 },
                            { name: "Relógio Básico", price: 120 },
                                { name: "Óculos Escuros", price: 120 },
                                  ],
                                    2: [
                                        { name: "Corrente Banhada a Ouro", price: 132 },
                                            { name: "Anel Refinado", price: 132 },
                                                { name: "Pulseira Elegante", price: 132 },
                                                    { name: "Relógio Premium", price: 132 },
                                                        { name: "Bolsa Casual Chic", price: 132 },
                                                          ],
                                                            3: [
                                                                { name: "Colar Luxo", price: 145.2 },
                                                                    { name: "Anel Luxo", price: 145.2 },
                                                                        { name: "Pulseira Luxo", price: 145.2 },
                                                                            { name: "Relógio Luxo", price: 145.2 },
                                                                                { name: "Bolsa Luxo", price: 145.2 },
                                                                                  ],
                                                                                    4: [
                                                                                        { name: "Colar Premium", price: 159.72 },
                                                                                            { name: "Anel Premium", price: 159.72 },
                                                                                                { name: "Pulseira Premium", price: 159.72 },
                                                                                                    { name: "Relógio Premium Elite", price: 159.72 },
                                                                                                        { name: "Bolsa Premium", price: 159.72 },
                                                                                                          ],
                                                                                                            5: [
                                                                                                                { name: "Colar Ouro", price: 175.69 },
                                                                                                                    { name: "Anel Ouro", price: 175.69 },
                                                                                                                        { name: "Pulseira Ouro", price: 175.69 },
                                                                                                                            { name: "Relógio Ouro", price: 175.69 },
                                                                                                                                { name: "Bolsa Ouro", price: 175.69 },
                                                                                                                                  ],
                                                                                                                                    6: [
                                                                                                                                        { name: "Colar Diamante", price: 193.26 },
                                                                                                                                            { name: "Anel Diamante", price: 193.26 },
                                                                                                                                                { name: "Pulseira Diamante", price: 193.26 },
                                                                                                                                                    { name: "Relógio Diamante", price: 193.26 },
                                                                                                                                                        { name: "Bolsa Diamante", price: 193.26 },
                                                                                                                                                          ],
                                                                                                                                                            7: [
                                                                                                                                                                { name: "Colar Elite", price: 212.59 },
                                                                                                                                                                    { name: "Anel Elite", price: 212.59 },
                                                                                                                                                                        { name: "Pulseira Elite", price: 212.59 },
                                                                                                                                                                            { name: "Relógio Elite", price: 212.59 },
                                                                                                                                                                                { name: "Bolsa Elite", price: 212.59 },
                                                                                                                                                                                  ],
                                                                                                                                                                                    8: [
                                                                                                                                                                                        { name: "Colar Supremo", price: 233.85 },
                                                                                                                                                                                            { name: "Anel Supremo", price: 233.85 },
                                                                                                                                                                                                { name: "Pulseira Suprema", price: 233.85 },
                                                                                                                                                                                                    { name: "Relógio Supremo", price: 233.85 },
                                                                                                                                                                                                        { name: "Bolsa Suprema", price: 233.85 },
                                                                                                                                                                                                          ],
                                                                                                                                                                                                            9: [
                                                                                                                                                                                                                { name: "Colar Imperial", price: 257.23 },
                                                                                                                                                                                                                    { name: "Anel Imperial", price: 257.23 },
                                                                                                                                                                                                                        { name: "Pulseira Imperial", price: 257.23 },
                                                                                                                                                                                                                            { name: "Relógio Imperial", price: 257.23 },
                                                                                                                                                                                                                                { name: "Bolsa Imperial", price: 257.23 },
                                                                                                                                                                                                                                  ],
                                                                                                                                                                                                                                    10: [
                                                                                                                                                                                                                                        { name: "Colar Real", price: 282.95 },
                                                                                                                                                                                                                                            { name: "Anel Real", price: 282.95 },
                                                                                                                                                                                                                                                { name: "Pulseira Real", price: 282.95 },
                                                                                                                                                                                                                                                    { name: "Relógio Real", price: 282.95 },
                                                                                                                                                                                                                                                        { name: "Bolsa Real", price: 282.95 },
                                                                                                                                                                                                                                                          ],
                                                                                                                                                                                                                                                          };


          };
