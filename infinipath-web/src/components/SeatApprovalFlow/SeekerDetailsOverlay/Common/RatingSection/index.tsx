// components/RatingSection/RatingSection.tsx
import React, { useState } from "react";
import StarRating from "../RatingSeeker";
import styles from "./index.module.scss";
import { calculateOverallRating } from "../../../../../utils/commonFunctions";
import SeekerDetails from "../..";
import {
  OVERALL_RATING_LABEL,
  COMMENT_LABEL,
  YET_TO_REVIEW_LABEL,
  PASSION_LABEL,
  GROWTH_LABEL,
  INFINITHEIST_LABEL,
  CONTINUITY_LABEL,
  PREVIOUS_RATING_LABEL,
  CURRENT_RATING_IS,
  PREVIOUS_RATING_IS,
  PREVIOUS_RATING_IS_LABEL,
} from "../../../../../constants/textConstants"; // Import the constant
import { colorizeMahatriaInfinitheism } from "../../../../../common/components/ColorizeMahatriaInfinitheism";
import { PrevRating } from "../../../../../types/seatApproval";
import CaretCircleUp from "../../../../../assets/images/CaretCircleUp.svg"
import CaretCircleDown from "../../../../../assets/images/CaretCircleDown.svg"
import GrayLine from "../../../../../common/components/GrayLine";
import star from "../../../../../assets/images/star.svg"

interface RatingItem {
  id: number;
  programRegistrationId: string;
  rmId: number;
  ratingKey: string;
  rating: string;
}

interface RatingSectionProps {
  rating:number;
  ratings: RatingItem[];
  rmData: Record<string, any>;
  rmReview: string;
  rmReviewer?: string;
  rmName?: string; // Optional prop for RM name
  prevRating?: PrevRating | null;
}

const RatingSection: React.FC<RatingSectionProps> = ({ rating,ratings, rmData, reviewer, rmReview , prevRating }) => {
  // Calculate overall rating
  const overallRating = ratings.length > 0
    ? (ratings.reduce((acc, curr) => acc + Number(curr.rating), 0) / ratings.length).toFixed(1)
    : "0";

  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className={styles.ratingSection}>
       <div className={styles.prevRatingHeaderContainer}>
              <div className={styles.prevRatingHeader}>
              <span className={styles.prevRatingHeading}>Rating</span>
              <GrayLine />
              {isOpen ? <img src={CaretCircleDown} alt="Collapse" onClick={() => setIsOpen(false)} className={styles.caretIcon}/> : <img src={CaretCircleUp} alt="Expand" onClick={() => setIsOpen(true)} className={styles.caretIcon}/>}
              </div>
              
            </div>
      {isOpen && (
        <>
       {prevRating?.rating && prevRating.rating !== null && prevRating.rating > 0 && <div className={styles.prevRatingContainer}>
              <div className={styles.prevRatingContent}>
              <p className={styles.prevRatingText}>
                {prevRating?.rmContactName 
                    && (
                       <div className={styles.overallRating}>
                        <span>
                          {prevRating?.rmContactName && prevRating?.hdbYear
                            ? `${prevRating.rmContactName}'s ${prevRating.hdbYear} ${PREVIOUS_RATING_LABEL}`
                            : prevRating?.rmContactName
                            ? `${prevRating.rmContactName} ${PREVIOUS_RATING_IS}`
                            : `${PREVIOUS_RATING_IS_LABEL}`
                          }
                        </span>
                          <span className={styles.ratingScore}>
                             <img src={star} alt="star" width={13} height={13} /> {prevRating.rating || 0}
                          </span>
                        </div>
                      )
                  }
              </p>
              <p className={styles.prevRatingReview}>{colorizeMahatriaInfinitheism(prevRating?.review || "")}</p>
              </div>
            </div>}
      <p className={styles.RatingHeading}> {rmData.fullName === "Other" ? "RM" : rmData.fullName }'s rating and review comments</p>

      {ratings.length > 0 ? (
        <>
          <div className={styles.ratingDetails}>
            <div className={styles.overallRating}>
              <span className={styles.ratingLabel}>{colorizeMahatriaInfinitheism(CURRENT_RATING_IS)}</span>
              <span className={styles.ratingScore}> <img src={star} alt="star" width={13} height={13} /> {rating}</span>
            </div>
          </div>
          <div className={styles.rmReview}>
            <span>Review Comments:</span><p className={styles.reviewText}>{colorizeMahatriaInfinitheism(rmReview) || ""}</p>
          </div>
        </>
      ) : (
        <div className={styles.yetToReviewLabel}>
          {YET_TO_REVIEW_LABEL}</div>
      )}
      </>)}
    </div>
  );
};

export default RatingSection;
