
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import PlayerSearchInput from "./PlayerSearchInput";

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

interface PlayerPairSearchInputProps {
  onPlayersSelect: (player1: Player | null, player2: Player | null, name1: string, name2: string) => void;
}

const PlayerPairSearchInput = ({ onPlayersSelect }: PlayerPairSearchInputProps) => {
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  const handlePlayer1Select = (player: Player | null, name: string) => {
    setPlayer1(player);
    setPlayer1Name(name);
    onPlayersSelect(player, player2, name, player2Name);
  };

  const handlePlayer2Select = (player: Player | null, name: string) => {
    setPlayer2(player);
    setPlayer2Name(name);
    onPlayersSelect(player1, player, player1Name, name);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Select Players
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Player 1</Label>
          <PlayerSearchInput 
            onPlayerSelect={handlePlayer1Select}
            placeholder="Search for first player or enter guest name..."
          />
        </div>
        
        <div>
          <Label>Player 2</Label>
          <PlayerSearchInput 
            onPlayerSelect={handlePlayer2Select}
            placeholder="Search for second player or enter guest name..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerPairSearchInput;
