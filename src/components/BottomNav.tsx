import React from 'react';
import { Calculator, FileSpreadsheet, ShoppingCart } from 'lucide-react';

export type ActiveTab = 'calculator' | 'table' | 'order' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  productCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  productCount,
}) => {
  const tabs = [
    {
      id: 'calculator' as ActiveTab,
      label: 'Calculadora',
      icon: Calculator,
      badge: null,
    },
    {
      id: 'table' as ActiveTab,
      label: 'Tabela Preços',
      icon: FileSpreadsheet,
      badge: productCount,
    },
    {
      id: 'order' as ActiveTab,
      label: 'Simular Pedido',
      icon: ShoppingCart,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-100 py-1.5 px-3 shadow-lg max-w-2xl mx-auto pb-safe lg:sticky lg:top-[68px] lg:bottom-auto lg:max-w-7xl lg:w-full lg:bg-transparent lg:backdrop-blur-0 lg:border-0 lg:px-4 lg:py-0 lg:shadow-none">
      <div className="grid grid-cols-3 gap-1 lg:flex lg:justify-start lg:gap-2 lg:rounded-b-2xl lg:border-x lg:border-b lg:border-orange-100 lg:bg-white lg:px-4 lg:py-2 lg:shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer lg:flex-row lg:gap-2 lg:px-4 lg:py-2.5 ${
                isActive
                  ? 'text-orange-600 font-bold bg-orange-50/80'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-orange-600' : ''}`} />
                {tab.badge !== null && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[9px] font-mono font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight lg:mt-0 lg:text-sm ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
