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
import { useLocalTableStatus } from "@/hooks/useLocalTableStatus";
import { Play, Clock, User, Settings, Coffee, ShoppingCart, CircleStop } from "lucide-react";
import PlayerSearchInput from "./PlayerSearchInput";
import TableSettingsDialog from "./TableSettingsDialog";
import CanteenOrderDialog from "./CanteenOrderDialog";

interface EnhancedTableCardProps {
  table: SnookerTable;
  activeSessions?: any[];
}

const EnhancedTableCard = ({ table, activeSessions = [] }: EnhancedTableCardProps) => {
  const { gameTypes, gamePricings, refreshTables } = useData();
  const { toast } = useToast();
  const { getTableStatus } = useLocalTableStatus();
  const [open, setOpen] = useState(false);
  const [gameTypeId, setGameTypeId] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [playerName, setPlayerName] = useState('');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCanteen, setShowCanteen] = useState(false);
  
  // Get current table status (local override or default)
  const currentStatus = getTableStatus(table.id, table.status);
  
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
  
  const handlePlayerSelect = (player: any, name: string) => {
    setSelectedPlayer(player);
    setPlayerName(name);
  };
  
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
        description: "Please enter or select a player",
        variant: "destructive",
      });
      return;
    }

    // Find pricing for the selected game type
    const pricing = tablePricings.find(p => p.game_type_id === gameTypeId);
    if (!pricing) {
      toast({
        title: "Error",
        description: "Pricing not found for selected game type",
        variant: "destructive",
      });
      return;
    }
    
    setIsStarting(true);
    
    try {
      const sessionData = {
        table_id: table.id,
        game_type_id: gameTypeId,
        pricing_id: pricing.id,
        player_name: playerName.trim(),
        is_guest: !selectedPlayer,
        ...(selectedPlayer && { player_id: selectedPlayer.id })
      };

      await startSession(sessionData);
      
      toast({
        title: "Session Started",
        description: `Session started on Table ${table.table_number} for ${playerName}`,
      });
      
      setOpen(false);
      setPlayerName('');
      setSelectedPlayer(null);
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
    switch (currentStatus) {
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
      return `${gameType.name} (Rs.${pricing.price})`;
    } else {
      return `${gameType.name} (Rs.${pricing.price}/${pricing.time_limit_minutes} min)`;
    }
  };
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  const calculateCurrentCost = () => {
    if (!activeSession || !activeSession.pricing) return 0;
    
    const pricing = activeSession.pricing;
    
    if (pricing.is_unlimited_time) {
      return parseFloat(pricing.fixed_price || pricing.price_per_minute || '0');
    } else {
      const timeSlots = Math.ceil(sessionDuration / (pricing.time_limit_minutes || 60));
      return timeSlots * parseFloat(pricing.price_per_minute || '0');
    }
  };

  const getPlayerName = (session: any) => {
    if (session.is_guest && session.guest_player_name) {
      return session.guest_player_name;
    }
    if (session.player) {
      return `${session.player.first_name || ''} ${session.player.last_name || ''}`.trim() || session.player.phone;
    }
    return 'Guest Player';
  };
  
  return (
    <>
      <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
        currentStatus === 'occupied' ? 'ring-2 ring-red-200' : 
        currentStatus === 'available' ? 'ring-2 ring-green-200' : 
        currentStatus === 'maintenance' ? 'ring-2 ring-yellow-200' :
        'ring-2 ring-blue-200'
      }`}>
        {/* Status indicator */}
        <div className={`absolute top-0 right-0 w-4 h-4 rounded-bl-lg ${getStatusColor()}`} />
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">Table {table.table_number}</h3>
              <p className="text-sm text-gray-600 capitalize">{table.table_type || 'Standard'}</p>
            </div>
            <Badge variant={currentStatus === 'available' ? 'default' : 'secondary'} 
                   className={`${getStatusColor()} text-white`}>
              {currentStatus?.charAt(0).toUpperCase() + currentStatus?.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Enhanced Snooker Table Representation */}
          <div className="relative bg-gradient-to-br from-green-800 to-green-900 rounded-lg p-6 aspect-[2/1] flex items-center justify-center shadow-inner">
            {/* Table felt background with realistic proportions */}
            <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-700 rounded-lg border-4 border-yellow-600 relative shadow-lg">
              {/* Table markings */}
              <div className="absolute inset-2 border border-green-400 rounded opacity-20"></div>
              
              {/* D-shaped area */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-12 border-l-2 border-t-2 border-b-2 border-green-400 rounded-l-full opacity-30"></div>
              
              {/* Center line */}
              <div className="absolute left-1/2 top-2 bottom-2 w-0.5 bg-green-400 opacity-20 transform -translate-x-1/2"></div>
              
              {/* Snooker balls in triangle formation */}
              <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
                {/* Triangle of colored balls */}
                <div className="relative">
                  {/* Back row */}
                  <div className="flex space-x-1 mb-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-amber-600 rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                  </div>
                  {/* Middle rows */}
                  <div className="flex space-x-1 mb-1 ml-1">
                    <div className="w-2 h-2 bg-pink-400 rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-black rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex space-x-1 mb-1 ml-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-amber-600 rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex space-x-1 mb-1 ml-3">
                    <div className="w-2 h-2 bg-pink-400 rounded-full shadow-sm"></div>
                    <div className="w-2 h-2 bg-black rounded-full shadow-sm"></div>
                  </div>
                  {/* Front */}
                  <div className="flex ml-4">
                    <div className="w-2 h-2 bg-black rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
              
              {/* Cue ball */}
              <div className="absolute top-1/2 left-8 transform -translate-y-1/2">
                <div className="w-3 h-3 bg-white rounded-full border border-gray-300 shadow-sm"></div>
              </div>
              
              {/* Corner pockets */}
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-black rounded-full shadow-inner"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full shadow-inner"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-black rounded-full shadow-inner"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full shadow-inner"></div>
              
              {/* Side pockets */}
              <div className="absolute top-1/2 -left-1 w-4 h-6 bg-black rounded-r-full shadow-inner transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-1 w-4 h-6 bg-black rounded-l-full shadow-inner transform -translate-y-1/2"></div>
              
              {/* Table legs indication */}
              <div className="absolute -bottom-3 left-2 w-2 h-3 bg-amber-800 rounded shadow-sm"></div>
              <div className="absolute -bottom-3 right-2 w-2 h-3 bg-amber-800 rounded shadow-sm"></div>
            </div>
          </div>
          
          {/* Session Information */}
          {activeSession ? (
            <div className="bg-red-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-red-600" />
                <span className="font-medium">{getPlayerName(activeSession)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-sm font-mono">
                  {formatDuration(sessionDuration)} • Rs.{parseFloat(activeSession.total_amount || '0').toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {activeSession.session_code} • {activeSession.gameType?.name}
                </span>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8"
                    onClick={() => setShowCanteen(true)}
                  >
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
                      <CircleStop className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-3 rounded-lg ${
              currentStatus === 'available' ? 'bg-green-50' :
              currentStatus === 'maintenance' ? 'bg-yellow-50' :
              currentStatus === 'reserved' ? 'bg-blue-50' : 'bg-gray-50'
            }`}>
              <p className={`text-center font-medium ${
                currentStatus === 'available' ? 'text-green-700' :
                currentStatus === 'maintenance' ? 'text-yellow-700' :
                currentStatus === 'reserved' ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {currentStatus === 'available' ? 'Table Available' :
                 currentStatus === 'maintenance' ? 'Under Maintenance' :
                 currentStatus === 'reserved' ? 'Reserved' : 'Table Unavailable'}
              </p>
              {currentStatus === 'available' && (
                <p className="text-sm text-green-600 text-center">
                  {tablePricings.length} game types available
                </p>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {currentStatus === 'available' && (
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
                      Search for a player or create a new one, then select game type to start.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <PlayerSearchInput onPlayerSelect={handlePlayerSelect} />
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
            
            {/* Only show canteen button when session is active */}
            {activeSession && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCanteen(true)}
              >
                <Coffee className="w-4 h-4" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <TableSettingsDialog 
        table={table}
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      {/* Canteen Dialog - Only render when session is active */}
      {activeSession && (
        <CanteenOrderDialog 
          open={showCanteen}
          onOpenChange={setShowCanteen}
          session={activeSession}
        />
      )}
    </>
  );
};

export default EnhancedTableCard;
