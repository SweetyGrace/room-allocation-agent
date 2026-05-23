// Import necessary dependencies for React, Redux, and routing
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import noDataIcon from "../../../assets/images/no-behaviour-data.svg";
// Import types and actions
import { RegisteredInsights } from "../../MeetingAnalyticsDashboard/Analtyics.modal";
import {
  setKpiType,
  setRegistrationInsights,
  setTotalAudience,
} from "../../../reducers/AnalyticsReducer";

// Import constants and utilities
import { endPoints } from "../../../constants/urlConstants";
import { INSIGHTS_KPI, INSIGHTS_TYPES, NO_REGISTRATION_INSIGHTS } from "../../../constants";
import { formatSingleDigit } from "../../../utils/commonFunctions";

// Import Chart.js and custom components
import { Chart as ChartJS } from "chart.js";
import LineChartReusable from "../LineChartAdmin";
import { RootState } from "../../../store";

/**
 * RegisteredInsightChart Component
 * Displays registration insights with filtering capabilities and interactive chart
 *
 * @param {RegisteredInsights} registeredData - Registration data to display
 * @param {string} chartTitle - Title for the chart
 */
const RegisteredInsightChart = ({
  registeredData,
  chartTitle,
  sessionId
}: {
  registeredData: RegisteredInsights;
  chartTitle: string;
  sessionId: string | null;
}) => {
  // Initialize hooks and refs
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const kpiValue = useSelector(
    (state: RootState) => state.AnalyticsReducer.registrationInsights,
  );
  const [selectedKPI, setSelectedKPI] = useState<string>(kpiValue);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Gets current registration data based on selected KPI filter
   * Returns appropriate data subset or empty data structure
   */
  const getCurrentData = () => {
    if (selectedKPI === INSIGHTS_KPI.VIDEO) {
      return (
        registeredData.video || {
          dailyStats: {},
          registrantCount: 0,
          regDowngradedCount: 0,
          regCancellationsCount: 0,
        }
      );
    } else if (selectedKPI === INSIGHTS_KPI.NON_VIDEO) {
      return (
        registeredData.nonVideo || {
          dailyStats: {},
          registrantCount: 0,
          regDowngradedCount: 0,
          regCancellationsCount: 0,
        }
      );
    } else {
      return (
        registeredData.both || {
          dailyStats: {},
          registrantCount: 0,
          regDowngradedCount: 0,
          regCancellationsCount: 0,
        }
      );
    }
  };

  const currentData = getCurrentData();

  // Process chart data
  const originalLabels = currentData?.dailyStats
    ? Object.keys(currentData.dailyStats)
    : [];
  const originalValues = originalLabels.map(
    (day) => currentData?.dailyStats?.[day]?.registrations || 0,
  );
  const maxValue = Math.max(...originalValues);
  const peakValue = maxValue + 10;

  // Prepare chart labels and values with empty first item for spacing
  const chartLabels = ["", ...originalLabels];
  const chartValues = ["", ...originalValues];

  /**
   * Prepare tooltip data with registration, downgrade, and cancellation info
   * First item is empty for alignment with chart data
   */
  const tooltipData = [
    [
      `Registrations: 00`,
      ...(selectedKPI !== INSIGHTS_KPI.NON_VIDEO ? [`Downgrades: 00`] : []),
      `Cancellations: 00`,
    ],
    ...originalLabels.map((day) => {
      const stats = currentData.dailyStats[day];
      const entries = [
        `Registrations: ${formatSingleDigit(stats.registrations)}`,
        ...(selectedKPI !== INSIGHTS_KPI.NON_VIDEO
          ? [`Downgrades: ${formatSingleDigit(stats.downgrades)}`]
          : []),
        `Cancellations: ${formatSingleDigit(stats.cancellations)}`,
      ];
      return entries;
    }),
  ];

  /**
   * Memoized chart data configuration
   * Returns null if no valid data is available
   */
  const lineChartData = useMemo(() => {
    if (chartLabels.length === 1 && chartLabels[0] === "") {
      return null; // Return null if chartLabels is empty
    }
    return {
      labels: chartLabels,
      datasets: [
        {
          label: "Registered",
          data: chartValues,
          // borderColor: 'rgba(47, 115, 241, 1)',
          backgroundColor: "rgba(171, 219, 251, 0.01)",
          fill: true,
        },
      ],
    };
  }, [chartLabels, chartValues]);

  /**
   * Effect to update current data and dispatch registration insights
   * Triggers when selected KPI or registered data changes
   */
  useEffect(() => {
    getCurrentData();
    dispatch(setRegistrationInsights(selectedKPI));
  }, [selectedKPI, registeredData]);

  /**
   * Effect to create and update gradient fill for chart
   * Sets up gradient colors and applies to chart border
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      const chart = chartRef.current;
      if (chart) {
        const ctx = chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);
        gradient.addColorStop(0, "#EAEBFF");
        gradient.addColorStop(1, "#2F73F1");

        chart.data.datasets[0].borderColor = gradient;
        chart.data.datasets[0].borderWidth = 2;
        chart.update();
      }
    }, 100); // wait 100ms for chart to render

    return () => clearTimeout(timeout);
  }, [lineChartData]);

  /**
   * Handles click events on audience labels
   * Navigates to seeker details with appropriate filters
   */
  const handleLabelClick = (label: string, value: number) => {
    const type =
      (selectedKPI === "Video"
        ? "Video"
        : selectedKPI === "Non-Video"
          ? "NonVideo"
          : "Both") +
      " - " +
      label;
    dispatch(setTotalAudience(value));
    dispatch(setKpiType(type));
    navigate(endPoints.analyticsSeekerDetails +`?sessionId=${sessionId}`);
  };

  /**
   * Configure tooltip callbacks for custom display
   * Handles title and label display in tooltips
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

  /**
   * Chart configuration options
   * Includes responsive behavior, plugins, scales, and styling
   */
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
          display: false,
        },
        ticks: {
          display: true,
          padding: -18,
          align: "end",
          font: {
            size: 10, // Adjust this value as needed
          },
          callback: (index: number) => {
            const label = chartLabels[index];
            return label ? `${label}  ` : "";
          },
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

  // Determine if valid data is available for display
  const isDataAvailable =
    chartValues.length > 0 &&
    chartValues.some((value) => typeof value === "number" && value > 0);

  return (
    <LineChartReusable
      chartTitle={chartTitle}
      chartType={INSIGHTS_TYPES.REGISTRATION}
      lineChartData={lineChartData}
      tooltipData={tooltipData}
      chartLabels={chartLabels}
      currentData={getCurrentData()}
      registeredData={registeredData}
      selectedKPI={selectedKPI}
      setSelectedKPI={setSelectedKPI}
      onLabelClick={handleLabelClick}
      isDataAvailable={isDataAvailable}
      chartRef={chartRef}
      options={options}
      noDataIcon={noDataIcon}
      noDataMessage={NO_REGISTRATION_INSIGHTS}
    />
  );
};

export default RegisteredInsightChart;
