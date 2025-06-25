
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Search, Filter, FileText, DollarSign } from "lucide-react";
import { getAllInvoices } from "@/services/invoiceService";
import { format } from "date-fns";

const Invoices = () => {
  const { clubId, gameTypes } = useData();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gameTypeFilter, setGameTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const fetchInvoices = async () => {
    if (!clubId) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching invoices for club:', clubId);
      
      const response = await getAllInvoices({ 
        status: statusFilter !== 'all' ? statusFilter : undefined 
      });
      console.log('Invoices response:', response);
      
      setInvoices(response || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive"
      });
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      console.log('Club ID available, fetching invoices:', clubId);
      fetchInvoices();
    }
  }, [clubId, statusFilter]);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchQuery === '' || 
      (invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (invoice.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDate = dateFilter === '' || 
      (invoice.createdAt && invoice.createdAt.includes(dateFilter));
    
    return matchesSearch && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatPrice = (price: any): string => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
    return numPrice.toFixed(2);
  };

  if (isLoading) {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">
            View and manage all invoices
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter(i => i.payment_status === 'paid').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {invoices.filter(i => i.payment_status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              Rs.{invoices.reduce((total, invoice) => total + parseFloat(invoice.total_amount || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={gameTypeFilter} onValueChange={setGameTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Game Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            {gameTypes.map((gameType) => (
              <SelectItem key={gameType.id} value={gameType.id.toString()}>
                {gameType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          placeholder="Filter by date"
        />
      </div>

      {/* Invoices List */}
      {filteredInvoices.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {invoice.invoice_number || `INV-${invoice.id}`}
                      <Badge className={getStatusColor(invoice.payment_status)}>
                        {invoice.payment_status?.charAt(0).toUpperCase() + invoice.payment_status?.slice(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {invoice.customer_name} • {invoice.payment_method}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      Rs.{formatPrice(invoice.total_amount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.createdAt && format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        Subtotal: Rs.{formatPrice(invoice.subtotal)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tax: Rs.{formatPrice(invoice.tax_amount)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {invoice.createdAt && format(new Date(invoice.createdAt), 'HH:mm')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Time
                      </div>
                    </div>
                  </div>
                  
                  {invoice.customer_phone && (
                    <div>
                      <div className="font-medium">
                        {invoice.customer_phone}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Phone
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || dateFilter
                ? 'No invoices match your current filters' 
                : 'No invoices found'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Invoices;
