import React, { useState } from 'react';
import { Package, Lock, Loader2 } from 'lucide-react';

interface LoginGateProps {
  message: string | null;
  isLoading: boolean;
  onLogin: (password: string) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ message, isLoading, onLogin }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!password || isLoading) return;
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-orange-100 shadow-md p-6">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-xs mb-3">
            <Package className="w-7 h-7" />
          </div>
          <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">Calculo de produtos</h1>
          <p className="text-xs text-slate-500 mt-1">Digite a senha para acessar sua tabela de preços.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {message && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={!password || isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-sm font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
