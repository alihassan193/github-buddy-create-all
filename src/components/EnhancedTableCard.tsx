
import { useState, useEffect } from "react";
import { SnookerTable, GameType } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/DataContext";
import { startSession, endSession } from "@/services/sessionService";
import { Play, Clock, User, Settings, Coffee, ShoppingCart, Stop } from "lucide-react";

interface EnhancedTableCardProps {
  table: SnookerTable;
  activeSessions?: any[];
}

const EnhancedTableCard = ({ table, activeSessions = [] }: EnhancedTableCardProps) => {
  const { gameTypes, gamePricings, refreshTables } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [gameTypeId, setGameTypeId] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  
  // Find active session for this table
  const activeSession = activeSessions.find(session => session.table_id === table.id);
  
  // Filter pricing for this table
  const tablePricings = gamePricings.filter(p => p.table_id === table.id);
  
  // Real-time timer for active sessions
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeSession) {
      interval = setInterval(() => {
        const startTime = new Date(activeSession.start_time).getTime();
        const now = new Date().getTime();
        const duration = Math.floor((now - startTime) / 1000 / 60); // in minutes
        setSessionDuration(duration);
      }, 1000); // Update every second
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);
  
  const handleStartSession = async () => {
    if (!gameTypeId) {
      toast({
        title: "Error",
        description: "Please select a game type",
        variant: "destructive",
      });
      return;
    }
    
    if (!playerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter player name",
        variant: "destructive",
      });
      return;
    }
    
    setIsStarting(true);
    
    try {
      await startSession({
        table_id: table.id,
        game_type_id: gameTypeId,
        player_name: playerName.trim(),
        is_guest: true
      });
      
      toast({
        title: "Session Started",
        description: `Session started on Table ${table.table_number} for ${playerName}`,
      });
      
      setOpen(false);
      setPlayerName('');
      setGameTypeId(null);
      
      // Refresh tables to update status
      refreshTables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start session",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };
  
  const handleEndSession = async () => {
    if (!activeSession) return;
    
    setIsEnding(true);
    
    try {
      await endSession(activeSession.id);
      
      toast({
        title: "Session Ended",
        description: `Session ended for Table ${table.table_number}`,
      });
      
      // Refresh tables to update status
      refreshTables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to end session",
        variant: "destructive",
      });
    } finally {
      setIsEnding(false);
    }
  };
  
  const getStatusColor = () => {
    switch (table.status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'reserved': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getGameTypeLabel = (gameTypeId: number) => {
    const gameType = gameTypes.find(gt => gt.id === gameTypeId);
    const pricing = tablePricings.find(p => p.game_type_id === gameTypeId);
    
    if (!gameType || !pricing) return '';
    
    if (pricing.is_unlimited) {
      return `${gameType.name} ($${pricing.price})`;
    } else {
      return `${gameType.name} ($${pricing.price}/${pricing.time_limit_minutes} min)`;
    }
  };
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  const calculateCurrentCost = () => {
    if (!activeSession) return 0;
    
    const pricing = tablePricings.find(p => p.game_type_id === activeSession.game_type_id);
    if (!pricing) return 0;
    
    if (pricing.is_unlimited) {
      return pricing.price;
    } else {
      const timeSlots = Math.ceil(sessionDuration / (pricing.time_limit_minutes || 60));
      return timeSlots * pricing.price;
    }
  };
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
      table.status === 'occupied' ? 'ring-2 ring-red-200' : 
      table.status === 'available' ? 'ring-2 ring-green-200' : 
      'ring-2 ring-yellow-200'
    }`}>
      {/* Status indicator */}
      <div className={`absolute top-0 right-0 w-4 h-4 rounded-bl-lg ${getStatusColor()}`} />
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">Table {table.table_number}</h3>
            <p className="text-sm text-gray-600 capitalize">{table.table_type || 'Standard'}</p>
          </div>
          <Badge variant={table.status === 'available' ? 'default' : 'secondary'} 
                 className={`${getStatusColor()} text-white`}>
            {table.status?.charAt(0).toUpperCase() + table.status?.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Visual Table Representation */}
        <div className="relative bg-green-700 rounded-lg p-4 aspect-[2/1] flex items-center justify-center">
          {/* Table felt background */}
          <div className="w-full h-full bg-green-600 rounded border-4 border-yellow-600 relative">
            {/* Snooker balls representation */}
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 flex space-x-1">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-white rounded-full border border-gray-300"></div>
            </div>
            
            {/* Pockets */}
            <div className="absolute top-0 left-0 w-3 h-3 bg-black rounded-full -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-black rounded-full translate-x-1 -translate-y-1"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 bg-black rounded-full -translate-x-1 translate-y-1"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-black rounded-full translate-x-1 translate-y-1"></div>
            <div className="absolute top-1/2 left-0 w-3 h-3 bg-black rounded-full -translate-x-1 -translate-y-1/2"></div>
            <div className="absolute top-1/2 right-0 w-3 h-3 bg-black rounded-full translate-x-1 -translate-y-1/2"></div>
          </div>
        </div>
        
        {/* Session Information */}
        {activeSession ? (
          <div className="bg-red-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-red-600" />
              <span className="font-medium">{activeSession.player_name || 'Player'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-sm font-mono">
                {formatDuration(sessionDuration)} • ${calculateCurrentCost().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Game: {gameTypes.find(gt => gt.id === activeSession.game_type_id)?.name}
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-8">
                  <ShoppingCart className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleEndSession}
                  disabled={isEnding}
                  className="h-8"
                >
                  {isEnding ? (
                    <Clock className="w-3 h-3 animate-spin" />
                  ) : (
                    <Stop className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-700 text-center font-medium">Table Available</p>
            <p className="text-sm text-green-600 text-center">
              {tablePricings.length} game types available
            </p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {table.status === 'available' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1" disabled={tablePricings.length === 0}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Game
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Session - Table {table.table_number}</DialogTitle>
                  <DialogDescription>
                    Enter player details and select game type to start.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="gameType">Game Type</Label>
                    <Select onValueChange={(value) => setGameTypeId(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select game type" />
                      </SelectTrigger>
                      <SelectContent>
                        {tablePricings.map(pricing => (
                          <SelectItem 
                            key={pricing.game_type_id} 
                            value={pricing.game_type_id.toString()}
                          >
                            {getGameTypeLabel(pricing.game_type_id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="playerName">Player Name</Label>
                    <Input 
                      id="playerName" 
                      placeholder="Enter player name" 
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleStartSession} disabled={isStarting}>
                    {isStarting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      'Start Session'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="outline" size="sm">
            <Coffee className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedTableCard;
