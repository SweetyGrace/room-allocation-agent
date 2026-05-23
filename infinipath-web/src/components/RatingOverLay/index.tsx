import { useEffect, useState, useRef, useMemo } from "react";
import SideDrawerOverlay from "../SideOverLay";
import star from "../../assets/images/star.svg"
import emptyStar from "../../assets/images/emptyStar.svg";
import { Button } from "../../common/components/Button";
import { Button as MuiButton } from "../components/Common/Button";
import styles from "./index.module.scss";
import { getCall, postCall, putCall } from "../../services/apiService";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import { RATING_KEYS, RecommendationLevel } from "../../constants";
import UserCard from "../SeatApprovalFlow/SeekerDetailsOverlay/Common/UserCards";
import GrayLine from "../../common/components/GrayLine";
import CaretCircleDown from "../../assets/images/CaretCircleDown.svg";
import CaretCircleUp from "../../assets/images/CaretCircleUp.svg";
import {
  calculateOverallRating,
  getAverageRating,
} from "../../utils/commonFunctions";
import { getItemInLocalStorage } from "../../services/localStorage";
import { PREVIOUS_RATING_IS, PREVIOUS_RATING_IS_LABEL, PREVIOUS_RATING_LABEL, RecommendationLevelText, seekerExperiencesText, ReviewOverlayText } from "../../constants/textConstants";
import { notify } from "../../common/components/ToastMessage";
import { WARNING } from "../../constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../common/components/CustomeSelect";
import { PrevRating } from "../../types/seatApproval";
import SeekerExperienceSelect from "../SeekerExperienceSelect";
import React from "react";

const ReviewOverlay = ({
  open,
  onClose,
  onSave,
  seekerId,
  programId,
  initialRatings = {},
  initialComments = "",
  seekersData,
  disablePreferences,
  prevRating,
  initialRecommendations,
  initialSeekerExperiences = [],
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (review: any) => void;
  seekerId?: number;
  programId?: number;
  initialRatings?: { [key: string]: { rating: number; id?: number } };
  initialComments?: string;
  seekersData?: unknown;
  prevRating?: PrevRating;
  disablePreferences;
  initialRecommendations;
  initialSeekerExperiences?: any[];
  onRefresh?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const recommendationRef = useRef<HTMLDivElement>(null);
const followUpCountOptions = Array.from({ length: 101 }, (_, i) => i.toString());
  
  // State for seeker experiences
  const initialSelected = useMemo(() => {
    if (!initialSeekerExperiences || initialSeekerExperiences.length === 0) return [];
    const mapped = initialSeekerExperiences.map((tag: any) => {
      // Check if already in correct format
      if (tag.label && tag.value) {
        return {
          label: tag.label,
          value: String(tag.value),
        };
      }
      // Check for lookupData (coming from API response)
      if (tag.lookupData) {
        return {
          label: tag.lookupData.lookupLabel,
          value: String(tag.lookupData.id),
        };
      }
      // Fallback for other formats
      return {
        label: tag.label || tag.title || "Unknown",
        value: tag.value || tag.id?.toString() || tag.title?.toLowerCase().replace(/\s+/g, "_"),
      };
    });
    return mapped;
  }, [initialSeekerExperiences]);

  const [selectedTags, setSelectedTags] = useState<any[]>(initialSelected);
  const [seekerExperienceInteracted, setSeekerExperienceInteracted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const [form, setForm] = useState({
    prevRatings: initialRatings,
    ratings: initialRatings,
    comments: initialComments,
    recComments: initialRecommendations?.recommendationText || "",
    wouldRecommend:
      initialRecommendations?.isRecommended === true
        ? "yes"
        : initialRecommendations?.isRecommended === false
        ? "no"
        : "",
    recommendation: initialRecommendations?.recommendationKey || "",
    followUpCount: initialRecommendations?.followUpCount ? initialRecommendations.followUpCount.toString() : "",
  });

  // Initialize form when props change
  useEffect(() => {
    setForm({
      prevRatings: initialRatings,
      ratings: initialRatings,
      comments: initialComments,
      recComments: initialRecommendations?.recommendationText || "",
      wouldRecommend:
        initialRecommendations?.isRecommended === true
          ? "yes"
          : initialRecommendations?.isRecommended === false
            ? "no"
            : "",
      recommendation: initialRecommendations?.recommendationKey || "",
      followUpCount: initialRecommendations?.followUpCount ? initialRecommendations.followUpCount.toString() : "",
    });
  }, [initialRatings, initialComments, initialRecommendations]);

  //Match SeekerTags pattern
  useEffect(() => {
    setSelectedTags(initialSelected);
    setSeekerExperienceInteracted(initialSelected.length > 0);
  }, [initialSelected]);

  useEffect(() => {
    if (form.wouldRecommend === "no") {
      setForm((prev) => ({
        ...prev,
        recommendation: "",
        recComments: "",
        followUpCount: "",
      }));
    }
    else if (form.wouldRecommend === "yes" && recommendationRef.current) {
      setTimeout(() => {
        recommendationRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 150);
    }
  }, [form.wouldRecommend]);

  const showRecommendationRequired =
    (form.wouldRecommend === "yes" && !form.recommendation) || (form.wouldRecommend === "yes" && form.recComments && !form.recommendation);
  const avgRating = getAverageRating(form.ratings, RATING_KEYS.length);
  
  const userId = getItemInLocalStorage("seekerDetails")?.id;

  const isUpdate =
    (!!initialComments &&
    initialComments.trim().length > 0 &&
    initialRatings &&
    Object.keys(initialRatings).length > 0) ||
    (initialSeekerExperiences && initialSeekerExperiences.length > 0);
  
  // isReviewUpdate: for review API logic (true only if review exists)
  const isReviewUpdate =
    !!initialComments &&
    initialComments.trim().length > 0 &&
    initialRatings &&
    Object.keys(initialRatings).length > 0;
  
  const isFormValid = React.useMemo(() => {
    //  Review validation
    const hasReviewData = form.comments.trim().length > 0 || avgRating > 0;
    const reviewIsValid = form.comments.trim().length > 0 && !showRecommendationRequired && avgRating > 0;
    
    //Generated by Copilot - Check if review data changed from initial (including recommendation fields)
    const reviewHasChanged = 
      form.comments.trim() !== (initialComments?.trim() || "") ||
      RATING_KEYS.some(({ key }) => {
        const currentRating = form.ratings[key]?.rating || 0;
        const initialRating = initialRatings[key]?.rating || 0;
        return currentRating !== initialRating;
      }) ||
      // Check recommendation changes
      (form.wouldRecommend === "yes" 
        ? initialRecommendations?.isRecommended !== true
        : form.wouldRecommend === "no"
        ? initialRecommendations?.isRecommended !== false
        : false) ||
      form.recommendation !== (initialRecommendations?.recommendationKey || "") ||
      form.recComments !== (initialRecommendations?.recommendationText || "") ||
      form.followUpCount !== (initialRecommendations?.followUpCount ? initialRecommendations.followUpCount.toString() : "");
    
    //  Seeker experience validation
    const seekerExperienceChanged = JSON.stringify(selectedTags) !== JSON.stringify(initialSelected);
    const hasSeekerExperiences = selectedTags.length > 0;
    
    //  Detect if sections were cleared from initial state
    const reviewExistedInitially = isReviewUpdate;
    const experiencesExistedInitially = initialSeekerExperiences && initialSeekerExperiences.length > 0;
    const reviewWasCleared = reviewExistedInitially && !hasReviewData;
    const experiencesWereCleared = experiencesExistedInitially && !hasSeekerExperiences;
    
    // Block save if review data is incomplete
    if (hasReviewData && !reviewIsValid) {
      return false; 
    }
    
    // Different validation for POST (creation) vs PUT (update)
    if (!isUpdate) {
      // POST scenario (creation): Enable if ANY section has data
      if (!hasReviewData && !hasSeekerExperiences) {
        return false; // Both sections empty → disable
      }
      return reviewIsValid || hasSeekerExperiences; // Enable if either section has data
    } else {
      // PUT scenario (update): Check what existed initially
      
      // Case 1: Both sections are empty → disable
      if (!hasReviewData && !hasSeekerExperiences) {
        return false;
      }
      
      // Case 2: If BOTH sections existed initially, enforce strict rules
      if (reviewExistedInitially && experiencesExistedInitially) {
        // Disable if one section was cleared regardless of what happened to the other
        if (reviewWasCleared || experiencesWereCleared) {
          return false;
        }
        
        // Both sections still have data - must have changes
        if (!reviewHasChanged && !seekerExperienceChanged) {
          return false; // No changes → disable
        }
        
        // Both sections have data and at least one changed → enable
        return true;
      }
      
      //  Case 3: If only ONE section existed initially
      // Allow updating that section even if other section remains empty/unfilled
      if (reviewExistedInitially && !experiencesExistedInitially) {
        // Only review existed initially
        // Disable if review was cleared
        if (reviewWasCleared) {
          return false;
        }
        // Allow review updates even if seeker experience is empty
        if (reviewIsValid || reviewHasChanged) {
          return true;
        }
        // Allow adding seeker experiences
        if (seekerExperienceChanged) {
          return true;
        }
      }
      
      if (!reviewExistedInitially && experiencesExistedInitially) {
        // Only seeker experience existed initially
        // Disable if seeker experiences were cleared
        if (experiencesWereCleared) {
          return false;
        }
        // Allow seeker experience updates even if review is empty
        if (seekerExperienceChanged) {
          return true;
        }
        // Allow adding review
        if (reviewIsValid) {
          return true;
        }
      }
      
      // Default: Allow save if review is valid OR seeker experience changed
      return reviewIsValid || seekerExperienceChanged;
    }
  }, [form.comments, form.ratings, form.wouldRecommend, form.recommendation, form.recComments, form.followUpCount, showRecommendationRequired, avgRating, selectedTags, initialSelected, initialComments, initialRatings, initialRecommendations, isUpdate, isReviewUpdate, initialSeekerExperiences]);

  const resetForm = () => {
    setForm({
      prevRatings: initialRatings,
      ratings: initialRatings,
      comments: initialComments,
      recComments: initialRecommendations?.recommendationText || "",
      wouldRecommend:
        initialRecommendations?.isRecommended === true
          ? "yes"
          : initialRecommendations?.isRecommended === false
            ? "no"
            : "",
      recommendation: initialRecommendations?.recommendationKey || "",
      followUpCount: initialRecommendations?.followUpCount ? initialRecommendations.followUpCount.toString() : "",
    });
    // Reset seeker experience state
    setSelectedTags(initialSelected);
    setSeekerExperienceInteracted(initialSelected.length > 0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    setIsSubmitting(true); //Disable button during API calls
    let ratingsArr;
    // Use isReviewUpdate instead of isUpdate to check if ratings exist
    if (isReviewUpdate) {
      ratingsArr = RATING_KEYS.map(({ key }) => ({
        ...(form.ratings[key]?.id ? { id: form.ratings[key].id } : {}),
        ratingKey: key,
        rating: Number(form.ratings[key]?.rating) ?? 0,
      }));
    } else {
      ratingsArr = RATING_KEYS.map(({ key }) => ({
        ratingKey: key,
        rating:
          typeof form.ratings[key]?.rating === "number"
            ? form.ratings[key].rating
            : 0,
      }));
    }

    let recommendationPayload = undefined;
    if (form.wouldRecommend) {
      recommendationPayload = {
        ...(initialRecommendations ? { id: initialRecommendations.id } : {}),
        isRecommended: form.wouldRecommend === "yes",
        recommendationKey:
          form.wouldRecommend === "yes"
            ? form.recommendation
              ? (form.recommendation as RecommendationLevel)
              : null
            : null,
        recommendationText:
          form.wouldRecommend === "yes" ? form.recComments : null,
        followUpCount: form.wouldRecommend === "yes" && form.followUpCount ? Number(form.followUpCount) : null,
        recommendedBy: userId,
      };
    }

    const data: any = {
      ratings: ratingsArr,
      review: form.comments,
    };
    if (recommendationPayload) {
      data.recommendation = recommendationPayload;
    }

    // Track API call successes
    let reviewSuccess = true;
    let seekerExperienceSuccess = true;
    let reviewAttempted = false;
    let seekerExperienceAttempted = false;

    try {
      let response;
      //  Call review API if there's valid review data (comments + ratings)
      if (form.comments.trim().length > 0 && avgRating > 0) {
        reviewAttempted = true;
        try {
          // Use isReviewUpdate to determine PUT vs POST
          if (isReviewUpdate) {
            response = await putCall(
              endPoints.ratingForRegisteredSeekers(seekerId),
              data,
              PORTAL
            );
          } else {
            response = await postCall(
              endPoints.ratingForRegisteredSeekers(seekerId),
              data,
              PORTAL
            );
          }

          if (!(response?.status && response.status >= 200 && response.status < 300)) {
            reviewSuccess = false;
          }
        } catch (err) {
          console.error("Review API error:", err);
          reviewSuccess = false;
        }
      }

      // Save seeker experiences if tags are selected AND (user interacted OR tags changed from initial)
      const seekerExperienceChanged = JSON.stringify(selectedTags) !== JSON.stringify(initialSelected);
      if (selectedTags.length > 0 && (seekerExperienceInteracted || seekerExperienceChanged)) {
        seekerExperienceAttempted = true;
        const lookupDataIds = selectedTags.map((tag: any) => Number(tag.value));
        const localUserId = userId;
        
        try {
          // Type guard for seekersData
          const seekerDataTyped = seekersData as any;
          if (seekerDataTyped?.userId && seekerDataTyped?.id) {
            if (initialSeekerExperiences && initialSeekerExperiences.length > 0) {
              // PUT call for update
              const payload = {
                lookupDataIds,
                updatedBy: localUserId,
                registrationId: seekerDataTyped.id,
              };
              await putCall(endPoints.userProgramExperience(seekerDataTyped.userId), payload, PORTAL);
            } else {
              // POST call for create
              const payload = {
                userId: seekerDataTyped.userId,
                registrationId: seekerDataTyped.id,
                lookupDataIds,
                createdBy: localUserId,
                updatedBy: localUserId,
              };
              await postCall(endPoints.userExperience, payload, PORTAL);
            }
          }
        } catch (err) {
          console.error(seekerExperiencesText.ERROR_MESSAGE, err);
          seekerExperienceSuccess = false;
        }
      }

      // Show appropriate error messages based on what failed (keep overlay open)
      if (reviewAttempted && seekerExperienceAttempted) {
        if (!reviewSuccess && !seekerExperienceSuccess) {
          notify(
            ReviewOverlayText.ERRORS.UPDATE_FAILED_TITLE,
            ReviewOverlayText.ERRORS.REVIEW_AND_EXPERIENCE_FAILED,
            WARNING
          );
          setIsSubmitting(false);
          return;
        } else if (!reviewSuccess) {
          notify(
            ReviewOverlayText.ERRORS.UPDATE_FAILED_TITLE,
            ReviewOverlayText.ERRORS.REVIEW_SECTION_FAILED,
            WARNING
          );
          setIsSubmitting(false); 
          return;
        } else if (!seekerExperienceSuccess) {
          notify(
            ReviewOverlayText.ERRORS.UPDATE_FAILED_TITLE,
            ReviewOverlayText.ERRORS.EXPERIENCE_SECTION_FAILED,
            WARNING
          );
          setIsSubmitting(false);
          return;
        }
      } else if (reviewAttempted && !reviewSuccess) {
        notify(
          ReviewOverlayText.ERRORS.UPDATE_FAILED_TITLE,
          ReviewOverlayText.ERRORS.REVIEW_SECTION_FAILED,
          WARNING
        );
        setIsSubmitting(false); 
        return;
      } else if (seekerExperienceAttempted && !seekerExperienceSuccess) {
        notify(
          ReviewOverlayText.ERRORS.UPDATE_FAILED_TITLE,
          ReviewOverlayText.ERRORS.EXPERIENCE_SECTION_FAILED,
          WARNING
        );
        setIsSubmitting(false); 
        return;
      }

      onSave({ success: true });
      if (onRefresh) onRefresh();
      resetForm();
      handleClose();
    } catch (error) {
      console.error("Unexpected error in handleSave:", error);
      notify(
        ReviewOverlayText.ERRORS.UPDATE_FAILED_TITLE,
        ReviewOverlayText.ERRORS.UNEXPECTED_ERROR,
        WARNING
      );
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false); //Re-enable button after completion
    }
  };

  const recommendationOptions = [
    {
      key: RecommendationLevel.WHOLEHEARTEDLY,
      value: "Wholeheartedly recommended",
    },
    {
      key: RecommendationLevel.AFFIRMATIVELY,
      value: "Affirmatively recommended",
    },
    {
      key: RecommendationLevel.SUPPORTIVELY,
      value: "Supportively recommended",
    },
  ];

  if (!open) return null;

  return (
    <SideDrawerOverlay
      open={open}
      grayLine={true}
      onClose={handleClose}
      headerText={isUpdate ? "Update review and experience" : "Add review and experience"}
      footer={
        <>
          <MuiButton
            variant="outline"
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            cancel
          </MuiButton>
          <Button
            buttonTextClassName={styles.saveButtonText}
            buttonClassName={styles.saveButton}
            onClick={handleSave}
            disable={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Saving..." : isUpdate ? "update" : "save"}
          </Button>
        </>
      
      }
    >
      <div className={styles.ratingForm}>
        {/* Generated by Copilot - Add more robust safety checks for seekersData */}
        {seekersData && 
         typeof seekersData === 'object' && 
         seekersData !== null && 
         Object.keys(seekersData).length > 0 && (
          <UserCard seeker={seekersData} disablePreferences={true} />
        )}
        <div>
          {prevRating?.rating && prevRating.rating !== null && prevRating.rating > 0 && <div className={styles.prevRatingContainer}>
            <div className={styles.prevRatingHeaderContainer}>
              <div className={styles.prevRatingHeader}>
              <span>Previous Rating</span>
              {isOpen ? <img src={CaretCircleUp} alt="Collapse" onClick={() => setIsOpen(false)} className={styles.caretIcon}/> : <img src={CaretCircleDown} alt="Expand" onClick={() => setIsOpen(true)} className={styles.caretIcon}/>}
              </div>
              <GrayLine />
            </div>
            {isOpen && (
              <div className={styles.prevRatingContent}>
              <span className={styles.prevRatingText}>
                {prevRating?.rmContactName && prevRating?.hdbYear
                  ? `${prevRating.rmContactName}'s ${prevRating.hdbYear} ${PREVIOUS_RATING_LABEL}  `
                  : prevRating?.rmContactName
                  ? `${prevRating.rmContactName} ${PREVIOUS_RATING_IS}  `
                  : `${PREVIOUS_RATING_IS_LABEL}  `
                }
                <span className={styles.prevRatingStars}>
                  <span className={styles.starIcon}><img src={star} alt="star" width={13} height={13} /> </span>
                <span className={styles.prevRatingScore}>{prevRating.rating || 0}</span>
               </span>
              </span>
              <p className={styles.prevRatingReview}>{prevRating?.review || ""}</p>
              </div>
            )}
            </div>}
          <div className={styles.filterlabelName}>
            {RecommendationLevelText.rating}
            <GrayLine />
          </div>
          <div className={styles.totalRating}>
            Current rating is{" "}
            <span className={styles.ratingScore}>
              {getAverageRating(form.ratings, RATING_KEYS.length)}
            </span>
          </div>
          {RATING_KEYS.map(({ label, key, rm_display_name }) => (
            <div key={key} className={styles.ratingRow}>
              <span className={styles.filterFieldName}>{rm_display_name}</span>
              <span className={styles.stars}>
                {[1, 2, 3, 4, 5].map((starNum) => (
                  <img
                    key={starNum}
                    src={
                      starNum <= (form.ratings[key]?.rating || 0)
                        ? star
                        : emptyStar
                    }
                    alt=""
                    className={styles.starIcon}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        ratings: {
                          ...prev.ratings,
                          [key]: {
                            ...prev.ratings[key],
                            rating: starNum,
                          },
                        },
                      }))
                    }
                    onDoubleClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        ratings: {
                          ...prev.ratings,
                          [key]: {
                            ...prev.ratings[key],
                            rating: 0,
                          },
                        },
                      }))
                    }
                    style={{
                      cursor: "pointer",
                      width: 24,
                      height: 24,
                      marginRight: 4,
                    }}
                  />
                ))}
              </span>
            </div>
          ))}
        </div>

        <div>
          <span className={styles.filterlabels} style={{ marginTop: 16 }}>
            {RecommendationLevelText.RMReview}
          </span>
          <textarea
            className={styles.textarea}
            rows={4}
            value={form.comments}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, comments: e.target.value }))
            }
          />
        </div>

        <div className={styles.RecommendationHeader}>
          <p className={styles.RecommendationHeaderLabel}>
            {RecommendationLevelText.Recommendation}

          </p>
          <GrayLine />
        </div>

        <div className={styles.RecommendationSection}>
          <span className={styles.filterlabels} style={{ marginTop: 16 }}>
            {RecommendationLevelText.WouldYouLikeToRecommend}
          </span>
          <div className={styles.options}>
            {["yes", "no"].map((opt) => (
              <label className={styles.radioLabel} key={opt}>
                <input
                  type="radio"
                  name="wouldRecommend"
                  value={opt}
                  checked={form.wouldRecommend === opt}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      wouldRecommend: opt,
                    }))
                  }
                />
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </label>
            ))}
          </div>
        </div>


        {form.wouldRecommend === "yes" && (
          <div ref={recommendationRef}>
             <p className={styles.filterlabels} style={{ marginTop: 16, marginBottom: 16 }}>
              {RecommendationLevelText.FollowUpCount}
            </p>
            <Select
              value={form.followUpCount}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  followUpCount: value,
                }))
              }
            >
              <SelectTrigger className={styles.selectTrigger} style={{ width: "30%", maxWidth: "30%" }}>
                <SelectValue placeholder="Select count" className={styles.selectValue} />
              </SelectTrigger>
              <SelectContent 
                className={styles.selectContent}
                style={{ zIndex: 9999, 
                  width: "var(--radix-select-trigger-width)",
                  minWidth: "var(--radix-select-trigger-width)",
                  maxHeight: "200px"
                 }}
                position="popper"
                sideOffset={5}
              >
                {followUpCountOptions.map((count) => (
                  <SelectItem key={count} value={count.toString()} className={styles.selectItem}>
                    {count}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className={styles.RecommendationLabel} style={{ marginTop: 16 }}>
              {RecommendationLevelText.Recommend}
            </p>
            <div className={styles.options}>
              {recommendationOptions.map((opt) => (
                <label className={styles.radioLabel} key={opt.key}>
                  <input
                    type="radio"
                    name="recommendation"
                    value={opt.key}
                    checked={form.recommendation === opt.key}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        recommendation: opt.key,
                      }))
                    }
                  />
                  {opt.value}
                </label>
              ))}
            </div>
            
           
            
            <span className={styles.filterlabels} style={{ marginTop: 16 }}>
              {RecommendationLevelText.Comments}
            </span>
            <textarea
              className={styles.textarea}
              rows={4}
              value={form.recComments}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  recComments: e.target.value,
                }))
              }
            />
          </div>
        )}
        {/* Generated by Copilot - Seeker Experience Section */}
        <div className={styles.RecommendationHeader}>
          <p className={styles.RecommendationHeaderLabel}>
            Seeker Experience
          </p>
          <GrayLine />
        </div>

        <div className={styles.seekerExperienceSection}>
          <SeekerExperienceSelect
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            onInteraction={() => setSeekerExperienceInteracted(true)}
            labelText={seekerExperiencesText.PLACEHOLDER_TEXT}
            placeholder={seekerExperiencesText.PLACEHOLDER_TEXT}
          />
        </div>
      </div>
    </SideDrawerOverlay>
  );
};

export default ReviewOverlay;
