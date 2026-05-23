import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const StackedBarChart = () => {
  const data = {
    labels: ["Event A", "Event B", "Event C"], // You can replace with your categories
    datasets: [
      {
        label: "<18",
        data: [12, 8, 10],
        backgroundColor: "#8ecae6",
        stack: "age",
        borderWidth: 0.5, // Add this line
        borderRadius: 2,  // Optional: for rounded corners
      },
      {
        label: "19–25",
        data: [18, 20, 15],
        backgroundColor: "#219ebc",
        stack: "age",
        borderWidth: 0.5,
        borderRadius: 2,
      },
      {
        label: "26–40",
        data: [22, 25, 30],
        backgroundColor: "#023047",
        stack: "age",
        borderWidth: 0.5,
        borderRadius: 2,
      },
      {
        label: ">40",
        data: [8, 12, 10],
        backgroundColor: "#ffb703",
        stack: "age",
        borderWidth: 0.5,
        borderRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Age Distribution by Event",
      },
    },
    scales: {
      x: {
        stacked: true,
        barPercentage: 0.5,       // Shrinks individual bars
        categoryPercentage: 0.6,  
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default StackedBarChart;
