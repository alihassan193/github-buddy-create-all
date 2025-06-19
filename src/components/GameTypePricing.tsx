
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, DollarSign } from "lucide-react";
import { useData } from "@/context/DataContext";

const GameTypePricing = () => {
  const { gameTypes, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!gameTypes || gameTypes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No game types available</p>
        </CardContent>
      </Card>
    );
  }

  const getPricingIcon = (pricingType: string) => {
    switch (pricingType) {
      case 'per_minute':
        return <Clock className="h-4 w-4" />;
      case 'fixed':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getPricingDescription = (pricingType: string) => {
    switch (pricingType) {
      case 'per_minute':
        return 'Charged per minute of play';
      case 'fixed':
        return 'Fixed rate per game';
      default:
        return 'Custom pricing';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Game Types & Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gameTypes.map((gameType) => (
          <Card key={gameType.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {gameType.name}
              </CardTitle>
              <CardDescription>
                {gameType.description || getPricingDescription(gameType.pricing_type)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getPricingIcon(gameType.pricing_type)}
                  {gameType.pricing_type?.replace('_', ' ').toUpperCase() || 'CUSTOM'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GameTypePricing;
