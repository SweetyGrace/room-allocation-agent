import Avatar from "@mui/material/Avatar";
import SectionCard from "../SectionCard";
import styles from "./index.module.scss";
import { useDashboard } from "../../context/HDBDashboardContext";
import ReviewOverlay from "../RatingOverLay";
import { useState } from "react";
import { colorizeMahatriaInfinitheism } from "../../common/components/ColorizeMahatriaInfinitheism";
import { transformFiltersForLocation } from "../../utils/commonFunctions";

const YetToReview = ({ data, programId, fetchDashboardData }) => {
  const { updateFilters } = useDashboard();

  // State for review overlay
  const [showReviewOverlay, setShowReviewOverlay] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Early return AFTER all hooks
  if (!data?.values?.length) return null;


  const showAllReviews = () => {
    updateFilters(transformFiltersForLocation(data.filters));
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setShowReviewOverlay(true);
  };

  // When review is saved, close overlay and clear selected user
  const handleSaveReview = () => {
    setShowReviewOverlay(false);
    setSelectedUser(null);
    fetchDashboardData();
  };

  // Helper to get initial ratings object
  const getInitialRatings = (user) => {
    if (Array.isArray(user?.ratings)) {
      return user.ratings.reduce((acc, r) => {
        acc[r.ratingKey] = { rating: r.rating, id: r.id };
        return acc;
      }, {});
    }
    return {};
  };

  return (
    <>
      <SectionCard
        title={data.displayName || "Yet to review"}
        totalLabel={`${data.count ?? data.values.length}`}
        label="Total"
        onClick={showAllReviews}
        actionItem="view all"
      >
        {data?.values?.map((user, index) => {
          const avatar = user.userProfileUrl || `/avatars/default.png`;
          const name = user.fullName || "Unknown";
          const hdbs = user.noOfHdbs ?? 0;

          return (
            <div
              key={index}
              className={styles.reviewItem}
              onClick={() => handleRowClick(user)}
            >
              <Avatar src={avatar} alt={name} className={styles.avatar} />
              <span className={styles.name}>{colorizeMahatriaInfinitheism(name)}</span>
              <div className={styles.hdbsContainer}>
                <span>
                  <span className={styles.hdbs}>
                    {String(hdbs).padStart(2, "0")}
                  </span>
                  <span className={styles.hdbsText}>{colorizeMahatriaInfinitheism("HDBs")}</span>
                </span>
              </div>
            </div>
          );
        })}
      </SectionCard>
      {showReviewOverlay && selectedUser && (
        <ReviewOverlay
          open={true}
          onClose={() => {
            setShowReviewOverlay(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveReview}
          seekerId={selectedUser?.programRegistrationId}
          programId={programId}
          initialRatings={getInitialRatings(selectedUser)}
          initialComments={selectedUser?.rmComments || ""}
          seekersData={selectedUser}
          disablePreferences={true}
        />
      )}
    </>
  );
};

export default YetToReview;
