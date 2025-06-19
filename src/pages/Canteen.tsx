
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Coffee, Package, Settings, Store } from "lucide-react";
import AdminCanteenInventory from "@/components/AdminCanteenInventory";
import CanteenPOS from "@/components/CanteenPOS";
import { useToast } from "@/hooks/use-toast";

const Canteen = () => {
  const { canteenItems, canteenCategories } = useData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  const [showPOS, setShowPOS] = useState(false);

  const getCategoryItems = (categoryId: number) => {
    return canteenItems.filter(item => item.category_id === categoryId);
  };

  const getTotalItems = () => canteenItems.length;
  const getLowStockItems = () => canteenItems.filter(item => (item.stock_quantity || 0) < 10).length;
  const getTotalCategories = () => canteenCategories.length;

  // Helper function to safely format price
  const formatPrice = (price: any): string => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
    return numPrice.toFixed(2);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Canteen Management</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowPOS(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Store className="h-4 w-4 mr-2" />
            POS
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalItems()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalCategories()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getLowStockItems()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="menu">Menu View</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <AdminCanteenInventory />
        </TabsContent>

        <TabsContent value="menu">
          {canteenCategories.length > 0 ? (
            <div className="space-y-6">
              {canteenCategories.map((category) => {
                const categoryItems = getCategoryItems(category.id);
                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coffee className="h-5 w-5" />
                        {category.name}
                        <Badge variant="outline">{categoryItems.length} items</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categoryItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryItems.map((item) => (
                            <Card key={item.id} className="border border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium">{item.name}</h4>
                                  <Badge 
                                    variant={item.stock_quantity && item.stock_quantity > 10 ? "default" : "destructive"}
                                  >
                                    {item.stock_quantity || 0} in stock
                                  </Badge>
                                </div>
                                <p className="text-xl font-bold text-green-600">
                                  Rs.{formatPrice(item.price)}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No items in this category
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Coffee className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No categories found.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Create categories and items in the Inventory tab to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* POS Modal */}
      {showPOS && (
        <CanteenPOS 
          open={showPOS} 
          onOpenChange={setShowPOS}
          session={null}
        />
      )}
    </div>
  );
};

export default Canteen;
