import { useCallback, useEffect, useRef, useState } from 'react';
import type { GlobalSettings, Product } from '../types/pricing';
import { DEFAULT_SETTINGS } from '../utils/pricing';
import { clearLocalCache } from '../utils/storage';
import {
  ApiError,
  clearStoredPassword,
  fetchDb,
  getStoredPassword,
  saveDb,
  setStoredPassword,
  type RemoteDb,
} from '../services/api';

export type SyncStatus = 'login' | 'loading' | 'saving' | 'saved' | 'offline' | 'error';

interface Snapshot {
  products: Product[];
  settings: GlobalSettings;
}

interface Options extends Snapshot {
  onRemoteData: (data: Snapshot) => void;
}

const AUTO_SAVE_DELAY_MS = 1000;
const BACKGROUND_REFRESH_MS = 30_000;

const serialize = (products: Product[], settings: GlobalSettings) => JSON.stringify({ products, settings });

function normalize(remote: RemoteDb): Snapshot {
  return {
    products: Array.isArray(remote.products) ? remote.products : [],
    settings: { ...DEFAULT_SETTINGS, ...(remote.settings || {}) },
  };
}

/**
 * Mantém produtos + configurações sincronizados com o arquivo JSON na nuvem
 * (via /api/db): carrega ao abrir, salva sozinho após editar e atualiza ao
 * voltar para o app. Última gravação vence.
 */
export function useCloudSync({ products, settings, onRemoteData }: Options) {
  const [status, setStatus] = useState<SyncStatus>(getStoredPassword() ? 'loading' : 'login');
  const [message, setMessage] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const latest = useRef<Snapshot>({ products, settings });
  latest.current = { products, settings };

  const onRemoteRef = useRef(onRemoteData);
  onRemoteRef.current = onRemoteData;

  const hydrated = useRef(false); // já carregamos o estado da nuvem?
  const lastSavedJson = useRef(''); // último estado que sabemos estar salvo
  const remoteSavedAt = useRef(0);
  const lastFetchAt = useRef(0);
  const saving = useRef(false);
  const pendingSave = useRef(false);
  const touchedBeforeLoad = useRef(false);
  const initialJson = useRef(serialize(products, settings));

  const hasUnsavedChanges = () => serialize(latest.current.products, latest.current.settings) !== lastSavedJson.current;

  const handleError = useCallback((error: unknown, silent = false) => {
    if (error instanceof ApiError && error.status === 401) {
      clearStoredPassword();
      hydrated.current = false;
      setStatus('login');
      setMessage('Senha incorreta.');
      return;
    }
    if (silent) return;
    if (error instanceof ApiError && error.status === 0) {
      setStatus('offline');
      setMessage('Sem conexão. Suas alterações ficam neste aparelho até a conexão voltar.');
      return;
    }
    setStatus('error');
    setMessage(error instanceof Error ? error.message : 'Erro ao sincronizar com o servidor.');
  }, []);

  const save = useCallback(
    async (keepalive = false) => {
      if (!hydrated.current || !getStoredPassword()) return;
      if (saving.current) {
        pendingSave.current = true;
        return;
      }

      const { products: prods, settings: sets } = latest.current;
      const json = serialize(prods, sets);
      if (json === lastSavedJson.current) return;

      saving.current = true;
      setStatus('saving');
      try {
        const result = await saveDb({ products: prods, settings: sets }, keepalive);
        lastSavedJson.current = json;
        remoteSavedAt.current = result.savedAt;
        setLastSyncAt(Date.now());
        setStatus('saved');
        setMessage(null);
      } catch (error) {
        handleError(error);
      } finally {
        saving.current = false;
        if (pendingSave.current) {
          pendingSave.current = false;
          void save();
        }
      }
    },
    [handleError]
  );

  const load = useCallback(
    async (silent = false) => {
      if (!getStoredPassword()) {
        setStatus('login');
        return;
      }
      if (!silent) {
        setStatus('loading');
        setMessage(null);
      }

      try {
        const { data } = await fetchDb();
        lastFetchAt.current = Date.now();

        if (!data) {
          // Arquivo ainda vazio: guarda na nuvem o que já existe neste aparelho.
          hydrated.current = true;
          lastSavedJson.current = '';
          touchedBeforeLoad.current = false;
          await save();
          return;
        }

        if (silent && data.savedAt === remoteSavedAt.current) return; // nada novo

        const remote = normalize(data);

        if (!hydrated.current && touchedBeforeLoad.current) {
          const keepLocal = window.confirm(
            'Você fez alterações neste aparelho antes de conectar à nuvem.\n\nOK = enviar essas alterações para a nuvem (substitui o que está lá)\nCancelar = descartar e carregar o que está salvo na nuvem'
          );
          if (keepLocal) {
            hydrated.current = true;
            touchedBeforeLoad.current = false;
            lastSavedJson.current = '';
            remoteSavedAt.current = data.savedAt;
            await save();
            return;
          }
        }

        lastSavedJson.current = serialize(remote.products, remote.settings);
        remoteSavedAt.current = data.savedAt;
        onRemoteRef.current(remote);
        hydrated.current = true;
        touchedBeforeLoad.current = false;
        setLastSyncAt(Date.now());
        setStatus('saved');
        setMessage(
          silent
            ? 'Atualizado com alterações feitas em outro aparelho.'
            : `${remote.products.length} produtos carregados da nuvem.`
        );
      } catch (error) {
        handleError(error, silent);
      }
    },
    [handleError, save]
  );

  // Carrega ao abrir o app.
  useEffect(() => {
    if (getStoredPassword()) void load();
  }, []);

  // Alterações feitas antes de a nuvem responder não podem ser perdidas em silêncio.
  useEffect(() => {
    if (!hydrated.current && serialize(products, settings) !== initialJson.current) {
      touchedBeforeLoad.current = true;
    }
  }, [products, settings]);

  // Salva sozinho, 1s depois da última edição.
  useEffect(() => {
    if (!hydrated.current) return;
    if (serialize(products, settings) === lastSavedJson.current) return;
    const timer = setTimeout(() => void save(), AUTO_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [products, settings, save]);

  // Ao sair do app, envia o que faltar; ao voltar, busca mudanças de outros aparelhos.
  useEffect(() => {
    const onVisibility = () => {
      if (!hydrated.current) return;
      if (document.visibilityState === 'hidden') {
        if (hasUnsavedChanges()) void save(true);
      } else if (!hasUnsavedChanges() && Date.now() - lastFetchAt.current > BACKGROUND_REFRESH_MS) {
        void load(true);
      }
    };
    // Voltou a internet: tenta de novo o que ficou pendente.
    const onOnline = () => {
      if (!getStoredPassword()) return;
      if (!hydrated.current) void load();
      else if (hasUnsavedChanges()) void save();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
    };
  }, [save, load]);

  const login = useCallback(
    async (password: string) => {
      setLoggingIn(true);
      setStoredPassword(password);
      try {
        await load();
      } finally {
        setLoggingIn(false);
      }
    },
    [load]
  );

  const logout = useCallback(() => {
    clearStoredPassword();
    clearLocalCache(); // não deixa a tabela de preços no aparelho depois de sair
    window.location.reload();
  }, []);

  // Botão "Sincronizar": envia o que estiver pendente; senão, busca a versão mais recente da nuvem.
  const syncNow = useCallback(() => {
    if (hydrated.current && hasUnsavedChanges()) {
      void save();
    } else {
      void load();
    }
  }, [save, load]);

  return { status, message, lastSyncAt, loggingIn, login, logout, syncNow };
}
