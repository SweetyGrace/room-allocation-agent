import React from "react";
import { Doughnut } from "react-chartjs-2";
import styles from "./index.module.scss";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const cityData = {
  Hyderabad: {
    ageData: [60, 30, 10],
    percentage: "30%",
  },
  Pune: {
    ageData: [50, 40, 10],
    percentage: "10%",
  },
  Mumbai: {
    ageData: [70, 20, 10],
    percentage: "10%",
  },
  Bangalore: {
    ageData: [65, 25, 10],
    percentage: "09%",
  },
  Delhi: {
    ageData: [80, 15, 5],
    percentage: "04%",
  },
  Delhiy: {
    ageData: [80, 15, 5],
    percentage: "04%",
  },
};

const PieChart = () => {
  const createGradient = (ctx, color1, color2, color3, color4) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.25, color2);
    gradient.addColorStop(0.6, color3);
    gradient.addColorStop(1, color4);

    return gradient;
  };
  const [selectedCity, setSelectedCity] = useState("Hyderabad");

  const handleCityClick = (city) => {
    setSelectedCity(city);
  };

  const ageData = {
    labels: ["22-39", "40-54", ">55"],
    datasets: [
      {
        label: "Age Distribution",
        data: cityData[selectedCity].ageData,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return null; // Prevent issues on initial load
          }

          const gradient1 = createGradient(
            ctx,
            "#EAEBFF",
            "#FF600D",
            "#F26922",
            "#FFBD9F",
          );
          const gradient3 = createGradient(
            ctx,
            "#FFA215",
            "#FFBB54",
            "#FFBB54",
            "#FFA215",
          );
          const gradient2 = createGradient(
            ctx,
            "#EAEBFF",
            "#D6D7EF",
            "#D6D7EF",
            "#EAEBFF",
          );

          return context.dataIndex === 0
            ? gradient1
            : context.dataIndex === 1
              ? gradient3
              : gradient2;
        },
        borderWidth: 3,
        borderRadius: 10,
      },
    ],
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
    <div className={styles.barChartClass}>
      <span className={styles.chartTitle}>Registration and attendance</span>
      <div className={styles.chartContainer}>
        <div className={styles.cityList}>
          {Object.keys(cityData).map((city) => (
            <div
              key={city}
              className={
                selectedCity === city ? styles.activeCity : styles.nonActiveCity
              }
              onClick={() => handleCityClick(city)}
            >
              <span className={styles.cityHighlight}>{city}</span>
              <span>{`${city === "Hyderabad" ? "30%" : city === "Pune" ? "10%" : city === "Mumbai" ? "10%" : city === "Bangalore" ? "09%" : "04%"}`}</span>
            </div>
          ))}
        </div>
        <div className={styles.chartsDiv}>
          <div className={styles.charts}>
            <div className={styles.doughnutChart}>
              <Doughnut data={ageData} options={options} />
              <p>Age distribution</p>
            </div>
          </div>
        </div>
        <div className={styles.header}>
          <div className={styles.legend}>
            <span
              className={styles.dot}
              style={{ backgroundColor: "#FF600D" }}
            ></span>
            <span className={styles.agepercentage}>
              {cityData[selectedCity]?.ageData[0]}%
              <span className={styles.ageRange}>22 - 39</span>
            </span>
          </div>
          <div className={styles.legend}>
            <span
              className={styles.dot}
              style={{ backgroundColor: "#FFBB54" }}
            ></span>
            <span className={styles.agepercentage}>
              {cityData[selectedCity]?.ageData[1]}%
              <span className={styles.ageRange}>40 - 54</span>
            </span>
          </div>
          <div className={styles.legend}>
            <span
              className={styles.dot}
              style={{ backgroundColor: "#DCDCDC" }}
            ></span>
            <span className={styles.agepercentage}>
              {cityData[selectedCity]?.ageData[2]}%
              <span className={styles.ageRange}>{">"}55</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChart;
