import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { DEFAULT_BORDER_WIDTH, DEFAULT_COLOR, STACKED_STACK_ID } from "../../../constants/textConstants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const SINGLE_DATASET_LENGTH = 1;
const MULTIPLE_COLORS_MIN_LENGTH = 1;
const FIRST_INDEX = 0;
const DEFAULT_BORDER_RADIUS = 4;


const BarChart = ({
  labels,
  datasets,
  colors = [],
  stacked = false,
  barThickness = 7,
  showLegend = false,
  legendPosition = "top",
  showTooltip = true,
  horizontal = false,
  onBarClick = () => {},
  includeAllGenders = false, // New prop
  isClick = true, // New prop to enable/disable click 
}) => {
  // const chartData = {
  //   labels,
  //   datasets: datasets.map((ds, index) =>
  //      ({
  //     ...ds,
  //     backgroundColor: 
  //       Array.isArray(colors) && colors.length === ds.data.length
  //         ? colors
  //         : colors[index] || "#3B82F6",
  //     barThickness,
  //     borderRadius: 4,
  //     stack: stacked ? "default" : undefined,
  //   }
  // )),
  // };

const chartData = {
  labels,
  datasets: datasets.map((dataset, index) => {
    const isSingleDataset = datasets.length === SINGLE_DATASET_LENGTH;
    const hasMultipleColors = Array.isArray(colors) && colors.length > MULTIPLE_COLORS_MIN_LENGTH;
    const hasMultipleDataPoints = dataset.data && dataset.data.length > MULTIPLE_COLORS_MIN_LENGTH;
    const shouldApplyColorsPerBar = isSingleDataset && hasMultipleColors && hasMultipleDataPoints;
    
    let bgColor;
    if (shouldApplyColorsPerBar) {
      bgColor = colors;  // Array for per-bar colors
    } else if (dataset.colors?.length > FIRST_INDEX) {
      bgColor = Array.isArray(dataset.colors) ? dataset.colors[0] : dataset.colors;
    } else if (Array.isArray(colors) && colors.length > FIRST_INDEX) {
      bgColor = colors[index] || colors[0] || DEFAULT_COLOR;
    } else {
      bgColor = colors || DEFAULT_COLOR;
    }
    
    return {
      label: dataset.label,
      data: dataset.data,
      completeData: dataset.completeData,
      filterInfo: dataset.filterInfo,
      backgroundColor: bgColor,
      borderColor: bgColor,
      borderWidth: DEFAULT_BORDER_WIDTH,
      barThickness,
      borderRadius: DEFAULT_BORDER_RADIUS,
      stack: stacked ? STACKED_STACK_ID : undefined,
    };
  }),
};

  const handleBarClick = (event, elements) => {
    if (elements.length === 0) return;

    if (includeAllGenders) {
      // New behavior: Collect data from all clicked elements (both male and female)
      const allClickedData = elements.map(element => {
        const datasetIndex = element.datasetIndex;
        const dataIndex = element.index;
        const dataset = datasets[datasetIndex];
        const label = chartData.labels[dataIndex];
        const value = dataset.data[dataIndex];
        const filterInfo = dataset.filterInfo[dataIndex];
        const data = dataset.completeData[dataIndex];
        
        return { 
          label, 
          value, 
          filterInfo,
          datasetLabel: dataset.label, // "Male" or "Female"
          data
        };
      });

      // Merge filterInfo from all elements
      const mergedFilterInfo = {};
      allClickedData.forEach(data => {
        if (data.filterInfo) {
          Object.keys(data.filterInfo).forEach(key => {
            if (!mergedFilterInfo[key]) {
              mergedFilterInfo[key] = [];
            }
            
            if (key === 'gender') {
              // Add the gender from dataset label
              const genderValue = data.datasetLabel;
              if (!mergedFilterInfo[key].includes(genderValue)) {
                mergedFilterInfo[key].push(genderValue);
              }
            } else if(key === 'kpiFilter' || key === 'kpiCategory'){
              // For kpiFilter and kpiCategory, just take the first occurrence
              if(mergedFilterInfo[key].length === 0 && data.filterInfo[key]){
                mergedFilterInfo[key] = [data.filterInfo[key]];
              }
            } else {
              // For other keys like age, combine arrays and remove duplicates
              mergedFilterInfo[key] = [...new Set([...mergedFilterInfo[key], ...data.filterInfo[key]])];
            }
          });
        }
      });

      const clickedBarData = { 
        label: allClickedData[0].label, // Age group
        value: allClickedData.reduce((sum, data) => sum + data.value, 0), // Total value
        filterInfo: mergedFilterInfo, // Will include both Male and Female,
        // data: allClickedData[0].data // Array of individual clicked data
      };

      onBarClick(clickedBarData);
    } else {
      // Original behavior: Only first element
      const element = elements[0];
      const datasetIndex = element.datasetIndex;
      const dataIndex = element.index;
      const dataset = datasets[datasetIndex];
      const label = chartData.labels[dataIndex];
      const value = dataset.data[dataIndex];
      const filterInfo = dataset.filterInfo?.[dataIndex];
      const clickedBarData = { label, value, filterInfo };
      console.log("Clicked bar data:", clickedBarData);

      onBarClick(clickedBarData);
    }
  };

  const options = {
    indexAxis: horizontal ? "y" : "x",
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: horizontal ? "y" : "index",
      intersect: false,
      axis: horizontal ? "y" : "x",
    },
    grouped: stacked ? false : true,
    onClick: isClick ? handleBarClick : null,
    // Add onHover to handle cursor pointer
    onHover: (event, activeElements) => {
      if (isClick && event.native?.target) {
        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
    },
    plugins: {
      tooltip: {
        enabled: showTooltip,
        mode: horizontal ? "y" : "index",
        intersect: false,
        // Add these properties to ensure tooltip shows
        position: 'nearest',
        external: null,
        // Increase the hover area for better tooltip triggering
        caretSize: 6,
        caretPadding: 10,
        callbacks: {
          title: () => "",
          beforeBody: function (context) {
            if (stacked) {
              const total = context.reduce((sum, item) => sum + item.raw, 0);
              return `Total: ${total}`;
            }
            return "";
          },
          label: function (tooltipItem) {
            let label = tooltipItem.dataset.label || "";
            const value = tooltipItem.raw;
            if (datasets.length === 1) {
              label = tooltipItem.label || "";
            }
            return `${label}: ${value ?? 0}`;
          },
        },
        displayColors: true,
        backgroundColor: "#ffffff",
        titleColor: "#1F2937",
        bodyColor: "#1F2937",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
      },
      legend: {
        align: "end",
        display: showLegend,
        position: legendPosition,
        labels: {
          usePointStyle: true,
        },
      },
    },
    scales: {
      x: {
        stacked,
        border: {
          dash: horizontal ? [5, 5] : undefined,
        },
        ticks: {
          autoSkip: false,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y: {
        stacked,
        beginAtZero: true,
        border: {
          dash: horizontal ? undefined : [5, 5],
        },
        ticks: {
          color: "#6B7280",
          stepSize: 1,
          precision: 0,
          callback: function (value) {
            if (Number.isInteger(value)) {
              return value;
            }
            return null;
          }
        },
        grid: {
          color: "#E5E7EB",
          drawBorder: false,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
