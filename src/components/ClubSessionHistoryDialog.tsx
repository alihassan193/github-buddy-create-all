
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, Loader2, Calendar, User, DollarSign } from "lucide-react";
import { getClubSessionHistory } from "@/services/clubSessionService";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ClubSessionHistoryDialogProps {
  trigger?: React.ReactNode;
}

const ClubSessionHistoryDialog = ({ trigger }: ClubSessionHistoryDialogProps) => {
  const { clubId } = useData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const fetchSessionHistory = async (page: number = 1) => {
    if (!clubId) return;
    
    try {
      setIsLoading(true);
      const response = await getClubSessionHistory(clubId, page, 10);
      
      if (response) {
        setSessions(response.sessions || []);
        setPagination(response.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1
        });
      } else {
        setSessions([]);
      }
    } catch (error: any) {
      console.error('Error fetching club session history:', error);
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
      fetchSessionHistory(1);
    }
  }, [isOpen, clubId]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchSessionHistory(page);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const calculateProfit = (opening: string, closing: string) => {
    const openingAmount = parseFloat(opening || '0');
    const closingAmount = parseFloat(closing || '0');
    const profit = closingAmount - openingAmount;
    return profit;
  };

  const getProfitBadge = (profit: number) => {
    if (profit > 0) {
      return <Badge variant="default" className="bg-green-500">+PKR {profit.toFixed(2)}</Badge>;
    } else if (profit < 0) {
      return <Badge variant="destructive">PKR {profit.toFixed(2)}</Badge>;
    } else {
      return <Badge variant="secondary">PKR 0.00</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <History className="h-4 w-4 mr-2" />
            Session History
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Club Session History
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading session history...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No session history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Opened At</TableHead>
                    <TableHead>Closed At</TableHead>
                    <TableHead>Opening Cash</TableHead>
                    <TableHead>Closing Cash</TableHead>
                    <TableHead>Profit/Loss</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => {
                    const profit = calculateProfit(session.opening_cash, session.closing_cash);
                    const openedAt = new Date(session.opened_at);
                    const closedAt = session.closed_at ? new Date(session.closed_at) : null;
                    const duration = closedAt ? 
                      Math.round((closedAt.getTime() - openedAt.getTime()) / (1000 * 60 * 60)) : 
                      null;

                    return (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">#{session.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{session.manager?.username}</div>
                              <div className="text-xs text-muted-foreground">{session.manager?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDateTime(session.opened_at)}</TableCell>
                        <TableCell>
                          {session.closed_at ? (
                            formatDateTime(session.closed_at)
                          ) : (
                            <Badge variant="default" className="bg-blue-500">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            PKR {parseFloat(session.opening_cash || '0').toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {session.closing_cash ? (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              PKR {parseFloat(session.closing_cash).toFixed(2)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {session.closing_cash ? getProfitBadge(profit) : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {duration !== null ? `${duration}h` : <span className="text-muted-foreground">Ongoing</span>}
                        </TableCell>
                        <TableCell className="max-w-32 truncate" title={session.notes}>
                          {session.notes || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === pagination.page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            <div className="text-sm text-muted-foreground text-center">
              Showing {sessions.length} of {pagination.total} sessions
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClubSessionHistoryDialog;
