
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useClubSession } from "@/context/ClubSessionContext";
import { useToast } from "@/hooks/use-toast";
import { openClubSession } from "@/services/clubSessionService";
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
} from "@/components/ui/dialog";
import { AlertTriangle, DollarSign } from "lucide-react";

const MandatorySessionDialog = () => {
  const { user } = useAuth();
  const { isSessionActive, refreshSession, isLoading } = useClubSession();
  const { toast } = useToast();
  const [cash, setCash] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show dialog only for managers when no active session
  const showDialog = user?.role === 'manager' && !isSessionActive && !isLoading;

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

    if (!user?.club_id) {
      toast({
        title: "Error",
        description: "Club ID not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await openClubSession(user.club_id, parseFloat(cash), notes);
      await refreshSession();
      
      toast({
        title: "Success",
        description: "Club session started successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start club session",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Start Club Session Required
          </DialogTitle>
          <DialogDescription>
            You need to start a club session before accessing any features. Please enter the opening cash amount.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-amber-800">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">
              All features will be locked until you start a club session
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opening-cash">Opening Cash Amount *</Label>
            <Input
              id="opening-cash"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter opening cash amount"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-notes">Notes (Optional)</Label>
            <Textarea
              id="session-notes"
              placeholder="Add any opening notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Starting Session...' : 'Start Club Session'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MandatorySessionDialog;
