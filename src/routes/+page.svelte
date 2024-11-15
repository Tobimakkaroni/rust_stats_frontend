<script lang="ts">
    let steamId: string = "";
    let games: any = null;
  
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
    
    const minutesToHours = (minutes: number): string => {
      return (minutes / 60).toFixed(2);
    };
  </script>
  
  <main>
    <h1>Steam Game Stats</h1>
    
    <input type="text" bind:value={steamId} placeholder="Enter your Steam ID" />
    
    <button on:click={fetchGames}>Fetch Games</button>
    
    {#if games}
      <ul>
        {#each games as game}
          <li>{game.name} - {minutesToHours(game.playtime_forever)} hours</li>
        {/each}
      </ul>
    {:else}
      <p>No games found or loading...</p>
    {/if}
  </main>
  
  <style>
    main {
      font-family: sans-serif;
      margin: 0 auto;
      max-width: 800px;
      padding: 2rem;
    }
  
    input {
      padding: 0.5rem;
      font-size: 1rem;
      margin-right: 1rem;
    }
  
    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
    }
  
    ul {
      list-style-type: none;
      padding: 0;
    }
  
    li {
      margin: 0.5rem 0;
    }
  
    .error {
      color: red;
      font-weight: bold;
    }
  </style>