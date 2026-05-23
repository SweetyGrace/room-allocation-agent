import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AttendedInsights } from "../../MeetingAnalyticsDashboard/Analtyics.modal";
import { setKpiType, setTotalAudience } from "../../../reducers/AnalyticsReducer";
import { endPoints } from "../../../constants/urlConstants";
import { Chart as ChartJS } from "chart.js";
import LineChartReusable from "../LineChartAdmin";
import { INSIGHTS_KPI, INSIGHTS_TYPES } from "../../../constants";
import { formatSingleDigit } from "../../../utils/commonFunctions";

const AttendanceInsightsChart = ({
  attendanceData,
  chartTitle,
}: {
  attendanceData: AttendedInsights;
  chartTitle: string;
}) => {
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<string>(INSIGHTS_KPI.ALL);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Retrieves the current attendance data based on the selected KPI (Key Performance Indicator).
   *
   * @returns {Object} An object containing attendance metrics:
   * - `attendees`: Number of attendees.
   * - `absentees`: Number of absentees.
   * - `dropOffs`: Number of participants who dropped off.
   * - `rejoins`: Number of participants who rejoined.
   * - `lateComers`: Number of participants who joined late.
   *
   * The returned data corresponds to one of the following:
   * - `INSIGHTS_KPI.VIDEO`: Returns video-related attendance data.
   * - `INSIGHTS_KPI.NON_VIDEO`: Returns non-video-related attendance data.
   * - Default: Returns combined attendance data for both video and non-video.
   *
   * If the corresponding attendance data is unavailable, default values of 0 are returned for all metrics.
   */
   const getCurrentData = () => {
    if (selectedKPI === INSIGHTS_KPI.VIDEO) {
      return attendanceData.video || { attendees: 0, absentees: 0, dropOffs: 0, rejoins: 0, lateComers: 0 };
    } else if (selectedKPI === INSIGHTS_KPI.NON_VIDEO) {
      return attendanceData.nonVideo || { attendees: 0, absentees: 0, dropOffs: 0, rejoins: 0, lateComers: 0 };
    } else {
      return attendanceData.both || { attendees: 0, absentees: 0, dropOffs: 0, rejoins: 0, lateComers: 0 };
    }
  };

  const currentData = getCurrentData();

  const originalLabels = Object.entries(currentData?.hourlyStats || {}).map(([time]) => time);
  const originalValues = originalLabels.map((time) => currentData?.hourlyStats?.[time]?.attendees || 0);
  const maxValue = Math.max(...originalValues, 0);
  const peakValue = maxValue + 10;

  const chartLabels = ["", ...originalLabels];
  const chartValues = ["", ...originalValues];

  const tooltipData = [
    [
      `Attendees: 00`,
      `Absentees: 00`,
      `Late Comers: 00`,
      `Rejoins: 00`,
      `Drop Offs: 00`,
    ],
    ...originalLabels.map((time) => {
      const stats = currentData.hourlyStats?.[time] ?? {
        attendees: 0,
        absentees: 0,
        lateComers: 0,
        rejoins: 0,
        dropOffs: 0,
      };
      return [
        `Attendees: ${formatSingleDigit(stats.attendees)}`,
        `Late Comers: ${formatSingleDigit(stats.lateComers)}`,
        `Rejoins: ${formatSingleDigit(stats.rejoins)}`,
        `Drop Offs: ${formatSingleDigit(stats.dropOffs)}`,
      ];
    }),
  ];

  const lineChartData = useMemo(() => {
    if (chartLabels.length === 1 && chartLabels[0] === "") {
      return null; // Return null if chartLabels is empty
    }
    return {
      labels: chartLabels,
      datasets: [
        {
          label: 'Attendees',
          data: chartValues,
          backgroundColor: 'rgba(171, 219, 251, 0.01)',
          fill: true,
        },
      ],
    };
  }, [chartLabels, chartValues]);

  useEffect(() => {
    getCurrentData();
  }, [selectedKPI, attendanceData]);

  // Create gradient fill on chart render
  useEffect(() => {
    const timeout = setTimeout(() => {
      const chart = chartRef.current;
      if (chart) {
        const ctx = chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);
        gradient.addColorStop(0, '#EAEBFF');
        gradient.addColorStop(1, '#2F73F1');
  
        chart.data.datasets[0].borderColor = gradient;
        chart.data.datasets[0].borderWidth = 2;
        chart.update();
      }
    }, 100); // wait 100ms for chart to render
  
    return () => clearTimeout(timeout);
  }, [lineChartData]);

  /**
   * Handles the click event on a label within the Attendance Insights Chart.
   * 
   * This function determines the KPI type based on the selected KPI and appends
   * the clicked label to it. It then dispatches actions to update the total audience
   * and KPI type in the state, and navigates to the analytics seeker details page.
   * 
   * @param label - The label of the clicked item in the chart.
   * @param value - The numerical value associated with the clicked label.
   * 
   * Dispatches:
   * - `setTotalAudience(value)`: Updates the total audience count in the state.
   * - `setKpiType(type)`: Updates the KPI type in the state.
   * 
   * Navigation:
   * - Redirects to the `analyticsSeekerDetails` endpoint.
   */
  const handleLabelClick = (label: string, value: number) => {
    const type =
      (selectedKPI === INSIGHTS_KPI.VIDEO
        ? INSIGHTS_KPI.VIDEO
        : selectedKPI === INSIGHTS_KPI.NON_VIDEO
        ? INSIGHTS_KPI.NONVIDEO
        : INSIGHTS_KPI.BOTH) + " - " + label;

    dispatch(setTotalAudience(value));
    dispatch(setKpiType(type));
    navigate(endPoints.analyticsSeekerDetails);
  };

  /**
   * Generates tooltip callback functions for a chart.
   *
   * @returns An object containing two callback functions:
   * - `title`: A function that takes an array of tooltip items and returns the title for the tooltip.
   *   - If the `dataIndex` of the first tooltip item is `0` or `undefined`, it returns `undefined`.
   *   - Otherwise, it returns the corresponding label from `chartLabels` based on the `dataIndex`.
   * - `label`: A function that takes a single tooltip item and returns the label for the tooltip.
   *   - If the `dataIndex` of the tooltip item is `0` or `undefined`, it returns `undefined`.
   *   - Otherwise, it returns the corresponding data from `tooltipData` based on the `dataIndex`.
   */
  const getTooltipCallbacks = () => {
    return {
      title: (tooltipItems: { dataIndex: number }[] = []) => {
        const index = tooltipItems?.[0]?.dataIndex;
        if (index === 0 || index === undefined) return;
        return chartLabels[index];
      },
      label: (tooltipItem: { dataIndex: number } = { dataIndex: -1 }) => {
        const index = tooltipItem?.dataIndex;
        if (index === 0 || index === undefined) return;
        return tooltipData[index];
      },
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: chartTitle,
      },
      customTooltipTitleBgPlugin: true,
      tooltip: {
        enabled: true,
        mode: "nearest" as const,
        intersect: false,
        backgroundColor: "white",
        titleAlign: "center" as const,
        titleColor: "rgba(5, 27, 70, 1)",
        bodyColor: "rgba(0, 0, 0, 0.87)",
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 14,
        },
        padding: 10,
        callbacks: getTooltipCallbacks(),
        displayColors: false,
        filter: (tooltipItem: unknown) => tooltipItem.dataIndex !== 0,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          borderDash: [10, 10],
          borderDashOffset: 0,
          color: "rgba(0, 0, 0, 0.1)",
          drawTicks: true,
          tickLength: 0,
        },
        border: {
          dash: [5, 5],
          display: true,
        },
        ticks: {
          display: true,
        },
      },
      y: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          display: false,
        },
        suggestedMax: peakValue,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  const isDataAvailable =
    chartValues.length > 0 &&
    chartValues.some((value) => typeof value === "number" && value > 0);

  return (
    <LineChartReusable
      chartTitle={chartTitle}
      chartType={INSIGHTS_TYPES.ATTENDEES}
      lineChartData={lineChartData}
      tooltipData={tooltipData}
      chartLabels={chartLabels}
      currentRegsiteredData={getCurrentData()}
      attendanceData={attendanceData}
      selectedKPI={selectedKPI}
      setSelectedKPI={setSelectedKPI}
      onLabelClick={handleLabelClick}
      isDataAvailable={isDataAvailable}
      chartRef={chartRef}
      options={options}
    />
  );
};

export default AttendanceInsightsChart;
