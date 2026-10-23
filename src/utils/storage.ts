import { Product, GlobalSettings } from '../types/pricing';
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from './pricing';

// Cache local: abre o app na hora e serve de apoio sem internet.
// A fonte da verdade é o arquivo JSON na nuvem (via /api/db).
const PRODUCTS_STORAGE_KEY = 'calculo_produtos_list_v2';
const SETTINGS_STORAGE_KEY = 'calculo_produtos_settings_v2';

export function loadStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return INITIAL_PRODUCTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_PRODUCTS;
  } catch (error) {
    console.warn('Erro ao carregar produtos do localStorage:', error);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Erro ao salvar produtos no localStorage:', error);
  }
}

export function loadStoredSettings(): GlobalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (error) {
    console.warn('Erro ao carregar configurações do localStorage:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: GlobalSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Erro ao salvar configurações no localStorage:', error);
  }
}

export function resetToInitialProducts(): Product[] {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  } catch (e) {
    console.error(e);
  }
  return INITIAL_PRODUCTS;
}

export function clearLocalCache(): void {
  try {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch {
    /* ignora */
  }
}
