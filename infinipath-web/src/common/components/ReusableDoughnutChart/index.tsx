// Import necessary dependencies for React and Chart.js
import React, { useRef, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./index.module.scss";
import {
  formatSingleDigit,
  getColorsArray,
} from "../../../utils/commonFunctions";
import { Tooltip as MuiTooltip } from "@mui/material";

/**
 * Custom shadow plugin for Chart.js
 * Adds shadow effect to chart elements
 */
const shadowPlugin: ShadowPlugin = {
  id: "shadowPlugin",
  beforeDatasetDraw: function (chart: ChartJS, args: { index: number }) {
    const { ctx } = chart;

    if (args.index === 0) {
      ctx.save();
      ctx.shadowColor = "rgba(0, 123, 255, 1)";
      ctx.shadowBlur = 100;
      ctx.shadowOffsetX = 10;
      ctx.shadowOffsetY = 0;

      ctx.lineJoin = "round";
      ctx.lineCap = "round";
    }
  },
  afterDatasetDraw: function (chart: ChartJS, args: { index: number }) {
    if (args.index === 0) {
      chart.ctx.restore();
    }
  },
};

// Register Chart.js components and custom plugin
ChartJS.register(shadowPlugin);
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Interface for shadow plugin configuration
 */
interface ShadowPlugin {
  id: string;
  beforeDatasetDraw: (chart: ChartJS, args: { index: number }) => void;
  afterDatasetDraw: (chart: ChartJS, args: { index: number }) => void;
}

/**
 * Interface for component props
 */
interface ReusableDoughNutChartProps {
  labels: string[];
  data: number[];
  title: string;
  centerText: string;
  handleLocationClick?: (location: string, value: number) => void;
  handleAudienceClick?: (audience: string, value: number) => void;
  fromAggregate?: boolean;
}

const ReusableDoughNutChart: React.FC<ReusableDoughNutChartProps> = ({
  labels,
  data,
  title,
  centerText,
  handleAudienceClick,
  handleLocationClick,
  fromAggregate,
}) => {
  const chartRef = useRef<ChartJS<"doughnut"> | null>(null); // Explicitly typed for Doughnut chart

  // Calculate total and define color schemes
  const total = data.reduce((acc, curr) => acc + curr, 0);
  const darkColors = ["#FF6B35", "#F4B400", "#2D82B5", "#D3B3FF"];

  // Generate the colors array based on the data length
  const backgroundColors = getColorsArray(darkColors, data.length);
  const audienceColors = [
    "rgba(101, 196, 102, 0.8)",
    "rgba(50, 117, 241, 0.8)",
  ];

  /**
   * Chart configuration object
   * Defines data structure and styling
   */
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "# of Votes",
        data: data,
        backgroundColor:
          centerText === "Locations" ? backgroundColors : audienceColors,
        borderColor: backgroundColors.map((color) => color.replace("0.8", "1")),
        borderWidth: 0,
        borderRadius: 50,
        spacing: 5,
        cutout: "97%",
      },
    ],
  };

  /**
   * Chart options
   * Controls chart behavior and appearance
   */
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      datalabels: {
        display: false,
      },
    },
  };

  /**
   * Effect to customize chart drawing
   * Adds center text and total count
   */
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;
    const originalDraw = chart.draw;

    // Custom draw function to add center text
    chart.draw = function (...args) {
      originalDraw.apply(this, args);

      const ctx = this.ctx;
      const width = this.width;
      const height = this.height;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (centerText !== "Locations") {
        ctx.font = "bold 20px Arial";
        ctx.fillText(
          formatSingleDigit(total).toString(),
          width / 2,
          height / 2 - 10,
        );
      }

      ctx.font = "14px Arial";
      const alignHeight = centerText === "Locations" ? 0 : 15;
      ctx.fillText(centerText, width / 2, height / 2 + alignHeight);

      ctx.restore();
    };
  }, [chartRef, total, centerText]);

  return (
    <>
      {/* Render different layouts based on centerText type */}
      {centerText === "Locations" ? (
        // Location-based chart layout
        <div className={styles.doughnutcontainer}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.doughnuthorizontalline}></div>
          {data.length > 0 ? (
            <div className={styles.doughnutwrapper}>
              <div className={styles.chart}>
                <Doughnut
                  ref={chartRef}
                  data={chartData}
                  options={options}
                  className={styles.doughnutchart}
                />
              </div>
              <div className={styles.labels}>
                {labels.map((label, index) => (
                  <div
                    key={index}
                    className={styles.label}
                    onClick={() =>
                      handleLocationClick &&
                      handleLocationClick(
                        label,
                        chartData.datasets[0].data[index],
                      )
                    }
                  >
                    <span
                      className={styles.colorBox}
                      style={{
                        backgroundColor:
                          chartData.datasets[0].backgroundColor[index],
                      }}
                    ></span>
                    <span
                      className={
                        label.length > 12
                          ? styles.countlabelelips
                          : styles.labelText
                      }
                    >
                      <span className={styles.countlabel}>
                        {formatSingleDigit(chartData.datasets[0].data[index])}
                        {fromAggregate ? "%" : ""}
                      </span>
                      &nbsp;
                      {label.length > 12 ? (
                        <MuiTooltip title={label} arrow placement="top">
                          <span>{label.slice(0, 12)}...</span>
                        </MuiTooltip>
                      ) : (
                        label
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.noData}>No Data Available</div>
          )}
        </div>
      ) : (
        // Audience-based chart layout
        <div className={styles.doughnutcontainer}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.doughnuthorizontalline}></div>
          {data.length > 0 ? (
            <div className={styles.doughnutwrapper}>
              <div className={styles.chart}>
                <Doughnut
                  ref={chartRef}
                  data={chartData}
                  options={options}
                  className={styles.doughnutchart}
                />
              </div>
              <div className={styles.verticalline}></div>
              <div className={styles.verticallabels}>
                {labels.map((label, index) => (
                  <div
                    key={index}
                    className={styles.verticallabel}
                    style={{
                      background: `linear-gradient(90deg, ${chartData.datasets[0].backgroundColor[
                        index
                      ].replace("", "0.1")},rgb(255, 255, 255))`,
                    }}
                    onClick={() =>
                      handleAudienceClick &&
                      handleAudienceClick(
                        label,
                        chartData.datasets[0].data[index],
                      )
                    }
                  >
                    <span
                      className={styles.colorBox}
                      style={{
                        backgroundColor:
                          chartData.datasets[0].backgroundColor[index],
                      }}
                    ></span>
                    <span className={styles.labelText}>
                      <span className={styles.countlabel}>
                        {formatSingleDigit(chartData.datasets[0].data[index])}
                        {fromAggregate ? "%" : ""}
                      </span>
                      &nbsp;
                      {label === "nonInfinithiest"
                        ? "non-infinitheist"
                        : "infinitheist"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.noData}>No Data Available</div>
          )}
        </div>
      )}
    </>
  );
};

export default ReusableDoughNutChart;
