
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AdminTableList from "@/components/AdminTableList";
import AdminCanteenInventory from "@/components/AdminCanteenInventory";
import { useAuth } from "@/context/AuthContext";
import AdminUserManagement from "@/components/AdminUserManagement";
import AdminClubManagement from "@/components/AdminClubManagement";

const Admin = () => {
  const { invoices } = useData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("tables");
  const { user } = useAuth();
  
  const isSuperAdmin = user?.role === 'super_admin';
  const isSubAdmin = user?.role === 'sub_admin';
  const isManager = user?.role === 'manager';
  
  // Determine which tabs to show based on role
  const showUserManagement = isSuperAdmin || isSubAdmin;
  const showClubManagement = isSuperAdmin;
  const showTableManagement = isSuperAdmin || isSubAdmin;
  const showCanteen = true;
  const showInvoices = isSuperAdmin || isSubAdmin;
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {showTableManagement && <TabsTrigger value="tables">Tables Management</TabsTrigger>}
          {showInvoices && <TabsTrigger value="invoices">Invoices</TabsTrigger>}
          {showCanteen && <TabsTrigger value="canteen">Canteen Inventory</TabsTrigger>}
          {showUserManagement && (
            <TabsTrigger value="users">User Management</TabsTrigger>
          )}
          {showClubManagement && (
            <TabsTrigger value="clubs">Club Management</TabsTrigger>
          )}
        </TabsList>
        
        {showTableManagement && (
          <TabsContent value="tables">
            <Card>
              <CardHeader>
                <CardTitle>Table Management</CardTitle>
                <CardDescription>
                  Add, edit or remove snooker tables and set their pricing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminTableList />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {showInvoices && (
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  View and manage all invoices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id.split('-')[1]}</TableCell>
                          <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                          <TableCell>${invoice.total.toFixed(2)}</TableCell>
                          <TableCell>
                            {invoice.isPaid ? (
                              <span className="text-green-600">Paid</span>
                            ) : (
                              <span className="text-amber-600">Pending</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => window.location.href = `/invoice/${invoice.id}`}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No invoices found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {showCanteen && (
          <TabsContent value="canteen">
            <Card>
              <CardHeader>
                <CardTitle>Canteen Inventory</CardTitle>
                <CardDescription>
                  Manage canteen products, their stock and pricing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminCanteenInventory />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showUserManagement && (
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  {isSuperAdmin ? "Create and manage all user accounts." :
                   isSubAdmin ? "Create and manage managers for your club." : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showClubManagement && (
          <TabsContent value="clubs">
            <Card>
              <CardHeader>
                <CardTitle>Club Management</CardTitle>
                <CardDescription>
                  Create and manage snooker clubs in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminClubManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Admin;
