<script lang="ts">
  let steamId: string = "";
  let games: any = null;
  let selectedGameStats: any = null;
  let selectedGame: string | null = null;
  let searchQuery: string = "";

  let currentPage: number = 1;
  const gamesPerPage: number = 5;

  const fetchGames = async () => {
    if (!steamId) {
      alert("Please enter a Steam ID");
      return;
    }
    try {
      const response = await fetch(`/api/steam/games/${steamId}`);
      const data = await response.json();
      if (data.games) {
        games = data.games;
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      alert("Error fetching games. Check the console.");
    }
  };

  const fetchGameStats = async (gameName: string) => {
    try {
      const response = await fetch(`/api/steam/user-stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steam_id: steamId, game_name: gameName }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch game stats.");
      }
      const data = await response.json();
      selectedGameStats = data;
      selectedGame = gameName;
    } catch (error) {
      console.error("Error fetching game stats:", error);
      alert("Error fetching game stats. Check the console.");
    }
  };

  const minutesToHours = (minutes: number): string => {
    return (minutes / 60).toFixed(2);
  };

  const nextPage = () => {
    if (games && (currentPage * gamesPerPage) < filteredGames().length) {
      currentPage++;
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      currentPage--;
    }
  };

  const paginatedGames = () => {
    const start = (currentPage - 1) * gamesPerPage;
    const end = currentPage * gamesPerPage;
    return filteredGames().slice(start, end);
  };

  const filteredGames = () => {
    if (!games) return [];
    return games
      .filter((game: { name: string }) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a: { playtime_forever: number }, b: { playtime_forever: number }) =>
        b.playtime_forever - a.playtime_forever
      );
  };
</script>

<main>
  <h1>Steam Game Stats</h1>

  <div class="form-container">
    <input type="text" bind:value={steamId} placeholder="Enter your Steam ID" />
    <button class="primary-button" on:click={fetchGames}>Fetch Games</button>
  </div>

  <div class="search-container">
    <input type="text" bind:value={searchQuery} placeholder="Search for a game" />
  </div>

  {#if games}
    <ul class="games-list">
      {#each paginatedGames() as game}
        <li class="game-item">
          <button class="game-button" on:click={() => fetchGameStats(game.name)}>{game.name}</button>
          <span class="playtime">- {minutesToHours(game.playtime_forever)} hours</span>
        </li>
      {/each}
    </ul>

    <div class="pagination">
      <button class="pagination-button" on:click={prevPage} disabled={currentPage === 1}>Previous</button>
      <button class="pagination-button" on:click={nextPage} disabled={(currentPage * gamesPerPage) >= filteredGames().length}>Next</button>
    </div>
  {:else}
    <p class="no-games">No games found or loading...</p>
  {/if}

  {#if selectedGame && selectedGameStats}
    <section class="game-stats">
      <h2>Stats for {selectedGame}</h2>
      <table class="stats-table">
        <thead>
          <tr>
            <th>Stat Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {#each selectedGameStats.stats as stat}
            <tr>
              <td>{stat.name}</td>
              <td>{stat.value}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <p><strong>Total Playtime:</strong> {selectedGameStats.game_time} hours</p>
    </section>
  {/if}
</main>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }

  body {
    background-color: #f4f6f8;
    color: #333;
}

  main {
    max-width: 900px;
    margin: 2rem auto;
    padding: 1rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }

  .form-container {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .search-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  input {
    padding: 0.75rem;
    font-size: 1rem;
    width: 100%;
    max-width: 300px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    border: none;
    border-radius: 4px;
  }

  .primary-button {
    background-color: #3498db;
    color: white;
    transition: background-color 0.3s ease;
  }

  .primary-button:hover {
    background-color: #2980b9;
  }

  .games-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .game-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background-color: #ecf0f1;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .game-button {
    background-color: transparent;
    border: none;
    color: #3498db;
    font-size: 1rem;
    text-align: left;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .game-button:hover {
    color: #2980b9;
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .pagination-button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  .pagination-button:hover {
    background-color: #2980b9;
  }

  .game-stats {
    margin-top: 2rem;
    padding: 1rem;
    border-radius: 4px;
    background-color: #ecf0f1;
  }

  .stats-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #3498db;
    color: white;
  }

  .no-games {
    text-align: center;
    font-size: 1.2rem;
    color: #e74c3c;
  }
</style>