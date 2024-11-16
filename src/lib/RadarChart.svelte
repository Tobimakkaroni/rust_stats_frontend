<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import {
      Chart as ChartJS,
      RadialLinearScale,
      ArcElement,
      Tooltip,
      Legend,
      PolarAreaController,
    } from 'chart.js';
  
    ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend, PolarAreaController);
  
    import type { ChartOptions } from 'chart.js';
  
    export let chartData: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor?: string[];
        borderWidth?: number;
      }[];
    };
    export let chartOptions: ChartOptions;
  
    let chartContainer: HTMLCanvasElement;
    let chartInstance: ChartJS | null = null;
  
    onMount(() => {
      chartInstance = new ChartJS(chartContainer, {
        type: 'polarArea',
        data: chartData,
        options: chartOptions,
      });
    });
  
    onDestroy(() => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    });
  </script>
  
  <canvas bind:this={chartContainer}></canvas>