
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/DataContext";
import { ShoppingCart, Plus, Minus, DollarSign } from "lucide-react";
import { addCanteenOrderToSession } from "@/services/sessionService";

interface SessionPOSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: number;
  sessionInfo?: {
    table_number: string;
    player_names: string;
  };
}

interface CartItem {
  item_id: number;
  name: string;
  price: number;
  quantity: number;
}

const SessionPOSDialog = ({ open, onOpenChange, sessionId, sessionInfo }: SessionPOSDialogProps) => {
  const { canteenItems } = useData();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToCart = (item: any) => {
    const existingItem = cart.find(cartItem => cartItem.item_id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.item_id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (itemId: number) => {
    const existingItem = cart.find(cartItem => cartItem.item_id === itemId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem => 
        cartItem.item_id === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.item_id !== itemId));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to cart before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await addCanteenOrderToSession(sessionId, {
        items: cart.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity
        }))
      });

      toast({
        title: "Success",
        description: "Order added to session successfully"
      });

      setCart([]);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add order to session",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Session Order - {sessionInfo?.table_number}
          </DialogTitle>
          {sessionInfo?.player_names && (
            <p className="text-sm text-muted-foreground">Players: {sessionInfo.player_names}</p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items Grid */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Menu Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {canteenItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium mb-1">{item.name}</div>
                    <div className="text-lg font-bold text-green-600">Rs.{item.price}</div>
                    {item.stock_quantity <= 5 && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        Low Stock ({item.stock_quantity})
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No items in cart
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.item_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Rs.{item.price} each
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(item.item_id);
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart({ id: item.item_id, name: item.name, price: item.price });
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-green-600">Rs.{getTotalAmount()}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSubmitOrder}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Add to Session'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionPOSDialog;
