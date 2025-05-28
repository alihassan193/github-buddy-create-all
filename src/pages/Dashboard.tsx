
import { useData } from "@/context/DataContext";
import TableCard from "@/components/TableCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { tables, activeSessions } = useData();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'super_admin' || user?.role === 'sub_admin';
  
  // Group active sessions by table
  const sessionsByTable = activeSessions.reduce((acc, session) => {
    acc[session.table_id] = acc[session.table_id] || [];
    acc[session.table_id].push(session);
    return acc;
  }, {} as Record<number, typeof activeSessions>);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Snooker Tables</h1>
        {isAdmin && (
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Table</span>
          </Button>
        )}
      </div>
      
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions.map(session => {
              const table = tables.find(t => t.id === session.table_id);
              return (
                <Card key={session.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{table?.table_number || `Table #${session.table_id}`}</CardTitle>
                      <Badge>Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Player:</span>
                        <span className="font-medium">{session.player_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Started:</span>
                        <span className="font-medium">
                          {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <SessionTimer startTime={session.start_time} />
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.location.href = `/game/${session.id}`}
                        >
                          View Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      
      <h2 className="text-xl font-semibold mb-4">All Tables</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <TableCard key={table.id} table={table} />
        ))}
      </div>
      
      {tables.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tables available.</p>
          {isAdmin && (
            <Button className="mt-4">Add your first table</Button>
          )}
        </div>
      )}
    </div>
  );
};

// A simple timer component to show session duration
const SessionTimer = ({ startTime }: { startTime: string }) => {
  const [duration, setDuration] = useState("");
  
  useEffect(() => {
    const start = new Date(startTime).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = now - start;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setDuration(`${hours}h ${minutes}m`);
    };
    
    // Initial update
    updateTimer();
    
    // Update every minute
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [startTime]);
  
  return <span className="font-medium">{duration}</span>;
};

export default Dashboard;
