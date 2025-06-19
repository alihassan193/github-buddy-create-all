import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useData } from "@/context/DataContext";
import { addCanteenOrderToSession } from "@/services/sessionService";
import { getCanteenItemsByClub } from "@/services/canteenService";

interface CanteenOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: any;
}

const CanteenOrderDialog = ({ open, onOpenChange, session }: CanteenOrderDialogProps) => {
  const { toast } = useToast();
  const { clubId } = useData();
  const [items, setItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    const loadCanteenItems = async () => {
      if (!open) return;
      
      setIsLoadingItems(true);
      try {
        // Use club_id from DataContext, fallback to 1 if not available
        const currentClubId = clubId || 1;
        const apiItems = await getCanteenItemsByClub(currentClubId);
        
        console.log('Loaded canteen items for club:', currentClubId, apiItems);
        
        const itemsWithQuantity = apiItems.map(item => ({
          ...item,
          quantity: 0,
          price: parseFloat(item.price) || 0 // Ensure price is a number
        }));
        
        setItems(itemsWithQuantity);
      } catch (error) {
        console.error('Error loading canteen items:', error);
        toast({
          title: "Error",
          description: "Failed to load canteen items",
          variant: "destructive",
        });
        setItems([]);
      } finally {
        setIsLoadingItems(false);
      }
    };

    loadCanteenItems();
  }, [open, toast, clubId]);

  const updateQuantity = (itemId: number, change: number) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(0, Math.min(item.stock_quantity || 0, item.quantity + change)) }
          : item
      )
    );
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getSelectedItems = () => {
    return items.filter(item => item.quantity > 0);
  };

  const handlePlaceOrder = async () => {
    const selectedItems = getSelectedItems();
    
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to place an order",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderData = {
        items: selectedItems.map(item => ({
          item_id: item.id,
          quantity: item.quantity
        }))
      };

      await addCanteenOrderToSession(session.id, orderData);

      toast({
        title: "Order Placed",
        description: `Order for Table ${session.table_number || session.table_id} placed successfully. Total: Rs.${getTotal().toFixed(2)}`,
      });
      
      // Reset quantities
      setItems(prev => prev.map(item => ({ ...item, quantity: 0 })));
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Canteen Order - Table {session?.table_number || session?.table_id}
          </DialogTitle>
          <DialogDescription>
            Add items for this table {clubId && `(Club ID: ${clubId})`}
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingItems ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading items...</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No items available</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">Rs.{item.price?.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">Stock: {item.stock_quantity || 0}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity === 0}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= (item.stock_quantity || 0)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {getSelectedItems().length > 0 && (
          <div className="border-t pt-4">
            <div className="font-semibold text-lg">
              Total: Rs.{getTotal().toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              {getSelectedItems().length} item(s) selected
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handlePlaceOrder} className="flex-1" disabled={isLoadingItems}>
            Place Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CanteenOrderDialog;
