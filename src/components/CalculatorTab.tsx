import React, { useState } from 'react';
import {
  calculatePricing,
  formatCurrency,
  formatPercent,
  formatMultiplier,
  multiplierToPercent,
  percentToMultiplier,
} from '../utils/pricing';
import { Product, GlobalSettings } from '../types/pricing';
import {
  Calculator,
  Plus,
  Share2,
  Copy,
  Check,
  TrendingUp,
  Package,
  Sparkles,
  DollarSign,
  ArrowRight,
  RotateCcw,
  Store,
} from 'lucide-react';

interface CalculatorTabProps {
  settings: GlobalSettings;
  onSaveProduct: (product: Omit<Product, 'id'>) => void;
  onNavigateToTable: () => void;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  settings,
  onSaveProduct,
  onNavigateToTable,
}) => {
  // Input states
  const [productName, setProductName] = useState('');
  const [productCod, setProductCod] = useState('');
  const [unitType, setUnitType] = useState('Fardo');
  const [quantity, setQuantity] = useState<number | string>(10);
  const [unitCost, setUnitCost] = useState<number | string>('2.20');
  const [marginPercent, setMarginPercent] = useState<number | string>(settings.defaultMarginPercent);
  const [clientMarginPercent, setClientMarginPercent] = useState<number | string>(settings.defaultClientMarginPercent);

  // Input mode: 'percent' or 'multiplier'
  const [marginMode, setMarginMode] = useState<'percent' | 'multiplier'>(settings.marginInputMode);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Parsed numerical values
  const numCost = typeof unitCost === 'number' ? unitCost : parseFloat(String(unitCost).replace(',', '.')) || 0;
  const numQty = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10) || 1;
  const numMargin = typeof marginPercent === 'number' ? marginPercent : parseFloat(String(marginPercent).replace(',', '.')) || 0;
  const numClientMargin = typeof clientMarginPercent === 'number' ? clientMarginPercent : parseFloat(String(clientMarginPercent).replace(',', '.')) || 0;

  // Real-time calculation
  const calc = calculatePricing(numCost, numQty, numMargin, numClientMargin);

  // Common quick presets
  const quantityPresets = [5, 10, 20, 24, 30];
  const marginPresets = [
    { label: '35% (1,35x)', percent: 35 },
    { label: '40% (1,40x)', percent: 40 },
    { label: '45% (1,45x)', percent: 45 },
    { label: '50% (1,50x)', percent: 50 },
    { label: '60% (1,60x)', percent: 60 },
  ];
  const clientPresets = [
    { label: '30% (1,30x)', percent: 30 },
    { label: '35% (1,35x)', percent: 35 },
    { label: '40% (1,40x)', percent: 40 },
    { label: '50% (1,50x)', percent: 50 },
  ];

  const handleMarginChange = (val: string) => {
    const parsed = parseFloat(val.replace(',', '.'));
    if (isNaN(parsed)) {
      setMarginPercent('');
      return;
    }
    if (marginMode === 'multiplier') {
      setMarginPercent(multiplierToPercent(parsed));
    } else {
      setMarginPercent(parsed);
    }
  };

  const handleClientMarginChange = (val: string) => {
    const parsed = parseFloat(val.replace(',', '.'));
    if (isNaN(parsed)) {
      setClientMarginPercent('');
      return;
    }
    if (marginMode === 'multiplier') {
      setClientMarginPercent(multiplierToPercent(parsed));
    } else {
      setClientMarginPercent(parsed);
    }
  };

  const handleSaveToTable = () => {
    const finalName = productName.trim() || `Produto ${numQty} un`;
    const finalCod = productCod.trim() || String(Math.floor(1000 + Math.random() * 9000));

    onSaveProduct({
      name: finalName,
      cod: finalCod,
      unitType,
      quantity: numQty,
      unitCost: numCost,
      marginPercent: numMargin,
      clientMarginPercent: numClientMargin,
      updatedAt: Date.now(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const generateSummaryText = () => {
    const pName = productName.trim() || 'PRODUTO';
    const pCod = productCod.trim() ? `[Cód ${productCod.trim()}] ` : '';
    return (
      `📦 *${pCod}${pName}*\n` +
      `• Embalagem: ${unitType} com ${numQty} un.\n` +
      `• Custo Unitário: ${formatCurrency(numCost)}\n` +
      `• Custo Total ${unitType}: ${formatCurrency(calc.fardoCost)}\n\n` +
      `💰 *VENDA ATACADO (Margem ${formatPercent(numMargin)} / ${formatMultiplier(calc.distributorMarkup)}):*\n` +
      `• Venda Unitária: ${formatCurrency(calc.unitSalePrice)}\n` +
      `• *VALOR DO ${unitType.toUpperCase()}: ${formatCurrency(calc.fardoClientPrice)}*\n` +
      `• Seu Lucro no fardo: ${formatCurrency(calc.distributorProfit)}\n\n` +
      `🏪 *SUGESTÃO CONSUMIDOR FINAL (Margem ${formatPercent(numClientMargin)} / ${formatMultiplier(calc.clientMarkup)}):*\n` +
      `• Preço Sugerido Unitário: ${formatCurrency(calc.consumerUnitPrice)}\n` +
      `• Faturamento do Lojista: ${formatCurrency(calc.clientTotalRevenue)}\n` +
      `• Lucro do Lojista: ${formatCurrency(calc.clientProfitPerFardo)}`
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateSummaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateSummaryText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleLoadDemo = (type: 'snack' | 'biscoito' | 'torresmo') => {
    if (type === 'snack') {
      setProductName('SNACK 10X70G BACON');
      setProductCod('4228');
      setUnitType('Fardo');
      setQuantity(10);
      setUnitCost('2.20');
      setMarginPercent(45);
      setClientMarginPercent(40.13);
    } else if (type === 'biscoito') {
      setProductName('BISCOITO DE POLVILHO 10X70G');
      setProductCod('28');
      setUnitType('Fardo');
      setQuantity(10);
      setUnitCost('2.80');
      setMarginPercent(45);
      setClientMarginPercent(39.9);
    } else {
      setProductName('Toucitto Limão 10X80G');
      setProductCod('8540');
      setUnitType('CX');
      setQuantity(10);
      setUnitCost('7.20');
      setMarginPercent(45);
      setClientMarginPercent(40.04);
    }
  };

  const handleClear = () => {
    setProductName('');
    setProductCod('');
    setQuantity(10);
    setUnitCost('');
  };

  return (
    <div className="space-y-4 pb-20 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0 lg:pb-8">
      {/* Top Banner / Quick Selector */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-orange-100 lg:col-span-2 lg:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm md:text-base leading-tight">
                Calculadora de Fardo / Caixa
              </h2>
              <p className="text-[11px] text-slate-500">
                Preço de venda, margem de ganho e sugestão ao lojista
              </p>
            </div>
          </div>

          {/* Mode Switcher (% or Multiplier) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setMarginMode('percent')}
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                marginMode === 'percent'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              % Margem
            </button>
            <button
              onClick={() => setMarginMode('multiplier')}
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                marginMode === 'multiplier'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Multiplicador
            </button>
          </div>
        </div>

        {/* Quick Demo Preloads */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Exemplos PDF:</span>
          <button
            onClick={() => handleLoadDemo('snack')}
            className="shrink-0 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-800 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer font-medium"
          >
            Snack Bacon 10x
          </button>
          <button
            onClick={() => handleLoadDemo('torresmo')}
            className="shrink-0 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-800 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer font-medium"
          >
            Toucitto 10x
          </button>
          <button
            onClick={() => handleLoadDemo('biscoito')}
            className="shrink-0 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-800 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer font-medium"
          >
            Biscoito Polvilho 10x
          </button>
          <button
            onClick={handleClear}
            className="shrink-0 text-slate-400 hover:text-red-500 p-1 rounded-md transition cursor-pointer"
            title="Limpar campos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Inputs Form */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-orange-100/80 space-y-3.5 lg:p-5">
        {/* Row 1: Product Name & Code */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Produto (Opcional)
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: SNACK BACON 10X70G"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Código (Cód)
            </label>
            <input
              type="text"
              value={productCod}
              onChange={(e) => setProductCod(e.target.value)}
              placeholder="4228"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Row 2: Purchase Cost (Custo Unitário) & Quantity (QUANT) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Unit Cost */}
          <div className="bg-orange-50/70 p-3 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-orange-600" />
                Custo Compra (un)
              </label>
              <span className="text-[10px] text-orange-700 font-medium">Unitário</span>
            </div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0,00"
                className="w-full bg-white border border-orange-300 rounded-xl pl-8 pr-2.5 py-2.5 font-mono-numbers font-bold text-slate-900 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
              />
            </div>
            <p className="mt-1 text-[10px] text-orange-800 font-medium">
              Quanto você paga em cada unidade
            </p>
          </div>

          {/* Quantity in Box/Fardo */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Package className="w-3 h-3 text-slate-500" />
                Quantidade (Fardo)
              </label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                aria-label="Tipo de embalagem"
                className="text-[11px] font-bold text-orange-700 bg-orange-100/70 border border-orange-200 rounded px-1.5 py-0.5 cursor-pointer outline-none"
              >
                <option value="Fardo">Fardo</option>
                <option value="CX">Caixa (CX)</option>
                <option value="ESPET">Espeto</option>
                <option value="CART">Cartela</option>
                <option value="Pacote">Pacote</option>
                <option value="Display">Display</option>
                <option value="UND">Unidade</option>
              </select>
            </div>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-mono-numbers font-bold text-slate-900 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
            />
            <div className="flex items-center gap-1 mt-1.5 overflow-x-auto no-scrollbar">
              {quantityPresets.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded transition cursor-pointer ${
                    Number(quantity) === q
                      ? 'bg-orange-600 text-white font-bold'
                      : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Margem de Ganho Atacado */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              <label className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Margem Atacado (Seu Lucro)
              </label>
            </div>
            <div className="text-[11px] font-mono-numbers font-bold text-amber-900">
              {marginMode === 'multiplier'
                ? `${formatPercent(numMargin)} margem`
                : `${formatMultiplier(calc.distributorMarkup)} mult.`}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="col-span-2 relative">
              <input
                type="text"
                inputMode="decimal"
                value={
                  marginMode === 'multiplier'
                    ? percentToMultiplier(numMargin)
                    : marginPercent
                }
                onChange={(e) => handleMarginChange(e.target.value)}
                placeholder={marginMode === 'multiplier' ? '1,45' : '45'}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 font-mono-numbers font-bold text-amber-950 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700">
                {marginMode === 'multiplier' ? 'x' : '%'}
              </span>
            </div>

            <div className="bg-white/90 border border-amber-200 rounded-xl px-2.5 py-1.5 text-center">
              <span className="text-[10px] text-amber-800 block uppercase font-bold">Venda Unit.</span>
              <span className="font-mono-numbers font-extrabold text-amber-900 text-sm">
                {formatCurrency(calc.unitSalePrice)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {marginPresets.map((p) => (
              <button
                key={p.percent}
                type="button"
                onClick={() => setMarginPercent(p.percent)}
                className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition cursor-pointer ${
                  numMargin === p.percent
                    ? 'bg-amber-600 text-white shadow-2xs font-bold'
                    : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 4: Percentual para Cliente / Lojista */}
        <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-orange-700" />
              <label className="text-xs font-bold text-orange-950 uppercase tracking-wider">
                Sugestão Consumidor (Margem do Lojista)
              </label>
            </div>
            <div className="text-[11px] font-mono-numbers font-bold text-orange-900">
              {marginMode === 'multiplier'
                ? `${formatPercent(numClientMargin)} margem`
                : `${formatMultiplier(calc.clientMarkup)} mult.`}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="col-span-2 relative">
              <input
                type="text"
                inputMode="decimal"
                value={
                  marginMode === 'multiplier'
                    ? percentToMultiplier(numClientMargin)
                    : clientMarginPercent
                }
                onChange={(e) => handleClientMarginChange(e.target.value)}
                placeholder={marginMode === 'multiplier' ? '1,40' : '40'}
                className="w-full bg-white border border-orange-300 rounded-xl px-3 py-2 font-mono-numbers font-bold text-orange-950 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-700">
                {marginMode === 'multiplier' ? 'x' : '%'}
              </span>
            </div>

            <div className="bg-white/90 border border-orange-200 rounded-xl px-2.5 py-1.5 text-center">
              <span className="text-[10px] text-orange-800 block uppercase font-bold">Consumidor</span>
              <span className="font-mono-numbers font-extrabold text-orange-900 text-sm">
                {formatCurrency(calc.consumerUnitPrice)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {clientPresets.map((p) => (
              <button
                key={p.percent}
                type="button"
                onClick={() => setClientMarginPercent(p.percent)}
                className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition cursor-pointer ${
                  numClientMargin === p.percent
                    ? 'bg-orange-600 text-white shadow-2xs font-bold'
                    : 'bg-white text-orange-900 border border-orange-200 hover:bg-orange-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULT CARDS IN MODERN VIBRANT ORANGE */}
      <div className="space-y-3 lg:sticky lg:top-40">
        {/* Main Card: Valor do Fardo/Caixa */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 text-white p-5 shadow-lg border border-orange-400/30">
          <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
            <Package className="w-28 h-28" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="bg-orange-400/40 border border-orange-300/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase text-white">
                Preço de Venda do {unitType}
              </span>
              <span className="text-xs font-medium text-orange-100">
                {numQty} un × {formatCurrency(calc.unitSalePrice)}
              </span>
            </div>

            <div className="mt-3">
              <span className="text-xs font-medium text-orange-100 block">
                Valor Total para o Cliente:
              </span>
              <div className="text-3xl md:text-4xl font-mono-numbers font-black tracking-tight text-white drop-shadow-xs">
                {formatCurrency(calc.fardoClientPrice)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-orange-400/40 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/15 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-orange-100 block uppercase font-semibold">
                  Custo do {unitType}
                </span>
                <span className="font-mono-numbers font-bold text-white text-sm">
                  {formatCurrency(calc.fardoCost)}
                </span>
                <span className="text-[10px] text-orange-200 block">
                  ({numQty} × {formatCurrency(numCost)})
                </span>
              </div>

              <div className="bg-white/20 rounded-xl p-2.5 border border-white/20">
                <span className="text-[10px] text-white block uppercase font-semibold">
                  Seu Lucro Líquido
                </span>
                <span className="font-mono-numbers font-extrabold text-white text-sm">
                  +{formatCurrency(calc.distributorProfit)}
                </span>
                <span className="text-[10px] text-orange-100 block">
                  +{formatPercent(numMargin)} sobre custo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Card: Sugestão ao Consumidor & Lucro do Lojista */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-orange-100 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-orange-600" />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Projeção para o Lojista / Comerciante
              </h3>
            </div>
            <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              Varejo Final
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">
                Preço Consumidor
              </span>
              <span className="font-mono-numbers font-black text-slate-900 text-sm md:text-base">
                {formatCurrency(calc.consumerUnitPrice)}
              </span>
              <span className="text-[9px] text-slate-400 block">por unidade</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">
                Faturamento
              </span>
              <span className="font-mono-numbers font-bold text-slate-800 text-sm md:text-base">
                {formatCurrency(calc.clientTotalRevenue)}
              </span>
              <span className="text-[9px] text-slate-400 block">ao vender o {unitType}</span>
            </div>

            <div className="bg-orange-50/80 p-2.5 rounded-xl border border-orange-200 text-center">
              <span className="text-[10px] text-orange-700 block uppercase font-bold">
                Lucro Lojista
              </span>
              <span className="font-mono-numbers font-black text-orange-700 text-sm md:text-base">
                +{formatCurrency(calc.clientProfitPerFardo)}
              </span>
              <span className="text-[9px] text-orange-600 block">
                +{formatPercent(numClientMargin)} ganho
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic bg-orange-50/40 p-2 rounded-lg border border-orange-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Argumento de venda: <em>"Você paga <strong>{formatCurrency(calc.fardoClientPrice)}</strong> no fardo e fatura <strong>{formatCurrency(calc.clientTotalRevenue)}</strong> no balcão, lucrando <strong>{formatCurrency(calc.clientProfitPerFardo)}</strong>!"</em>
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleSaveToTable}
            className={`py-3 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer ${
              savedSuccess
                ? 'bg-orange-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-98'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-orange-200" />
                <span>Salvo na Tabela!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-orange-400" />
                <span>Salvar na Tabela</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar WhatsApp</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleCopy}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-orange-700 font-semibold">Copiado para área de transferência!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Resumo Calculado</span>
              </>
            )}
          </button>

          <button
            onClick={onNavigateToTable}
            className="text-xs text-orange-700 hover:text-orange-800 font-bold flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-orange-50 transition cursor-pointer"
          >
            <span>Ver Tabela Completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
