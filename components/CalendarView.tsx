import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthName, formatCurrency } from '../utils/formatters';

interface CalendarViewProps {
  transactions: Transaction[];
  onDayClick: (date: string, transactions: Transaction[]) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ transactions, onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Add empty slots for previous month days
    for (let i = 0; i < date.getDay(); i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const getDayStatus = (dateStr: string) => {
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    if (dayTransactions.length === 0) return null;

    const hasOverdue = dayTransactions.some(t => t.status === 'pending' && new Date(t.date) < new Date() && t.type === 'expense');
    if (hasOverdue) return 'overdue';

    const allPaid = dayTransactions.every(t => t.status === 'paid');
    return allPaid ? 'paid' : 'pending';
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 capitalize">
          {getMonthName(currentDate)}
        </h2>
        <div className="flex space-x-2">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <ChevronLeft />
          </button>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-7 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-400 uppercase">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2 lg:gap-4 h-full auto-rows-fr">
          {daysInMonth.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="bg-transparent" />;
            
            const dateStr = date.toISOString().split('T')[0];
            const status = getDayStatus(dateStr);
            const dayTrans = transactions.filter(t => t.date === dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => dayTrans.length > 0 && onDayClick(dateStr, dayTrans)}
                className={`
                  relative p-2 rounded-xl border min-h-[60px] md:min-h-[80px] flex flex-col items-center md:items-start justify-start hover:shadow-md transition-shadow
                  ${status === 'paid' ? 'bg-emerald-50 border-emerald-100' : ''}
                  ${status === 'pending' ? 'bg-amber-50 border-amber-100' : ''}
                  ${status === 'overdue' ? 'bg-red-50 border-red-100' : ''}
                  ${!status ? 'bg-white border-gray-100' : ''}
                `}
              >
                <span className={`text-sm font-semibold ${!status ? 'text-gray-700' : 'text-gray-900'}`}>
                  {date.getDate()}
                </span>
                
                {status && (
                  <div className="mt-2 flex gap-1 justify-center md:justify-start w-full flex-wrap">
                    {dayTrans.map((t, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full ${
                          t.status === 'paid' ? 'bg-emerald-400' : 
                          (new Date(t.date) < new Date() && t.type === 'expense' && t.status === 'pending') ? 'bg-red-400' : 'bg-amber-400'
                        }`} 
                        title={t.description}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};