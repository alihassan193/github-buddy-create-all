import { useState } from "react";
import { SnookerTable, GameType } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/DataContext";
import { startSession } from "@/services/sessionService";
import PlayerSearchInput from "./PlayerSearchInput";

interface TableCardProps {
  table: SnookerTable;
}

const TableCard = ({ table }: TableCardProps) => {
  const { gameTypes, gamePricings, refreshTables, clubId } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [gameTypeId, setGameTypeId] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [playerName, setPlayerName] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  
  // Filter pricing for this table
  const tablePricings = gamePricings.filter(p => p.table_id === table.id);
  
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

    // Find the pricing for the selected game type and table
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
        ...((!selectedPlayer && playerName.trim()) && { guest_player_name: playerName.trim() })
      };

      await startSession(sessionData);
      
      toast({
        title: "Session Started",
        description: `Session started on ${table.table_number} for ${playerName}`,
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
  
  const statusColors = {
    available: "bg-green-500",
    occupied: "bg-red-500",
    maintenance: "bg-yellow-500"
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
  
  return (
    <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow relative h-80">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg-snooker.webp)' }}
      />
      
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col">
        <CardHeader className="py-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white text-2xl font-bold drop-shadow-lg">
                {table.table_number}
              </CardTitle>
              <CardDescription className="text-white/90 font-medium drop-shadow-md">
                {tablePricings.length > 0 
                  ? `${tablePricings.length} game types available`
                  : 'No pricing set'
                }
              </CardDescription>
            </div>
            <Badge 
              className={`${statusColors[table.status]} text-white font-semibold shadow-lg`}
            >
              {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex items-center justify-center py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-red-600 rounded-full shadow-lg border-2 border-white/50"></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full shadow-lg border-2 border-black/20"></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-black rounded-full shadow-lg border-2 border-white/50"></div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center py-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={table.status !== 'available' || tablePricings.length === 0}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-200 font-semibold shadow-lg"
                variant="outline"
              >
                {table.status === 'available' 
                  ? tablePricings.length === 0 ? "No Game Types Available" : "Start Session" 
                  : "Table Busy"}
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a New Session</DialogTitle>
              <DialogDescription>
                Search for a player or create a new one, then select game type to start.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <PlayerSearchInput onPlayerSelect={handlePlayerSelect} />
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
        </CardFooter>
      </div>
    </Card>
  );
};

export default TableCard;
