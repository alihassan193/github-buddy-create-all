
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminTableList from "@/components/AdminTableList";
import AdminUserManagement from "@/components/AdminUserManagement";
import AdminCanteenInventory from "@/components/AdminCanteenInventory";
import AdminClubManagement from "@/components/AdminClubManagement";
import { Building2, Users, Coffee, Table } from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  
  const isSuperAdmin = user?.role === 'super_admin';
  const isSubAdmin = user?.role === 'sub_admin';
  const isAdmin = isSuperAdmin || isSubAdmin;
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">
          {isSuperAdmin ? "Super Admin Dashboard" : "Sub Admin Dashboard"}
        </p>
      </div>

      <Tabs defaultValue={isSuperAdmin ? "clubs" : "users"} className="space-y-6">
        <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {isSuperAdmin && (
            <TabsTrigger value="clubs" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Clubs
            </TabsTrigger>
          )}
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Tables
          </TabsTrigger>
          <TabsTrigger value="canteen" className="flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            Canteen
          </TabsTrigger>
        </TabsList>

        {isSuperAdmin && (
          <TabsContent value="clubs">
            <Card>
              <CardHeader>
                <CardTitle>Club Management</CardTitle>
                <CardDescription>
                  Manage clubs and assign managers to them.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminClubManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage administrators and managers in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle>Table Management</CardTitle>
              <CardDescription>
                Manage snooker tables, pricing, and configurations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminTableList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canteen">
          <Card>
            <CardHeader>
              <CardTitle>Canteen Inventory</CardTitle>
              <CardDescription>
                Manage canteen items, categories, and stock levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminCanteenInventory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
