import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import styles from "./index.module.scss";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

// Custom plugin for horizontal dashed lines
// Custom plugin for horizontal dashed lines
const horizontalLinesPlugin = {
  id: "horizontalLinesPlugin",
  beforeDraw(chart) {
    const {
      ctx,
      chartArea: { left, right },
      scales: { y },
    } = chart;

    if (!y || !y.ticks) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = "#E9E9E9"; // Line color (gray)
    ctx.lineWidth = 1; // Line thickness
    ctx.setLineDash([15, 7]); // Dashed line

    // Iterate over each tick value on the y-axis
    y.ticks.forEach((tick) => {
      const yCoor = y.getPixelForValue(tick.value); // Get y-coordinate for each tick
      ctx.beginPath();
      ctx.moveTo(left, yCoor); // Start the line at the left of the chart area
      ctx.lineTo(right, yCoor); // End the line at the right of the chart area
      ctx.stroke();
    });

    ctx.restore();
  },
};

interface VerticalBarChartProps {
  joinArrays?: number[];
  // :React.FC<VerticalBarChartProps>
  customNumbers?: number[];
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  joinArrays,
  customNumbers,
}) => {
  const createGradient = (ctx, color1, color2) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0.3, color1); // Start with dark blue
    gradient.addColorStop(0.5, color2);
    gradient.addColorStop(1, color1);
    return gradient;
  };

  const data = {
    labels: ["Own device", "Other device", "Cross device"],
    datasets: [
      {
        label: "",
        data: joinArrays ? Object.values(joinArrays) : [],
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return null; // Prevent issues on initial load
          }
          const gradient1 = createGradient(ctx, "#65C466", "#EAEBFF");
          const gradient2 = createGradient(ctx, "#FAD233", "#EAEBFF");
          const gradient3 = createGradient(ctx, "#2F73F1", "#EAEBFF");

          return context.dataIndex === 0
            ? gradient1
            : context.dataIndex === 1
              ? gradient3
              : gradient2;
        },
        barThickness: 12, // Set bar thickness
        borderRadius: {
          topLeft: 4,
          topRight: 4,
          bottomLeft: 4,
          bottomRight: 4,
        },
        barPercentage: 1.0,
        categoryPercentage: 1.0,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      tooltip: {
        enabled: false, // Disable tooltips
      },
      title: {
        display: false, // No chart title
      },
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          const number = customNumbers ? customNumbers[label] : value;
          return `${number} (${value}%)`;
        },
        color: "#000",
        font: {
          weight: "bold",
        },
      },
      horizontalLinesPlugin: {}, // Register the plugin locally
    },
    scales: {
      x: {
        grid: {
          drawBorder: false,
          display: false, // Hide x-axis grid lines
        },
        border: {
          color: "#D9D9D9",
        },
        categoryPercentage: 0.6, // Reduce category spacing
        barPercentage: 0.6, // Maximize bar width
        offset: true, // Ensure proper bar placement
        ticks: {
          display: true, // Hide x-axis labels
          font: {
            size: 10,
          },
          color: "#7D7D7D",
        },
      },
      y: {
        grid: {
          drawBorder: false,
          display: false, // Hide y-axis grid lines
        },
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
          stepSize: 20, // Tick interval
        },
        border: {
          display: false,
        },
      },
    },
    layout: {
      padding: {
        left: 10, // Allow some empty space on the left for alignment
        right: 10, // Allow some empty space on the right for alignment
        top: 30,
      },
    },
  };
  return (
    <div className={styles.barChartClass} data-testid="bar-chart-class">
      <span className={styles.chartTitle} data-testid="chart-title">Method of attendance</span>
      {joinArrays ? (
        <Bar data={data} options={options} plugins={[horizontalLinesPlugin]} data-testid="bar-chart" />
      ) : (
        <div data-testid="no-data-found">No data found</div>
      )}
    </div>
  );
};

export default VerticalBarChart;