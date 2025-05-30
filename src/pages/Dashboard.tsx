
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  DollarSign, 
  Users, 
  Table as TableIcon, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  Coffee
} from "lucide-react";
import { getDashboardStats } from "@/services/reportsService";
import { getActiveSessions } from "@/services/sessionService";
import { getAvailableTables } from "@/services/tableService";
import { getLowStockItems } from "@/services/canteenService";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard stats
      try {
        const stats = await getDashboardStats();
        setDashboardStats(stats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }

      // Fetch active sessions
      try {
        const sessions = await getActiveSessions();
        setActiveSessions(sessions);
      } catch (error) {
        console.error("Error fetching active sessions:", error);
      }

      // Fetch available tables
      try {
        const tables = await getAvailableTables();
        setAvailableTables(tables);
      } catch (error) {
        console.error("Error fetching available tables:", error);
      }

      // Fetch low stock items (if user has canteen permissions)
      if (user?.permissions?.can_manage_canteen) {
        try {
          const lowStock = await getLowStockItems();
          setLowStockItems(lowStock);
        } catch (error) {
          console.error("Error fetching low stock items:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}!
          </p>
        </div>
        <Badge variant="outline">
          {user?.role === 'super_admin' ? 'Super Admin' : 
           user?.role === 'sub_admin' ? 'Sub Admin' : 'Manager'}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently playing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tables</CardTitle>
            <TableIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTables.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardStats?.today_revenue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats?.revenue_growth || 0}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.total_players || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered members
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>Currently ongoing games</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSessions.length > 0 ? (
              <div className="space-y-3">
                {activeSessions.slice(0, 5).map((session, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Table {session.table_number || session.table_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.player_name || 'Player'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {session.duration || 'Active'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${session.current_amount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No active sessions</p>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {user?.permissions?.can_manage_canteen && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Low Stock Items
              </CardTitle>
              <CardDescription>Items that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {lowStockItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Category: {item.category_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">
                          {item.stock_quantity} left
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Min: {item.minimum_stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">All items well stocked</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className={user?.permissions?.can_manage_canteen ? "" : "lg:col-span-2"}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/tables'}>
                <TableIcon className="h-4 w-4 mr-2" />
                View Tables
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/sessions'}>
                <Activity className="h-4 w-4 mr-2" />
                Active Sessions
              </Button>
              {user?.permissions?.can_manage_canteen && (
                <Button variant="outline" onClick={() => window.location.href = '/canteen'}>
                  <Coffee className="h-4 w-4 mr-2" />
                  Canteen
                </Button>
              )}
              {user?.permissions?.can_view_reports && (
                <Button variant="outline" onClick={() => window.location.href = '/reports'}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
