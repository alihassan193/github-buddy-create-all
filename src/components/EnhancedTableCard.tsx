
import { useState, useEffect, useCallback } from "react";
import { SnookerTable } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/DataContext";
import { startSession, announceGameResult, cancelSession } from "@/services/sessionService";
import { Play, Trophy, X, Settings, Clock } from "lucide-react";
import PlayerSearchInput from "./PlayerSearchInput";
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
  const { gameTypes, gamePricings, refreshTables, clubId, user } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [gameTypeId, setGameTypeId] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState<any>(null);
  const [playerName, setPlayerName] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [sessionType, setSessionType] = useState<'single' | 'double'>('single');
  const [isAnnouncingResult, setIsAnnouncingResult] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [canCancel, setCanCancel] = useState(false);
  
  // Filter pricing for this table
  const tablePricings = gamePricings.filter(p => p.table_id === table.id);
  
  // Find active session for this table
  const activeSession = activeSessions.find(session => session.table_id === table.id);
  
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
  
  const handlePlayerSelect = (player: any, name: string) => {
    setSelectedPlayer(player);
    setPlayerName(name);
  };

  const handlePlayerPairSelect = (player1: any, player2: any, name1: string, name2: string) => {
    setSelectedPlayer(player1);
    setSelectedPlayer2(player2);
    setPlayerName(name1);
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
    
    if (!playerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter or select a player",
        variant: "destructive",
      });
      return;
    }

    if (sessionType === 'double' && !player2Name.trim()) {
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
        estimated_duration: 120,
        is_guest: !selectedPlayer,
        ...(selectedPlayer && { player_id: selectedPlayer.id }),
        ...((!selectedPlayer && playerName.trim()) && { guest_player_name: playerName.trim() }),
        ...(sessionType === 'double' && {
          player_2_id: selectedPlayer2?.id,
          is_guest_2: !selectedPlayer2,
          ...((!selectedPlayer2 && player2Name.trim()) && { guest_player_2_name: player2Name.trim() })
        })
      };

      await startSession(sessionData);
      
      toast({
        title: "Session Started",
        description: `Session started on ${table.table_number}`,
      });
      
      setOpen(false);
      setPlayerName('');
      setPlayer2Name('');
      setSelectedPlayer(null);
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
      return `${gameType.name} ($${pricing.price})`;
    } else {
      return `${gameType.name} ($${pricing.price}/${pricing.time_limit_minutes} min)`;
    }
  };

  const getSessionDuration = () => {
    if (!activeSession?.start_time) return '';
    return formatDistanceToNow(new Date(activeSession.start_time), { addSuffix: false });
  };

  const canManageTables = user?.permissions?.can_manage_tables || user?.role === 'super_admin';
  
  return (
    <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
      <CardHeader className={`py-4 ${table.status === 'occupied' ? 'bg-red-50' : table.status === 'maintenance' ? 'bg-yellow-50' : table.status === 'reserved' ? 'bg-blue-50' : 'bg-green-50'}`}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {table.table_number}
              {canManageTables && (
                <TableSettingsDialog table={table} />
              )}
            </CardTitle>
            <CardDescription>
              {activeSession ? (
                <div className="space-y-1">
                  <div>{activeSession.player_1_name} vs {activeSession.player_2_name}</div>
                  <div className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getSessionDuration()}
                  </div>
                </div>
              ) : (
                tablePricings.length > 0 
                  ? `${tablePricings.length} game types available`
                  : 'No pricing set'
              )}
            </CardDescription>
          </div>
          <Badge className={statusColors[table.status]}>
            {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="py-4">
        {/* Session History Button - 80% width at top */}
        <div className="flex justify-center mb-4">
          <TableSessionHistoryDialog 
            tableId={table.id} 
            tableNumber={table.table_number} 
          />
        </div>
        
        <div className="flex items-center justify-center h-32 felt-bg rounded-md">
          <div className="grid grid-cols-3 w-full h-full">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-300"></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-black rounded-full"></div>
            </div>
          </div>
        </div>
        
        {activeSession && (
          <div className="mt-4 space-y-2">
            {activeSession.canteen_amount > 0 && (
              <CanteenOrderDialog sessionId={activeSession.id} />
            )}
            
            <SessionPOSDialog sessionId={activeSession.id} />
            
            <div className="flex gap-2">
              {canCancel ? (
                <Button 
                  onClick={handleCancelSession}
                  disabled={isCancelling}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  {isCancelling ? 'Cancelling...' : 'Cancel Session'}
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => handleAnnounceResult('player_1')}
                    disabled={isAnnouncingResult}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Trophy className="h-4 w-4 mr-1" />
                    {activeSession.player_1_name} Lost
                  </Button>
                  <Button 
                    onClick={() => handleAnnounceResult('player_2')}
                    disabled={isAnnouncingResult}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Trophy className="h-4 w-4 mr-1" />
                    {activeSession.player_2_name} Lost
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center py-4">
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
                  Select players and game type to start a session.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={sessionType === 'single' ? 'default' : 'outline'}
                    onClick={() => setSessionType('single')}
                  >
                    Single Player
                  </Button>
                  <Button
                    variant={sessionType === 'double' ? 'default' : 'outline'}
                    onClick={() => setSessionType('double')}
                  >
                    Two Players
                  </Button>
                </div>
                
                {sessionType === 'single' ? (
                  <PlayerSearchInput onPlayerSelect={handlePlayerSelect} />
                ) : (
                  <PlayerPairSearchInput onPlayerPairSelect={handlePlayerPairSelect} />
                )}
                
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
    </Card>
  );
};

export default EnhancedTableCard;
