import React, { useState, useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { GridColDef } from "@mui/x-data-grid";
import styles from "./index.module.scss";
import CloseIcon from "../../../assets/images/crossIconBlue.svg";
import MicNoneIcon from "@mui/icons-material/MicNone";
import GrayLine from "../GrayLine";
import speakIcon from "../../../assets/images/speakIcon.svg";
import searchIcon from "../../../assets/images/sendIcon.svg";
import { AI_OVERLAY_STRINGS } from "../../../constants";
import starLogo from "../../../assets/images/infiniAiIcon.svg";
import speakActive from "../../../assets/images/speakActive.svg";
import AllQuestionsView from "../ListOfAllQuestions";
import { Avatar, Drawer } from "@mui/material";
import { getItemInLocalStorage } from "../../../services/localStorage";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import aiMessageIcon from "../../../assets/images/infiniAiSmallIcon.svg";
import ExpandedTableView from "../ExpandView";
import starIcon from "../../../assets/images/starIcon.svg";
import KebabMenu from "../KebabMenu/index.tsx";
import {
  formatDateInAiAnswers,
  formatDateString,
} from "../../../utils/commonFunctions.ts";
import {
  getBarChartOptions,
  getPieChartOptions,
  getTimeSeriesOptions,
  processBarChartData,
  processChartData,
  ProcessedChartData,
  processPieChartData,
  processTimeSeriesData,
} from "../ExpandView/functions.ts";
import scalarIcon from "../../../assets/images/scalarIcon.svg";
import { aiReportsEndpoints } from "../../../constants/urlConstants.ts";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

/**
 * Represents the graph semantics for data visualization
 */
interface GraphSemantics {
  type: "raw-table" | "bar" | "time-series" | "scalar" | "pie";
  x_axis?: string | null;
  y_axis?: string | null;
}

/**
 * Represents a single chat message in the overlay.
 * - `tableData` is optional and used when backend returns an array of objects.
 * - `graphSemantics` is optional and contains visualization metadata.
 * - `sessionId` and `sqlQuery` are used for paginated tables.
 * - `pagination` holds independent pagination state for each table.
 */
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  tableData?: Array<Record<string, any>>;
  graphSemantics?: GraphSemantics;
  messageType?: "user" | "AiMessage" | "apology" | "textMessage" | "noResults";
  sessionId?: string;
  sqlQuery?: string;
  pagination?: {
    page: number;
    pageSize: number;
    totalRecords: number;
    rows: Array<Record<string, any>>;
    loading: boolean;
  };
}

/**
 * Props for the AIOverlay component.
 */
interface AIOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Endpoint that accepts POST { query: string } and responds with JSON { result: any }
   */
  apiEndpoint?: string;
  programId?: string;
  /** Sub-program ID — required when mode is "room-agent" */
  subProgramId?: string | number;
  /**
   * "analytics" (default): standard JSON query/response flow.
   * "room-agent": streams SSE from the room-allocation PydanticAI agent.
   */
  mode?: "analytics" | "room-agent";
  /** Called after the room-agent stream ends so the parent can refresh data. */
  onAgentComplete?: () => void;
}

// interface ExpandedTableViewProps {
//   headers: GridColDef[];
//   seekersData: Array<Record<string, any>>;
//   totalData: number;
//   pageSize: number;
//   currentPage: number;
//   loading: boolean;
//   onClose: () => void;
//   heightToApplyonGrid: string;
//   viewType: "table" | "chart" | "time-series";
//   graphSemantics?: GraphSemantics;
//   chartData: ProcessedChartData | null;
//   // Add these new props
//   onPageChange?: (newPage: number) => void;
//   onPageSizeChange?: (newPageSize: number) => void;
//   totalRecords?: number;
// }

/**
 * Chat-like overlay for interacting with an AI endpoint.
 * Enhanced with 4 data representation types:
 * - raw-table: Standard table view
 * - bar: Bar chart visualization
 * - time-series: Time series chart
 * - scalar: Single value display
 */
const AIOverlay: React.FC<AIOverlayProps> = ({
  isOpen,
  onClose,
  apiEndpoint,
  programId,
  subProgramId,
  mode = "analytics",
  onAgentComplete,
}) => {
  // Stable session ID for this overlay instance — persists across messages
  // so the agent has full conversation context (like ChatGPT).
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  const [expandedTableSessionId, setExpandedTableSessionId] =
    useState<string>("");
  const [expandedTableSqlQuery, setExpandedTableSqlQuery] =
    useState<string>("");
  const [expandedTablePagination, setExpandedTablePagination] = useState({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
  });
  const isPaginatingRef = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  // Expanded table view state
  const [showExpandedTable, setShowExpandedTable] = useState(false);
  const [expandedTableData, setExpandedTableData] = useState<
    Array<Record<string, any>>
  >([]);
  const [expandedTableHeaders, setExpandedTableHeaders] = useState<
    GridColDef[]
  >([]);
  const [expandedViewType, setExpandedViewType] = useState<"table" | "chart">(
    "table",
  );
  const [expandedGraphSemantics, setExpandedGraphSemantics] = useState<
    GraphSemantics | undefined
  >();
  const [expandedChartData, setExpandedChartData] =
    useState<ProcessedChartData | null>(null);

  // Refs for focusing the input
  const inputRef = useRef<HTMLInputElement>(null);
  const seekerDetails = getItemInLocalStorage("seekerDetails") || {};
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Speech recognition and input focus effects
  useEffect(() => {
    if (transcript && listening) {
      setInputText(transcript);
      if (inputRef.current) {
        inputRef.current.focus();
        setTimeout(() => {
          if (inputRef.current) {
            const length = inputRef.current.value.length;
            inputRef.current.setSelectionRange(length, length);
          }
        }, 0);
      }
    }
  }, [transcript, listening]);

  // IMPROVED: Maintain focus when speech recognition starts
  useEffect(() => {
    if (listening && inputRef.current) {
      inputRef.current.focus();
      // Ensure cursor is at the end
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [listening]);

  // Update listening state
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  // Auto-focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-scroll to top when new messages arrive (since latest messages are at top)
  useEffect(() => {
    scrollToTop();
  }, [messages?.length]);

  const convertToGridColumns = (
    rows: Array<Record<string, any>>,
  ): GridColDef[] => {
    if (!rows || rows.length === 0) return [];
    const columnSet = new Set<string>();
    rows.forEach((row) =>
      Object.keys(row || {}).forEach((k) => columnSet.add(k)),
    );

    // Filter out unwanted columns
    const filteredColumns = Array.from(columnSet).filter(
      (col) =>
        col !== "profileUrl" &&
        col.toLowerCase() !== "profile url" &&
        col !== "rmComments" &&
        col !== "age" &&
        col !== "gender" &&
        col !== "location" &&
        col !== "mobileNumber",
    );

    // Function to format header names
    // const formatHeaderName = (str: string): string => {
    //   return str
    //     .replace(/[_-]/g, " ")
    //     .split(" ")
    //     .map(
    //       (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    //     )
    //     .join(" ");
    // };

    // Function to check if a string is a date in YYYY-MM-DD format
    const isDateString = (str: string): boolean => {
      return /^\d{4}-\d{2}-\d{2}$/.test(str);
    };

    const columns = filteredColumns.map((col) => ({
      field: col,
      // headerName: formatHeaderName(col),
      headerName: col,
      sortable: true,
      width: ["rmComments", "paymentStatus", "Mobile Number"].includes(col)
        ? 200
        : [
              "seekerName",
              "fullName",
              "name",
              "travelUpdatedAt",
              "Email",
              "Seeker Name",
            ].includes(col)
          ? 300
          : 130,
      renderCell: (params: any) => {
        const value = params.row[col] ?? "-";
        const baseSpanStyle: React.CSSProperties = {
          maxWidth: 300,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "inline-block",
          verticalAlign: "middle",
        };

        // Format date strings
        if (typeof value === "string" && isDateString(value)) {
          return (
            <span style={baseSpanStyle} title={formatDateInAiAnswers(value)}>
              {formatDateInAiAnswers(value)}
            </span>
          );
        }

        if (col === "travelUpdatedAt") {
          return (
            <span
              style={baseSpanStyle}
              title={typeof value === "string" ? formatDateString(value) : ""}
            >
              {value === null || value === undefined || value === ""
                ? "-"
                : formatDateString(value)}
            </span>
          );
        }
        if (col === "averageRating") {
          const avg = params.row.averageRating;
          const hasNoRating =
            avg === null ||
            avg === undefined ||
            avg === "" ||
            avg === 0 ||
            avg === "0.00";
          const hasComment =
            params.row.rmComments && params.row.rmComments !== "";
          return (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {hasNoRating ? (
                <span
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "47px",
                    height: "28px",
                  }}
                >
                  -
                </span>
              ) : (
                <>
                  <img src={starIcon} alt="star" />
                  <span>{avg}</span>
                  {hasComment && (
                    <Tooltip
                      title={
                        <p className={styles.reviewText}>
                          {params.row.rmComments
                            ? params.row.rmComments
                                .split("\n")
                                .map(
                                  (
                                    line: string,
                                    idx: number,
                                    arr: string[],
                                  ) => (
                                    <React.Fragment key={idx}>
                                      {line}
                                      {idx < arr.length - 1 && <br />}
                                    </React.Fragment>
                                  ),
                                )
                            : ""}
                        </p>
                      }
                    >
                      {/* Add your chat icon here if needed */}
                    </Tooltip>
                  )}
                </>
              )}
            </span>
          );
        }
        if (["seekerName", "fullName", "name"].includes(col)) {
          const displayName =
            typeof value === "string" && value.length > 22
              ? value.slice(0, 22) + "…"
              : value;
          return (
            <span
              style={{
                width: 300,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              title={value}
            >
              <span title={value}>{displayName}</span>
            </span>
          );
        }
        return (
          <span
            style={baseSpanStyle}
            title={typeof value === "string" ? value : ""}
          >
            {value === null || value === undefined || value === ""
              ? "-"
              : value}
          </span>
        );
      },
    }));
    // //Check if has basic details
    // const hasValue = (value: any) =>
    //   value !== undefined && value !== null && value !== "";

    // const hasBasicDetails = rows.some(
    //   (row) =>
    //     hasValue(row.age) ||
    //     hasValue(row.Age) ||
    //     hasValue(row.gender) ||
    //     hasValue(row.Gender) ||
    //     hasValue(row.location) ||
    //     hasValue(row.Location),
    // );
    // if (hasBasicDetails) {
    //   columns.splice(1, 0, {
    //     field: "basicDetails",
    //     headerName: "Basic Details",
    //     sortable: false,
    //     width: 200,
    //     renderCell: (params: any) => {
    //       const hasValue = (value: any) =>
    //         value !== undefined && value !== null && value !== "";

    //       const age = hasValue(params.row.age)
    //         ? params.row.age
    //         : hasValue(params.row.Age)
    //           ? params.row.Age
    //           : "-";

    //       const genderRaw = params.row.gender || params.row.Gender || "";
    //       const gender = genderRaw
    //         ? genderRaw.toLowerCase().startsWith("f")
    //           ? "F"
    //           : genderRaw.toLowerCase().startsWith("m")
    //             ? "M"
    //             : genderRaw.charAt(0).toUpperCase()
    //         : "-";

    //       const location = params.row.location || params.row.Location || "-";

    //       // Only render if at least one value is present
    //       if (age === "-" && gender === "-" && location === "-") return null;

    //       return (
    //         <span
    //           style={{
    //             maxWidth: 200,
    //             overflow: "hidden",
    //             textOverflow: "ellipsis",
    //             whiteSpace: "nowrap",
    //             display: "inline-block",
    //             verticalAlign: "middle",
    //           }}
    //           title={`${age} | ${gender} | ${location}`}
    //         >
    //           {age}
    //           <span className={styles.basicDetailsSeparator}>|</span>
    //           {gender}
    //           <span className={styles.basicDetailsSeparator}>|</span>
    //           {location}
    //         </span>
    //       );
    //     },
    //   });
    // }
    return columns;
  };

  const convertToExpandedTableData = (rows: Array<Record<string, any>>) => {
    return rows.map((row, index) => ({
      id: index,
      ...row,
    }));
  };

  // Function to handle expand view click
  const handleExpandView = (
    tableData: Array<Record<string, unknown>>,
    message: Message,
  ) => {
    const headers = convertToGridColumns(tableData);
    const data = convertToExpandedTableData(tableData);

    // Determine view type based on graph semantics
    const viewType =
      message.graphSemantics?.type === "raw-table"
        ? "table"
        : message?.graphSemantics?.type === "time-series"
          ? "time-series"
          : "chart";

    // Process chart data for expanded view if it's a chart type
    let processedChartData: ProcessedChartData | null = null;
    if (
      message.graphSemantics &&
      message.graphSemantics.type !== "raw-table" &&
      message.graphSemantics.type !== "scalar"
    ) {
      processedChartData = processChartData(tableData, message.graphSemantics);
    }

    // Get pagination details from message
    const pagination = message.pagination;

    setExpandedTableHeaders(headers);
    setExpandedTableData(data);
    setExpandedViewType(viewType);
    setExpandedGraphSemantics(message.graphSemantics);
    setExpandedChartData(processedChartData);
    setShowExpandedTable(true);

    // Store sessionId and sqlQuery for pagination handling
    if (message.sessionId && message.sqlQuery) {
      setExpandedTableSessionId(message.sessionId);
      setExpandedTableSqlQuery(message.sqlQuery);
    }

    // Pass pagination data
    setExpandedTablePagination({
      page: pagination?.page,
      pageSize: pagination?.pageSize,
      totalRecords: pagination?.totalRecords,
    });
  };

  // Function to close expanded table view
  const handleCloseExpandedTable = () => {
    setShowExpandedTable(false);
    setExpandedTableData([]);
    setExpandedTableHeaders([]);
    setExpandedChartData(null); // Add this line
    setExpandedTableSessionId("");
    setExpandedTableSqlQuery("");
    setExpandedTablePagination({
      page: 1,
      pageSize: 10,
      totalRecords: 0,
    });
  };

  // IMPROVED: Enhanced toggle listening function
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setInputText(""); // Clear input when starting fresh recognition

      // Focus input before starting recognition
      if (inputRef.current) {
        inputRef.current.focus();
      }

      SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
        interimResults: true, // Show interim results for real-time feedback
      });
    }
  };

  // IMPROVED: Better key press handling for speech recognition
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      // If currently listening, stop and send current content
      if (listening) {
        SpeechRecognition.stopListening();
        // Small delay to ensure transcript is captured
        setTimeout(() => {
          handleSendMessage();
        }, 100);
      } else {
        handleSendMessage();
      }
    }
  };

  // IMPROVED: Prevent input from losing focus during speech recognition
  const handleInputBlur = () => {
    // If we're listening, immediately refocus the input
    if (listening && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current && listening) {
          inputRef.current.focus();
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      }, 0);
    }
  };

  const formatCell = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);

    const stringValue = String(value);
    // Check if the value looks like a date
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(stringValue) ||
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(
        stringValue,
      )
    ) {
      return formatDateInAiAnswers(stringValue);
    } else {
      return stringValue;
    }
  };

  /**
   * Extracts readable text from non-array object results.
   * - Prioritizes common keys like 'message' or 'error'
   * - Otherwise concatenates string values
   */
  const extractTextFromObject = (obj: Record<string, any>): string => {
    if (!obj || typeof obj !== "object") return "";
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    const stringValues = Object.values(obj).filter(
      (v) => typeof v === "string",
    ) as string[];
    if (stringValues.length) return stringValues.join("\n");
    return JSON.stringify(obj, null, 2);
  };

  const stopSpeechRecognition = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    }
  };

  const scrollToTop = () => {
    const messagesContainer = document.querySelector(
      `.${styles.messagesContainer}`,
    );
    if (messagesContainer) {
      messagesContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  /**
   * Renders a raw table from an array of objects.
   * - Columns are union of keys across all rows (order: first-seen).
   */
  const renderRawTable = (message: Message) => {
    const pagination = message.pagination || {
      page: 1,
      pageSize: 10,
      totalRecords: message.tableData?.length || 0,
      rows: message.tableData || [],
      loading: false,
    };
    const { page, pageSize, totalRecords, rows, loading } = pagination;
    const columnSet = new Set<string>();
    rows.forEach((row) =>
      Object.keys(row || {}).forEach((k) => columnSet.add(k)),
    );
    const columns = Array.from(columnSet);
    const totalPages = Math.ceil(totalRecords / pageSize);

    return (
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col}>{formatCell(row?.[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Conditionally render pagination footer only if totalRecords > 10 */}
        {totalRecords > 10 && (
          <div
            className={styles.paginationFooter}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <div>
              Page {page} of {totalPages}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  if (message.sessionId && message.sqlQuery && page > 1) {
                    handlePaginateTable(
                      message.sessionId,
                      message.sqlQuery,
                      page - 1,
                      pageSize,
                    );
                  }
                }}
                disabled={page <= 1 || loading}
              >
                &lt;
              </button>
              <button
                onClick={() => {
                  if (
                    message.sessionId &&
                    message.sqlQuery &&
                    page < totalPages
                  ) {
                    handlePaginateTable(
                      message.sessionId,
                      message.sqlQuery,
                      page + 1,
                      pageSize,
                    );
                  }
                }}
                disabled={page >= totalPages || loading}
              >
                &gt;
              </button>
              {/* <select
                value={pageSize}
                onChange={(e) => {
                  if (message.sessionId && message.sqlQuery) {
                    handlePaginateTable(
                      message.sessionId,
                      message.sqlQuery,
                      1,
                      Number(e.target.value),
                    );
                  }
                }}
                disabled={loading}
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select> */}
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renders a bar chart visualization using Chart.js.
   * - Uses x_axis and y_axis from graph_semantics if available
   */
  const renderBarChart = (
    rows: Array<Record<string, unknown>>,
    graphSemantics: GraphSemantics,
  ) => {
    const chartData = processBarChartData(rows, graphSemantics);
    const maxY = Math.max(...chartData.datasets[0].data, 0);
    const baseOptions = getBarChartOptions(chartData.xAxis, chartData.yAxis);

    const options = {
      ...baseOptions,
      scales: {
        ...baseOptions.scales, // Preserve existing scale configuration
        x: {
          ...baseOptions.scales?.x,
          display: true,
          title: {
            display: true,
            text: chartData.xAxis || "X Axis",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        y: {
          ...baseOptions.scales?.y,
          display: true,
          beginAtZero: true,
          max: maxY < 5 ? 5 : maxY + 1,
          title: {
            display: true,
            text: chartData.yAxis || "Y Axis",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          ticks: {
            stepSize: 1,
            callback: (value: number) => {
              return Number.isFinite(value) ? Math.round(value) : value;
            },
          },
        },
      },
    };

    return (
      <div>
        <div className={styles.chartWrapper}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    );
  };

  /**
   * Renders a time series chart using Chart.js.
   * - Assumes x-axis contains time-related data
   */
  const renderTimeSeries = (
    rows: Array<Record<string, any>>,
    graphSemantics: GraphSemantics,
  ) => {
    const chartData = processTimeSeriesData(rows, graphSemantics);
    const options = getTimeSeriesOptions(chartData.xAxis, chartData.yAxis);

    return (
      <div className={styles.chartWrapper}>
        <div style={{ height: "300px" }}>
          <Line data={chartData} options={options} />
        </div>
      </div>
    );
  };

  /**
   * Renders a pie chart for categorical data using Chart.js.
   * - Useful for showing distributions
   */
  const renderPieChart = (
    rows: Array<Record<string, any>>,
    graphSemantics: GraphSemantics,
  ) => {
    const chartData = processPieChartData(rows, graphSemantics);
    const options = getPieChartOptions(chartData.xAxis);

    return (
      <div className={styles.chartWrapper}>
        <div style={{ height: "300px" }}>
          <Pie data={chartData} options={options} />
        </div>
      </div>
    );
  };

  /**
   * Renders a scalar value (single number/result).
   * - Typically used for averages, totals, etc.
   */
  const renderScalar = (rows: Array<Record<string, unknown>>) => {
    if (!rows[0]) {
      return (
        <div className={styles.scalarWrapper}>
          <div className={styles.scalarValue}>No data</div>
        </div>
      );
    }

    const data = rows[0];
    const entries = Object.entries(data);

    return (
      <div className={styles.scalarWrapper}>
        {entries.map(([key, value]) => (
          <div key={key} className={styles.scalarItem}>
            <img src={scalarIcon} alt="scalar icon" />
            <div className={styles.scalarCountText}>
              <div className={styles.scalarValue}>{formatCell(value)}</div>
              <div className={styles.scalarLabel}>
                {(() => {
                  const formatted = key.replace(/_/g, " ");
                  return (
                    formatted.charAt(0).toUpperCase() +
                    formatted.slice(1).toLowerCase()
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Renders the appropriate visualization based on graph semantics.
   */
  const renderVisualization = (message: Message) => {
    if (!message.tableData || !message.graphSemantics) return message.text;
    switch (message.graphSemantics.type) {
      case "raw-table":
        return renderRawTable(message);
      case "bar":
        return renderBarChart(message.tableData, message.graphSemantics);
      case "time-series":
        return renderTimeSeries(message.tableData, message.graphSemantics);
      case "scalar":
        return renderScalar(message.tableData);
      case "pie":
        return renderPieChart(message.tableData, message.graphSemantics);
      default:
        return renderRawTable(message);
    }
  };

  const getMessageContentClass = (message: Message) => {
    // For user messages
    if (message.isUser) {
      return styles.messageContent;
    }

    // For AI messages, check the message type
    switch (message.messageType) {
      case "apology":
        return styles.apologyText;
      case "textMessage":
        return styles.textMessageContent;
      case "noResults":
        return styles.textMessageContent;
      case "AiMessage":
        return styles.aiMessageContent;
      default:
        return styles.aiMessageContent;
    }
  };

  /**
   * Sends the user query to the backend and appends the AI response.
   * - Now categorizes data into 4 types based on graph_semantics
   * - Supports raw-table, bar, time-series, and scalar visualizations
   */
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    stopSpeechRecognition();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      messageType: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    resetTranscript();

    try {
      // ── Room-agent SSE streaming path ──────────────────────────────────────
      if (mode === "room-agent") {
        if (!apiEndpoint || apiEndpoint === "undefined") {
          console.error("REACT_APP_ROOM_AGENT_URL is not set — restart the dev server after editing .env");
          throw new Error("Room agent URL is not configured. Please restart the dev server.");
        }
        const authToken = getItemInLocalStorage("idToken") || "";
        const streamResponse = await fetch(
          `${apiEndpoint}/agent/room-allocation/query`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: userMessage.text,
              program_id: Number(programId),
              sub_program_id: Number(subProgramId),
              auth_token: authToken,
              session_id: sessionIdRef.current,
            }),
          },
        );

        if (!streamResponse.ok || !streamResponse.body) {
          throw new Error("Room agent request failed");
        }

        // Create a placeholder message that we'll append tokens into
        const streamMsgId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: streamMsgId,
            text: "",
            isUser: false,
            timestamp: new Date(),
            messageType: "textMessage",
          },
        ]);

        const reader = streamResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep any incomplete trailing line in the buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const token = line.slice(6); // strip "data: "
            if (token === "[DONE]") {
              onAgentComplete?.();
              return;
            }
            if (token) {
              // Decode escaped newlines the server sends to keep SSE on one line
              const decoded = token.replace(/\\n/g, "\n");
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === streamMsgId
                    ? { ...msg, text: msg.text + decoded }
                    : msg,
                ),
              );
            }
          }
        }

        // Flush any remaining buffer content
        if (buffer.startsWith("data: ")) {
          const token = buffer.slice(6);
          if (token && token !== "[DONE]") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamMsgId
                  ? { ...msg, text: msg.text + token }
                  : msg,
              ),
            );
          }
        }
        onAgentComplete?.();
        return;
      }
      // ── End room-agent path ────────────────────────────────────────────────

      const response = await fetch(apiEndpoint + aiReportsEndpoints.query, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify({
          query: userMessage.text,
          invalidate_cache: false,
          user: {
            user_id: JSON.stringify(seekerDetails?.id),
            role: seekerDetails?.role,
            name: seekerDetails?.fullName,
            program_id: programId,
          },
        }),
      });
      if (!response.ok) {
        if (response?.status === 503) {
          throw { code: "MODEL_OVERLOADED" };
        } else {
          throw new Error("Failed to send message");
        }
      }
      // Expecting JSON with result and response.graph_semantics
      const data = await response.json();
      // // For debugging; consider removing in production

      const result = data?.result;
      const graphSemantics = data?.response?.graph_semantics;
      const errorMessage = data?.response?.error_message;
      const sessionId = data?.session_id;
      const sqlQuery = data?.response?.sql_query;
      const totalRecords = data?.pagination?.total_records;

      // Check for error in result first
      if (result && typeof result === "object" && result.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: result.error,
            isUser: false,
            timestamp: new Date(),
            messageType: "apology",
          },
        ]);
      } else if (
        Array.isArray(result) &&
        result.length > 0 &&
        typeof result[0] === "object" &&
        result[0] !== null &&
        graphSemantics?.type === "raw-table" &&
        sessionId &&
        sqlQuery
      ) {
        const messageId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: messageId,
            text: `Showing ${totalRecords} result${totalRecords > 1 ? "s" : ""} as ${graphSemantics?.type || "raw-table"}.`,
            isUser: false,
            timestamp: new Date(),
            tableData: [],
            graphSemantics,
            messageType: "normal",
            sessionId,
            sqlQuery,
            pagination: {
              page: 1,
              pageSize: 10,
              totalRecords,
              rows: result.slice(0, 10), // Use initial result for first page
              loading: false,
            },
          },
        ]);
        // Do NOT call fetchPaginatedDataForMessage for the first page
      } else if (
        Array.isArray(result) &&
        result.length > 0 &&
        typeof result[0] === "object" &&
        result[0] !== null
      ) {
        // Non-paginated table
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Showing ${result.length} result${result.length > 1 ? "s" : ""} as ${graphSemantics?.type || "raw-table"}.`,
          isUser: false,
          timestamp: new Date(),
          tableData: result,
          graphSemantics: graphSemantics,
          messageType: "normal",
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Check if this is a simple text message
        let resultText: string;
        let messageType: "textMessage" | "AiMessage" = "AiMessage"; // Default to AiMessage

        if (typeof result === "string") {
          resultText = result;

          // CONDITION: Set messageType to 'textMessage' if:
          // 1. result is a string AND
          // 2. response.error_message exists AND equals the result
          if (errorMessage && errorMessage === result) {
            messageType = "textMessage";
          }
        } else if (Array.isArray(result)) {
          // Array of primitives or empty array
          if (result.length === 0) {
            resultText = "No result found.";
            messageType = "noResults";
          } else {
            resultText = result
              .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
              .join("\n");
          }
        } else if (result && typeof result === "object") {
          resultText = extractTextFromObject(result);
        } else if (result !== undefined) {
          resultText = String(result);
        } else {
          resultText = "No result found.";
          messageType = "noResults";
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: resultText,
          isUser: false,
          timestamp: new Date(),
          messageType: messageType,
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.log(error, "Error");
      if (error?.code === "MODEL_OVERLOADED") {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            text: "The assistant is over loaded by the questions. Please try again later.",
            isUser: false,
            timestamp: new Date(),
            messageType: "apology",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            text: "Sorry, something went wrong while contacting the assistant.",
            isUser: false,
            timestamp: new Date(),
            messageType: "apology",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      // Refocus input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Fetch paginated data for a specific message (table)
  const fetchPaginatedDataForMessage = async (
    messageId: string,
    sessionId: string,
    sqlQuery: string,
    page: number,
    pageSize: number,
  ) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              pagination: {
                ...msg.pagination,
                loading: true,
              },
            }
          : msg,
      ),
    );
    const offset = (page - 1) * pageSize;
    try {
      const response = await fetch(apiEndpoint + aiReportsEndpoints.paginate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          sql_query: sqlQuery,
          limit: pageSize,
          offset,
        }),
      });
      const data = await response.json();
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                pagination: {
                  page,
                  pageSize,
                  // Use the previous totalRecords if the API does not return a valid value
                  totalRecords:
                    typeof data.total_records === "number" &&
                    data.total_records > 0
                      ? data.total_records
                      : msg.pagination?.totalRecords || 0,
                  rows: data.result || [],
                  loading: false,
                },
              }
            : msg,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                pagination: {
                  ...msg.pagination,
                  loading: false,
                },
              }
            : msg,
        ),
      );
    }
  };

  // Helper: Check if we need to fetch from API (only if page/size/total changes)
  const shouldFetchPaginatedData = (
    msg: Message,
    page: number,
    pageSize: number,
  ) => {
    if (!msg.pagination) return false;
    return msg.pagination.page !== page || msg.pagination.pageSize !== pageSize;
  };

  // Modified pagination handler for raw-table messages
  const handlePaginateTable = (
    sessionId: string,
    sqlQuery: string,
    page: number,
    pageSize: number,
  ) => {
    isPaginatingRef.current = true;
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.sessionId === sessionId) {
          // Only fetch if page or pageSize changed
          if (shouldFetchPaginatedData(msg, page, pageSize)) {
            fetchPaginatedDataForMessage(
              msg.id,
              sessionId,
              sqlQuery,
              page,
              pageSize,
            );
            // Set loading true and update page/pageSize immediately for UI feedback
            return {
              ...msg,
              pagination: {
                ...msg.pagination,
                page,
                pageSize,
                loading: true,
              },
            };
          }
        }
        return msg;
      }),
    );
  };

  const handleQuestionClick = (question: string) => {
    setInputText(question);
    setShowAllQuestions(false);
    stopSpeechRecognition();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  const handleClose = () => {
    setInputText("");
    stopSpeechRecognition();
    // Clear server-side session history and rotate to a fresh session ID
    if (apiEndpoint && mode === "room-agent") {
      fetch(`${apiEndpoint}/agent/room-allocation/session/${sessionIdRef.current}`, {
        method: "DELETE",
      }).catch(() => {});
    }
    sessionIdRef.current = crypto.randomUUID();
    setMessages([]);
    onClose();
  };
  if (!isOpen) return null;

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className={styles.overlay}>
        <div className={styles.overlayContent}>
          <div className={styles.header}>
            <h3>{AI_OVERLAY_STRINGS.HEADER_TITLE}</h3>
            <img
              src={CloseIcon}
              alt="Close"
              className={styles.closeIcon}
              onClick={onClose}
            />
          </div>
          <div className={styles.errorMessage}>
            <p>{AI_OVERLAY_STRINGS.ERROR_MESSAGES}</p>
          </div>
        </div>
      </div>
    );
  }

  const seekerProfile = (
    <div>
      <Avatar
        alt="seeker profile"
        src={
          seekerDetails?.profileUrl?.length > 0
            ? `${seekerDetails?.profileUrl}`
            : defaultProfileIcon
        }
        sx={{
          width: 32,
          height: 32,
          border: "1px solid #DDDDDD",
        }}
        data-testid="profile-avatar"
      />
    </div>
  );

  const handleExpandedTablePageChange = async (newPage: number) => {
    if (!expandedTableSessionId || !expandedTableSqlQuery) return;

    setExpandedTablePagination((prev) => ({
      ...prev,
      page: newPage,
    }));

    // Fetch new data for the expanded view
    try {
      const response = await fetch(apiEndpoint + aiReportsEndpoints.paginate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: expandedTableSessionId,
          sql_query: expandedTableSqlQuery,
          limit: expandedTablePagination.pageSize,
          offset: (newPage - 1) * expandedTablePagination.pageSize,
        }),
      });

      const data = await response.json();
      if (data.result) {
        setExpandedTableData(convertToExpandedTableData(data.result));
      }
    } catch (error) {
      console.error("Failed to fetch paginated data:", error);
    }
  };

  const handleExpandedTablePageSizeChange = async (newPageSize: number) => {
    if (!expandedTableSessionId || !expandedTableSqlQuery) return;

    setExpandedTablePagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      page: 1, // Reset to first page when changing page size
    }));

    // Fetch new data with new page size
    try {
      const response = await fetch(apiEndpoint + aiReportsEndpoints.paginate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: expandedTableSessionId,
          sql_query: expandedTableSqlQuery,
          limit: newPageSize,
          offset: 0,
        }),
      });

      const data = await response.json();
      if (data.result) {
        setExpandedTableData(convertToExpandedTableData(data.result));
      }
    } catch (error) {
      console.error("Failed to fetch paginated data:", error);
    }
  };

  return (
    <>
      <Drawer anchor="right" open={isOpen} onClose={onClose}>
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            {showAllQuestions ? (
              <AllQuestionsView
                onBack={() => setShowAllQuestions(false)}
                onQuestionClick={handleQuestionClick}
              />
            ) : (
              <>
                <div className={styles.header}>
                  <div className={styles.headerTitle}>
                    {AI_OVERLAY_STRINGS.HEADER_TITLE}
                  </div>
                  <GrayLine />
                  <img
                    src={CloseIcon}
                    alt="Close"
                    onClick={handleClose}
                    className={styles.closeIcon}
                  />
                </div>
                <div className={styles.headerContent}>
                  <div className={styles.searchContainer}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onBlur={handleInputBlur} // Prevent losing focus while listening
                      placeholder={AI_OVERLAY_STRINGS.PLACEHOLDER}
                      className={styles.searchInput}
                      disabled={isLoading}
                      autoComplete="off"
                      spellCheck={false} // Disable spellcheck for better performance during speech
                    />
                    <img
                      src={listening ? speakActive : speakIcon}
                      alt={AI_OVERLAY_STRINGS.SPEAK_ALT}
                      onClick={toggleListening}
                      style={{
                        cursor: "pointer",
                        opacity: isLoading ? 0.5 : 1,
                        pointerEvents: isLoading ? "none" : "auto",
                      }}
                    />
                    <img
                      src={searchIcon}
                      alt={AI_OVERLAY_STRINGS.SEARCH_ALT}
                      onClick={handleSendMessage}
                      style={{
                        cursor: "pointer",
                        opacity: isLoading || !inputText.trim() ? 0.5 : 1,
                        pointerEvents:
                          isLoading || !inputText.trim() ? "none" : "auto",
                      }}
                    />
                  </div>
                  <div className={styles.welcomeMessage}>
                    <span>
                      {AI_OVERLAY_STRINGS.WELCOME_MESSAGE}
                      <span
                        className={styles.viewAllQuestions}
                        onClick={() => setShowAllQuestions(true)}
                      >
                        {AI_OVERLAY_STRINGS.VIEW_ALL_QUESTIONS}
                      </span>
                    </span>
                  </div>
                </div>

                {/* IMPROVED: Enhanced listening indicator with real-time feedback */}
                {isListening && (
                  <div className={styles.listeningIndicator}>
                    <span>{AI_OVERLAY_STRINGS.LISTENING_MESSAGE}</span>
                  </div>
                )}

                <div className={styles.messagesContainer}>
                  {isLoading && (
                    <div className={styles.message}>
                      <div className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}

                  {messages
                    .slice()
                    .reverse()
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`${styles.message} ${
                          message.isUser ? styles.userMessage : styles.aiMessage
                        }`}
                      >
                        {!message.isUser && (
                          <div className={styles.messageAvatar}>
                            <img
                              src={aiMessageIcon}
                              alt="AI Assistant"
                              className={styles.aiAvatar}
                            />
                          </div>
                        )}
                        {message.isUser && (
                          <div className={styles.messageAvatar}>
                            {seekerProfile}
                          </div>
                        )}
                        <div className={styles.messageBody}>
                          <div className={getMessageContentClass(message)} style={!message.isUser ? { whiteSpace: "pre-wrap" } : undefined}>
                            {message.tableData && message.graphSemantics
                              ? renderVisualization(message)
                              : message.text}
                          </div>
                          <div className={styles.messageTimestamp}>
                            {message.timestamp.toLocaleTimeString()}
                            {message.tableData &&
                              message.graphSemantics?.type !== "scalar" && (
                                <div
                                  className={styles.expandText}
                                  onClick={() =>
                                    handleExpandView(
                                      // Use pagination.rows for paginated raw-table, else tableData
                                      message.graphSemantics?.type ===
                                        "raw-table" && message.pagination
                                        ? message.pagination.rows
                                        : message.tableData!,
                                      message,
                                    )
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  expand view
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {messages.length === 0 && (
                    <div className={styles.centeredContent}>
                      <img src={starLogo} alt="ai open start logo" />
                      <span className={styles.headerTitle}>
                        {AI_OVERLAY_STRINGS.ASK_TITLE}
                      </span>
                      <span>{AI_OVERLAY_STRINGS.ASK_DESCRIPTION}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Drawer>

      {/* Expanded Table View Component */}
      {showExpandedTable && (
        <ExpandedTableView
          headers={expandedTableHeaders}
          seekersData={expandedTableData}
          totalData={expandedTableData.length}
          pageSize={expandedTablePagination.pageSize}
          currentPage={expandedTablePagination.page}
          loading={false}
          onClose={handleCloseExpandedTable}
          heightToApplyonGrid="calc(100vh - 180px)"
          viewType={expandedViewType}
          graphSemantics={expandedGraphSemantics}
          chartData={expandedChartData}
          onPageChange={handleExpandedTablePageChange}
          onPageSizeChange={handleExpandedTablePageSizeChange}
          totalRecords={expandedTablePagination.totalRecords}
        />
      )}
    </>
  );
};

export default AIOverlay;
