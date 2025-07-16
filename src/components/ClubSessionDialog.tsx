
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useClubSession } from "@/context/ClubSessionContext";
import { useToast } from "@/hooks/use-toast";
import { openClubSession, closeClubSession } from "@/services/clubSessionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DollarSign, Clock } from "lucide-react";

interface ClubSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'open' | 'close';
}

const ClubSessionDialog = ({ open, onOpenChange, type }: ClubSessionDialogProps) => {
  const { user } = useAuth();
  const { activeSession, refreshSession } = useClubSession();
  const { toast } = useToast();
  const [cash, setCash] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cash || parseFloat(cash) < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid cash amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (type === 'open') {
        if (!user?.club_id) {
          throw new Error("Club ID not found");
        }
        await openClubSession(user.club_id, parseFloat(cash), notes);
        toast({
          title: "Success",
          description: "Club session opened successfully",
        });
      } else {
        await closeClubSession(parseFloat(cash), notes);
        toast({
          title: "Success",
          description: "Club session closed successfully",
        });
      }
      
      await refreshSession();
      setCash("");
      setNotes("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${type} club session`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'open' ? <Clock className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
            {type === 'open' ? 'Open Club Session' : 'Close Club Session'}
          </DialogTitle>
          <DialogDescription>
            {type === 'open' 
              ? 'Enter the opening cash amount to start the club session'
              : 'Enter the closing cash amount to end the club session'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cash">
              {type === 'open' ? 'Opening Cash' : 'Closing Cash'}
            </Label>
            <Input
              id="cash"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              required
            />
          </div>

          {type === 'close' && activeSession && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Opening Cash: <span className="font-medium">${activeSession.opening_cash}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : (type === 'open' ? 'Open Session' : 'Close Session')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClubSessionDialog;
