import { useEffect, useMemo, useRef } from "react";
import { Chart as ChartJS } from 'chart.js';
import { capPercentage, formateDecimalValue, formatSingleDigit } from "../../../utils/commonFunctions";
import LineChartReusable from "../LineChartAdmin";
import { NO_SESSION_ENGAGEMENT_DATA } from "../../../constants";
import noDataIcon from "../../../assets/images/no-behaviour-data.svg";

interface SessionData {
  [time: string]: number | {
    dropOffPercentage?: number;
    latecomersPercentage?: number;
    attendedPercentage?: number;
  };
}

// Helper function to cap percentage values at 100


const MultiChart = ({ registeredData, chartTitle, highestDropOff }: { registeredData: SessionData, chartTitle: string, highestDropOff?: {[key: string]: string } }) => {
  const chartRef = useRef<ChartJS<'line'> | null>(null);

  // Handle null/undefined data
  if (!registeredData || Object.keys(registeredData).length === 0) {
    return (
      <LineChartReusable
        chartTitle={chartTitle}
        lineChartData={{
          labels: [''],
          datasets: []
        }}
        isDataAvailable={false}
        chartRef={chartRef}
        options={{}}
        highestDropOff={highestDropOff}
        noDataMessage={NO_SESSION_ENGAGEMENT_DATA}
        noDataIcon={noDataIcon}
      />
    );
  }

  // Check if data contains nested objects (new format) or simple numbers (old format)
  const isNestedFormat = registeredData && Object.values(registeredData).length > 0 && 
    typeof Object.values(registeredData)[0] === 'object';

  // Extract chart data from the session data
  const originalLabels = Object.keys(registeredData || {});
  
  // Handle both formats: simple numbers or nested objects with percentage fields
  const originalValues = isNestedFormat 
    ? Object.values(registeredData).map(value => {
        if (typeof value === 'object' && value !== null) {
          // For nested format, use attendedPercentage, or first available percentage
          const percentValue = value.attendedPercentage ?? 
                               value.dropOffPercentage ?? 
                               value.latecomersPercentage ?? 
                               Object.values(value)[0] ?? 0;
          return capPercentage(percentValue);
        }
        return 0;
      })
    : Object.values(registeredData).map(value => 
        typeof value === 'number' ? formateDecimalValue(value) : 0
      );

  // Add empty values at start for padding
  const chartLabels = ['', ...originalLabels];
  const chartValues = [0, ...originalValues] as number[];

  // Calculate peak value for y-axis (cap at 110 for percentages)
  const maxValue = originalValues.length > 0 
    ? Math.max(...originalValues.map(v => Number(v) || 0))
    : 0;
  const peakValue = Math.min(maxValue + 10, 110);

  const lineChartData = useMemo(() => {
    if (chartLabels.length === 1 && chartLabels[0] === "") {
      return {
        labels: [''],
        datasets: [],
      };
    }
    return {
      labels: chartLabels,
      datasets: [
        {
          label: 'Registrations',
          data: chartValues,
          borderColor: '#67B26F',
          backgroundColor: 'rgba(171, 219, 251, 0.01)',
          fill: true,
          borderWidth: 2,
          tension: 0,
          pointRadius: 0,
        }
      ],
    };
  }, [chartLabels, chartValues]);

  // Remove both existing useEffect blocks and replace with this single one
  useEffect(() => {
    const timeout = setTimeout(() => {
      const chart = chartRef.current;
      if (chart) {
        const ctx = chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);
        
        // Create gradient for single line
        gradient.addColorStop(0, '#EAEBFF');
        gradient.addColorStop(1, '#2F73F1');

        // Update only the first dataset since we only have one line
        if (chart.data.datasets[0]) {
          chart.data.datasets[0].borderColor = gradient;
          chart.data.datasets[0].borderWidth = 2;
          chart.update();
        }
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [lineChartData]);

  const getTooltipCallbacks = () => {
    return {
      title: (tooltipItems: { dataIndex: number }[] = []) => {
        const index = tooltipItems?.[0]?.dataIndex;
        if (index === 0 || index === undefined) return;
        return chartLabels[index];
      },
      label: (tooltipItem: { dataIndex: number; dataset: { label: string }; raw: number | string }) => {
        const index = tooltipItem?.dataIndex;
        if (index === 0) return;
        const rawValue = typeof tooltipItem.raw === 'number' ? tooltipItem.raw : Number(tooltipItem.raw) || 0;
        return `${formatSingleDigit(rawValue)}%`;
      },
      labelTextColor: () => '#051b46',
    };
  };

  // Chart options
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
        mode: 'nearest' as const,
        intersect: false,
        // usePointStyle: true,
        boxWidth: 10,
        boxHeight: 10,
        backgroundColor: 'white',
        titleAlign: 'center' as const,
        titleColor: 'rgba(5, 27, 70, 1)',
        bodyColor: 'rgba(0, 0, 0, 0.87)',
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 14,
        },
        // padding: 10,
        callbacks: getTooltipCallbacks(),
        displayColors: false,
        filter: (tooltipItem: { dataIndex: number }) => tooltipItem.dataIndex !== 0,
      }

    },
    scales: {
      x: {
        grid: {
          display: true,
          borderDash: [10, 10],
          borderDashOffset: 0,
          color: 'rgba(0, 0, 0, 0.1)',
          drawTicks: true,
          tickLength: 0,
        },
        border: {
          dash: [5, 5],
          display: true,
        },
        ticks: {
          display: true,
          padding: -18,
          align: 'end',
          callback: (index: number) => {
            const label = chartLabels[index];
            return label ? `${label.toUpperCase()}  ` : '';
          }
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          display: true,
          align: 'center',
          callback: (value: number) => `${value}%`,
          font: {
            size: 12,
          }
        },
        suggestedMax: peakValue,
      },
    },
    elements: {
      line: {
        tension: 0, // Makes lines straight instead of curved
      },
      point: {
        radius: 0,
      },
    },
  };

  return (
    <LineChartReusable
      chartTitle={chartTitle}
      lineChartData={lineChartData}
      isDataAvailable={chartValues.length > 1}
      chartRef={chartRef}
      options={options}
      highestDropOff = {highestDropOff}
      noDataMessage={NO_SESSION_ENGAGEMENT_DATA}
      noDataIcon={noDataIcon}
    />
  );
};

export default MultiChart;
