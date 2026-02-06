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
      case 'revenue': return <TrendingUp size={24} />;
      case 'acquisition': return <Home size={24} />;
      case 'renovation': return <Hammer size={24} />;
      case 'monthly': return <Calendar size={24} />;
      default: return <MoreHorizontal size={24} />;
    }
  };

  const categoryList = ['revenue', 'acquisition', 'renovation', 'monthly', 'other'];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 bg-white min-h-screen">
      
      {/* Header - Centered Title */}
      <h1 className="text-2xl font-bold text-gray-900 text-center pt-2">Visão Geral</h1>
      
      {/* Controls Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Property Selector */}
        <div className="relative group w-full md:w-auto md:flex-1">
          <select 
            value={currentPropertyId}
            onChange={(e) => onPropertyChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 pl-10 pr-10 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            <option value="new_property_action" className="font-bold text-brand-600">+ Adicionar Imóvel</option>
          </select>
          <Home size={18} className="text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <span className="text-gray-400 absolute right-3.5 top-3.5 pointer-events-none text-xs">▼</span>
        </div>

        {/* Action Icons - Just 3 Icons */}
        <div className="flex items-center gap-3 justify-between md:justify-end">
          <div className="flex gap-3 flex-1 md:flex-none">
            <button 
              onClick={onEditProperty}
              title="Editar imóvel"
              className="flex-1 md:flex-none flex justify-center items-center h-[50px] w-[50px] border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <SlidersHorizontal size={22} />
            </button>
            <button 
              onClick={onExportPDF}
              title="Exportar PDF"
              className="flex-1 md:flex-none flex justify-center items-center h-[50px] w-[50px] border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <Download size={22} />
            </button>
          </div>
          
          <button 
            onClick={onAddTransaction}
            className="h-[50px] px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-100 transition-all active:scale-95 flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Hero Card - Green */}
      <button 
        onClick={() => onOpenPaidDetails('total')}
        className="w-full text-left bg-brand-600 rounded-2xl p-6 text-white shadow-xl shadow-brand-100 relative overflow-hidden group transition-transform hover:scale-[1.005] min-h-[160px] flex flex-col justify-center"
      >
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1">
            Saldo Geral (Pago)
          </p>
          <h2 className="text-4xl font-bold mb-2 tracking-tight">
            {formatCurrency(stats.totalBalance)}
          </h2>
          <p className="text-emerald-100 text-sm font-medium">
            Receitas - Despesas
          </p>
        </div>
        {/* Watermark Icon */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
           <LayoutDashboard size={180} />
        </div>
      </button>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 gap-4">
        {categoryList.map(cat => {
          const { paid } = getCategoryStats(cat);
          const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
          
          return (
            <button 
              key={cat}
              onClick={() => onOpenPaidDetails(cat)}
              className="bg-white p-5 rounded-2xl transition-all text-left group relative overflow-hidden flex flex-col justify-between min-h-[110px]"
              style={{ border: `1.5px solid ${color}30` }} // 30 is hex opacity approx 20%
            >
              <div className="flex items-center gap-2 mb-2 z-10">
                <div 
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: `${color}20`, color: color }}
                >
                  {getCategoryIcon(cat)}
                </div>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                </span>
              </div>
              
              <div className="z-10">
                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                  {formatCurrency(paid)}
                </p>
              </div>

               {/* Watermark Icon */}
              <div 
                className="absolute right-[-15px] bottom-[-15px] opacity-[0.07] pointer-events-none transform -rotate-12 scale-150"
                style={{ color: color }}
              >
                {getCategoryIcon(cat)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 h-[450px]">
        <div className="flex items-center justify-between mb-6">
           <h3 className="font-bold text-lg text-gray-800">Distribuição</h3>
           <div className="text-sm text-gray-400">Pagos</div>
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
// Add missing import for LayoutDashboard icon used in Hero card
import { LayoutDashboard } from 'lucide-react';
