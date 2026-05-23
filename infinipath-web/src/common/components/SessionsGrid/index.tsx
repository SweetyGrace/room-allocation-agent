import React from "react";
import styles from "./index.module.scss";
import { Avatar } from "@mui/material";
import { Button } from "../../../common/components/Button";
import { DashedBorderBox } from "../../../common/components/DashedBorderBox";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import cross_Bg from "../../../assets/images/CrossNew.svg";
import SessionOverlay from "../../../components/SeatApprovalFlow/SessionOverlay";
import { ApprovalStatus, textConstant } from "../../../constants/textConstants";
import { SessionsGridProps } from "../../../types/seatApproval";
import uniarrow from "../../../assets/images/swap-arrow-1.svg";
import swaparrow from "../../../assets/images/swap-arrow-2.svg";
import profile from "../../../assets/images/profile-bg.webp";
import { handleSessionGridBlessAction } from "../../../utils/seekerApproval";
import SwapActionCard from "../SwapActionCard";
import BuildingOffice from "../../../assets/images/org.svg";
import {
  formatSingleDigit,
  isSessionStartingSoon,
} from "../../../utils/commonFunctions";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";
import peopleIcon from "../../../assets/images/people-icon.svg";
import bedIcon from "../../../assets/images/bed-icon.svg";

export const SessionsGrid: React.FC<SessionsGridProps> = ({
  sessions,
  dragOverSessionId,
  selectedSession,
  showOverlay,
  sessionId,
  approvedUsers,
  isLoading,
  programId,
  totalRecords,
  onDragOver,
  onDragLeave,
  setSelectedSession,
  onDrop,
  onSessionClick,
  onRemoveFromSession,
  onBless,
  onCloseOverlay,
  handleBlessed,
  selectedSwapSeeker,
  fetchApprovedUsersForSession,
  setShowOverlay,
  setExcludedUserId,
  setCustomTitle,
  setIsCardClicked,
  sessionpaginationProps,
  handleSessionPageChange,
  handleSessionPageSizeChange,
  setSessionSearchText,
  selectedFilter,
  setSelectedFilter,
  overlayLoader = false, // Default value for overlayLoader
  draggedUser,
}) => {
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
    fetchApprovedUsersForSession({
      kpiCategory: "allocated",
      kpiFilter: `program_${selectedSession.value || selectedSession.id}`,
      SwapRequests: selectedFilter?.wantsSwap || "",
    });
  };

  const handleDragOver = (e: React.DragEvent, sessionId: number | string) => {
    if (e.dataTransfer.types.includes("application/json")) {
      onDragOver(e, sessionId);
    }
  };

  const handleDrop = (e: React.DragEvent, sessionId: string | number) => {
    if (e.dataTransfer.types.includes("application/json")) {
      const userData = e.dataTransfer.getData("application/json");
      const draggedUser = JSON.parse(userData);

      onDrop({ ...e, draggedUser }, sessionId);
    } else {
      e.stopPropagation(); // block images/icons/files
    }
  };
  const filteredSessions = sessions.filter((session) => {
    // Always keep Hold and YTD
    if (
      session.name === ApprovalStatus.HOLD ||
      session.name === ApprovalStatus.YTD
    ) {
      return true;
    }

    // Filter out sessions starting within 10 days
    return !isSessionStartingSoon(session);
  });

  return (
    <div className={styles.sessionsGrid}>
      {filteredSessions?.map((session) => {
        const warning = 
        session.allocatedCount > session.totalSeekers ||
        session.allocatedCount - session.organisationUserCount > session.totalBeds;
    
        return(
        <div
          key={session.id}
          className={`${styles.sessionCard} 
            ${dragOverSessionId === session.id ? styles.dragOver : ""}
            ${session.assignedUsers.length > 0 ? styles.hasUser : ""}`}
          onDragOver={(e) => handleDragOver(e, session.id)}
          onDragLeave={onDragLeave}
          onDrop={(e) => handleDrop(e, session.id)}
          onClick={() => onSessionClick(session)}
        >
          <div className={styles.sessionUsers}>
            {session?.assignedUsers?.length > 0 ? (
              session?.assignedUsers?.map((user) =>
                user?.approvalStatus === ApprovalStatus?.PENDING ||
                user?.approvalStatus === ApprovalStatus?.ON_HOLD ||
                user?.approvalStatus === ApprovalStatus?.REJECTED ||
                session?.name == "Hold" ||
                session?.name == ApprovalStatus.YTD ? (
                  <div
                    key={user.id}
                    className={styles.assignedUser}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={cross_Bg}
                      alt="cross"
                      className={styles.crossBg}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromSession(user, session.id);
                      }}
                    />
                    <div className={styles.userInfo}>
                      <Avatar
                        alt="User Avatar"
                        src={user.profileImage || defaultProfileIcon}
                        sx={{
                          width: 60,
                          height: 60,
                          border: "1px solid #00000014",
                        }}
                        data-testid="user-avatar"
                      />
                      <span className={styles.fullnameStyles}>
                        {session.name !== ApprovalStatus.HOLD &&
                        session.name !== ApprovalStatus.YTD ? (
                          <span>
                            bless{" "}
                            <span
                              className={styles.fullnameEllipsis}
                              title={user.fullName}
                            >
                              {user.fullName}
                            </span>{" "}
                            with {colorizeMahatriaInfinitheism(session.name)}
                          </span>
                        ) : (
                          <span>
                            Place {user.fullName} on{" "}
                            {session.name === "Hold" ? "hold" : session.name}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className={styles.buttonContainerbless}>
                      <Button
                        buttonClassName={styles.confirmButton}
                        buttonTextClassName={styles.cancelText}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSessionGridBlessAction({
                            user,
                            session,
                            selectedSwapSeeker,
                            handleBlessed,
                            onBless,
                          });
                        }}
                      >
                        {session.name !== "Hold"
                          ? session.name !== ApprovalStatus.YTD
                            ? "bless"
                            : ApprovalStatus.YTD
                          : "hold"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={user?.id}
                    className={styles.assignedUser}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={cross_Bg}
                      alt="cross"
                      className={styles.crossBgnew}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromSession(user, session.id);
                      }}
                    />

                    <div
                      className={styles.FlippedCard}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <SwapActionCard
                        user={user}
                        selectedSwapSeeker={selectedSwapSeeker}
                        selectedPref={session}
                        handleBlessAction={(e) => {
                          e.stopPropagation();
                          handleSessionGridBlessAction({
                            user,
                            session,
                            selectedSwapSeeker,
                            handleBlessed,
                            onBless,
                          });
                        }}
                        handleOpenSessionOverlay={(userId, selectedPref) => {
                          handleOpenSessionOverlay(userId, selectedPref);
                        }}
                        _isFlipped={true}
                        isFromSessionsGrid={true}
                      />
                    </div>
                  </div>
                ),
              )
            ) : (
              <DashedBorderBox isDragOver={dragOverSessionId === session?.id}>
                <div
                  className={`${styles.sessionHeader} ${
                    dragOverSessionId === session?.id ? styles.dragOver : ""
                  }`}
                >
                  {draggedUser ? (
                    // DRAGGING STATE
                    <>
                      {(session?.name === ApprovalStatus?.YTD &&
                        draggedUser?.swapRequests?.length === 0 &&
                        draggedUser?.approvalStatus ===
                          ApprovalStatus.APPROVED) ||
                      (draggedUser?.approvalStatus ===
                        ApprovalStatus?.ON_HOLD &&
                        session?.name === ApprovalStatus?.YTD) ||
                      (draggedUser?.approvalStatus ===
                        ApprovalStatus?.REJECTED &&
                        session?.name === ApprovalStatus?.YTD) ||
                      (draggedUser?.approvalStatus ===
                        ApprovalStatus?.CANCELLED &&
                        session?.name === ApprovalStatus?.YTD) ||
                      (session?.name === ApprovalStatus?.YTD &&
                        draggedUser?.approvalStatus ===
                          ApprovalStatus.PENDING) ? (
                        <h3 className={styles.sessionNameGrey}>
                          {colorizeMahatriaInfinitheism(session.name)}
                          <br />
                          <span className={styles.disabledSwapDemandText}>
                            {textConstant?.DISABLE_SWAP_DEMAND}
                          </span>
                        </h3>
                      ) : /* Check other non-YTD disabled conditions */
                      session?.assignedUsers.length > 0 ||
                        (draggedUser?.approvalStatus ===
                          ApprovalStatus?.REJECTED &&
                          session?.name === ApprovalStatus?.HOLD) ||
                        draggedUser?.approvalStatus ===
                          ApprovalStatus?.CANCELLED ||
                        draggedUser?.allocatedProgram?.name ===
                          session?.name ? (
                        <h3 className={styles.sessionNameGrey}>
                          {colorizeMahatriaInfinitheism(session.name)}{" "}
                          {textConstant?.DISABLEQUEUE}
                        </h3>
                      ) : (
                        /* Enabled session during drag */
                        <h3 className={styles.sessionName}>
                          {colorizeMahatriaInfinitheism(session.name)}
                        </h3>
                      )}
                    </>
                  ) : (
                    // NOT DRAGGING STATE
                    <>
                      {/* Check if YTD session - show swap request applicable message */}
                      {session?.name === ApprovalStatus?.YTD ? (
                        <h3 className={styles.sessionNameSwapDemand}>
                          {colorizeMahatriaInfinitheism(session.name)}
                          <br />
                          <span className={styles.SwapDemandText}>
                            ({textConstant?.SWAP_DEMAND_TEXT})
                          </span>
                        </h3>
                      ) : (
                        /* Normal session name for non-YTD sessions */
                        <h3 className={styles.sessionName}>
                          {colorizeMahatriaInfinitheism(session.name)}
                        </h3>
                      )}
                    </>
                  )}
                </div>
                <div className={styles.sessionInfo}>
                  <div className={styles.organization}>
                    <div className={styles.sessionCount}>
                      {session.name === ApprovalStatus.HOLD || session.name === ApprovalStatus.YTD  ? (
                        <span className={styles.totalSeekers}>
                          {session.totalSeekers}
                        </span>
                      ) : (
                        <div className={styles.peopleCount}>
                          <img src={peopleIcon} alt="Building Office" />{" "}
                          {session.allocatedCount} /{" "}
                          <span className={styles.totalSeekers}>
                            {session.totalSeekers}
                          </span>
                        </div>
                      )}
                    </div>
                    {!(
                      session.name === ApprovalStatus.HOLD ||
                      session.name === ApprovalStatus.YTD
                    ) && (
                      <>
                        <span className={styles.verticalLine} />
                        <div className={styles.peopleCount}>
                          <img src={bedIcon} alt="Building Office" />
                          <>
                            {session.allocatedCount -
                              session.organisationUserCount}{" "}
                            /{" "}
                            <span className={styles.totalSeekers}>
                              {session?.totalBeds }
                            </span>
                          </>
                        </div>
                      </>
                    )}

                    {session.organisationUserCount > 0 && (
                      <>
                        <span className={styles.verticalLine} />
                        <div className={styles.peopleCount}>
                          <img src={BuildingOffice} alt="Building Office" />
                          <span>
                            {" "}
                            {formatSingleDigit(session.organisationUserCount)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  {session.name !== ApprovalStatus.HOLD &&
                    session.name !== ApprovalStatus.YTD &&
                    (warning ? (
                      <div className={styles.progressBarContainerWarn}>
                        <div 
                          className={styles.progressBarNormal}
                          style={{
                            width: session.totalBeds > 0
                              ? `${100 - (((session.allocatedCount - session.organisationUserCount) - session.totalBeds) / session.totalBeds) * 100}%`
                              : "100%",
                          }}
                        />
                        <div className={styles.progressBarDivider} />
                        <div 
                          className={styles.progressBarWarning}
                          style={{
                            width: session.totalBeds > 0
                              ? `${(((session.allocatedCount - session.organisationUserCount) - session.totalBeds) / session.totalBeds) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                    ) : (
                      <div className={styles.progressBarContainer}>
                        <div
                          className={styles.progressBar}
                          style={{
                            width:
                              session.totalBeds > 0
                                ? `${((session.allocatedCount - session.organisationUserCount) / session.totalBeds) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
                    ))}
                </div>
              </DashedBorderBox>
            )}
          </div>
        </div>
)})}
    </div>
  );
};
