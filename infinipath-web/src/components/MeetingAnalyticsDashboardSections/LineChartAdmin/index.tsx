// Import essential Chart.js components and types
import React from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler, 
  ChartTypeRegistry, 
  Chart 
} from 'chart.js';

// Import styles and utilities
import styles from './index.module.scss';
import { formatSingleDigit } from '../../../utils/commonFunctions';

// Import types and constants
import { 
  AttendanceInsightsBase, 
  AttendedInsights, 
  OverallRegistrationData, 
  RegisteredInsights 
} from '../../MeetingAnalyticsDashboard/Analtyics.modal';
import { 
  INSIGHTS_KPI, 
  INSIGHTS_TYPES, 
  INSIGHTS_TYPES_LABELS 
} from '../../../constants';

/**
 * Custom plugin for tooltip styling
 * Adds a gradient background and custom rendering to chart tooltips
 */
const customTooltipTitleBgPlugin = {
  id: 'customTooltipTitleBg',
  afterDraw: (chart: Chart<keyof ChartTypeRegistry>) => {
    const tooltip = chart.tooltip;
    if (!tooltip || tooltip.opacity === 0 || !tooltip.title?.length) return;

    const ctx = chart.ctx;
    const { x, y, width } = tooltip;
    const padding = 8;
    const titleFontSize = tooltip.options.titleFont?.size || 16;
    const titleHeight = tooltip.title.length * titleFontSize + padding * 2;

    ctx.save();
    ctx.globalAlpha = 1;

    // Draw the title background (gradient)
    const titleGradient = ctx.createLinearGradient(x, y, x + width, y + titleHeight);
    titleGradient.addColorStop(0, '#FFFFFF');
    titleGradient.addColorStop(0.1, '#EAEFF5');
    ctx.fillStyle = titleGradient;
    ctx.fillRect(x, y, width, titleHeight);

    // Redraw the title text as it gets covered by our background
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(5, 27, 70, 1)'; // Title text color
    ctx.font = `bold ${titleFontSize}px ${tooltip.options.titleFont?.family || 'Arial'}`;
    
    // Draw the title text
    const titleText = tooltip.title[0];
    ctx.fillText(titleText, x + width / 2, y + titleHeight / 2);

    ctx.restore();
  },
};

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  customTooltipTitleBgPlugin
);

/**
 * Props interface for LineChartReusable component
 */
interface LineChartReusableProps {
  chartTitle: string;         // Title displayed above the chart
  chartType: string;         // Type of chart (registration/attendance)
  lineChartData: {          // Data structure for the line chart
    labels: string[];       // X-axis labels
    datasets: {            // Array of datasets to display
      label: string;      // Dataset label
      data: number[];    // Data points
      borderColor: string; // Line color
      backgroundColor: string; // Fill color
      fill?: boolean;    // Whether to fill area under line
    }[];
  };
  currentData: OverallRegistrationData;       // Current registration statistics
  registeredData: RegisteredInsights;         // Overall registration data
  currentRegsiteredData: AttendanceInsightsBase; // Current attendance data
  attendanceData: AttendedInsights;           // Overall attendance statistics
  selectedKPI: string;                        // Currently selected KPI filter
  setSelectedKPI: (kpi: string) => void;      // KPI selection handler
  onLabelClick: (label: string, value: number) => void; // Click handler for labels
  isDataAvailable: boolean;                   // Data availability flag
  chartRef: React.RefObject<ChartJS>;         // Reference to chart instance
  options: unknown;                           // Chart configuration options
  noDataMessage?: string;
  noDataIcon?: string; // Optional message and icon for no data
}

/**
 * LineChartReusable Component
 * A reusable line chart component that displays either registration or attendance data
 * with filtering capabilities and interactive elements
 */
const LineChartReusable: React.FC<LineChartReusableProps> = ({
  chartTitle,
  chartType,
  lineChartData,
  currentData,
  registeredData,
  currentRegsiteredData,
  attendanceData,
  selectedKPI,
  setSelectedKPI,
  onLabelClick,
  isDataAvailable,
  chartRef,
  options,
  noDataMessage,
  noDataIcon
}) => {
  return (
    <div className={styles.lineChartContainer}>
      {/* Header Section with Title and Metrics */}
      <div className={styles.chartInfo}>
        {/* Chart Title */}
        <div className={styles.chartTitle}>
          <h2 className={styles.title}>{chartTitle}</h2>
        </div>

        {/* Registration Statistics Section */}
        {chartType === INSIGHTS_TYPES.REGISTRATION && (
          <div className={styles.counts}>
            {/* Registration count metrics with click handlers */}
            <div className={`${styles.countItems} ${currentData.registrantCount == 0 ? styles.notAllow : styles.allow}`} onClick={() => onLabelClick(INSIGHTS_TYPES_LABELS.REGISTERED.value, currentData.registrantCount)}>
              <span className={styles.countLabelRegistered}>{formatSingleDigit(currentData.registrantCount)}</span>
              <span className={styles.labelTextlRegistered}>{INSIGHTS_TYPES_LABELS.REGISTERED.displayLabel}</span>
            </div>
            <div className={styles.verticalLine}></div>
            
            {/* Conditionally render Downgrades */}
            {selectedKPI !== INSIGHTS_KPI.NON_VIDEO && (
              <>
                <div className={`${styles.countItems} ${currentData.regDowngradedCount == 0 ? styles.notAllow : styles.allow}`} onClick={() => onLabelClick(INSIGHTS_TYPES_LABELS.DOWNGRADES.value, currentData.regDowngradedCount)}>
                  <span className={styles.countLabelRegistered}>{formatSingleDigit(currentData.regDowngradedCount)}</span>
                  <span className={styles.labelTextlRegistered}>{INSIGHTS_TYPES_LABELS.DOWNGRADES.displayLabel}</span>
                </div>
                <div className={styles.verticalLine}></div>
              </>
            )}
                      
            <div className={`${styles.countItems} ${currentData.regCancellationsCount == 0 ? styles.notAllow : styles.allow}`} onClick={() => onLabelClick(INSIGHTS_TYPES_LABELS.CANCELLATIONS.value, currentData.regCancellationsCount)}>
              <span className={styles.countLabelRegistered}>{formatSingleDigit(currentData.regCancellationsCount)}</span>
              <span className={styles.labelTextlRegistered}>{INSIGHTS_TYPES_LABELS.CANCELLATIONS.displayLabel}</span>
            </div>
          </div>
        )}

        {/* Attendance Statistics Section */}
        {chartType === INSIGHTS_TYPES.ATTENDEES && (
          <div className={styles.counts}>
            {/* Attendance count metrics with click handlers */}
            <div className={`${styles.countItems} ${currentRegsiteredData.attendees == 0 ? styles.notAllow : styles.allow}`} onClick={() => onLabelClick(INSIGHTS_TYPES_LABELS.ATTENDED.value, currentRegsiteredData.attendees)}>
              <span className={styles.countLabelRegistered}>{formatSingleDigit(currentRegsiteredData.attendees)}</span>
              <span className={styles.labelTextlRegistered}>{INSIGHTS_TYPES_LABELS.ATTENDED.displayLabel}</span>
            </div>
            <div className={styles.verticalLine}></div>
            <div className={`${styles.countItems} ${currentRegsiteredData.absentees == 0 ? styles.notAllow : styles.allow}`} onClick={() => onLabelClick(INSIGHTS_TYPES_LABELS.ABSENTEES.value, currentRegsiteredData.absentees)}>
              <span className={styles.countLabelRegistered}>{formatSingleDigit(currentRegsiteredData.absentees)}</span>
              <span className={styles.labelTextlRegistered}>{INSIGHTS_TYPES_LABELS.ABSENTEES.displayLabel}</span>
            </div>
            <div className={styles.verticalLine}></div>
                      
            <div className={`${styles.countItems} ${currentRegsiteredData.dropOffs == 0 ? styles.notAllow : styles.allow}`} onClick={() => onLabelClick(INSIGHTS_TYPES_LABELS.DROP_OFF.value, currentRegsiteredData.dropOffs)}>
              <span className={styles.countLabelRegistered}>{formatSingleDigit(currentRegsiteredData.dropOffs)}</span>
              <span className={styles.labelTextlRegistered}>{INSIGHTS_TYPES_LABELS.DROP_OFF.displayLabel}</span>
            </div>
            <div className={styles.verticalLine}></div>
            <div className={`${styles.countItems} ${currentRegsiteredData.rejoins == 0 ? styles.notAllow : styles.allow}`} onClick={() => onLabelClick(INSIGHTS_TYPES_LABELS.REJOIN.value, currentRegsiteredData.rejoins)}>
              <span className={styles.countLabelRegistered}>{formatSingleDigit(currentRegsiteredData.rejoins)}</span>
              <span className={styles.labelTextlRegistered}>{INSIGHTS_TYPES_LABELS.REJOIN.displayLabel}</span>
            </div>
            <div className={styles.verticalLine}></div>
            <div className={`${styles.countItems} ${currentRegsiteredData.lateComers == 0 ? styles.notAllow : styles.allow}`}onClick={() => onLabelClick(INSIGHTS_TYPES_LABELS.LATE_COMERS.value, currentRegsiteredData.lateComers)}>
              <span className={styles.countLabelRegistered}>{formatSingleDigit(currentRegsiteredData.lateComers)}</span>
              <span className={styles.labelTextlRegistered}>{INSIGHTS_TYPES_LABELS.LATE_COMERS.displayLabel}</span>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Divider */}
      <div className={styles.linehorizontalline}></div>

      {/* Chart and Filters Section */}
      <div className={isDataAvailable ? styles.lineChartDetails : styles.noDataDetails}>
        {/* Registration Filter Controls */}
        {chartType === INSIGHTS_TYPES.REGISTRATION && (
          <div className={styles.lineChartDetailsColumn}>
            {/* KPI filter buttons for registration view */}
            <button
              className={`${styles.chartButton} ${selectedKPI === INSIGHTS_KPI.ALL ? styles.selected : ''}`}
              onClick={() => setSelectedKPI(INSIGHTS_KPI.ALL)}
            >
              <span className={styles.countLabel}>{formatSingleDigit(registeredData.both?.registrantCount ?? 0)}</span> <span className={styles.countLabelRegister}>&nbsp;{INSIGHTS_KPI.ALL}</span>
            </button>
            <button
              className={`${styles.chartButton} ${selectedKPI === INSIGHTS_KPI.VIDEO ? styles.selected : ''}`}
              onClick={() => setSelectedKPI(INSIGHTS_KPI.VIDEO)}
            >
              <span className={styles.countLabel}>{formatSingleDigit(registeredData.video?.registrantCount ?? 0)}</span><span className={styles.countLabelRegister}>&nbsp;{INSIGHTS_KPI.VIDEO}</span>
            </button>
            <button
              className={`${styles.chartButton} ${selectedKPI === INSIGHTS_KPI.NON_VIDEO ? styles.selected : ''}`}
              onClick={() => setSelectedKPI(INSIGHTS_KPI.NON_VIDEO)}
            >
              <span className={styles.countLabel}>{formatSingleDigit(registeredData.nonVideo?.registrantCount ?? 0)}</span><span className={styles.countLabelRegister}>&nbsp;{INSIGHTS_KPI.NON_VIDEO}</span>
            </button>
          </div>
        )}

        {/* Attendance Filter Controls */}
        {chartType === INSIGHTS_TYPES.ATTENDEES && (
          <div className={styles.lineChartDetailsColumn}>
            {/* KPI filter buttons for attendance view */}
            <button
              className={`${styles.chartButton} ${selectedKPI === INSIGHTS_KPI.ALL ? styles.selected : ''}`}
              onClick={() => setSelectedKPI(INSIGHTS_KPI.ALL)}
            >
              <span className={styles.countLabel}>{formatSingleDigit(attendanceData.both?.attendees ?? 0)}</span> <span className={styles.countLabelRegister}>&nbsp;{INSIGHTS_KPI.ALL}</span>
            </button>
            <button
              className={`${styles.chartButton} ${selectedKPI === INSIGHTS_KPI.VIDEO ? styles.selected : ''}`}
              onClick={() => setSelectedKPI(INSIGHTS_KPI.VIDEO)}
            >
              <span className={styles.countLabel}>{formatSingleDigit(attendanceData.video?.attendees??0)}</span><span className={styles.countLabelRegister}>&nbsp;{INSIGHTS_KPI.VIDEO}</span>
            </button>
            <button
              className={`${styles.chartButton} ${selectedKPI === INSIGHTS_KPI.NON_VIDEO ? styles.selected : ''}`}
              onClick={() => setSelectedKPI(INSIGHTS_KPI.NON_VIDEO)}
            >
              <span className={styles.countLabel}>{formatSingleDigit(attendanceData.nonVideo?.attendees??0)}</span><span className={styles.countLabelRegister}>&nbsp;{INSIGHTS_KPI.NON_VIDEO}</span>
            </button>
          </div>
        )}

        {/* Chart Display Area */}
        {isDataAvailable ? (
          <div className={styles.lineChart}>
            <Line ref={chartRef} data={lineChartData} options={options} />
          </div>
        ) : (
          noDataMessage? 
          <div className={styles.noData}>
              <div className={styles.noSeekersImage}>
                <img src = {noDataIcon}/>
                <p>{noDataMessage}</p>
              </div>
          </div>
          :
          <div className={styles.noData}>No data available</div>
        )}
      </div>
    </div>
  );
};

export default LineChartReusable;