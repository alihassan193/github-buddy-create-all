
import { useState } from "react";
import { SnookerTable, GameType } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/DataContext";

interface TableCardProps {
  table: SnookerTable;
}

const TableCard = ({ table }: TableCardProps) => {
  const { gameTypes, gamePricings, startSession } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [gameTypeId, setGameTypeId] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState('');
  
  // Filter pricing for this table
  const tablePricings = gamePricings.filter(p => p.table_id === table.id);
  
  const handleStartSession = () => {
    if (!gameTypeId) {
      toast({
        title: "Error",
        description: "Please select a game type",
        variant: "destructive",
      });
      return;
    }
    
    if (!playerName) {
      toast({
        title: "Error",
        description: "Please enter player name",
        variant: "destructive",
      });
      return;
    }
    
    startSession(table.id, gameTypeId, playerName);
    toast({
      title: "Session Started",
      description: `Session started on ${table.table_number}`,
    });
    setOpen(false);
    setPlayerName('');
    setGameTypeId(null);
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
    <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
      <CardHeader className={`py-4 ${table.status === 'occupied' ? 'bg-red-50' : table.status === 'maintenance' ? 'bg-yellow-50' : 'bg-green-50'}`}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{table.table_number}</CardTitle>
            <CardDescription>
              {tablePricings.length > 0 
                ? `${tablePricings.length} game types available`
                : 'No pricing set'
              }
            </CardDescription>
          </div>
          <Badge className={statusColors[table.status]}>
            {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        <div className="flex items-center justify-center h-32 felt-bg rounded-md">
          <div className="grid grid-cols-3 w-full h-full">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-snooker-red rounded-full"></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-black rounded-full"></div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center py-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              disabled={table.status !== 'available' || tablePricings.length === 0}
              className="w-full"
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
                Enter player details and select game type to start.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
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
              <div className="grid grid-cols-1 gap-2">
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
              <Button onClick={handleStartSession}>Start Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default TableCard;
