import type { Customer, GlobalSettings, Product } from '../types/pricing';

const PASSWORD_KEY = 'calculo_produtos_app_password_v1';

export class ApiError extends Error {
  status: number; // 0 = sem conexão
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface RemoteDb {
  version: number;
  savedAt: number;
  products: Product[];
  settings: Partial<GlobalSettings>;
  customers?: Customer[];
}

export function getStoredPassword(): string | null {
  try {
    return localStorage.getItem(PASSWORD_KEY);
  } catch {
    return null;
  }
}

export function setStoredPassword(password: string): void {
  try {
    localStorage.setItem(PASSWORD_KEY, password);
  } catch (e) {
    console.error('Não foi possível guardar a senha:', e);
  }
}

export function clearStoredPassword(): void {
  try {
    localStorage.removeItem(PASSWORD_KEY);
  } catch {
    /* ignora */
  }
}

async function request<T>(method: 'GET' | 'PUT', body?: unknown, keepalive = false): Promise<T> {
  let response: Response;
  try {
    response = await fetch('/api/db', {
      method,
      headers: {
        'Content-Type': 'application/json',
        // encodeURIComponent: cabeçalhos HTTP não aceitam acentos
        'x-app-password': encodeURIComponent(getStoredPassword() ?? ''),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      keepalive,
    });
  } catch {
    throw new ApiError(0, 'Sem conexão com o servidor.');
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, payload?.error || `Erro ${response.status} ao falar com o servidor.`);
  }
  return payload as T;
}

export async function fetchDb(): Promise<{ data: RemoteDb | null }> {
  return request('GET');
}

export async function saveDb(
  payload: { products: Product[]; settings: GlobalSettings; customers?: Customer[] },
  keepalive = false
): Promise<{ savedAt: number }> {
  return request('PUT', payload, keepalive);
}
