import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // If already installed as PWA or user dismissed
  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white px-3.5 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs md:text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
            <Smartphone className="w-4 h-4 text-orange-100" />
          </div>
          <div className="truncate">
            <p className="font-semibold text-white truncate flex items-center gap-1.5">
              <span>Instalar no Celular</span>
              <span className="bg-orange-400/30 border border-orange-300/40 text-[10px] font-mono px-1.5 py-0.5 rounded text-white">App / PWA</span>
            </p>
            <p className="text-orange-100/90 text-[11px] truncate">
              Abra direto na tela inicial, 100% offline e rápido!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isInstallable ? (
            <button
              onClick={install}
              className="bg-white text-orange-700 font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-orange-50 active:scale-95 transition-all flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-orange-600" />
              <span>Instalar</span>
            </button>
          ) : (
            <button
              onClick={() => setShowGuide(true)}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-medium px-2.5 py-1.5 rounded-lg text-xs cursor-pointer active:scale-95 transition"
            >
              Como Instalar
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            aria-label="Fechar aviso"
            className="p-1 rounded-md text-orange-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-800 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Instalar no seu Celular</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAndroid || !isIOS ? (
              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 text-sm">No Google Chrome (Android):</p>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Toque no botão de <strong>três pontos (⋮)</strong> no canto superior direito do navegador.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Pronto! O ícone do app ficará disponível junto aos seus apps do celular.</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 text-sm">No Safari (iPhone/iPad):</p>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <Share2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <PlusSquare className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-98 transition cursor-pointer"
            >
              Entendi, fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
