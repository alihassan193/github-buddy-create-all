
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, Clock, Users, Download, Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";

const Reports = () => {
  const { completedSessions, tables, gameTypes, canteenOrders, invoices } = useData();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filterSessionsByDate = (sessions: any[]) => {
    if (!dateRange?.from || !dateRange?.to) return sessions;
    return sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= dateRange.from! && sessionDate <= dateRange.to!;
    });
  };

  const filteredSessions = filterSessionsByDate(completedSessions);

  // Calculate metrics
  const totalRevenue = filteredSessions.reduce((sum, session) => sum + (session.total_amount || 0), 0);
  const totalSessions = filteredSessions.length;
  const averageSessionDuration = filteredSessions.length > 0 ? 
    filteredSessions.reduce((sum, session) => {
      if (session.end_time) {
        const duration = new Date(session.end_time).getTime() - new Date(session.start_time).getTime();
        return sum + duration;
      }
      return sum;
    }, 0) / filteredSessions.length / (1000 * 60) : 0; // in minutes

  const canteenRevenue = canteenOrders
    .filter(order => {
      if (!dateRange?.from || !dateRange?.to) return true;
      const orderDate = new Date(order.order_time);
      return orderDate >= dateRange.from! && orderDate <= dateRange.to!;
    })
    .reduce((sum, order) => sum + order.total_price, 0);

  // Table usage data
  const tableUsageData = tables.map(table => {
    const tableSessions = filteredSessions.filter(session => session.table_id === table.id);
    return {
      name: table.table_number,
      sessions: tableSessions.length,
      revenue: tableSessions.reduce((sum, session) => sum + (session.total_amount || 0), 0)
    };
  });

  // Game type data
  const gameTypeData = gameTypes.map(gameType => {
    const gameTypeSessions = filteredSessions.filter(session => session.game_type_id === gameType.id);
    return {
      name: gameType.name,
      sessions: gameTypeSessions.length,
      revenue: gameTypeSessions.reduce((sum, session) => sum + (session.total_amount || 0), 0)
    };
  });

  // Daily revenue data for the last 7 days
  const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const dayRevenue = completedSessions
      .filter(session => {
        const sessionDate = new Date(session.start_time);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      })
      .reduce((sum, session) => sum + (session.total_amount || 0), 0);

    return {
      date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayRevenue
    };
  }).reverse();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Game sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canteen Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${canteenRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Food & beverages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">Completed games</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageSessionDuration)}m</div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">Table Performance</TabsTrigger>
          <TabsTrigger value="games">Game Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
                <CardDescription>Revenue from game sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Game sessions vs Canteen</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Game Sessions', value: totalRevenue },
                        { name: 'Canteen', value: canteenRevenue }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[{ name: 'Game Sessions', value: totalRevenue }, { name: 'Canteen', value: canteenRevenue }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle>Table Performance</CardTitle>
              <CardDescription>Sessions and revenue by table</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={tableUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="sessions" fill="#8884d8" name="Sessions" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Game Type Analysis</CardTitle>
              <CardDescription>Popular game types and their revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={gameTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="sessions" fill="#8884d8" name="Sessions" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
