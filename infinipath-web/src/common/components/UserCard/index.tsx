import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import {
  UserCard as UserCardType,
  UserData,
} from "../../../types/seatApproval.ts";
import star from "../../../assets/images/star.svg";
import { Button } from "../Button"; // Adjust path as needed
import CloseIcon from "@mui/icons-material/Close";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import { Avatar, Tooltip } from "@mui/material";
import { ApprovalStatus, REGISTRATION_STATUSES ,textConstant} from "../../../constants/textConstants.ts";
import RoommatePreferencePopup from "../../../components/HdbDotPopover/index.tsx";
import shuffle from "../../../assets/images/shuffle-img.svg";
import uniarrow from "../../../assets/images/arrow-1.svg";
import swaparrow from "../../../assets/images/swap-arrow.svg";
import profile from "../../../assets/images/profile-bg.webp";
import UserPreferencesDropdown from "../UserPreferenceDropDown/index.tsx";
import SessionOverlay from "../../../components/SeatApprovalFlow/SessionOverlay/index.tsx";
import { ApiService } from "../../../services/mockService.ts";
import { mapApiDataToUserCards } from "../../../utils/dataMapper.ts";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism/index.tsx";
import SwapActionCard from "../SwapActionCard/index.tsx";
import { UnallocatedPreferences } from "../UnallocatedPreferences/index.tsx";
import orgIcon from "../../../assets/images/org.svg";
import UseResize from "../UseResize/index.tsx";
import { seekerRegisterDate } from "../../../utils/commonFunctions.ts";
import ImagePreview from "../ImagePreview/index.tsx";
import shuffleDemand from "../../../assets/images/swap-demand1.svg";
interface UserCardProps {
  user: UserCardType;
  getInitials: (name: string) => string;
  handleSeekerClick?: (user: UserData) => void;
  setSelectedSession?: (session: any) => void;
  sessionId: number;
  handleBless: (user: UserData, sessionId: number, tag: string) => void;
  handleBlessed: (
    seekerId: number,
    targetProgramId: number | string,
    swapType: string,
    swapRequestId?: number,
    selectedSwapSeeker?: UserData | null,
  ) => void;
  isFlipped?: boolean;
  onFlip?: () => void;
  onCloseFlip?: () => void;
  programsList?: any[];
  allocatedProgramId?: number | string | null;
  highlightAllocated?: boolean;
  handleShowAllMatches?: (name: string) => void;
  setShowOverlay?: (show: boolean) => void;
  setIsCardClicked?: (isClicked: boolean) => void;
  fetchApprovedUsersForSession?: (session: {
    kpiCategory: string;
    kpiFilter: string;
  }) => void;
  selectedSwapSeeker?: UserData | null;
  setExcludedUserId?: (id: number | null) => void;
  setSelectedSwapSeeker?: (seeker: UserData | null) => void;
  setCustomTitle?: (title: string) => void;
  sessions: any[];
  selectedFilter: { [key: string]: any };
  isOverlay?: boolean;
  isSeekerOverlay?: boolean;
  hideRoomatePreference?: boolean;
}
const UserCard: React.FC<UserCardProps> = ({
  user,
  getInitials,
  sessionId,
  handleBless,
  setSelectedSession,
  isFlipped = false,
  onFlip,
  onCloseFlip,
  handleSeekerClick,
  programsList = [],
  allocatedProgramId,
  highlightAllocated,
  handleShowAllMatches,
  handleBlessed,
  setShowOverlay,
  fetchApprovedUsersForSession,
  setIsCardClicked,
  selectedSwapSeeker,
  setExcludedUserId,
  setSelectedSwapSeeker,
  setCustomTitle,
  sessions,
  selectedFilter,
  isOverlay = true,
  isSeekerOverlay = false,
  hideRoomatePreference,
}) => {
  const [selectedPref, setSelectedPref] = useState(null);
  const [programList, setProgramList] = useState<any[]>([]);
  const [showProgramList, setShowProgramList] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const { isMobileResolution, isTabResolution } = UseResize();
  const [isSessionOverlayOpen, setIsSessionOverlayOpen] = useState(false);
  const [sessionOverlayUsers, setSessionOverlayUsers] = useState<UserData[]>(
    [],
  );
  const [showRoommatePopup, setShowRoommatePopup] = useState(false);
  const popupLeaveTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const dotElementRef = useRef<HTMLDivElement>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState({
    image: '',
    altText: '',
  });
  const [open, setOpen] = useState(false);

  // Add image click handler
  const handleImageClick = (e: React.MouseEvent, user: any) => {
    e.stopPropagation(); // Prevent parent click event
    setPreviewImageUrl({
      image: user.profileImage || defaultProfileIcon,
      altText: user.fullName || "Profile Image",
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!showRoommatePopup) return;

    const checkPopupDirection = () => {};

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dotElementRef.current &&
        !dotElementRef.current.contains(event.target as Node)
      ) {
        setShowRoommatePopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", checkPopupDirection);
    window.addEventListener("scroll", checkPopupDirection, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", checkPopupDirection);
      window.removeEventListener("scroll", checkPopupDirection, true);
    };
  }, [showRoommatePopup]);

  const handleOpenSessionOverlay = async (
    userId: number,
    selectedSession?: unknown,
  ) => {
    // Use fetchApprovedUsersForSession to get all users with kpiCategory and kpiFilter as "all"
    setShowOverlay(true); // Open the overlay
    setCustomTitle &&
      setCustomTitle(`Select seeker to swap from ${selectedSession?.name}`);
    setIsCardClicked(true); // Set card clicked state to true
    setExcludedUserId(userId);
    setSelectedSession &&
      setSelectedSession({
        kpiCategory: "allocated",
        kpiFilter: `program_${selectedSession.value || selectedSession.id}`,
        SwapRequests: selectedFilter?.wantsSwap || "",
      });
  };

  const formatPreferences = (preferences: Array<{ name: string }>) => {
    return preferences.map((pref) => pref.name).join(", ");
  };
  const handlePrefClick = (pref: unknown) => {
    if (pref === "Mahatria's choice") {
      const programList = programsList.map((program) => ({
        id: program.id,
        name: program.name,
      }));
      setProgramList(programList);
      setShowProgramList(true);
      setSelectedProgram(null); // Reset selected program
    } else {
      setShowProgramList(false);
      setSelectedPref(pref);
    }
    onFlip && onFlip();
  };

  const handleProgramSelect = (program: any) => {
    setSelectedProgram(program);
    setSelectedPref(program); // Update selectedPref with the chosen program
  };

  const handleBlessAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedPref) return;

    if (user.approvalStatus !== ApprovalStatus?.PENDING) {
      // Call handleBlessed for approved/hold/rejected users
      handleBlessed(
        selectedSwapSeeker ? user?.registrationId : user.id,
        selectedPref.value || selectedPref.id,
        selectedSwapSeeker ? "swap" : "move",
        user?.swapRequestId || undefined,
        selectedSwapSeeker,
      );
    } else {
      // Call handleBless for other cases
      const sessionId = selectedPref.id || selectedPref.value; // Use id if available, else value
      handleBless(user, sessionId, selectedPref.name);
    }
    // Reset states
    setSelectedPref(null);
    setSelectedProgram(null);
    setShowProgramList(false);
    onCloseFlip?.();
  };

  const handleClose = (e: any) => {
    e.stopPropagation();
    setSelectedPref(null);
    setSelectedSwapSeeker(null);
    setSelectedProgram(null);
    setShowProgramList(false);
    onCloseFlip && onCloseFlip();
  };

  return (
    <div
      className={`${styles.userCard} ${isFlipped ? styles.flipped : ""}`}
      onClick={!isFlipped ? handleSeekerClick : undefined}
      style={
        !isFlipped && !isSeekerOverlay && isOverlay ? { cursor: "pointer" } : {}
      }
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify(user));
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      {!isFlipped ? (
        <>
          <div className={styles.userCardHeader}>
            <div className={styles.ratingWrapper}>
              {!(isMobileResolution || isTabResolution) && (
                <span className={styles.userCardDate}>
                   {`${user.statusDateTimeLabel} - ${seekerRegisterDate(user.statusDateTime)}`}
                </span>
              )}

              {user?.isOrganizationUser && (
                <>
                  {!(isMobileResolution || isTabResolution) && (
                    <span className={styles.verticalDivider}>|</span>
                  )}
                  <img src={orgIcon} alt="org-icon" />
                </>
              )}
            </div>
          </div>
          <div className={styles.userCardContent}>
            <div className={styles.userAvatar}>
            <div className={styles.imageContainer}>
                <Avatar
                  alt="Remy Sharp"
                  src={user.profileImage || defaultProfileIcon}
                  sx={{
                    width: isMobileResolution || isTabResolution ? 82 : 100,
                    height: isMobileResolution || isTabResolution ? 82 : 100,
                    border: "1px solid #fffff",
                  }}
                  data-testid="user-avatar"
                />
                <div
                  className={styles.hoverEyePreview}
                  onClick={(e) => handleImageClick(e, user)}
                ></div>
              </div>
              <div className={styles.hdbBadgeWrapper}>
                {user?.preferredRoomMate && (
                  <div
                    ref={dotElementRef}
                    className={styles.hdbDotPopoverWrapper}
                    onMouseEnter={() => {
                      if (popupLeaveTimeout.current)
                        clearTimeout(popupLeaveTimeout.current);
                      setShowRoommatePopup(true);
                    }}
                    onMouseLeave={() => {
                      popupLeaveTimeout.current = setTimeout(
                        () => setShowRoommatePopup(false),
                        100,
                      );
                    }}
                  >
                    <div className={styles.hdbDot}></div>
                    {showRoommatePopup && !hideRoomatePreference && (
                      <div
                        onMouseEnter={() => {
                          if (popupLeaveTimeout.current)
                            clearTimeout(popupLeaveTimeout.current);
                          setShowRoommatePopup(true);
                        }}
                        onMouseLeave={() => {
                          popupLeaveTimeout.current = setTimeout(
                            () => setShowRoommatePopup(false),
                            100,
                          );
                        }}
                      >
                        <RoommatePreferencePopup
                          roommateName={user.preferredRoomMate}
                          onShowMatches={() =>
                            handleShowAllMatches(
                              user.preferredRoomMate,
                              user.id,
                            )
                          }
                          isVisible={showRoommatePopup}
                          anchorElement={dotElementRef.current}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className={styles.hdbBadge}>
                  {colorizeMahatriaInfinitheism(
                    `${user.completedHDBs.toString().padStart(2, "0")} HDBs`,
                  )}
                </div>
              </div>
            </div>
            <div className={styles.userInfo}>
              <h3 className={styles.userName}>
                {colorizeMahatriaInfinitheism(user.fullName)}
              </h3>
              {isMobileResolution || isTabResolution ? (
                <>
                  <div className={styles.userDetailsMobile}>
                    <div className={styles.userDetails}>
                      {user.city && (
                        <span className={styles.usersubdetails}>
                          {user.city === "Other"
                            ? user.otherCityName
                            : user.city}
                        </span>
                      )}
                      {user?.rmContactUser?.orgUsrName && <span className={styles.divider}>|</span>}

                      {user.rmContactUser?.orgUsrName && (
                        <Tooltip
                      title={
                          user?.rmContactUser?.orgUsrName === "Other"
                            ? user?.otherInfinitheismContact
                            : user?.rmContactUser?.orgUsrName
                        }
                        arrow
                        placement="top"
                      >
                        <span className={styles.rmcontactname}>
                          {colorizeMahatriaInfinitheism(
                            user?.rmContactUser?.orgUsrName === "Other"
                              ? user?.otherInfinitheismContact
                              : user?.rmContactUser?.orgUsrName
                          )}{" "}
                        </span>
                        </Tooltip>
                      )}
                      {user?.rating && (
                        <>
                          <span className={styles.verticalDivider}>|</span>
                          <div className={styles.ratingContainer}>
                            <span className={styles.starIcon}>
                              <img
                                src={star}
                                alt="star"
                                width={13}
                                height={13}
                              />
                            </span>
                            <span className={styles.ratingText}>
                              {user?.rating}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className={styles.userDetails}>
                      <span className={styles.userCardDate}>
                         {`${user.statusDateTimeLabel} - ${seekerRegisterDate(user.statusDateTime)}`}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.userDetails}>
                  <span className={styles.usersubdetails}>
                    {user.gender.charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.divider}>|</span>
                  <span className={styles.usersubdetails}>{user.age} yrs</span>
                  {user.city && <span className={styles.divider}>|</span>}
                  {user.city && (
                    <span className={styles.usersubdetails}>
                      {user?.city === "Other" ? user?.otherCityName : user.city}
                    </span>
                  )}
                  {user?.rmContactUser?.orgUsrName && <span className={styles.divider}>|</span>}

                  {user.rmContactUser?.orgUsrName && (
                    <Tooltip
                      title={
                        user?.rmContactUser?.orgUsrName === "Other"
                          ? user?.otherInfinitheismContact
                          : user?.rmContactUser?.orgUsrName
                      }
                      arrow
                      placement="top"
                    >
                      <span className={styles.rmcontactname}>
                        {colorizeMahatriaInfinitheism(
                          user?.rmContactUser?.orgUsrName === "Other"
                            ? user?.otherInfinitheismContact
                            : user?.rmContactUser?.orgUsrName
                        )}{" "}
                      </span>
                    </Tooltip>
                  )}
                  {user?.rating && (
                    <>
                      <span className={styles.divider}>|</span>
                      <div className={styles.ratingContainer}>
                        <span className={styles.starIcon}>
                          <img src={star} alt="star" width={13} height={13} />
                        </span>
                        <span className={styles.ratingText}>{user?.rating}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
              {!(isMobileResolution || isTabResolution) && (
                <div className={styles.horizontalDivider} />
              )}
              <div className={styles.userPreferences}>
                {user?.shiftRequests && user?.shiftRequests.length > 0 ? (
                  <div className={styles.shiftRequestWrapper}>
                    <div className={styles.shiftRequestDiv}>
                      <div className={styles.allocatedProgramDiv}>
                        <span className={styles.allocatedProgramName}>
                          {colorizeMahatriaInfinitheism(
                            user?.allocatedProgram?.name,
                          )}{" "}
                          blessed
                        </span>
                      </div>
                      <span className={styles.shiftRequestText}>
                        can shift to{""}
                      </span>
                      <Tooltip
                        title={user?.shiftRequests
                          .map((req) => req.name)
                          .join(", ")}
                        arrow
                        placement="top"
                      >
                        <span className={styles.shiftRequestText}>
                          {user?.shiftRequests.length > 2 ? (
                            <>
                              {user?.shiftRequests
                                .slice(0, 2)
                                .map((req: any, idx: number) => (
                                  <span key={idx}>
                                    {colorizeMahatriaInfinitheism(req.name)}
                                    {idx < 1 && ", "}
                                  </span>
                                ))}
                              <span>...</span>
                            </>
                          ) : (
                            user?.shiftRequests.map((req: any, idx: number) => (
                              <span key={idx}>
                                {colorizeMahatriaInfinitheism(req.name)}
                                {idx < user?.shiftRequests.length - 1 && ", "}
                              </span>
                            ))
                          )}
                        </span>
                      </Tooltip>
                    </div>
                    {isOverlay && !isMobileResolution && !isTabResolution && (
                      <UserPreferencesDropdown
                        preferences={(sessions ?? []).map((pref) => ({
                          name: pref.name,
                          value: pref.id || pref.name, // Use pref.id if available, else name
                        }))}
                        highlightPreference={user?.allocatedProgram?.name}
                        onSelect={(pref) => {
                          setSelectedPref(pref);
                          // This will trigger the same flow as clicking a preference chip
                          handlePrefClick(pref);
                        }}
                        onFlip={onFlip}
                        user={user}
                        swapRequests={user.swapRequests}
                        isswapRequest={true}
                        sessions={sessions}
                      />
                    )}
                  </div>
                ) : user?.swapRequests && user?.swapRequests.length > 0 ? (
                  <>
                    <div className={styles.SwapRequestWrapper}>
                      <div className={styles.SwapRequestDiv}>
                        <span
                          className={styles.swapRequestText}
                          // onClick={(e) => {
                          // e.stopPropagation(); // Prevent parent click
                          // }}
                        >
                          swap{" "}
                          {colorizeMahatriaInfinitheism(
                            user?.allocatedProgram?.name,
                          )}
                        </span>
                      </div>
                      <div>
                        <img src={shuffle} alt="shuffle" />
                      </div>

                      <div className={styles.requestedPrefWrapper}>
                        {user.swapRequests && user.swapRequests.length > 0 ? (
                          <Tooltip
                            title={user.swapRequests
                              .map((req) => req.name)
                              .join(", ")}
                            arrow
                            placement="top"
                          >
                            <span className={styles.swapRequestText}>
                              {user.swapRequests.length > 2 ? (
                                <>
                                  {user.swapRequests
                                    .slice(0, 2)
                                    .map((req: any, idx: number) => (
                                      <span key={idx}>
                                        {colorizeMahatriaInfinitheism(req.name)}
                                        {idx < 1 && ", "}
                                      </span>
                                    ))}
                                  <span>...</span>
                                </>
                              ) : (
                                user.swapRequests.map(
                                  (req: any, idx: number) => (
                                    <span key={idx}>
                                      {colorizeMahatriaInfinitheism(req.name)}
                                      {idx < user.swapRequests.length - 1 &&
                                        ", "}
                                    </span>
                                  ),
                                )
                              )}
                            </span>
                          </Tooltip>
                        ) : (
                          <span className={styles.swapRequestText}>
                            Any program
                          </span>
                        )}
                      </div>
                    </div>
                    {isOverlay && !isMobileResolution && !isTabResolution && (
                      <UserPreferencesDropdown
                        preferences={(sessions ?? []).map((pref) => ({
                          name: pref.name,
                          value: pref.id || pref.name, // Use pref.id if available, else name
                        }))}
                        highlightPreference={user?.allocatedProgram?.name}
                        onSelect={(pref) => {
                          setSelectedPref(pref);
                          // This will trigger the same flow as clicking a preference chip
                          handlePrefClick(pref);
                        }}
                        onFlip={onFlip}
                        user={user}
                        swapRequests={user.swapRequests}
                        isswapRequest={true}
                        sessions={sessions}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {user.approvalStatus === ApprovalStatus?.PENDING ? (
                      <>
                        {user?.programPreferences.length < 1 ? (
                          <div className={styles.mahatriaChipWrapper}>
                            {(isMobileResolution || isTabResolution) && (
                              <span>
                                {colorizeMahatriaInfinitheism("Any HDB/MSD")}
                              </span>
                            )}
                            {isOverlay &&
                              !isMobileResolution &&
                              !isTabResolution && (
                                <UserPreferencesDropdown
                                  preferences={(sessions ?? []).map((pref) => ({
                                    name: pref.name,
                                    value: pref.id || pref.name, // Use pref.id if available, else name
                                  }))}
                                  onSelect={(pref) => {
                                    setSelectedPref(pref);
                                    // This will trigger the same flow as clicking a preference chip
                                    handlePrefClick(pref);
                                  }}
                                  highlightPreference={
                                    "mahatriaChoiceUnallocated"
                                  }
                                  onFlip={onFlip}
                                  user={user}
                                  sessions={sessions}
                                />
                              )}
                          </div>
                        ) : (
                          <div className={styles.unallocatedPreferences}>
                            {isMobileResolution || isTabResolution ? (
                              <div className={styles.mobilePreference}>
                                {user.programPreferences &&
                                user.programPreferences.length > 0
                                  ? user.programPreferences.map((pref, idx) => (
                                      <span key={pref.name}>
                                        {pref.name}
                                        {idx <
                                        user.programPreferences.length - 1
                                          ? ", "
                                          : ""}
                                      </span>
                                    ))
                                  : null}
                              </div>
                            ) : (
                              !isSeekerOverlay && (
                                <UnallocatedPreferences
                                  preferences={user.programPreferences}
                                  isOverlay={false}
                                  highlightAllocated={highlightAllocated}
                                  allocatedProgramId={allocatedProgramId}
                                  onPrefClick={handlePrefClick}
                                  onSelect={(pref) => {
                                    setSelectedPref(pref);
                                    handlePrefClick(pref);
                                  }}
                                  sessions={sessions}
                                  isSeekerOverlay={isSeekerOverlay}
                                />
                              )
                            )}
                            {isOverlay &&
                              !isMobileResolution &&
                              !isTabResolution && (
                                <UserPreferencesDropdown
                                  preferences={user.programPreferences.map(
                                    (pref) => ({
                                      label: pref.name,
                                      value: pref.id || pref.name, // Use pref.id if available, else name
                                    }),
                                  )}
                                  highlightPreference={"preferencesUnallocated"}
                                  onSelect={(pref) => {
                                    setSelectedPref(pref);
                                    handlePrefClick(pref);
                                  }}
                                  sessions={sessions}
                                />
                              )}
                          </div>
                        )}
                      </>
                    ) : user?.approvalStatus === ApprovalStatus?.APPROVED ? (
                      <>
                        {user?.swapRequests && user?.swapRequests.length > 0 ? (
                          <></>
                        ) : (
                          <div className={styles.userPreferences}>
                            {user?.allocatedProgram && (
                              <div className={styles.allocatedProgramWrapper}>
                                <div className={styles.allocatedProgramDiv}>
                                  <span className={styles.allocatedProgramName}>
                                    {colorizeMahatriaInfinitheism(
                                      user?.allocatedProgram?.name,
                                    )}{" "}
                                    blessed
                                  </span>
                                </div>
                                {user.programPreferences &&
                                user.programPreferences.length === 0 ? (
                                  <>
                                    {isOverlay &&
                                      !isMobileResolution &&
                                      !isTabResolution && (
                                        <UserPreferencesDropdown
                                          preferences={(sessions ?? []).map(
                                            (pref) => ({
                                              name: pref.name,
                                              value: pref.id || pref.name, // Use pref.id if available, else name
                                            }),
                                          )}
                                          onSelect={(pref) => {
                                            setSelectedPref(pref);
                                            // This will trigger the same flow as clicking a preference chip
                                            handlePrefClick(pref);
                                          }}
                                          highlightPreference={
                                            user.allocatedProgram?.name
                                          }
                                          mahatriachoiceType={
                                            "mahatriaChoiceBlessed"
                                          }
                                          onFlip={onFlip}
                                          user={user}
                                          sessions={sessions}
                                        />
                                      )}
                                  </>
                                ) : (
                                  user.programPreferences &&
                                  user.programPreferences.length > 0 &&
                                  isOverlay &&
                                  !isMobileResolution &&
                                  !isTabResolution && (
                                    <UserPreferencesDropdown
                                      preferences={user.programPreferences.map(
                                        (pref) => ({
                                          name: pref.name,
                                          value: pref.id || pref.name, // Use pref.id if available, else name
                                        }),
                                      )}
                                      highlightPreference={
                                        user?.allocatedProgram?.name
                                      }
                                      onSelect={(pref) => {
                                        setSelectedPref(pref);
                                        // This will trigger the same flow as clicking a preference chip
                                        handlePrefClick(pref);
                                      }}
                                      onFlip={onFlip}
                                      user={user}
                                      sessions={sessions}
                                    />
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {user.approvalStatus === ApprovalStatus?.ON_HOLD ||
                        user.approvalStatus === ApprovalStatus?.REJECTED ? (
                          <div className={styles.userPreferences}>
                            <div className={styles.allocatedProgramWrapper}>
                              {user.approvalStatus ===
                                ApprovalStatus?.ON_HOLD ||
                              user.approvalStatus ===
                                ApprovalStatus?.REJECTED ? (
                                <div
                                  className={
                                    user.approvalStatus ===
                                    ApprovalStatus?.ON_HOLD
                                      ? ""
                                      : styles.holdDiv
                                  }
                                >
                                  <span
                                    className={
                                      user.approvalStatus ===
                                      ApprovalStatus?.ON_HOLD
                                        ? styles.holdText
                                        : styles.holdText
                                    }
                                  >
                                    {user.approvalStatus ===
                                    ApprovalStatus?.REJECTED
                                     
                                      ? "on hold": ""}
                                      {
                                        user.approvalStatus ===
                                        ApprovalStatus?.ON_HOLD
                                        &&
                                        (
                                          (
                                            // Display swap demand information
                                            <div className={styles.SwapRequestDemandWrapper}> 
                                              <div className={styles.SwapRequestDiv}>
                                                <span className={styles.swapRequestText}>
                                                  Swap demand{" "}
                                                  {colorizeMahatriaInfinitheism(
                                                    user.swapDemandCurrentProgram,
                                                  )}
                                                </span>
                                              </div>
                                              <div>
                                                <img src={shuffleDemand} alt="shuffle" />
                                              </div>
                                
                                              <div className={styles.requestedPrefWrapper}>
                                                {user.swapDemandPrograms &&
                                                user.swapDemandPrograms.length > 0 ? (
                                                  <Tooltip
                                                    title={user.swapDemandPrograms
                                                      .map((req) => req.name)
                                                      .join(", ")}
                                                    arrow
                                                    placement="top"
                                                  >
                                                    <span className={styles.swapRequestText}>
                                                      {user.swapDemandPrograms.length > 1 ? (
                                                        <>
                                                          {user.swapDemandPrograms
                                                            .slice(0, 1)
                                                            .map((req: any, idx: number) => (
                                                              <span key={idx}>
                                                                {colorizeMahatriaInfinitheism(req.name)}
                                                                {idx < 1 && ", "}
                                                              </span>
                                                            ))}
                                                          <span>...</span>
                                                        </>
                                                      ) : (
                                                        user.swapDemandPrograms.map(
                                                          (req: any, idx: number) => (
                                                            <span key={idx}>
                                                              {colorizeMahatriaInfinitheism(req.name)}
                                                              {idx < user.swapDemandPrograms.length - 1 &&
                                                                ", "}
                                                            </span>
                                                          ),
                                                        )
                                                      )}
                                                    </span>
                                                  </Tooltip>
                                                ) : (
                                                  <span className={styles.swapRequestText}>
                                                    Any program
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          )

                                        )
                                      }
                                  </span>
                                </div>
                              ) : (
                                <span>[Hold]</span>
                              )}{" "}
                              {user.programPreferences &&
                              user.programPreferences.length === 0 ? (
                                <>
                                  <span
                                    className={styles.mahatriaChipNoBg}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent parent click
                                    }}
                                  >
                                    {isOverlay &&
                                      !isMobileResolution &&
                                      !isTabResolution && (
                                        <UserPreferencesDropdown
                                          preferences={(sessions ?? []).map(
                                            (pref) => ({
                                              name: pref.name,
                                              value: pref.id || pref.name, // Use pref.id if available, else name
                                            }),
                                          )}
                                          onSelect={(pref) => {
                                            setSelectedPref(pref);
                                            handlePrefClick(pref);
                                          }}
                                          mahatriachoiceType="mahatriaChoiceHold"
                                          highlightPreference={
                                            user.approvalStatus ===
                                            ApprovalStatus?.ON_HOLD
                                              ? "yet-to-decide"
                                              : user.approvalStatus ===
                                                  ApprovalStatus?.REJECTED
                                                ? "hold"
                                                : user?.allocatedProgram?.id ||
                                                  user?.allocatedProgram?.name
                                          }
                                          isswapRequest={user.approvalStatus ===
                                            ApprovalStatus?.ON_HOLD}
                                          sessions={sessions}
                                          swapRequests={user.swapDemandPrograms}
                                        />
                                      )}
                                  </span>
                                </>
                              ) : (
                                user.programPreferences &&
                                user.programPreferences.length > 0 &&
                                isOverlay &&
                                !isMobileResolution &&
                                !isTabResolution && (
                                  <UserPreferencesDropdown
                                    preferences={user.programPreferences.map(
                                      (pref) => ({
                                        name: pref.name,
                                        value: pref.id || pref.name, // Use pref.id if available, else name
                                      }),
                                    )}
                                    highlightPreference={
                                      user.approvalStatus ===
                                      ApprovalStatus?.ON_HOLD
                                        ? "yet-to-decide"
                                        : user.approvalStatus ===
                                            ApprovalStatus?.REJECTED
                                          ? "hold"
                                          : user?.allocatedProgram?.id ||
                                            user?.allocatedProgram?.name
                                    }
                                    onSelect={(pref) => {
                                      setSelectedPref(pref);
                                      handlePrefClick(pref);
                                    }}
                                    isswapRequest={user.approvalStatus ===
                                      ApprovalStatus?.ON_HOLD}
                                    sessions={sessions}
                                    swapRequests={user.swapDemandPrograms}
                                  />
                                )
                              )}
                            </div>
                            {/* )} */}
                          </div>
                        ) : (
                          <>
                           {user.approvalStatus === ApprovalStatus?.CANCELLED && (
                            <div className={styles.cancelledDiv}>
                             <span className={styles.allocatedProgramName}>
                              {ApprovalStatus.CANCELLED}
                             </span>
                             </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
              {user.preferredRoomMate &&
                isSeekerOverlay &&
                !isMobileResolution &&
                !isTabResolution && (
                  <div className={styles.roommatePreferenceRow}>
                    <div className={styles.roommateDot}></div>
                    <span className={styles.roommateLabel}>
                      Roommate preference
                    </span>
                    <span className={styles.roommateName}>
                      {user.preferredRoomMate}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.userCardHeader}>
            <button
              className={styles.closeIcon}
              onClick={(e) => {
                handleClose(e);
              }}
              type="button"
              aria-label="Close"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
          {user.approvalStatus === ApprovalStatus?.APPROVED &&
          selectedPref?.name !== "Hold" &&
          selectedPref?.name !== ApprovalStatus.YTD ? (
            <SwapActionCard
              user={user}
              selectedSwapSeeker={selectedSwapSeeker}
              selectedPref={selectedPref}
              handleBlessAction={handleBlessAction}
              handleOpenSessionOverlay={handleOpenSessionOverlay}
              _isFlipped={isFlipped}
            />
          ) : (
            <div
              className={`${styles.userCardContent} ${isFlipped ? styles.flipped : ""}`}
            >
              <div className={styles.userAvatar}>
                <Avatar
                  alt="Remy Sharp"
                  src={user.profileImage || defaultProfileIcon}
                  sx={{
                    width: 100,
                    height: 100,
                    border: "1px solid #fffff",
                  }}
                  data-testid="user-avatar"
                />
              </div>
              <div className={styles.userInfo}>
                {showProgramList ? (
                  <h3 className={styles.redirectText}>
                    Choose a program to bless{" "}
                    {colorizeMahatriaInfinitheism(user.fullName)}
                    <br />
                    <div className={styles.userPreferences}>
                      {programList.map((program, idx) => (
                        <span
                          key={idx}
                          onClick={() => handleProgramSelect(program)}
                          className={`${styles.preferenceChip} ${
                            selectedProgram?.id === program.id
                              ? styles.selectedProgram
                              : ""
                          }`}
                          style={{
                            cursor: "pointer",
                            border:
                              selectedProgram?.id === program.id
                                ? "2px solid #007bff"
                                : "none",
                          }}
                        >
                          {colorizeMahatriaInfinitheism(program.name)}
                        </span>
                      ))}
                    </div>
                  </h3>
                ) : (
                  <h3 className={styles.redirectText}>
                    {selectedPref?.name === "Hold" ? (
                      <>
                        <span className={styles.mahatriaText}>Mahatria</span> is
                        placing {user.fullName} on hold
                      </>
                    ) : selectedPref?.name === ApprovalStatus.YTD ? (
                      <>
                        <span className={styles.mahatriaText}>Mahatria</span> is
                        placing {user.fullName} on {ApprovalStatus.YTD}
                      </>
                    ) : (
                      <>
                        <span className={styles.mahatriaText}>Mahatria</span> is
                        blessing {user.fullName} by allocating
                        <br />
                        <span>
                          {colorizeMahatriaInfinitheism(selectedPref?.name)}{" "}
                          seat
                        </span>
                      </>
                    )}
                  </h3>
                )}
                <Button
                  buttonClassName={styles.actionButton}
                  buttonTextClassName={styles.actionButtonText}
                  onClick={(e) => {
                    handleBlessAction(e);
                  }}
                  disable={!selectedPref}
                >
                  {selectedPref?.name !== "Hold" && selectedPref?.name !== ApprovalStatus.YTD
                    ? "bless"
                    : selectedPref?.name === "Hold"
                      ? "hold"
                      : selectedPref?.name === ApprovalStatus.YTD
                        ? ApprovalStatus.YTD
                        : selectedPref?.name}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      <ImagePreview 
        imageUrl={previewImageUrl?.image} 
        altText={previewImageUrl?.altText || "Profile Image"} 
        setOpen={setOpen} 
        isOpen={open} 
        width={600}
        height={400}
      />
    </div>
  );
};

export default UserCard;
