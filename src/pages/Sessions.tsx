
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, DollarSign, User, Calendar, FileText, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/DataContext";
import { getActiveSessions, getCompletedSessions, endSession } from "@/services/sessionService";

const Sessions = () => {
  const { tables, gameTypes } = useData();
  const { toast } = useToast();
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSessionsData = async () => {
    try {
      setIsRefreshing(true);
      
      const [activeData, completedData] = await Promise.all([
        getActiveSessions(),
        getCompletedSessions()
      ]);
      
      setActiveSessions(activeData);
      setCompletedSessions(completedData);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sessions data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessionsData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSessionsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTableName = (tableId: number) => {
    return tables.find(t => t.id === tableId)?.table_number || `Table #${tableId}`;
  };

  const getGameTypeName = (gameTypeId: number) => {
    return gameTypes.find(gt => gt.id === gameTypeId)?.name || 'Unknown';
  };

  const getSessionDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : new Date().getTime();
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleEndSession = async (sessionId: number) => {
    try {
      await endSession(sessionId);
      toast({
        title: "Session Ended",
        description: "Session has been completed successfully",
      });
      
      // Refresh data
      fetchSessionsData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to end session",
        variant: "destructive"
      });
    }
  };

  const handleCreateInvoice = (sessionId: number) => {
    // Navigate to invoice creation
    window.location.href = `/invoice/${sessionId}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <Clock className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Session Management</h1>
        <div className="flex gap-2 items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSessionsData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="outline" className="bg-blue-50">
            Active: {activeSessions.length}
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            Completed: {completedSessions.length}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="completed">Completed Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <Card key={session.id} className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{getTableName(session.table_id)}</CardTitle>
                        <CardDescription>{getGameTypeName(session.game_type_id)} Session</CardDescription>
                      </div>
                      <Badge className="bg-blue-500">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{session.player_name || 'Guest Player'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="font-mono">{getSessionDuration(session.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{new Date(session.start_time).toLocaleString()}</span>
                    </div>
                    {session.total_amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">${session.total_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <Button 
                      onClick={() => handleEndSession(session.id)}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      End Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No active sessions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedSessions.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Game Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {getTableName(session.table_id)}
                        </TableCell>
                        <TableCell>{session.player_name || 'Guest Player'}</TableCell>
                        <TableCell>{getGameTypeName(session.game_type_id)}</TableCell>
                        <TableCell className="font-mono">
                          {session.end_time && getSessionDuration(session.start_time, session.end_time)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {session.total_amount?.toFixed(2) || '0.00'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(session.start_time).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreateInvoice(session.id)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No completed sessions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sessions;
