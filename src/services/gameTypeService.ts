
import { GameType } from "../types";
import { apiClient } from "./apiClient";

// Get all game types
export const getAllGameTypes = async (): Promise<GameType[]> => {
  try {
    const gameTypes = await apiClient.get("/api/game-types");
    console.log("API Response - Game Types:", gameTypes);
    return gameTypes || [];
  } catch (error) {
    console.error("Error fetching game types:", error);
    // Return default game types if API fails
    return [
      { id: 1, name: "Frames" },
      { id: 2, name: "Century" }
    ];
  }
};
