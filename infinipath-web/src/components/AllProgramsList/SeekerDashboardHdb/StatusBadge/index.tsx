import React from 'react';
import styles from './index.module.scss';

interface StatusBadgeProps {
  status: string;
  type?: 'success' | 'warning' | 'error' | 'info';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'info' }) => (
  <span className={`${styles.badge} ${styles[type]}`}>
    {status}
  </span>
);

export default StatusBadge;