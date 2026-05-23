// components/UserCard/UserCard.tsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import { UserCard as UserCardType } from "../../../types/seatApproval";
import { calculateAges, seekerRegisterDate } from "../../../../../utils/commonFunctions";
import defaultProfileIcon from "../../../../../assets/images/default-profile.svg";
import { Avatar, Tooltip } from "@mui/material";
import { Session } from "../../../types/session"; // Adjust the import path as necessary
import SessionsCard from "../../programSessions";
import MoveProgramCard from "../../../../../common/components/MoveProgramCard";
import { useResponsive } from "../../../../../utils/functions";
import { UserData } from "../../../../../types/seatApproval";
import starIcon from "../../../../../assets/images/star.svg";
import { Button } from "../../../../../common/components/Button";
import UniDirection from "../../../../../assets/images/uni-direction.svg";
import { Users } from "lucide-react";
import { ApprovalStatus, REGISTRATION_STATUSES } from "../../../../../constants/textConstants";
import { colorizeMahatriaInfinitheism } from "../../../../../common/components/ColorizeMahatriaInfinitheism";
import ImagePreview from "../../../../../common/components/ImagePreview";
import {PROFILE_IMAGE_ALT_TEXT, textConstant} from "../../../../../constants/textConstants";


interface PreferenceItem {
  name: string;
}

interface UserCardProps {
  seeker: UserCardType;
  getInitials?: (name: string) => string;
  preferenceData?: PreferenceItem[];
  disablePreferences?: boolean;
  messageSection?: boolean; // Optional class for avatar styling
  sessions?: Session[]; // Replace with actual type if available
  onClose?: () => void; // Function to close the card
  onBless?: (sessionId: number) => void; // Function to handle blessing a
  user?: any;
  handleBlessed?: (seekerId: number,
    targetProgramId: number,
    swapType: string,
    swapRequestId?: number) => void; // Add these
  currentProgram?: string;
  handleSeekerClick?: (user: UserData) => void;
  availablePrograms?: Session[];
  onProgramSelect?: (program: any) => void;
  onCancel?: () => void;
  programId?: string;
  handleSwapUser?: (user: any, programId: any) => void;
  selectedSwapProgram?: any;
  selectedSwapUser?: any;
  hideRoommatePreferences?: boolean;
  selectedOption?: any;
  appliedDateOn?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  seeker,
  preferenceData = [],
  handleSeekerClick,
  disablePreferences = false,
  messageSection = false,
  sessions,
  onBless,
  onClose,
  handleBlessed,
  currentProgram,
  availablePrograms,
  onProgramSelect,
  onCancel,
  programId,
  handleSwapUser,
  selectedSwapProgram,
  hideRoommatePreferences = false,
  selectedSwapUser,
  user,
  appliedDateOn = false,
  selectedOption,
}) => {
  const [previewImageUrl, setPreviewImageUrl] = useState({
    image: "",
    altText: "",
  });
  const [open, setOpen] = useState(false);
  const handleImageClick = (e: React.MouseEvent, seeker: any) => {
    e.stopPropagation();
    setPreviewImageUrl({
      image: seeker.profileUrl || defaultProfileIcon,
      altText: seeker.fullName || PROFILE_IMAGE_ALT_TEXT,
    });
    setOpen(true);
  };

  // Helper functions
  const getUserName = (): string => {
    return seeker?.fullName || seeker?.seekerName || "Unknown User";
  };

  const getHdbCount = (): number => {
    return  seeker?.noOfHdbs || seeker?.noOfHDBs || seeker?.numberOfHDBs || seeker?.completedHDBs || 0;
  };

  const getFormattedHdbCount = (): string => {
    return getHdbCount().toString().padStart(2, "0");
  };

  const getUserGender = (): string => {
    return seeker.gender?.charAt(0)?.toUpperCase() || "";
  };
  const getUserAge = (): string => {
    try {
      if (seeker.age !== undefined && seeker.age !== null) {
        return `${seeker.age} yrs`;
      }
      return seeker.dob ? `${calculateAges(seeker.dob)} yrs` : "N/A";
    } catch (error) {
      console.error("Error calculating age:", error);
      return "N/A";
    }
  };

  const getUserLocation = (): string | null => {
    return seeker.city || seeker.location || null;
  };

  const getMessageSection = (): boolean => {
    return messageSection;
  };

  const { isMobileResolution, isTabletResolution } = useResponsive();
  const getFormattedAppliedDate = (): string => {
    const dateStr = seeker.createdAt || seeker.appliedOn;
    if (!dateStr) return "N/A";

    try {
      // Add 5 hours 30 minutes (19800000 ms) to convert UTC to IST
      const date = new Date(dateStr);
      
      const day = String(date.getDate()).padStart(2, "0");
      const month = date.toLocaleString("en-US", { month: "short" }); 
      const year = date.getFullYear();

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

       return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;

    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const shouldShowMahatriaChoice = (): boolean => {
    return !disablePreferences && preferenceData.length === 0;
  };

  const shouldShowPreferences = (): boolean => {
    return !disablePreferences && preferenceData.length > 0;
  };

  // Render components
  const renderUserAvatar = () => (
    <div
      className={isTabletResolution ? styles.userAvatarTab : styles.userAvatar}
       onClick={(e) => handleImageClick(e, seeker)}
    >
    <div className={styles.imageContainer}>
      <Avatar
        alt="Remy Sharp"
        src={seeker.userProfileUrl || seeker.profileImage || seeker.profileUrl || defaultProfileIcon}
        sx={{
          width: "100%",
          height: "100%",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          border: "1px solid #fff",
          objectFit: "cover",
          display: "block",
        }}
        data-testid="user-avatar"

      />
      <div
        className={styles.hoverEyePreview}
      ></div>
      </div>
      <div className={styles.hdbBadgeWrapper}>
        {seeker?.preferredRoomMate && <div className={styles.hdbDot}></div>}
        <div className={styles.hdbBadge}>{colorizeMahatriaInfinitheism(`${getFormattedHdbCount()} HDBs`)}</div>
      </div>
    </div>
  );

  const renderUserDetails = () => {
    const userLocation = getUserLocation();

    return (
      <div className={styles.userDetails}>
        {(isMobileResolution || isTabletResolution) && (
          <>
            <span className={styles.usersubdetails}>{getUserLocation()}</span>
            {user?.rating && (
              <>
                <span className={styles.divider}>|</span>
                <div className={styles.ratingContainer}>
                  <img
                    src={starIcon}
                    alt="Star Icon"
                    className={styles.starIcon}
                  />
                  <span className={styles.averageRating}>
                    {user?.rating || 0}
                  </span>
                </div>
              </>
            )}
          </>
        )}
        {!isMobileResolution && !isTabletResolution && (
          <>
            <span className={styles.usersubdetails}>{getUserGender()}</span>
            <span className={styles.divider}>|</span>
            <span className={styles.usersubdetails}>{getUserAge()}</span>
            {/* <span className={styles.divider}>|</span>
        <span className={styles.usersubdetails}>
          {getFormattedHdbCount()} Programs
        </span> */}
            {userLocation && (
              <>
                <span className={styles.divider}>|</span>
                <span className={styles.usersubdetails}>{userLocation}</span>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  const renderMahatriaChoice = () => (
    <span className={styles.mahatriaChip}>
      <span className={styles.mahatriaBlue}>Any HDB/MSD</span>
    </span>
  );

  const preferencesRef = useRef<HTMLDivElement>(null);

  const renderPreferences = () => (
    <>
      {preferenceData.map((pref, idx) => (
        <span
          key={`pref-${idx}-${pref.name}`}
          className={styles.preferenceChip}
        >
          {pref.name}
        </span>
      ))}
    </>
  );

  const renderUserPreferences = () => {
    if (disablePreferences) return null;
    return (
      <div className={styles.userPreferences}>
        {shouldShowMahatriaChoice()
          ? renderMahatriaChoice()
          : (isMobileResolution || isTabletResolution) ? (preferenceData.map((p) => p.name).join(", ")) : (renderPreferences())}
      </div>
    );
  };

  const renderRoommateInfo = () => {
    if (!seeker.preferredRoomMate || hideRoommatePreferences) return null;
    return (
      <div className={styles.roommateContent}>
        <div className={styles.hdbpinkDot}></div>
        <div className={styles.roommatePreference}>Roommate preference</div>
        <div className={styles.roommateName}>{seeker.preferredRoomMate}</div>
      </div>
    );
  };

  return (
    <div className={styles.userCardWrapper}>
      <div
        className={
          !handleSeekerClick
            ? styles.seekerDetailsContainer
            : styles.userCardOnHome
        }
      >
        <div
          className={
           seeker?.isDefaulter ? styles.defaulterUserCard : styles.userCard
          }
          onClick={() => handleSeekerClick && handleSeekerClick(user?.id)}
        >
          <div className={styles.userCardContent}>
            {renderUserAvatar()}
            <div className={styles.userInfo}>
              {!isMobileResolution && !isTabletResolution && !appliedDateOn && (
                <div className={styles.appliedDate}>
                  <p className={styles.appliedOn}>
                    {`${seeker.statusDateTimeLabel} - ${seekerRegisterDate(seeker.statusDateTime)}`}
                  </p>
                </div>
              )}
              <h3 className={styles.userName}>{getUserName()}</h3>
              {renderUserDetails()}
              {!isMobileResolution &&
                !isTabletResolution &&
                appliedDateOn && (
                  <div className={styles.appliedDateOn}>
                    <p className={styles.appliedOnDate}>
                      {`${seeker.statusDateTimeLabel} - ${seekerRegisterDate(seeker.statusDateTime)}`}
                    </p>
                  </div>
                )}
              <p className={styles.appliedDateMobile}>
                {getFormattedAppliedDate()}
              </p>
              <div className={styles.allocatedProgram}>
                {isMobileResolution || isTabletResolution ? (
                  user?.allocatedProgram !== null ? (
                    <>
                      <p className={styles[user?.approvalStatus]}>
                        {user?.allocatedProgram?.name}
                      </p>
                 </>
                  ) : user?.approvalStatus === ApprovalStatus.ON_HOLD ? (
                    <p className={styles[user?.approvalStatus]}>{textConstant.YET_TO_DECIDE}</p>
                  ) : user?.approvalStatus !== ApprovalStatus.PENDING ? (
                    <p className={styles[user?.approvalStatus]}>{ApprovalStatus.HOLD}</p>
                  ) : null
                ) : null}
                {user?.swapRequests && user?.swapRequests.length > 0 && (isMobileResolution || isTabletResolution) ? (
                  <>
                    <div>
                      <img src={UniDirection} />
                    </div>
                    <div className={styles.requestedPrefWrapper}>
                      {user?.swapRequests && user?.swapRequests.length > 0 ? (
                        user?.swapRequests.map((req: any, idx: number) => (
                          <span className={styles.requestedPref} key={idx}>
                            {req.name}
                            {idx < user?.swapRequests.length - 1 && ", "}
                          </span>
                        ))
                      ) : (
                        <span className={styles.requestedPref}>
                          Any program
                        </span>
                      )}
                    </div>
                  </>) : (
                  (renderUserPreferences())
                )}
              </div>
              {!isMobileResolution && !isTabletResolution && renderRoommateInfo()}
            </div>
          </div>
        </div>
        {(isMobileResolution || isTabletResolution) && !handleSeekerClick && (
          user?.approvalStatus === ApprovalStatus.PENDING || user?.approvalStatus === ApprovalStatus.ON_HOLD || user?.approvalStatus === ApprovalStatus.REJECTED ? (
            <SessionsCard user={user} sessions={sessions} onBless={onBless} onClose={onClose} />
          ) : (
            <>
              <MoveProgramCard
                user={user}
                handleBless={handleBlessed}
                currentProgram={currentProgram}
                availablePrograms={availablePrograms}
                onProgramSelect={onProgramSelect}
                onCancel={onCancel}
                programId={programId}
                handleSwapUser={handleSwapUser}
              />
              <>
                {Object.keys(selectedSwapProgram)?.length &&
                !Object.keys(selectedSwapUser)?.length ? (
                  <div className={styles.userDescription}>
                    moving {user?.fullName} to{" "}
                    {selectedSwapProgram?.name}
                  </div>
                ) : Object.keys(selectedSwapUser).length ? (
                  <div className={styles.userDescription}>
                    {user?.fullName} is being swapped
                    into {selectedSwapProgram?.name}, and{" "}
                    {selectedSwapUser?.fullName} into{" "}
                    {selectedOption.label}.
                  </div>

                ) : null}
              </>
              <div className={styles.swapBlessedButton}>
                <Button
                  type="submit"
                  buttonClassName={`${styles.buttonContainer} ${selectedSwapProgram ? styles.active : ""}`}
                  buttonTextClassName={styles.buttonText}
                  datatestid="add-program-save-button"
                  datatestidText="add-program-save"
                  onClick={() => {
                    if (user?.registrationId) {
                      handleBlessed(
                        user?.registrationId,
                        selectedSwapProgram,
                        "swap",
                        user?.swapRequestId,
                      );
                    }
                  }}
                  disable={
                    !selectedSwapProgram ||
                    Object.keys(selectedSwapProgram).length === 0
                  }
                >
                  <span className={styles.blessText}>bless</span>
                </Button>
              </div>
            </>

          )
        )}
      </div>
      {isMobileResolution && !handleSeekerClick && renderRoommateInfo()}
      <ImagePreview
        imageUrl={previewImageUrl.image}
        altText={previewImageUrl.altText || "Profile Image"}
        setOpen={setOpen}
        isOpen={open}
        width={600}
        height={400}
      />
    </div>
  );
};

export default React.memo(UserCard);
