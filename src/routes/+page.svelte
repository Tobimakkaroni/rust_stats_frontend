<script lang="ts">
  import RadarChart from '$lib/RadarChart.svelte';
  import type { ChartOptions } from 'chart.js';
  import { onMount } from 'svelte';

  interface PolarAreaChartData {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  }

  let steamId: string = "";
  let games: any = null;
  let selectedGameStats: any = null;
  let selectedGame: string | null = null;
  let searchQuery: string = "";
  let currentPage: number = 1;
  const gamesPerPage: number = 5;

  let chartData: PolarAreaChartData = {
    labels: [],
    datasets: []
  };

  let chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right'
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    }
  };

  const normalizeData = (data: number[]): number[] => {
    const max = Math.max(...data);
    return data.map((value) => (value / max) * 100);
  };

  const toggleTheme = () => {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.body.setAttribute('data-theme', 'light');
    } else {
      document.body.setAttribute('data-theme', 'dark');
    }
  };

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

      const rawData = data.stats.map((stat: { value: string }) =>
        parseFloat(stat.value)
      );

      const normalizedData = normalizeData(rawData);

      chartData = {
        labels: data.stats.map((stat: { name: string }) => stat.name),
        datasets: [{
          label: `Stats for ${gameName}`,
          data: normalizedData,
          backgroundColor: normalizedData.map(() =>
            `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`
          ),
          borderColor: normalizedData.map(() =>
            `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`
          ),
          borderWidth: 1
        }]
      };

      console.log('Chart Data:', chartData);
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

  <div class="theme-toggle">
    <button class="primary-button" on:click={toggleTheme}>Toggle Dark/Light Mode</button>
  </div>

  {#if games}
    <ul class="games-list">
      {#each paginatedGames() as game}
        <li class="game-item">
          <button class="game-button" on:click={() => fetchGameStats(game.name)}>{game.name}</button>
          <span class="playtime">{minutesToHours(game.playtime_forever)} hours</span>
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
      {#if chartData && chartData.labels.length > 0}
        <RadarChart {chartData} {chartOptions} />
      {:else}
        <p>Loading chart...</p>
      {/if}

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

<link rel="stylesheet" href="/src/routes/styles.css" />