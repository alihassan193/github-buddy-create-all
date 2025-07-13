import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Player {
  id: string;
  name: string;
  score: number;
  framesWon: number;
  currentBreak: number;
  highBreak: number;
}

interface MatchSetupProps {
  onMatchStart: (players: Player[], bestOf: number) => void;
}

export function MatchSetup({ onMatchStart }: MatchSetupProps) {
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [bestOf, setBestOf] = useState("3");

  const handleStartMatch = () => {
    if (!player1Name.trim() || !player2Name.trim()) return;

    const players: Player[] = [
      {
        id: "player1",
        name: player1Name.trim(),
        score: 0,
        framesWon: 0,
        currentBreak: 0,
        highBreak: 0,
      },
      {
        id: "player2",
        name: player2Name.trim(),
        score: 0,
        framesWon: 0,
        currentBreak: 0,
        highBreak: 0,
      },
    ];

    onMatchStart(players, parseInt(bestOf));
  };

  const isValid = player1Name.trim() && player2Name.trim();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary mb-2">
            Snooker Match Setup
          </CardTitle>
          <p className="text-muted-foreground">
            Configure your match and start playing
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="player1" className="text-sm font-medium">
                Player 1 Name
              </Label>
              <Input
                id="player1"
                placeholder="Enter player 1 name"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="player2" className="text-sm font-medium">
                Player 2 Name
              </Label>
              <Input
                id="player2"
                placeholder="Enter player 2 name"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bestof" className="text-sm font-medium">
                Match Format
              </Label>
              <Select value={bestOf} onValueChange={setBestOf}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select match format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Best of 1</SelectItem>
                  <SelectItem value="3">Best of 3</SelectItem>
                  <SelectItem value="5">Best of 5</SelectItem>
                  <SelectItem value="7">Best of 7</SelectItem>
                  <SelectItem value="9">Best of 9</SelectItem>
                  <SelectItem value="11">Best of 11</SelectItem>
                  <SelectItem value="13">Best of 13</SelectItem>
                  <SelectItem value="15">Best of 15</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleStartMatch}
            disabled={!isValid}
            className="w-full py-6 text-lg font-semibold"
            size="lg"
          >
            Start Match
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Best of {bestOf} frames • First to {Math.ceil(parseInt(bestOf) / 2)} wins
          </div>
        </CardContent>
      </Card>
    </div>
  );
}