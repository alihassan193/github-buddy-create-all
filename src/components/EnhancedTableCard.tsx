
import { useState, useEffect } from "react";
import { SnookerTable } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { startSession, announceGameResult, cancelSession } from "@/services/sessionService";
import { Play, Trophy, X, Settings, Clock, DollarSign, History } from "lucide-react";
import PlayerPairSearchInput from "./PlayerPairSearchInput";
import TableSettingsDialog from "./TableSettingsDialog";
import SessionPOSDialog from "./SessionPOSDialog";
import CanteenOrderDialog from "./CanteenOrderDialog";
import { formatDistanceToNow } from "date-fns";
import TableSessionHistoryDialog from "./TableSessionHistoryDialog";

interface EnhancedTableCardProps {
  table: SnookerTable;
  activeSessions: any[];
}

const EnhancedTableCard = ({ table, activeSessions }: EnhancedTableCardProps) => {
  const { gameTypes, gamePricings, refreshTables, clubId } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [gameTypeId, setGameTypeId] = useState<number | null>(null);
  const [selectedPlayer1, setSelectedPlayer1] = useState<any>(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState<any>(null);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isAnnouncingResult, setIsAnnouncingResult] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [canCancel, setCanCancel] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [canteenOrderOpen, setCanteenOrderOpen] = useState(false);
  
  // Filter pricing for this table
  const tablePricings = gamePricings.filter(p => p.table_id === table.id);
  
  // Find active session for this table
  const activeSession = activeSessions.find(session => session.table_id === table.id);
  
  // Update current time every second for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Check if session can be cancelled (within 1 minute of start)
  useEffect(() => {
    if (activeSession?.start_time) {
      const startTime = new Date(activeSession.start_time);
      setSessionStartTime(startTime);
      
      const checkCancelTimeout = () => {
        const now = new Date();
        const timeDiff = now.getTime() - startTime.getTime();
        const canCancelSession = timeDiff < 60000; // 1 minute in milliseconds
        setCanCancel(canCancelSession);
      };
      
      checkCancelTimeout();
      const interval = setInterval(checkCancelTimeout, 1000);
      
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const handlePlayersSelect = (player1: any, player2: any, name1: string, name2: string) => {
    setSelectedPlayer1(player1);
    setSelectedPlayer2(player2);
    setPlayer1Name(name1);
    setPlayer2Name(name2);
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
    
    if (!player1Name.trim()) {
      toast({
        title: "Error",
        description: "Please enter or select first player",
        variant: "destructive",
      });
      return;
    }

    if (!player2Name.trim()) {
      toast({
        title: "Error",
        description: "Please enter or select second player",
        variant: "destructive",
      });
      return;
    }

    const selectedPricing = tablePricings.find(p => p.game_type_id === gameTypeId);
    if (!selectedPricing) {
      toast({
        title: "Error",
        description: "No pricing found for selected game type",
        variant: "destructive",
      });
      return;
    }
    
    setIsStarting(true);
    
    try {
      const sessionData = {
        table_id: table.id,
        game_type_id: gameTypeId,
        pricing_id: selectedPricing.id,
        club_id: clubId || 1,
        ...(selectedPlayer1 && { player_id: selectedPlayer1.id }),
        ...((!selectedPlayer1 && player1Name.trim()) && { guest_player_name: player1Name.trim() }),
        ...(selectedPlayer2 && { player_2_id: selectedPlayer2.id }),
        ...((!selectedPlayer2 && player2Name.trim()) && { guest_player_2_name: player2Name.trim() })
      };

      await startSession(sessionData);
      
      toast({
        title: "Session Started",
        description: `Session started on ${table.table_number}`,
      });
      
      setOpen(false);
      setPlayer1Name('');
      setPlayer2Name('');
      setSelectedPlayer1(null);
      setSelectedPlayer2(null);
      setGameTypeId(null);
      
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

  const handleCancelSession = async () => {
    if (!activeSession) return;
    
    setIsCancelling(true);
    try {
      await cancelSession(activeSession.id);
      
      toast({
        title: "Session Cancelled",
        description: "The session has been cancelled successfully",
      });
      
      refreshTables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel session",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAnnounceResult = async (loserPlayer: 'player_1' | 'player_2') => {
    if (!activeSession) return;
    
    setIsAnnouncingResult(true);
    try {
      await announceGameResult(activeSession.id, loserPlayer);
      
      toast({
        title: "Result Announced",
        description: "Game result has been announced successfully",
      });
      
      refreshTables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to announce result",
        variant: "destructive",
      });
    } finally {
      setIsAnnouncingResult(false);
    }
  };
  
  const statusColors = {
    available: "bg-green-500",
    occupied: "bg-red-500",
    maintenance: "bg-yellow-500",
    reserved: "bg-blue-500"
  };
  
  const getGameTypeLabel = (gameTypeId: number) => {
    const gameType = gameTypes.find(gt => gt.id === gameTypeId);
    const pricing = tablePricings.find(p => p.game_type_id === gameTypeId);
    
    if (!gameType || !pricing) return '';
    
    if (pricing.is_unlimited) {
      return `${gameType.name} (PKR ${pricing.price})`;
    } else {
      return `${gameType.name} (PKR ${pricing.price}/${pricing.time_limit_minutes} min)`;
    }
  };

  const getSessionDuration = () => {
    if (!activeSession?.start_time) return '';
    return formatDistanceToNow(new Date(activeSession.start_time), { addSuffix: false });
  };

  const calculateCurrentPrice = () => {
    if (!activeSession?.start_time) return 0;
    
    const pricing = gamePricings.find(p => p.id === activeSession.pricing_id);
    if (!pricing) return 0;
    
    if (pricing.is_unlimited) {
      return pricing.price;
    }
    
    const startTime = new Date(activeSession.start_time);
    const elapsedMinutes = Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60));
    const timeBlocks = Math.ceil(elapsedMinutes / pricing.time_limit_minutes);
    
    return timeBlocks * pricing.price;
  };

  const canManageTables = user?.permissions?.can_manage_tables || user?.role === 'super_admin';
  
  return (
    <Card className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{table.table_number}</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {table.table_type || 'Standard'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${statusColors[table.status]} text-white text-xs px-2 py-1`}>
              {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
            </Badge>
            {canManageTables && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        {/* Session History Button */}
        <div className="flex justify-center mb-4">
          <TableSessionHistoryDialog 
            tableId={table.id} 
            tableNumber={table.table_number} 
          />
        </div>

        {/* Snooker Table Image */}
        <div className="relative bg-green-600 rounded-lg h-32 mb-4 flex items-center justify-center">
          <img 
            src="/lovable-uploads/a7277e8c-fb74-4d98-ba88-46c0fc14ebbb.png" 
            alt="Snooker Table"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            {table.table_number}
          </div>
        </div>

        {/* Session Info */}
        {activeSession && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-blue-600">
              <span className="mr-2">👥</span>
              <span>{activeSession.player_1_name} vs {activeSession.player_2_name}</span>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <span className="mr-2">🏆</span>
              <span>Frames</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{getSessionDuration()}</span>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>PKR {calculateCurrentPrice()}.00</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {activeSession && (
          <div className="space-y-2">
            {canCancel ? (
              <Button 
                onClick={handleCancelSession}
                disabled={isCancelling}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                {isCancelling ? 'Cancelling...' : 'Cancel Session'}
              </Button>
            ) : (
              <Button 
                onClick={() => handleAnnounceResult('player_1')}
                disabled={isAnnouncingResult}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Announce Loser
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCanteenOrderOpen(true)}
                className="flex-1"
              >
                Canteen Order
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPosOpen(true)}
                className="flex-1"
              >
                <span>🛒</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        {table.status === 'available' && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={tablePricings.length === 0}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {tablePricings.length === 0 ? "No Game Types Available" : "Start Session"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a New Session</DialogTitle>
                <DialogDescription>
                  Select two players and game type to start a session.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <PlayerPairSearchInput onPlayersSelect={handlePlayersSelect} />
                
                <div className="grid grid-cols-1 gap-2">
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
                  {isStarting ? 'Starting...' : 'Start Session'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>

      {/* Dialogs */}
      {canManageTables && (
        <TableSettingsDialog 
          table={table} 
          open={settingsOpen} 
          onOpenChange={setSettingsOpen}
        />
      )}
      
      {activeSession && (
        <>
          <CanteenOrderDialog
            open={canteenOrderOpen}
            onOpenChange={setCanteenOrderOpen}
            session={activeSession}
          />
          
          <SessionPOSDialog
            open={posOpen}
            onOpenChange={setPosOpen}
            sessionId={activeSession.id}
            sessionInfo={{
              table_number: table.table_number,
              player_names: `${activeSession.player_1_name} vs ${activeSession.player_2_name}`
            }}
          />
        </>
      )}
    </Card>
  );
};

export default EnhancedTableCard;
