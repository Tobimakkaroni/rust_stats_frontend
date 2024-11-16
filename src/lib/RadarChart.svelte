<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Chart as ChartJS, RadialLinearScale, CategoryScale, PointElement, Title, Tooltip, Legend, RadarController, LineElement, Chart } from 'chart.js';
  
    ChartJS.register(
      RadialLinearScale,
      CategoryScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend,
      RadarController
    );
  
    export let chartData: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        fill: boolean;
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
      }[];
    };
    export let chartOptions: any;
  
    let chartContainer: HTMLCanvasElement;
    let chartInstance: Chart | null = null;
  
    const convertToPercentages = (data: number[]): number[] => {
      const max = Math.max(...data);
      return data.map((value) => (value / max) * 100);
    };
  
    const transformDataToPercentages = () => {
      const updatedData = chartData.datasets.map((dataset) => ({
        ...dataset,
        data: convertToPercentages(dataset.data)
      }));
      
      chartData = { ...chartData, datasets: updatedData };
    };
  
    onMount(() => {
      transformDataToPercentages();
  
      chartInstance = new ChartJS(chartContainer, {
        type: 'radar',
        data: chartData,
        options: chartOptions
      });
    });
  
    onDestroy(() => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    });
  </script>
  
  <canvas bind:this={chartContainer}></canvas>