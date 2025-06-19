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
import { useToast } from "@/hooks/use-toast";
import { SnookerTable, GamePricing, GameType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  createTable,
  deleteTable,
  updateTablePricing,
} from "@/services/tableService";

const AdminTableList = () => {
  const { tables, gameTypes, gamePricings, refreshTables, refreshGameTypes } =
    useData();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<SnookerTable | null>(null);
  const [newTable, setNewTable] = useState<Partial<SnookerTable>>({
    table_number: "",
  });
  const [pricings, setPricings] = useState<Partial<GamePricing>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([refreshTables(), refreshGameTypes()]);
    };
    loadData();
  }, [refreshTables, refreshGameTypes]);

  const handleOpenNewDialog = () => {
    setSelectedTable(null);
    setNewTable({
      table_number: "",
    });
    setDialogOpen(true);
  };

  const handleOpenPricingDialog = (table: SnookerTable) => {
    setSelectedTable(table);

    // Load existing pricing or create defaults for each game type
    const tablePricings = gamePricings
      .filter((p) => p.table_id === table.id)
      .reduce((acc, pricing) => {
        acc[pricing.game_type_id] = pricing;
        return acc;
      }, {} as Record<number, GamePricing>);

    const initialPricings = gameTypes.map((gameType) => {
      const existing = tablePricings[gameType.id];

      if (existing) {
        return existing;
      } else {
        return {
          table_id: table.id,
          game_type_id: gameType.id,
          price: 0,
          time_limit_minutes: null,
          is_unlimited: true,
        };
      }
    });

    setPricings(initialPricings);
    setPricingDialogOpen(true);
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

    // Convert table_number to number for API call
    const tableNumber = parseInt(newTable.table_number as string);
    if (isNaN(tableNumber)) {
      toast({
        title: "Error",
        description: "Table number must be a valid number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createTable({
        table_number: tableNumber,
        table_type: "standard",
      });

      await refreshTables();

      toast({
        title: "Table Added",
        description: `Table ${tableNumber} has been added`,
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
    if (!selectedTable) return;

    // Filter out any pricing with price <= 0
    const validPricings = pricings.filter((p) => (p.price || 0) > 0);

    if (validPricings.length === 0) {
      toast({
        title: "No Valid Pricing",
        description:
          "Please add at least one valid pricing with a price greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const pricingData = validPricings.map((pricing) => ({
        game_type_id: pricing.game_type_id!,
        price: pricing.price!,
        time_limit_minutes: pricing.time_limit_minutes || undefined,
        is_unlimited: pricing.is_unlimited || false,
      }));

      await updateTablePricing(selectedTable.id, pricingData);
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

  const updatePricingField = (
    gameTypeId: number,
    field: keyof GamePricing,
    value: any
  ) => {
    setPricings(
      pricings.map((p) =>
        p.game_type_id === gameTypeId ? { ...p, [field]: value } : p
      )
    );
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleOpenNewDialog} disabled={isLoading}>
          Add New Table
        </Button>
      </div>

      {tables.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Game Types</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => {
              // Get pricing for this table
              const tablePricings = gamePricings.filter(
                (p) => p.table_id === table.id
              );
              const gameTypesWithPricing = gameTypes.filter((gt) =>
                tablePricings.some((tp) => tp.game_type_id === gt.id)
              );

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
                  <TableCell>
                    {gameTypesWithPricing.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {gameTypesWithPricing.map((gt) => (
                          <span
                            key={gt.id}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full"
                          >
                            {gt.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        No pricing set
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenPricingDialog(table)}
                      disabled={isLoading}
                    >
                      Pricing
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() =>
                        handleDeleteTable(table.id, table.table_number)
                      }
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No tables found.</p>
          <Button
            onClick={handleOpenNewDialog}
            className="mt-4"
            disabled={isLoading}
          >
            Add your first table
          </Button>
        </div>
      )}

      {/* Add Table Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                onChange={(e) =>
                  setNewTable({ ...newTable, table_number: e.target.value })
                }
                placeholder="e.g. 1"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTable} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricing Dialog */}
      <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Set Pricing for {selectedTable?.table_number || "Table"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue={gameTypes[0]?.id.toString()}>
              <TabsList className="mb-4 w-full flex">
                {gameTypes.map((gameType) => (
                  <TabsTrigger
                    key={gameType.id}
                    value={gameType.id.toString()}
                    className="flex-1"
                  >
                    {gameType.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {gameTypes.map((gameType) => {
                const pricing =
                  pricings.find((p) => p.game_type_id === gameType.id) || {};

                return (
                  <TabsContent key={gameType.id} value={gameType.id.toString()}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`enable-${gameType.id}`}>
                          Enable {gameType.name}
                        </Label>
                        <Switch
                          id={`enable-${gameType.id}`}
                          checked={(pricing.price || 0) > 0}
                          onCheckedChange={(checked) => {
                            updatePricingField(
                              gameType.id,
                              "price",
                              checked ? 10 : 0
                            );
                          }}
                        />
                      </div>

                      {(pricing.price || 0) > 0 && (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor={`price-${gameType.id}`}>
                              Price (Rs)
                            </Label>
                            <Input
                              id={`price-${gameType.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={pricing.price || ""}
                              onChange={(e) =>
                                updatePricingField(
                                  gameType.id,
                                  "price",
                                  parseFloat(e.target.value)
                                )
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor={`unlimited-${gameType.id}`}>
                              Unlimited Time
                            </Label>
                            <Switch
                              id={`unlimited-${gameType.id}`}
                              checked={pricing.is_unlimited}
                              onCheckedChange={(checked) => {
                                updatePricingField(
                                  gameType.id,
                                  "is_unlimited",
                                  checked
                                );
                              }}
                            />
                          </div>

                          {!pricing.is_unlimited && (
                            <div className="grid gap-2">
                              <Label htmlFor={`time-${gameType.id}`}>
                                Time Limit (minutes)
                              </Label>
                              <Input
                                id={`time-${gameType.id}`}
                                type="number"
                                min="1"
                                value={pricing.time_limit_minutes || ""}
                                onChange={(e) =>
                                  updatePricingField(
                                    gameType.id,
                                    "time_limit_minutes",
                                    parseInt(e.target.value)
                                  )
                                }
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPricingDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePricing} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Pricing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTableList;
