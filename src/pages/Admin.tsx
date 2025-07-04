
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminTableList from "@/components/AdminTableList";
import AdminUserManagement from "@/components/AdminUserManagement";
import AdminCanteenInventory from "@/components/AdminCanteenInventory";
import AdminClubManagement from "@/components/AdminClubManagement";
import { Building2, Users, Coffee, Table } from "lucide-react";

const Admin = () => {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === "super_admin";
  const isSubAdmin = user?.role === "sub_admin";
  const isAdmin = isSuperAdmin || isSubAdmin;

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">
          {isSuperAdmin ? "Super Admin Dashboard" : "Sub Admin Dashboard"}
        </p>
      </div>

      <Tabs defaultValue="clubs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="clubs" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Clubs</span>
            <span className="sm:hidden">Clubs</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Table className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Tables</span>
            <span className="sm:hidden">Tables</span>
          </TabsTrigger>
          <TabsTrigger value="canteen" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Coffee className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Canteen</span>
            <span className="sm:hidden">Canteen</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clubs">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <AdminClubManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-4">
              <CardTitle className="text-lg sm:text-xl">User Management</CardTitle>
              <CardDescription className="text-sm">
                Manage administrators and managers in the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <AdminUserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-4">
              <CardTitle className="text-lg sm:text-xl">Table Management</CardTitle>
              <CardDescription className="text-sm">
                Manage snooker tables, pricing, and configurations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <AdminTableList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canteen">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-4">
              <CardTitle className="text-lg sm:text-xl">Canteen Inventory</CardTitle>
              <CardDescription className="text-sm">
                Manage canteen items, categories, and stock levels.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <AdminCanteenInventory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
