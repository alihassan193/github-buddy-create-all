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
import { User } from "@/types";
import { Shield, UserPlus } from "lucide-react";

const AdminUserManagement = () => {
  const {
    getAllUsers,
    createUser,
    setUserStatus,
    user: currentUser,
  } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"super_admin" | "sub_admin" | "manager">(
    "sub_admin"
  );
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      if (getAllUsers) {
        try {
          setIsLoading(true);
          console.log("Fetching users...");
          const fetchedUsers = await getAllUsers();
          console.log("Fetched users:", fetchedUsers);
          setUsers(fetchedUsers || []);
        } catch (error) {
          console.error("Error fetching users:", error);
          setUsers([]);
          toast({
            title: "Error",
            description: "Failed to fetch users",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();
  }, [getAllUsers, toast]);

  // Only super_admin can create other super_admins
  const isSuperAdmin = currentUser?.role === "super_admin";

  const handleCreateUser = async () => {
    if (!username || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (createUser) {
        // If creating a manager, attach them to the current sub_admin
        const subAdminId = role === "manager" ? currentUser?.id : undefined;

        // Only super_admin can create super_admin or sub_admin accounts
        if (role === "super_admin" && !isSuperAdmin) {
          throw new Error("Only super admins can create super admin accounts");
        }

        await createUser(username, email, password, role, subAdminId);

        // Refresh the users list
        const updatedUsers = await getAllUsers();
        setUsers(updatedUsers || []);

        toast({
          title: "Success",
          description: `${role} user created successfully`,
        });

        // Reset form
        setUsername("");
        setEmail("");
        setPassword("");
        setRole("sub_admin");
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    if (setUserStatus) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        try {
          await setUserStatus(userId, !user.is_active);

          // Refresh the users list
          const updatedUsers = await getAllUsers();
          setUsers(updatedUsers || []);

          toast({
            title: "Success",
            description: `User ${
              user.is_active ? "disabled" : "enabled"
            } successfully`,
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to update user status",
            variant: "destructive",
          });
        }
      }
    }
  };

  // Filter users based on current user role
  const filteredUsers = users.filter((u) => {
    // Super admin can see all users
    if (isSuperAdmin) return true;

    // Sub admin can only see their managers
    if (currentUser?.role === "sub_admin") {
      return u.sub_admin_id === currentUser.id || u.id === currentUser.id, true;
    }

    // Managers can't see users list
    return false;
  });

  console.log("Current user:", currentUser);
  console.log("All users:", users);
  console.log("Filtered users:", filteredUsers);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Users</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account with appropriate roles.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(
                    value: "super_admin" | "sub_admin" | "manager"
                  ) => setRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {isSuperAdmin && (
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    )}
                    {isSuperAdmin && (
                      <SelectItem value="sub_admin">
                        Sub Admin (Club Owner)
                      </SelectItem>
                    )}
                    {(isSuperAdmin || currentUser?.role === "sub_admin") && (
                      <SelectItem value="manager">Manager</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">
          Loading users...
        </div>
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
                    {user.role === "super_admin"
                      ? "Super Admin"
                      : user.role === "sub_admin"
                      ? "Sub Admin"
                      : "Manager"}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleUserStatus(user.id)}
                    // Prevent users from disabling themselves
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
          No users found.{" "}
          {users.length > 0
            ? "You don't have permission to view users."
            : "No users in the system."}
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
