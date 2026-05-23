import PieChart from "../PieChart";
import styles from "./index.module.scss";

const PieChartWithLegend = ({ data, showValues = false }) => {
  const { labels, dataValues, colors } = data;

  return (
    <div className={styles.pieChartWrapper}>
      <div className={styles.chartContainer}>
        <PieChart
          labels={labels}
          dataValues={dataValues}
          colors={colors}
        />
      </div>
      <div className={styles.legend}>
        {labels.map((label, index) => (
          <div key={label} className={styles.legendItem}>
            <span 
              className={styles.legendDot}
              style={{ backgroundColor: colors[index] }}
            ></span>
            <span className={styles.legendText}>
              {showValues && `${dataValues[index]} `}
              <strong>{label}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartWithLegend;