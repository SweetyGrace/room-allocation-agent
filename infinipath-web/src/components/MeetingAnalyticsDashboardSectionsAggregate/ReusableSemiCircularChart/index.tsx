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
  registrations: number;
  attended: number;
  total: number;
  newSeekers: number;
}

const SemiCircleChart: React.FC<SemiCircleChartProps> = ({ registrations,attended, total, newSeekers }) => {
  const remaining = 100 - 100;
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
          const stopPoint = 100 / 100;
          gradient.addColorStop(0, "rgba(76, 122, 175, 0)");
          gradient.addColorStop(stopPoint, "#1859B4");
          gradient.addColorStop(1, "#1859B4");
          chart.data.datasets[0].backgroundColor = [gradient, "#E5E5E5"];
          chart.update();
        }
      }
    }, 100); // Delay by 100ms
  }, [registrations]);
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

  // Handles the click event for the "New Seekers" button.
  const handleNewSeekersClick = () => {
    dispatch(setKpiType(KPI_FILTERS.TYPES.NEW_SEEKERS));
    dispatch(setTotalAudience(newSeekers));
    navigate(endPoints.aggregateSeekerDetails);
  }

  // Handles the click event for the "Avg Attendance" button.
  const handleAttendanceClick = () => {
    dispatch(setKpiType(KPI_FILTERS.TYPES.ATTENDED));
    dispatch(setTotalAudience(attended));
    navigate(endPoints.aggregateSeekerDetails);
  }
  // Handles the click event for the "Avg Registration" button.
  const handleRegisteredClick = () => {
    dispatch(setKpiType(KPI_FILTERS.TYPES.REGISTERED));
    dispatch(setTotalAudience(total));
    navigate(endPoints.aggregateSeekerDetails);
  }
  return (
    <div className={styles.chartContainer}>
      {<div className={styles.chartContainer__wrapper}>
        <Doughnut ref={chartRef} data={data} options={options} className={styles.chartContainer__chart} />
        <div className={styles.chartContainer__text}>
          <span onClick={handleAttendanceClick}>{formatSingleDigit(registrations)}%</span> &nbsp; 
          {<span className={styles.chartContainer__newSeekers} onClick={handleNewSeekersClick}>
            <img src={greenUpArrow} alt="Green Up Arrow" className={styles.chartContainer__arrowIcon} /> 
            {formatSingleDigit(newSeekers)}% new seekers
          </span>}
          <br />
          <span className={styles.chartContainer__attendedText} >
            <span onClick={handleAttendanceClick}>Avg Attendance </span> <span onClick={handleRegisteredClick}>{formatSingleDigit(total)}  out of Avg Registration</span>
          </span>
        </div>
      </div>}
    </div>
  );
};

export default SemiCircleChart;