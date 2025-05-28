
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CanteenItem, TableSession } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Canteen = () => {
  const { 
    canteenCategories, 
    canteenItems, 
    activeSessions,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    placeOrder
  } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  
  // Get all items with their category names
  const itemsWithCategories = canteenItems.map(item => ({
    ...item,
    category_name: canteenCategories.find(c => c.id === item.category_id)?.name || 'Uncategorized'
  }));
  
  // Filter items by search term and/or category
  const filteredItems = itemsWithCategories.filter(item => {
    const matchesSearch = search ? 
      item.name.toLowerCase().includes(search.toLowerCase()) : true;
    
    const matchesCategory = selectedTab !== "all" ? 
      item.category_id === parseInt(selectedTab) : true;
    
    return matchesSearch && matchesCategory;
  });
  
  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 
    0
  );
  
  const handleAddToCart = (item: CanteenItem) => {
    if (item.stock_quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: `${item.name} is currently out of stock`,
        variant: "destructive"
      });
      return;
    }
    
    addToCart(item, 1);
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };
  
  const handleRemoveFromCart = (itemId: number, name: string) => {
    removeFromCart(itemId);
    toast({
      title: "Removed from cart",
      description: `${name} has been removed from your cart`,
    });
  };
  
  const handleAdjustQuantity = (item: CanteenItem, change: number) => {
    const cartItem = cart.find(i => i.item.id === item.id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;
    const newQuantity = currentQuantity + change;
    
    if (newQuantity <= 0) {
      handleRemoveFromCart(item.id, item.name);
      return;
    }
    
    if (newQuantity > item.stock_quantity) {
      toast({
        title: "Limited Stock",
        description: `Only ${item.stock_quantity} available`,
        variant: "destructive"
      });
      return;
    }
    
    addToCart(item, change);
  };
  
  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add items to your cart first",
        variant: "destructive"
      });
      return;
    }
    
    placeOrder(1, selectedSessionId || undefined); // 1 is the user ID, should be dynamic
    
    toast({
      title: "Order Placed",
      description: `Order total: $${cartTotal.toFixed(2)}`,
    });
    
    setShowCartDialog(false);
    setSelectedSessionId(null);
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Canteen</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowCartDialog(true)}
            disabled={cart.length === 0}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{cart.length}</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="mb-4 overflow-auto">
          <TabsTrigger value="all">All Items</TabsTrigger>
          {canteenCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id.toString()}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <ProductCard 
                key={item.id} 
                product={item} 
                onAddToCart={handleAddToCart} 
                cartItem={cart.find(i => i.item.id === item.id)}
                onAdjustQuantity={handleAdjustQuantity}
              />
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">No items found matching your criteria.</p>
        )}
      </Tabs>
      
      <Dialog open={showCartDialog} onOpenChange={setShowCartDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Your Cart</DialogTitle>
            <DialogDescription>
              Review your items before placing an order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {cart.length > 0 ? (
              <>
                <div className="space-y-2">
                  {cart.map(cartItem => (
                    <div key={cartItem.item.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{cartItem.item.name}</p>
                        <p className="text-sm text-gray-500">${cartItem.item.price.toFixed(2)} × {cartItem.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAdjustQuantity(cartItem.item, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span>{cartItem.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAdjustQuantity(cartItem.item, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                {activeSessions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign to table (optional):</label>
                    <Select onValueChange={(value) => setSelectedSessionId(Number(value) || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a table (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Guest Order</SelectItem>
                        {activeSessions.map(session => {
                          return (
                            <SelectItem key={session.id} value={session.id.toString()}>
                              {`${session.player_name} - Table #${session.table_id}`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center py-4">Your cart is empty</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => clearCart()} disabled={cart.length === 0}>
              Clear
            </Button>
            <Button onClick={handlePlaceOrder} disabled={cart.length === 0}>
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ProductCardProps {
  product: CanteenItem & { category_name?: string };
  cartItem?: { item: CanteenItem; quantity: number };
  onAddToCart: (product: CanteenItem) => void;
  onAdjustQuantity: (product: CanteenItem, change: number) => void;
}

const ProductCard = ({ product, cartItem, onAddToCart, onAdjustQuantity }: ProductCardProps) => {
  const inCart = cartItem !== undefined;
  const quantity = cartItem?.quantity || 0;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>${product.price.toFixed(2)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`h-12 w-full rounded-md ${
          product.category_name?.toLowerCase() === 'beverages' ? 'bg-blue-100' : 
          product.category_name?.toLowerCase() === 'snacks' ? 'bg-amber-100' : 
          product.category_name?.toLowerCase() === 'food' ? 'bg-green-100' :
          'bg-gray-100'
        } flex items-center justify-center`}>
          <span className="capitalize">{product.category_name}</span>
        </div>
        <div className="mt-2">
          <span className={`text-sm ${product.stock_quantity > 10 ? 'text-green-600' : product.stock_quantity > 0 ? 'text-amber-600' : 'text-red-600'}`}>
            {product.stock_quantity > 10 ? 'In Stock' : product.stock_quantity > 0 ? `Low Stock: ${product.stock_quantity} left` : 'Out of Stock'}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        {inCart ? (
          <div className="flex w-full items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onAdjustQuantity(product, -1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-2 min-w-8 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onAdjustQuantity(product, 1)}
              disabled={product.stock_quantity <= quantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => onAddToCart(product)} 
            disabled={product.stock_quantity === 0}
            className="w-full"
          >
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Canteen;
