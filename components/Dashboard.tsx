import React, { useMemo } from 'react';
import { Transaction, CATEGORY_LABELS, CATEGORY_COLORS, Property } from '../types';
import { formatCurrency } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { TrendingUp, Home, Hammer, Calendar, MoreHorizontal, Download, SlidersHorizontal, Plus } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  properties: Property[];
  currentPropertyId: string;
  onPropertyChange: (id: string) => void;
  onAddProperty: () => void;
  onEditProperty: () => void;
  onExportPDF: () => void;
  onAddTransaction: () => void;
  onOpenPaidDetails: (category: string | 'total') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  properties, 
  currentPropertyId, 
  onPropertyChange,
  onAddProperty,
  onEditProperty,
  onExportPDF,
  onAddTransaction,
  onOpenPaidDetails
}) => {
  const currentProperty = properties.find(p => p.id === currentPropertyId);

  // Filter transactions by current property for stats
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.propertyId === currentPropertyId);
  }, [transactions, currentPropertyId]);

  const stats = useMemo(() => {
    const paidRevenue = filteredTransactions
      .filter(t => t.type === 'revenue' && t.status === 'paid')
      .reduce((acc, t) => acc + t.amount, 0);

    const paidExpense = filteredTransactions
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((acc, t) => acc + t.amount, 0);

    const pendingBalance = filteredTransactions
      .filter(t => t.status === 'pending')
      .reduce((acc, t) => acc + (t.type === 'expense' ? -t.amount : t.amount), 0);

    const totalBalance = paidRevenue - paidExpense;

    return { totalBalance, pendingBalance };
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    // Only paid expenses by category for the chart
    const grouped = filteredTransactions
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(grouped).map(([key, value]) => ({
      name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
      value: value as number,
      key
    })).filter(item => item.value > 0);
  }, [filteredTransactions]);

  const getCategoryStats = (category: string) => {
    const paid = filteredTransactions
      .filter(t => t.category === category && t.status === 'paid')
      .reduce((acc, t) => acc + t.amount, 0);
    const pending = filteredTransactions
      .filter(t => t.category === category && t.status === 'pending')
      .reduce((acc, t) => acc + t.amount, 0);
    return { paid, pending };
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'revenue': return <TrendingUp size={18} />;
      case 'acquisition': return <Home size={18} />;
      case 'renovation': return <Hammer size={18} />;
      case 'monthly': return <Calendar size={18} />;
      default: return <MoreHorizontal size={18} />;
    }
  };

  const getCategoryColorClass = (cat: string) => {
    switch (cat) {
      case 'revenue': return 'text-emerald-500 bg-emerald-50';
      case 'acquisition': return 'text-purple-500 bg-purple-50';
      case 'renovation': return 'text-orange-500 bg-orange-50';
      case 'monthly': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const categoryList = ['revenue', 'acquisition', 'renovation', 'monthly', 'other'];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 bg-white min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Property Selector */}
          <div className="relative group">
            <select 
              value={currentPropertyId}
              onChange={(e) => onPropertyChange(e.target.value)}
              className="appearance-none bg-white border border-gray-200 pl-10 pr-10 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer min-w-[200px]"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Home size={16} className="text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <span className="text-gray-400 absolute right-3.5 top-3 pointer-events-none text-xs">▼</span>
          </div>
          
          <button 
            onClick={onAddProperty}
            title="Adicionar novo imóvel"
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
          >
            <Plus size={20} />
          </button>

          <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

          <button 
            onClick={onEditProperty}
            title="Editar informações do imóvel"
            className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <SlidersHorizontal size={20} />
          </button>
          <button 
            onClick={onExportPDF}
            title="Exportar relatório em PDF"
            className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={onAddTransaction}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-100 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span className="font-semibold text-sm">Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Hero Card - Green */}
      <button 
        onClick={() => onOpenPaidDetails('total')}
        className="w-full text-left bg-brand-600 rounded-2xl p-8 text-white shadow-xl shadow-brand-100 relative overflow-hidden group transition-transform hover:scale-[1.005]"
      >
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1">
            Saldo Realizado (Pago)
          </p>
          <h2 className="text-5xl font-bold mb-2 tracking-tight">
            {formatCurrency(stats.totalBalance)}
          </h2>
          <p className="text-emerald-100 text-sm font-medium">
            Pendente: {formatCurrency(stats.pendingBalance)}
          </p>
        </div>
        {/* Decorative circle */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none transition-opacity group-hover:opacity-10"></div>
      </button>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {categoryList.map(cat => {
          const { paid, pending } = getCategoryStats(cat);
          return (
            <button 
              key={cat}
              onClick={() => onOpenPaidDetails(cat)}
              className="bg-white p-5 pl-7 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all text-left group relative overflow-hidden"
            >
              {/* Colored Line Indicator */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                style={{ backgroundColor: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] }}
              ></div>

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${getCategoryColorClass(cat)}`}>
                  {getCategoryIcon(cat)}
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                  {formatCurrency(paid)}
                </p>
                <p className="text-xs text-gray-400 font-medium">
                   Pendente: <span className={pending > 0 ? "text-gray-500" : ""}>{formatCurrency(pending)}</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 h-[450px]">
        <div className="flex items-center justify-between mb-6">
           <h3 className="font-bold text-lg text-gray-800">Distribuição de Despesas</h3>
           <div className="text-sm text-gray-400">Somente pagos</div>
        </div>
        <div className="h-[350px] w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `R$ ${value}`}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #f3f4f6', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                   {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.key as keyof typeof CATEGORY_COLORS]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <div className="p-4 bg-gray-50 rounded-full">
                <TrendingUp size={24} className="text-gray-300" />
              </div>
              <p>Nenhuma despesa paga neste período</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};