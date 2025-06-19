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
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  UserPlus,
  Users,
  Edit,
  Trash2,
  Plus,
  Eye,
} from "lucide-react";
import {
  createClub,
  getAllClubs,
  updateClub,
  deleteClub,
} from "@/services/clubService";
import { createUser, getManagedClubs } from "@/services/userService";

const AdminClubManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingClub, setEditingClub] = useState<any>(null);
  const [viewingClub, setViewingClub] = useState<any>(null);

  // Club form state
  const [clubDialogOpen, setClubDialogOpen] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    opening_hours: "",
    code_prefix: "SNK",
  });

  // Manager form state
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [managerForm, setManagerForm] = useState({
    username: "",
    email: "",
    password: "",
    club_id: "",
  });

  const isSuperAdmin = user?.role === "super_admin";
  const isSubAdmin = user?.role === "sub_admin";

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
          variant: "destructive",
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
        variant: "destructive",
      });
      return;
    }

    try {
      const clubData = {
        ...clubForm,
        opening_hours: clubForm.opening_hours
          ? JSON.parse(clubForm.opening_hours)
          : null,
      };

      if (editingClub) {
        await updateClub(editingClub.id, clubData);
        toast({
          title: "Success",
          description: "Club updated successfully",
        });
      } else {
        await createClub(clubData);
        toast({
          title: "Success",
          description: "Club created successfully",
        });
      }

      // Refresh clubs list
      const clubsData = await getAllClubs();
      setClubs(clubsData.clubs || clubsData || []);

      resetClubForm();
      setClubDialogOpen(false);
      setEditingClub(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save club",
        variant: "destructive",
      });
    }
  };

  const handleEditClub = (club: any) => {
    setEditingClub(club);
    setClubForm({
      name: club.name || "",
      address: club.address || "",
      phone: club.phone || "",
      email: club.email || "",
      description: club.description || "",
      opening_hours: club.opening_hours
        ? JSON.stringify(club.opening_hours, null, 2)
        : "",
      code_prefix: club.code_prefix || "SNK",
    });
    setClubDialogOpen(true);
  };

  const resetClubForm = () => {
    setClubForm({
      name: "",
      address: "",
      phone: "",
      email: "",
      description: "",
      opening_hours: "",
      code_prefix: "SNK",
    });
  };

  const handleAssignManager = async () => {
    if (
      !managerForm.username ||
      !managerForm.email ||
      !managerForm.password ||
      !managerForm.club_id
    ) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
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
        description: "Manager assigned successfully",
      });

      setManagerForm({
        username: "",
        email: "",
        password: "",
        club_id: "",
      });
      setManagerDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign manager",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClub = async (clubId: number, clubName: string) => {
    if (
      confirm(
        `Are you sure you want to delete ${clubName}? This action cannot be undone.`
      )
    ) {
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
          variant: "destructive",
        });
      }
    }
  };

  if (!isSuperAdmin && !isSubAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          You don't have permission to manage clubs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Club Management</h3>
          <p className="text-sm text-muted-foreground">
            {isSuperAdmin
              ? "Manage all clubs and assign managers"
              : "Manage your clubs and assign managers"}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={clubDialogOpen}
            onOpenChange={(open) => {
              setClubDialogOpen(open);
              if (!open) {
                setEditingClub(null);
                resetClubForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Club
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingClub ? "Edit Club" : "Create New Club"}
                </DialogTitle>
                <DialogDescription>
                  {editingClub
                    ? "Update club information."
                    : "Add a new snooker club to the system."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="name">Club Name *</Label>
                  <Input
                    id="name"
                    value={clubForm.name}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, name: e.target.value })
                    }
                    placeholder="Enter club name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code_prefix">Code Prefix</Label>
                  <Input
                    id="code_prefix"
                    value={clubForm.code_prefix}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, code_prefix: e.target.value })
                    }
                    placeholder="e.g., SNK"
                    maxLength={5}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={clubForm.address}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, address: e.target.value })
                    }
                    placeholder="Enter club address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={clubForm.phone}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clubForm.email}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="opening_hours">Opening Hours (JSON)</Label>
                  <Textarea
                    id="opening_hours"
                    value={clubForm.opening_hours}
                    onChange={(e) =>
                      setClubForm({
                        ...clubForm,
                        opening_hours: e.target.value,
                      })
                    }
                    placeholder='{"monday": "9:00-22:00", "tuesday": "9:00-22:00"}'
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={clubForm.description}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, description: e.target.value })
                    }
                    placeholder="Enter club description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setClubDialogOpen(false);
                    setEditingClub(null);
                    resetClubForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateClub}>
                  {editingClub ? "Update Club" : "Create Club"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {clubs.length > 0 && (
            <Dialog
              open={managerDialogOpen}
              onOpenChange={setManagerDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Manager
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Manager to Club</DialogTitle>
                  <DialogDescription>
                    Create a new manager and assign them to a club.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="managerUsername">Username *</Label>
                    <Input
                      id="managerUsername"
                      value={managerForm.username}
                      onChange={(e) =>
                        setManagerForm({
                          ...managerForm,
                          username: e.target.value,
                        })
                      }
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="managerEmail">Email *</Label>
                    <Input
                      id="managerEmail"
                      type="email"
                      value={managerForm.email}
                      onChange={(e) =>
                        setManagerForm({
                          ...managerForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="managerPassword">Password *</Label>
                    <Input
                      id="managerPassword"
                      type="password"
                      value={managerForm.password}
                      onChange={(e) =>
                        setManagerForm({
                          ...managerForm,
                          password: e.target.value,
                        })
                      }
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="clubSelect">Assign to Club *</Label>
                    <Select
                      value={managerForm.club_id}
                      onValueChange={(value) =>
                        setManagerForm({ ...managerForm, club_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select club" />
                      </SelectTrigger>
                      <SelectContent>
                        {clubs.map((club) => (
                          <SelectItem key={club.id} value={club.id.toString()}>
                            {club.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setManagerDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAssignManager}>Assign Manager</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Clubs Table */}
      {isLoading ? (
        <div className="text-center py-8">Loading clubs...</div>
      ) : clubs.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Club Details</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{club.name}</span>
                        {club.code_prefix && (
                          <Badge variant="outline" className="text-xs">
                            {club.code_prefix}
                          </Badge>
                        )}
                      </div>
                      {club.address && (
                        <p className="text-sm text-muted-foreground">
                          {club.address}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {club.phone && <div>{club.phone}</div>}
                      {club.email && (
                        <div className="text-muted-foreground">
                          {club.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={club.is_active ? "default" : "secondary"}>
                      {club.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {club.createdAt
                      ? new Date(club.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingClub(club)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Building2 className="h-5 w-5" />
                              {club.name}
                              {club.code_prefix && (
                                <Badge variant="outline">
                                  {club.code_prefix}
                                </Badge>
                              )}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">
                                  Address
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {club.address || "Not provided"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">
                                  Phone
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {club.phone || "Not provided"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">
                                  Email
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {club.email || "Not provided"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">
                                  Status
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {club.is_active ? "Active" : "Inactive"}
                                </p>
                              </div>
                            </div>
                            {club.description && (
                              <div>
                                <Label className="text-sm font-medium">
                                  Description
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {club.description}
                                </p>
                              </div>
                            )}
                            {club.opening_hours && (
                              <div>
                                <Label className="text-sm font-medium">
                                  Opening Hours
                                </Label>
                                <pre className="text-sm text-muted-foreground mt-1 bg-muted p-2 rounded">
                                  {JSON.stringify(club.opening_hours, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClub(club)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {isSuperAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteClub(club.id, club.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">No clubs found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first club.
          </p>
          <Button onClick={() => setClubDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Club
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminClubManagement;
