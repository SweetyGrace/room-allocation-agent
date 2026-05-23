import React, { useRef, useEffect } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const JoinBar = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      const ctx = chart.ctx;
      const datasets = chart.data.datasets[0];

      // Create individual gradients for each bar
      datasets.backgroundColor = datasets.data.map(() => {
        const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
        gradient.addColorStop(0, "#2F73F1"); // Start with dark blue
        gradient.addColorStop(1, "#EAEBFF"); // Transition to light blue
        return gradient;
      });

      chart.update();
    }
  }, []);

  // Plugin to add background color for progress bars
  const progressBarBackgroundPlugin = {
    id: "progressBarBackground",
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      const { left, right } = chartArea;
      const { y } = scales;

      ctx.save();
      chart.data.labels.forEach((label, index) => {
        const barHeight =
          (y.getPixelForValue(index + 1) - y.getPixelForValue(index)) * 0.13;
        const yPos = y.getPixelForValue(index) - barHeight / 2;
        // Set the background color for the bar area
        ctx.fillStyle = "#DEE6EB"; // Light gray background

        ctx.fillRect(left, yPos, right - left, barHeight);
      });
      ctx.restore();
    },
  };

  const data = {
    labels: ["joined alone", "joined with others"], // Labels for the bars
    datasets: [
      {
        label: "Count",
        data: [5, 10], // Data values
        borderWidth: 1,
        borderRadius: {
          topLeft: 4,
          topRight: 4,
          bottomLeft: 4,
          bottomRight: 4,
        }, // Rounded corners on all sides
        barThickness: 12, // Set bar thickness to 12px
        backgroundColor: [], // Placeholder for gradient
        borderSkipped: false, // Apply border radius to all sides
      },
    ],
  };

  const options = {
    indexAxis: "y", // Horizontal bars
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
        anchor: "middle",
        align: "top",
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          const dataValue = value;
          const formattedLabel =
            label === "joined alone"
              ? "                                                            joined alone"
              : "joined with others";
          return ` ${formattedLabel}                                                                                                                ${dataValue}`;
        },
        font: {
          weight: "bold",
        },
        color: "#000",
        marginLeft: 20,
        lineHeight: 1.5,
        padding: {
          left: 30, // Add padding to the left to move the label to the right
          top: 10, // Add padding to the top
        },
        clip: false, // Allow labels to be drawn outside the chart area
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          drawBorder: false, // Remove x-axis border line
          display: false, // Hide x-axis grid lines
        },
        max: 12,
        ticks: {
          display: false, // Hide x-axis ticks
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          drawBorder: false, // Remove the y-axis line
          display: false, // Hide y-axis grid lines
        },
        ticks: {
          display: false, // Keep y-axis labels visible
          drawTicks: false, // Remove small tick marks on the y-axis
          font: {
            size: 14,
          },
          padding: 10,
          color: "#000", // Label color
        },
        border: {
          display: false,
        },
      },
    },
    barPercentage: 0.8, // Adjust bar width
    categoryPercentage: 0.8, // Adjust category width
  };

  // Register the plugin

  return (
    <div className={styles.barChartClass}>
      <span className={styles.chartTitle}>Audience discipline</span>
      <Bar
        ref={chartRef}
        data={data}
        options={options}
        plugins={[progressBarBackgroundPlugin]}
      />
    </div>
  );
};

export default JoinBar;
