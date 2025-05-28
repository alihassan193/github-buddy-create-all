
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, DollarSign, Play, Square } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Tables = () => {
  const { tables, gameTypes, gamePricings, activeSessions, startSession, endSession } = useData();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [gameTypeId, setGameTypeId] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState('');

  const getTableSession = (tableId: number) => {
    return activeSessions.find(session => session.table_id === tableId);
  };

  const getSessionDuration = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diff = now - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleStartSession = () => {
    if (!gameTypeId || !playerName || !selectedTable) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    startSession(selectedTable.id, gameTypeId, playerName);
    toast({
      title: "Session Started",
      description: `Session started on ${selectedTable.table_number}`,
    });
    setDialogOpen(false);
    setPlayerName('');
    setGameTypeId(null);
    setSelectedTable(null);
  };

  const handleEndSession = (sessionId: number) => {
    endSession(sessionId);
    toast({
      title: "Session Ended",
      description: "Session has been completed",
    });
  };

  const getTablePricing = (tableId: number) => {
    return gamePricings.filter(p => p.table_id === tableId);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Table Management</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50">
            Available: {tables.filter(t => t.status === 'available').length}
          </Badge>
          <Badge variant="outline" className="bg-red-50">
            Occupied: {tables.filter(t => t.status === 'occupied').length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => {
          const session = getTableSession(table.id);
          const tablePricing = getTablePricing(table.id);
          
          return (
            <Card key={table.id} className={`relative ${
              table.status === 'occupied' ? 'border-red-200 bg-red-50' : 
              table.status === 'maintenance' ? 'border-yellow-200 bg-yellow-50' : 
              'border-green-200 bg-green-50'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{table.table_number}</CardTitle>
                    <CardDescription>
                      {tablePricing.length} game types available
                    </CardDescription>
                  </div>
                  <Badge className={
                    table.status === 'occupied' ? 'bg-red-500' : 
                    table.status === 'maintenance' ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }>
                    {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Table Visual */}
                <div className="bg-green-800 rounded-lg p-4 h-32 relative overflow-hidden">
                  <div className="absolute inset-2 border-2 border-green-600 rounded"></div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full"></div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-1/2 left-4 transform -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full"></div>
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full"></div>
                </div>

                {session ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{session.player_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span>{getSessionDuration(session.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                      <span>Running...</span>
                    </div>
                    <Button 
                      onClick={() => handleEndSession(session.id)}
                      className="w-full bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center text-gray-500 py-4">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Table Available</p>
                    </div>
                    <Dialog open={dialogOpen && selectedTable?.id === table.id} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (!open) {
                        setSelectedTable(null);
                        setPlayerName('');
                        setGameTypeId(null);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedTable(table)}
                          disabled={table.status !== 'available' || tablePricing.length === 0}
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Start New Session - {table.table_number}</DialogTitle>
                          <DialogDescription>
                            Configure the session details to begin playing.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="player">Player Name</Label>
                            <Input
                              id="player"
                              value={playerName}
                              onChange={(e) => setPlayerName(e.target.value)}
                              placeholder="Enter player name"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="gameType">Game Type</Label>
                            <Select onValueChange={(value) => setGameTypeId(Number(value))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select game type" />
                              </SelectTrigger>
                              <SelectContent>
                                {tablePricing.map(pricing => {
                                  const gameType = gameTypes.find(gt => gt.id === pricing.game_type_id);
                                  return (
                                    <SelectItem 
                                      key={pricing.game_type_id} 
                                      value={pricing.game_type_id.toString()}
                                    >
                                      {gameType?.name} - ${pricing.price}
                                      {pricing.is_unlimited ? ' (Unlimited)' : ` (${pricing.time_limit_minutes} min)`}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleStartSession}>Start Session</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Tables;
