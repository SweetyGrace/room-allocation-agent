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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

interface HorizontalBarChartProps {
  kpis: { [key: string]: number };
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ kpis }) => {

  const createGradient = (ctx, color1, color2) => {
    const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.25, color2);
    gradient.addColorStop(0.6, color2);
    return gradient;
  };

  const getMaxValue = (data) => {
    if (!data) {
      return 0;
    }
    return Math.max(...Object.values(data)) + 100;
  };

  const data = {
    labels: ["Cancellations", "Video downgrades", "Late Joiners", "Rejoins"],
    datasets: [
      {
        label: "Count",
        data: kpis ? Object.values(kpis) : [],
        borderWidth: 1,
        borderRadius: {
          topLeft: 4,
          topRight: 4,
          bottomLeft: 4,
          bottomRight: 4,
        },
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx } = chart;
          const gradient1 = createGradient(ctx, "#EAEBFF", "#2F73F1");
          return gradient1;
        },
        barThickness: 12,
        borderSkipped: false,
      },
    ],
  };

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
      ctx.strokeStyle = "#E9E9E9";
      ctx.lineWidth = 1;
      ctx.setLineDash([15, 7]);

      y.ticks.forEach((tick) => {
        const yCoor = y.getPixelForValue(tick.value);
        ctx.beginPath();
        ctx.moveTo(left, yCoor);
        ctx.lineTo(right, yCoor);
        ctx.stroke();
      });

      ctx.restore();
    },
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      title: {
        display: false,
      },
      datalabels: {
        anchor: "end", // Position at the end of the bar
        align: "end", // Align outside the bar
        formatter: (value) => {
          return `${value}`;
        },

        font: {
          weight: "bold",
          size: 14,
        },
        color: "#000",
        padding: {
          right: 10, // Add padding to separate numbers from bars
        },
        clip: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          display: false,
          // offset: false,
        },
        max: kpis && getMaxValue(kpis),
        ticks: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          drawBorder: false,
          display: false,
        },
        ticks: {
          beginAtZero: true,
          display: true,
          drawTicks: false,
          font: {
            size: 14,
          },
          padding: 10,
          color: "#000",
        },
        border: {
          display: false,
        },
      },
    },
    barPercentage: 0.8,
    categoryPercentage: 0.8,
  };

  return (
    <div className={styles.barChartClass} data-testid="bar-chart-class">
      <span className={styles.chartTitle} data-testid="chart-title">
        Audience discipline
      </span>
      <Bar
        data={data}
        options={options}
        plugins={[horizontalLinesPlugin]}
        data-testid="bar-chart"
      />
    </div>
  );
};

export default HorizontalBarChart;
