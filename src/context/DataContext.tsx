import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  SnookerTable, 
  TableSession, 
  CanteenItem, 
  Invoice, 
  GameType, 
  GamePricing, 
  CanteenCategory,
  CanteenOrder,
  CartItem,
  InvoiceItem,
  Game
} from '../types';
import { getAllTables } from '../services/tableService';
import { getAllGameTypes } from '../services/gameTypeService';

interface DataContextType {
  // Tables
  tables: SnookerTable[];
  gameTypes: GameType[];
  gamePricings: GamePricing[];
  
  // Canteen
  canteenCategories: CanteenCategory[];
  canteenItems: CanteenItem[];
  cart: CartItem[];
  
  // Sessions and Orders
  activeSessions: TableSession[];
  completedSessions: TableSession[];
  canteenOrders: CanteenOrder[];
  invoices: Invoice[];
  
  // Games for ActiveGame component
  games: Game[];
  
  // Refresh functions
  refreshTables: () => Promise<void>;
  refreshGameTypes: () => Promise<void>;
  
  // Table operations
  addTable: (table: Omit<SnookerTable, 'id' | 'created_at'>) => void;
  updateTableStatus: (id: number, status: SnookerTable['status']) => void;
  
  // Session operations
  startSession: (tableId: number, gameTypeId: number, playerName: string) => number;
  endSession: (sessionId: number) => void;
  
  // Game operations for ActiveGame
  endGame: (gameId: string) => void;
  addFrame: (gameId: string, winner: string, loser: string) => void;
  
  // Canteen operations
  addToCart: (item: CanteenItem, quantity: number, sessionId?: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  placeOrder: (servedById: number, sessionId?: number) => void;
  
  // Game types and pricing
  addGameType: (name: string) => void;
  updateGamePricing: (pricing: Omit<GamePricing, 'id' | 'created_at'>) => void;
  
  // Canteen inventory
  addCanteenCategory: (name: string) => void;
  addCanteenItem: (item: Omit<CanteenItem, 'id' | 'created_at'>) => void;
  updateCanteenItemStock: (itemId: number, newQuantity: number) => void;
  
  // Invoicing
  createInvoice: (sessionId: number) => string;
  payInvoice: (id: string) => void;
}

// Initial mock data for development
const initialGameTypes: GameType[] = [
  { id: 1, name: 'Frame' },
  { id: 2, name: 'Century' },
  { id: 3, name: 'Timed' }
];

const initialTables: SnookerTable[] = [
  {
    id: 1,
    table_number: 'Table 1',
    status: 'available',
    created_by: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    table_number: 'Table 2',
    status: 'available',
    created_by: 1,
    created_at: new Date().toISOString()
  }
];

const initialGamePricings: GamePricing[] = [
  {
    id: 1,
    table_id: 1,
    game_type_id: 1, // Frame
    price: 10,
    time_limit_minutes: null,
    is_unlimited: true,
    created_by: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    table_id: 1,
    game_type_id: 2, // Century
    price: 20,
    time_limit_minutes: null,
    is_unlimited: true,
    created_by: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    table_id: 1,
    game_type_id: 3, // Timed
    price: 15,
    time_limit_minutes: 60,
    is_unlimited: false,
    created_by: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    table_id: 2,
    game_type_id: 1, // Frame
    price: 10,
    time_limit_minutes: null,
    is_unlimited: true,
    created_by: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    table_id: 2,
    game_type_id: 2, // Century
    price: 20,
    time_limit_minutes: null,
    is_unlimited: true,
    created_by: 1,
    created_at: new Date().toISOString()
  }
];

const initialCanteenCategories: CanteenCategory[] = [
  { id: 1, name: 'Beverages' },
  { id: 2, name: 'Snacks' },
  { id: 3, name: 'Food' }
];

const initialCanteenItems: CanteenItem[] = [
  {
    id: 1,
    name: 'Cola',
    category_id: 1,
    price: 2,
    stock_quantity: 50,
    created_by: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Chips',
    category_id: 2,
    price: 1.5,
    stock_quantity: 30,
    created_by: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Sandwich',
    category_id: 3,
    price: 4,
    stock_quantity: 10,
    created_by: 1,
    created_at: new Date().toISOString()
  }
];

// Initialize mock games for the ActiveGame component
const initialGames: Game[] = [
  {
    id: 'game-1',
    tableId: 1,
    type: 'frame',
    startTime: new Date(),
    player1: 'John',
    player2: 'Mike',
    frames: [
      {
        id: 'frame-1',
        winner: 'John',
        loser: 'Mike'
      }
    ]
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core entities
  const [tables, setTables] = useState<SnookerTable[]>(initialTables);
  const [gameTypes, setGameTypes] = useState<GameType[]>(initialGameTypes);
  const [gamePricings, setGamePricings] = useState<GamePricing[]>(initialGamePricings);
  
  // Games for ActiveGame component
  const [games, setGames] = useState<Game[]>(initialGames);
  
  // Canteen-related
  const [canteenCategories, setCanteenCategories] = useState<CanteenCategory[]>(initialCanteenCategories);
  const [canteenItems, setCanteenItems] = useState<CanteenItem[]>(initialCanteenItems);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Sessions and orders
  const [activeSessions, setActiveSessions] = useState<TableSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<TableSession[]>([]);
  const [canteenOrders, setCanteenOrders] = useState<CanteenOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Refresh functions
  const refreshTables = useCallback(async () => {
    try {
      const fetchedTables = await getAllTables();
      setTables(fetchedTables);
      
      // Note: Game pricing will be handled separately since it's not part of the table object
      // The backend API should provide game pricing separately or as part of a different endpoint
      console.log('Tables refreshed:', fetchedTables);
    } catch (error) {
      console.error('Error refreshing tables:', error);
      // Keep existing data on error
    }
  }, []);
  
  const refreshGameTypes = useCallback(async () => {
    try {
      const fetchedGameTypes = await getAllGameTypes();
      setGameTypes(fetchedGameTypes);
    } catch (error) {
      console.error('Error refreshing game types:', error);
      // Keep existing data on error
    }
  }, []);
  
  // Table operations
  const addTable = (table: Omit<SnookerTable, 'id' | 'created_at'>) => {
    const newTable: SnookerTable = {
      ...table,
      id: tables.length + 1,
      created_at: new Date().toISOString()
    };
    setTables([...tables, newTable]);
  };
  
  const updateTableStatus = (id: number, status: SnookerTable['status']) => {
    setTables(tables.map(t => t.id === id ? { ...t, status } : t));
  };
  
  // Session operations
  const startSession = (tableId: number, gameTypeId: number, playerName: string): number => {
    const newSession: TableSession = {
      id: activeSessions.length + completedSessions.length + 1,
      table_id: tableId,
      game_type_id: gameTypeId,
      start_time: new Date().toISOString(),
      player_name: playerName,
      is_guest: true,
      status: 'active'
    };
    
    setActiveSessions([...activeSessions, newSession]);
    updateTableStatus(tableId, 'occupied');
    
    return newSession.id;
  };
  
  const endSession = (sessionId: number) => {
    const session = activeSessions.find(s => s.id === sessionId);
    
    if (session) {
      const endTime = new Date().toISOString();
      const startTime = new Date(session.start_time);
      const durationMinutes = (new Date(endTime).getTime() - startTime.getTime()) / (1000 * 60);
      
      // Find game pricing to calculate final amount
      const pricing = gamePricings.find(p => 
        p.table_id === session.table_id && p.game_type_id === session.game_type_id
      );
      
      let totalAmount = 0;
      if (pricing) {
        if (pricing.is_unlimited) {
          totalAmount = pricing.price;
        } else {
          // Calculate based on time used
          const timeIntervals = Math.ceil(durationMinutes / (pricing.time_limit_minutes || 60));
          totalAmount = timeIntervals * pricing.price;
        }
      }
      
      const completedSession: TableSession = {
        ...session,
        end_time: endTime,
        total_amount: totalAmount,
        status: 'completed'
      };
      
      setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
      setCompletedSessions([...completedSessions, completedSession]);
      updateTableStatus(session.table_id, 'available');
    }
  };
  
  // Game operations for ActiveGame
  const addFrame = (gameId: string, winner: string, loser: string) => {
    setGames(games.map(game => {
      if (game.id === gameId) {
        const frames = game.frames || [];
        return {
          ...game,
          frames: [...frames, { id: `frame-${frames.length + 1}`, winner, loser }]
        };
      }
      return game;
    }));
  };
  
  const endGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      updateTableStatus(game.tableId, 'available');
      // You could also track game history here
    }
  };
  
  // Canteen operations
  const addToCart = (item: CanteenItem, quantity: number, sessionId?: number) => {
    const existingItem = cart.find(cartItem => cartItem.item.id === item.id);
    
    if (existingItem) {
      setCart(
        cart.map(cartItem => 
          cartItem.item.id === item.id ? 
          { ...cartItem, quantity: cartItem.quantity + quantity } : 
          cartItem
        )
      );
    } else {
      setCart([...cart, { item, quantity }]);
    }
  };
  
  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(cartItem => cartItem.item.id !== itemId));
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  const placeOrder = (servedById: number, sessionId?: number) => {
    if (cart.length === 0) return;
    
    const newOrders = cart.map(cartItem => ({
      id: canteenOrders.length + cart.length + 1,
      session_id: sessionId || null,
      item_id: cartItem.item.id,
      item_name: cartItem.item.name,
      quantity: cartItem.quantity,
      total_price: cartItem.item.price * cartItem.quantity,
      order_time: new Date().toISOString(),
      served_by: servedById
    }));
    
    setCanteenOrders([...canteenOrders, ...newOrders]);
    
    // Update stock levels
    cart.forEach(cartItem => {
      updateCanteenItemStock(
        cartItem.item.id, 
        cartItem.item.stock_quantity - cartItem.quantity
      );
    });
    
    clearCart();
  };
  
  // Game types and pricing
  const addGameType = (name: string) => {
    const newGameType: GameType = {
      id: gameTypes.length + 1,
      name
    };
    setGameTypes([...gameTypes, newGameType]);
  };
  
  const updateGamePricing = (pricing: Omit<GamePricing, 'id' | 'created_at'>) => {
    const existingPricing = gamePricings.find(
      p => p.table_id === pricing.table_id && p.game_type_id === pricing.game_type_id
    );
    
    if (existingPricing) {
      setGamePricings(gamePricings.map(p => 
        (p.table_id === pricing.table_id && p.game_type_id === pricing.game_type_id) ? 
        { ...p, ...pricing } : p
      ));
    } else {
      const newPricing: GamePricing = {
        ...pricing,
        id: gamePricings.length + 1,
        created_at: new Date().toISOString()
      };
      setGamePricings([...gamePricings, newPricing]);
    }
  };
  
  // Canteen inventory
  const addCanteenCategory = (name: string) => {
    const newCategory: CanteenCategory = {
      id: canteenCategories.length + 1,
      name
    };
    setCanteenCategories([...canteenCategories, newCategory]);
  };
  
  const addCanteenItem = (item: Omit<CanteenItem, 'id' | 'created_at'>) => {
    const newItem: CanteenItem = {
      ...item,
      id: canteenItems.length + 1,
      created_at: new Date().toISOString()
    };
    setCanteenItems([...canteenItems, newItem]);
  };
  
  const updateCanteenItemStock = (itemId: number, newQuantity: number) => {
    setCanteenItems(canteenItems.map(item => 
      item.id === itemId ? { ...item, stock_quantity: Math.max(0, newQuantity) } : item
    ));
  };
  
  // Invoicing
  const createInvoice = (sessionId: number): string => {
    const session = completedSessions.find(s => s.id === sessionId);
    if (!session) return '';
    
    // Get game details
    const gameType = gameTypes.find(gt => gt.id === session.game_type_id);
    const gameName = gameType ? gameType.name : 'Game';
    
    // Get related orders
    const sessionOrders = canteenOrders.filter(order => order.session_id === sessionId);
    
    const gameItem: InvoiceItem = {
      id: `game-${session.id}`,
      type: 'game',
      name: `${gameName} Session`,
      quantity: 1,
      price: session.total_amount || 0,
      total: session.total_amount || 0
    };
    
    const orderItems: InvoiceItem[] = sessionOrders.map(order => ({
      id: `order-${order.id}`,
      type: 'canteen',
      name: order.item_name || `Item #${order.item_id}`,
      quantity: order.quantity,
      price: order.total_price / order.quantity,
      total: order.total_price
    }));
    
    const allItems = [gameItem, ...orderItems];
    
    const newInvoice: Invoice = {
      id: `inv-${invoices.length + 1}`,
      session_id: sessionId,
      tableId: session.table_id, // Add tableId for reference
      date: new Date().toISOString(),
      items: allItems,
      total: allItems.reduce((sum, item) => sum + item.total, 0),
      isPaid: false
    };
    
    setInvoices([...invoices, newInvoice]);
    
    return newInvoice.id;
  };
  
  const payInvoice = (id: string) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, isPaid: true } : inv));
  };
  
  return (
    <DataContext.Provider
      value={{
        // Data
        tables,
        gameTypes,
        gamePricings,
        canteenCategories,
        canteenItems,
        cart,
        activeSessions,
        completedSessions,
        canteenOrders,
        invoices,
        games,
        
        // Refresh functions
        refreshTables,
        refreshGameTypes,
        
        // Functions
        addTable,
        updateTableStatus,
        startSession,
        endSession,
        addFrame,
        endGame,
        addToCart,
        removeFromCart,
        clearCart,
        placeOrder,
        addGameType,
        updateGamePricing,
        addCanteenCategory,
        addCanteenItem,
        updateCanteenItemStock,
        createInvoice,
        payInvoice
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
