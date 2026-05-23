import React from "react";
import styles from "./index.module.scss";
import { updateNumberFormat } from "../../utils/commonFunctions";
import { HeadingSubheadingProps } from "../../types/roomAllocation";



const HeadingSubHeading: React.FC<HeadingSubheadingProps> = ({
  subheading,
  mainHeading,
  additionalClassName,
  handleClick,
  isActive = false, // Default to false
  index,
  totalLength,
}) => {
  return (
    <>
    <div
      onClick={handleClick}
      className={`${styles.headingSubheadingContainer} ${additionalClassName} ${
        isActive ? styles.active : ""
      }`}
    >
      <h5 className={styles.headingText}>{subheading}</h5>
      <h3 className={styles.subHeadingText}>{updateNumberFormat(mainHeading)}</h3>
    </div>
    {(index === 0 || (totalLength && index === totalLength - 2)) &&  <div className={styles.separator} />}
    </>
  );
};

export default HeadingSubHeading;
