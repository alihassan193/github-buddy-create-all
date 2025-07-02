import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Search, Filter, FileText, DollarSign, Printer, Eye } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getAllInvoices, getInvoiceById } from "@/services/invoiceService";
import { InvoiceDetailDialog } from "@/components/InvoiceDetailDialog";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const itemsPerPage = 10;

  const fetchInvoices = async (page = 1) => {
    if (!clubId) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching invoices for club:', clubId, 'page:', page);
      
      const response = await getAllInvoices({ 
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: page,
        limit: itemsPerPage
      });
      console.log('Invoices response:', response);
      
      if (Array.isArray(response)) {
        setInvoices(response);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
      } else {
        setInvoices([]);
      }
      setCurrentPage(page);
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

  const handleViewInvoice = async (invoiceId: number) => {
    try {
      setIsLoadingDetail(true);
      console.log('Fetching invoice details for ID:', invoiceId);
      
      const invoiceData = await getInvoiceById(invoiceId);
      console.log('Invoice detail response:', invoiceData);
      
      setSelectedInvoice(invoiceData);
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoice details",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleInvoiceUpdate = () => {
    fetchInvoices(currentPage);
  };

  useEffect(() => {
    if (clubId) {
      console.log('Club ID available, fetching invoices:', clubId);
      fetchInvoices(1);
    }
  }, [clubId, statusFilter]);

  const handlePrintInvoice = (invoice: any) => {
    // Create a printable invoice
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoice_number}</title>
            <style>
              body { font-family: monospace; font-size: 12px; width: 300px; margin: 0; padding: 20px; }
              .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
              .row { display: flex; justify-content: space-between; margin: 5px 0; }
              .total { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
              @media print {
                body { width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>INVOICE</h2>
              <div>Invoice #: ${invoice.invoice_number || `INV-${invoice.id}`}</div>
              <div>Date: ${invoice.createdAt ? format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm') : ''}</div>
            </div>
            
            <div class="row">
              <span>Customer:</span>
              <span>${invoice.customer_name || 'N/A'}</span>
            </div>
            
            <div class="row">
              <span>Phone:</span>
              <span>${invoice.customer_phone || 'N/A'}</span>
            </div>
            
            <div style="margin: 15px 0; border-top: 1px solid #000; padding-top: 10px;">
              <div class="row">
                <span>Subtotal:</span>
                <span>Rs.${(invoice.subtotal || 0).toFixed(2)}</span>
              </div>
              
              <div class="row">
                <span>Tax:</span>
                <span>Rs.${(invoice.tax_amount || 0).toFixed(2)}</span>
              </div>
              
              <div class="row total">
                <span>TOTAL:</span>
                <span>Rs.${(invoice.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
            
            <div class="row">
              <span>Payment:</span>
              <span>${invoice.payment_method || 'N/A'}</span>
            </div>
            
            <div class="row">
              <span>Status:</span>
              <span>${invoice.payment_status || 'N/A'}</span>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-size: 10px;">
              Thank you for your business!
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchQuery === '' || 
      (invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (invoice.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDate = dateFilter === '' || 
      (invoice.createdAt && invoice.createdAt.includes(dateFilter));
    
    return matchesSearch && matchesDate;
  });

  // Paginate filtered results
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  const totalFilteredPages = Math.ceil(filteredInvoices.length / itemsPerPage);

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
      {paginatedInvoices.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            {paginatedInvoices.map((invoice) => (
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
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          Rs.{formatPrice(invoice.total_amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.createdAt && format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewInvoice(invoice.id)}
                        disabled={isLoadingDetail}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePrintInvoice(invoice)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
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
          
          {/* Pagination */}
          {totalFilteredPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalFilteredPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalFilteredPages, prev + 1))}
                    className={currentPage >= totalFilteredPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
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

      {/* Invoice Detail Dialog */}
      <InvoiceDetailDialog
        invoice={selectedInvoice}
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setSelectedInvoice(null);
        }}
        onUpdate={handleInvoiceUpdate}
      />
    </div>
  );
};

export default Invoices;
