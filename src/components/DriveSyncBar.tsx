import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import type { SyncStatus } from '../hooks/useDriveSync';

interface DriveSyncBarProps {
  status: SyncStatus;
  message: string | null;
  lastSyncAt: number | null;
  onSync: () => void;
  onLogout: () => void;
}

const formatTime = (timestamp: number | null) =>
  timestamp ? new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;

export const DriveSyncBar: React.FC<DriveSyncBarProps> = ({ status, message, lastSyncAt, onSync, onLogout }) => {
  const busy = status === 'loading' || status === 'saving';
  const time = formatTime(lastSyncAt);
  const showMessage = (status === 'error' || status === 'offline') && message;

  const label = {
    login: 'Desconectado',
    loading: 'Carregando do Drive...',
    saving: 'Salvando no Drive...',
    saved: time ? `Sincronizado às ${time}` : 'Sincronizado',
    offline: 'Sem conexão',
    error: 'Erro ao sincronizar',
  }[status];

  const tone =
    status === 'error' ? 'text-rose-600' : status === 'offline' ? 'text-amber-600' : status === 'saved' ? 'text-emerald-600' : 'text-orange-600';

  const Icon = busy ? RefreshCw : status === 'error' ? AlertCircle : status === 'offline' ? CloudOff : status === 'saved' ? CheckCircle2 : Cloud;

  return (
    <div className="bg-white rounded-2xl border border-orange-100 shadow-xs mb-3.5 overflow-hidden">
      <div className="p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-600">
            <Cloud className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">Banco de dados no Google Drive</p>
            <p className={`text-[11px] font-semibold flex items-center gap-1 ${tone}`}>
              <Icon className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
              <span className="truncate">{label}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onSync}
            disabled={busy}
            title="Sincronizar agora"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-medium border border-orange-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
          <button
            onClick={onLogout}
            title="Sair e limpar os dados deste aparelho"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showMessage && (
        <div className="px-3 pb-3">
          <p
            className={`text-xs rounded-xl px-3 py-2 border leading-snug ${
              status === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {message}
          </p>
        </div>
      )}
    </div>
  );
};
