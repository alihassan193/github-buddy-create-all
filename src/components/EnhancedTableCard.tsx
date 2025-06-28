
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Play, CircleStop, DollarSign, User, ShoppingCart, Trophy, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/DataContext";
import { startTwoPlayerSession, endSession, announceGameResult } from "@/services/sessionService";
import PlayerPairSearchInput from "./PlayerPairSearchInput";
import SessionPOSDialog from "./SessionPOSDialog";

interface TableCardProps {
  table: any;
  activeSessions?: any[];
}

const EnhancedTableCard = ({ table, activeSessions = [] }: TableCardProps) => {
  const { gameTypes, gamePricings, clubId } = useData();
  const { toast } = useToast();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showPOSDialog, setShowPOSDialog] = useState(false);
  const [selectedPlayer1, setSelectedPlayer1] = useState<any>(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState<any>(null);
  const [gameTypeId, setGameTypeId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isAnnouncingResult, setIsAnnouncingResult] = useState(false);
  const [sessionTimer, setSessionTimer] = useState<string>('00:00:00');
  const [sessionCost, setSessionCost] = useState<number>(0);
  const [winner, setWinner] = useState<'player_1' | 'player_2' | ''>('');

  // Find active session for this table
  const activeSession = activeSessions.find(session => session.table_id === table.id);

  // Update timer and cost for active sessions
  useEffect(() => {
    if (!activeSession) return;

    const updateTimer = () => {
      const startTime = new Date(activeSession.start_time).getTime();
      const now = Date.now();
      const diff = now - startTime;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setSessionTimer(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      // Calculate cost based on pricing
      const pricing = gamePricings.find(p => 
        p.table_id === table.id && 
        p.game_type_id === activeSession.game_type_id
      );
      
      if (pricing) {
        if (pricing.is_unlimited) {
          setSessionCost(pricing.price);
        } else {
          const minutesElapsed = Math.floor(diff / (1000 * 60));
          setSessionCost((minutesElapsed * pricing.price) / 60);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession, gamePricings, table.id]);

  const getStatusColor = () => {
    if (activeSession) return "bg-red-500";
    switch (table.status) {
      case 'available': return "bg-green-500";
      case 'occupied': return "bg-red-500";
      case 'maintenance': return "bg-yellow-500";
      case 'reserved': return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    if (activeSession) return "Occupied";
    return table.status?.charAt(0).toUpperCase() + table.status?.slice(1) || "Unknown";
  };

  const handleStartSession = async () => {
    if (!gameTypeId) {
      toast({
        title: "Error",
        description: "Please select a game type",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPlayer1 || !selectedPlayer2) {
      toast({
        title: "Error",
        description: "Please select both players",
        variant: "destructive"
      });
      return;
    }

    // Find pricing for selected game type
    const pricing = gamePricings.find(p => 
      p.table_id === table.id && 
      p.game_type_id === parseInt(gameTypeId)
    );

    if (!pricing) {
      toast({
        title: "Error",
        description: "No pricing found for this game type",
        variant: "destructive"
      });
      return;
    }

    setIsStarting(true);
    try {
      const sessionData = {
        table_id: table.id,
        game_type_id: parseInt(gameTypeId),
        player_id: selectedPlayer1.id,
        player_2_id: selectedPlayer2.id,
        pricing_id: parseInt(pricing.id),
        club_id: clubId || 1
      };

      await startTwoPlayerSession(sessionData);
      
      toast({
        title: "Session Started",
        description: `Session started for ${selectedPlayer1.first_name} ${selectedPlayer1.last_name} vs ${selectedPlayer2.first_name} ${selectedPlayer2.last_name}`,
      });

      // Reset form
      setSelectedPlayer1(null);
      setSelectedPlayer2(null);
      setGameTypeId('');
      setNotes('');
      setShowStartDialog(false);
      
      // Refresh page to show updated status
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start session",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnnounceResult = async () => {
    if (!winner) {
      toast({
        title: "Error",
        description: "Please select a winner",
        variant: "destructive"
      });
      return;
    }

    setIsAnnouncingResult(true);
    try {
      const loser = winner === 'player_1' ? 'player_2' : 'player_1';
      await announceGameResult(activeSession.id, winner, loser);

      toast({
        title: "Result Announced",
        description: `Winner: ${winner === 'player_1' ? 'Player 1' : 'Player 2'}`,
      });

      setShowResultDialog(false);
      setWinner('');
      
      // Show end session dialog after announcing result
      setTimeout(() => setShowEndDialog(true), 500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to announce result",
        variant: "destructive"
      });
    } finally {
      setIsAnnouncingResult(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    setIsEnding(true);
    try {
      await endSession(activeSession.id, notes.trim() || undefined);

      toast({
        title: "Session Ended",
        description: `Session ended. Total amount: Rs.${sessionCost.toFixed(2)}`,
      });

      setShowEndDialog(false);
      setNotes('');
      
      // Refresh page to show updated status
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to end session",
        variant: "destructive"
      });
    } finally {
      setIsEnding(false);
    }
  };

  const handlePlayersSelect = (player1: any, player2: any) => {
    setSelectedPlayer1(player1);
    setSelectedPlayer2(player2);
  };

  const getPlayerNames = () => {
    if (!activeSession) return '';
    
    const player1Name = activeSession.player ? `${activeSession.player.first_name} ${activeSession.player.last_name}` : 'Player 1';
    const player2Name = activeSession.player2 ? `${activeSession.player2.first_name} ${activeSession.player2.last_name}` : 'Player 2';
    
    return `${player1Name} vs ${player2Name}`;
  };

  return (
    <>
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-3 h-full ${getStatusColor()}`} />
        
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Table {table.table_number}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {table.table_type || 'Standard'}
              </Badge>
            </div>
            <Badge className={getStatusColor().replace('bg-', 'bg-opacity-20 text-')}>
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Snooker table background with better styling */}
          <div 
            className="relative h-32 rounded-lg bg-cover bg-center bg-no-repeat shadow-inner"
            style={{ 
              backgroundImage: `url('/lovable-uploads/a40fb048-a62d-4857-ba5b-d25bdb9d95cd.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-lg"></div>
            <div className="absolute bottom-2 left-2 text-white font-semibold text-sm drop-shadow-lg">
              Table {table.table_number}
            </div>
          </div>

          {activeSession ? (
            // Active session display
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">
                  {getPlayerNames()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="font-mono text-lg font-bold">{sessionTimer}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">Rs.{sessionCost.toFixed(2)}</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowResultDialog(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={activeSession.game_result_announced}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  {activeSession.game_result_announced ? 'Result Announced' : 'Announce Winner'}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowPOSDialog(true)}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
              
              {activeSession.game_result_announced && (
                <Button 
                  onClick={() => setShowEndDialog(true)}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <CircleStop className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              )}
            </div>
          ) : (
            // Available table display
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                Rate: Rs.{table.hourly_rate || 15}/hour
              </div>
              
              <Button 
                onClick={() => setShowStartDialog(true)}
                className="w-full"
                disabled={table.status === 'maintenance'}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Session Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start Session - Table {table.table_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <PlayerPairSearchInput onPlayersSelect={handlePlayersSelect} />
            
            <div className="space-y-2">
              <Label>Game Type</Label>
              <Select value={gameTypeId} onValueChange={setGameTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  {gameTypes.map((gameType) => (
                    <SelectItem key={gameType.id} value={gameType.id.toString()}>
                      {gameType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowStartDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleStartSession} disabled={isStarting} className="flex-1">
                {isStarting ? 'Starting...' : 'Start Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Announce Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Announce Winner - Table {table.table_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Winner</Label>
              <Select value={winner} onValueChange={(value: 'player_1' | 'player_2') => setWinner(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose the winner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player_1">
                    Player 1: {activeSession?.player ? `${activeSession.player.first_name} ${activeSession.player.last_name}` : 'Player 1'}
                  </SelectItem>
                  <SelectItem value="player_2">
                    Player 2: {activeSession?.player2 ? `${activeSession.player2.first_name} ${activeSession.player2.last_name}` : 'Player 2'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowResultDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleAnnounceResult} 
                disabled={isAnnouncingResult} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isAnnouncingResult ? 'Announcing...' : 'Announce Winner'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>End Session - Table {table.table_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Session Duration</div>
              <div className="text-2xl font-bold">{sessionTimer}</div>
              <div className="text-sm text-gray-600 mt-2">Total Amount</div>
              <div className="text-xl font-bold text-green-600">Rs.{sessionCost.toFixed(2)}</div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEndDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleEndSession} 
                disabled={isEnding} 
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isEnding ? 'Ending...' : 'End Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session POS Dialog */}
      <SessionPOSDialog
        open={showPOSDialog}
        onOpenChange={setShowPOSDialog}
        sessionId={activeSession?.id}
        sessionInfo={{
          table_number: `Table ${table.table_number}`,
          player_names: getPlayerNames()
        }}
      />
    </>
  );
};

export default EnhancedTableCard;
