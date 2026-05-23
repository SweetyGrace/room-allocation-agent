import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import { getCall } from "../../services/apiService";
import Loader from "../../common/components/Loader";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import {
  getItemInLocalStorage,
  removeItemInLocalStorage,
  setItemInLocalStorage,
} from "../../services/localStorage";
import { useDispatch, useSelector } from "react-redux";
import {
  addMembers,
  addSeekerToVerify,
  addSelectedSeekersBeforeJoin,
  addVerifiedSeekersIds,
  removeSeekerProfile,
} from "../../reducers/SeekerReducer";
import { Button } from "../../common/components/Button";
import SearchModal from "../../common/components/SearchOverlay";
import SeekerCard from "../../common/components/SeekerCard";
import AddNewCard from "../../common/components/AddNewCard";
import infoIcon from "../../assets/images/info-icon.svg";
import { RootState } from "../../store";

const JoinWithOthersCard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //States from reducer
  const selectedSeekersBeforeJoin = useSelector(
    (state: RootState) => state?.seekerReducer?.selectedSeekersBeforeJoin || [],
  );
  const verifiedSeekersIds = useSelector(
    (state: RootState) => state?.seekerReducer?.verifiedSeekersIds || [],
  );
  const notVerifiedSeekersIds = useSelector(
    (state: RootState) => state?.seekerReducer?.notVerifiedSeekersIds || [],
  );

  //Logged in seeker data from local storage
  const seekerDetails = getItemInLocalStorage("seekerDetails") || {};
  const [loading, setLoading] = useState(true);
  const [membersData, setMembersData] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isChecked, setIsChecked] = useState<Array<string>>(
    selectedSeekersBeforeJoin,
  );
  const [searchPopup, setSearchPopup] = useState(false);

  //fetch join details data
  const fetchJoinDetailsData = () => {
    setLoading(true);
    getCall(`${endPoints.users}/${seekerDetails?.id}/members?page=1&size=20`, undefined, INFINIPATH)
      .then((response: unknown) => {
        if (response?.data?.statusCode === 200) {
          setLoading(false);
          setMembersData(response?.data?.data?.members?.memberData);
          dispatch(addMembers(response?.data?.data?.members?.memberData));
        } else {
          setLoading(false);
          setErrorMsg(response?.data?.message);
        }
      })
      .catch((error: unknown) => {
        setLoading(false);
        setErrorMsg("Failed to fetch data", error);
      });
  };

  //handle checkbox change
  const handleChange = (value: string) => {
    setIsChecked((prevIsChecked) => {
      const isCurrentlyChecked = prevIsChecked?.includes(value);
      if (isCurrentlyChecked) {
        // Remove the value if it exists
        dispatch(
          addSelectedSeekersBeforeJoin(
            prevIsChecked?.filter((item) => item !== value),
          ),
        );
        return prevIsChecked?.filter((item) => item !== value);
      } else {
        // Add the value if it doesn't exist
        dispatch(addSelectedSeekersBeforeJoin([...prevIsChecked, value]));
        return [...prevIsChecked, value];
      }
    });
  };

  /**
   * @param seeker
   * @description function to handle click on search results seeker, Navigates to verify user face page if the seeker has a face url
   */
  const handleSeekerClick = (seeker: unknown) => {
    setItemInLocalStorage("selectedSeekerDetails", seeker);
    /**Check for infinipath user and having face url or not else take user to phone number verification page*/
    if (seeker?.faceUrl) {
      dispatch(addVerifiedSeekersIds([...verifiedSeekersIds, seeker?.id]));
      navigate(
        `/verifyuserface?through_search=true&user_id=${seekerDetails?.phoneNumber}`,
      );
    } else {
      navigate(`/infinipath/verifyphonenumber`, {
        state: {
          phoneNumber: seeker?.phoneNumber,
          countryCode: seeker?.countryCode,
        },
      });
    }
  };

  /**
   * @param seeker
   * @description function to handle click on verify button, adds the seeker to the redux state and navigates to verify user face page
   */
  const handleVerifyClick = (seeker: unknown) => {
    dispatch(addSelectedSeekersBeforeJoin(isChecked));
    dispatch(addSeekerToVerify(seeker));
    navigate("/verifyuserface?join_with_others=true");
  };

  /**
   * @description fetches the join details data
   */
  useEffect(() => {
    removeItemInLocalStorage("seekerToAdd");
    removeItemInLocalStorage("selectedSeekerDetails");
    dispatch(removeSeekerProfile());
    fetchJoinDetailsData();
  }, []);

  /**
   * @description function to handle join button click
   */
  const handleJoin = () => {
    // Mark attendance for verified seekers and selected seekers before join
    const attendanceIds = Array.from(
      new Set(
        [...verifiedSeekersIds, ...isChecked]?.filter(
          (id) => verifiedSeekersIds?.includes(id) && isChecked?.includes(id),
        ),
      ),
    );
    setItemInLocalStorage("verifiedSeekersIds", attendanceIds);
    // Array of objects with user_id and face_verification_status
    const seekersWithStatus = [
      ...verifiedSeekersIds.map((id) => ({
        userId: id,
        faceVerificationStatus: true,
      })),
      ...notVerifiedSeekersIds.map((id) => ({
        userId: id,
        faceVerificationStatus: false,
      })),
    ];
    //Add the selected seekers to the local storage
    setItemInLocalStorage("attendees", seekersWithStatus);
    navigate("/infinipath/zoom"); //Navigate to zoom page
  };

  const handleOpenSearchPopUp = () => {
    //open search popup
    setSearchPopup(true);
  };

  //Count of seekers who can join with the user
  const joiningSeekersCount = membersData?.filter(
    (member: unknown) =>
      verifiedSeekersIds.includes(member.userId) ||
      notVerifiedSeekersIds.includes(member.userId),
  ).length;

  return (
    <div className={styles.joinOthersCard} data-testid="join-others-card">
      {loading && <Loader type="large" data-testid="loader" />}
      <div className={styles.container} data-testid="container">
        <div className={styles.familyTitle} data-testid="family-title">
          <span className={styles.mainHeading} data-testid="main-heading">
            My group members
          </span>
          <br />
          {joiningSeekersCount > 0 ? (
            <div data-testid="mark-attendance-text" className={styles.textInfo}>
              <div>
                <span
                  className={styles.headingText}
                  data-testid="seekers-count-text"
                >
                  <span
                    className={styles.markSeekerText}
                    data-testid="mark-seeker-text"
                  >
                    {joiningSeekersCount}{" "}
                    {joiningSeekersCount > 1 ? "seekers" : "seeker"}
                  </span>{" "}
                  can join with you
                </span>
              </div>
              <span className={styles.infodiv}>
                <img
                  src={infoIcon}
                  alt="info-icon"
                  data-testid="info-icon"
                  className={styles.arrowIcon}
                />
                <i data-testid="info-message" className={styles.infoText}>
                  Click {"'"}mark attendance{"'"} for each of the seekers
                  attending this session with you.
                </i>
              </span>
            </div>
          ) : membersData?.length !== 0 ? (
            <div data-testid="mark-attendance-text" className={styles.textInfo}>
              <div>
                <span className={styles.markSeekerText}>
                  Mark the seekers attendance{" "}
                </span>{" "}
                <span className={styles.headingText}>
                  to join the session with you.
                </span>
              </div>
              <span className={styles.infodiv}>
                <img
                  src={infoIcon}
                  alt="info-icon"
                  data-testid="info-icon"
                  className={styles.arrowIcon}
                />
                <i data-testid="info-message" className={styles.infoText}>
                  Click {"'"}mark attendance{"'"} for each of the seekers
                  attending this session with you.
                </i>
              </span>
            </div>
          ) : (
            <span className={styles.headingText} data-testid="no-seekers-text">
              No seekers added yet!
            </span>
          )}
        </div>
        {errorMsg && (
          <p className={styles.errorMsg} data-testid="error-msg">
            {errorMsg}
          </p>
        )}
        <div className={styles.cardsWithButton} data-testid="cards-with-button">
          <div className={styles.cardsWrapper} data-testid="cards-wrapper">
            {membersData?.length > 0 &&
              membersData?.map((member: unknown, index: number) => (
                <div
                  className={styles.seekerRow}
                  key={index}
                  data-testid={`seeker-row-${index}`}
                >
                  <SeekerCard
                    seeker={member}
                    friendsAndFamily={false}
                    handleChange={handleChange}
                    joinClicked={
                      isChecked?.includes(member?.userId) ? true : false
                    }
                    handleVerifyClick={handleVerifyClick}
                    verifyStatus={
                      !verifiedSeekersIds?.includes(member?.userId) &&
                      !notVerifiedSeekersIds?.includes(member?.userId)
                        ? "mark attendance"
                        : verifiedSeekersIds?.includes(member?.userId)
                          ? "Joining"
                          : notVerifiedSeekersIds?.includes(member?.userId)
                            ? "Joining but not verified"
                            : ""
                    }
                    seekerCardStyles={styles.seekerCardStyles}
                    data-testid={`seeker-card-${index}`}
                  />
                </div>
              ))}
            <div className={styles.seekerRow} data-testid="add-new-card-row">
              <AddNewCard
                handleOpenSearchPopUp={handleOpenSearchPopUp}
                cardStyles={styles.addNewSeekerCard}
                data-testid="add-new-card"
              />
            </div>
          </div>
          <Button
            onClick={() => handleJoin()}
            buttonClassName={styles.buttonText}
            type="button"
            datatestid="join-button"
            datatestidText="join"
          >
            join infinipath
          </Button>
        </div>
        {searchPopup && (
          <SearchModal
            open={searchPopup}
            onClose={() => setSearchPopup(false)}
            handleSeekerClick={handleSeekerClick}
            data-testid="search-modal"
          ></SearchModal>
        )}
      </div>
    </div>
  );
};

export default JoinWithOthersCard;
