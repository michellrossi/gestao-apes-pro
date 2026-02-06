export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const getMonthName = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateInstallments = (
  baseTransaction: any,
  totalInstallments: number,
  startDateStr: string
) => {
  const transactions = [];
  const groupId = generateId();
  const [year, month, day] = startDateStr.split('-').map(Number);

  for (let i = 0; i < totalInstallments; i++) {
    const date = new Date(year, month - 1 + i, day);
    const dateStr = date.toISOString().split('T')[0];
    
    transactions.push({
      ...baseTransaction,
      id: generateId(),
      date: dateStr,
      createdAt: Date.now() + i,
      installment: {
        groupId,
        current: i + 1,
        total: totalInstallments
      }
    });
  }
  return transactions;
};