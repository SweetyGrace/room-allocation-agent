import React, { useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import greenUpArrow from "../../../assets/images/green-up-arrow.svg";
import styles from "./index.module.scss";
import { setKpiType, setTotalAudience } from "../../../reducers/AnalyticsReducer";
import { useDispatch } from "react-redux";
import { endPoints } from "../../../constants/urlConstants";
import { useNavigate } from "react-router-dom";
import { formatSingleDigit } from "../../../utils/commonFunctions";
import { KPI_FILTERS } from "../../../constants";

ChartJS.register(ArcElement, Tooltip, Legend);

interface SemiCircleChartProps {
  percentage: number;
  attended: number;
  total: number;
  newSeekers: number;
}

/**
 * SemiCircleChart is a reusable React functional component that renders a semi-circular chart
 * using the Doughnut chart from the Chart.js library. It displays percentage data, attended count,
 * total registrations, and new seekers, with interactive elements for navigation and data filtering.
 *
 * @param {SemiCircleChartProps} props - The props for the SemiCircleChart component.
 * @param {number} props.percentage - The percentage value to display on the chart.
 * @param {number} props.attended - The number of attendees to display.
 * @param {number} props.total - The total number of registrations to display.
 * @param {number} props.newSeekers - The number of new seekers to display.
 *
 * @returns {JSX.Element} A semi-circular chart with interactive text elements.
 *
 * @remarks
 * - The chart uses a gradient color for the filled portion, dynamically calculated based on the percentage.
 * - The component includes click handlers for navigating to detailed analytics views for new seekers,
 *   attended users, and total registrations.
 * - The chart is styled using CSS modules, and the gradient is applied programmatically using the Chart.js API.
 *
 * @example
 * ```tsx
 * <SemiCircleChart
 *   percentage={75}
 *   attended={150}
 *   total={200}
 *   newSeekers={25}
 * />
 * ```
 */
const SemiCircleChart: React.FC<SemiCircleChartProps> = ({ percentage,attended, total, newSeekers }) => {
  const remaining = 0; //use 100 - {percentage} to get remaining value
  const chartRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
   useEffect(() => {
    setTimeout(() => {
      if (chartRef.current) {
        const chart = chartRef.current as unknown;
        if (chart && chart.ctx) {
          const ctx = chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);
          const stopPoint = 1; // use percentage / 100 to get stop point value
          gradient.addColorStop(0, "rgba(76, 122, 175, 0)");
          gradient.addColorStop(stopPoint, "#1859B4");
          gradient.addColorStop(1, "#1859B4");
          chart.data.datasets[0].backgroundColor = [gradient, "#E5E5E5"];
          chart.update();
        }
      }
    }, 100); // Delay by 100ms
  }, [percentage]);
  const data = {
    datasets: [
      {
        data: [100, remaining],
        // backgroundColor: ["#4CAF50", "#E5E5E5"], // Placeholder, will be replaced by gradient
        borderWidth: 1,
        borderColor: ["transparent", "transparent"], // No outline
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "99%", // Adjust cutout for better proportion
    rotation: -90, // Starts from top
    circumference: 180, // Makes it a semi-circle
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
      shadowPlugin: false,
    },
  };

  const handleNewSeekersClick = () => {
    dispatch(setKpiType(KPI_FILTERS.TYPES.NEW_SEEKERS));
    dispatch(setTotalAudience(newSeekers));
    navigate(endPoints.analyticsSeekerDetails);
  }

  const handleAttendanceClick = () => {
    dispatch(setKpiType(KPI_FILTERS.TYPES.ATTENDED));
    dispatch(setTotalAudience(attended));
    navigate(endPoints.analyticsSeekerDetails);
  }
  const handleRegisteredClick = () => {
    dispatch(setKpiType(KPI_FILTERS.TYPES.REGISTERED));
    dispatch(setTotalAudience(total));
    navigate(endPoints.analyticsSeekerDetails);
  }
  return (
    <div className={styles.chartContainer}>
      {<div className={styles.chartContainer__wrapper}>
        <Doughnut ref={chartRef} data={data} options={options} className={styles.chartContainer__chart} />
        <div className={styles.chartContainer__text}>
          <span onClick={handleAttendanceClick}>{formatSingleDigit(percentage)}%</span> &nbsp; 
          {<span className={styles.chartContainer__newSeekers} onClick={handleNewSeekersClick}>
            <img src={greenUpArrow} alt="Green Up Arrow" className={styles.chartContainer__arrowIcon} /> 
            {formatSingleDigit(newSeekers)} new seekers
          </span>}
          <br />
          <span className={styles.chartContainer__attendedText} >
            <span onClick={handleAttendanceClick}>Attended: {formatSingleDigit((attended))} </span> out of <span onClick={handleRegisteredClick}>{formatSingleDigit(total)} registrations</span>
          </span>
        </div>
      </div>}
    </div>
  );
};

export default SemiCircleChart;