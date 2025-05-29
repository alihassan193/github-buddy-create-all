
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Building, Plus } from "lucide-react";
import { createClub, getAllClubs } from "@/services/clubService";

const AdminClubManagement = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isClubDialogOpen, setIsClubDialogOpen] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Club creation form state
  const [clubName, setClubName] = useState("");
  const [clubAddress, setClubAddress] = useState("");
  const [clubPhone, setClubPhone] = useState("");
  const [clubEmail, setClubEmail] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  
  // Check user permissions
  const isSuperAdmin = currentUser?.role === 'super_admin';
  
  // Fetch clubs when component mounts
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching clubs...");
        
        const clubsResponse = await getAllClubs();
        const fetchedClubs = Array.isArray(clubsResponse) ? clubsResponse : clubsResponse?.data || [];
        console.log("Fetched clubs:", fetchedClubs);
        
        setClubs(fetchedClubs);
      } catch (error) {
        console.error("Error fetching clubs:", error);
        setError("Failed to load clubs");
        toast({
          title: "Error",
          description: "Failed to fetch clubs",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClubs();
  }, [toast]);
  
  const handleCreateClub = async () => {
    if (!clubName || !clubAddress) {
      toast({
        title: "Error",
        description: "Please fill in required fields (name and address)",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const clubData = {
        name: clubName,
        address: clubAddress,
        phone: clubPhone || undefined,
        email: clubEmail || undefined,
        description: clubDescription || undefined
      };
      
      console.log("Creating club with data:", clubData);
      
      const response = await createClub(clubData);
      console.log("Club creation response:", response);
      
      // Refresh clubs list
      try {
        const updatedClubsResponse = await getAllClubs();
        const updatedClubs = Array.isArray(updatedClubsResponse) ? updatedClubsResponse : updatedClubsResponse?.data || [];
        setClubs(updatedClubs);
      } catch (refreshError) {
        console.error("Error refreshing clubs:", refreshError);
      }
      
      toast({
        title: "Success",
        description: "Club created successfully",
      });
      
      // Reset form
      setClubName("");
      setClubAddress("");
      setClubPhone("");
      setClubEmail("");
      setClubDescription("");
      setIsClubDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating club:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create club",
        variant: "destructive"
      });
    }
  };
  
  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <p className="text-red-500">Error: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Club Management</h3>
        {isSuperAdmin && (
          <Dialog open={isClubDialogOpen} onOpenChange={setIsClubDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Club
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Club</DialogTitle>
                <DialogDescription>
                  Create a new snooker club in the system. Name and address are required fields.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="clubName">Club Name *</Label>
                  <Input
                    id="clubName"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="Enter club name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clubAddress">Address *</Label>
                  <Input
                    id="clubAddress"
                    value={clubAddress}
                    onChange={(e) => setClubAddress(e.target.value)}
                    placeholder="Enter club address"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clubPhone">Phone</Label>
                  <Input
                    id="clubPhone"
                    value={clubPhone}
                    onChange={(e) => setClubPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clubEmail">Email</Label>
                  <Input
                    id="clubEmail"
                    type="email"
                    value={clubEmail}
                    onChange={(e) => setClubEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clubDescription">Description</Label>
                  <Input
                    id="clubDescription"
                    value={clubDescription}
                    onChange={(e) => setClubDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsClubDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateClub} disabled={!clubName || !clubAddress}>
                  Create Club
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Clubs Table */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading clubs...</div>
        ) : clubs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell>{club.id}</TableCell>
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell>{club.address}</TableCell>
                  <TableCell>{club.phone || '-'}</TableCell>
                  <TableCell>{club.email || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      club.status === 'active' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {club.status || 'Active'}
                    </span>
                  </TableCell>
                  <TableCell>{club.description || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No clubs found.</p>
            {isSuperAdmin && (
              <p className="text-sm">Create your first club to get started.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClubManagement;
