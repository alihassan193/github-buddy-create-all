import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  score: number;
  framesWon: number;
  currentBreak: number;
  highBreak: number;
}

interface SnookerScoreboardProps {
  players: Player[];
  currentPlayer: number;
  frameNumber: number;
  onPlayerSwitch: () => void;
  onScoreUpdate: (playerId: string, points: number) => void;
  onNewFrame: () => void;
}

const ballValues = [
  { name: "Red", value: 1, color: "bg-snooker-red" },
  { name: "Yellow", value: 2, color: "bg-snooker-yellow" },
  { name: "Green", value: 3, color: "bg-snooker-green" },
  { name: "Brown", value: 4, color: "bg-snooker-brown" },
  { name: "Blue", value: 5, color: "bg-snooker-blue" },
  { name: "Pink", value: 6, color: "bg-snooker-pink" },
  { name: "Black", value: 7, color: "bg-snooker-black text-white" },
];

export function SnookerScoreboard({
  players,
  currentPlayer,
  frameNumber,
  onPlayerSwitch,
  onScoreUpdate,
  onNewFrame,
}: SnookerScoreboardProps) {
  const [selectedBall, setSelectedBall] = useState<number | null>(null);

  const handleBallPot = (value: number) => {
    const activePlayer = players[currentPlayer];
    onScoreUpdate(activePlayer.id, value);
    setSelectedBall(value);
    setTimeout(() => setSelectedBall(null), 300);
  };

  const currentPlayerData = players[currentPlayer];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Frame Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Frame {frameNumber}</h1>
        <div className="flex justify-center gap-4">
          {players.map((player, index) => (
            <Badge key={player.id} variant={index === currentPlayer ? "default" : "secondary"} className="text-lg px-4 py-2">
              {player.name}: {player.framesWon} frames
            </Badge>
          ))}
        </div>
      </div>

      {/* Players Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {players.map((player, index) => (
          <Card key={player.id} className={cn(
            "transition-all duration-300",
            index === currentPlayer ? "ring-2 ring-primary shadow-lg" : ""
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-center">
                <span className={cn(
                  "text-2xl",
                  index === currentPlayer ? "text-primary font-bold" : "text-muted-foreground"
                )}>
                  {player.name}
                </span>
                {index === currentPlayer && (
                  <Badge variant="default" className="bg-gold">
                    At Table
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {player.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-accent">
                      {player.currentBreak}
                    </div>
                    <div className="text-xs text-muted-foreground">Current Break</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gold">
                      {player.highBreak}
                    </div>
                    <div className="text-xs text-muted-foreground">High Break</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ball Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {currentPlayerData.name}'s Turn - Select Ball Potted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {ballValues.map((ball) => (
              <Button
                key={ball.name}
                onClick={() => handleBallPot(ball.value)}
                variant="outline"
                className={cn(
                  "h-16 flex flex-col items-center justify-center transition-all duration-200",
                  ball.color,
                  selectedBall === ball.value && "scale-110 ring-2 ring-primary",
                  "hover:scale-105"
                )}
              >
                <span className="font-bold text-sm">{ball.name}</span>
                <span className="text-lg font-bold">{ball.value}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={onPlayerSwitch}
          variant="secondary"
          size="lg"
          className="px-8"
        >
          End Break
        </Button>
        <Button
          onClick={onNewFrame}
          variant="outline"
          size="lg"
          className="px-8"
        >
          New Frame
        </Button>
      </div>
    </div>
  );
}