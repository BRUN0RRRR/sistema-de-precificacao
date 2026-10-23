import React, { useState, useMemo } from 'react';
import { Product, GlobalSettings } from '../types/pricing';
import {
  calculatePricing,
  formatCurrency,
  formatPercent,
  formatMultiplier,
} from '../utils/pricing';
import {
  Search,
  Plus,
  Share2,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Printer,
  ArrowUpDown,
  FileSpreadsheet,
  Copy,
  Check,
  Percent,
} from 'lucide-react';

interface ProductTableTabProps {
  products: Product[];
  settings: GlobalSettings;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddProductClick: () => void;
  onBatchUpdateMargins: (marginPercent: number, clientMarginPercent: number) => void;
  onResetToDemo: () => void;
}

export const ProductTableTab: React.FC<ProductTableTabProps> = ({
  products,
  settings,
  onEditProduct,
  onDeleteProduct,
  onAddProductClick,
  onBatchUpdateMargins,
  onResetToDemo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [clientViewOnly, setClientViewOnly] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchMargin, setBatchMargin] = useState(settings.defaultMarginPercent);
  const [batchClientMargin, setBatchClientMargin] = useState(settings.defaultClientMarginPercent);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [sortBy, setSortBy] = useState<'cod' | 'name' | 'fardoClientPrice' | 'distributorProfit'>('cod');
  const [sortAsc, setSortAsc] = useState(true);

  // Compute categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.cod.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const calcA = calculatePricing(a.unitCost, a.quantity, a.marginPercent, a.clientMarginPercent);
        const calcB = calculatePricing(b.unitCost, b.quantity, b.marginPercent, b.clientMarginPercent);

        let comparison = 0;
        if (sortBy === 'cod') {
          comparison = a.cod.localeCompare(b.cod, undefined, { numeric: true });
        } else if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'fardoClientPrice') {
          comparison = calcA.fardoClientPrice - calcB.fardoClientPrice;
        } else if (sortBy === 'distributorProfit') {
          comparison = calcA.distributorProfit - calcB.distributorProfit;
        }

        return sortAsc ? comparison : -comparison;
      });
  }, [products, searchTerm, selectedCategory, sortBy, sortAsc]);

  // Aggregate statistics
  const totals = useMemo(() => {
    let totalCost = 0;
    let totalSale = 0;
    let totalProfit = 0;

    filteredProducts.forEach((p) => {
      const calc = calculatePricing(p.unitCost, p.quantity, p.marginPercent, p.clientMarginPercent);
      totalCost += calc.fardoCost;
      totalSale += calc.fardoClientPrice;
      totalProfit += calc.distributorProfit;
    });

    return {
      count: filteredProducts.length,
      totalCost,
      totalSale,
      totalProfit,
      averageProfitMargin: totalSale > 0 ? (totalProfit / totalSale) * 100 : 0,
    };
  }, [filteredProducts]);

  const handleSort = (field: 'cod' | 'name' | 'fardoClientPrice' | 'distributorProfit') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  const generateWhatsAppPriceList = (forClient: boolean) => {
    let msg = `📋 *TABELA DE PREÇOS & FARDOS*\n`;
    msg += `Atualizado em: ${new Date().toLocaleDateString('pt-BR')}\n\n`;

    filteredProducts.forEach((p) => {
      const calc = calculatePricing(p.unitCost, p.quantity, p.marginPercent, p.clientMarginPercent);
      msg += `🔹 *${p.cod} - ${p.name}*\n`;
      msg += `   • Embalagem: ${p.unitType} c/ ${p.quantity} un.\n`;
      msg += `   • *Preço ${p.unitType}: ${formatCurrency(calc.fardoClientPrice)}* (${formatCurrency(calc.unitSalePrice)}/un)\n`;
      msg += `   • Sugestão Venda Consumidor: *${formatCurrency(calc.consumerUnitPrice)}* un.\n`;
      if (!forClient) {
        msg += `   • [Controle Interno] Custo: ${formatCurrency(calc.fardoCost)} | Lucro: ${formatCurrency(calc.distributorProfit)}\n`;
      }
      msg += `\n`;
    });

    if (forClient) {
      msg += `✨ *Faça seu pedido direto pelo WhatsApp!* Entregamos com rapidez.`;
    }

    return msg;
  };

  const handleShareWhatsApp = (forClient: boolean) => {
    const text = encodeURIComponent(generateWhatsAppPriceList(forClient));
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyText = async (forClient: boolean) => {
    try {
      await navigator.clipboard.writeText(generateWhatsAppPriceList(forClient));
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header & Quick Actions */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-orange-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="font-bold text-slate-900 text-base">
                Tabela de Preços dos Produtos
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {products.length} itens cadastrados baseados na tabela de preços
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Internal vs Client-facing */}
            <button
              onClick={() => setClientViewOnly(!clientViewOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                clientViewOnly
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
              title="Alternar entre visão interna com custo/lucro ou tabela limpa para mostrar ao cliente"
            >
              {clientViewOnly ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{clientViewOnly ? 'Visão Cliente (Oculta Custo)' : 'Visão Distribuidor'}</span>
            </button>

            {/* Batch Update Margins */}
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition cursor-pointer flex items-center gap-1"
            >
              <Percent className="w-3.5 h-3.5 text-amber-700" />
              <span>Ajustar Margens</span>
            </button>

            {/* Add New Product Button */}
            <button
              onClick={onAddProductClick}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Itens</span>
            <span className="font-mono-numbers font-black text-slate-800 text-base">
              {totals.count} produtos
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              {clientViewOnly ? 'Total Venda Fardos' : 'Custo Total 1 Fardo Cada'}
            </span>
            <span className="font-mono-numbers font-bold text-slate-800 text-base">
              {clientViewOnly ? formatCurrency(totals.totalSale) : formatCurrency(totals.totalCost)}
            </span>
          </div>

          {!clientViewOnly && (
            <>
              <div className="bg-orange-50 rounded-xl p-2.5 border border-orange-200/70">
                <span className="text-[10px] uppercase font-bold text-orange-700 block">Venda Total Fardos</span>
                <span className="font-mono-numbers font-black text-orange-800 text-base">
                  {formatCurrency(totals.totalSale)}
                </span>
              </div>

              <div className="bg-orange-50 rounded-xl p-2.5 border border-orange-200/70">
                <span className="text-[10px] uppercase font-bold text-orange-700 block">Lucro Bruto Total</span>
                <span className="font-mono-numbers font-black text-orange-700 text-base">
                  +{formatCurrency(totals.totalProfit)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filtrar por categoria"
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Todas Categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-orange-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                <th
                  onClick={() => handleSort('cod')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition shrink-0"
                >
                  <div className="flex items-center gap-1">
                    <span>COD</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition min-w-[180px]"
                >
                  <div className="flex items-center gap-1">
                    <span>PRODUTOS</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-2 text-center">UND</th>
                <th className="py-3 px-2 text-center">QUANT</th>

                {/* Cost Columns (Hidden in Client View) */}
                {!clientViewOnly && (
                  <>
                    <th className="py-3 px-2.5 text-right font-mono">Custo (un)</th>
                    <th className="py-3 px-2.5 text-right font-mono">Custo Fardo</th>
                  </>
                )}

                <th className="py-3 px-2.5 text-right font-mono">Vlr venda (un)</th>

                <th
                  onClick={() => handleSort('fardoClientPrice')}
                  className="py-3 px-3 text-right font-mono cursor-pointer hover:bg-slate-200/70 transition bg-orange-50/70 text-orange-950 font-extrabold"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cliente Fardo</span>
                    <ArrowUpDown className="w-3 h-3 text-orange-600" />
                  </div>
                </th>

                {/* Profit Column (Hidden in Client View) */}
                {!clientViewOnly && (
                  <th
                    onClick={() => handleSort('distributorProfit')}
                    className="py-3 px-2.5 text-right font-mono cursor-pointer hover:bg-slate-200/70 transition text-orange-700 font-extrabold"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Lucro</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}

                <th className="py-3 px-3 text-right font-mono bg-blue-50/60 text-blue-950 font-extrabold">
                  Consumidor
                </th>

                <th className="py-3 px-2.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const calc = calculatePricing(p.unitCost, p.quantity, p.marginPercent, p.clientMarginPercent);
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-orange-50/30 transition-colors group"
                  >
                    {/* COD */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-600 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">
                        {p.cod}
                      </span>
                    </td>

                    {/* NAME */}
                    <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      {p.category && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          {p.category}
                        </span>
                      )}
                    </td>

                    {/* UND */}
                    <td className="py-3 px-2 text-center text-slate-600 whitespace-nowrap font-medium">
                      <span className="text-[11px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200/60">
                        {p.unitType}
                      </span>
                    </td>

                    {/* QUANT */}
                    <td className="py-3 px-2 text-center font-mono-numbers font-bold text-slate-800 whitespace-nowrap">
                      {p.quantity}
                    </td>

                    {/* Internal Cost Data */}
                    {!clientViewOnly && (
                      <>
                        <td className="py-3 px-2.5 text-right font-mono-numbers text-slate-600 whitespace-nowrap">
                          {formatCurrency(p.unitCost)}
                        </td>
                        <td className="py-3 px-2.5 text-right font-mono-numbers font-semibold text-slate-700 whitespace-nowrap">
                          {formatCurrency(calc.fardoCost)}
                        </td>
                      </>
                    )}

                    {/* Vlr Venda (Atacado un) */}
                    <td className="py-3 px-2.5 text-right font-mono-numbers font-bold text-slate-800 whitespace-nowrap">
                          {formatCurrency(calc.unitSalePrice)}
                    </td>

                    {/* Cliente Fardo */}
                    <td className="py-3 px-3 text-right font-mono-numbers font-black text-orange-800 bg-orange-50/50 whitespace-nowrap text-sm">
                      {formatCurrency(calc.fardoClientPrice)}
                    </td>

                    {/* Lucro */}
                    {!clientViewOnly && (
                      <td className="py-3 px-2.5 text-right font-mono-numbers font-bold text-orange-600 whitespace-nowrap">
                        +{formatCurrency(calc.distributorProfit)}
                      </td>
                    )}

                    {/* Sugestão Consumidor Final */}
                    <td className="py-3 px-3 text-right font-mono-numbers font-black text-blue-800 bg-blue-50/40 whitespace-nowrap text-sm">
                      {formatCurrency(calc.consumerUnitPrice)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-2.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditProduct(p)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                          title="Editar produto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={clientViewOnly ? 7 : 10} className="py-8 text-center text-slate-400">
                    Nenhum produto encontrado com o filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Export & Sharing Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-orange-100 space-y-3">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          Exportar & Compartilhar Tabela de Preços
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleShareWhatsApp(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar Tabela WhatsApp</span>
          </button>

          <button
            onClick={() => handleCopyText(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {copiedQuote ? (
              <>
                <Check className="w-4 h-4 text-orange-600" />
                <span className="text-orange-700 font-semibold">Tabela Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Texto Formatado</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
          <span>{products.length} itens cadastrados</span>
          <button
            onClick={onResetToDemo}
            className="text-slate-500 hover:text-orange-700 underline transition cursor-pointer"
          >
            Restaurar os 46 produtos originais da tabela
          </button>
        </div>
      </div>

      {/* Batch Margins Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 text-slate-800">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Atualizar Margens de Todos os Produtos
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Aplica uma nova margem de ganho para todos os itens cadastrados de uma só vez.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Margem de Ganho Atacado (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={batchMargin}
                    onChange={(e) => setBatchMargin(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {formatMultiplier(1 + batchMargin / 100)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Margem Sugestão Consumidor (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={batchClientMargin}
                    onChange={(e) => setBatchClientMargin(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {formatMultiplier(1 + batchClientMargin / 100)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowBatchModal(false)}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onBatchUpdateMargins(batchMargin, batchClientMargin);
                  setShowBatchModal(false);
                }}
                className="py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition cursor-pointer"
              >
                Aplicar a Todos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
