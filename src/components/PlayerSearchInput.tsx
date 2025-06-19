
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { searchPlayers, createPlayer } from "@/services/playerService";
import { useAuth } from "@/context/AuthContext";
import { User, UserPlus, Search } from "lucide-react";

interface Player {
  id: number;
  player_code: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  membership_type?: string;
}

interface PlayerSearchInputProps {
  onPlayerSelect: (player: Player | null, playerName: string) => void;
  placeholder?: string;
}

const PlayerSearchInput = ({ onPlayerSelect, placeholder = "Search by name, phone, or player code..." }: PlayerSearchInputProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (searchQuery.trim().length >= 2 && !selectedPlayer) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for search
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          console.log('Searching for players with query:', searchQuery, 'club_id:', user?.club_id);
          const results = await searchPlayers(searchQuery.trim(), user?.club_id);
          setSuggestions(results || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, user?.club_id, selectedPlayer]);

  const getPlayerDisplayName = (player: Player) => {
    return `${player.first_name} ${player.last_name}`.trim();
  };

  const handlePlayerSelect = (player: Player) => {
    const displayName = getPlayerDisplayName(player);
    setSelectedPlayer(player);
    setSearchQuery(displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    onPlayerSelect(player, displayName);
  };

  const handleCreateNewPlayer = () => {
    setNewPlayerName(searchQuery);
    setNewPlayerPhone('');
    setNewPlayerEmail('');
    setShowCreateDialog(true);
    setShowSuggestions(false);
  };

  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) {
      toast({
        title: "Error",
        description: "Player name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newPlayer = await createPlayer({
        name: newPlayerName.trim(),
        phone: newPlayerPhone.trim() || undefined,
        email: newPlayerEmail.trim() || undefined,
      });

      toast({
        title: "Success",
        description: `Player "${newPlayerName}" created successfully`,
      });

      setSelectedPlayer(newPlayer);
      setSearchQuery(newPlayerName);
      setShowCreateDialog(false);
      setShowSuggestions(false);
      onPlayerSelect(newPlayer, newPlayerName);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create player",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Reset selected player only if user is typing something different
    if (selectedPlayer && value !== getPlayerDisplayName(selectedPlayer)) {
      setSelectedPlayer(null);
      onPlayerSelect(null, value);
    } else if (!selectedPlayer) {
      onPlayerSelect(null, value);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && !selectedPlayer) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <Label htmlFor="playerSearch">Player</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          id="playerSearch"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && !selectedPlayer && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto bg-white">
          <CardContent className="p-0">
            {isSearching ? (
              <div className="p-3 text-center text-gray-500">
                <Search className="w-4 h-4 animate-spin mx-auto mb-1" />
                Searching...
              </div>
            ) : suggestions.length > 0 ? (
              <>
                {suggestions.map((player) => (
                  <div
                    key={player.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-2"
                    onClick={() => handlePlayerSelect(player)}
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">{getPlayerDisplayName(player)}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{player.player_code}</span>
                        {player.phone && (
                          <>
                            <span>•</span>
                            <span>{player.phone}</span>
                          </>
                        )}
                        {player.membership_type && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{player.membership_type}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  className="p-3 hover:bg-blue-50 cursor-pointer border-t bg-blue-50/50 flex items-center gap-2 text-blue-600"
                  onClick={handleCreateNewPlayer}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create new player: "{searchQuery}"</span>
                </div>
              </>
            ) : searchQuery.trim().length >= 2 ? (
              <div
                className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-blue-600"
                onClick={handleCreateNewPlayer}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create new player: "{searchQuery}"</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Create Player Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Player</DialogTitle>
            <DialogDescription>
              Add a new player to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="newPlayerName">Name *</Label>
              <Input
                id="newPlayerName"
                placeholder="Enter player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPlayerPhone">Phone</Label>
              <Input
                id="newPlayerPhone"
                placeholder="Enter phone number"
                value={newPlayerPhone}
                onChange={(e) => setNewPlayerPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPlayerEmail">Email</Label>
              <Input
                id="newPlayerEmail"
                type="email"
                placeholder="Enter email address"
                value={newPlayerEmail}
                onChange={(e) => setNewPlayerEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePlayer} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Player'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerSearchInput;
