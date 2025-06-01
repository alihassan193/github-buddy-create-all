import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, Play } from "lucide-react";
import { getAllTables, createTable, updateTableStatus } from "@/services/tableService";

const Tables = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    table_number: '',
    table_type: 'standard',
    description: ''
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const response = await getAllTables();
      const tablesData = Array.isArray(response) ? response : response?.data || [];
      setTables(tablesData);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tables",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTable = async () => {
    if (!newTable.table_number) {
      toast({
        title: "Error",
        description: "Please enter a table number",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTable({
        table_number: parseInt(newTable.table_number),
        table_type: newTable.table_type,
        description: newTable.description || undefined
      });

      toast({
        title: "Success",
        description: "Table created successfully"
      });

      setNewTable({
        table_number: '',
        table_type: 'standard',
        description: ''
      });
      setIsCreateDialogOpen(false);
      fetchTables(); // Refresh the tables list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create table",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (tableId: number, newStatus: string) => {
    try {
      await updateTableStatus(tableId, newStatus);
      toast({
        title: "Success",
        description: "Table status updated successfully"
      });
      fetchTables(); // Refresh the tables list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update table status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageTables = user?.permissions?.can_manage_tables || user?.role === 'super_admin';

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <p>Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Table Management</h1>
          <p className="text-muted-foreground">
            Manage snooker tables and their availability
          </p>
        </div>
        {canManageTables && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Table</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Input
                    id="tableNumber"
                    type="number"
                    value={newTable.table_number}
                    onChange={(e) => setNewTable({...newTable, table_number: e.target.value})}
                    placeholder="Enter table number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tableType">Table Type</Label>
                  <Select 
                    value={newTable.table_type} 
                    onValueChange={(value) => setNewTable({...newTable, table_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newTable.description}
                    onChange={(e) => setNewTable({...newTable, description: e.target.value})}
                    placeholder="Enter description (optional)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTable}>
                  Create Table
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {tables.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  {canManageTables && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">
                      Table #{table.table_number}
                    </TableCell>
                    <TableCell className="capitalize">
                      {table.table_type || 'Standard'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(table.status)}>
                        {table.status || 'Available'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {table.description || '-'}
                    </TableCell>
                    {canManageTables && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Select
                            value={table.status || 'available'}
                            onValueChange={(value) => handleStatusChange(table.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="occupied">Occupied</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="reserved">Reserved</SelectItem>
                            </SelectContent>
                          </Select>
                          {table.status === 'available' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/game/new?table=${table.id}`}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No tables found</p>
            {canManageTables && (
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first table
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tables;
