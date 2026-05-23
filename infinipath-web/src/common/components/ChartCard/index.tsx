import styles from "./index.module.scss";

const ChartCard = ({ title, totalLabel, children }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>{title}</span>
        {totalLabel && <span className={styles.total}>{totalLabel}</span>}
      </div>
      <div className={styles.chartBox}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
