import React from 'react';
import styles from "./index.module.scss"
import { formattingCount } from '../../../utils/commonFunctions';
import { colorizeMahatriaInfinitheism } from '../ColorizeMahatriaInfinitheism';

interface BarLinesProps {
    data: BarLineItem[];
    title: string;
    handleClick?: (item: BarLineItem) => void;
    isShowPercentage?: boolean;
    noDataMessage?: string;
    noDataIcon?: string;
}

export interface BarLineItem {
    name: string;
    value: number;
    filterValue?: string;
}

const BarLines: React.FC<BarLinesProps> = ({ data, title, handleClick, isShowPercentage = false, noDataMessage, noDataIcon }) => {
    return (
        <div className={styles.barLines}>
            <div className={styles.title}>{colorizeMahatriaInfinitheism(title)}</div>
            <div className={styles.chartContainer}>
                {data && data.length > 0 ? (
                    data.map((item, index) => (
                        <div
                            key={index}
                            className={styles.barWrapper}
                            onClick={() => {
                                    handleClick && handleClick(item);}}
                        >
                            <div>{item.name}</div>
                            <div className={styles.barContainer}>
                                <div className={styles.barBackground}>
                                    <div
                                        className={styles.barFill}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                                <span className={handleClick ?styles.label : styles.labelDisabled}>{formattingCount(item.value)}{ isShowPercentage ? '%': ''}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    noDataMessage?
                    <div className={styles.noSeekers}>
                        <div className={styles.noSeekersImage}>
                    <img src = {noDataIcon}/>
                    </div>
                    <p>{noDataMessage}</p>
                    </div>
                    :<div className={styles.noData}>No data found</div>

                )}
            </div>
        </div>
    );
};

export default BarLines;