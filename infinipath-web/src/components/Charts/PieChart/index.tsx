import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Legend } from "chart.js";
import clsx from "clsx";
import { useRef } from "react";
import { is } from "date-fns/locale";

ChartJS.register(ArcElement, Legend);

const PieChart = ({
  title,
  labels,
  dataValues,
  colors,
  className = "",
  centerLabel = "", // label to show in center
  onSliceClick,
  isHalf
}) => {
  const chartRef = useRef(null);

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors,
        borderWidth: 2,
        borderRadius : isHalf ? 400 : 0,
      },
    ],
  };

   // Center text plugin
  const centerTextPlugin = {
  id: "centerTextPlugin",
  afterDraw: (chart) => {
    if (!centerLabel) return;
    const { ctx, chartArea } = chart;
    ctx.save();
    const centerX = (chartArea.left + chartArea.right) / 2;

    if (isHalf) {
      // Existing semi-circle logic
      const lines = centerLabel.split("\n");
      const lineHeight = 22;
      const totalHeight = lines.length * lineHeight;
      let startY = (chartArea.top + chartArea.bottom) / 2 - totalHeight / 2 + 20;

      lines.forEach((line, i) => {
        if (i < lines.length - 1) {
          ctx.font = '400 15.845px "Noto Sans"';
          ctx.fillStyle = "var(--colors-text-text-tertiary-600, #535862)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(line, centerX, startY + i * lineHeight);
        } else {
          // Last line: completed / total
          const [completed, total] = line.split(" / ");
          ctx.font = '600 28px "Noto Sans"';
          const completedWidth = ctx.measureText(completed).width;
          ctx.font = '400 16px "Noto Sans"';
          const slashTotal = " / " + total;
          const slashTotalWidth = ctx.measureText(slashTotal).width;
          const totalTextWidth = completedWidth + slashTotalWidth;
          const startX = centerX - totalTextWidth / 2;

          ctx.font = '600 28px "Noto Sans"';
          ctx.fillStyle = "var(--colors-text-text-primary-900, #181D27)";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(completed, startX, startY + i * lineHeight);

          ctx.font = '400 16px "Noto Sans"';
          ctx.fillStyle = "var(--Text-Text-Disabled, #8A8A8A)";
          ctx.textAlign = "left";
          ctx.fillText(
            slashTotal,
            startX + completedWidth,
            startY + i * lineHeight
          );
        }
      });
    } else {
      // Full pie: single centered label with your requested style
      ctx.font = '400 14px "Noto Sans"';
      ctx.fillStyle = "var(--Text-Text-Fill, #051B46)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(centerLabel, centerX, (chartArea.top + chartArea.bottom) / 2);
    }

    ctx.restore();
  },
};
  let options = {
    cutout: "93%",
    onHover: (event, activeElements) => {
      if (event.native?.target) {
        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
    },
    plugins: {
      legend: {
        display: isHalf ? false : true,
        position: "right",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          generateLabels: (chart) => {
            const data = chart.data;
            const dataset = data.datasets[0];

            return data.labels.map((label, i) => ({
              text: `${dataset.data[i]}: ${label}`,
              fillStyle: dataset.backgroundColor[i],
              strokeStyle:
                dataset.borderColor?.[i] || dataset.backgroundColor[i],
              lineWidth: 0,
              hidden: chart.getDatasetMeta(0).data[i].hidden,
              index: i,
            }));
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: "#ffffff",
        callbacks: {
          title: () => "",
          beforeBody: function (context) {
            return context[0]?.label || "";
          },
          label: function (tooltipItem) {
            const label = tooltipItem.dataset.label || tooltipItem.label || "";
            const value = tooltipItem.raw;
            return `${label}: ${value}`;
          },
        },
        displayColors: true,
        titleColor: "#1F2937",
        bodyColor: "#1F2937",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
      },
    },
    maintainAspectRatio: false,
    onClick: (event) => {
      const chart = chartRef.current;
      if (!chart) return;

      const activePoints = chart.getElementsAtEventForMode(
        event,
        "nearest",
        { intersect: true },
        true,
      );

      if (activePoints.length > 0) {
        const firstPoint = activePoints[0];
        const label = chart.data.labels[firstPoint.index];
        const value =
          chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
        onSliceClick?.({ label, value, index: firstPoint.index });
      }
    },
  };

  if (isHalf) {
    options = {
      ...options,
      cutout: "96%",
    circumference: 180,
    rotation: -90,}
  }

  return (
    <Doughnut
      ref={chartRef}
      data={data}
      options={options}
      plugins={[centerTextPlugin]}
      className={clsx(className)}
    />
  );
};

export default PieChart;
