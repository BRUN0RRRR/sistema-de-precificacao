/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Customer, Product, GlobalSettings } from './types/pricing';
import {
  loadStoredProducts,
  saveStoredProducts,
  loadStoredSettings,
  saveStoredSettings,
  resetToInitialProducts,
  loadStoredCustomers,
  saveStoredCustomers,
} from './utils/storage';
import { useCloudSync } from './hooks/useCloudSync';
import { Header } from './components/Header';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { CalculatorTab } from './components/CalculatorTab';
import { ProductTableTab } from './components/ProductTableTab';
import { OrderSimulatorTab } from './components/OrderSimulatorTab';
import { ProductModal } from './components/ProductModal';
import { SettingsModal } from './components/SettingsModal';
import { CloudSyncBar } from './components/CloudSyncBar';
import { LoginGate } from './components/LoginGate';
import { InstallModal } from './components/InstallModal';
import { CustomersTab } from './components/CustomersTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [products, setProducts] = useState<Product[]>(() => loadStoredProducts());
  const [settings, setSettings] = useState<GlobalSettings>(() => loadStoredSettings());
  const [customers, setCustomers] = useState<Customer[]>(() => loadStoredCustomers());

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Banco de dados: arquivo JSON na nuvem (Vercel Blob), via /api/db
  const sync = useCloudSync({
    products,
    settings,
    customers,
    onRemoteData: (remote) => {
      setProducts(remote.products);
      setSettings(remote.settings);
      setCustomers(remote.customers);
    },
  });

  // Cache local (abre instantâneo e ajuda sem internet)
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredCustomers(customers);
  }, [customers]);

  // Product actions
  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const existsIndex = prev.findIndex((p) => p.id === product.id);
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = product;
        return next;
      }
      return [product, ...prev];
    });
  };

  const handleQuickSaveFromCalculator = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Deseja realmente remover este produto da tabela?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleNewProductClick = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleBatchUpdateMargins = (marginPercent: number, clientMarginPercent: number) => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        marginPercent,
        clientMarginPercent,
        updatedAt: Date.now(),
      }))
    );
  };

  const handleResetToDemo = () => {
    const original = resetToInitialProducts();
    setProducts(original);
  };

  const handleImportProducts = (imported: Product[]) => {
    setProducts(imported);
  };

  const handleSaveCustomer = (customer: Customer) => {
    setCustomers((current) => {
      const existingIndex = current.findIndex((item) => item.id === customer.id);
      if (existingIndex < 0) return [customer, ...current];
      return current.map((item) => item.id === customer.id ? customer : item);
    });
  };

  if (sync.status === 'login' || sync.loggingIn) {
    return <LoginGate message={sync.message} isLoading={sync.loggingIn} onLogin={sync.login} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans lg:bg-slate-50">
      {/* PWA Install Banner */}
      

      {/* Top Header */}
      <Header
        settings={settings}
        productCount={products.length}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenNewProduct={handleNewProductClick}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />

      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        productCount={products.length}
        customerCount={customers.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-3.5 sm:p-4 lg:max-w-7xl lg:px-8 lg:pt-6 lg:pb-10">
        {/* Banco de dados na nuvem */}
        <CloudSyncBar
          status={sync.status}
          message={sync.message}
          lastSyncAt={sync.lastSyncAt}
          onSync={sync.syncNow}
          onLogout={sync.logout}
        />

        {activeTab === 'calculator' && (
          <CalculatorTab
            settings={settings}
            onSaveProduct={handleQuickSaveFromCalculator}
            onNavigateToTable={() => setActiveTab('table')}
          />
        )}

        {activeTab === 'table' && (
          <ProductTableTab
            products={products}
            settings={settings}
            onEditProduct={handleEditProductClick}
            onDeleteProduct={handleDeleteProduct}
            onAddProductClick={handleNewProductClick}
            onBatchUpdateMargins={handleBatchUpdateMargins}
            onResetToDemo={handleResetToDemo}
          />
        )}

        {activeTab === 'order' && (
          <OrderSimulatorTab
            products={products}
            settings={settings}
            customers={customers}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersTab
            customers={customers}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={(id) => setCustomers((current) => current.filter((customer) => customer.id !== id))}
          />
        )}
      </main>

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        productToEdit={editingProduct}
        settings={settings}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        settings={settings}
        products={products}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveSettings={setSettings}
        onResetProducts={handleResetToDemo}
        onImportProducts={handleImportProducts}
      />

      {/* Install / APK Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
