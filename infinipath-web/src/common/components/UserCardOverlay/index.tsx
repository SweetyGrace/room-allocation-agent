import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import {
  UserCard as UserCardType,
  UserData,
} from "../../../types/seatApproval.ts";
import star from "../../../assets/images/star.svg";
import { Button } from "../Button"; // Adjust path as needed
import CloseIcon from "@mui/icons-material/Close";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import { Avatar, Drawer } from "@mui/material";
import { ApprovalStatus, blessContent, LABEL_ANY_HDB_MSD, MULTIPLE_PREFERENCES, SINGLE_PREFERENCE, SWAP_REQUEST_LABEL } from "../../../constants/textConstants.ts";
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
import cross_Bg from "../../../assets/images/cross-bg.svg";
import UseResize from "../UseResize";
import overlayline from "../../../assets/images/overlay-line.svg";
import { NoBackpackSharp } from "@mui/icons-material";

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
  setShowBlessCard?: (show: boolean) => void;
}

const UserCardOverlay: React.FC<UserCardProps> = ({
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
  setShowBlessCard,
}) => {
  const { isHighResolution } = UseResize();
  const [selectedPref, setSelectedPref] = useState(null);
  const [programList, setProgramList] = useState<any[]>([]);
  const [showProgramList, setShowProgramList] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const [isSessionOverlayOpen, setIsSessionOverlayOpen] = useState(false);
  const [sessionOverlayUsers, setSessionOverlayUsers] = useState<UserData[]>(
    [],
  );

  const handleOpenSessionOverlay = async (
    userId: number,
    selectedSession?: unknown,
  ) => {
    setShowOverlay(true);
    setCustomTitle &&
      setCustomTitle(`Select seeker to swap from ${selectedSession?.name}`);
    setIsCardClicked(true);
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
      setSelectedProgram(null);
    } else {
      setShowProgramList(false);
      setSelectedPref(pref);
    }
    onFlip && onFlip();
  };

  const handleProgramSelect = (program: any) => {
    setSelectedProgram(program);
    setSelectedPref(program);
  };

  const handleBlessAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedPref) return;

    if (user?.approvalStatus !== ApprovalStatus?.PENDING) {
      handleBlessed(
        selectedSwapSeeker ? user?.registrationId : user?.id,
        selectedPref.value || selectedPref.id,
        selectedSwapSeeker ? "swap" : "move",
        user?.swapRequestId || undefined,
        selectedSwapSeeker,
      );
    } else {
      const sessionId = selectedPref.id || selectedPref.value;
      handleBless(user, sessionId, selectedPref.name);
    }
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
    setShowBlessCard(false);
  };

  const [showRoommatePopup, setShowRoommatePopup] = useState(false);
  const popupLeaveTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const cardContent = (
    <div
      className={isHighResolution ? styles.overlay : styles.overlayresolution}
    >
      <div
        className={`${styles.userCard} ${isFlipped ? styles.flipped : ""}`}
        onClick={!isFlipped ? handleSeekerClick : undefined}
      >
        {isHighResolution ? (
          <div className={styles.headerContainer}>
            <span className={styles.headerTitle}>
              {user.approvalStatus === ApprovalStatus?.APPROVED
                ? "Swapping/Moving"
                : "Blessing"}
            </span>

            <div className={styles.headerDivider}> </div>
            <img
              src={cross_Bg}
              alt="cross"
              className={styles.crossBg}
              onClick={(e) => {
                handleClose(e);
              }}
            />
          </div>
        ) : (
          <div className={styles.overlayheader}>
            <div>
              <img
                src={overlayline}
                alt="overlay line"
                className={styles.overlayLine}
              />
            </div>
            {/* <div>
              <span className={styles.headerTitle}>
                {user.approvalStatus === ApprovalStatus?.PENDING
                  ? "Blessing"
                  : "Swapping/Moving"}
              </span>
            </div> */}
          </div>
        )}

        {!isFlipped ? (
          <>
            <div className={styles.userCardContent}>
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
                <p className={styles.userStatus}>
                  {user.approvalStatus === ApprovalStatus?.APPROVED  &&
                    ` ${user?.allocatedProgram?.name}`}
                    {user.approvalStatus === ApprovalStatus?.PENDING || user.approvalStatus === ApprovalStatus?.REJECTED &&
                    `Hold`}
                    {user.approvalStatus === ApprovalStatus?.ON_HOLD &&
                    `${ApprovalStatus.YTD}`}
                </p>
              </div>     
                  <div>
                  <div className={styles.userPref}>
                    <div>
                    <span className={styles.preferenceText}>
                      
                      {user.programPreferences.length === 0 &&
                        (!user.swapRequests || user.swapRequests.length === 0) &&
                        (!user.shiftRequests || user.shiftRequests.length === 0)
                        ? SINGLE_PREFERENCE
                        : user.programPreferences.length > 1 ||
                          user.shiftRequests?.length > 1 ||
                          user.swapRequests?.length > 1
                        ? MULTIPLE_PREFERENCES
                        : SINGLE_PREFERENCE} :&nbsp;
                    </span>
                   
                        <span className={styles.preferenceText}>
                          {user.programPreferences.length === 0
                            ? LABEL_ANY_HDB_MSD
                            : user.programPreferences.map((pref: any) => pref.name).join(", ")}
                        </span>
                    </div>
                    <div>
                    {(user.swapRequests && user.swapRequests.length > 0) && (
                      <div className={styles.preferenceText}>
                        <span className={styles.preferenceHeading}>{SWAP_REQUEST_LABEL} : &nbsp;</span>
                        <span>
                          {user.swapRequests.map((swap: any) => swap.name).join(", ")}
                        </span>
                      </div>
                    )}
                    </div>
                  </div>
                </div>


              <div>
                <p>
                  {blessContent.CHOOSE}&nbsp;
                  {user.approvalStatus !== ApprovalStatus?.APPROVED
                    ? `${blessContent.BLESS} ${user.fullName}`
                    : `${blessContent.SWAP} ${user.fullName}`}
                </p>
              </div>

              <div className={styles.userInfo}>
                <div className={styles.userPreferences}>
                  {user?.shiftRequests && user?.shiftRequests.length > 0 ? (
                    <div className={styles.shiftRequestWrapper}>
                      {isOverlay && (
                        <UnallocatedPreferences
                          preferences={sessions}
                          isOverlay={isOverlay}
                          highlightAllocated={highlightAllocated}
                          allocatedProgramId={user.allocatedProgram.id}
                          onPrefClick={handlePrefClick}
                          onSelect={(pref) => {
                            setSelectedPref(pref);
                            handlePrefClick(pref);
                          }}
                          removeHoldYTD={true}
                        />
                      )}
                    </div>
                  ) : user?.swapRequests && user?.swapRequests.length > 0 ? (
                    <>
                      {isOverlay && (
                        <UnallocatedPreferences
                          preferences={sessions}
                          isOverlay={isOverlay}
                          highlightAllocated={highlightAllocated}
                          allocatedProgramId={user.allocatedProgram.id}
                          onPrefClick={handlePrefClick}
                          onSelect={(pref) => {
                            setSelectedPref(pref);
                            handlePrefClick(pref);
                          }}
                          removeHoldYTD={true}
                          isSwap= {true}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {user.approvalStatus === ApprovalStatus?.PENDING ? (
                        <>
                          {user?.programPreferences.length < 1 ? (
                            <div className={styles.mahatriaChipWrapper}>
                              {isOverlay && (
                                <UnallocatedPreferences
                                  preferences={sessions}
                                  isOverlay={isOverlay}
                                  highlightAllocated={highlightAllocated}
                                  allocatedProgramId={allocatedProgramId}
                                  onPrefClick={handlePrefClick}
                                  onSelect={(pref) => {
                                    setSelectedPref(pref);
                                    handlePrefClick(pref);
                                  }}
                                  removeStatus={ApprovalStatus.YTD}
                                />
                              )}
                            </div>
                          ) : (
                            <UnallocatedPreferences
                              preferences={
                                sessions
                              }
                              isOverlay={isOverlay}
                              highlightAllocated={highlightAllocated}
                              allocatedProgramId={allocatedProgramId}
                              onPrefClick={handlePrefClick}
                              onSelect={(pref) => {
                                setSelectedPref(pref);
                                handlePrefClick(pref);
                              }}
                              removeStatus={ApprovalStatus.YTD}
                            />
                          )}
                        </>
                      ) : user?.approvalStatus === ApprovalStatus?.APPROVED ? (
                        <>
                          {user?.swapRequests &&
                          user?.swapRequests.length > 0 ? (
                            <></>
                          ) : (
                            <div className={styles.userPreferences}>
                              {user?.allocatedProgram && (
                                <div className={styles.allocatedProgramWrapper}>
                                  {user.programPreferences &&
                                  user.programPreferences.length === 0 ? (
                                    <>
                                      {isOverlay && (
                                        <UnallocatedPreferences
                                          preferences={sessions}
                                          isOverlay={isOverlay}
                                          highlightAllocated={
                                            highlightAllocated
                                          }
                                          allocatedProgramId={user.allocatedProgram.id}
                                          onPrefClick={handlePrefClick}
                                          onSelect={(pref) => {
                                            setSelectedPref(pref);
                                            handlePrefClick(pref);
                                          }}
                                          removeHoldYTD={true} 
                                        />
                                      )}
                                    </>
                                  ) : (
                                    user.programPreferences &&
                                    user.programPreferences.length > 0 &&
                                    isOverlay && (
                                      <UnallocatedPreferences
                                        preferences={sessions}
                                        isOverlay={isOverlay}
                                        highlightAllocated={highlightAllocated}
                                        allocatedProgramId={user.allocatedProgram.id}
                                        onPrefClick={handlePrefClick}
                                        onSelect={(pref) => {
                                          setSelectedPref(pref);
                                          handlePrefClick(pref);
                                        }}
                                        removeHoldYTD={true}
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
                                {user.programPreferences &&
                                user.programPreferences.length === 0 ? (
                                  <>
                                    <span
                                      className={styles.mahatriaChipNoBg}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      {isOverlay && (
                                        <UnallocatedPreferences
                                          preferences={sessions}
                                          isOverlay={isOverlay}
                                          highlightAllocated={
                                            highlightAllocated
                                          }
                                          allocatedProgramId={
                                           user.approvalStatus
                                          }
                                          onPrefClick={handlePrefClick}
                                          removeHoldYTD= {  user.approvalStatus === ApprovalStatus?.REJECTED ? true : false}
                                          onSelect={(pref) => {
                                            setSelectedPref(pref);
                                            handlePrefClick(pref);
                                          }}
                                        />
                                      )}
                                    </span>
                                  </>
                                ) : (
                                  user.programPreferences &&
                                  user.programPreferences.length > 0 &&
                                  isOverlay && (
                                    <UnallocatedPreferences
                                      preferences={sessions}
                                      isOverlay={isOverlay}
                                      highlightAllocated={highlightAllocated}
                                      allocatedProgramId={user.approvalStatus}
                                      onPrefClick={handlePrefClick}
                                      removeHoldYTD= {  user.approvalStatus === ApprovalStatus?.REJECTED ? true : false}
                                      onSelect={(pref) => {
                                        setSelectedPref(pref);
                                        handlePrefClick(pref);
                                      }}
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </>
                      )}
                    </>
                  )}{" "}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {user.approvalStatus === ApprovalStatus?.APPROVED &&
            selectedPref?.name !== "Hold" &&
            selectedPref?.name !== ApprovalStatus.YTD ? (
              <div className={styles.flippedContent}>
                <SwapActionCard
                  user={user}
                  selectedSwapSeeker={selectedSwapSeeker}
                  selectedPref={selectedPref}
                  handleBlessAction={handleBlessAction}
                  handleOpenSessionOverlay={handleOpenSessionOverlay}
                  _isFlipped={isFlipped}
                />
              </div>
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
                      Choose a program to bless {user.fullName}
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
                            {program.name}
                          </span>
                        ))}
                      </div>
                    </h3>
                  ) : (
                    <h3 className={styles.redirectText}>
                      {selectedPref?.name === "Hold" ? (
                        <>
                          <span className={styles.mahatriaText}>Mahatria</span>{" "}
                          is placing {user.fullName} on hold
                          {/* Generated by Copilot */}
                        </>
                      ) : selectedPref?.name === ApprovalStatus.YTD ? (
                        <>
                          <span className={styles.mahatriaText}>Mahatria</span>{" "}
                          is placing {user.fullName} on Swap demand
                          {/* Generated by Copilot */}
                        </>
                      ) : (
                        <>
                          <span className={styles.mahatriaText}>Mahatria</span>{" "}
                          is blessing {user.fullName} by allocating
                          <br />
                          <span>{selectedPref?.name} seat</span>
                          {/* Generated by Copilot */}
                        </>
                      )}
                    </h3>
                  )}
                  <div className={styles.actionButtonRow}>
                    <Button
                      buttonClassName={styles.actionButton}
                      buttonTextClassName={styles.actionButtonText}
                      onClick={(e) => {
                        handleBlessAction(e);
                      }}
                      disable={!selectedPref}
                    >
                      {selectedPref?.name !== "Hold" &&
                      selectedPref?.name !== ApprovalStatus.YTD
                        ? "bless"
                            : selectedPref?.name === "Hold"
                            ? "hold"
                            : selectedPref?.name === ApprovalStatus.YTD
                            ? ApprovalStatus.YTD
                            : selectedPref?.name}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return !isHighResolution ? (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={handleClose}
      sx={{
        "& .MuiDrawer-paper": {
          borderRadius: "20px 20px 0 0",
        },
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
        }}
        onClick={handleClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff",
            borderRadius: "20px 20px 0 0",
            width: "100%",
            maxWidth: "500px",
            maxHeight: "70vh",
          }}
        >
          {cardContent}
        </div>
      </div>
    </Drawer>
  ) : (
    cardContent
  );
};

export default UserCardOverlay;
