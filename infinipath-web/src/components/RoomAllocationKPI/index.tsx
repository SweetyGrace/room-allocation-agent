import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import HeadingSubHeading from "../HeadingSubHeading";

export interface KPIData {
  subheading: string;
  mainHeading: string;
  type: string;
  key: string;
}

interface RoomAllocationKPIProps {
  headingsData: KPIData[];
  activeKpi: string;
  handleKpiClick: (type: KPIData) => void;
}

const RoomAllocationKPI: React.FC<RoomAllocationKPIProps> = ({
  headingsData,
  activeKpi,
  handleKpiClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = headingsData.findIndex(item => item.key === activeKpi);
    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const activeElement = itemRefs.current[activeIndex];
      if (activeElement && containerRef.current) {
        setIndicatorStyle({
          left: activeElement.offsetLeft,
          width: activeElement.offsetWidth,
        });
      }
    }
  }, [activeKpi, headingsData]);

  const handleKpiClickWithState = (type: KPIData) => {
    if (handleKpiClick) {
      handleKpiClick(type);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainWrapper}>
        <div className={styles.kpiContainer} ref={containerRef}>
          {headingsData.map((item, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={styles.kpiWrapper}
            >
              <HeadingSubHeading
                handleClick={() => handleKpiClickWithState(item)}
                subheading={item.subheading}
                index={index}
                mainHeading={item.mainHeading}
                additionalClassName={styles.headingSubheadingContainer}
                isActive={item.key === activeKpi}
                totalLength={headingsData.length}
              />
            </div>
          ))}
          {/* Animated indicator */}
          <div
            className={styles.indicator}
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomAllocationKPI;
