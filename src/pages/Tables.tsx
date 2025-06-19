import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Grid3X3, List, Search, Filter } from "lucide-react";
import { createTable } from "@/services/tableService";
import { getAllSessions } from "@/services/sessionService";
import EnhancedTableCard from "@/components/EnhancedTableCard";
import { useSmartRefresh } from "@/hooks/useSmartRefresh";

const Tables = () => {
  const { user } = useAuth();
  const { tables, refreshTables } = useData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [newTable, setNewTable] = useState({
    table_number: '',
    table_type: 'standard',
    description: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await refreshTables();
      
      // Fetch active sessions
      const sessionsResponse = await getAllSessions({ status: 'active' });
      setActiveSessions(sessionsResponse?.sessions || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tables data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use smart refresh instead of regular interval
  const { forceRefresh } = useSmartRefresh({
    refreshFn: fetchData,
    interval: 30000,
    skipWhenDialogsOpen: true
  });

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
      refreshTables(); // Refresh the tables list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create table",
        variant: "destructive"
      });
    }
  };

  const filteredTables = tables.filter(table => {
    const matchesStatus = filterStatus === 'all' || table.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      table.table_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (table.table_type || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusCounts = () => {
    return {
      total: tables.length,
      available: tables.filter(t => t.status === 'available').length,
      occupied: tables.filter(t => t.status === 'occupied').length,
      maintenance: tables.filter(t => t.status === 'maintenance').length
    };
  };

  const statusCounts = getStatusCounts();
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
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Table Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage snooker tables in real-time
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusCounts.occupied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.maintenance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tables Grid/List */}
      {filteredTables.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredTables.map((table) => (
            <EnhancedTableCard 
              key={table.id} 
              table={table} 
              activeSessions={activeSessions}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== 'all' 
                ? 'No tables match your current filters' 
                : 'No tables found'
              }
            </p>
            {canManageTables && !searchQuery && filterStatus === 'all' && (
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
