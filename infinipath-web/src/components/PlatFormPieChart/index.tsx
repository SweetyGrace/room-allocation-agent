import React from "react";
import { Doughnut } from "react-chartjs-2";
import styles from "./index.module.scss";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PlatFormPieChart = ({ deviceData }) => {

  const showDonut: number =
    deviceData &&
    Object.values(deviceData).reduce((acc, curr) => {
      return acc + curr;
    });

  const data = {
    labels: ["App", "Browser"],
    datasets: [
      {
        label: "Used platforms",
        data: deviceData ? Object?.values(deviceData) : [0, 0],
        backgroundColor: ["#468EFF", "#BEDAFF"],
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return null; // Prevent issues on initial load
          }
          const gradient1 = createGradient(ctx, "#EAEBFF", "#2F73F1");
          const gradient2 = createGradient(ctx, "#EBECFF", "#D6D7EF");

          return context.dataIndex === 0 ? gradient1 : gradient2;
        },
        borderWidth: 3,
        borderRadius: 10,
      },
    ],
  };

  const createGradient = (ctx, color1, color2) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);

    gradient.addColorStop(0, color1); // Start with dark blue
    gradient.addColorStop(0.3, color2);
    gradient.addColorStop(0.4, color2);
    return gradient;
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
      tooltip: {
        enabled: false, // Disable tooltips
      },
      datalabels: {
        display: false, // Disable data labels
      },
    },
    elements: {
      arc: {
        borderWidth: 3, // Ensure the border width matches the dataset border width
      },
    },
    cutout: "80%", // Adjust the size of the doughnut hole
  };

  return (
    <div className={styles.barChartClass} data-testid="bar-chart-class">
      {/* <div className={styles.chartContainer}> */}
      <span className={styles.chartTitle} data-testid="chart-title">
        Platforms used by the users
      </span>

      {showDonut > 0 ? (
        <div className={styles.chartContainer} data-testid="chart-container">
          <div className={styles.chartsDiv} data-testid="charts-div">
            <div className={styles.charts} data-testid="charts">
              <div
                className={styles.doughnutChart}
                data-testid="doughnut-chart"
              >
                <Doughnut
                  data={data}
                  options={options}
                  data-testid="doughnut"
                />
                <p data-testid="used-platforms">Used platforms</p>
              </div>
            </div>
          </div>
          <div className={styles.header} data-testid="header">
            <div className={styles.legend} data-testid="legend-app">
              <span
                className={styles.dot}
                style={{ backgroundColor: "#468EFF" }}
                data-testid="dot-app"
              ></span>
              <span
                className={styles.agepercentage}
                data-testid="agepercentage-app"
              >
                {data.datasets[0].data[0]}%
                <span className={styles.ageRange} data-testid="ageRange-app">
                  App
                </span>
              </span>
            </div>
            <div className={styles.legend} data-testid="legend-browser">
              <span
                className={styles.dot}
                style={{ backgroundColor: "#BEDAFF" }}
                data-testid="dot-browser"
              ></span>
              <span
                className={styles.agepercentage}
                data-testid="agepercentage-browser"
              >
                {data.datasets[0].data[1]}%
                <span
                  className={styles.ageRange}
                  data-testid="ageRange-browser"
                >
                  Browser
                </span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.noDatafound} data-testid="no-data-found">
          No platform data found
        </div>
      )}
      {/* </div> */}
    </div>
  );
};

export default PlatFormPieChart;
