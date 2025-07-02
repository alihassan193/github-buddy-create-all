
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updateInvoiceStatus } from "@/services/invoiceService";
import { Printer, CreditCard, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface InvoiceDetailDialogProps {
  invoice: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const InvoiceDetailDialog = ({ invoice, isOpen, onClose, onUpdate }: InvoiceDetailDialogProps) => {
  const { toast } = useToast();
  const [newPaymentStatus, setNewPaymentStatus] = useState(invoice?.payment_status || 'pending');
  const [newPaymentMethod, setNewPaymentMethod] = useState(invoice?.payment_method || 'cash');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    if (!invoice) return;
    
    try {
      setIsUpdating(true);
      await updateInvoiceStatus(invoice.id, {
        payment_status: newPaymentStatus,
        payment_method: newPaymentMethod,
        notes: `Payment status updated to ${newPaymentStatus}`
      });
      
      toast({
        title: "Success",
        description: "Invoice status updated successfully"
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!invoice) return;
    
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
              .items { margin: 15px 0; }
              .item { margin: 5px 0; border-bottom: 1px dotted #000; padding-bottom: 5px; }
              @media print {
                body { width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${invoice.club?.name || 'SNOOKER CLUB'}</h2>
              <div>Invoice #: ${invoice.invoice_number}</div>
              <div>Date: ${format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm')}</div>
            </div>
            
            <div class="row">
              <span>Customer:</span>
              <span>${invoice.customer_name || 'N/A'}</span>
            </div>
            
            <div class="row">
              <span>Phone:</span>
              <span>${invoice.customer_phone || 'N/A'}</span>
            </div>
            
            ${invoice.session ? `
            <div class="row">
              <span>Session:</span>
              <span>${invoice.session.session_code}</span>
            </div>
            
            <div class="row">
              <span>Table:</span>
              <span>${invoice.session.table?.table_number || 'N/A'}</span>
            </div>
            
            <div class="row">
              <span>Game:</span>
              <span>${invoice.session.gameType?.name || 'N/A'}</span>
            </div>
            ` : ''}
            
            <div class="items">
              <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
                <strong>ITEMS:</strong>
              </div>
              ${invoice.items?.map((item: any) => `
                <div class="item">
                  <div class="row">
                    <span>${item.description}</span>
                    <span>${item.quantity}x</span>
                  </div>
                  <div class="row">
                    <span>@ Rs.${parseFloat(item.unit_price).toFixed(2)}</span>
                    <span>Rs.${parseFloat(item.total_price).toFixed(2)}</span>
                  </div>
                </div>
              `).join('') || ''}
            </div>
            
            <div style="margin: 15px 0; border-top: 1px solid #000; padding-top: 10px;">
              <div class="row">
                <span>Game Charges:</span>
                <span>Rs.${parseFloat(invoice.game_charges || 0).toFixed(2)}</span>
              </div>
              
              <div class="row">
                <span>Canteen Charges:</span>
                <span>Rs.${parseFloat(invoice.canteen_charges || 0).toFixed(2)}</span>
              </div>
              
              <div class="row">
                <span>Subtotal:</span>
                <span>Rs.${parseFloat(invoice.subtotal || 0).toFixed(2)}</span>
              </div>
              
              <div class="row">
                <span>Tax:</span>
                <span>Rs.${parseFloat(invoice.tax_amount || 0).toFixed(2)}</span>
              </div>
              
              <div class="row">
                <span>Discount:</span>
                <span>Rs.${parseFloat(invoice.discount_amount || 0).toFixed(2)}</span>
              </div>
              
              <div class="row total">
                <span>TOTAL:</span>
                <span>Rs.${parseFloat(invoice.total_amount || 0).toFixed(2)}</span>
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

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice Details - {invoice.invoice_number}</span>
            <div className="flex gap-2">
              <Badge className={getStatusColor(invoice.payment_status)}>
                {invoice.payment_status?.charAt(0).toUpperCase() + invoice.payment_status?.slice(1)}
              </Badge>
              <Button variant="outline" size="sm" onClick={handlePrintInvoice}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Invoice Number:</span>
                <span>{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{format(new Date(invoice.createdAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Customer:</span>
                <span>{invoice.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{invoice.customer_phone}</span>
              </div>
              {invoice.session && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Session:</span>
                    <span>{invoice.session.session_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Table:</span>
                    <span>{invoice.session.table?.table_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Game Type:</span>
                    <span>{invoice.session.gameType?.name}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Game Charges:</span>
                <span>Rs.{parseFloat(invoice.game_charges || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Canteen Charges:</span>
                <span>Rs.{parseFloat(invoice.canteen_charges || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>Rs.{parseFloat(invoice.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax:</span>
                <span>Rs.{parseFloat(invoice.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Discount:</span>
                <span>Rs.{parseFloat(invoice.discount_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total Amount:</span>
                <span>Rs.{parseFloat(invoice.total_amount || 0).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invoice Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoice.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.item_type === 'table_session' ? 'Game Session' : 'Canteen Item'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {item.quantity} x Rs.{parseFloat(item.unit_price).toFixed(2)}
                    </div>
                    <div className="text-sm font-bold">
                      Rs.{parseFloat(item.total_price).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Update Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Update Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Status</label>
                <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="jazzCash">JazzCash</SelectItem>
                    <SelectItem value="Easypaisa">Easypaisa</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleUpdateStatus} 
                  disabled={isUpdating}
                  className="w-full"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
