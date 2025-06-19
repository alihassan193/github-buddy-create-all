
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllCanteenItems, getAllCategories, getCanteenItemsByClub } from '@/services/canteenService';
import { getAllGameTypes } from '@/services/gameTypeService';
import { getAllTables } from '@/services/tableService';
import { getAllSessions } from '@/services/sessionService';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';

interface DataContextType {
  // Tables
  tables: any[];
  
  // Sessions
  sessions: any[];
  
  // Canteen
  canteenItems: any[];
  canteenCategories: any[];
  
  // Game Types
  gameTypes: any[];
  
  // Missing properties that components expect
  gamePricings: any[];
  games: any[];
  completedSessions: any[];
  canteenOrders: any[];
  invoices: any[];
  
  // Loading states
  isLoading: boolean;
  
  // Refresh functions
  refreshAllData: () => Promise<void>;
  refreshTables: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  refreshCanteenData: () => Promise<void>;
  refreshGameTypes: () => Promise<void>;
  
  // Missing functions that components expect
  endGame: (gameId: string) => void;
  addFrame: (gameId: string, winner: string, loser: string) => void;
  createInvoice: (tableId: string) => string;
  payInvoice: (invoiceId: string) => void;
  
  // Club context
  clubId: number | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

// Fallback data for when API calls fail
const FALLBACK_TABLES = [
  { id: 1, table_number: "1", status: "available", table_type: "standard" },
  { id: 2, table_number: "2", status: "occupied", table_type: "premium" },
  { id: 3, table_number: "3", status: "available", table_type: "standard" },
  { id: 4, table_number: "4", status: "maintenance", table_type: "vip" },
];

const FALLBACK_GAME_TYPES = [
  { id: 1, name: "Frames", pricing_type: "fixed" },
  { id: 2, name: "Century", pricing_type: "per_minute" },
];

const FALLBACK_CANTEEN_CATEGORIES = [
  { id: 1, name: "Beverages" },
  { id: 2, name: "Snacks" },
  { id: 3, name: "Main Course" },
];

const FALLBACK_CANTEEN_ITEMS = [
  { id: 1, name: "Tea", price: 25, category_id: 1, stock_quantity: 50 },
  { id: 2, name: "Coffee", price: 30, category_id: 1, stock_quantity: 40 },
  { id: 3, name: "Samosa", price: 15, category_id: 2, stock_quantity: 30 },
  { id: 4, name: "Sandwich", price: 45, category_id: 2, stock_quantity: 20 },
  { id: 5, name: "Biryani", price: 120, category_id: 3, stock_quantity: 15 },
];

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [tables, setTables] = useState<any[]>(FALLBACK_TABLES);
  const [sessions, setSessions] = useState<any[]>([]);
  const [canteenItems, setCanteenItems] = useState<any[]>(FALLBACK_CANTEEN_ITEMS);
  const [canteenCategories, setCanteenCategories] = useState<any[]>(FALLBACK_CANTEEN_CATEGORIES);
  const [gameTypes, setGameTypes] = useState<any[]>(FALLBACK_GAME_TYPES);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Additional state for missing properties
  const [gamePricings, setGamePricings] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [canteenOrders, setCanteenOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clubId, setClubId] = useState<number | null>(1); // Default to 1

  // Get club_id from localStorage (set during login)
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.club_id) {
          setClubId(user.club_id);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const refreshTables = async () => {
    console.log('Using fallback tables data - API calls disabled');
    setTables(FALLBACK_TABLES);
  };

  const refreshSessions = async () => {
    console.log('Using empty sessions data - API calls disabled');
    setSessions([]);
  };

  const refreshCanteenData = async () => {
    console.log('Using fallback canteen data - API calls disabled');
    setCanteenItems(FALLBACK_CANTEEN_ITEMS);
    setCanteenCategories(FALLBACK_CANTEEN_CATEGORIES);
  };

  const refreshGameTypes = async () => {
    console.log('Using fallback game types - API calls disabled');
    setGameTypes(FALLBACK_GAME_TYPES);
    
    // Create mock pricings for each game type and table combination
    const mockPricings: any[] = [];
    FALLBACK_TABLES.forEach(table => {
      FALLBACK_GAME_TYPES.forEach(gameType => {
        mockPricings.push({
          id: `${table.id}-${gameType.id}`,
          table_id: table.id,
          game_type_id: gameType.id,
          price: gameType.pricing_type === 'fixed' ? 100 : 5,
          is_unlimited: gameType.pricing_type === 'fixed',
          time_limit_minutes: gameType.pricing_type === 'fixed' ? null : 60
        });
      });
    });
    
    console.log('Generated mock pricings:', mockPricings);
    setGamePricings(mockPricings);
  };

  const refreshAllData = async () => {
    console.log('Refresh all data using fallback data only');
    setIsLoading(true);
    
    try {
      await Promise.all([
        refreshTables(),
        refreshSessions(),
        refreshCanteenData(),
        refreshGameTypes()
      ]);
      console.log('All fallback data loaded successfully');
    } catch (error) {
      console.error('Error setting fallback data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate pricings on component mount
  useEffect(() => {
    const mockPricings: any[] = [];
    FALLBACK_TABLES.forEach(table => {
      FALLBACK_GAME_TYPES.forEach(gameType => {
        mockPricings.push({
          id: `${table.id}-${gameType.id}`,
          table_id: table.id,
          game_type_id: gameType.id,
          price: gameType.pricing_type === 'fixed' ? 100 : 5,
          is_unlimited: gameType.pricing_type === 'fixed',
          time_limit_minutes: gameType.pricing_type === 'fixed' ? null : 60
        });
      });
    });
    setGamePricings(mockPricings);
  }, []);

  // Stub implementations for missing functions
  const endGame = (gameId: string) => {
    console.log('End game:', gameId);
    // TODO: Implement actual game ending logic
  };

  const addFrame = (gameId: string, winner: string, loser: string) => {
    console.log('Add frame:', gameId, winner, loser);
    // TODO: Implement actual frame adding logic
  };

  const createInvoice = (tableId: string): string => {
    console.log('Create invoice for table:', tableId);
    // TODO: Implement actual invoice creation logic
    return `invoice-${Date.now()}`;
  };

  const payInvoice = (invoiceId: string) => {
    console.log('Pay invoice:', invoiceId);
    // TODO: Implement actual invoice payment logic
  };

  // Disable smart refresh to prevent API call loops
  // useSmartRefresh({
  //   refreshFn: refreshAllData,
  //   interval: 60000,
  //   skipWhenDialogsOpen: true
  // });

  // Initial data load - only set fallback data once
  useEffect(() => {
    console.log('Loading initial fallback data...');
    refreshAllData();
  }, []);

  const value: DataContextType = {
    tables,
    sessions,
    canteenItems,
    canteenCategories,
    gameTypes,
    gamePricings,
    games,
    completedSessions,
    canteenOrders,
    invoices,
    isLoading,
    refreshAllData,
    refreshTables,
    refreshSessions,
    refreshCanteenData,
    refreshGameTypes,
    endGame,
    addFrame,
    createInvoice,
    payInvoice,
    clubId,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
