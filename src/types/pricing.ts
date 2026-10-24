export type UnitType = 'Fardo' | 'CX' | 'Pacote' | 'UND' | 'Display' | string;

export interface Product {
  id: string;
  cod: string;
  name: string;
  unitType: UnitType;
  quantity: number; // Quantidade de unidades no fardo/caixa
  unitCost: number; // Custo unitário de compra (R$)
  marginPercent: number; // Margem de ganho / markup de atacado (%) ex: 50 (multiplicador 1.5)
  clientMarginPercent: number; // Percentual para cliente / lojista (%) ex: 40 (multiplicador 1.4)
  category?: string;
  notes?: string;
  updatedAt?: number;
}

export interface PricingCalculation {
  fardoCost: number; // Custo total do Fardo/Caixa (unitCost * quantity)
  unitSalePrice: number; // Preço de venda unitário para o cliente (unitCost * (1 + marginPercent/100))
  fardoClientPrice: number; // Preço do Fardo/Caixa para o cliente (unitSalePrice * quantity)
  distributorProfit: number; // Lucro bruto do distribuidor por fardo (fardoClientPrice - fardoCost)
  distributorMarginOnSale: number; // Margem sobre o preço de venda (%)
  distributorMarkup: number; // Multiplicador (ex: 1.50)
  consumerUnitPrice: number; // Sugestão de venda ao consumidor final (unitSalePrice * (1 + clientMarginPercent/100))
  clientTotalRevenue: number; // Faturamento do cliente ao vender o fardo (consumerUnitPrice * quantity)
  clientProfitPerFardo: number; // Lucro do cliente lojista por fardo
  clientMarginOnSale: number; // Margem de lucro do cliente (%)
  clientMarkup: number; // Multiplicador cliente (ex: 1.40)
}

export interface OrderItem {
  productId: string;
  fardosQuantity: number;
}

export interface Customer {
  id: string;
  name: string;
  cnpj: string;
  stateRegistration: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  responsibleName: string;
  responsiblePhone: string;
  companyPhone: string;
  email: string;
  updatedAt: number;
}

export interface GlobalSettings {
  defaultMarginPercent: number; // Margem padrão do atacado (ex: 50% = 1.5x)
  defaultClientMarginPercent: number; // Margem padrão da sugestão consumidor (ex: 40% = 1.4x)
  marginInputMode: 'percent' | 'multiplier'; // se o usuário prefere digitar % ou multiplicador (ex: 1,5)
  autoRoundCents: boolean;
  companyName: string;
  sellerName: string;
  sellerPhone: string;
}
