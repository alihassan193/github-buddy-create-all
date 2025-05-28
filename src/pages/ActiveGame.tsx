
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";

const ActiveGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { games, tables, endGame, addFrame, createInvoice } = useData();
  const { toast } = useToast();
  
  const [winner, setWinner] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const game = games.find((g) => g.id === gameId);
  const table = game ? tables.find((t) => t.id === game.tableId) : null;
  
  if (!game || !table) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Game not found</h1>
        <Button onClick={() => navigate("/")}>Back to Tables</Button>
      </div>
    );
  }
  
  const handleAddFrame = () => {
    if (!winner) {
      toast({
        title: "Error",
        description: "Please select a winner",
        variant: "destructive",
      });
      return;
    }
    
    const loser = winner === game.player1 ? game.player2 : game.player1;
    addFrame(game.id, winner, loser);
    setWinner('');
    setDialogOpen(false);
    
    toast({
      title: "Frame Added",
      description: `${winner} won the frame`,
    });
  };
  
  const handleEndGame = () => {
    endGame(game.id);
    const invoiceId = createInvoice(game.tableId);
    
    toast({
      title: "Game Ended",
      description: "Game has been ended and invoice created",
    });
    
    navigate(`/invoice/${invoiceId}`);
  };
  
  const formatDuration = (start: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(start).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    return diffHrs > 0 
      ? `${diffHrs}h ${mins}m`
      : `${mins}m`;
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Active Game - {table.table_number}</h1>
          <p className="text-gray-500">
            {game.type === 'frame' ? 'Frame' : 'Century'} Game - 
            Started {new Date(game.startTime).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 p-3 rounded-md">
          <Clock className="h-5 w-5" />
          <span className="font-semibold">{formatDuration(game.startTime)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Game Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Table:</span>
                </div>
                <div>{table.table_number}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Game Type:</span>
                </div>
                <div>{game.type === 'frame' ? 'Frame' : 'Century'}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Player 1:</span>
                </div>
                <div>{game.player1}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Player 2:</span>
                </div>
                <div>{game.player2}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Start Time:</span>
                </div>
                <div>{new Date(game.startTime).toLocaleTimeString()}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Duration:</span>
                </div>
                <div>{formatDuration(game.startTime)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Frames</CardTitle>
          </CardHeader>
          <CardContent>
            {game.frames && game.frames.length > 0 ? (
              <div className="space-y-2">
                {game.frames.map((frame, index) => (
                  <div key={frame.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="font-medium">Frame {index + 1}</div>
                    <div className="text-sm">
                      Winner: <span className="text-green-600">{frame.winner}</span>
                    </div>
                    <div className="text-sm">
                      Loser: <span className="text-red-600">{frame.loser}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No frames played yet</p>
            )}
            
            <div className="mt-4">
              <Button 
                onClick={() => setDialogOpen(true)}
                variant="outline" 
                className="w-full mb-2"
              >
                Add Frame
              </Button>
              <Button 
                onClick={handleEndGame}
                className="w-full"
              >
                End Game & Generate Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Frame Result</DialogTitle>
            <DialogDescription>
              Select the winner of this frame.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={winner} onValueChange={setWinner}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="player1" value={game.player1} />
              <Label htmlFor="player1">{game.player1}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="player2" value={game.player2} />
              <Label htmlFor="player2">{game.player2}</Label>
            </div>
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFrame}>Save Result</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveGame;
