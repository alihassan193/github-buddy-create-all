
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, Loader2 } from "lucide-react";
import { getTableSessions } from "@/services/sessionService";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TableSessionHistoryDialogProps {
  tableId: number;
  tableNumber: string;
}

const TableSessionHistoryDialog = ({ tableId, tableNumber }: TableSessionHistoryDialogProps) => {
  const { clubId } = useData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = async () => {
    if (!clubId) return;
    
    try {
      setIsLoading(true);
      const response = await getTableSessions(clubId, tableId);
      
      if (response && response.length > 0) {
        setSessions(response[0].sessions || []);
      } else {
        setSessions([]);
      }
    } catch (error: any) {
      console.error('Error fetching table sessions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch session history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen, clubId, tableId]);

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'dd/MM/yyyy HH:mm');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-4/5 mb-2">
          <History className="h-4 w-4 mr-2" />
          Session History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Session History - Table {tableNumber}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading session history...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sessions found for this table
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Sr#</TableHead>
                  <TableHead>Player 1</TableHead>
                  <TableHead>Player 2</TableHead>
                  <TableHead>Time Start</TableHead>
                  <TableHead>Time End</TableHead>
                  <TableHead>Total Min</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Loser</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.session_id}>
                    <TableCell>{session.sr}</TableCell>
                    <TableCell className="font-medium">{session.player_1}</TableCell>
                    <TableCell className="font-medium">{session.player_2}</TableCell>
                    <TableCell>{formatTime(session.time_start)}</TableCell>
                    <TableCell>{session.time_end ? formatTime(session.time_end) : 'N/A'}</TableCell>
                    <TableCell>{session.total_minutes}</TableCell>
                    <TableCell>${session.price}</TableCell>
                    <TableCell>{session.loser}</TableCell>
                    <TableCell>${session.paid_amount}</TableCell>
                    <TableCell>{getPaymentStatusBadge(session.payment_status)}</TableCell>
                    <TableCell className="max-w-32 truncate" title={session.remarks}>
                      {session.remarks || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TableSessionHistoryDialog;
