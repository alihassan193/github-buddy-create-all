
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CanteenItem, CanteenCategory } from "@/types";
import { Plus, Minus } from "lucide-react";

const AdminCanteenInventory = () => {
  const { canteenItems, canteenCategories, addCanteenItem, updateCanteenItemStock, addCanteenCategory } = useData();
  const { toast } = useToast();
  
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<CanteenItem>>({
    name: "",
    category_id: 1,
    price: 0,
    stock_quantity: 0,
    created_by: 1 // This should be the actual user ID
  });
  const [newCategory, setNewCategory] = useState("");
  
  // Function to handle adding a new canteen item
  const handleAddItem = () => {
    if (!newItem.name || !newItem.category_id || newItem.price <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill all required fields with valid values",
        variant: "destructive",
      });
      return;
    }
    
    addCanteenItem({
      name: newItem.name,
      category_id: newItem.category_id,
      price: newItem.price,
      stock_quantity: newItem.stock_quantity || 0,
      created_by: newItem.created_by || 1
    });
    
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to inventory`
    });
    
    setNewItem({
      name: "",
      category_id: 1,
      price: 0,
      stock_quantity: 0,
      created_by: 1
    });
    setItemDialogOpen(false);
  };
  
  // Function to handle adding a new category
  const handleAddCategory = () => {
    if (!newCategory) {
      toast({
        title: "Invalid Input",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }
    
    addCanteenCategory(newCategory);
    
    toast({
      title: "Category Added",
      description: `${newCategory} has been added to categories`
    });
    
    setNewCategory("");
    setCategoryDialogOpen(false);
  };
  
  // Function to handle updating stock quantity
  const handleUpdateStock = (item: CanteenItem, change: number) => {
    const newQuantity = item.stock_quantity + change;
    if (newQuantity < 0) return;
    
    updateCanteenItemStock(item.id, newQuantity);
    
    toast({
      title: "Stock Updated",
      description: `${item.name} stock updated to ${newQuantity}`
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Inventory Management</h3>
        <div className="flex space-x-2">
          <Button onClick={() => setCategoryDialogOpen(true)}>Add Category</Button>
          <Button onClick={() => setItemDialogOpen(true)}>Add Item</Button>
        </div>
      </div>
      
      {canteenItems.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canteenItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  {canteenCategories.find(c => c.id === item.category_id)?.name || 'Unknown'}
                </TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`${
                    item.stock_quantity > 10 ? 'text-green-600' : 
                    item.stock_quantity > 0 ? 'text-amber-600' : 
                    'text-red-600'
                  }`}>
                    {item.stock_quantity}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateStock(item, -1)}
                      disabled={item.stock_quantity <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateStock(item, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No items found.</p>
          <Button onClick={() => setItemDialogOpen(true)} className="mt-4">Add your first item</Button>
        </div>
      )}
      
      {/* Add Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g. Cola"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={newItem.category_id?.toString()} 
                onValueChange={(value) => setNewItem({ ...newItem, category_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {canteenCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.price || ""}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={newItem.stock_quantity || ""}
                  onChange={(e) => setNewItem({ ...newItem, stock_quantity: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Beverages"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCanteenInventory;
