import React, { useState } from 'react';
import { Smartphone, Download, Share2, Copy, Check, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`📱 Acesse o aplicativo *Calculo de produtos*:\n${appUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-auto text-slate-800">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-white" />
            <h3 className="font-bold text-base">Instalar no celular</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 text-xs">
          {isInstallable && (
            <button
              onClick={() => void install()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 px-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Instalar aplicativo</span>
            </button>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-[11px] text-slate-600 leading-relaxed">
            <p>
              <strong className="text-slate-900">Android (Chrome):</strong> toque nos 3 pontinhos (⋮) e em{' '}
              <strong>"Instalar aplicativo"</strong>.
            </p>
            <p>
              <strong className="text-slate-900">iPhone (Safari):</strong> toque em Compartilhar e em{' '}
              <strong>"Adicionar à Tela de Início"</strong>.
            </p>
            <p>Depois de instalado, ele abre como um app e seus dados ficam sincronizados na nuvem.</p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-2 px-2 rounded-xl flex items-center justify-center gap-1 text-[11px] transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-orange-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link copiado' : 'Copiar link'}</span>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-2 rounded-xl flex items-center justify-center gap-1 text-[11px] transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Enviar no WhatsApp</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
