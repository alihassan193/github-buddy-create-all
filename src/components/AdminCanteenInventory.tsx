import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CanteenItem, CanteenCategory } from "@/types";
import {
  createCanteenCategory,
  createCanteenItem,
  updateCanteenItemStock
} from "@/services/canteenService";

interface StockUpdate {
  item_id: number | null;
  quantity: number | null;
}

interface NewItem {
  name: string | null;
  category_id: number | null;
  price: number | null;
  stock_quantity: number | null;
  club_id: number | null;
}

interface NewCategory {
  name: string | null;
}

const AdminCanteenInventory = () => {
  const { canteenItems, canteenCategories, refreshCanteenData } = useData();
  const { toast } = useToast();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategory>({ name: "" });
  const [newItem, setNewItem] = useState<NewItem>({
    name: "",
    category_id: null,
    price: null,
    stock_quantity: 0,
    club_id: 1
  });
  const [stockUpdate, setStockUpdate] = useState<StockUpdate>({
    item_id: null,
    quantity: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await refreshCanteenData();
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategory.name?.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createCanteenCategory({
        name: newCategory.name.trim()
      });

      toast({
        title: "Category Created",
        description: `Category "${newCategory.name}" has been created`,
      });

      setNewCategory({ name: "" });
      setCategoryDialogOpen(false);
      await refreshCanteenData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.name?.trim() || !newItem.category_id || !newItem.price) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createCanteenItem({
        name: newItem.name.trim(),
        category_id: newItem.category_id,
        price: newItem.price,
        stock_quantity: newItem.stock_quantity || 0,
        club_id: 1
      });

      toast({
        title: "Item Created",
        description: `Item "${newItem.name}" has been created`,
      });

      setNewItem({
        name: "",
        category_id: null,
        price: null,
        stock_quantity: 0,
        club_id: 1
      });
      setItemDialogOpen(false);
      await refreshCanteenData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!stockUpdate.item_id || !stockUpdate.quantity) {
      toast({
        title: "Error",
        description: "Please select an item and enter quantity",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCanteenItemStock(stockUpdate.item_id, {
        quantity: stockUpdate.quantity
      });

      const item = canteenItems.find(item => item.id === stockUpdate.item_id);
      toast({
        title: "Stock Updated",
        description: `Stock updated for "${item?.name}"`,
      });

      setStockUpdate({
        item_id: null,
        quantity: null
      });
      setStockDialogOpen(false);
      await refreshCanteenData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update stock",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="md:flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-2 md:mb-0">Canteen Inventory</h2>
        <div className="space-x-2">
          <Button onClick={() => setCategoryDialogOpen(true)}>
            Add Category
          </Button>
          <Button onClick={() => setItemDialogOpen(true)}>
            Add Item
          </Button>
          <Button onClick={() => setStockDialogOpen(true)}>
            Update Stock
          </Button>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {canteenItems.map((item) => {
              const category = canteenCategories.find(cat => cat.id === item.category_id);
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{category?.name || 'Unknown'}</TableCell>
                  <TableCell>Rs.{item.price?.toFixed(2)}</TableCell>
                  <TableCell>{item.stock_quantity}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No canteen items found.</p>
          <Button onClick={() => setItemDialogOpen(true)} className="mt-4">
            Add your first item
          </Button>
        </div>
      )}

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
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="e.g. Beverages"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="e.g. Coke"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="itemCategory">Category</Label>
              <Select onValueChange={(value) => setNewItem({ ...newItem, category_id: Number(value) })}>
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
            <div className="grid gap-2">
              <Label htmlFor="itemPrice">Price</Label>
              <Input
                id="itemPrice"
                type="number"
                step="0.01"
                value={newItem.price || ""}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: parseFloat(e.target.value) })
                }
                placeholder="e.g. 50.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="itemStock">Stock Quantity</Label>
              <Input
                id="itemStock"
                type="number"
                value={newItem.stock_quantity || 0}
                onChange={(e) =>
                  setNewItem({ ...newItem, stock_quantity: Number(e.target.value) })
                }
                placeholder="e.g. 100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Stock Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Quantity</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stockItem">Select Item</Label>
              <Select onValueChange={(value) => setStockUpdate({ ...stockUpdate, item_id: Number(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  {canteenItems.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockQuantity">Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                value={stockUpdate.quantity || ""}
                onChange={(e) =>
                  setStockUpdate({ ...stockUpdate, quantity: Number(e.target.value) })
                }
                placeholder="e.g. 50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setStockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminCanteenInventory;
