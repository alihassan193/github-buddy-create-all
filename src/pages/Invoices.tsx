
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, Search, Filter, Download, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { getAllSessions } from "@/services/sessionService";
import { InvoiceDetailDialog } from "@/components/InvoiceDetailDialog";

const Invoices = () => {
  const { clubId, isLoading } = useData();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchSessions = async () => {
    if (!clubId) return;
    
    try {
      setIsFetching(true);
      const response = await getAllSessions({ 
        club_id: clubId,
        status: 'completed'
      });
      
      if (response && response.sessions) {
        setSessions(response.sessions);
        setFilteredSessions(response.sessions);
      }
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch invoices",
        variant: "destructive"
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [clubId]);

  // Filter sessions based on search and filters
  useEffect(() => {
    let filtered = sessions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.player_1_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.player_2_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.table?.table_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.session_code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(session => session.payment_status === paymentFilter);
    }

    setFilteredSessions(filtered);
  }, [sessions, searchQuery, statusFilter, paymentFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      active: { variant: "secondary" as const, icon: Clock, color: "text-blue-600" },
      cancelled: { variant: "destructive" as const, icon: AlertCircle, color: "text-red-600" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (paymentStatus: string) => {
    return (
      <Badge variant={paymentStatus === 'paid' ? 'default' : 'secondary'}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalStats = () => {
    const total = filteredSessions.reduce((acc, session) => acc + (session.total_amount || 0), 0);
    const paid = filteredSessions
      .filter(s => s.payment_status === 'paid')
      .reduce((acc, session) => acc + (session.total_amount || 0), 0);
    const pending = total - paid;

    return { total, paid, pending };
  };

  const stats = getTotalStats();

  if (isLoading || isFetching) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices & Billing</h1>
          <p className="text-muted-foregrund">
            Manage session invoices and track payments
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
            <p className="text-xs text-muted-foreground">
              From {filteredSessions.length} sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paid)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredSessions.filter(s => s.payment_status === 'paid').length} paid sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pending)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredSessions.filter(s => s.payment_status === 'pending').length} pending sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by player, table, or session code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{session.session_code}</h3>
                      {getStatusBadge(session.status)}
                      {getPaymentBadge(session.payment_status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Table: {session.table?.table_number}</div>
                      <div>Players: {session.player_1_name} vs {session.player_2_name}</div>
                      <div>Duration: {session.duration_minutes || 0} minutes</div>
                      <div>Started: {formatDateTime(session.start_time)}</div>
                      {session.end_time && (
                        <div>Ended: {formatDateTime(session.end_time)}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold">
                      {formatCurrency(session.total_amount || 0)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'No invoices match your current filters'
                : 'No invoices found'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Invoice Detail Dialog */}
      {selectedSession && (
        <InvoiceDetailDialog
          session={selectedSession}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default Invoices;
