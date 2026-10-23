import { Product, PricingCalculation, GlobalSettings } from '../types/pricing';

/**
 * Calcula todos os valores com base no custo unitário, quantidade no fardo,
 * margem do atacado (%) e margem de sugestão do lojista (%).
 */
export function calculatePricing(
  unitCost: number,
  quantity: number,
  marginPercent: number,
  clientMarginPercent: number
): PricingCalculation {
  const safeCost = Math.max(0, Number(unitCost) || 0);
  const safeQty = Math.max(1, Number(quantity) || 1);
  const safeMargin = Number(marginPercent) || 0;
  const safeClientMargin = Number(clientMarginPercent) || 0;

  // Custo total do Fardo / Caixa
  const fardoCost = safeCost * safeQty;

  // Preço de venda unitário para o cliente (atacado)
  const distributorMultiplier = 1 + safeMargin / 100;
  const unitSalePrice = safeCost * distributorMultiplier;

  // Preço total do Fardo / Caixa cobrado do cliente
  const fardoClientPrice = unitSalePrice * safeQty;

  // Lucro bruto por fardo para quem vende
  const distributorProfit = fardoClientPrice - fardoCost;

  // Margem sobre a venda (Markup vs Margem)
  const distributorMarginOnSale = fardoClientPrice > 0 ? (distributorProfit / fardoClientPrice) * 100 : 0;

  // Preço unitário sugerido para o consumidor final na prateleira do comércio
  const clientMultiplier = 1 + safeClientMargin / 100;
  const consumerUnitPrice = unitSalePrice * clientMultiplier;

  // Faturamento total do lojista ao vender as unidades do fardo ao consumidor
  const clientTotalRevenue = consumerUnitPrice * safeQty;

  // Lucro total do lojista por fardo
  const clientProfitPerFardo = clientTotalRevenue - fardoClientPrice;

  // Margem do lojista sobre o preço de venda final
  const clientMarginOnSale = clientTotalRevenue > 0 ? (clientProfitPerFardo / clientTotalRevenue) * 100 : 0;

  return {
    fardoCost,
    unitSalePrice,
    fardoClientPrice,
    distributorProfit,
    distributorMarginOnSale,
    distributorMarkup: distributorMultiplier,
    consumerUnitPrice,
    clientTotalRevenue,
    clientProfitPerFardo,
    clientMarginOnSale,
    clientMarkup: clientMultiplier,
  };
}

/**
 * Converte multiplicador (ex: 1.45) para percentual de margem (45%)
 */
export function multiplierToPercent(multiplier: number): number {
  return Number(((multiplier - 1) * 100).toFixed(2));
}

/**
 * Converte percentual de margem (ex: 45%) para multiplicador (1.45)
 */
export function percentToMultiplier(percent: number): number {
  return Number((1 + percent / 100).toFixed(4));
}

/**
 * Formata valor monetário para o padrão brasileiro (R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata percentual (ex: 45,0%)
 */
export function formatPercent(value: number, decimals = 1): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Formata multiplicador (ex: 1,45x)
 */
export function formatMultiplier(value: number, decimals = 2): string {
  if (isNaN(value)) return '1,00x';
  return `${value.toFixed(decimals).replace('.', ',')}x`;
}

/**
 * Configurações padrão extraídas da tabela original do PDF
 * Margem atacado padrão: 45% (multiplicador 1,45)
 * Margem sugestão cliente padrão: 40% (multiplicador 1,40)
 */
export const DEFAULT_SETTINGS: GlobalSettings = {
  defaultMarginPercent: 45, // Multiplicador 1.45x
  defaultClientMarginPercent: 40, // Multiplicador 1.40x
  marginInputMode: 'percent',
  autoRoundCents: false,
  companyName: 'Calculo de produtos',
  sellerName: '',
  sellerPhone: '',
};

/**
 * Catálogo completo de 46 produtos extraídos com precisão da tabela do PDF
 */
export const INITIAL_PRODUCTS: Product[] = [
  // SNACKS DE TRIGO - FARDOS (Pág 1)
  {
    id: 'prod-4228',
    cod: '4228',
    name: 'SNACK 10X70G BACON',
    unitType: 'Fardo',
    quantity: 10,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-6248',
    cod: '6248',
    name: 'SNACK 10X70G BACON CHEDDAR',
    unitType: 'Fardo',
    quantity: 10,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-4230',
    cod: '4230',
    name: 'SNACK 10X70G BARBECUE',
    unitType: 'Fardo',
    quantity: 10,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-5235',
    cod: '5235',
    name: 'SNACK 10X70G LEMON PEPPER',
    unitType: 'Fardo',
    quantity: 10,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-8371',
    cod: '8371',
    name: 'SNACK 10X70G ALHO NA MANTEIGA',
    unitType: 'Fardo',
    quantity: 10,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-8373',
    cod: '8373',
    name: 'SNACK 10X70G PRESUNTO',
    unitType: 'Fardo',
    quantity: 10,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-6250',
    cod: '6250',
    name: 'SNACK 10X70G HOT',
    unitType: 'Fardo',
    quantity: 10,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Snacks de Trigo',
  },

  // SNACKS DE TRIGO - CAIXAS (Pág 1)
  {
    id: 'prod-6264',
    cod: '6264',
    name: 'SNACK 20X70G BACON',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.6,
    marginPercent: 45,
    clientMarginPercent: 40.05,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-6254',
    cod: '6254',
    name: 'SNACK 20X70G BACON CHEDDAR',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.6,
    marginPercent: 45,
    clientMarginPercent: 40.05,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-6253',
    cod: '6253',
    name: 'SNACK 20X70G BARBECUE',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.6,
    marginPercent: 45,
    clientMarginPercent: 40.05,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-6252',
    cod: '6252',
    name: 'SNACK 20X70G LEMON PEPPER',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.6,
    marginPercent: 45,
    clientMarginPercent: 40.05,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-8367',
    cod: '8367',
    name: 'SNACK 20X70G ALHO NA MANTEIGA',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.6,
    marginPercent: 45,
    clientMarginPercent: 40.05,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-8368',
    cod: '8368',
    name: 'SNACK 20X70G PRESUNTO',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.6,
    marginPercent: 45,
    clientMarginPercent: 40.05,
    category: 'Snacks de Trigo',
  },
  {
    id: 'prod-6255',
    cod: '6255',
    name: 'SNACK 20X70G HOT',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.6,
    marginPercent: 45,
    clientMarginPercent: 40.05,
    category: 'Snacks de Trigo',
  },

  // PELLETS E TORRESMOS (Pág 1)
  {
    id: 'prod-50',
    cod: '50',
    name: 'Pellet crua 20X200G',
    unitType: 'Fardo',
    quantity: 20,
    unitCost: 3.2,
    marginPercent: 45,
    clientMarginPercent: 40.09,
    category: 'Pellets & Torresmo',
  },
  {
    id: 'prod-8380',
    cod: '8380',
    name: 'PURURUCA 20X20G',
    unitType: 'ESPET',
    quantity: 20,
    unitCost: 1.5,
    marginPercent: 45.33,
    clientMarginPercent: 39.91,
    category: 'Pellets & Torresmo',
  },
  {
    id: 'prod-8378',
    cod: '8378',
    name: 'PURURUCA 20X50G',
    unitType: 'CX',
    quantity: 20,
    unitCost: 3.8,
    marginPercent: 45,
    clientMarginPercent: 39.93,
    category: 'Pellets & Torresmo',
  },
  {
    id: 'prod-8382',
    cod: '8382',
    name: 'TORRESMO 10X80G (BANDEJA)',
    unitType: 'CX',
    quantity: 10,
    unitCost: 6.5,
    marginPercent: 45.08,
    clientMarginPercent: 39.98,
    category: 'Pellets & Torresmo',
  },
  {
    id: 'prod-8507',
    cod: '8507',
    name: 'TORRESMO 5X200G',
    unitType: 'CX',
    quantity: 5,
    unitCost: 15.2,
    marginPercent: 45,
    clientMarginPercent: 40.02,
    category: 'Pellets & Torresmo',
  },

  // TOUCITTO (Pág 1)
  {
    id: 'prod-8540',
    cod: '8540',
    name: 'Toucitto Limão 10X80G',
    unitType: 'CX',
    quantity: 10,
    unitCost: 7.2,
    marginPercent: 45,
    clientMarginPercent: 40.04,
    category: 'Toucitto',
  },
  {
    id: 'prod-8577',
    cod: '8577',
    name: 'Toucitto Original 10X80G',
    unitType: 'CX',
    quantity: 10,
    unitCost: 7.2,
    marginPercent: 45,
    clientMarginPercent: 40.04,
    category: 'Toucitto',
  },
  {
    id: 'prod-8530',
    cod: '8530',
    name: 'Toucitto Barbecue 20X25G',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.7,
    marginPercent: 45.19,
    clientMarginPercent: 39.8,
    category: 'Toucitto',
  },
  {
    id: 'prod-8536',
    cod: '8536',
    name: 'Toucitto Limao 20X25G',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.7,
    marginPercent: 45.19,
    clientMarginPercent: 39.8,
    category: 'Toucitto',
  },
  {
    id: 'prod-8528',
    cod: '8528',
    name: 'Toucitto Original 20X25G',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.7,
    marginPercent: 45.19,
    clientMarginPercent: 39.8,
    category: 'Toucitto',
  },
  {
    id: 'prod-8580',
    cod: '8580',
    name: 'Toucitto Cx Mista 10X80G',
    unitType: 'CX',
    quantity: 10,
    unitCost: 7.2,
    marginPercent: 45,
    clientMarginPercent: 40.04,
    category: 'Toucitto',
  },
  {
    id: 'prod-8581',
    cod: '8581',
    name: 'Toucitto Cx Mista 20X25G',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.7,
    marginPercent: 45.19,
    clientMarginPercent: 39.8,
    category: 'Toucitto',
  },

  // BATATAS 20X40G (Pág 1 & 2)
  {
    id: 'prod-22',
    cod: '22',
    name: 'BATATA 20X40G ORIGINAL',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Batatas',
  },
  {
    id: 'prod-23',
    cod: '23',
    name: 'BATATA 20X40G CHURRASCO',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Batatas',
  },
  {
    id: 'prod-3191',
    cod: '3191',
    name: 'BATATA 20X40G CEBOLA E SALSA',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Batatas',
  },
  {
    id: 'prod-24',
    cod: '24',
    name: 'BATATA 20X40G MISTA',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Batatas',
  },

  // BATATÁSTICA 20X60G (Pág 2)
  {
    id: 'prod-8476',
    cod: '8476',
    name: 'BATATÁSTICA 20X60G ORIGINAL',
    unitType: 'CX',
    quantity: 20,
    unitCost: 3.5,
    marginPercent: 45.14,
    clientMarginPercent: 39.96,
    category: 'Batatas',
  },
  {
    id: 'prod-8475',
    cod: '8475',
    name: 'BATATÁSTICA 20X60G REQUEIJÃO',
    unitType: 'CX',
    quantity: 20,
    unitCost: 3.5,
    marginPercent: 45.14,
    clientMarginPercent: 39.96,
    category: 'Batatas',
  },
  {
    id: 'prod-8474',
    cod: '8474',
    name: 'BATATÁSTICA 20X60G CREME DE CEBOLA',
    unitType: 'CX',
    quantity: 20,
    unitCost: 3.5,
    marginPercent: 45.14,
    clientMarginPercent: 39.96,
    category: 'Batatas',
  },
  {
    id: 'prod-8491',
    cod: '8491',
    name: 'BATATÁSTICA 20X60G MISTA',
    unitType: 'CX',
    quantity: 20,
    unitCost: 3.5,
    marginPercent: 45.14,
    clientMarginPercent: 39.96,
    category: 'Batatas',
  },

  // BISCOITO, PAÇOCA, COCADA (Pág 2)
  {
    id: 'prod-28',
    cod: '28',
    name: 'BISCOITO DE POLVILHO 10X70G',
    unitType: 'Fardo',
    quantity: 10,
    unitCost: 2.8,
    marginPercent: 45,
    clientMarginPercent: 39.9,
    category: 'Biscoitos & Doces',
  },
  {
    id: 'prod-55',
    cod: '55',
    name: 'PAÇOCÃO 20X100G',
    unitType: 'ESPET',
    quantity: 20,
    unitCost: 2.15,
    marginPercent: 45.12,
    clientMarginPercent: 39.74,
    category: 'Biscoitos & Doces',
  },
  {
    id: 'prod-98',
    cod: '98',
    name: 'COCADA 20X60G',
    unitType: 'CX',
    quantity: 20,
    unitCost: 2.2,
    marginPercent: 45,
    clientMarginPercent: 40.13,
    category: 'Biscoitos & Doces',
  },

  // AMENDOIM CARTELAS 20X30G (Pág 2)
  {
    id: 'prod-53',
    cod: '53',
    name: 'AMENDOIM 20X30G CARTELA C/ PELE',
    unitType: 'CART',
    quantity: 20,
    unitCost: 1.0,
    marginPercent: 45,
    clientMarginPercent: 40,
    category: 'Amendoim',
  },
  {
    id: 'prod-104',
    cod: '104',
    name: 'AMENDOIM 20X30G CARTELA S/ PELE',
    unitType: 'CART',
    quantity: 20,
    unitCost: 1.0,
    marginPercent: 45,
    clientMarginPercent: 40,
    category: 'Amendoim',
  },
  {
    id: 'prod-54',
    cod: '54',
    name: 'AMENDOIM 20X30G CARTELA C/ ALHO',
    unitType: 'CART',
    quantity: 20,
    unitCost: 1.1,
    marginPercent: 45.45,
    clientMarginPercent: 39.38,
    category: 'Amendoim',
  },

  // AMENDOIM ESPETOS 20X50G E DEMAIS (Pág 2)
  {
    id: 'prod-6288',
    cod: '6288',
    name: 'AMENDOIM 20X50G C/ PELE',
    unitType: 'ESPET',
    quantity: 20,
    unitCost: 1.5,
    marginPercent: 45.33,
    clientMarginPercent: 39.91,
    category: 'Amendoim',
  },
  {
    id: 'prod-6289',
    cod: '6289',
    name: 'AMENDOIM 20X50G S/ PELE',
    unitType: 'ESPET',
    quantity: 20,
    unitCost: 1.5,
    marginPercent: 45.33,
    clientMarginPercent: 39.91,
    category: 'Amendoim',
  },
  {
    id: 'prod-6278',
    cod: '6278',
    name: 'AMENDOIM 20X50G CROCANTE',
    unitType: 'ESPET',
    quantity: 20,
    unitCost: 1.5,
    marginPercent: 45.33,
    clientMarginPercent: 39.91,
    category: 'Amendoim',
  },
  {
    id: 'prod-8358',
    cod: '8358',
    name: 'AMENDOIM 20X50G C/ ALHO',
    unitType: 'ESPET',
    quantity: 20,
    unitCost: 1.6,
    marginPercent: 45,
    clientMarginPercent: 40.09,
    category: 'Amendoim',
  },
  {
    id: 'prod-6279',
    cod: '6279',
    name: 'MIX DE AMENDOIM COM CASTANHA',
    unitType: 'ESPET',
    quantity: 20,
    unitCost: 2.4,
    marginPercent: 45,
    clientMarginPercent: 39.94,
    category: 'Amendoim',
  },
  {
    id: 'prod-57',
    cod: '57',
    name: 'AMENDUPÃ 20X40G',
    unitType: 'CX',
    quantity: 20,
    unitCost: 1.2,
    marginPercent: 45,
    clientMarginPercent: 40.23,
    category: 'Amendoim',
  },
];
