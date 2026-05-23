import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './index.module.scss';

ChartJS.register(ArcElement, Tooltip, Legend);

const GaugeChart = () => {
  const data = {
    labels: ['Own (50%)', 'Others (25%)', 'Cross (25%)'],
    datasets: [
      {
        data: [50, 25, 25],
        backgroundColor: ['#FFA726', '#FFD54F', '#CE93D8'], // Matching section colors
        hoverOffset: 0,
        borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF'], // Add white space between partitions
        borderRadius: 10, // Add border radius to partitions
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide the default legend
      },
      tooltip: {
        enabled: false, // Disable tooltips
      },
      datalabels: {
        display: false, // Disable data labels
      },
    },
    elements: {
      arc: {
        borderWidth: 6, // Ensure the border width matches the dataset border width
      },
    },
    cutout: '90%', // Make the inner circle smaller
    rotation: -90, // Start the chart from the top
    circumference: 180, // Half-circle
  };

  return (
    <div className={styles.gaugeChartContainer}>
      <span className={styles.chartTitle}>Method of attendance </span>
     
      <div className={styles.header}>
        <div className={styles.legend}>
          <span className={styles.dot} style={{ backgroundColor: '#FFA726' }}></span>
          <span>4000 (50%) Own</span>
        </div>
        <div className={styles.legend}>
          <span className={styles.dot} style={{ backgroundColor: '#FFD54F' }}></span>
          <span>2000 (25%) Others</span>
        </div>
        <div className={styles.legend}>
          <span className={styles.dot} style={{ backgroundColor: '#CE93D8' }}></span>
          <span>2000 (25%) Cross</span>
        </div>
      </div>
      <div className={styles.chartWrapper}>
        <Doughnut data={data} options={options} />
        <div className={styles.centerLabel}>
          <div className={styles.totalCount}>8000</div>
          <div className={styles.description}>Total audience</div>
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;
