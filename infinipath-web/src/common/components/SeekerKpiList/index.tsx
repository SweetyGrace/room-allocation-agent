import React, { useEffect, useState } from 'react';
import styles from "./index.module.scss";
import totalAttended from "../../../assets/images/attended.svg";
import notRegistered from "../../../assets/images/registered.svg";
import absentees from "../../../assets/images/absentees.svg";
import totalAttendedHover from "../../../assets/images/hover-total-attended.svg";
import registeredHover from "../../../assets/images/hover-registered.svg";
import absenteesHover from "../../../assets/images/hover-absentees.svg";
import { formattingCount } from '../../../utils/commonFunctions';


interface SeekerKpiListProps {
    seekerKpiData: unknown[]
}

const SeekerKpiList: React.FC<SeekerKpiListProps> = ({ seekerKpiData }) => {
    const [kpiData, setKpiData] = useState<unknown[]>([]);

    useEffect(() => {
        if (seekerKpiData) {
            setKpiData([
                {
                    icon: totalAttended,
                    hoverIcon: totalAttendedHover,
                    count: seekerKpiData.totalAttended,
                    text: "infinipaths attended",
                },
                {
                    icon: notRegistered,
                    hoverIcon: registeredHover,
                    count: seekerKpiData.totalRegistered,
                    text: "infinipaths registered",
                },
                {
                    icon: absentees,
                    hoverIcon: absenteesHover,
                    count: seekerKpiData.totalAbsentees,
                    text: "Absent count",
                },
            ]);
        }
    }, [seekerKpiData]);

    return (
        <div className={styles.seekerKpiList}>
              {kpiData.map((item, index) => (
                <div key={index} className={styles.statisticsCard__box}>
                      <div className={styles.statisticsCard__iconContainer}>

                    <img
                        src={item.icon}
                        alt={item.text}
                        className={styles.statisticsCard__icon}
                    />
                    <img
                        src={item.hoverIcon}
                        alt={item.text}
                        className={styles.statisticsCard__hoverIcon}
                    />
                    </div>
                    <div className={styles.statisticsCard__text}>
                        <div className={styles.statisticsCard__subtextcount}>{formattingCount(item.count)}</div>
                        <div className={styles.statisticsCard__subtext}>{item.text}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SeekerKpiList;



