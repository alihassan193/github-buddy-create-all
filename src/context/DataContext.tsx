import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllCanteenItems, getAllCategories } from '@/services/canteenService';
import { getAllTables } from '@/services/tableService';
import { getAllSessions } from '@/services/sessionService';

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

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [tables, setTables] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [canteenItems, setCanteenItems] = useState<any[]>([]);
  const [canteenCategories, setCanteenCategories] = useState<any[]>([]);
  const [gameTypes, setGameTypes] = useState<any[]>(FALLBACK_GAME_TYPES);
  const [isLoading, setIsLoading] = useState(false);
  
  // Additional state for missing properties
  const [gamePricings, setGamePricings] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [canteenOrders, setCanteenOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clubId, setClubId] = useState<number | null>(1);

  // Get club_id from localStorage once
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

  // Load tables data from API
  const refreshTables = async () => {
    try {
      console.log('Fetching tables data...');
      const tablesData = await getAllTables();
      console.log('Tables API response:', tablesData);
      setTables(tablesData || FALLBACK_TABLES);
    } catch (error) {
      console.error('Error loading tables:', error);
      setTables(FALLBACK_TABLES);
    }
  };

  // Load sessions data from API with club_id
  const refreshSessions = async () => {
    try {
      console.log('Fetching sessions data...');
      const sessionsResponse = await getAllSessions({ club_id: clubId || 1 });
      console.log('Sessions API response:', sessionsResponse);
      
      // Extract sessions from the response structure
      const allSessions = sessionsResponse?.sessions || [];
      setSessions(allSessions);
      
      // Also update completed sessions for other components
      const completed = allSessions.filter((session: any) => session.status === 'completed');
      setCompletedSessions(completed);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    }
  };

  // Load canteen data from API
  const refreshCanteenData = async () => {
    if (!clubId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch categories
      const categoriesResponse = await getAllCategories();
      console.log('Categories API response:', categoriesResponse);
      setCanteenCategories(categoriesResponse || []);
      
      // Fetch items with club_id
      const itemsResponse = await getAllCanteenItems({ club_id: clubId });
      console.log('Items API response:', itemsResponse);
      
      // Transform the items to match expected structure
      const processedItems = itemsResponse.map((item: any) => ({
        ...item,
        price: parseFloat(item.price) || 0,
        category_name: item.category?.name || 'Unknown'
      }));
      
      setCanteenItems(processedItems);
    } catch (error) {
      console.error('Error loading canteen data:', error);
      // Keep existing data on error
    } finally {
      setIsLoading(false);
    }
  };

  // Load canteen data when clubId changes
  useEffect(() => {
    if (clubId) {
      refreshCanteenData();
    }
  }, [clubId]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          refreshTables(),
          refreshSessions()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Generate mock pricings once
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

  const refreshGameTypes = async () => {
    // Use static data, no API calls
    return Promise.resolve();
  };

  const refreshAllData = async () => {
    await Promise.all([
      refreshTables(),
      refreshSessions(),
      refreshCanteenData(),
      refreshGameTypes()
    ]);
  };

  // Stub implementations for missing functions
  const endGame = (gameId: string) => {
    console.log('End game:', gameId);
  };

  const addFrame = (gameId: string, winner: string, loser: string) => {
    console.log('Add frame:', gameId, winner, loser);
  };

  const createInvoice = (tableId: string): string => {
    console.log('Create invoice for table:', tableId);
    return `invoice-${Date.now()}`;
  };

  const payInvoice = (invoiceId: string) => {
    console.log('Pay invoice:', invoiceId);
  };

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
