import React from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Edit2, Trash2, User } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  onToggleStatus: (t: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onEdit, 
  onDelete,
  onToggleStatus
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p>Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white">
      {transactions.map((t) => (
        <div 
          key={t.id} 
          className="flex justify-between py-5 px-1 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group"
          onClick={() => onEdit(t)}
        >
          {/* Left Side: Description and Date */}
          <div className="flex flex-col justify-center space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900 text-[15px]">
                {t.description}
              </span>
              {t.installment && (
                <span className="text-gray-500 font-medium text-[15px]">
                  ({t.installment.current}/{t.installment.total})
                </span>
              )}
            </div>
            <span className="text-gray-400 text-sm font-medium">
              {formatDate(t.date)}
            </span>
          </div>

          {/* Right Side: Amount, Payer, Status */}
          <div className="flex flex-col items-end justify-center space-y-1.5">
            <span className={`text-[15px] font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
              R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-gray-400">
                <User size={12} strokeWidth={2.5} />
                <span className="text-xs font-medium text-gray-500">{t.payer}</span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(t);
                }}
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  t.status === 'paid' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {t.status === 'paid' ? 'PAGO' : 'PENDENTE'}
              </button>
            </div>
          </div>
          
          {/* Hidden Actions (Visible on Hover/Swipe in future) - Kept simple for now as click opens edit */}
        </div>
      ))}
    </div>
  );
};