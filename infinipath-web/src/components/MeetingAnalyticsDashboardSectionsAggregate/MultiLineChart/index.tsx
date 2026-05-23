import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import LineChartReusable from "../LineChartAdmin";
import { useNavigate } from "react-router-dom";
import { endPoints } from "../../../constants/urlConstants";
import { extractMonth, formatDateToolTip } from "../../../utils/commonFunctions";
import noDataIcon from "../../../assets/images/no-behaviour-data.svg";
import { NO_SEEKER_ENGAGEMENT_DATA } from "../../../constants";
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

interface WebinarStat {
  [date: string]: {
    webinarId: string;
    webinarStart: string;
    totalParticipantsCount: number;
    dropOffs: number;
    newJoins: number;
    lateCommers: number;
    registration: number;
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

const MultiLine = ({ webinarStats }: { webinarStats: WebinarStat[] }) => {
  const navigate = useNavigate();
  const chartRef = useRef<ChartJS<"line">>(null);

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

  // Update the data processing loop
  const monthData = processWebinarData();
  const labels: string[] = [];
  const attendance: number[] = [];
  const registrations: number[] = [];
  const dropOffs: number[] = [];
  const newJoins: number[] = [];
  const lateCommers: number[] = [];
  const tooltipLabels: string[] = [];
  const xAxisLabels: string[] = []; // Moved this here
  const monthIndices: { start: number; end: number; month: string }[] = [];

  let currentIndex = 0;
  // Remove duplicate declaration and continue with the data processing
  Object.entries(monthData).forEach(([dateStr, data]) => {
    if (data.attendance.length > 0) {
      const startIndex = currentIndex;

      // Extract just the month from the date string

      const monthOnly = extractMonth(dateStr) || "Unknown";

      // Add the actual month data points
      data.attendance.forEach((_, idx) => {
        labels.push("");
        xAxisLabels.push(monthOnly); // Only month for x-axis
        tooltipLabels.push(formatDateToolTip(data?.webinarStart[idx])); // Full date for tooltip
        attendance.push(data.attendance[idx] || 0);
        registrations.push(data.registration[idx] || 0);
        dropOffs.push(data.dropOffs[idx] || 0);
        newJoins.push(data.newJoins[idx] || 0);
        lateCommers.push(data.lateCommers[idx] || 0);
        currentIndex++;
      });

      monthIndices.push({
        start: startIndex,
        end: currentIndex - 1,
        month: monthOnly, // Only month for indicators
      });
    }
  });

  const getDatasets = () => {
    return [
      {
        type: "line",
        label: "Attendance",
        data: attendance,
        borderColor: " #2F73F1",
        backgroundColor: "transparent",
        fill: true,
        tension: 0,
        borderWidth: 2,
        pointRadius: 0,
        spanGaps: true, // Add this to connect across null/undefined values
      },
      {
        type: "line",
        label: "Registration",
        data: registrations,
        borderColor: " #67B26F",
        backgroundColor: "rgba(171, 219, 251, 0.01)",
        fill: true,
        tension: 0,
        borderWidth: 2,
        pointRadius: 0,
        spanGaps: true, // Add this to connect across null/undefined values
      },
     
      {
        type: "line",
        label: "Drop Off(s)",
        data: dropOffs,
        borderColor: " #FF7D41",
        backgroundColor: "transparent",
        fill: true,
        tension: 0,
        borderWidth: 2,
        pointRadius: 0,
        spanGaps: true, // Add this to connect across null/undefined values
      },
      {
        type: "line",
        label: "Late Comers",
        data: lateCommers,
        borderColor: "  #FBBC05",
        backgroundColor: "transparent",
        fill: true,
        tension: 0,
        borderWidth: 2,
        pointRadius: 0,
        spanGaps: true, // Add this to connect across null/undefined values
      },
      {
        type: "line",
        label: "New Join(s)",
        data: newJoins,
        borderColor: " #673AB7",
        backgroundColor: "transparent",
        fill: true,
        tension: 0,
        borderWidth: 2,
        pointRadius: 0,
        spanGaps: true, // Add this to connect across null/undefined values
      },
     
    ];
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
        xAlign: "left",
        backgroundColor: "white",
        titleColor: "rgba(5, 27, 70, 1)",
        bodyColor: "rgba(0, 0, 0, 0.87)",
        borderColor: "#ddd",
        padding: 16,
        caretSize: 0,
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 12
        },
        external: (context) => {
          const tooltip = context.tooltip;
          const chart = context.chart;
          const point = tooltip.dataPoints[0];
      
          if (point) {
            tooltip.x = point.element.x + 20;
            tooltip.y = chart.chartArea.top + 20;
          }
        },
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            if (!tooltipItems || !tooltipItems.length) return "";
            const index = tooltipItems[0].dataIndex;
            return formatDateToolTip(tooltipLabels[index]) || ""; // Format full date for tooltip
          },
          label: (context) => {
            if (!context) return "";
            const { dataset, parsed } = context;
            return `${parsed.y}% ${dataset.label}`;
          },
          labelTextColor: () => "#051b46",
        },
        filter: (tooltipItem) => {
          if (!tooltipItem || typeof tooltipItem.dataIndex === "undefined")
            return false;
          return tooltipLabels[tooltipItem.dataIndex] !== "";
        },
      },
      combinedPlugin: {
        id: "combined-plugin",
        afterDraw: (chart) => {
          drawMonthIndicators();

          const activeElements = chart.getActiveElements();
          if (activeElements?.length) {
            const activePoint = activeElements[0];
            // Only draw hover line for non-empty points
            if (tooltipLabels[activePoint.index] !== "") {
              const x = chart.scales.x.getPixelForValue(activePoint.index);
              drawVerticalHoverLine(chart, x, activePoint.index);
            }
          }
        },
      },
    },
    interaction: {
      mode: "index",
      axis: "x",
      intersect: false,
      // Add filter to ignore empty points
      filter: (element) => {
        return tooltipLabels[element.index] !== "";
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          borderDash: [10, 10],
          borderDashOffset: 0,
          color: (context) => {
            const index = context.index;
            // if (index === 0 || index === labels.length - 1) {
            //   return "transparent";
            // }
            if (tooltipLabels[index] === "") {
              return "transparent";
            }
            return "rgba(0, 0, 0, 0.1)";
          },
        },
        border: {
          dash: [5, 5],
          display: true,
        },
        ticks: {
          display: true, // Changed to true
          autoSkip: false, // Prevent automatic tick skipping
          maxRotation: 0, // Keep labels horizontal
          callback: (_, index) => {
            // Show label only at the start of each month
            const isMonthStart = monthIndices.some(
              ({ start }) => start === index,
            );
            if (isMonthStart) {
              const monthData = monthIndices.find(
                ({ start }) => start === index,
              );
              return monthData ? monthData.month : "";
            }
            return "";
          },
          padding: 8,
          color: "#666",
          font: {
            size: 12,
            weight: "500",
          },
        },
        offset: false,
        stacked: false,
        z: 1,
      },
      y: {
        beginAtZero: true,
        grace: "5%",
        border: {
          display: false,
        },
        ticks: {
          callback: (value) => `${value}%`,
          padding: 10, // Add padding
        },
        grid: {
          display: false,
          drawBorder: false, // Add this
        },
        z: 9999, // Add high z-index
      },
    },
    layout: {
      padding: {
        bottom: 50,
        top: 20, // Add some top padding to prevent tooltip cutoff
      },
    },
  };

  const drawVerticalHoverLine = (chart, x, index) => {

    // Skip if tooltip label is empty
    if (tooltipLabels[index] === "") {
      return;
    }

    const ctx = chart.ctx;
    const { top, bottom } = chart.scales.y;

    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#2F73F1";
    ctx.lineWidth = 1;
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.restore();
  };

  const drawMonthIndicators = () => {
    const chart = chartRef.current;
    if (!chart) return;

    const ctx = chart.canvas.getContext("2d");
    const { scales } = chart;

    const bottomY = scales.y.bottom + 10;
    const horizontalLineY = bottomY + 8;

    // Clear the area for month indicators
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(0, scales.y.bottom + 10, chart.width, 50);
    ctx.restore();

    monthIndices.forEach(({ start, end, month }) => {
      // Skip if month is null or undefined
      if (!month) return;
      
      const startX = scales.x.getPixelForValue(start);
      const endX = scales.x.getPixelForValue(end);
      const midX = startX + (endX - startX) / 2;

      // Draw horizontal dotted line
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = "rgba(150, 150, 150, 0.5)";
      ctx.moveTo(startX, horizontalLineY);
      ctx.lineTo(endX, horizontalLineY);
      ctx.stroke();
      ctx.restore();

      // Draw month label
      ctx.save();
      ctx.font = "12px Arial";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(
        month.charAt(0).toUpperCase() + month.slice(1).toLowerCase(),
        midX,
        horizontalLineY + 5,
      );
      ctx.restore();

      // Draw vertical strokes
      const verticalStrokeTop = bottomY - 8;
      const verticalStrokeBottom = horizontalLineY;

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = "rgba(150, 150, 150, 0.5)";
      ctx.lineWidth = 1;

      // Start vertical line
      ctx.moveTo(startX, verticalStrokeTop);
      ctx.lineTo(startX, verticalStrokeBottom);
      ctx.stroke();

      // End vertical line
      ctx.beginPath();
      ctx.moveTo(endX, verticalStrokeTop);
      ctx.lineTo(endX, verticalStrokeBottom);
      ctx.stroke();

      ctx.restore();
    });
  };

  
  // Update the useEffect with proper chart initialization check
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart?.canvas) return;

    // Register the plugin properly
    const combinedPlugin = {
      id: "combinedPlugin", // Unique ID
      afterDraw: (chart) => {
        drawMonthIndicators();

        const activeElements = chart.getActiveElements();
        if (activeElements?.length) {
          const activePoint = activeElements[0];
          const x = chart.scales.x.getPixelForValue(activePoint.index);
          drawVerticalHoverLine(chart, x, activePoint.index);
        }
      },
    };

    // Register the plugin
    ChartJS.register(combinedPlugin);

    // Add click handler with safety checks
    const handleClick = (event: MouseEvent) => {
      if (!chart.canvas) return;

      const elements = chart.getElementsAtEventForMode(
        event,
        "index",
        { intersect: false },
        true,
      );
      if (elements?.length) {
        const dataIndex = elements[0].index;
        const webinar = webinarStats[dataIndex];

        if (webinar) {
          const date = Object.keys(webinar)[0];
          const webinarId = webinar[date].webinarId;
          navigate(`${endPoints.sessionAnalytics}?sessionId=${webinarId}`);
        }
      }
    };

    // Add event listener after ensuring canvas exists
    const canvas = chart.canvas;
    canvas.addEventListener("click", handleClick);

    // Handle window resize with safety check
    const handleResize = () => {
      if (chart?.canvas) {
        chart.update();
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup with safety checks
    return () => {
      if (canvas) {
        canvas.removeEventListener("click", handleClick);
      }
      window.removeEventListener("resize", handleResize);
      ChartJS.unregister(combinedPlugin);
    };
  }, []);

  // Update the gradient effect useEffect with safety checks
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart?.canvas) return;

    const ctx = chart.ctx;
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);
    gradient.addColorStop(0.1, "#E3EFE3");
    gradient.addColorStop(0.8, "#65C466");
    gradient.addColorStop(1, "#65C466");

    if (chart.data.datasets[0]) {
      chart.data.datasets[0].borderColor = gradient;
      chart.update();
    }
  }, []);
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart?.canvas) return;

    // Create a unique ID for this chart instance
    const chartId = chart.canvas.id || "multiline-demographics-chart";

    const combinedPlugin = {
      id: `multiline-chart-plugin-${chartId}`, // Make plugin ID unique per chart
      afterDraw: (chartInstance) => {
        // Only run for this specific chart
        if (chartInstance.canvas.id !== chartId) return;

        drawMonthIndicators();

        const activeElements = chartInstance.getActiveElements();
        if (activeElements?.length) {
          const activePoint = activeElements[0];
          const x = chartInstance.scales.x.getPixelForValue(activePoint.index);
          drawVerticalHoverLine(chartInstance, x, activePoint.index);
        }
      },
    };

    // Register plugin for this instance only
    ChartJS.register(combinedPlugin);

    // Rest of your event handlers...

    return () => {
      if (chart) {
        // Unregister plugin for this instance only
        ChartJS.unregister(combinedPlugin);
      }
      // Rest of your cleanup...
    };
  }, []);
  return (
    <LineChartReusable
      chartTitle={"Seekers Engagement"}
      lineChartData={data}
      isDataAvailable={data.labels.length > 1}
      chartRef={chartRef}
      options={options}
      id="multiline-demographics-chart" // Add unique ID
      noDataIcon={noDataIcon}
      noDataMessage={NO_SEEKER_ENGAGEMENT_DATA}
    />
  );
};

export default MultiLine;
