import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import bulb from "../../../assets/images/bulb.svg";
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
  Chart,
} from "chart.js";
import styles from "./index.module.scss";
import {
  AttendanceInsightsBase,
  AttendedInsights,
  OverallRegistrationData,
  RegisteredInsights,
} from "../../MeetingAnalyticsDashboard/Analtyics.modal";
import CustomCheckbox from "../../../common/components/CustomCheckBox";

const customTooltipTitleBgPlugin = {
  id: "customTooltipTitleBg",
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
    const titleGradient = ctx.createLinearGradient(
      x,
      y,
      x + width,
      y + titleHeight,
    );
    titleGradient.addColorStop(0, "#FFFFFF");
    titleGradient.addColorStop(0.1, "#EAEFF5");
    ctx.fillStyle = titleGradient;
    ctx.fillRect(x, y, width, titleHeight);

    // Redraw the title text as it gets covered by our background
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(5, 27, 70, 1)"; // Title text color
    ctx.font = `bold ${titleFontSize}px ${tooltip.options.titleFont?.family || "Arial"}`;

    // Draw the title text
    const titleText = tooltip.title[0];
    ctx.fillText(titleText, x + width / 2, y + titleHeight / 2);

    ctx.restore();
  },
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  customTooltipTitleBgPlugin,
);

// Props interface for the component
interface LineChartReusableProps {
  chartTitle: string;
  chartType?: string;
  lineChartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
    }[];
  };
  currentData?: OverallRegistrationData;
  registeredData?: RegisteredInsights;
  currentRegsiteredData?: AttendanceInsightsBase;
  attendanceData?: AttendedInsights;
  selectedKPI?: string;
  setSelectedKPI?: (kpi: string) => void;
  onLabelClick?: (label: string, value: number) => void;
  isDataAvailable: boolean;
  chartRef: React.RefObject<ChartJS>;
  options: unknown;
  highestDropOff?:{[key: string]: string } | null;
  noDataMessage?: string;
  noDataIcon?: string;
}

const LineChartReusable: React.FC<LineChartReusableProps> = ({
  chartTitle,
  lineChartData,
  isDataAvailable,
  chartRef,
  options,
  highestDropOff,
  noDataMessage,
  noDataIcon,
}) => {
  const [visibleLines, setVisibleLines] = useState({
    attendance: true,
    registration: true,
    dropOffs: true,
    newJoins: true,
    lateCommers: true,
  });

  const toggleLineVisibility = (line: 'attendance' | 'registration') => {
    setVisibleLines(prev => ({
      ...prev,
      [line]: !prev[line]
    }));
  };

  // Modify your data based on visibility
  const filteredData = {
    ...lineChartData,
    datasets: lineChartData?.datasets.filter((dataset, index) => {
      if (index === 0) return visibleLines.attendance;
      if (index === 1) return visibleLines.registration;
      if (index === 2) return visibleLines.dropOffs;
      if (index === 3) return visibleLines.lateCommers;
      if (index === 4) return visibleLines.newJoins;
      return true;
    })
  };
  return (
    <div className={styles.lineChartContainer}>
      <div className={styles.chartInfo}>
        <div className={styles.chartTitle}>
          <p className={styles.title}>{chartTitle}</p>
        </div>
        { chartTitle !== "Session Engagement" ?
        <div className={styles.customLegend}>
          <div className={styles.legendItem}>
          <CustomCheckbox
                key={"attendance"}
                text={"Avg attendance"}
                checked={visibleLines.attendance}
                onChange={() => toggleLineVisibility('attendance')}
                diffStyles={true}
                colorDot = " #2F73F1"
             
              />
          </div>
          <div className={styles.legendItem}>
          <CustomCheckbox
                key={"Registrations"}
                text={"Avg registration"}
                checked={visibleLines.registration}
                onChange={() => toggleLineVisibility('registration')}
                diffStyles={true}
                colorDot = " #67B26F"
             
              />
          </div>
          <div className={styles.legendItem}>
          <CustomCheckbox
                key={"DropOffs"}
                text={"Drop off(s)"}
                checked={visibleLines.dropOffs}
                onChange={() => toggleLineVisibility('dropOffs')}
                diffStyles={true}
                colorDot = " #FF7D41"
             
              />
          </div>
          <div className={styles.legendItem}>
          <CustomCheckbox
                key={"LateComers"}
                text={"Late Comers"}
                checked={visibleLines.lateCommers}
                onChange={() => toggleLineVisibility('lateCommers')}
                diffStyles={true}
                colorDot = ' #FBBC05'
              />
          </div>
          <div className={styles.legendItem}>
          <CustomCheckbox
                key={"NewJoins"}
                text={"New joining"}
                checked={visibleLines.newJoins}
                onChange={() => toggleLineVisibility('newJoins')}
                diffStyles={true}
                colorDot = ' #673AB7'
              />
          </div>

        </div> :
        <div className={styles.dropOffPercentage}>
          {
            highestDropOff != null && highestDropOff.percentage > 0 &&
            <>
            <img src = {bulb}/>
            <span className={styles.bulbText}>Drop-off rate of {highestDropOff.percentage}% is observed between {highestDropOff.interval}</span>
            </>
          }
        </div>
      }
      </div>

      <div className={styles.linehorizontalline}></div>

      <div
        className={
          isDataAvailable ? styles.lineChartDetails : styles.noDataDetails
        }
      >
        {isDataAvailable ? (
          <div className={styles.lineChart}>
            <Line ref={chartRef} data={filteredData} options={options} />
          </div>
        ) : (
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
    </div>
  );
};

export default LineChartReusable;
