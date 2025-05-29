
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/types";
import { Shield, UserPlus } from "lucide-react";
import { getAllClubs } from "@/services/clubService";

const AdminUserManagement = () => {
  const { getAllUsers, createUser, setUserStatus, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"super_admin" | "sub_admin" | "manager">("manager");
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check user permissions
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isSubAdmin = currentUser?.role === 'sub_admin';
  
  // Fetch users and clubs when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching users and clubs...");
        
        // Fetch users if function exists
        let fetchedUsers: User[] = [];
        if (getAllUsers) {
          try {
            fetchedUsers = await getAllUsers();
            console.log("Fetched users:", fetchedUsers);
          } catch (userError) {
            console.error("Error fetching users:", userError);
            // Don't fail completely if users can't be fetched
          }
        }
        
        // Fetch clubs for the dropdown
        let fetchedClubs: any[] = [];
        try {
          const clubsResponse = await getAllClubs();
          fetchedClubs = Array.isArray(clubsResponse) ? clubsResponse : clubsResponse?.data || [];
          console.log("Fetched clubs for dropdown:", fetchedClubs);
        } catch (clubError) {
          console.error("Error fetching clubs:", clubError);
          // Don't fail completely if clubs can't be fetched
        }
        
        setUsers(fetchedUsers);
        setClubs(fetchedClubs);
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError("Failed to load data");
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [getAllUsers, toast]);

  const handleCreateUser = async () => {
    if (!username || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // If creating a manager, ensure a club is selected
    if (role === 'manager' && !selectedClubId) {
      toast({
        title: "Error",
        description: "Please select a club for the manager",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (createUser) {
        // Only super_admin can create super_admin or sub_admin accounts
        if (role === 'super_admin' && !isSuperAdmin) {
          throw new Error("Only super admins can create super admin accounts");
        }
        
        console.log("Creating user with data:", { username, email, role, selectedClubId });
        
        // Use the selectedClubId as subAdminId parameter for the createUser function
        await createUser(username, email, password, role, selectedClubId || undefined);
        
        // Refresh the users list
        if (getAllUsers) {
          try {
            const updatedUsers = await getAllUsers();
            setUsers(updatedUsers || []);
          } catch (refreshError) {
            console.error("Error refreshing users:", refreshError);
          }
        }
        
        toast({
          title: "Success",
          description: `${role} user created successfully`,
        });
        
        // Reset form
        setUsername("");
        setEmail("");
        setPassword("");
        setRole("manager");
        setSelectedClubId(null);
        setIsUserDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleUserStatus = async (userId: number) => {
    if (!setUserStatus) return;
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    try {
      await setUserStatus(userId, !user.is_active);
      
      // Refresh the users list
      if (getAllUsers) {
        try {
          const updatedUsers = await getAllUsers();
          setUsers(updatedUsers || []);
        } catch (refreshError) {
          console.error("Error refreshing users:", refreshError);
        }
      }
      
      toast({
        title: "Success",
        description: `User ${user.is_active ? "disabled" : "enabled"} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  // Filter users based on current user role
  const filteredUsers = users.filter(u => {
    // Super admin can see all users
    if (isSuperAdmin) return true;
    
    // Sub admin can only see their managers
    if (currentUser?.role === 'sub_admin') {
      return u.sub_admin_id === currentUser.id || u.id === currentUser.id;
    }
    
    // Managers can't see users list
    return false;
  });
  
  console.log("Current user:", currentUser);
  console.log("All users:", users);
  console.log("Filtered users:", filteredUsers);
  console.log("Available clubs for selection:", clubs);
  
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
        <h3 className="text-lg font-medium">User Management</h3>
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account with appropriate roles and club assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={role} onValueChange={(value: "super_admin" | "sub_admin" | "manager") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                    {isSuperAdmin && <SelectItem value="sub_admin">Sub Admin (Club Owner)</SelectItem>}
                    {(isSuperAdmin || isSubAdmin) && (
                      <SelectItem value="manager">Manager</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {(role === 'manager' || role === 'sub_admin') && (
                <div className="grid gap-2">
                  <Label htmlFor="club">Club {role === 'manager' ? '*' : ''}</Label>
                  <Select 
                    value={selectedClubId?.toString() || ""} 
                    onValueChange={(value) => setSelectedClubId(value ? parseInt(value) : null)}
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
                  {role === 'manager' && !selectedClubId && (
                    <p className="text-sm text-red-500">Club selection is required for managers</p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateUser}
                disabled={!username || !email || !password || (role === 'manager' && !selectedClubId)}
              >
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Users Section */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-1 text-amber-500" />
                      {user.role === "super_admin" ? "Super Admin" : 
                       user.role === "sub_admin" ? "Sub Admin" : "Manager"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleUserStatus(user.id)}
                      disabled={user.id === currentUser?.id}
                    >
                      {user.is_active ? "Disable" : "Enable"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No users found. {users.length > 0 ? "You don't have permission to view users." : "No users in the system."}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
