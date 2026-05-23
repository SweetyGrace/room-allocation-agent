import React, { useRef, useEffect, useState } from "react";
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
import CommonSwitch from "../../common/components/CustomSwitch";
import { extractMonth, formatDateToolTip } from "../../utils/commonFunctions";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController, // Add BarController registration
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

interface WebinarStat {
  [date: string]: {
    totalParticipantsCount: number;
    registration: number;
    webinarStart: string;
    ageGroupPercentages: {
      AgeLessThan18: number;
      AgeBetween19And29: number;
      AgeBetween30And59: number;
      AgeGreaterThan60: number;
    };
    genderPercentages: {
      Male: number;
      Female: number;
    };
  };
}

const AttendanceChart = ({ webinarStats }: { webinarStats: WebinarStat[] }) => {
  const chartRef = useRef<ChartJS>(null);
  const [selectedTab, setSelectedTab] = useState("Age");

  const processWebinarData = () => {
    const monthData: {
      [key: string]: {
        webinarStart: string[];
        attendance: number[];
        registration: number[];
        dropOffs: number[];
        newJoins: number[];
        lateCommers: number[];
      };
    } = {};
    // Update in the processWebinarData function
    webinarStats.forEach((stat) => {
      const dateStr = Object.keys(stat)[0];

      // Format the date
      const data = stat[dateStr];
      const formattedDate = formatDateToolTip(dateStr);
      // Use the formatted date for tooltip labels
      if (!monthData[formattedDate]) {
        monthData[formattedDate] = {
          webinarStart: [],
          attendance: [],
          registration: [],
          dropOffs: [],
          newJoins: [],
          lateCommers: [],
        };
      }
      monthData[formattedDate].webinarStart.push(
        formatDateToolTip(data?.webinarStart),
      );
      monthData[formattedDate].attendance.push(data.totalParticipantsCount);
      monthData[formattedDate].registration.push(data.registration);
      monthData[formattedDate].dropOffs.push(data.dropOffs);
      monthData[formattedDate].newJoins.push(data.newJoins);
      monthData[formattedDate].lateCommers.push(data.lateCommers);
    });

    return monthData;
  };

  // Update data processing loop
  const monthData = processWebinarData();
  const labels: string[] = [];
  const attendance: number[] = [];
  const registrations: number[] = [];
  const tooltipLabels: string[] = [];
  const xAxisLabels: string[] = []; // Moved this here
  const monthIndices: { start: number; end: number; month: string }[] = [];

  let currentIndex = 0;



  // Only process months that have data
  Object.entries(monthData).forEach(([datestr, data]) => {
    if (data.attendance.length > 0) {
      // Only process months with data
      const startIndex = currentIndex;
      const monthOnly = extractMonth(datestr);

      data.attendance.forEach((att, idx) => {
        labels.push("");
        attendance.push(att);
        registrations.push(data.registration[idx] || 0);
        xAxisLabels.push(monthOnly || "Unknown"); // Only month for x-axis
        tooltipLabels.push(formatDateToolTip(data?.webinarStart[idx]));
        currentIndex++;
      });

      monthIndices.push({
        start: startIndex,
        end: currentIndex - 1,
        month: monthOnly || "Unknown",
      });
    }
  });

  const getDatasets = () => {
    const genderDatasets = [
      {
        type: "bar",
        label: "male",
        data: webinarStats.map((stat) => {
          const dateStr = Object.keys(stat)[0];
          return stat[dateStr].genderPercentages.Male;
        }),
        backgroundColor: " #9BC8FB", // Golden yellow for the fourth age group
        hoverBackgroundColor: " #2F73F1",
        borderRadius: 4,
        barThickness: 4,
        stack: "stack1",
        borderSkipped: false,
        borderWidth: 1, // Remove border width
        borderColor: "transparent", // Make border transparent
      },
      {
        type: "bar",
        label: "female",
        data: webinarStats.map((stat) => {
          const dateStr = Object.keys(stat)[0];
          return stat[dateStr].genderPercentages.Female;
        }),
        backgroundColor: " #9FDF9F",
        hoverBackgroundColor: " #65C466",
        borderRadius: 4,
        barThickness: 4,
        stack: "stack1",
        borderSkipped: false,
        borderWidth: 1, // Remove border width
        borderColor: "transparent", // Make border transparent
      },
    ];

    const ageDatasets = [
      {
        type: "bar",
        label: " <= 18",
        data: webinarStats.map((stat) => {
          const dateStr = Object.keys(stat)[0];
          return stat[dateStr].ageGroupPercentages.AgeLessThan18;
        }),
        backgroundColor: " #9BC8FB", // Golden yellow for the fourth age group
        hoverBackgroundColor: " #2F73F1",
        // Slightly darker shade for hover
        borderRadius: 4,
        barThickness: 4,
        stack: "stack1",
        borderSkipped: false,
        borderWidth: 1,
        borderColor: "transparent",
      },
      {
        type: "bar",
        label: " 19 - 29",
        data: webinarStats.map((stat) => {
          const dateStr = Object.keys(stat)[0];
          return stat[dateStr].ageGroupPercentages.AgeBetween19And29;
        }),
        backgroundColor: " #9FDF9F",
        hoverBackgroundColor: " #65C466", // Slightly darker shade for hover
        borderRadius: 4,
        barThickness: 4,
        stack: "stack1",
        borderSkipped: false,
        borderWidth: 1,
        borderColor: "transparent",
      },
      {
        type: "bar",
        label: " 30 - 59 ",
        data: webinarStats.map((stat) => {
          const dateStr = Object.keys(stat)[0];
          return stat[dateStr].ageGroupPercentages.AgeBetween30And59;
        }),
        backgroundColor: " #F6BA9F",
        hoverBackgroundColor: " #FF7D41",
        borderRadius: 4,
        barThickness: 4,
        stack: "stack1",
        borderSkipped: false,
        borderWidth: 1,
        borderColor: "transparent",
      },
      {
        type: "bar",
        label: " >= 60",
        data: webinarStats.map((stat) => {
          const dateStr = Object.keys(stat)[0];
          return stat[dateStr].ageGroupPercentages.AgeGreaterThan60;
        }),
        backgroundColor: "rgb(230, 218, 153)", // Golden yellow for the fourth age group
        hoverBackgroundColor: " #FBBC05", // Slightly darker shade for hover
        borderRadius: 4,
        barThickness: 4,
        stack: "stack1",
        borderSkipped: false,
        borderWidth: 1,
        borderColor: "transparent",
      },
    ];

    return selectedTab === "Gender" ? genderDatasets : ageDatasets;
  };

  const data = {
    labels,
    datasets: getDatasets(),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        yAlign: "bottom",
        xAlign: "right",
        backgroundColor: "white",
        titleColor: "rgba(5, 27, 70, 1)",
        bodyColor: "rgba(0, 0, 0, 0.87)",
        borderColor: "#ddd",
        padding: 16,
        caretSize: 0,
        displayColors: false,
        Position: "nearest",
        external: (context) => {
          const tooltip = context.tooltip;
          const chart = context.chart;
          const point = tooltip.dataPoints[0];

          if (point) {
            tooltip.x = point.element.x + 20;
            tooltip.y = chart.chartArea.top + 20;
          }
        },
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return tooltipLabels[index];
          },
        },
      },
      combinedPlugin: false,
    },
    interaction: {
      mode: "index",
      axis: "x",
      intersect: false,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          display: false,
        },
        offset: true,
        stacked: true,
        barPercentage: 0.8,
        categoryPercentage: 1.0,
      },
      y: {
        beginAtZero: true,
        grace: "5%",
        border: {
          display: false,
        },
        ticks: {
          callback: (value) => `${value}%`,
        },
        grid: { display: false },
      },
    },
    layout: {
      padding: {
        bottom: 50,
      },
    },
    hover: {
      mode: "index",
      intersect: false,
    },
  };

  const drawMonthIndicators = () => {
    const chart = chartRef.current;
    if (!chart) return;

    const ctx = chart.canvas.getContext("2d");
    const { scales } = chart;

    const bottomY = scales.y.bottom + 10;
    const horizontalLineY = bottomY + 8;

    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(0, scales.y.bottom + 10, chart.width, 50);
    ctx.restore();

    monthIndices.forEach(({ start, end, month }) => {
      const startX = scales.x.getPixelForValue(start);
      const endX = scales.x.getPixelForValue(end);
      const midX = startX + (endX - startX) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = "rgba(150, 150, 150, 0.5)";
      ctx.moveTo(startX, horizontalLineY);
      ctx.lineTo(endX, horizontalLineY);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.font = "12px Arial";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(month, midX, horizontalLineY + 5);
      ctx.restore();

      const verticalStrokeTop = bottomY - 8;
      const verticalStrokeBottom = horizontalLineY;

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = "rgba(150, 150, 150, 0.5)";
      ctx.lineWidth = 1;

      ctx.moveTo(startX, verticalStrokeTop);
      ctx.lineTo(startX, verticalStrokeBottom);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(endX, verticalStrokeTop);
      ctx.lineTo(endX, verticalStrokeBottom);
      ctx.stroke();

      ctx.restore();
    });
  };

  // Update the useEffect with correct plugin handling
  
  const customPlugin = {
    id: "customLabels",
    afterDraw: (chartInstance) => {
      if (chartInstance.canvas) {
        drawMonthIndicators();
      }
    },
  };

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    let isMounted = true;

    const renderMonthLabels = () => {
      if (!isMounted || !chart?.scales?.x) return;
      requestAnimationFrame(() => {
        drawMonthIndicators();
      });
    };

    const handleResize = () => {
      if (isMounted && chart?.canvas) {
        requestAnimationFrame(renderMonthLabels);
      }
    };

    const handleMouseOut = () => {
      if (isMounted && chart?.canvas) {
        requestAnimationFrame(renderMonthLabels);
      }
    };

    // Initialize with delay
    const timeoutId = setTimeout(() => {
      if (chart?.canvas) {
        chart.canvas.addEventListener("mouseout", handleMouseOut);
        window.addEventListener("resize", handleResize);
        renderMonthLabels();
      }
    }, 100);

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);

      if (chart?.canvas) {
        chart.canvas.removeEventListener("mouseout", handleMouseOut);
      }
      window.removeEventListener("resize", handleResize);
      ChartJS.unregister(customPlugin); // Unregister plugin on cleanup
    };
  }, [selectedTab]);

  return (
    <div className={styles.lineChartContainer}>
      <div className={styles.chartInfo}>
        <div className={styles.chartTitle}>
          <div className={styles.title}>Demographics insights</div>
        </div>
        <div className={styles.customLegend}>
          {selectedTab === "Gender" ? (
            <>
              <div className={styles.legendItem}>
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: "#2F73F1" }}
                ></span>
                Male
              </div>
              <div className={styles.legendItem}>
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: "#65C466" }}
                ></span>
                Female
              </div>
            </>
          ) : (
            <>
              <div className={styles.legendItem}>
                <span className={styles.colorDot} style={{ backgroundColor:" #2F73F1" }}></span>
                {"<= 18"} years
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorDot} style={{ backgroundColor: " #65C466" }}></span>
               {"19 - 29"} years
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorDot} style={{ backgroundColor: " #FF7D41" }}></span>
                {"30 - 59"} years
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorDot} style={{ backgroundColor: " #FBBC05" }}></span>
                {">= 60"} years
              </div>
            </>
          )}
          <CommonSwitch
            tabs={["Age", "Gender"]}
            selectedTab={selectedTab}
            onChange={setSelectedTab}
          />
        </div>
      </div>

      <div className={styles.linehorizontalline}></div>
      <div
        className={styles.chartWrapper}
        style={{ height: "500px", position: "relative" }}
      >
        <Chart
          ref={chartRef}
          type="bar"
          data={data}
          options={options}
          plugins={[customPlugin]} // Remove the inline plugin definition
        />
      </div>
    </div>
  );
};

export default AttendanceChart;
