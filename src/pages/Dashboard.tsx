
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Users, Coffee, Clock, TrendingUp } from "lucide-react";
import GameTypePricing from "@/components/GameTypePricing";

export default function Dashboard() {
  const { tables, sessions, canteenItems, gameTypes, isLoading } = useData();

  const activeTables = tables.filter(table => table.status === 'occupied').length;
  const availableTables = tables.filter(table => table.status === 'available').length;
  const activeSessions = sessions.filter(session => session.status === 'active').length;
  const totalRevenue = sessions.reduce((sum, session) => sum + (session.total_amount || 0), 0);

  // Get unique game types with counts
  const uniqueGameTypes = gameTypes.reduce((acc, gameType) => {
    const existing = acc.find(item => item.name === gameType.name);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        id: gameType.id,
        name: gameType.name,
        pricing_type: gameType.pricing_type,
        description: gameType.description,
        count: 1
      });
    }
    return acc;
  }, [] as any[]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTables}</div>
            <p className="text-xs text-muted-foreground">
              {availableTables} available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Currently playing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Game Types</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueGameTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Available game modes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canteen Items</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{canteenItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Items available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Game Types Section - Updated to show unique types */}
      <div className="mb-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Game Types & Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uniqueGameTypes.map((gameType) => (
              <Card key={gameType.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {gameType.name}
                    {gameType.count > 1 && (
                      <Badge variant="secondary" className="ml-2">
                        {gameType.count} tables
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {gameType.description || (gameType.pricing_type === 'per_minute' ? 'Charged per minute of play' : 'Fixed rate per game')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {gameType.pricing_type?.replace('_', ' ').toUpperCase() || 'CUSTOM'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {uniqueGameTypes.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No game types available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest sessions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">Table {session.table_number || session.table_id}</p>
                  <p className="text-sm text-gray-500">{session.game_type}</p>
                </div>
                <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                  {session.status}
                </Badge>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Tables System</span>
              <Badge variant={tables.length > 0 ? "default" : "destructive"}>
                {tables.length > 0 ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Game Types</span>
              <Badge variant={gameTypes.length > 0 ? "default" : "destructive"}>
                {gameTypes.length > 0 ? "Loaded" : "Not Loaded"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Canteen System</span>
              <Badge variant={canteenItems.length > 0 ? "default" : "destructive"}>
                {canteenItems.length > 0 ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
