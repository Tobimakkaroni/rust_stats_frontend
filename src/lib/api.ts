export async function fetchGames(steamId: string) {
    const response = await fetch(`/api/steam/games/${steamId}/`);
    if (!response.ok) {
      throw new Error("Failed to fetch games.");
    }
    return response.json();
  }
  
  export async function fetchGameStats(steamId: string, gameName: string) {
    const response = await fetch(`/api/steam/user-stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steam_id: steamId, game_name: gameName }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch game stats.");
    }
    return response.json();
  }