
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, Package, ShoppingCart, AlertTriangle } from "lucide-react";
import { getAllCanteenItems, getLowStockItems, updateStock } from "@/services/canteenService";

const Canteen = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [canteenItems, setCanteenItems] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.permissions?.can_manage_canteen) {
      fetchCanteenData();
    }
  }, [user]);

  const fetchCanteenData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all canteen items
      const itemsResponse = await getAllCanteenItems();
      const items = Array.isArray(itemsResponse) ? itemsResponse : itemsResponse?.data || [];
      setCanteenItems(items);

      // Fetch low stock items - fix the type issue
      const lowStockResponse = await getLowStockItems();
      const lowStock = Array.isArray(lowStockResponse) ? lowStockResponse : (lowStockResponse as any)?.data || [];
      setLowStockItems(lowStock);
    } catch (error) {
      console.error("Error fetching canteen data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch canteen data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockUpdate = async (itemId: number, operation: 'add' | 'subtract', quantity: number = 1) => {
    try {
      await updateStock(itemId, { quantity, operation });
      toast({
        title: "Success",
        description: "Stock updated successfully"
      });
      fetchCanteenData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update stock",
        variant: "destructive"
      });
    }
  };

  const filteredItems = canteenItems.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user?.permissions?.can_manage_canteen) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access the canteen.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <p>Loading canteen data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Canteen Management</h1>
          <p className="text-muted-foreground">
            Manage inventory and sales
          </p>
        </div>
        <Badge variant="outline" className="bg-orange-50">
          {lowStockItems.length} Low Stock Alerts
        </Badge>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Management
              </CardTitle>
              <CardDescription>
                View and manage your canteen inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{item.name}</h3>
                          <Badge variant={item.is_available ? "default" : "secondary"}>
                            {item.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.description}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Price:</span>
                            <span className="font-medium">${item.price?.toFixed(2) || '0.00'}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Stock:</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStockUpdate(item.id, 'subtract')}
                                disabled={item.stock_quantity <= 0}
                              >
                                -
                              </Button>
                              <Badge 
                                variant={
                                  item.stock_quantity > (item.minimum_stock || 10) ? "default" :
                                  item.stock_quantity > 0 ? "secondary" : "destructive"
                                }
                              >
                                {item.stock_quantity || 0}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStockUpdate(item.id, 'add')}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Coffee className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No items found matching your search" : "No canteen items found"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>
                Items that need restocking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border-l-4 border-l-orange-500">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.stock_quantity} | Minimum: {item.minimum_stock || 10}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">
                          {item.stock_quantity} left
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStockUpdate(item.id, 'add', 10)}
                        >
                          +10
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-green-400" />
                  <p className="text-muted-foreground">All items are well stocked!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Canteen;
