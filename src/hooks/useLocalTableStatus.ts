
import { useState, useEffect } from 'react';

interface TableStatus {
  id: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
}

export const useLocalTableStatus = () => {
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('table-statuses');
    if (saved) {
      try {
        setTableStatuses(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading table statuses:', error);
      }
    }
  }, []);

  // Save to localStorage whenever statuses change
  useEffect(() => {
    localStorage.setItem('table-statuses', JSON.stringify(tableStatuses));
  }, [tableStatuses]);

  const updateTableStatus = (tableId: number, status: 'available' | 'occupied' | 'maintenance' | 'reserved') => {
    setTableStatuses(prev => {
      const existing = prev.find(ts => ts.id === tableId);
      if (existing) {
        return prev.map(ts => ts.id === tableId ? { ...ts, status } : ts);
      } else {
        return [...prev, { id: tableId, status }];
      }
    });
  };

  const getTableStatus = (tableId: number, defaultStatus: string = 'available') => {
    const tableStatus = tableStatuses.find(ts => ts.id === tableId);
    return tableStatus?.status || defaultStatus;
  };

  const resetTableStatus = (tableId: number) => {
    setTableStatuses(prev => prev.filter(ts => ts.id !== tableId));
  };

  return {
    updateTableStatus,
    getTableStatus,
    resetTableStatus,
    tableStatuses
  };
};
