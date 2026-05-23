import { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  BarController,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import styles from "./index.module.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

interface KpiData {
  totalAttended: number;
  totalRegistered: number;
  totalAbsentees: number;
  totalCancellations: number;
  totalDowngrades: number;
  totalDisabled: number;
  totalDropoffs: number;
  totalRejoinCount: number;
  totalDuration: number;
  totalTimeSpent: string;
}

const SeekerBarChart = ({ kpiData }: { kpiData: KpiData }) => {
  const chartRef = useRef(null);

  // Update data to use kpiData
  const data = {
    labels: ["Attendance", "Registered"],
    datasets: [
      {
        type: "bar",
        label: "Participation",
        data: [kpiData?.totalAttended, kpiData?.totalRegistered],
        backgroundColor: ["#2F73F1", "#12A814"],
        hoverBackgroundColor: ["#2F73F1", "#12A814"],
        borderRadius: {
          topLeft: 4,
          topRight: 4,
          bottomLeft: 0,
          bottomRight: 0,
        },
        barThickness: 8,
        borderSkipped: false,
        borderColor: "white",
        borderWidth: 2,
        hoverBorderWidth: 2,
        hoverBorderColor: "white",
      },
    ],
  };

  // Update options to control label display
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    hover: {
      mode: null,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: "white",
        titleColor: "#051b46",
        bodyColor: "#051b46",
        borderColor: "#ddd",
        borderWidth: 1,
        padding: 12,
        events: ["mousemove", "mouseout"],
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed.y == null ? 0 : context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: true,
          font: {
            size: 10,
          },
          color: "#8A8A8A",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          borderDash: [5, 5],
          borderDashOffset: 0,
          color: "#E9E9E9",
          drawTicks: false,
          tickLength: 0,
          lineWidth: 0.5,
          drawBorder: false,
        },
        border: {
          dash: [10, 10],
          display: true,
        },
        ticks: {
          stepSize: 20,
          padding: 10,
          callback: (value) => `${value}`,
        },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartTitle}>
        <div className={styles.title}>Attendance Vs Registrations</div>
      </div>
      <div className={styles.linehorizontalline}></div>
      <div className={styles.chartWrapper} style={{ height: "236px" }}>
          <Chart ref={chartRef} type="bar" data={data} options={options} />
       
      </div>
    </div>
  );
};

export default SeekerBarChart;
