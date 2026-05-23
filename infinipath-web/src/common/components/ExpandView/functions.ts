import { borderBottom } from "@mui/system";

/**
 * Represents the graph semantics for data visualization
 */
export interface GraphSemantics {
  type: "raw-table" | "bar" | "time-series" | "scalar" | "pie";
  x_axis?: string | null;
  y_axis?: string | null;
}

/**
 * Interface for processed chart data
 */
export interface ProcessedChartData {
  labels: string[];
  datasets: any[];
  xKey?: string;
  yKey?: string;
  timeKey?: string;
  valueKey?: string;
  xAxis: string;
  yAxis: string;
}

/**
 * Utility function to format cell values
 */
export const formatCell = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/**
 * Finds the appropriate key for X-axis data based on common patterns
 */
export const findXAxisKey = (rows: Array<Record<string, unknown>>, type: string): string => {
  const firstRowKeys = Object.keys(rows[0] || {});
  
  if (type === "time-series") {
    return firstRowKeys.find(
      (key) =>
        key.toLowerCase().includes("year") ||
        key.toLowerCase().includes("month") ||
        key.toLowerCase().includes("date") ||
        key.toLowerCase().includes("time"),
    ) || firstRowKeys[0];
  }
  
  if (type === "pie") {
    return firstRowKeys.find(
      (key) =>
        key.toLowerCase().includes("category") ||
        key.toLowerCase().includes("name") ||
        key.toLowerCase().includes("type"),
    ) || firstRowKeys[0];
  }
  
  // Default for bar charts
  return firstRowKeys.find(
    (key) =>
      key.toLowerCase().includes("year") ||
      key.toLowerCase().includes("month") ||
      key.toLowerCase().includes("category") ||
      key.toLowerCase().includes("name"),
  ) || firstRowKeys[0];
};

/**
 * Finds the appropriate key for Y-axis data based on common patterns
 */
export const findYAxisKey = (rows: Array<Record<string, unknown>>): string => {
  const firstRowKeys = Object.keys(rows[0] || {});
  
  return firstRowKeys.find(
    (key) =>
      key.toLowerCase().includes("count") ||
      key.toLowerCase().includes("total") ||
      key.toLowerCase().includes("sum") ||
      key.toLowerCase().includes("avg"),
  ) ||
  firstRowKeys[1] ||
  firstRowKeys[0];
};

/**
 * Processes raw table data for bar chart visualization
 */
export const processBarChartData = (
  rows: Array<Record<string, unknown>>,
  graphSemantics: GraphSemantics,
): ProcessedChartData => {
  const xAxis = graphSemantics.x_axis || "Category";
  const yAxis = graphSemantics.y_axis || "Value";

  const xKey = findXAxisKey(rows, "bar");
  const yKey = findYAxisKey(rows);

  const labels = rows.map((row) => formatCell(row[xKey]));
  const data = rows.map((row) => Number(row[yKey]) || 0);

  return {
    labels,
    datasets: [
      {
        label: yAxis,
        data,
        backgroundColor: "#2F73F1",
        borderColor: "#2F73F1",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
    xKey,
    yKey,
    xAxis,
    yAxis,
  };
};

/**
 * Processes raw table data for time series chart visualization
 */
export const processTimeSeriesData = (
  rows: Array<Record<string, any>>,
  graphSemantics: GraphSemantics,
): ProcessedChartData => {
  const xAxis = graphSemantics.x_axis || "Time";
  const yAxis = graphSemantics.y_axis || "Value";

  const timeKey = findXAxisKey(rows, "time-series");
  const valueKey = findYAxisKey(rows);

  const labels = rows.map((row) => formatCell(row[timeKey]));
  const data = rows.map((row) => Number(row[valueKey]) || 0);

  return {
    labels,
    datasets: [
      {
        label: yAxis,
        data,
        borderColor: "rgba(136, 132, 216, 1)",
        backgroundColor: "rgba(136, 132, 216, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgba(136, 132, 216, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
    timeKey,
    valueKey,
    xAxis,
    yAxis,
  };
};

/**
 * Processes raw table data for pie chart visualization
 */
export const processPieChartData = (
  rows: Array<Record<string, any>>,
  graphSemantics: GraphSemantics,
): ProcessedChartData => {
  const xAxis = graphSemantics.x_axis || "Category";
  const yAxis = graphSemantics.y_axis || "Value";

  const xKey = findXAxisKey(rows, "pie");
  const yKey = findYAxisKey(rows);

  return {
    labels: rows.map((row) => formatCell(row[xKey])),
    datasets: [
      {
        data: rows.map((row) => Number(row[yKey]) || 0),
        backgroundColor: [
          "#0088FE",
          "#00C49F",
          "#FFBB28",
          "#FF8042",
          "#8884D8",
          "#82CA9D",
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#96CEB4",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
    xKey,
    yKey,
    xAxis,
    yAxis,
  };
};

/**
 * Main function to process chart data based on graph semantics type
 */
export const processChartData = (
  rows: Array<Record<string, any>>,
  graphSemantics: GraphSemantics,
): ProcessedChartData | null => {
  if (!rows || rows.length === 0) return null;

  switch (graphSemantics.type) {
    case "bar":
      return processBarChartData(rows, graphSemantics);
    case "time-series":
      return processTimeSeriesData(rows, graphSemantics);
    case "pie":
      return processPieChartData(rows, graphSemantics);
    default:
      return null;
  }
};

/**
 * Chart.js options for bar charts
 */
export const getBarChartOptions = (xAxis: string, yAxis: string) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      position: "top" as const,
      labels: {
        usePointStyle: true, 
        pointStyle: 'circle',
        boxWidth: 8,
        boxHeight: 8,
        marginBottom: 20,
      }
    },
    title: {
      display: true,
      text: `${xAxis} vs ${yAxis}`,
      color: "#051B46",
      padding: {
       bottom: 20  
     },
      font: {
        size: 16,
        weight: 'normal'
      }
    },
    tooltip: {
      callbacks: {
        title: (context) => {
          // Display x-axis title and value
          return `${xAxis}: ${context[0].label}`;
        },
        label: (context) => {
          // Display y-axis title and value
          return `${yAxis}: ${context.parsed.y}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: "rgba(0, 0, 0, 0.1)",
        drawBorder: false,
      },
      ticks: {
        display: true,
      },
      border: {
        display: false,
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      border: {
        display: false,
      }
    },
  },
});

/**
 * Chart.js options for time series charts
 */
export const getTimeSeriesOptions = (xAxis: string, yAxis: string) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
    },
    title: {
      display: true,
      text: `Time Series: ${xAxis} vs ${yAxis}`,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
    x: {
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
  },
});

/**
 * Chart.js options for pie charts
 */
export const getPieChartOptions = (xAxis: string) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "right" as const,
    },
    title: {
      display: true,
      text: `Pie Chart: ${xAxis} Distribution`,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || "";
          const value = context.parsed;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0,
          );
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
});