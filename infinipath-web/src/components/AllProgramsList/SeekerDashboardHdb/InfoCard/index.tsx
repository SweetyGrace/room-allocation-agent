import React from 'react';
import styles from './index.module.scss';
import GrayLine from '../../../../common/components/GrayLine';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children}) => (
  <div className={styles.card}>
    <div className={styles.header}>
      <div className={styles.title}>{title}</div>
      <GrayLine />
    </div>
    <div className={styles.content}>
      {children}
    </div>
  </div>
);

export default InfoCard;