import React from 'react';
import styles from '../ExperienceChart/index.module.scss';

interface LegendItemProps {
  color: string;
  text: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, text }) => (
  <div className={styles.legendItem}>
    <div className={styles.legendDot} style={{ backgroundColor: color }}></div>
    <span className={styles.legendText}>{text}</span>
  </div>
);

export default LegendItem;