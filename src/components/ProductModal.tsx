import React, { useState, useEffect } from 'react';
import { Product, GlobalSettings } from '../types/pricing';
import {
  calculatePricing,
  formatCurrency,
  formatMultiplier,
} from '../utils/pricing';
import { X, Check, Package } from 'lucide-react';

interface ProductModalProps {
  productToEdit?: Product | null;
  settings: GlobalSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  productToEdit,
  settings,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [cod, setCod] = useState('');
  const [unitType, setUnitType] = useState('Fardo');
  const [quantity, setQuantity] = useState<number | string>(10);
  const [unitCost, setUnitCost] = useState<number | string>('2.20');
  const [marginPercent, setMarginPercent] = useState<number | string>(settings.defaultMarginPercent);
  const [clientMarginPercent, setClientMarginPercent] = useState<number | string>(settings.defaultClientMarginPercent);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCod(productToEdit.cod);
      setUnitType(productToEdit.unitType);
      setQuantity(productToEdit.quantity);
      setUnitCost(productToEdit.unitCost);
      setMarginPercent(productToEdit.marginPercent);
      setClientMarginPercent(productToEdit.clientMarginPercent);
      setCategory(productToEdit.category || '');
    } else {
      setName('');
      setCod(String(Math.floor(1000 + Math.random() * 9000)));
      setUnitType('Fardo');
      setQuantity(10);
      setUnitCost('2.20');
      setMarginPercent(settings.defaultMarginPercent);
      setClientMarginPercent(settings.defaultClientMarginPercent);
      setCategory('');
    }
  }, [productToEdit, isOpen, settings]);

  if (!isOpen) return null;

  const numCost = typeof unitCost === 'number' ? unitCost : parseFloat(String(unitCost).replace(',', '.')) || 0;
  const numQty = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10) || 1;
  const numMargin = typeof marginPercent === 'number' ? marginPercent : parseFloat(String(marginPercent).replace(',', '.')) || 0;
  const numClientMargin = typeof clientMarginPercent === 'number' ? clientMarginPercent : parseFloat(String(clientMarginPercent).replace(',', '.')) || 0;

  const calc = calculatePricing(numCost, numQty, numMargin, numClientMargin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedProduct: Product = {
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
      cod: cod.trim() || 'S/N',
      name: name.trim().toUpperCase(),
      unitType,
      quantity: numQty,
      unitCost: numCost,
      marginPercent: numMargin,
      clientMarginPercent: numClientMargin,
      category: category.trim() || undefined,
      updatedAt: Date.now(),
    };

    onSave(savedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-auto">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-base">
              {productToEdit ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Code and Category */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Código (COD)
              </label>
              <input
                type="text"
                required
                value={cod}
                onChange={(e) => setCod(e.target.value)}
                placeholder="4228"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Categoria (Opcional)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Snacks, Doces"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Nome do Produto / Descrição
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: SNACK 10X70G BACON"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Unit Type and Quantity */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Embalagem (UND)
              </label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
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

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Qtd no Fardo (QUANT)
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm font-mono-numbers font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Purchase Cost */}
          <div className="bg-orange-50/70 p-3 rounded-xl border border-orange-200">
            <label className="block text-[11px] font-bold text-orange-950 uppercase mb-1">
              Custo de Compra Unitário (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="2,20"
                className="w-full bg-white border border-orange-300 rounded-xl pl-9 pr-3 py-2 text-sm font-mono-numbers font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <span className="text-[10px] text-orange-800 mt-1 block">
              Custo total do {unitType}: <strong>{formatCurrency(calc.fardoCost)}</strong>
            </span>
          </div>

          {/* Margins */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
              <label className="block text-[10px] font-bold text-amber-950 uppercase mb-0.5">
                Margem Atacado (%)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-amber-950"
                />
                <span className="text-[10px] font-mono text-amber-800 font-bold">%</span>
              </div>
              <span className="text-[9px] text-amber-800 block mt-1 font-mono">
                Mult: {formatMultiplier(calc.distributorMarkup)}
              </span>
            </div>

            <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200">
              <label className="block text-[10px] font-bold text-blue-950 uppercase mb-0.5">
                Margem Cliente (%)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={clientMarginPercent}
                  onChange={(e) => setClientMarginPercent(e.target.value)}
                  className="w-full bg-white border border-blue-300 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-blue-950"
                />
                <span className="text-[10px] font-mono text-blue-800 font-bold">%</span>
              </div>
              <span className="text-[9px] text-blue-800 block mt-1 font-mono">
                Mult: {formatMultiplier(calc.clientMarkup)}
              </span>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Venda Unitária Atacado:</span>
              <span className="font-mono-numbers font-bold text-slate-800">{formatCurrency(calc.unitSalePrice)}</span>
            </div>
            <div className="flex items-center justify-between text-orange-800 font-bold bg-white p-2 rounded-lg border border-orange-200">
              <span>Preço do {unitType} (Cliente):</span>
              <span className="font-mono-numbers text-base font-black">{formatCurrency(calc.fardoClientPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-orange-700">
              <span>Seu Lucro no {unitType}:</span>
              <span className="font-mono-numbers font-bold">+{formatCurrency(calc.distributorProfit)}</span>
            </div>
            <div className="flex items-center justify-between text-blue-800 pt-1 border-t border-slate-200">
              <span>Sugestão Consumidor:</span>
              <span className="font-mono-numbers font-black">{formatCurrency(calc.consumerUnitPrice)} /un</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{productToEdit ? 'Salvar Alterações' : 'Adicionar Produto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
