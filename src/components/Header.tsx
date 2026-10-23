import React from 'react';
import { Package, Settings, Plus, Smartphone } from 'lucide-react';
import { GlobalSettings } from '../types/pricing';

interface HeaderProps {
  settings: GlobalSettings;
  productCount: number;
  onOpenSettings: () => void;
  onOpenNewProduct: () => void;
  onOpenInstall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  productCount,
  onOpenSettings,
  onOpenNewProduct,
  onOpenInstall,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 px-4 py-3 shadow-2xs">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="truncate">
            <h1 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight truncate flex items-center gap-1.5">
              <span>Calculo de produtos</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
              <span>{settings.companyName || 'Atacado & Distribuição'}</span>
              <span aria-hidden="true">·</span>
              <span>{productCount} itens cadastrados</span>
            </p>
          </div>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenInstall}
            className="p-2 text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition cursor-pointer flex items-center gap-1"
            title="Instalar no Celular / APK"
            aria-label="Instalar no celular"
          >
            <Smartphone className="w-4 h-4 text-orange-600" />
            <span className="hidden sm:inline text-xs font-bold">Instalar</span>
          </button>

          <button
            onClick={onOpenNewProduct}
            className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Novo produto"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-orange-50 rounded-xl transition cursor-pointer border border-slate-200"
            title="Configurações e fórmulas"
            aria-label="Abrir configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
