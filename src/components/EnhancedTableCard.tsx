import { useState, useEffect } from "react";
import { SnookerTable } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { startSession, announceGameResult, cancelSession, endSession } from "@/services/sessionService";
import { Play, Trophy, X, Settings, Clock, DollarSign, History, Users, Crown } from "lucide-react";
import PlayerPairSearchInput from "./PlayerPairSearchInput";
import TableSettingsDialog from "./TableSettingsDialog";
import SessionPOSDialog from "./SessionPOSDialog";
import CanteenOrderDialog from "./CanteenOrderDialog";
import { formatDistanceToNow } from "date-fns";
import TableSessionHistoryDialog from "./TableSessionHistoryDialog";
import { InvoiceDetailDialog } from "./InvoiceDetailDialog";
import { getInvoiceBySessionId } from "@/services/invoiceService";

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
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [canCancel, setCanCancel] = useState(false);
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [canteenOrderOpen, setCanteenOrderOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  
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
      
      const checkCancelTimeout = () => {
        const now = new Date();
        const timeDiff = now.getTime() - startTime.getTime();
        const canCancelSession = timeDiff < 60000; // 1 minute in milliseconds
        setCanCancel(canCancelSession);
      };
      
      checkCancelTimeout();
      const interval = setInterval(checkCancelTimeout, 1000);
      
      return () => clearInterval(interval);
    } else {
      setCanCancel(false);
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

      const response = await startSession(sessionData);
      
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
      
      // Force refresh to show changes immediately
      await refreshTables();
      window.location.reload();
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
      
      // Force refresh to show changes immediately
      await refreshTables();
      window.location.reload();
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
        title: "Game Result Announced",
        description: "Game result has been announced successfully",
      });
      
      // Show end session dialog after announcing result
      setShowEndSessionDialog(true);
      
      // Force refresh to show changes immediately
      await refreshTables();
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

  const handleEndSession = async () => {
    if (!activeSession) return;
    
    setIsEndingSession(true);
    try {
      const response = await endSession(activeSession.id, "Session completed successfully");
      
      toast({
        title: "Session Ended",
        description: "Session has been ended successfully",
      });
      
      setShowEndSessionDialog(false);
      
      // Show invoice if available in response
      if (response?.data?.invoice) {
        setInvoiceData(response.data.invoice);
        setInvoiceDialogOpen(true);
      } else {
        // Try to fetch invoice by session ID
        try {
          const invoiceResponse = await getInvoiceBySessionId(activeSession.id);
          setInvoiceData(invoiceResponse);
          setInvoiceDialogOpen(true);
        } catch (invoiceError) {
          console.error('Error fetching invoice:', invoiceError);
          // If no invoice found, refresh immediately
          await refreshTables();
          window.location.reload();
        }
      }
      
      // Force refresh to show changes immediately (only if no invoice dialog)
      if (!response?.data?.invoice) {
        await refreshTables();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to end session",
        variant: "destructive",
      });
    } finally {
      setIsEndingSession(false);
    }
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
    
    const startTime = new Date(activeSession.start_time);
    const now = currentTime;
    const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
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
    
    return Math.max(timeBlocks * pricing.price, pricing.price); // At least one block
  };

  const canManageTables = user?.permissions?.can_manage_tables || user?.role === 'super_admin';
  
  // Status line color based on session status
  const statusLineColor = activeSession ? 'bg-red-500' : 'bg-green-500';
  
  // Get player names from session data
  const getPlayer1Name = () => {
    if (!activeSession) return '';
    if (activeSession.player?.first_name && activeSession.player?.last_name) {
      return `${activeSession.player.first_name} ${activeSession.player.last_name}`;
    }
    return activeSession.guest_player_name || 'Guest Player 1';
  };

  const getPlayer2Name = () => {
    if (!activeSession) return '';
    if (activeSession.player2?.first_name && activeSession.player2?.last_name) {
      return `${activeSession.player2.first_name} ${activeSession.player2.last_name}`;
    }
    return activeSession.guest_player_2_name || 'Guest Player 2';
  };
  
  return (
    <Card className="w-full max-w-sm mx-auto border border-gray-200 rounded-lg shadow-sm relative overflow-hidden h-80">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg-snooker.webp)' }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Status Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${statusLineColor} z-20`}></div>
      
      {/* Content Container */}
      <div className="relative z-10 p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-white drop-shadow-lg">{table.table_number}</h3>
            <p className="text-sm text-white/90 drop-shadow-md">{table.table_type || 'Standard'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={table.status === 'available' ? 'default' : 'secondary'}
              className={`text-xs shadow-lg ${table.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
            >
              {table.status === 'occupied' ? 'Occupied' : table.status.charAt(0).toUpperCase() + table.status.slice(1)}
            </Badge>
            {canManageTables && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="text-white hover:bg-white/20 p-1"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Session History Button */}
        <div className="mb-2">
          <TableSessionHistoryDialog 
            tableId={table.id} 
            tableNumber={table.table_number} 
          />
        </div>

        {/* Session Info for Active Sessions */}
        {activeSession && (
          <div className="space-y-1 mb-3 flex-1">
            <div className="flex items-center text-sm text-blue-200 drop-shadow-md">
              <Users className="h-3 w-3 mr-1" />
              <span className="text-xs">
                {getPlayer1Name()} vs {getPlayer2Name()}
              </span>
            </div>
            <div className="flex items-center text-sm text-purple-200 drop-shadow-md">
              <Crown className="h-3 w-3 mr-1" />
              <span className="text-xs">{activeSession.gameType?.name || 'Game'}</span>
            </div>
            <div className="flex items-center text-sm text-white/90 drop-shadow-md">
              <Clock className="h-3 w-3 mr-1" />
              <span className="text-xs">{getSessionDuration()}</span>
            </div>
            <div className="flex items-center text-sm text-green-200 drop-shadow-md">
              <DollarSign className="h-3 w-3 mr-1" />
              <span className="text-xs">PKR {calculateCurrentPrice()}.00</span>
            </div>
          </div>
        )}

        {/* Available Game Types for Available Tables */}
        {!activeSession && tablePricings.length > 0 && (
          <div className="mb-4 flex-1">
            <p className="text-sm text-white/80 drop-shadow-md">
              Available: {tablePricings.map(p => {
                const gameType = gameTypes.find(gt => gt.id === p.game_type_id);
                return gameType?.name;
              }).filter(Boolean).join(', ')}
            </p>
          </div>
        )}

        {/* Action Buttons for Active Sessions */}
        {activeSession && (
          <div className="space-y-2 mt-auto">
            {canCancel && (
              <Button 
                onClick={handleCancelSession}
                disabled={isCancelling}
                variant="destructive"
                size="sm"
                className="w-full h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                {isCancelling ? 'Cancelling...' : 'Cancel Session'}
              </Button>
            )}
            
            {!canCancel && !activeSession.game_result_announced && (
              <div className="space-y-1">
                <Button 
                  onClick={() => handleAnnounceResult('player_1')}
                  disabled={isAnnouncingResult}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white h-8 text-xs"
                  size="sm"
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  {getPlayer1Name()} Lost
                </Button>
                <Button 
                  onClick={() => handleAnnounceResult('player_2')}
                  disabled={isAnnouncingResult}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white h-8 text-xs"
                  size="sm"
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  {getPlayer2Name()} Lost
                </Button>
              </div>
            )}

            {activeSession.game_result_announced && (
              <Button 
                onClick={() => setShowEndSessionDialog(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white h-8 text-xs"
                size="sm"
              >
                End Session
              </Button>
            )}
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCanteenOrderOpen(true)}
                className="flex-1 h-7 text-xs"
              >
                Canteen
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPosOpen(true)}
                className="flex-1 h-7 text-xs"
              >
                POS
              </Button>
            </div>
          </div>
        )}
        
        {/* Footer with Start Session Button for Available Tables */}
        {table.status === 'available' && (
          <div className="mt-auto">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  disabled={tablePricings.length === 0}
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-200 font-semibold shadow-lg"
                  variant="outline"
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
          </div>
        )}
      </div>

      {/* End Session Dialog */}
      <Dialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this session? This will generate an invoice.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndSessionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEndSession} disabled={isEndingSession}>
              {isEndingSession ? 'Ending Session...' : 'End Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other Dialogs */}
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
              player_names: `${getPlayer1Name()} vs ${getPlayer2Name()}`
            }}
          />
        </>
      )}

      {/* Invoice Dialog */}
      {invoiceData && (
        <InvoiceDetailDialog
          invoice={invoiceData}
          isOpen={invoiceDialogOpen}
          onClose={async () => {
            setInvoiceDialogOpen(false);
            setInvoiceData(null);
            // Refresh page only when invoice dialog is closed
            await refreshTables();
            window.location.reload();
          }}
          onUpdate={() => {}}
        />
      )}
    </Card>
  );
};

export default EnhancedTableCard;
