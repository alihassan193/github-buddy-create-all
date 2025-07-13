import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Award } from "lucide-react";

interface Player {
  id: string;
  name: string;
  score: number;
  framesWon: number;
  currentBreak: number;
  highBreak: number;
}

interface MatchStatsProps {
  players: Player[];
  frameNumber: number;
  bestOf: number;
  winner?: Player;
}

export function MatchStats({ players, frameNumber, bestOf, winner }: MatchStatsProps) {
  const framesNeededToWin = Math.ceil(bestOf / 2);
  const totalFrames = players[0].framesWon + players[1].framesWon;
  
  const getMatchStatus = () => {
    if (winner) {
      return `${winner.name} wins ${winner.framesWon}-${players.find(p => p.id !== winner.id)?.framesWon}!`;
    }
    return `Frame ${frameNumber} of up to ${bestOf}`;
  };

  return (
    <div className="space-y-6">
      {/* Match Status */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {winner ? (
              <>
                <Trophy className="h-6 w-6 text-gold" />
                Match Complete!
              </>
            ) : (
              <>
                <Target className="h-6 w-6 text-primary" />
                {getMatchStatus()}
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4">
            {players.map((player) => (
              <div key={player.id} className="text-center">
                <Badge 
                  variant={winner?.id === player.id ? "default" : "secondary"}
                  className={winner?.id === player.id ? "bg-gold text-gold-foreground" : ""}
                >
                  {player.name}: {player.framesWon}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  {framesNeededToWin - player.framesWon} more to win
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Frame Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((player) => (
          <Card key={player.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                {player.name} - Frame Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{player.score}</div>
                  <div className="text-xs text-muted-foreground">Frame Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{player.currentBreak}</div>
                  <div className="text-xs text-muted-foreground">Current Break</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* High Breaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-gold" />
            High Breaks This Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player) => (
              <div key={player.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">{player.name}</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {player.highBreak}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Match Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Match Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Frames Completed</span>
              <span>{totalFrames} of {bestOf}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(totalFrames / bestOf) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}