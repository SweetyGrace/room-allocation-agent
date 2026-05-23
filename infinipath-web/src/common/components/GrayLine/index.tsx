import React from "react";
import styles from "./index.module.scss";

const GrayLine: React.FC = () => {
  return <div className={styles.formLine} data-testid="common-gray-line"></div>;
};

export default GrayLine;
