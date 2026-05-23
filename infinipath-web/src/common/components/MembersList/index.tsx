import React, { useEffect, useRef, useState } from "react";
import { deleteCall, getCall, postCall } from "../../../services/apiService";
import { endPoints, INFINIPATH } from "../../../constants/urlConstants";
import {
  clearArrayInLocalStorage,
  getItemInLocalStorage,
  setItemInLocalStorage,
} from "../../../services/localStorage";
import { Avatar, InputAdornment, TextField, Tooltip } from "@mui/material";
import {
  getTagLineMessages,
  handleZoomRedirection,
  joinmeetingAttendance,
  modifyProfileUrl,
} from "../../../utils/commonFunctions";
import PhoneNumberMasking from "../PhonenumberMasking";
import useDebounce from "../../../hooks/useDebounce";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import styles from "./index.module.scss";
import SeekerDetailsCard from "../SeekerDetailsCard";
import crossFill from "../../../assets/images/cross-fill.svg";
// import floatArrow from "../../../assets/images/float-arrow.svg";
import CustomMobileDrawer from "../CustomMobileDrawer";
import UseResize from "../UseResize";
import Loader from "../Loader";
import addedTick from "../../../assets/images/success-icon.svg";
import { ReactComponent as SearchIcon } from "../../../assets/images/search-icon.svg";
import NoMembersIcon from "../../../assets/images/no-members-icon.webp";
import { Button } from "../Button";
import {
  ENABLE_JOIN_WITH_OTHERS,
  JOIN_MEETING_THROUGH_ZOOM,
  LOCAL_STORAGE_KEYS,
  LOGIN_TEXT,
  /*JOIN_MARK_ATTENDANCE,*/ MESSAGE,
  SCROLL_PAGINATION,
  textConstants,
} from "../../../constants";
import CustomPopupNewV2 from "../CustomPopupNewV2";
// import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import closeIcon from "../../../assets/images/snackbar-close-icon.svg";
import cancelText from "../../../assets/images/text-cross-icon.svg";
import { v4 as uuidv4 } from "uuid";
import sendInviteImage from "../../../assets/images/send-invite-button.svg";
import Breadcrumb from "../Breadcrumb";
import { useSelector } from "react-redux";
import {
  AddedMembersProps,
  DeletePopupProps,
  MembersListProps,
  SelectedMembersProps,
  User,
  UserItemProps,
} from "../../../types/members";
import infoAlert from "../../../assets/images/info-alert.svg";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Header from "../../Header";

const UserItem = ({
  user,
  index,
  onClick,
  showRemoveButton,
  onRemove,
  isMemberAdded,
}: UserItemProps) => {
  return (
    <div
      key={user.id}
      className={styles.userItem}
      onClick={onClick}
      data-testid={`search-modal-user-item-${index}`}
    >
      <Avatar
        alt={user.firstName}
        src={
          user.profileUrl
            ? modifyProfileUrl(user.profileUrl)
            : defaultProfileIcon
        }
        sx={{ width: 50, height: 50, border: "1px solid #00000014" }}
        data-testid={`search-modal-user-avatar-${index}`}
      />
      {isMemberAdded && (
        <div className={styles.addedTick}>
          <img src={addedTick} alt="added-tick" className={styles.addedTick} />
        </div>
      )}

      <div
        className={styles.userDetails}
        data-testid={`search-modal-user-details-${index}`}
      >
        <Tooltip title={user?.fullName} arrow>
          <span className={styles.searchSeekerName}>{user?.fullName}</span>
        </Tooltip>
        <PhoneNumberMasking
          phoneNumber={user?.maskedPhoneNumber}
          className={styles.phoneText}
          data-testid={`search-modal-user-phone-${index}`}
        />
      </div>
      {showRemoveButton && <Button onClick={onRemove}>Remove</Button>}
    </div>
  );
};

const AddedMembers = ({
  addedMembers,
  handleRemoveSeeker,
  isJoiningWithOthers,
  seekerDetails,
  fetchJoinDetailsData,
  isMobileResolution,
  setShowAddedMembers,
  isTabResolution,
  isHighResolution,
  nonAddedMembers,
  setLoading,
  selectedSeekersCheckboxes,
  setSelectedSeekersCheckboxes,
  seekerData,
  setOpenInfoModal,
}: AddedMembersProps) => {
  const navigate = useNavigate();

  const markAttendanceSeekersIds = useSelector(
    (state: unknown) => state.seekerReducer.markAttendanceSeekersIds || [],
  );
  const seekerVerifiedStatus =
    getItemInLocalStorage("verification_status") === "success";

  const invitePendingTag = getTagLineMessages(nonAddedMembers, true);
  const myGroupTag = getTagLineMessages(addedMembers, false);
  const [smallLoading, setSmallLoading] = useState(false);
  useEffect(() => {
    // Separate marked and no attendance seekers
    const markedUserIds = markAttendanceSeekersIds
      .filter((item) => item.text === textConstants.attendanceText)
      .map((item) => item.userId);

    const noAttendanceUserIds = markAttendanceSeekersIds
      .filter(
        (item) => item.text === textConstants.withoutVerificationTextStatus,
      )
      .map((item) => item.userId);

    const markedNotVerified = markAttendanceSeekersIds
      .filter((item) => item.text === textConstants.skipFaceVerificationStatus)
      .map((item) => item.userId);
    // Combine both types of user IDs
    setSelectedSeekersCheckboxes([
      ...markedUserIds,
      ...noAttendanceUserIds,
      ...markedNotVerified,
    ]);
  }, [markAttendanceSeekersIds, setSelectedSeekersCheckboxes]);

  const handleJoinInfinipath = () => {
    // Map each seeker with the correct face verification status
    const seekersWithStatus = selectedSeekersCheckboxes.map((userId) => {
      const isMarked = markAttendanceSeekersIds.some(
        (item) =>
          item.userId === userId && item.text === textConstants.attendanceText,
      );
      return {
        userId,
        faceVerificationStatus: isMarked,
      };
    });

    // Add the selected seekers to local storage
    setItemInLocalStorage("attendees", seekersWithStatus);
    //if the seeker is admin or mahatria then redirect to new tab and opens the zoom link
    if (
      JOIN_MEETING_THROUGH_ZOOM &&
      (seekerData?.role === textConstants.mahatriaRole ||
        seekerData?.role === textConstants.adminRole)
    ) {
      setSmallLoading(true);
      handleZoomRedirection(setSmallLoading);
      joinmeetingAttendance();
    } else {
      // If the seeker is then they will redirect to the zoom page in the app
      navigate("/myspace/zoom"); // Navigate to zoom page
      joinmeetingAttendance();
    }
  };

  return (
    <div
      className={styles.addedSeekersContainer}
      style={{ width: isMobileResolution ? "100%" : "76%" }}
    >
      <div
        className={`${isJoiningWithOthers ? styles.addedSeekers : `${styles.addedSeekers} ${styles.addedSeekersJoinWithOthers}`}`}
        data-testid="added-seekers-list"
      >
        <div className={styles.myGroupHeading}>
          <span className={styles.myGroupTitle} data-testid="my-group-title">
            {textConstants.myGroupMembersText}
          </span>
          {(addedMembers.length > 0 || nonAddedMembers.length > 0) && (
            <img
              src={infoAlert}
              alt="info-alert"
              className={styles.infoAlertIcon}
              onClick={() => setOpenInfoModal && setOpenInfoModal(true)}
            />
          )}
        </div>

        {/* Avatar and user verified status only for joinwithothers flow */}
        {isJoiningWithOthers && ENABLE_JOIN_WITH_OTHERS && (
          <div className={styles.seekerVerificationStatusContainer}>
            <div>
              <Avatar
                alt="Remy Sharp"
                src={
                  seekerDetails?.profileUrl
                    ? seekerDetails?.profileUrl
                    : defaultProfileIcon
                }
                sx={{
                  width: 50,
                  height: 50,
                  border: "1px solid #DDDDDD",
                }}
                data-testid={`seeker-avatar-${seekerDetails?.id}`}
              />
            </div>
            <div className={styles.seekerVerificationStatusTextContainer}>
              <p data-testid={`seeker-name-${seekerDetails?.id}`}>
                {seekerDetails?.firstName}, your attendance is marked{" "}
                <span
                  className={
                    seekerVerifiedStatus
                      ? styles.verifiedColor
                      : styles.notVerifiedColor
                  }
                >
                  {seekerVerifiedStatus
                    ? textConstants.withVerification
                    : textConstants.withoutVerification}
                </span>{" "}
                {/* Your attendance will be marked. */}
              </p>
              {/* <p>Verify or mark attendance for users joining along with you.</p> */}
            </div>
          </div>
        )}
        {nonAddedMembers?.length > 0 && (
          <>
            <div
              className={styles.friendsHeading}
              data-testid="my-group-notifications-heading"
            >
              <span
                className={styles.friendsTitle}
                data-testid="my-group-notifications-title"
              >
                {textConstants.invitePendingHeading}
              </span>

              <span
                className={styles.friendSubHeading}
                data-testid="my-group-notifications-subtitle"
              >
                {invitePendingTag}
              </span>
            </div>

            <div
              className={styles.addedSeekersList}
              data-testid="my-group-notifications-list"
            >
              {nonAddedMembers?.map((user, index) => (
                <SeekerDetailsCard
                  key={uuidv4()}
                  seekerDetails={user}
                  index={index}
                  showRemoveButton
                  showVerifyButton={!user?.isVerified}
                  onRemove={() => handleRemoveSeeker(user)}
                  fetchJoinDetailsData={fetchJoinDetailsData}
                  isJoiningWithOthers={isJoiningWithOthers}
                  isMobileResolution={isMobileResolution}
                  isTabResolution={isTabResolution}
                  isHighResolution={isHighResolution}
                  setLoading={setLoading}
                />
              ))}
            </div>
          </>
        )}
        {/* Heading Content */}
        <div className={styles.friendsHeading} data-testid="my-group-heading">
          {addedMembers.length > 0 && (
            <span className={styles.friendsTitle} data-testid="my-group-title">
              {textConstants.myGroupText}
            </span>
          )}

          {addedMembers?.length > 0 && (
            <span className={styles.friendSubHeading}>
              {isJoiningWithOthers
                ? myGroupTag
                : // ? JOIN_MARK_ATTENDANCE ?  "Mark attendance for seekers joining along with you." :  "Select a member to join along with you"
                  textConstants.friendsSectionHeading}
            </span>
          )}
        </div>
        {/* MembersList */}
        <div
          className={styles.addedSeekersList}
          data-testid="added-members-list"
        >
          {addedMembers?.length > 0 &&
            addedMembers?.map((user, index) => (
              <SeekerDetailsCard
                key={uuidv4()}
                seekerDetails={user}
                index={index}
                showRemoveButton
                showVerifyButton={!user?.isVerified}
                onRemove={() => handleRemoveSeeker(user)}
                fetchJoinDetailsData={fetchJoinDetailsData}
                isJoiningWithOthers={isJoiningWithOthers}
                isMobileResolution={isMobileResolution}
                isTabResolution={isTabResolution}
                isHighResolution={isHighResolution}
                setLoading={setLoading}
                selectedSeekersCheckboxes={selectedSeekersCheckboxes}
                setSelectedSeekersCheckboxes={setSelectedSeekersCheckboxes}
              />
            ))}
          {addedMembers?.length > 0 && (
            <span className={styles.friendSubHeading}>
              {isJoiningWithOthers && textConstants.sectionListText}
            </span>
          )}
          {addedMembers.length === 0 && nonAddedMembers.length === 0 && (
            <div className={styles.noMembersIconDiv}>
              <div>
                <img src={NoMembersIcon} />
              </div>
              <p>You haven&apos;t added anyone yet</p>
              <span
                className={styles.knowMoreText}
                onClick={() => setOpenInfoModal(true)}
                data-testid="know-more-text"
              >
                <img
                  src={infoAlert}
                  alt="info-alert"
                  className={styles.infoAlertInline}
                />
                click here to know more about my group
              </span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.joinBtnContainer}>
        {isMobileResolution && (
          <Button
            type="button"
            buttonClassName={styles.addNewMemberBtn}
            data-testid="add-new-member-btn"
            onClick={() => setShowAddedMembers(false)}
          >
            {textConstants.addMembersText}
          </Button>
        )}
        {isJoiningWithOthers &&
          (!smallLoading ? (
            <Button
              type="button"
              buttonClassName={styles.joinInfButton}
              data-testid="add-new-member-btn"
              onClick={() => handleJoinInfinipath()}
            >
              {textConstants.joinInfinipathText}
            </Button>
          ) : (
            <Loader type="small" data-testid="loader" />
          ))}
      </div>
    </div>
  );
};

const SelectedMembers = ({
  selectedMembers,
  handleSeekerClick,
}: SelectedMembersProps) => {
  const selectedSeekerRef = useRef(null);
  useEffect(() => {
    if (selectedSeekerRef.current) {
      selectedSeekerRef.current.scrollLeft =
        selectedSeekerRef.current.scrollWidth;
    }
  }, [selectedMembers]);
  return (
    <div className={styles.selectedSeeker} ref={selectedSeekerRef}>
      {selectedMembers.map((seeker, index) => (
        <div key={index}>
          <div
            className={styles.profileIconDiv}
            data-testid={`search-modal-selected-seeker-${index}`}
          >
            <Avatar
              alt="Remy Sharp"
              src={
                seeker?.profileUrl && seeker?.profileUrl?.length > 0
                  ? modifyProfileUrl(seeker?.profileUrl)
                  : defaultProfileIcon
              }
              sx={{
                width: 50,
                height: 50,
              }}
              data-testid={`search-modal-user-avatar-${index}`}
            />
            <div
              className={styles.crossFill}
              key={index}
              data-testid="success-icon-container"
            >
              <img
                src={crossFill}
                alt="cross-icon"
                data-testid="cross-icon"
                onClick={() => handleSeekerClick(seeker)}
              />
            </div>
          </div>
          <Tooltip title={seeker?.fullName} arrow>
            <div className={styles.toolSeekerName}>{seeker?.fullName}</div>
          </Tooltip>
        </div>
      ))}
    </div>
  );
};

const MembersList = ({
  members,
  totalMembersCount,
  selectedMembers,
  inputValue,
  setInputValue,
  setPageNumber,
  setSelectedMembers,
  setLoading,
  membersListContainerRef,
  resetAlltheData,
  setShowAddedMembers,
  isMobileResolution,
  isJoiningWithOthers,
  seekerData,
}: MembersListProps) => {
  //handle seeker click in search list
  const handleSeekerClick = (user: User) => {
    const isMemberPresent = selectedMembers.some(
      (member: User) => member.id === user.id,
    );
    if (isMemberPresent) {
      setSelectedMembers((prevMembers) =>
        prevMembers.filter((member: User) => member.id !== user.id),
      );
    } else {
      setSelectedMembers((prevMembers) => [...prevMembers, user]);
    }
  };

  const handleSearch = (e) => {
    setInputValue(e.target.value);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    // Store previous scroll position to determine direction
    const isScrollingDown =
      scrollTop >
      (target.dataset.prevScroll ? parseInt(target.dataset.prevScroll) : 0);

    // Update previous scroll position
    target.dataset.prevScroll = scrollTop.toString();

    // Only load more if scrolling down and near bottom
    if (isScrollingDown && scrollTop + clientHeight + 3 >= scrollHeight) {
      if (members.length < totalMembersCount) {
        setPageNumber((prevPage) => prevPage + 1);
      }
    }
  };

  //Adding members to the group
  const updateSeekerDetails = (selectedMembers: User[]) => {
    if (!selectedMembers.length) {
      setShowAddedMembers(true);
      return;
    }

    setSelectedMembers([]);
    const modifiedMembers = selectedMembers.map((seeker) => ({
      userId: seeker?.id,
    }));
    const updateSeekerPayload = {
      // user_id: user_id,
      // type: "ADD", // ADD, UPDATE, DELETE
      members: modifiedMembers,
    };
    setLoading(true);
    postCall(
      `${endPoints.users}/${seekerData?.id}/members`,
      updateSeekerPayload,
      INFINIPATH
    )
      .then((res) => {
        if (res?.data?.statusCode === 200) {
          resetAlltheData();
          setLoading(false);
          setShowAddedMembers(true);
          setInputValue("");
        } else {
          setLoading(false);
          // setErrorMessage(res?.data?.message);
        }
      })
      .catch((error) => {
        console.error("error", error);
      });
  };

  const handleCloseAddMembers = () => {
    setShowAddedMembers(true);
    setSelectedMembers([]);
  };
  return (
    <div className={styles.membersList}>
      <div className={styles.listHeading}>
        <span className={styles.searchText}>
          Find and invite seekers using their name or mobile number
        </span>
        <div className={styles.closeIcon} onClick={handleCloseAddMembers}>
          <img src={closeIcon} alt="close icon " />
        </div>
      </div>
      <TextField
        value={inputValue}
        placeholder={textConstants.searchSeekerPlaceholder}
        // autoFocus={true}
        onChange={handleSearch}
        className={styles.customInput}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: inputValue && (
            <InputAdornment position="end">
              <img
                src={cancelText}
                onClick={() => setInputValue("")}
                style={{ cursor: "pointer" }}
              />
            </InputAdornment>
          ),
          classes: { notchedOutline: styles.noBorder },
        }}
      />
      {selectedMembers.length > 0 && (
        <SelectedMembers
          selectedMembers={selectedMembers}
          handleSeekerClick={handleSeekerClick}
        />
      )}
      <div
        onScroll={handleScroll}
        ref={membersListContainerRef}
        className={
          isJoiningWithOthers
            ? selectedMembers?.length > 0
              ? styles.addMembersDataJoinWithOthersScroll
              : styles.addMembersDataJoinWithOthers
            : selectedMembers?.length > 0
              ? styles.addMembersDataScroll
              : styles.addMembersData
        }
      >
        {members?.length > 0 ? (
          members.map((user: User, index: number) => {
            const isMemberAdded = selectedMembers.some(
              (member) => member.id === user.id,
            );
            return (
              <UserItem
                key={user.id}
                user={user}
                index={index}
                onClick={() => handleSeekerClick(user)}
                isMemberAdded={isMemberAdded}
              />
            );
          })
        ) : (
          <div className={styles.notFoundText}>
            {textConstants.unableToFindSeekers}
          </div>
        )}
      </div>
      {!isMobileResolution ? (
        <div
          className={
            isJoiningWithOthers ? styles.joinFloatArrow : styles.floatArrow
          }
        >
          <img
            src={sendInviteImage}
            alt="float-arrow"
            data-testid="cross-icon"
            onClick={() => {
              updateSeekerDetails(selectedMembers);
            }}
          />
        </div>
      ) : (
        isMobileResolution &&
        selectedMembers.length > 0 && (
          <div
            className={
              isJoiningWithOthers ? styles.joinFloatArrow : styles.floatArrow
            }
          >
            <img
              src={sendInviteImage}
              alt="float-arrow"
              data-testid="cross-icon"
              onClick={() => {
                updateSeekerDetails(selectedMembers);
              }}
            />
          </div>
        )
      )}
    </div>
  );
};

const FriendsAndFamilyV2 = () => {
  const isJoiningWithOthers =
    window.location.pathname.includes("joinwithothers");
  // Use a single loading state object to track multiple API calls
  const [loadingState, setLoadingState] = useState({
    joinDetails: false,
    seekersData: false,
  });
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalMembersCount, setTotalMembersCount] = useState(0);
  const [membersData, setMembersData] = useState([]);
  const [nonMembersData, setNonMembersData] = useState([]);
  const [showAddedMembers, setShowAddedMembers] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [deletedseeker, setDeletedseeker] = useState({});
  const [openInfoModal, setOpenInfoModal] = useState(false); // Already present

  const debouncedInputValue = useDebounce(inputValue, 500);
  const { isMobileResolution, isTabResolution, isHighResolution } = UseResize();
  const [error, setError] = useState("");
  const membersListContainerRef = useRef<HTMLDivElement>(null);
  // to clear the local storage data when the user navigates to family and friends
  const location = useLocation();
  const hasShownAlertRef = useRef(false);
  const seekerData = getItemInLocalStorage(LOCAL_STORAGE_KEYS.SEEKER_DETAILS);
  //in joinWithOtherPage - selectedSeekersCheckboxes is used to store the selected seekers
  const [selectedSeekersCheckboxes, setSelectedSeekersCheckboxes] = useState<
    string[]
  >([]);

  // Helper function to determine if any API is currently loading
  const isLoading = () => {
    return loadingState.joinDetails || loadingState.seekersData;
  };

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Set the initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  //To reset both userslist and my members list once add or remove API is successfully executed
  const resetAlltheData = () => {
    setMembers([]);
    setSelectedMembers([]);
    fetchJoinDetailsData();
    setPageNumber(1);

    fetchSeekersData(debouncedInputValue);
  };

  //fetching members data
  const fetchJoinDetailsData = (
    setIsModalOpen?: (status: boolean) => void,
    responses?: unknown,
  ) => {
    // Set loading state for join details
    setLoadingState((prev) => ({ ...prev, joinDetails: true }));

    const url = endPoints.getUserMembers(seekerData?.id, 1, 50);
    getCall(url, undefined, INFINIPATH)
      .then((response: unknown) => {
        if (response?.data?.statusCode === 200) {
          setLoadingState((prev) => ({ ...prev, joinDetails: false }));
          setMembersData(response?.data?.data?.members?.memberData);
          setNonMembersData(response?.data?.data?.members?.nonMemberData);
          setIsModalOpen && setIsModalOpen(false);
          responses &&
            alert(
              responses?.data?.message || textConstants.verifiedSuccessText,
            );
        } else {
          setLoadingState((prev) => ({ ...prev, joinDetails: false }));
          // setErrorMsg(response?.data?.message || "Error fetching members data");
        }
      })
      .catch((error: unknown) => {
        console.error("Error fetching members data:", error);
        setLoadingState((prev) => ({ ...prev, joinDetails: false }));
        // setErrorMsg("Failed to fetch data");
      });
  };

  //handle delete seeker with an api call
  const handleDelete = (seeker: unknown) => {
    setSelectedMembers([]);
    const deletePayload = {
      members: [
        {
          id: seeker?.id, // only id is required for DELETE
        },
      ],
    };
    setLoadingState((prev) => ({ ...prev, joinDetails: true }));

    deleteCall(`${endPoints.users}/${seekerData?.id}/members`, deletePayload, INFINIPATH)
      .then((res) => {
        if (res?.data?.statusCode === 200) {
          resetAlltheData();
          setDeletedseeker({});
          setPopupOpen(false);
        } else if (
          res.data.statusCode === 400 &&
          res.data.message === MESSAGE.MEMBER_ALREADY_DELETED
        ) {
          alert(res.data.message);
          resetAlltheData();
          setDeletedseeker({});
          setPopupOpen(false);
        } else {
          setError("unable to delete seeker , please try again");
          setLoadingState((prev) => ({ ...prev, joinDetails: false }));
        }
        // removeItemInLocalStorage("selectedSeekerDetails");
      })
      .catch((error) => {
        console.error("Error deleting seeker:", error);
        setError("Failed to delete seeker. Please try again later.");
        setLoadingState((prev) => ({ ...prev, joinDetails: false }));
      });
  };

  //handle delete seeker
  const handleDeleteCard = (seeker: unknown) => {
    setPopupOpen(true);
    setDeletedseeker(seeker);
  };

  //handle cancel popup
  const handleCancel = () => {
    setPopupOpen(false);
  };

  useEffect(() => {
    fetchJoinDetailsData();
  }, []);

  useEffect(() => {
    fetchSeekersData(debouncedInputValue);
  }, [debouncedInputValue, pageNumber]);

  useEffect(() => {
    setPageNumber(1); // Reset to first page when search value changes
    if (membersListContainerRef?.current) {
      membersListContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [inputValue]);

  const fetchSeekersData = async (debouncedInputValue: string) => {
    const URL = `${endPoints.users}?excludeUserAndMembers=${seekerData?.id}&page=${pageNumber}&size=${SCROLL_PAGINATION.PAGE_SIZE}&searchString=${debouncedInputValue.trim()}`;

    try {
      // Set loading state for seekers data
      setLoadingState((prev) => ({ ...prev, seekersData: true }));

      const response = await getCall(URL, undefined, INFINIPATH);
      const { usersData, totalUsersCount } = response?.data?.data || {};
      if (response?.data?.statusCode === 200) {
        if (pageNumber === 1) {
          setMembers([]);
          setMembers(usersData);
        } else {
          setMembers((prevMembers) => [...prevMembers, ...usersData]);
        }
        setTotalMembersCount(totalUsersCount);
      } else {
        console.error("Error:", response?.data?.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      // Always set loading state to false when done
      setLoadingState((prev) => ({ ...prev, seekersData: false }));
    }
  };
  const breadcrumbItems = [
    { label: "infinipath", path: "/" },
    { label: "join with others", path: "/joinwithothers" },
  ];

  // to clear the local storage data when the user navigates to family and friends
  useEffect(() => {
    // Clear localStorage if not joining with others
    if (isJoiningWithOthers === false) {
      clearArrayInLocalStorage("attendanceSeekers");
    }
    // Show alert if navigated from verifyuserface while verifying the seeker in friends and family and join with others
    if (
      location?.state?.from === "/myspace/verifyuserface" &&
      location?.state?.message &&
      !hasShownAlertRef.current
    ) {
      alert(location.state.message);
      hasShownAlertRef.current = true;
    }
  }, [location.pathname]);

  // Create a function to get common popup props
  const getDeletePopupProps = (
    setPopupOpen: (value: boolean) => void,
    deletedseeker: unknown,
    handleDelete: (seeker: unknown) => void,
    handleCancel: () => void,
  ): DeletePopupProps => ({
    open: true,
    onclose: () => setPopupOpen(false),
    title: textConstants.deleteAccount,
    description: `${textConstants.areYouSureText} ${deletedseeker?.fullName} ${textConstants.fromList}`,
    onConfirm: () => handleDelete(deletedseeker),
    onCancel: handleCancel,
    confirmText: LOGIN_TEXT.YES,
    cancelText: LOGIN_TEXT.NO,
    "data-testid": "delete-popup",
    phoneNumberError: error,
  });

  return (
    <div>
      {isJoiningWithOthers && (
        <div className={styles.breadCrumb}>
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}
      <div
        className={
          isJoiningWithOthers
            ? styles.JoinWithOthersContainer
            : styles.container
        }
      >
        {isLoading() && <Loader type="large" data-testid="loader" />}
        {(!isMobileResolution || !showAddedMembers) && (
          <MembersList
            members={members}
            selectedMembers={selectedMembers}
            inputValue={inputValue}
            setInputValue={setInputValue}
            setPageNumber={setPageNumber}
            setSelectedMembers={setSelectedMembers}
            resetAlltheData={resetAlltheData}
            totalMembersCount={totalMembersCount}
            membersListContainerRef={membersListContainerRef}
            setShowAddedMembers={setShowAddedMembers}
            setLoading={(loading) =>
              setLoadingState((prev) => ({ ...prev, seekersData: loading }))
            }
            isMobileResolution={isMobileResolution}
            isJoiningWithOthers={isJoiningWithOthers}
            seekerData={seekerData}
          />
        )}
        {(!isMobileResolution || showAddedMembers) && (
          <AddedMembers
            addedMembers={membersData}
            nonAddedMembers={nonMembersData}
            setLoading={(loading) =>
              setLoadingState((prev) => ({ ...prev, joinDetails: loading }))
            }
            handleRemoveSeeker={handleDeleteCard}
            isJoiningWithOthers={isJoiningWithOthers}
            seekerDetails={seekerData}
            fetchJoinDetailsData={fetchJoinDetailsData}
            isMobileResolution={isMobileResolution}
            setShowAddedMembers={setShowAddedMembers}
            isTabResolution={isTabResolution}
            isHighResolution={isHighResolution}
            selectedSeekersCheckboxes={selectedSeekersCheckboxes}
            setSelectedSeekersCheckboxes={setSelectedSeekersCheckboxes}
            seekerData={seekerData}
            openInfoModal={openInfoModal}
            setOpenInfoModal={setOpenInfoModal}
          />
        )}

        {popupOpen &&
          (isMobileResolution ? (
            <CustomMobileDrawer
              {...getDeletePopupProps(
                setPopupOpen,
                deletedseeker,
                handleDelete,
                handleCancel,
              )}
            />
          ) : (
            <CustomPopupNewV2
              {...getDeletePopupProps(
                setPopupOpen,
                deletedseeker,
                handleDelete,
                handleCancel,
              )}
              grayLine={true}
            />
          ))}

        {openInfoModal && (
          <Dialog
            open={openInfoModal}
            onClose={() => setOpenInfoModal(false)}
            maxWidth={false}
            fullScreen
            data-testid="instructions-dialog"
            sx={{
              "& .MuiDialogContent-root": {
                padding: "0px !important",
              },
            }}
          >
            <Header data-testid="dialog-header" />
            <div className={styles.dialogBlock}>
              <DialogContent>
                <iframe
                  src={`${process.env.REACT_APP_WEB_URL}groupInstructions.html`}
                  className={styles.DialogText}
                  style={{
                    width: "100%",
                    height: "calc(100vh - 215px)",
                    border: "none",
                  }}
                  data-testid="dialog-iframe"
                />
                {/* Generated by Copilot */}
              </DialogContent>
              <div className={styles.closeButtonContainer}>
                <Button
                  onClick={() => setOpenInfoModal(false)}
                  buttonClassName={styles.closeButton}
                  buttonTextClassName={styles.closeButtonText}
                  data-testid="close-button"
                >
                  ok
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default FriendsAndFamilyV2;
