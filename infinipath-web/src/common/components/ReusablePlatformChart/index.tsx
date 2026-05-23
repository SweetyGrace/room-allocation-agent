// Import styling
import styles from "./index.module.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/**
 * Interface for horizontal chart props
 * @property {Array} data - Array of objects containing name and value pairs
 * @property {string} title - Title of the chart
 */
interface ReusableHorizontalChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
  handleClick: (label: string, value: string) => void;
  fromAggregate?: boolean;
}

/**
 * Custom label generator for bar chart
 * Creates clickable labels with value and name display
 * 
 * @param data - Chart data array
 * @param title - Chart title used to determine click behavior
 * @returns Function that generates custom label components
 */
 // eslint-disable-next-line react/display-name
const getCustomLabel = (data: unknown[], title: string, handleClick: (label: string, value: string) => void, fromAggregate: boolean) => (props: unknown) => {
  const { x, y, width, value, index } = props;
  const label = data[index]?.name;
  
  return (
    <g onClick={() => handleClick(label, value)} style={{ cursor: 'pointer' }}>
      <text x={x + width + 10} y={y + 5} fontSize={14}>
        <tspan 
          fill="#051B46"
          fontSize="24px"
          fontWeight="400"
        >
          {value}{fromAggregate? "%": ""}
        </tspan>{' '}
        <tspan  
          fill="#051B46"
          fontSize="14"
          fontWeight="400"
        >
          {label}
        </tspan>
      </text>
    </g>
  );
};

/**
 * ReusablePlatformChart Component
 * Renders a horizontal bar chart with gradient bars and custom labels
 * Supports platform usage and age distribution visualization
 */
export const ReusablePlatformChart: React.FC<ReusableHorizontalChartProps> = ({
  data,
  title,
  handleClick,
  fromAggregate,
}) => {
  // Calculate maximum value for chart scaling
const maxValue = Math.max(...data.map((d) => d.value)) || 100;
  return (
    <div className={styles.barlinecontainer}>
      {/* Chart Title */}
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.barhorizontalline}></div>

      {/* Render chart if data exists, otherwise show no data message */}
      <div className={styles.barlineChart}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical">
              {/* Define gradient for bars */}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EAEBFF" />
                  <stop offset="100%" stopColor="#2F73F1" />
                </linearGradient>
              </defs>

              {/* Chart Configuration */}
              <CartesianGrid stroke="none" />
              <XAxis type="number" domain={[0, maxValue * 1.25]} hide />
              <YAxis dataKey="name" type="category" hide />

              {/* Bar Configuration */}
              <Bar
                dataKey="value"
                fill="url(#barGradient)"
                barSize={3}
                radius={[10, 10, 10, 10]}
                label={getCustomLabel(data, title, handleClick, fromAggregate)}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noData}>
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};
