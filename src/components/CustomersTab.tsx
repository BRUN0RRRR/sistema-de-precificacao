import React, { useMemo, useState } from 'react';
import type { Customer } from '../types/pricing';
import { Building2, Mail, MapPin, Pencil, Phone, Plus, Search, Trash2, UserRound, Users } from 'lucide-react';

interface CustomersTabProps {
  customers: Customer[];
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

type CustomerForm = Omit<Customer, 'id' | 'updatedAt'>;

const emptyForm: CustomerForm = {
  name: '',
  cnpj: '',
  stateRegistration: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  responsibleName: '',
  responsiblePhone: '',
  companyPhone: '',
  email: '',
};

const formatCnpj = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const formatZipCode = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100';

export const CustomersTab: React.FC<CustomersTabProps> = ({
  customers,
  onSaveCustomer,
  onDeleteCustomer,
}) => {
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase('pt-BR');
    if (!term) return customers;
    return customers.filter((customer) =>
      [
        customer.name,
        customer.cnpj,
        customer.responsibleName,
        customer.email,
        customer.city,
      ].some((value) => value.toLocaleLowerCase('pt-BR').includes(term))
    );
  }, [customers, searchTerm]);

  const updateField = <K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cnpjDigits = form.cnpj.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) {
      window.alert('Informe um CNPJ com 14 dígitos.');
      return;
    }

    onSaveCustomer({
      ...form,
      name: form.name.trim(),
      cnpj: formatCnpj(form.cnpj),
      email: form.email.trim(),
      id: editingId ?? `customer-${Date.now()}`,
      updatedAt: Date.now(),
    });
    resetForm();
  };

  const handleEdit = (customer: Customer) => {
    const { id, updatedAt: _updatedAt, ...customerForm } = customer;
    setEditingId(id);
    setForm(customerForm);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SectionTitle = ({ icon: Icon, children }: { icon: typeof Building2; children: React.ReactNode }) => (
    <h3 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
      <Icon className="h-4 w-4 text-orange-600" />
      {children}
    </h3>
  );

  return (
    <div className="space-y-5 pb-20 lg:pb-8">
      <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-xs sm:p-5 lg:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
              {editingId ? 'Editar cliente' : 'Cadastro de clientes'}
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              Cadastre os dados da empresa e os contatos para seus pedidos.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <SectionTitle icon={Building2}>Dados da empresa</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="sm:col-span-2 lg:col-span-2">
                <span className="mb-1 block text-xs font-bold text-slate-700">Nome / Razão social *</span>
                <input
                  required
                  autoComplete="organization"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="Nome da empresa ou estabelecimento"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">CNPJ *</span>
                <input
                  required
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.cnpj}
                  onChange={(event) => updateField('cnpj', formatCnpj(event.target.value))}
                  placeholder="00.000.000/0000-00"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">Inscrição estadual</span>
                <input
                  value={form.stateRegistration}
                  onChange={(event) => updateField('stateRegistration', event.target.value)}
                  placeholder="Inscrição estadual"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">Telefone da empresa</span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.companyPhone}
                  onChange={(event) => updateField('companyPhone', formatPhone(event.target.value))}
                  placeholder="(00) 00000-0000"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">E-mail</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="contato@empresa.com.br"
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <SectionTitle icon={MapPin}>Endereço</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">CEP *</span>
                <input
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={form.zipCode}
                  onChange={(event) => updateField('zipCode', formatZipCode(event.target.value))}
                  placeholder="00000-000"
                  className={inputClass}
                />
              </label>
              <label className="sm:col-span-2 lg:col-span-2">
                <span className="mb-1 block text-xs font-bold text-slate-700">Rua / Avenida</span>
                <input
                  autoComplete="address-line1"
                  value={form.street}
                  onChange={(event) => updateField('street', event.target.value)}
                  placeholder="Nome do logradouro"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">Número</span>
                <input
                  value={form.number}
                  onChange={(event) => updateField('number', event.target.value)}
                  placeholder="Nº"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">Complemento</span>
                <input
                  autoComplete="address-line2"
                  value={form.complement}
                  onChange={(event) => updateField('complement', event.target.value)}
                  placeholder="Sala, loja..."
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">Bairro</span>
                <input
                  autoComplete="address-level3"
                  value={form.neighborhood}
                  onChange={(event) => updateField('neighborhood', event.target.value)}
                  placeholder="Bairro"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">Cidade</span>
                <input
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="Cidade"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">UF</span>
                <input
                  autoComplete="address-level1"
                  maxLength={2}
                  value={form.state}
                  onChange={(event) => updateField('state', event.target.value.toLocaleUpperCase('pt-BR'))}
                  placeholder="UF"
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <SectionTitle icon={UserRound}>Responsável e contato</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">Nome do responsável</span>
                <input
                  autoComplete="name"
                  value={form.responsibleName}
                  onChange={(event) => updateField('responsibleName', event.target.value)}
                  placeholder="Nome completo"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-700">Telefone do responsável</span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.responsiblePhone}
                  onChange={(event) => updateField('responsiblePhone', formatPhone(event.target.value))}
                  placeholder="(00) 00000-0000"
                  className={inputClass}
                />
              </label>
              <div className="hidden items-end lg:flex">
                <p className="flex items-center gap-2 pb-3 text-xs text-slate-500">
                  <Phone className="h-4 w-4 text-orange-500" />
                  Telefones podem receber ligações ou WhatsApp.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar edição
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700"
            >
              {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Salvar alterações' : 'Cadastrar cliente'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-xs sm:p-5 lg:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900">Clientes cadastrados</h2>
            <p className="text-xs text-slate-500">{customers.length} {customers.length === 1 ? 'cliente' : 'clientes'}</p>
          </div>
          <label className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar nome, CNPJ, contato..."
              className={`${inputClass} pl-9`}
            />
          </label>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">
              {customers.length ? 'Nenhum cliente encontrado.' : 'Ainda não há clientes cadastrados.'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {customers.length ? 'Tente buscar por outro termo.' : 'Preencha os dados acima para começar.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {filteredCustomers.map((customer) => (
              <article key={customer.id} className="rounded-xl border border-slate-200 p-4 transition hover:border-orange-200 hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900">{customer.name}</h3>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">{customer.cnpj}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(customer)}
                      aria-label={`Editar ${customer.name}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-50 hover:text-orange-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Deseja remover o cliente "${customer.name}"?`)) {
                          onDeleteCustomer(customer.id);
                          if (editingId === customer.id) resetForm();
                        }
                      }}
                      aria-label={`Excluir ${customer.name}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-x-4 gap-y-2 text-xs text-slate-600 sm:grid-cols-2">
                  <p className="flex min-w-0 items-center gap-2">
                    <UserRound className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                    <span className="truncate">{customer.responsibleName || 'Responsável não informado'}</span>
                  </p>
                  <p className="flex min-w-0 items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                    <span className="truncate">{customer.responsiblePhone || customer.companyPhone || 'Telefone não informado'}</span>
                  </p>
                  <p className="flex min-w-0 items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                    <span className="truncate">{customer.email || 'E-mail não informado'}</span>
                  </p>
                  <p className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                    <span className="truncate">
                      {[customer.city, customer.state, customer.zipCode].filter(Boolean).join(' - ') || 'Endereço não informado'}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
