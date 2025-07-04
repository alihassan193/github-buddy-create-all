import { useState, useEffect, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { SnookerTable, GameType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  createTable,
  deleteTable,
  updateTablePricing,
  getTablePricing,
} from "@/services/tableService";

const AdminTableList = () => {
  const { tables, gameTypes, clubId, refreshTables } = useData();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<SnookerTable | null>(null);
  const [newTable, setNewTable] = useState<Partial<SnookerTable>>({
    table_number: "",
  });
  const [pricings, setPricings] = useState<any[]>([]);
  const [tablePricings, setTablePricings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Load initial data only once
  const loadData = useCallback(async () => {
    if (!initialLoadDone && clubId) {
      setIsLoading(true);
      try {
        await refreshTables();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
        setInitialLoadDone(true);
      }
    }
  }, [refreshTables, clubId, initialLoadDone]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenNewDialog = () => {
    setSelectedTable(null);
    setNewTable({
      table_number: "",
    });
    setDialogOpen(true);
  };

  const handleOpenPricingDialog = async (table: SnookerTable) => {
    setSelectedTable(table);
    setIsLoading(true);
    
    try {
      // Get existing pricing from API using the table-specific endpoint
      const existingPricings = await getTablePricing(table.id, clubId || 1);
      console.log('Existing table pricings:', existingPricings);
      
      setTablePricings(existingPricings);
      
      // Create pricing entries based on existing table pricings
      const initialPricings = existingPricings.map((pricing: any) => ({
        ...pricing,
        price: parseFloat(pricing.price) || 0,
        fixed_price: pricing.fixed_price ? parseFloat(pricing.fixed_price) : null,
        price_per_minute: pricing.price_per_minute ? parseFloat(pricing.price_per_minute) : null,
      }));

      setPricings(initialPricings);
      setPricingDialogOpen(true);
    } catch (error) {
      console.error('Error loading pricing:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTable = async () => {
    if (!newTable.table_number) {
      toast({
        title: "Error",
        description: "Table number is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createTable({
        table_number: newTable.table_number,
        table_type: "standard",
        club_id: clubId || 1,
      });

      await refreshTables();

      toast({
        title: "Table Added",
        description: `Table ${newTable.table_number} has been added`,
      });

      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create table",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePricing = async () => {
    if (!selectedTable || !clubId) return;

    // Filter out inactive pricings
    const activePricings = pricings.filter((p) => p.is_active);

    if (activePricings.length === 0) {
      toast({
        title: "No Active Pricing",
        description: "Please activate at least one game type pricing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update each active pricing
      for (const pricing of activePricings) {
        const pricingData = {
          club_id: clubId,
          game_type_id: pricing.game_type_id,
          price: pricing.price,
          fixed_price: pricing.fixed_price,
          price_per_minute: pricing.price_per_minute,
          time_limit_minutes: pricing.time_limit_minutes,
          is_unlimited_time: pricing.is_unlimited_time || false,
        };

        await updateTablePricing(selectedTable.id, pricingData);
      }

      await refreshTables();

      toast({
        title: "Pricing Updated",
        description: `Pricing for ${selectedTable.table_number} has been updated`,
      });

      setPricingDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTable = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setIsLoading(true);
      try {
        await deleteTable(id);
        await refreshTables();

        toast({
          title: "Table Deleted",
          description: `${name} has been deleted`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete table",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updatePricingField = (pricingId: number, field: string, value: any) => {
    setPricings(pricings.map((p) =>
      p.id === pricingId ? { ...p, [field]: value } : p
    ));
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleOpenNewDialog} disabled={isLoading}>
          Add New Table
        </Button>
      </div>

      {tables.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Game Types</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table) => {
                // Get pricing for this table from table.pricings array
                const tablePricings = table.pricings || [];
                const gameTypesWithPricing = tablePricings.map((tp: any) => tp.game_type).filter(Boolean);

                return (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">
                      {table.table_number}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`capitalize ${
                          table.status === "available"
                            ? "text-green-600"
                            : table.status === "occupied"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {table.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {gameTypesWithPricing.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {gameTypesWithPricing.map((gt: any, index: number) => (
                            <span
                              key={gt?.id || index}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full"
                            >
                              {gt?.name || 'Unknown'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          No pricing set
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPricingDialog(table)}
                          disabled={isLoading}
                          className="w-full sm:w-auto"
                        >
                          Pricing
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 w-full sm:w-auto"
                          onClick={() =>
                            handleDeleteTable(table.id, table.table_number)
                          }
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">
            {isLoading ? "Loading tables..." : "No tables found."}
          </p>
          {!isLoading && (
            <Button
              onClick={handleOpenNewDialog}
              className="mt-4"
              disabled={isLoading}
            >
              Add your first table
            </Button>
          )}
        </div>
      )}

      {/* Add Table Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tableNumber">Table Number</Label>
              <Input
                id="tableNumber"
                type="text"
                value={newTable.table_number}
                onChange={(e) =>
                  setNewTable({ ...newTable, table_number: e.target.value })
                }
                placeholder="e.g. 001"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTable} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Adding..." : "Add Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricing Dialog - Updated to show only table-specific pricing */}
      <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>
              Set Pricing for {selectedTable?.table_number || "Table"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {tablePricings.length > 0 ? (
              <Tabs defaultValue={tablePricings[0]?.id.toString()}>
                <TabsList className="mb-4 w-full flex">
                  {tablePricings.map((pricing) => (
                    <TabsTrigger
                      key={pricing.id}
                      value={pricing.id.toString()}
                      className="flex-1 text-xs"
                    >
                      {pricing.game_type?.name || 'Game'}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {tablePricings.map((tablePricing) => {
                  const pricing = pricings.find((p) => p.id === tablePricing.id) || tablePricing;

                  return (
                    <TabsContent key={tablePricing.id} value={tablePricing.id.toString()}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`enable-${tablePricing.id}`}>
                            Enable {tablePricing.game_type?.name}
                          </Label>
                          <Switch
                            id={`enable-${tablePricing.id}`}
                            checked={pricing.is_active || false}
                            onCheckedChange={(checked) => {
                              updatePricingField(tablePricing.id, "is_active", checked);
                            }}
                          />
                        </div>

                        {pricing.is_active && (
                          <>
                            {tablePricing.game_type?.pricing_type === 'fixed' ? (
                              // Fixed pricing (Frames)
                              <>
                                <div className="grid gap-2">
                                  <Label htmlFor={`fixed-price-${tablePricing.id}`}>
                                    Fixed Price (Rs)
                                  </Label>
                                  <Input
                                    id={`fixed-price-${tablePricing.id}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={pricing.fixed_price || ""}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      updatePricingField(tablePricing.id, "fixed_price", value);
                                      updatePricingField(tablePricing.id, "price", value);
                                    }}
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label htmlFor={`time-limit-${tablePricing.id}`}>
                                    Time Limit (minutes)
                                  </Label>
                                  <Input
                                    id={`time-limit-${tablePricing.id}`}
                                    type="number"
                                    min="1"
                                    value={pricing.time_limit_minutes || ""}
                                    onChange={(e) =>
                                      updatePricingField(
                                        tablePricing.id,
                                        "time_limit_minutes",
                                        parseInt(e.target.value) || null
                                      )
                                    }
                                  />
                                </div>
                              </>
                            ) : (
                              // Per minute pricing (Century)
                              <>
                                <div className="grid gap-2">
                                  <Label htmlFor={`per-minute-price-${tablePricing.id}`}>
                                    Price per Minute (Rs)
                                  </Label>
                                  <Input
                                    id={`per-minute-price-${tablePricing.id}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={pricing.price_per_minute || ""}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      updatePricingField(tablePricing.id, "price_per_minute", value);
                                      updatePricingField(tablePricing.id, "price", value);
                                    }}
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`unlimited-${tablePricing.id}`}>
                                    Unlimited Time
                                  </Label>
                                  <Switch
                                    id={`unlimited-${tablePricing.id}`}
                                    checked={pricing.is_unlimited_time || false}
                                    onCheckedChange={(checked) => {
                                      updatePricingField(tablePricing.id, "is_unlimited_time", checked);
                                    }}
                                  />
                                </div>

                                {!pricing.is_unlimited_time && (
                                  <div className="grid gap-2">
                                    <Label htmlFor={`time-limit-${tablePricing.id}`}>
                                      Time Limit (minutes)
                                    </Label>
                                    <Input
                                      id={`time-limit-${tablePricing.id}`}
                                      type="number"
                                      min="1"
                                      value={pricing.time_limit_minutes || ""}
                                      onChange={(e) =>
                                        updatePricingField(
                                          tablePricing.id,
                                          "time_limit_minutes",
                                          parseInt(e.target.value) || null
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No pricing configured for this table</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setPricingDialogOpen(false)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleSavePricing} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Saving..." : "Save Pricing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTableList;
