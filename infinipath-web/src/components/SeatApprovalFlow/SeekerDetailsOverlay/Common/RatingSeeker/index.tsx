import React from 'react';
import styles from './index.module.scss';
import star from "../../../../../assets/images/starrating.svg"; 
import emptyStar from "../../../../../assets/images/emptyStar.svg"; 

interface StarRatingProps {
  count: number;
  total?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ count, total = 5 }) => {
  return (
    <div className={styles.starRating}>
      {[...Array(total)].map((_, index) => (
         <img
          key={index}
          src={index < count ? star : emptyStar}
          alt={index < count ? "Filled Star" : "Empty Star"}
          className={styles.staricon}
        />
      ))}
    </div>
  );
};

export default StarRating;