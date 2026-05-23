
import React from 'react';
import styles from './index.module.scss';

interface HomePageCardsProps {
    imgsrc: string;
    text: string;
    diffStyle?:boolean;
    isClicked?:boolean;
    setIsClicked: (value: boolean) => void;
}
export const HomePageCards:React.FC<HomePageCardsProps> = ({imgsrc,text, diffStyle, setIsClicked }) => {
  
    return (
        <div className={styles.container}  onClick={() => setIsClicked(true)} data-testid={`card-${text}`}>
        <img src={imgsrc} alt="img" className={styles.HomeIconDiv} data-testid={`${text}-icon`} />
        <span className={diffStyle ? styles.diffStyles : styles.HomeDetailsText}>
            {text}
        </span>
    </div>
    )
}