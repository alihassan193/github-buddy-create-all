
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, Search, Filter, Download, DollarSign, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { getAllInvoices } from "@/services/invoiceService";
import { InvoiceDetailDialog } from "@/components/InvoiceDetailDialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Invoices = () => {
  const { clubId, isLoading } = useData();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const fetchInvoices = async () => {
    if (!clubId) return;
    
    try {
      setIsFetching(true);
      const response = await getAllInvoices({ 
        club_id: clubId
      });
      
      if (response && response.invoices) {
        setInvoices(response.invoices);
        setFilteredInvoices(response.invoices);
      }
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
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
    fetchInvoices();
  }, [clubId]);

  // Filter invoices based on search and filters
  useEffect(() => {
    let filtered = invoices;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(invoice => 
        invoice.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.player?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.player?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.payment_status === paymentFilter);
    }

    // Invoice type filter
    if (invoiceTypeFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.invoice_type === invoiceTypeFilter);
    }

    // Date filter
    if (dateFilter) {
      const filterDate = format(dateFilter, 'yyyy-MM-dd');
      filtered = filtered.filter(invoice => 
        format(new Date(invoice.createdAt), 'yyyy-MM-dd') === filterDate
      );
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchQuery, paymentFilter, invoiceTypeFilter, dateFilter]);

  const getPaymentBadge = (paymentStatus: string) => {
    const statusConfig = {
      paid: { variant: "default" as const, icon: CheckCircle, color: "bg-green-500 text-white" },
      pending: { variant: "secondary" as const, icon: Clock, color: "bg-yellow-500 text-white" },
      cancelled: { variant: "destructive" as const, icon: AlertCircle, color: "bg-red-500 text-white" }
    };

    const config = statusConfig[paymentStatus as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </Badge>
    );
  };

  const getInvoiceTypeBadge = (invoiceType: string) => {
    const typeConfig = {
      session: { color: "bg-blue-500 text-white", label: "Game Session" },
      canteen_only: { color: "bg-orange-500 text-white", label: "Canteen Only" },
      combined: { color: "bg-purple-500 text-white", label: "Combined" }
    };

    const config = typeConfig[invoiceType as keyof typeof typeConfig] || { color: "bg-gray-500 text-white", label: invoiceType };

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: string | number) => {
    return `PKR ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const getTotalStats = () => {
    const total = filteredInvoices.reduce((acc, invoice) => acc + parseFloat(invoice.total_amount || 0), 0);
    const paid = filteredInvoices
      .filter(invoice => invoice.payment_status === 'paid')
      .reduce((acc, invoice) => acc + parseFloat(invoice.total_amount || 0), 0);
    const pending = filteredInvoices
      .filter(invoice => invoice.payment_status === 'pending')
      .reduce((acc, invoice) => acc + parseFloat(invoice.total_amount || 0), 0);

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
          <p className="text-muted-foreground">
            Manage invoices and track payments
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
              From {filteredInvoices.length} invoices
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
              {filteredInvoices.filter(invoice => invoice.payment_status === 'paid').length} paid invoices
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
              {filteredInvoices.filter(invoice => invoice.payment_status === 'pending').length} pending invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by customer name or invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-40 justify-start text-left font-normal",
                !dateFilter && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={invoiceTypeFilter} onValueChange={setInvoiceTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="session">Game Session</SelectItem>
            <SelectItem value="canteen_only">Canteen Only</SelectItem>
            <SelectItem value="combined">Combined</SelectItem>
          </SelectContent>
        </Select>

        {(searchQuery || paymentFilter !== 'all' || invoiceTypeFilter !== 'all' || dateFilter) && (
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('');
              setPaymentFilter('all');
              setInvoiceTypeFilter('all');
              setDateFilter(undefined);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Invoices Grid */}
      {filteredInvoices.length > 0 ? (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                      {getPaymentBadge(invoice.payment_status)}
                      {getInvoiceTypeBadge(invoice.invoice_type)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block">Customer:</span>
                        <span className="font-bold text-lg text-primary">
                          {invoice.customer_name || 'N/A'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground block">Phone:</span>
                        <span className="font-medium">
                          {invoice.customer_phone || invoice.player?.phone || 'N/A'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground block">Date:</span>
                        <span className="font-medium">
                          {formatDateTime(invoice.createdAt)}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground block">Type:</span>
                        <span className="font-medium">
                          {invoice.invoice_type === 'session' ? 'Game Session' : 
                           invoice.invoice_type === 'canteen_only' ? 'Canteen Only' : 
                           'Combined'}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Game Charges: PKR {parseFloat(invoice.game_charges || 0).toFixed(2)}</div>
                      <div>Canteen Charges: PKR {parseFloat(invoice.canteen_charges || 0).toFixed(2)}</div>
                      {invoice.payment_method && (
                        <div>Payment Method: {invoice.payment_method}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-3 ml-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="text-3xl font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg">
                        {formatCurrency(invoice.total_amount || 0)}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setIsDialogOpen(true);
                      }}
                      className="w-full"
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
              {searchQuery || paymentFilter !== 'all' || invoiceTypeFilter !== 'all' || dateFilter
                ? 'No invoices match your current filters'
                : 'No invoices found'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Invoice Detail Dialog */}
      {selectedInvoice && (
        <InvoiceDetailDialog
          invoice={selectedInvoice}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onUpdate={fetchInvoices}
        />
      )}
    </div>
  );
};

export default Invoices;
