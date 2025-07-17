
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getExpenses, type Expense } from "@/services/expenseService";
import { History, Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface ExpenseHistoryDialogProps {
  trigger?: React.ReactNode;
}

const ExpenseHistoryDialog = ({ trigger }: ExpenseHistoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    from: "",
    to: ""
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchExpenses = async (page = 1) => {
    if (!user?.club_id) return;

    setIsLoading(true);
    try {
      const params = {
        club_id: user.club_id,
        page,
        limit: 10,
        ...(filters.category && { category: filters.category }),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to })
      };

      console.log('Fetching expenses with params:', params);
      const response = await getExpenses(params);
      console.log('Expenses API response:', response);
      
      if (response && response.data && response.data.expenses) {
        setExpenses(response.data.expenses);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(page);
      } else {
        console.error('Invalid response structure:', response);
        setExpenses([]);
      }
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to fetch expenses",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchExpenses(1);
    }
  }, [open, user?.club_id]);

  const handleSearch = () => {
    fetchExpenses(1);
  };

  const handleReset = () => {
    setFilters({ category: "", from: "", to: "" });
    setTimeout(() => fetchExpenses(1), 100);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <History className="w-4 h-4 mr-2" />
            Expense History
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Expense History</DialogTitle>
        </DialogHeader>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Filter by category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="from">From Date</Label>
            <Input
              id="from"
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="to">To Date</Label>
            <Input
              id="to"
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button onClick={handleReset} variant="outline" disabled={isLoading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Added By</TableHead>
                    <TableHead>Session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {format(new Date(expense.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {expense.description}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>{expense.addedBy.username}</TableCell>
                        <TableCell>
                          <Badge variant={expense.cashSession.closed_at ? "outline" : "default"}>
                            {expense.cashSession.closed_at ? "Closed" : "Active"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4 border-t">
            <Button
              onClick={() => fetchExpenses(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => fetchExpenses(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseHistoryDialog;
