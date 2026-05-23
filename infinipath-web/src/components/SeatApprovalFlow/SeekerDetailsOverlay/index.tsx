// components/SeekerDetails/SeekerDetails.tsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Seeker } from "../../../types/seatApproval";
import styles from "./index.module.scss";
import UserCard from "../../../common/components/UserCard";
import VideoSection from "./Common/VideoSection";
import QuestionsSection from "./Common/QuestionsSection";
import RatingSection from "./Common/RatingSection";
import QuerySection from "./Common/Questions";
import Drawer from "@mui/material/Drawer";
import graphImage from "../../../assets/images/yearGraph.png";
import { Button } from "../../../common/components/Button";
import videoImage from "../../../assets/images/videoImg.png";
import shuffle from "../../../assets/images/shuffle-img.svg";
import shuffleDemand from "../../../assets/images/swap-demand1.svg";
import {
  sortPreferences,
  transformSeekerResponse,
} from "../../../utils/dataMapper";
import TabsComponent from "../../AllProgramsList/SeekerDashboardHdb/TabsComponent";
import CommonPlaneTabs from "../../../common/components/CommonPlaneTabs";
import MessageSection from "../../MessageSection";
import BackArrow from "../../../assets/images/session_overlay_back_arrow.svg";
import CaretCircleDown from "../../../assets/images/CaretCircleDown.svg";
import CaretCircleUp from "../../../assets/images/CaretCircleUp.svg";
import SessionsCard from "./programSessions";
import { useResponsive } from "../../../utils/functions";
import MahatriaBlessCard from "../../../common/components/MahatriaBlessCard";
import {
  ApprovalStatus,
  DEFAULTER_HEADING,
  ENTER_REASON_PLACEHOLDER,
  MAKE_DEFAULTER_QUESTION,
  MAKE_DEFAULTER_QUESTIONS,
  OTHER_CONTACT_PERSON,
  RecommendationText,
  SEEKER_ASSOCIATION,
  SWAP_DEMAND_LABEL,
  textConstant,
  UPDATE_DEFAULTER_QUESTIONS,
} from "../../../constants/textConstants";
import UseResize from "../../../common/components/UseResize";
import ActivityLog from "../../../common/components/ActivityLog";
import { formatDateOfBirth } from "../../../utils/commonFunctions";
import TimelineChart from "../../../common/components/ExperienceChart";
import GrayLine from "../../../common/components/GrayLine";
import { colorizeMahatriaInfinitheism } from "../../../common/components/ColorizeMahatriaInfinitheism";
import { endPoints } from "../../../constants/urlConstants";
import App from "../../../App";
import ConfirmationWithReason from "../../../common/components/ConfirmationWithReason";
import DefaulterOverlay from "../../../common/components/DefaulterOverlay";
import DefaulterTrackingSection from "../../DefaulterTrackingSection";
import {
  fetchDefaulterTrackingData as fetchDefaulterTracking,
  markSeekerAsDefaulter,
  updateSeekerDefaulter,
} from "../../../services/registration";
import { DefaulterTrackingItem } from "../../../types/registration";
import {
  hasPermission,
  RESOURCES,
  ROLES,
} from "../../../utils/roleBasedAccess";
import { getItemInLocalStorage } from "../../../services/localStorage";
import Loader from "../../../common/components/Loader";
import { CANCEL_REGISTRATION_CONSTANTS } from "../../../constants";

interface Session {
  id: string | number;
  name: string;
  type: string;
  assignedUsers: any[];
  allocatedCount: number;
  totalSeekers: number;
}
interface SeekerDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  seekerDetails: Seeker | null;
  getInitials?: (name: string) => string;
  isGroupedProgram?: boolean; // Optional prop to indicate if the program is grouped
  sessions: Session[]; // Replace with actual type if available
  onBless: (sessionId: number) => void; // Function to handle blessing a
  user: any;
  handleBlessed?: (
    seekerId: number,
    targetProgramId: number,
    swapType: string,
    swapRequestId?: number,
  ) => void;
  currentProgram?: string;
  availablePrograms?: Session[];
  onProgramSelect?: (program: any) => void;
  onCancel?: () => void;
  programId?: string;
  handleSwapUser?: (user: any, programId: any) => void;
  selectedSwapProgram?: any;
  selectedSwapUser?: any;
  selectedOption?: any; // Replace with actual type if available
  onBlessButtonClick?: () => void; // New prop added
  handleSeekerDetails?: (userId: number) => void;
  onUserUpdate?: () => void; // Callback to reload users in parent component
  setParentLoading?: (loading: boolean) => void;
}

const SeekerDetails: React.FC<SeekerDetailsProps> = ({
  isOpen,
  onClose,
  seekerDetails,
  getInitials,
  isGroupedProgram,
  sessions,
  onBless,
  user,
  handleBlessed,
  currentProgram,
  availablePrograms,
  onProgramSelect,
  onCancel,
  programId,
  handleSwapUser,
  selectedSwapProgram,
  selectedSwapUser,
  selectedOption,
  onBlessButtonClick,
  handleSeekerDetails,
  onUserUpdate,
  setParentLoading,
}) => {
  const [loading, setLoading] = useState(false);
  const [seekerData, setSeekerData] = useState<Seeker | null>(seekerDetails);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [confirmValue, setConfirmValue] = useState<boolean |null>(
    seekerDetails?.user?.seekerDefaulter !== null
      ? seekerDetails?.user?.seekerDefaulter?.isDefaulter
        ? true
        : false
      : null,
  );
  const [reason, setReason] = useState<string>("");
  const [hasFormChanged, setHasFormChanged] = useState<boolean>(false);
  const [isDefaulterOpen, setIsDefaulterOpen] = useState<boolean>(true);
  const [activeOverlayType, setActiveOverlayType] = useState<string | null>(
    null,
  );
  const [defaulterTrackingData, setDefaulterTrackingData] = useState<
    DefaulterTrackingItem[]
  >([]);
  const passion = 2;
  const growth = 3;
  const infiniteness = 3;
  const continuity = 4;
  const overall = ((passion + growth + infiniteness + continuity) / 4).toFixed(
    1,
  );
  const seekerRegDetails = [
    { key: "Date of birth", value: "dob" },
    { key: "Mobile number", value: "mobileNumber" },
    { key: "Email address", value: "emailAddress" },
    { key: "infinitheism contact person", value: "rmContactUser?.orgUsrName" },
    { key: "Country", value: "countryName" },
    {
      key: "Since when have you been associated with infinitheism",
      value: "hdbAssociationSince",
    },
    { key: "When was your last HDB/ MSD", value: "lastHdbAttended" },
    { key: "HDB/MSD preference", value: "preferences" },
  ];
  const userRole =
    getItemInLocalStorage(textConstant.SEEKER_DETAILS)?.role || "";

  // Optimized helper to safely get nested value by path string (supports dot notation and optional chaining)
  const getValueByPath = (obj: any, path: string) => {
    if (!obj || !path) return "";
    if (path === "preferences") {
      // Handle preferences display
      const preferences = sortPreferences(obj.preferences || [], true);
      if (!preferences || preferences.length === 0) {
        return "Any HDB/MSD";
      }
      return preferences.map((pref) => pref.name).join(", ");
    }
    // Remove optional chaining and split by dot
    const keys = path.replace(/\?\./g, ".").split(".");
    return keys.reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""),
      obj,
    );
  };

  useEffect(() => {
    if (isOpen && !seekerData) {
      fetchSeekerData();
    }
    if (
      isOpen &&
      seekerDetails?.user?.id &&
      hasPermission(userRole, RESOURCES.SEEKER_EXPERIENCE, "R") &&
      seekerDetails?.user?.hdbDefaulter
    ) {
      fetchDefaulterTrackingData();
    }
  }, [
    isOpen,
    seekerData,
    seekerDetails?.user?.id,
    seekerDetails?.user?.hdbDefaulter,
  ]);

  // Add a separate useEffect to sync seekerData with seekerDetails prop changes
  useEffect(() => {
    if (seekerDetails) {
      setSeekerData(seekerDetails);
    }
  }, [
    seekerDetails?.user?.hdbDefaulter,
    seekerDetails?.user?.seekerDefaulter,
    seekerDetails,
  ]);

  const fetchSeekerData = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setSeekerData(seekerDetails);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching seeker data:", error);
      setLoading(false);
    }
  };

  const fetchDefaulterTrackingData = async () => {
    if (!seekerDetails?.userId) return;
    const data = await fetchDefaulterTracking(seekerDetails?.userId);
    setDefaulterTrackingData(data);
  };

  const handlePlayVideo = () => {};

  const handleShowAllQuestions = () => {};

  const handleSendQuery = () => {
    onBlessButtonClick?.();
  };

  const handleSeekerUpdate = async () => {
    // Run these actions after defaulter operations are completed
    if (handleSeekerDetails) {
      setParentLoading && setParentLoading(true);
      await handleSeekerDetails(seekerDetails?.id);
      // Force a re-fetch of seeker data to get the updated information
    }
    // After API call, check if we should fetch defaulter tracking data
    // Use seekerDetails to determine the new state after the update
    if (
      hasPermission(userRole, RESOURCES.SEEKER_EXPERIENCE, "R") &&
      seekerDetails?.user?.hdbDefaulter
    ) {
      await fetchDefaulterTrackingData();
    }
    
    // Reload users in parent component to update the cards
    if (onUserUpdate) {
      onUserUpdate();
      setParentLoading && setParentLoading(false);
    }
  };

  if (!isOpen) return null;

  const [preferenceData, setPreferenceData] = useState<string[]>([]);

  useEffect(() => {
    if (seekerData) {
      setPreferenceData(sortPreferences(seekerData.preferences || [], true));
    }
  }, [seekerData]);
  const handleTabChange = (newValue: number) => {
    setSelectedTab(newValue);
  };
  const transformedSeeker = transformSeekerResponse(seekerData);
  const { isMobileResolution, isTabResolution } = UseResize();
  return (
    <Drawer anchor={"right"} open={isOpen} onClose={onClose}>
      <div className={styles.seekerOverlay}>
        <div
          className={
            seekerDetails?.approvals?.[0]?.approvalStatus ===
            ApprovalStatus.CANCELLED
              ? `${styles.seekerDetailsCancelledModal} ${isOpen ? styles.open : ""}`
              : `${styles.seekerDetailsModal} ${isOpen ? styles.open : ""}`
          }
        >
          <div className={styles.modalHeader}>
            <img
              src={BackArrow}
              alt="Back"
              className={styles.backButton}
              onClick={onClose}
            />
            <span className={styles.modalTitle}>Quick view of seeker</span>
            <div className={styles.headerDivider} />
            <X size={26} onClick={onClose} className={styles.closeButton} />
          </div>

          <div className={styles.modalContent}>
            {loading ? (
              <Loader type="large" />
            ) : seekerData ? (
              <>
                <div
                  className={
                    seekerData?.user?.hdbDefaulter
                      ? styles.defaulterUserCard
                      : styles.userCard
                  }
                >
                  <UserCard
                    seeker={seekerData}
                    preferenceData={preferenceData}
                    sessions={sessions}
                    onBless={onBless}
                    onClose={onClose}
                    user={transformSeekerResponse(seekerData)}
                    handleBlessed={handleBlessed}
                    currentProgram={currentProgram}
                    availablePrograms={availablePrograms}
                    onProgramSelect={onProgramSelect}
                    onCancel={onCancel}
                    programId={programId}
                    selectedSwapProgram={selectedSwapProgram}
                    selectedSwapUser={selectedSwapUser}
                    handleSwapUser={handleSwapUser}
                    selectedOption={selectedOption}
                    hideRoomatePreference={true}
                    isOverlay={false}
                    isSeekerOverlay={true}
                  />
                </div>
                {(isMobileResolution || isTabResolution) && (
                  <div className={styles.roommatePreferenceRow}>
                    <div className={styles.roommateDot}></div>
                    <span className={styles.roommateLabel}>
                      Roommate preference
                    </span>
                    <span className={styles.roommateName}>
                      {transformedSeeker.preferredRoomMate}
                    </span>
                  </div>
                )}
                <div className={styles.tabsContainer}>
                  <CommonPlaneTabs
                    tabs={[
                      { label: "Details" },
                      { label: "Messages" },
                      { label: "Activity Log" },
                    ]}
                    onTabChange={handleTabChange}
                  />
                </div>
                {selectedTab === 0 && (
                  <div className={styles.modalContentSub}>
                    <div className={styles.regDetails}>
                      {seekerRegDetails.map((item, idx) => {
                        let value = getValueByPath(seekerData, item.value);
                        let otherContact;

                        if (item.key === "Date of birth" && value) {
                          value = formatDateOfBirth(value);
                        }
                        if (
                          item.key === "infinitheism contact person" &&
                          value === "Other"
                        ) {
                          otherContact = seekerData?.otherInfinitheismContact;
                        }
                        if (!value) return null;
                        return (
                          <React.Fragment key={idx}>
                            <div>
                              <p className={styles.regHeading}>
                                {colorizeMahatriaInfinitheism(item.key)}
                              </p>
                              <p className={styles.regValue}>
                                {colorizeMahatriaInfinitheism(value)}
                              </p>
                            </div>
                            {otherContact && (
                              <div>
                                <p className={styles.regHeading}>
                                  {colorizeMahatriaInfinitheism(
                                    OTHER_CONTACT_PERSON,
                                  )}
                                </p>
                                <p
                                  className={`${styles.regValue} ${styles.contactPersonWrapper}`}
                                >
                                  {colorizeMahatriaInfinitheism(otherContact)}
                                </p>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <VideoSection
                      videoSrc={seekerData.videoUrl || ""}
                      className={styles.timeline}
                    />

                    <p className={styles.seekerAssociation}>
                      {SEEKER_ASSOCIATION}
                    </p>
                    <GrayLine />
                    <TimelineChart
                      seekerId={seekerDetails?.user?.id}
                      gender={seekerDetails?.gender}
                    />

                    {/* Question section */}
                    {seekerData.questionResponses &&
                      seekerData.questionResponses.length > 0 && (
                        <QuestionsSection
                          questions={seekerData.questionResponses}
                          onShowAll={handleShowAllQuestions}
                        />
                      )}
                    {/* Swap Requests Display */}
                    {Array.isArray(seekerDetails?.swapsRequests) &&
                      seekerDetails.swapsRequests.length > 0 &&
                      (() => {
                        // Find the most recent swap request by createdAt
                        const activeSwapRequests =
                          seekerDetails.swapsRequests.filter(
                            (swap) => swap.status === "active",
                          );
                        const allocatedProgramName =
                          seekerDetails?.allocatedProgram?.name || "";
                        // Get requested program names
                        const requestedProgramNames = (
                          (activeSwapRequests.length > 0 &&
                            activeSwapRequests[0]?.requestedPrograms) ||
                          []
                        )
                          .map((p: any) => p.name)
                          .filter(Boolean)
                          .join(", ");
                        const swapComment =
                          activeSwapRequests.length > 0 &&
                          activeSwapRequests[0]?.comment;
                        // Only show if both are present
                        if (
                          allocatedProgramName &&
                          requestedProgramNames.length > 0
                        ) {
                          return (
                            <div>
                              <h3 className={styles.swapRequestSectionName}>
                                Swap request
                              </h3>

                              <GrayLine />
                              <div className={styles.swapRequestSection}>
                                <p className={styles.swapRequestLabel}>
                                  swap {allocatedProgramName}{" "}
                                  <span>
                                    <img src={shuffle} alt="shuffle" />
                                  </span>
                                  <span className={styles.reqPrograms}>
                                    {requestedProgramNames}
                                  </span>
                                </p>
                                {swapComment && (
                                  <p className={styles.swapRequestComment}>
                                    {swapComment
                                      .split("\n")
                                      .map(
                                        (
                                          line: string,
                                          idx: number,
                                          arr: string[],
                                        ) => (
                                          <React.Fragment key={idx}>
                                            {line}
                                            {idx < arr.length - 1 && <br />}
                                          </React.Fragment>
                                        ),
                                      )}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                    {transformedSeeker?.swapDemandCurrentProgram &&
                      transformedSeeker?.swapDemandPrograms?.length > 0 && (
                        <div>
                          <h3 className={styles.swapRequestSectionName}>
                            {SWAP_DEMAND_LABEL}
                          </h3>
                          <GrayLine />
                          <div
                            className={`${styles.swapRequestSection} ${styles.swapDemandSection}`}
                          >
                            <p className={styles.swapDemand}>
                              swap {transformedSeeker?.swapDemandCurrentProgram}{" "}
                              <span>
                                <img src={shuffleDemand} alt="shuffle" />
                              </span>
                              <span className={styles.reqPrograms}>
                                {transformedSeeker?.swapDemandPrograms
                                  .map((p) => p.name)
                                  .join(", ")}
                              </span>
                            </p>
                          </div>
                          {transformedSeeker?.swapDemandComment && (
                            <p className={styles.swapRequestComment}>
                              {transformedSeeker?.swapDemandComment}
                            </p>
                          )}
                        </div>
                      )}

                    <RatingSection
                      rating={seekerDetails?.averageRating}
                      ratings={seekerDetails.ratings}
                      rmData={seekerDetails?.rmContactUser}
                      rmReview={seekerDetails?.rmReview}
                      prevRating={seekerDetails?.prevRating}
                    />

                    {transformedSeeker?.recommendation && (
                      <div className={styles.recommendationLine}>
                        <p className={styles.recommendationOption}>
                          {transformedSeeker?.recommendation}{" "}
                          {RecommendationText}
                        </p>
                        {transformedSeeker?.recommendationText && (
                          <p>
                            {colorizeMahatriaInfinitheism(
                              transformedSeeker?.recommendationText,
                            )}
                          </p>
                        )}
                      </div>
                    )}
                    {seekerDetails?.user?.hdbDefaulter &&
                      seekerDetails?.userId && (
                        <div>
                          <div className={styles.defaulterSection}>
                            <h3 className={styles.swapRequestSectionName}>
                              {DEFAULTER_HEADING}
                            </h3>
                            {((seekerDetails?.user?.seekerDefaulter?.defaultMarkerRole.toLowerCase() !==
                              userRole &&
                              seekerDetails?.user?.seekerDefaulter?.defaultMarkerRole.toLowerCase() !==
                                ROLES.MAHATRIA) ||
                              userRole === ROLES.MAHATRIA) && (
                              <span
                                className={styles.defaulterUpdate}
                                onClick={() =>
                                  setActiveOverlayType(textConstant.DEFAULTER)
                                }
                              >
                                {textConstant.UPDATE}
                              </span>
                            )}
                          </div>
                          <div className={styles.defaulterSection}>
                            <GrayLine />
                            {isDefaulterOpen ? (
                              <img
                                src={CaretCircleDown}
                                alt="Collapse"
                                onClick={() => setIsDefaulterOpen(false)}
                                className={styles.caretIcon}
                              />
                            ) : (
                              <img
                                src={CaretCircleUp}
                                alt="Expand"
                                onClick={() => setIsDefaulterOpen(true)}
                                className={styles.caretIcon}
                              />
                            )}
                          </div>

                          {isDefaulterOpen && (
                            <div className={styles.defaulterContent}>
                              {/* Defaulter Tracking Data */}
                              <DefaulterTrackingSection
                                data={defaulterTrackingData}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    {!seekerDetails?.user?.hdbDefaulter &&
                      seekerDetails?.userId && (
                        <div>
                          <ConfirmationWithReason
                            questions={seekerData?.isDefaulter ? UPDATE_DEFAULTER_QUESTIONS : MAKE_DEFAULTER_QUESTIONS}
                            confirmValue={confirmValue}
                            onConfirmationChange={(value) => {
                              setConfirmValue(value);
                              setHasFormChanged(true);
                              value && setReason(seekerData?.defaulterComment || "");
                            }}
                            reason={reason}
                            onReasonChange={(value) => {
                              setReason(value);
                              setHasFormChanged(true);
                            }}
                            reasonPlaceholder={ENTER_REASON_PLACEHOLDER}
                            isHeadingNeeded={true}
                            isColumnLayout={seekerData?.isDefaulter}
                          />
                        </div>
                      )}
                  </div>
                )}
                {selectedTab === 1 && (
                  <MessageSection
                    data={seekerDetails}
                    defaultOpen={true}
                    messageSectionClass={styles.messageConstainer}
                    isRequiredHeader={false}
                  ></MessageSection>
                )}
                {selectedTab === 2 && (
                  <ActivityLog registrationId={seekerDetails?.id} />
                )}
              </>
            ) : (
              <div className={styles.error}>Failed to load seeker data</div>
            )}
          </div>
        </div>
        {!(
          seekerDetails?.approvals?.[0]?.approvalStatus ===
          ApprovalStatus.CANCELLED
        ) &&
          !hasFormChanged && (
            <div className={styles.footer}>
              <Button
                buttonClassName={styles.sendButtonText}
                buttonTextClassName={styles.sendButtonText}
                onClick={handleSendQuery}
              >
                bless
              </Button>
            </div>
          )}

        {hasFormChanged && (
          <div className={styles.Defaulterfooter}>
            <div className={styles.buttonSpacer}>
              <Button
                buttonClassName={styles.cancelButton}
                buttonTextClassName={styles.cancelButtonText}
                onClick={() => {
                  setConfirmValue(
                    seekerDetails?.user?.seekerDefaulter !== null
                      ? seekerDetails?.user?.seekerDefaulter.isDefaulter
                        ? true
                        : false
                      : null,
                  );
                  setReason("");
                  setHasFormChanged(false);
                }}
              >
                {CANCEL_REGISTRATION_CONSTANTS.BUTTON_TEXT.CLEAR}
              </Button>
              <Button
                buttonClassName={styles.sendButtonText}
                buttonTextClassName={styles.sendButtonText}
                onClick={async () => {
                  const registrationId = Number(seekerDetails?.id);
                  const payload = {
                    registrationId,
                    userId: seekerDetails?.userId,
                    isDefaulter: confirmValue, // If updating, we're unmarking (false), if new, we're marking (true)
                    comment: reason.trim(),
                  };
                  try {
                    if (seekerDetails?.user?.seekerDefaulter !== null) {
                      await updateSeekerDefaulter(
                        seekerDetails?.userId,
                        payload,
                      );
                    } else {
                      await markSeekerAsDefaulter(payload);
                    }
                    // Call the common update function
                    await handleSeekerUpdate();
                    setHasFormChanged(false);
                  } catch (error) {
                    console.error("Error updating defaulter status:", error);
                  }
                }}
              >
                {CANCEL_REGISTRATION_CONSTANTS.BUTTON_TEXT.SAVE}
              </Button>
            </div>
          </div>
        )}

        {activeOverlayType === "defaulter" && (
          <DefaulterOverlay
            open={true}
            onCancel={() => setActiveOverlayType(null)}
            onUpdate={async () => {
              setConfirmValue(false);
              setReason("");
              setActiveOverlayType(null);
              await handleSeekerUpdate();
            }}
            seekerData={{
              ...seekerDetails,
              isDefaulter: seekerDetails?.user?.hdbDefaulter,
              defaulterComment: seekerDetails?.user?.seekerDefaulter?.comment,
              userId: seekerDetails?.user?.id,
              registrationId: seekerDetails?.id,
            }}
            isLoading={loading}
            isUpdateMode={seekerDetails?.user?.hdbDefaulter !== null}
          />
        )}
      </div>
    </Drawer>
  );
};

export default SeekerDetails;
