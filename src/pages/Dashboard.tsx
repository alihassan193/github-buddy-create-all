
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, Users, Play, Square, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import CanteenPOS from "@/components/CanteenPOS";

const Dashboard = () => {
  const { tables, activeSessions, gameTypes, gamePricings, startSession, endSession } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [gameTypeId, setGameTypeId] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState('');
  
  const isAdmin = user?.role === 'super_admin' || user?.role === 'sub_admin';
  
  // Group active sessions by table
  const sessionsByTable = activeSessions.reduce((acc, session) => {
    acc[session.table_id] = session;
    return acc;
  }, {} as Record<number, any>);

  const getTablePricing = (tableId: number) => {
    return gamePricings.filter(p => p.table_id === tableId);
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
      description: `Session started on Table ${selectedTable.table_number}`,
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

  const openPOS = (session: any) => {
    setSelectedSession(session);
    setPosOpen(true);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Table Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your snooker tables and active sessions</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50">
            Available: {tables.filter(t => !sessionsByTable[t.id]).length}
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            Active: {Object.keys(sessionsByTable).length}
          </Badge>
          {isAdmin && (
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Add Table</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => {
          const session = sessionsByTable[table.id];
          const tablePricing = getTablePricing(table.id);
          
          return (
            <Card key={table.id} className={`relative transition-all duration-300 ${
              session ? 'border-blue-200 bg-blue-50 shadow-lg' : 'border-green-200 bg-green-50 hover:shadow-md'
            }`}>
              {/* Session Timer Header - Only shown when session is active */}
              {session && (
                <div className="absolute -top-3 left-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <SessionTimer startTime={session.start_time} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{session.player_name}</span>
                    </div>
                  </div>
                </div>
              )}

              <CardHeader className={`pb-3 ${session ? 'pt-8' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Table {table.table_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {tablePricing.length} game types available
                    </p>
                  </div>
                  <Badge className={
                    session ? 'bg-blue-500' : 'bg-green-500'
                  }>
                    {session ? 'Active' : 'Available'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Modern Table Visual */}
                <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-6 h-32 relative overflow-hidden shadow-inner">
                  <div className="absolute inset-3 border-2 border-green-600 rounded-lg"></div>
                  <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                  <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-black rounded-full shadow-lg"></div>
                  <div className="absolute top-1/2 left-5 transform -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full shadow-lg"></div>
                  <div className="absolute top-1/2 right-5 transform -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full shadow-lg"></div>
                  {session && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-2">
                        <Play className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {session ? (
                    <>
                      <Button 
                        onClick={() => openPOS(session)}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Open POS
                      </Button>
                      <Button 
                        onClick={() => handleEndSession(session.id)}
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        size="sm"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        End Session
                      </Button>
                    </>
                  ) : (
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
                          disabled={tablePricing.length === 0}
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Start New Session - Table {table.table_number}</DialogTitle>
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
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <PlusCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tables found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first snooker table.</p>
          {isAdmin && (
            <Button>Add your first table</Button>
          )}
        </div>
      )}

      {/* Canteen POS Dialog */}
      <CanteenPOS 
        open={posOpen} 
        onOpenChange={setPosOpen} 
        session={selectedSession}
      />
    </div>
  );
};

// Enhanced Session Timer Component
const SessionTimer = ({ startTime }: { startTime: string }) => {
  const [duration, setDuration] = useState("");
  
  useEffect(() => {
    const start = new Date(startTime).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = now - start;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        setDuration(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };
    
    // Initial update
    updateTimer();
    
    // Update every second for real-time display
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  
  return <span className="font-mono font-bold">{duration}</span>;
};

export default Dashboard;
