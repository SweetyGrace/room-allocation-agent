import React, { useRef, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip } from "chart.js";
import styles from "./index.module.scss";
import {
  setTotalAudience,
  setKpiType,
} from "../../../reducers/AnalyticsReducer";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatSingleDigit } from "../../../utils/commonFunctions";

// Register required Chart.js components
Chart.register(ArcElement, Tooltip);

/**
 * Interface defining props for GenderDistributionChart
 * @property {string[]} labels - Array of gender labels (Male/Female)
 * @property {number[]} data - Array of corresponding values for each gender
 * @property {string} endPoint - Title of the chart
 */
interface GenderDistributionChartProps {
  labels: string[];
  data: number[];
  endPoint: string;
  callBack: (it: number) => void;
  fromAggregate?: boolean;
  noDataMessage?: string;
  noDataIcon?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GenderDistributionChart: React.FC<GenderDistributionChartProps> = ({
  labels,
  data,
  endPoint,
  callBack,
  fromAggregate,
  noDataMessage,
  noDataIcon
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chartRef = useRef<unknown>(null);

  /**
   * Creates a linear gradient for chart segments
   * @param ctx - Canvas rendering context
   * @param chartArea - Chart area dimensions
   * @param colorStops - Array of colors for gradient
   * @returns Linear gradient object
   */
  const createGradient = (
    ctx: CanvasRenderingContext2D,
    chartArea: unknown,
    colorStops: string[],
  ) => {
    const gradient = ctx.createLinearGradient(
      chartArea.left,
      chartArea.top,
      chartArea.right,
      chartArea.bottom,
    );
    colorStops.forEach((stop, index) => {
      const position = index / (colorStops.length - 1); // Distribute stops evenly
      gradient.addColorStop(position, stop);
    });
    return gradient;
  };

  /**
   * Chart data configuration
   * Defines data structure and styling for the doughnut chart
   */
  const graphData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: (context: unknown) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return ["#3275F1", "#FF006F"];
          }

          // Define gradients for each segment
          const gradients = [
            createGradient(ctx, chartArea, [
              "#3275F1",
              "rgba(50, 117, 241, 0.2)",
            ]),
            createGradient(ctx, chartArea, [
              "#FF006F",
              "rgba(255, 133, 186, 0.2)",
            ]),
          ];
          if (
            data.length === 1 &&
            (labels[0] === "Female" || labels[0] == "femalePercentage")
          ) {
            return gradients.slice(1);
          }
          return gradients;
        },
        borderWidth: 2,
        borderRadius: 50,
        spacing: 5,
      },
    ],
  };

  /**
   * Chart options configuration
   * Controls chart appearance and behavior
   */
  const options = {
    cutout: "96%", // Controls how thick the doughnut is
    rotation: -90, // Starts from the left
    circumference: 180, // Makes it a semi-circle
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }, // Hide tooltips
      datalabels: {
        display: false,
      },
      shadowPlugin: false,
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  /**
   * Handles click on chart center
   * Dispatches total audience count
   */
  const handleCenterClick = () => {
    // const type = "Gender Distribution";
    callBack(data[0] + data[1]);
  };

  /**
   * Effect to customize chart drawing and handle interactions
   * Adds center text and click handlers
   */
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;
    const canvas = chart.canvas;

    const originalDraw = chart.draw;
    chart.draw = function () {
      // eslint-disable-next-line prefer-rest-params
      originalDraw.apply(this, arguments);

      const ctx = chart.ctx;
      const width = chart.width;
      const height = chart.height;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw "Gender" text in the center
      ctx.font = "normal 14px Arial";
      ctx.fillStyle = "#000"; // Black color for the text
      ctx.fillText("Gender", width / 2, height / 1.5); // Adjust the position as needed

      ctx.restore();
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const distance = Math.sqrt(
        Math.pow(x - chart.width / 2, 2) + Math.pow(y - chart.height / 1.5, 2),
      );

      if (distance < chart.width * 0.1) {
        handleCenterClick(); // Call the click handler
      }
    };

    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, [chartRef, handleCenterClick]);

  /**
   * Handles click on male gender label
   * Dispatches male count and navigates to details
   * @param value - Count of male participants
   */
  const handleMaleLabelClick = (value: number) => {
    const type = "Gender - Male";
    dispatch(setTotalAudience(value));
    dispatch(setKpiType(type));
    navigate(endPoint);
  };

  /**
   * Handles click on female gender label
   * Dispatches female count and navigates to details
   * @param value - Count of female participants
   */
  const handleFemaleLabelClick = (value: number) => {
    const type = "Gender - Female";
    dispatch(setTotalAudience(value));
    dispatch(setKpiType(type));
    navigate(endPoint);
  };

  return (
    <div className={styles.chartContainer}>
      {/* Chart title */}
      <h2 className={styles.chartTitle}>Gender distribution</h2>
      <div className={styles.horizontalline}></div>

      {/* Render chart content if data exists */}
      {data.length > 0 ? (
        <>
          {/* Gender Labels Section */}
          <div className={styles.genderLabels}>
            {/* Conditional rendering based on data length and gender types */}
            {data.length === 2 ? (
              <>
                <div
                  className={styles.maleLabel}
                  onClick={() => handleMaleLabelClick(data[0])}
                >
                  <span className={styles.maleLabelCount}>
                    {formatSingleDigit(data[0])}
                    {fromAggregate ? "%" : ""}&nbsp;
                  </span>
                  <span className={styles.labelText}>Male</span>
                </div>
                <div
                  className={styles.femaleLabel}
                  onClick={() => handleFemaleLabelClick(data[1])}
                >
                  <span className={styles.labelText}>Female &nbsp;</span>
                  <span className={styles.femaleLabelCount}>
                    {formatSingleDigit(data[1])}
                    {fromAggregate ? "%" : ""}
                  </span>
                </div>
              </>
            ) : data.length === 1 &&
              (labels[0] === "Male" || labels[0] == "malePercentage") ? (
              <div
                className={styles.maleLabel}
                onClick={() => handleMaleLabelClick(data[0])}
              >
                <span className={styles.maleLabelCount}>
                  {formatSingleDigit(data[0])}
                  {fromAggregate ? "%" : ""}&nbsp;
                </span>
                <span className={styles.labelText}>Male</span>
              </div>
            ) : data.length === 1 &&
              (labels[0] === "Female" || labels[0] == "femalePercentage") ? (
              <div
                className={styles.femaleLabel}
                onClick={() => handleFemaleLabelClick(data[0])}
              >
                <span className={styles.labelText}>Female &nbsp;</span>
                <span className={styles.femaleLabelCount}>
                  {formatSingleDigit(data[0])}
                  {fromAggregate ? "%" : ""}
                </span>
              </div>
            ) : null}
          </div>

          {/* Chart Wrapper */}
          <div
            className={styles.chartWrapper}
            style={{
              width: "100%",
              height: "180px",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              marginTop: "auto",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                width: "80%",
                height: "140px",
                position: "relative",
              }}
            >
              <Doughnut
                ref={chartRef}
                data={graphData}
                options={options}
                className={styles.genderChart}
              />
            </div>
          </div>
        </>
      ) : (
        // Show no data message if data is empty
        noDataMessage?
        <div className={styles.noSeekers}>
            <div className={styles.noSeekersImage}>
        <img src = {noDataIcon}/>
        </div>
        <p>{noDataMessage}</p>
        </div> :
        <div className={styles.noData}>No data available</div>
      )}
    </div>
  );
};

export default GenderDistributionChart;
