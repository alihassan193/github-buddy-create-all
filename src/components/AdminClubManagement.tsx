
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, UserPlus, Users } from "lucide-react";
import { createClub, getAllClubs, updateClub, deleteClub } from "@/services/clubService";
import { createUser, getManagedClubs } from "@/services/userService";

const AdminClubManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Club form state
  const [clubDialogOpen, setClubDialogOpen] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: ""
  });
  
  // Manager form state
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [managerForm, setManagerForm] = useState({
    username: "",
    email: "",
    password: "",
    club_id: ""
  });
  
  const isSuperAdmin = user?.role === 'super_admin';
  const isSubAdmin = user?.role === 'sub_admin';
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (isSuperAdmin) {
          // Super admin can see all clubs
          const clubsData = await getAllClubs();
          setClubs(clubsData.clubs || clubsData || []);
        } else if (isSubAdmin) {
          // Sub admin can see their managed clubs
          const managedClubs = await getManagedClubs();
          setClubs(managedClubs || []);
        }
      } catch (error) {
        console.error("Error loading clubs:", error);
        toast({
          title: "Error",
          description: "Failed to load clubs",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isSuperAdmin, isSubAdmin, toast]);
  
  const handleCreateClub = async () => {
    if (!clubForm.name) {
      toast({
        title: "Error",
        description: "Club name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createClub(clubForm);
      
      // Refresh clubs list
      const clubsData = await getAllClubs();
      setClubs(clubsData.clubs || clubsData || []);
      
      toast({
        title: "Success",
        description: "Club created successfully",
      });
      
      setClubForm({
        name: "",
        address: "",
        phone: "",
        email: "",
        description: ""
      });
      setClubDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create club",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateManager = async () => {
    if (!managerForm.username || !managerForm.email || !managerForm.password || !managerForm.club_id) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createUser(
        managerForm.username,
        managerForm.email,
        managerForm.password,
        "manager",
        parseInt(managerForm.club_id)
      );
      
      toast({
        title: "Success",
        description: "Manager created successfully",
      });
      
      setManagerForm({
        username: "",
        email: "",
        password: "",
        club_id: ""
      });
      setManagerDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create manager",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteClub = async (clubId: number, clubName: string) => {
    if (confirm(`Are you sure you want to delete ${clubName}? This action cannot be undone.`)) {
      try {
        await deleteClub(clubId);
        
        // Refresh clubs list
        const clubsData = await getAllClubs();
        setClubs(clubsData.clubs || clubsData || []);
        
        toast({
          title: "Success",
          description: "Club deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete club",
          variant: "destructive"
        });
      }
    }
  };
  
  if (!isSuperAdmin && !isSubAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You don't have permission to manage clubs.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Club Management</h3>
          <p className="text-sm text-muted-foreground">
            {isSuperAdmin ? "Manage all clubs and assign sub-admins" : "Manage your clubs and assign managers"}
          </p>
        </div>
        <div className="flex gap-2">
          {(isSuperAdmin || isSubAdmin) && (
            <Dialog open={clubDialogOpen} onOpenChange={setClubDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Club
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Club</DialogTitle>
                  <DialogDescription>
                    Add a new snooker club to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Club Name *</Label>
                    <Input
                      id="name"
                      value={clubForm.name}
                      onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                      placeholder="Enter club name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={clubForm.address}
                      onChange={(e) => setClubForm({ ...clubForm, address: e.target.value })}
                      placeholder="Enter club address"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={clubForm.phone}
                      onChange={(e) => setClubForm({ ...clubForm, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clubForm.email}
                      onChange={(e) => setClubForm({ ...clubForm, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={clubForm.description}
                      onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                      placeholder="Enter club description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setClubDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateClub}>Create Club</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {clubs.length > 0 && (
            <Dialog open={managerDialogOpen} onOpenChange={setManagerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Manager
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Manager</DialogTitle>
                  <DialogDescription>
                    Assign a manager to one of your clubs.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="managerUsername">Username *</Label>
                    <Input
                      id="managerUsername"
                      value={managerForm.username}
                      onChange={(e) => setManagerForm({ ...managerForm, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="managerEmail">Email *</Label>
                    <Input
                      id="managerEmail"
                      type="email"
                      value={managerForm.email}
                      onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="managerPassword">Password *</Label>
                    <Input
                      id="managerPassword"
                      type="password"
                      value={managerForm.password}
                      onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="clubSelect">Assign to Club *</Label>
                    <Select value={managerForm.club_id} onValueChange={(value) => setManagerForm({ ...managerForm, club_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select club" />
                      </SelectTrigger>
                      <SelectContent>
                        {clubs.map(club => (
                          <SelectItem key={club.id} value={club.id.toString()}>
                            {club.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setManagerDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateManager}>Create Manager</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Clubs List */}
      {isLoading ? (
        <div className="text-center py-8">Loading clubs...</div>
      ) : clubs.length > 0 ? (
        <div className="grid gap-4">
          {clubs.map(club => (
            <Card key={club.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {club.name}
                    </CardTitle>
                    {club.address && <p className="text-sm text-muted-foreground mt-1">{club.address}</p>}
                  </div>
                  {isSuperAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClub(club.id, club.name)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {club.phone && (
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p className="text-muted-foreground">{club.phone}</p>
                    </div>
                  )}
                  {club.email && (
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-muted-foreground">{club.email}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span>
                    <p className="text-muted-foreground">
                      {club.created_at ? new Date(club.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <p className="text-muted-foreground capitalize">{club.status || 'Active'}</p>
                  </div>
                </div>
                {club.description && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="font-medium text-sm">Description:</span>
                    <p className="text-sm text-muted-foreground mt-1">{club.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">No clubs found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first club.</p>
          <Button onClick={() => setClubDialogOpen(true)}>
            <Building2 className="h-4 w-4 mr-2" />
            Create First Club
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminClubManagement;
