
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, DollarSign, Search, Filter, Eye, Trophy, Users } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getAllSessions, getSessionById } from "@/services/sessionService";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Sessions = () => {
  const { clubId } = useData();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const itemsPerPage = 10;

  const fetchSessions = async (page = 1) => {
    if (!clubId) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching sessions for club:', clubId, 'page:', page);
      
      const response = await getAllSessions({ 
        club_id: clubId,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: page,
        limit: itemsPerPage
      });
      console.log('Sessions response:', response);
      
      if (response && response.sessions) {
        setSessions(response.sessions);
        setTotalPages(response.pagination?.totalPages || 1);
        setCurrentPage(page);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sessions",
        variant: "destructive"
      });
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      console.log('Club ID available, fetching sessions:', clubId);
      fetchSessions(1);
    }
  }, [clubId, statusFilter]);

  const handleViewDetails = async (sessionId: number) => {
    try {
      const sessionDetail = await getSessionById(sessionId);
      setSelectedSession(sessionDetail);
      setShowDetailDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch session details",
        variant: "destructive"
      });
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchQuery === '' || 
      session.session_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.player?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.player?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.player2?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.player2?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.table?.table_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price: any): string => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
    return numPrice.toFixed(2);
  };

  const getPlayerNames = (session: any) => {
    const player1Name = session.player ? 
      `${session.player.first_name} ${session.player.last_name}` : 
      (session.guest_player_name || 'Guest Player 1');
    
    const player2Name = session.player2 ? 
      `${session.player2.first_name} ${session.player2.last_name}` : 
      (session.guest_player_2_name || 'Guest Player 2');
    
    return { player1Name, player2Name };
  };

  const getWinnerLoserNames = (session: any) => {
    if (!session.winner_player || !session.loser_player) return null;
    
    const { player1Name, player2Name } = getPlayerNames(session);
    
    const winnerName = session.winner_player === 'player_1' ? player1Name : player2Name;
    const loserName = session.loser_player === 'player_1' ? player1Name : player2Name;
    
    return { winnerName, loserName };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Session Management</h1>
          <p className="text-muted-foreground">
            View and manage all gaming sessions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              Rs.{sessions.reduce((total, session) => total + parseFloat(session.total_amount || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            {filteredSessions.map((session) => {
              const { player1Name, player2Name } = getPlayerNames(session);
              const winnerLoser = getWinnerLoserNames(session);
              
              return (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {session.session_code || `Session #${session.id}`}
                          <Badge className={getStatusColor(session.status)}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Table {session.table?.table_number} • {session.gameType?.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            Rs.{formatPrice(session.total_amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.payment_status}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(session.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {player1Name} vs {player2Name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Players
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(session.start_time), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(session.start_time), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {formatDuration(session.duration_minutes)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Duration
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            Game: Rs.{formatPrice(session.game_amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Canteen: Rs.{formatPrice(session.canteen_amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {winnerLoser && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          <div>
                            <div className="font-medium text-green-600">Winner: {winnerLoser.winnerName}</div>
                            <div className="text-sm text-red-600">Loser: {winnerLoser.loserName}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && fetchSessions(currentPage - 1)}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => fetchSessions(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && fetchSessions(currentPage + 1)}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'No sessions match your current filters' 
                : 'No sessions found'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Session Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Details - {selectedSession?.session_code}</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Session Info</h3>
                  <div className="space-y-2 text-sm">
                    <div>Table: {selectedSession.table?.table_number}</div>
                    <div>Game Type: {selectedSession.gameType?.name}</div>
                    <div>Status: {selectedSession.status}</div>
                    <div>Payment: {selectedSession.payment_status}</div>
                    <div>Duration: {formatDuration(selectedSession.duration_minutes)}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Players</h3>
                  <div className="space-y-2 text-sm">
                    <div>Player 1: {selectedSession.player ? `${selectedSession.player.first_name} ${selectedSession.player.last_name}` : selectedSession.guest_player_name || 'Guest'}</div>
                    <div>Player 2: {selectedSession.player2 ? `${selectedSession.player2.first_name} ${selectedSession.player2.last_name}` : selectedSession.guest_player_2_name || 'Guest'}</div>
                    {selectedSession.winner_player && (
                      <div className="text-green-600 font-medium">
                        Winner: {selectedSession.winner_player === 'player_1' ? 'Player 1' : 'Player 2'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Financial Details</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Game Amount: Rs.{formatPrice(selectedSession.game_amount)}</div>
                  <div>Canteen Amount: Rs.{formatPrice(selectedSession.canteen_amount)}</div>
                  <div className="font-semibold">Total: Rs.{formatPrice(selectedSession.total_amount)}</div>
                </div>
              </div>
              
              {selectedSession.canteen_orders && selectedSession.canteen_orders.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Canteen Orders</h3>
                  <div className="space-y-2">
                    {selectedSession.canteen_orders.map((order: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{order.order?.item?.name} x {order.quantity}</span>
                        <span>Rs.{formatPrice(order.total_price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sessions;
