
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
  
  // Game pricings from table data
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
  { id: 1, table_number: "1", status: "available", table_type: "standard", pricings: [] },
  { id: 2, table_number: "2", status: "occupied", table_type: "premium", pricings: [] },
  { id: 3, table_number: "3", status: "available", table_type: "standard", pricings: [] },
  { id: 4, table_number: "4", status: "maintenance", table_type: "vip", pricings: [] },
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
  const [gamePricings, setGamePricings] = useState<any[]>([]);
  
  // Additional state for missing properties
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
      const tablesData = await getAllTables({ club_id: clubId || 1 });
      console.log('Tables API response:', tablesData);
      
      // Extract pricings from each table and flatten them
      const allPricings: any[] = [];
      const processedTables = tablesData.map((table: any) => {
        // Add table pricings to the global pricings array
        if (table.pricings && Array.isArray(table.pricings)) {
          table.pricings.forEach((pricing: any) => {
            allPricings.push({
              ...pricing,
              id: pricing.id,
              table_id: table.id,
              game_type_id: pricing.game_type_id,
              price: parseFloat(pricing.price) || 0,
              fixed_price: pricing.fixed_price ? parseFloat(pricing.fixed_price) : null,
              price_per_minute: pricing.price_per_minute ? parseFloat(pricing.price_per_minute) : null,
              time_limit_minutes: pricing.time_limit_minutes,
              is_unlimited: pricing.is_unlimited_time || false
            });
          });
        }
        return table;
      });
      
      setTables(processedTables || FALLBACK_TABLES);
      setGamePricings(allPricings);
      
      // Update game types from pricing data
      const uniqueGameTypes = new Set();
      allPricings.forEach((pricing: any) => {
        if (pricing.game_type) {
          uniqueGameTypes.add(JSON.stringify({
            id: pricing.game_type.id,
            name: pricing.game_type.name,
            pricing_type: pricing.game_type.pricing_type
          }));
        }
      });
      
      const gameTypesFromPricing = Array.from(uniqueGameTypes).map((gt: any) => JSON.parse(gt));
      if (gameTypesFromPricing.length > 0) {
        setGameTypes(gameTypesFromPricing);
      }
      
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

  // Load initial data only once
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

    if (clubId) {
      loadInitialData();
    }
  }, [clubId]); // Only depend on clubId to prevent infinite calls

  const refreshGameTypes = async () => {
    // Game types are now loaded from table pricing data
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
