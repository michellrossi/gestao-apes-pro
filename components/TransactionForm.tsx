import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction, TransactionType, TransactionCategory, PAYERS, CATEGORY_LABELS, Property } from '../types';
import { generateId } from '../utils/formatters';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingTransaction?: Transaction | null;
  properties: Property[];
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
  properties
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('monthly');
  const [payer, setPayer] = useState(PAYERS[1]); // Default to Cida
  const [status, setStatus] = useState<'paid' | 'pending'>('pending');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState(2);
  const [installmentValueType, setInstallmentValueType] = useState<'single' | 'total'>('total');
  const [propertyId, setPropertyId] = useState('');

  useEffect(() => {
    if (properties.length > 0 && !propertyId) {
      setPropertyId(properties[0].id);
    }
  }, [properties]);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setDate(editingTransaction.date);
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setPayer(editingTransaction.payer);
      setStatus(editingTransaction.status);
      setPropertyId(editingTransaction.propertyId);
      setIsInstallment(!!editingTransaction.installment);
    } else {
      resetForm();
    }
  }, [editingTransaction, isOpen]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setType('expense');
    setCategory('monthly');
    setStatus('pending');
    setIsInstallment(false);
    setInstallmentsCount(2);
    setInstallmentValueType('total');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    // Logic for amount calculation based on installment type
    let finalAmount = parseFloat(amount);
    
    // If it's a new installment creation and user entered TOTAL value, divide it
    if (!editingTransaction && isInstallment && installmentValueType === 'total') {
      finalAmount = finalAmount / installmentsCount;
    }

    const baseData = {
      description,
      amount: finalAmount,
      date,
      type,
      category,
      payer,
      status,
      propertyId,
    };

    if (!editingTransaction && isInstallment) {
      onSubmit({ ...baseData, isInstallment: true, installmentsCount });
    } else {
      onSubmit({ 
        ...baseData, 
        id: editingTransaction?.id || generateId(),
        createdAt: editingTransaction?.createdAt || Date.now()
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Type Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setType('revenue')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                type === 'revenue' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                type === 'expense' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Despesa
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
              placeholder="Ex: Aluguel do Mês"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pagador</label>
              <select
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              >
                {PAYERS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4 py-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${status === 'paid' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={status === 'paid'}
                  onChange={(e) => setStatus(e.target.checked ? 'paid' : 'pending')}
                />
                {status === 'paid' && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white rotate-[-45deg] mb-0.5"></div>}
              </div>
              <span className="text-sm font-medium text-gray-700">Pago / Recebido</span>
            </label>
          </div>

          {!editingTransaction && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
               <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  checked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-900">Parcelar esta despesa?</span>
              </label>
              
              {isInstallment && (
                <div className="animate-fadeIn space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Número de parcelas:</span>
                    <input
                      type="number"
                      min="2"
                      max="60"
                      value={installmentsCount}
                      onChange={(e) => setInstallmentsCount(parseInt(e.target.value))}
                      className="w-20 px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 outline-none"
                    />
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">O valor inserido acima refere-se a:</p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="valType"
                          checked={installmentValueType === 'total'}
                          onChange={() => setInstallmentValueType('total')}
                          className="text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-700">Valor Total (será dividido)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="valType"
                          checked={installmentValueType === 'single'}
                          onChange={() => setInstallmentValueType('single')}
                          className="text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-700">Valor de cada Parcela</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Calculation Preview */}
                  {amount && installmentsCount > 0 && (
                    <div className="text-xs text-brand-600 font-semibold bg-brand-50 p-2 rounded">
                      {installmentValueType === 'total' 
                        ? `${installmentsCount}x de ${(parseFloat(amount) / installmentsCount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                        : `Total: ${(parseFloat(amount) * installmentsCount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200 transition-colors"
            >
              {editingTransaction ? 'Salvar Alterações' : 'Criar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};