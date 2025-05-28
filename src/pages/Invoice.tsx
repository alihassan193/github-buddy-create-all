
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

const Invoice = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { invoices, payInvoice, tables } = useData();
  const { user } = useAuth();
  
  const invoice = invoices.find((inv) => inv.id === invoiceId);
  const table = invoice && invoice.tableId ? tables.find(t => t.id === invoice.tableId) : null;
  
  // Group invoice items by type
  const gameItems = invoice ? invoice.items.filter(item => item.type === 'game') : [];
  const canteenItems = invoice ? invoice.items.filter(item => item.type === 'canteen') : [];
  
  // Calculate subtotals
  const gameTotal = gameItems.reduce((sum, item) => sum + item.total, 0);
  const canteenTotal = canteenItems.reduce((sum, item) => sum + item.total, 0);
  
  if (!invoice) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Invoice not found</h1>
        <Button onClick={() => navigate("/")}>Back to Tables</Button>
      </div>
    );
  }
  
  const handlePay = () => {
    payInvoice(invoice.id);
    navigate("/");
  };
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <Card className="border-2">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Invoice #{invoice.id.split('-')[1]}</CardTitle>
              <p className="text-gray-500 text-sm">{table ? `Table: ${table.table_number}` : 'Guest Order'}</p>
              <p className="text-gray-500 text-sm">Date: {new Date(invoice.date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-2xl">Snooker Club</div>
              <p className="text-gray-500 text-sm">123 Main St, City</p>
              <p className="text-gray-500 text-sm">info@snookerclub.com</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="py-4">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              {gameItems.length > 0 && <TabsTrigger value="game">Game Charges</TabsTrigger>}
              {canteenItems.length > 0 && <TabsTrigger value="canteen">Canteen Orders</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="all">
              <Table>
                <TableCaption>Complete invoice details</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.type === 'game' ? 'Game' : 'Canteen'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">${invoice.total.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            
            {gameItems.length > 0 && (
              <TabsContent value="game">
                <Table>
                  <TableCaption>Game charges</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gameItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">Game Subtotal</TableCell>
                      <TableCell className="text-right font-bold">${gameTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
            )}
            
            {canteenItems.length > 0 && (
              <TabsContent value="canteen">
                <Table>
                  <TableCaption>Canteen orders</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {canteenItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">Canteen Subtotal</TableCell>
                      <TableCell className="text-right font-bold">${canteenTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Payment Status: {invoice.isPaid ? 'Paid' : 'Pending'}</p>
          </div>
          {!invoice.isPaid && (
            <Button onClick={handlePay}>Pay Invoice</Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Tables
        </Button>
      </div>
    </div>
  );
};

export default Invoice;
