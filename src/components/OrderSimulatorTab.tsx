import React, { useState } from 'react';
import { Customer, Product, GlobalSettings } from '../types/pricing';
import {
  calculatePricing,
  formatCurrency,
} from '../utils/pricing';
import {
  ShoppingCart,
  Plus,
  Minus,
  Share2,
  Receipt,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

interface OrderSimulatorTabProps {
  products: Product[];
  settings: GlobalSettings;
  customers: Customer[];
}

export const OrderSimulatorTab: React.FC<OrderSimulatorTabProps> = ({
  products,
  settings,
  customers,
}) => {
  // Map of productId -> quantity of fardos/boxes
  const [cart, setCart] = useState<Record<string, number>>({});
  const [clientName, setClientName] = useState('');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const setDirectQuantity = (productId: string, qty: number) => {
    setCart((prev) => {
      const next = Math.max(0, qty);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  // Cart summary calculations
  const items = Object.entries(cart).map(([pId, qty]) => {
    const product = products.find((p) => p.id === pId);
    if (!product) return null;
    const calc = calculatePricing(product.unitCost, product.quantity, product.marginPercent, product.clientMarginPercent);
    return {
      product,
      qty,
      calc,
      totalCost: calc.fardoCost * qty,
      totalSale: calc.fardoClientPrice * qty,
      totalProfit: calc.distributorProfit * qty,
      totalRetailRevenue: calc.clientTotalRevenue * qty,
      totalClientProfit: calc.clientProfitPerFardo * qty,
    };
  }).filter(Boolean) as Array<{
    product: Product;
    qty: number;
    calc: ReturnType<typeof calculatePricing>;
    totalCost: number;
    totalSale: number;
    totalProfit: number;
    totalRetailRevenue: number;
    totalClientProfit: number;
  }>;

  const totalFardos = items.reduce((acc, curr) => acc + curr.qty, 0);
  const totalSale = items.reduce((acc, curr) => acc + curr.totalSale, 0);
  const totalProfit = items.reduce((acc, curr) => acc + curr.totalProfit, 0);
  const totalRetailRevenue = items.reduce((acc, curr) => acc + curr.totalRetailRevenue, 0);
  const totalClientProfit = items.reduce((acc, curr) => acc + curr.totalClientProfit, 0);

  const generateWhatsAppOrder = () => {
    const clientStr = clientName.trim() ? ` para *${clientName.trim()}*` : '';
    let msg = `🛒 *PEDIDO DE PRODUTOS & FARDOS*${clientStr}\n`;
    msg += `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;

    items.forEach((item) => {
      msg += `▪️ *${item.qty}x ${item.product.unitType}* ${item.product.name}\n`;
      msg += `   ${item.qty} un × ${formatCurrency(item.calc.fardoClientPrice)} = *${formatCurrency(item.totalSale)}*\n`;
      msg += `   Sugestão venda unitária: ${formatCurrency(item.calc.consumerUnitPrice)}\n\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📦 *Total de Fardos/Caixas:* ${totalFardos}\n`;
    msg += `💰 *VALOR TOTAL DO PEDIDO: ${formatCurrency(totalSale)}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `🏪 *Projeção de Lucro para o Comerciante:*\n`;
    msg += `• Faturamento estimado no balcão: ${formatCurrency(totalRetailRevenue)}\n`;
    msg += `• *Lucro líquido do lojista: ${formatCurrency(totalClientProfit)}*\n\n`;
    msg += `Obrigado pela preferência!`;

    return msg;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppOrder());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-20 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0 lg:pb-8">
      {/* Top Card */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-orange-100 lg:col-span-2 lg:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Simulador de Pedido & Cotação
              </h2>
              <p className="text-xs text-slate-500">
                Monte pedidos de múltiplos fardos e envie a cotação pronta
              </p>
            </div>
          </div>

          {totalFardos > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="order-client-name" className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Nome do Cliente / Estabelecimento (Opcional)
          </label>
          <input
            id="order-client-name"
            type="text"
            list="registered-order-customers"
            autoComplete="off"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder={customers.length ? 'Digite ou selecione um cliente cadastrado...' : 'Ex: Mercearia do João, Bar da Esquina...'}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
          />
          <datalist id="registered-order-customers">
            {customers.map((customer) => (
              <option key={customer.id} value={customer.name}>
                {customer.cnpj}
              </option>
            ))}
          </datalist>
          {customers.length > 0 && (
            <p className="mt-1 text-[10px] text-slate-500">
              Comece a digitar para escolher entre {customers.length} {customers.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}.
            </p>
          )}
        </div>
      </div>

      {/* Selected Items Summary / Checkout Card */}
      {items.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-sm text-slate-100">Resumo da Cotação</span>
            </div>
            <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono-numbers px-2 py-0.5 rounded-full font-bold">
              {totalFardos} {totalFardos === 1 ? 'fardo' : 'fardos'}
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-slate-200 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {item.qty}x {item.product.unitType} ({formatCurrency(item.calc.fardoClientPrice)} cada)
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono-numbers font-bold text-orange-400 text-sm">
                    {formatCurrency(item.totalSale)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total do Pedido</span>
              <span className="font-mono-numbers font-black text-xl text-white">
                {formatCurrency(totalSale)}
              </span>
            </div>

            <div className="bg-orange-950/50 rounded-xl p-2.5 border border-orange-800/50">
              <span className="text-[10px] text-orange-300 block uppercase font-bold">Seu Lucro Bruto</span>
              <span className="font-mono-numbers font-black text-xl text-orange-400">
                +{formatCurrency(totalProfit)}
              </span>
            </div>
          </div>

          {/* Value proposition for customer */}
          <div className="bg-blue-950/40 rounded-xl p-2.5 border border-blue-900/50 text-[11px] text-blue-200">
            <div className="flex items-center justify-between font-semibold mb-0.5">
              <span>Projeção para o Comerciante:</span>
              <span className="font-mono-numbers font-bold text-orange-300">
                +{formatCurrency(totalClientProfit)} lucro
              </span>
            </div>
            <p className="text-[10px] text-blue-300/80">
              Ele investe {formatCurrency(totalSale)} e fatura {formatCurrency(totalRetailRevenue)} no balcão.
            </p>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-98 cursor-pointer text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar Pedido pelo WhatsApp</span>
          </button>
          <button
            onClick={() => setIsReceiptOpen(true)}
            className="w-full bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Recibo em PDF</span>
          </button>
        </div>
      )}

      {/* Product Selection List */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-orange-100 space-y-3">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          Selecione os Produtos da Tabela
        </h3>

        <div className="space-y-2">
          {products.map((p) => {
            const calc = calculatePricing(p.unitCost, p.quantity, p.marginPercent, p.clientMarginPercent);
            const currentQty = cart[p.id] || 0;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border transition-all ${
                  currentQty > 0
                    ? 'border-orange-300 bg-orange-50/40'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                        {p.cod}
                      </span>
                      <span className="font-bold text-slate-900 text-xs md:text-sm">
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                      <span>{p.unitType} c/ {p.quantity} un</span>
                      <span>•</span>
                      <span className="font-mono-numbers font-bold text-orange-700">
                        {formatCurrency(calc.fardoClientPrice)} /{p.unitType.toLowerCase()}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">
                        Varejo: {formatCurrency(calc.consumerUnitPrice)}/un
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {currentQty > 0 ? (
                      <div className="flex items-center gap-1 bg-white border border-orange-300 rounded-xl p-1 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(p.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQty}
                          onChange={(e) => setDirectQuantity(p.id, parseInt(e.target.value) || 0)}
                          className="w-10 text-center font-mono-numbers font-bold text-xs text-slate-900 outline-none"
                        />
                        <button
                          onClick={() => updateQuantity(p.id, 1)}
                          className="w-7 h-7 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateQuantity(p.id, 1)}
                        className="bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-800 border border-slate-200 hover:border-orange-300 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isReceiptOpen && (
        <ReceiptModal
          items={items.map((item) => ({
            code: item.product.cod,
            name: item.product.name,
            quantity: item.qty,
            unitType: item.product.unitType,
            unitPrice: item.calc.fardoClientPrice,
            total: item.totalSale,
          }))}
          total={totalSale}
          clientName={clientName}
          settings={settings}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}
    </div>
  );
};
