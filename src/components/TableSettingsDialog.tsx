
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocalTableStatus } from "@/hooks/useLocalTableStatus";
import { SnookerTable } from "@/types";

interface TableSettingsDialogProps {
  table: SnookerTable;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TableSettingsDialog = ({ table, open, onOpenChange }: TableSettingsDialogProps) => {
  const { toast } = useToast();
  const { getTableStatus, updateTableStatus } = useLocalTableStatus();
  const [selectedStatus, setSelectedStatus] = useState<string>(getTableStatus(table.id, table.status));

  const handleSaveSettings = () => {
    updateTableStatus(table.id, selectedStatus as any);
    
    toast({
      title: "Settings Updated",
      description: `Table ${table.table_number} status changed to ${selectedStatus}`,
    });
    
    onOpenChange(false);
    
    // Refresh the page to show updated status
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Table {table.table_number} Settings</DialogTitle>
          <DialogDescription>
            Manage table status and configuration
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tableStatus">Table Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TableSettingsDialog;
