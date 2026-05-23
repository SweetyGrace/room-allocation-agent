import React from "react";
import styles from "./index.module.scss";
import { StatCardProps } from "../types";
import { setSelectedKpiTab } from "../../../reducers/ProgramReducer";
import { useDispatch, useSelector } from "react-redux";
import { getItemInLocalStorage } from "../../../services/localStorage";
import { RootState } from "../../../store";

const StatCard: React.FC<StatCardProps> = ({ cardData, icon, handleClick }) => {
  const { count, displayName, highlighted } = cardData;
  const dispatch = useDispatch();
  const formConfig = useSelector((state: RootState) => state.ProgramReducer.filterConfigList);
  const onClick = () => {
    if (handleClick) {
      if(cardData?.filters?.kpiFilter)
      {
      dispatch(
        setSelectedKpiTab({
          kpiFilter: cardData?.filters?.kpiFilter,
          kpiCategory: cardData?.filters?.kpiCategory,
        }),
      );
    }
    else{
      dispatch(
        setSelectedKpiTab(formConfig?.data?.parentOptions[0]?.kpiOptions[0]),
      );
    }
      handleClick(cardData);
    }
  };

  return (
    <div className={styles.statCard} onClick={onClick}>
      {/* <div className={styles.icon}>{icon}</div> */}
      <div className={styles.details}>
        <span
          className={`${styles.count} ${highlighted ? styles.highlighted : ""}`}
        >
          {count}
        </span>
        <span className={styles.label}>{displayName}</span>
      </div>
    </div>
  );
};

export default StatCard;
