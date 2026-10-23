import React, { useState } from 'react';
import { GlobalSettings, Product } from '../types/pricing';
import {
  X,
  Check,
  Settings,
  RotateCcw,
  Download,
  Upload,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GlobalSettings;
  products: Product[];
  onClose: () => void;
  onSaveSettings: (settings: GlobalSettings) => void;
  onResetProducts: () => void;
  onImportProducts: (products: Product[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  products,
  onClose,
  onSaveSettings,
  onResetProducts,
  onImportProducts,
}) => {
  const [defaultMargin, setDefaultMargin] = useState(settings.defaultMarginPercent);
  const [defaultClientMargin, setDefaultClientMargin] = useState(settings.defaultClientMarginPercent);
  const [mode, setMode] = useState<'percent' | 'multiplier'>(settings.marginInputMode);
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [activeTab, setActiveTab] = useState<'settings' | 'formulas'>('settings');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      defaultMarginPercent: defaultMargin,
      defaultClientMarginPercent: defaultClientMargin,
      marginInputMode: mode,
      companyName,
    });
    onClose();
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `calculo_produtos_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportProducts(imported);
          alert('Produtos importados com sucesso!');
        }
      } catch (err) {
        alert('Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-auto">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-base">Configurações & Fórmulas</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 text-center transition cursor-pointer ${
              activeTab === 'settings'
                ? 'border-b-2 border-orange-600 text-orange-800 bg-white font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ajustes Padrão
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex-1 py-2.5 text-center transition cursor-pointer ${
              activeTab === 'formulas'
                ? 'border-b-2 border-orange-600 text-orange-800 bg-white font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Como Funciona o Cálculo
          </button>
        </div>

        {activeTab === 'settings' ? (
          <form onSubmit={handleSave} className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nome do Negócio / Título
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Calculo de produtos"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Margem Padrão Atacado (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={defaultMargin}
                  onChange={(e) => setDefaultMargin(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  Padrão PDF: 45% = 1,45x
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Margem Sugestão Cliente (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={defaultClientMargin}
                  onChange={(e) => setDefaultClientMargin(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  Padrão PDF: 40% = 1,40x
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Modo de Entrada Preferido
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('percent')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                    mode === 'percent'
                      ? 'border-orange-600 bg-orange-50 text-orange-800'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  % Porcentagem (Ex: 45%)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('multiplier')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                    mode === 'multiplier'
                      ? 'border-orange-600 bg-orange-50 text-orange-800'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  Multiplicador (Ex: 1,45x)
                </button>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="block text-xs font-bold text-slate-700 uppercase">
                Backup
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Dados</span>
                </button>

                <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar Dados</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente restaurar os 46 produtos originais da tabela do PDF?')) {
                    onResetProducts();
                    onClose();
                  }
                }}
                className="w-full text-xs text-red-600 hover:text-red-700 font-semibold py-1.5 flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar os 46 Produtos Originais da Tabela</span>
              </button>
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
                <span>Salvar Configurações</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 space-y-3 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-orange-950 space-y-1">
              <h4 className="font-bold text-sm text-orange-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-orange-700" />
                Entendendo os Cálculos da Tabela
              </h4>
              <p className="text-[11px] text-orange-800 leading-relaxed">
                Este app reproduz exatamente a matemática da sua tabela de fardos e caixas:
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900">1. Custo do Fardo/Caixa</p>
              <p className="font-mono text-orange-700 bg-white p-1.5 rounded border border-slate-200">
                Custo Fardo = Custo Unitário × Quantidade
              </p>
              <p className="text-[11px] text-slate-500">
                Exemplo: R$ 2,20 × 10 unidades = R$ 22,00.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900">2. Preço de Venda Unitário (Vlr Venda)</p>
              <p className="font-mono text-orange-700 bg-white p-1.5 rounded border border-slate-200">
                Vlr Venda = Custo Unitário × 1,45 (45% de margem)
              </p>
              <p className="text-[11px] text-slate-500">
                Exemplo: R$ 2,20 × 1,45 = R$ 3,19.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900">3. Valor do Fardo para o Cliente (Cliente Fardo)</p>
              <p className="font-mono text-orange-700 bg-white p-1.5 rounded border border-slate-200">
                Cliente Fardo = Vlr Venda × Quantidade
              </p>
              <p className="text-[11px] text-slate-500">
                Exemplo: R$ 3,19 × 10 unidades = R$ 31,90.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900">4. Seu Lucro no Fardo</p>
              <p className="font-mono text-orange-700 bg-white p-1.5 rounded border border-slate-200">
                Lucro = Cliente Fardo - Custo Fardo
              </p>
              <p className="text-[11px] text-slate-500">
                Exemplo: R$ 31,90 - R$ 22,00 = R$ 9,90 de lucro por fardo.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900">5. Sugestão Consumidor Final (Varejo do Cliente)</p>
              <p className="font-mono text-blue-700 bg-white p-1.5 rounded border border-slate-200">
                Consumidor = Vlr Venda × 1,40 (40% de margem)
              </p>
              <p className="text-[11px] text-slate-500">
                Exemplo: R$ 3,19 × 1,40 = R$ 4,47 por unidade no balcão.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              className="w-full mt-2 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
            >
              Voltar para Configurações
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
