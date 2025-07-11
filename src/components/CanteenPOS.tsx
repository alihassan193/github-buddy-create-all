
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { CanteenItem, CartItem } from "@/types";
import { createQuickSale } from "@/services/sessionService";

interface CanteenPOSProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: any;
}

const CanteenPOS = ({ open, onOpenChange, session }: CanteenPOSProps) => {
  const { canteenItems, canteenCategories, clubId } = useData();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter items based on search and category
  const filteredItems = canteenItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === null || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory && item.stock_quantity > 0;
  });

  const addToCart = (item: CanteenItem) => {
    const existingItem = cart.find(cartItem => cartItem.item.id === item.id);
    
    if (existingItem) {
      if (existingItem.quantity < item.stock_quantity) {
        setCart(cart.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      } else {
        toast({
          title: "Stock Limit",
          description: "Cannot add more items than available in stock",
          variant: "destructive",
        });
      }
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(cartItem => cartItem.item.id !== itemId));
  };

  const updateQuantity = (itemId: number, change: number) => {
    setCart(cart.map(cartItem => {
      if (cartItem.item.id === itemId) {
        const newQuantity = cartItem.quantity + change;
        if (newQuantity <= 0) {
          return null;
        }
        if (newQuantity > cartItem.item.stock_quantity) {
          toast({
            title: "Stock Limit",
            description: "Cannot exceed available stock",
            variant: "destructive",
          });
          return cartItem;
        }
        return { ...cartItem, quantity: newQuantity };
      }
      return cartItem;
    }).filter(Boolean) as CartItem[]);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add items to cart before checkout",
        variant: "destructive",
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        title: "Customer Name Required",
        description: "Please enter customer name",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const saleData = {
        club_id: clubId || 1,
        customer_name: customerName.trim(),
        payment_method: paymentMethod,
        items: cart.map(cartItem => ({
          canteen_item_id: cartItem.item.id,
          quantity: cartItem.quantity
        }))
      };

      const result = await createQuickSale(saleData);
      
      toast({
        title: "Sale Completed",
        description: `Sale completed successfully. Invoice: ${result.invoice.invoice_number}`,
      });
      
      // Reset form
      setCart([]);
      setCustomerName("");
      setPaymentMethod("cash");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process sale",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Canteen POS - Quick Sale
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[70vh]">
          {/* Items Section */}
          <div className="lg:col-span-2 space-y-4 overflow-y-auto">
            {/* Search and Categories */}
            <div className="space-y-3">
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {canteenCategories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredItems.map(item => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-600">Rs.{item.price}</span>
                        <Badge variant="outline" className="text-xs">
                          Stock: {item.stock_quantity}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No items found</p>
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4 overflow-y-auto">
            <h3 className="font-semibold">Quick Sale</h3>

            {/* Customer Details */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />
            
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(cartItem => (
                  <div key={cartItem.item.id} className="bg-white rounded p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{cartItem.item.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(cartItem.item.id)}
                        className="h-6 w-6 p-0 text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(cartItem.item.id, -1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium">{cartItem.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(cartItem.item.id, 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-bold text-green-600">
                        Rs.{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-green-600">
                      Rs.{getTotalAmount().toFixed(2)}
                    </span>
                  </div>
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full"
                    disabled={isProcessing || !customerName.trim()}
                  >
                    {isProcessing ? 'Processing...' : 'Complete Sale'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CanteenPOS;
