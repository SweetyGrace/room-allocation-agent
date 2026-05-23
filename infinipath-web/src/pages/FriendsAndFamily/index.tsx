import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import { deleteCall, getCall } from "../../services/apiService";
import Loader from "../../common/components/Loader";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import personImage from "../../assets/images/person-Image.webp";
import SearchModal from "../../common/components/SearchOverlay";
import SeekerCard from "../../common/components/SeekerCard";
import AddNewCard from "../../common/components/AddNewCard";
import { Button } from "../../common/components/Button";
import CustomPopup from "../../common/components/CustomPopup";
import {
  getItemInLocalStorage,
  removeItemInLocalStorage,
  setItemInLocalStorage,
} from "../../services/localStorage";
import { useDispatch } from "react-redux";
import { removeSeekerProfile } from "../../reducers/SeekerReducer";

const FriendsAndFamily: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [membersData, setMembersData] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchPopup, setSearchPopup] = useState(false);
  const [checkReload, setCheckReload] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [deletedseeker, setDeletedseeker] = useState({});
  const [selectedCards, setSelectedCards] = useState<unknown[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const seekerDetails = getItemInLocalStorage("seekerDetails");

  //handle cancel popup
  const handleCancel = () => {
    setPopupOpen(false);
  };

  //remove items from local storage
  useEffect(() => {
    removeItemInLocalStorage("seekerToAdd");
    removeItemInLocalStorage("selectedSeekerDetails");
    dispatch(removeSeekerProfile());
  }, []);

  //get user id from local storage

  //handle delete seeker
  const handleDeleteCard = (seeker: unknown) => {
    setPopupOpen(true);
    setDeletedseeker(seeker);
  };

  //handle delete seeker with an api call
  const handleDelete = (seeker: unknown) => {
    const deletePayload = {
      members: [
        {
          id: seeker?.id, // only id is required for DELETE
        },
      ],
    };
    setLoading(true);
    setCheckReload(false);
    deleteCall(
      `${endPoints.users}/${seekerDetails?.id}/members`,
      deletePayload,
      INFINIPATH
    ).then((res) => {
      if (res?.data?.data?.statusCode === 200) {
        setLoading(false);
        setSelectedCards((prevSelectedCards: unknown) => {
          if (prevSelectedCards?.includes(seeker)) {
            return prevSelectedCards?.filter((card) => card !== seeker);
          }
        });
      } else {
        setLoading(false);
      }
      removeItemInLocalStorage("selectedSeekerDetails");
      setCheckReload(true);
    });
    setDeletedseeker({});
    setPopupOpen(false);
  };

  //fetching members data
  const fetchJoinDetailsData = () => {
    setLoading(true);
    const url = endPoints.getUserMembers(seekerDetails?.id, 1, 15);
    getCall(url, undefined, INFINIPATH)
      .then((response: unknown) => {
        if (response?.data?.statusCode === 200) {
          setLoading(false);
          setMembersData(response?.data?.data?.members?.memberData);
        } else {
          setLoading(false);
          setErrorMsg(response?.data?.message || "Error fetching members data");
        }
      })
      .catch((error: unknown) => {
        console.error("Error fetching members data:", error);
        setLoading(false);
        setErrorMsg("Failed to fetch data");
      });
    setCheckReload(false);
  };

  //handle seeker click to navigate to verify user face page or phone number verification page
  const handleSeekerClick = (seeker: unknown) => {
    setItemInLocalStorage("selectedFriendOrFamily", seeker);
    if (seeker?.faceUrl) {
      navigate(`/verifyuserface?friendsAndFamily=true`);
    } else {
      navigate(`/infinipath/verifyphonenumber?friendsAndFamily=true`, {
        state: {
          phoneNumber: seeker?.phoneNumber,
          countryCode: seeker?.countryCode,
        },
      });
    }
  };

  //handle open search popup
  const handleOpenSearchPopUp = () => {
    setSearchPopup(true);
  };

  //fetch members data on page load
  useEffect(() => {
    if (checkReload) {
      fetchJoinDetailsData();
    }
  }, [checkReload]);

  //handle card click
  const handleCardClick = (member: unknown) => {
    setSelectedCards((prevSelectedCards) => {
      if (prevSelectedCards.includes(member)) {
        return prevSelectedCards.filter((card) => card !== member);
      } else {
        return [...prevSelectedCards, member];
      }
    });
  };

  return (
    <div data-testid="friends-and-family-page">
      {loading && <Loader type="large" data-testid="loader" />}
      <div className={styles.container} data-testid="friends-container">
        <div className={styles.friendsContainer}>
          {errorMsg && (
            <p className={styles.errorMsg} data-testid="error-message">
              {errorMsg}
            </p>
          )}
          {membersData?.length !== 0 ? (
            <div className={styles.friendsList} data-testid="friends-list">
              <div className={styles.friendsHeading}>
                <span
                  className={styles.friendsTitle}
                  data-testid="friends-title"
                >
                  My group members
                </span>
                {membersData?.length && (
                  <div
                    className={styles.friendsLength}
                    data-testid="friends-count"
                  >
                    {membersData?.length}{" "}
                    {membersData?.length === 1 ? "seeker" : "seekers"} added!
                  </div>
                )}
              </div>
              <div className={styles.cardsWrapper} data-testid="cards-wrapper">
                {membersData?.map((member: unknown, index: number) => (
                  <div
                    className={styles.seekerRow}
                    key={index}
                    data-testid={`seeker-card-${index}`}
                  >
                    <SeekerCard
                      seeker={member}
                      friendsAndFamily
                      handleDelete={handleDeleteCard}
                      clicked={selectedCards.includes(member) ? true : false}
                      onClick={() => handleCardClick(member)}
                    />
                  </div>
                ))}
                <div className={styles.seekerRow}>
                  <AddNewCard handleOpenSearchPopUp={handleOpenSearchPopUp} />
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noMember} data-testid="no-members">
              <div className={styles.flexColumn}>
                <div className={styles.noseeker}>
                  <img
                    src={personImage}
                    alt="person"
                    className={styles.personImage}
                    data-testid="no-member-image"
                  />
                  <span
                    className={styles.noseekerText}
                    data-testid="no-member-text"
                  >
                   No seekers yet!
                  </span>
                </div>
                <Button
                  onClick={handleOpenSearchPopUp}
                  buttonTextClassName={styles.buttonText}
                  buttonClassName={styles.buttonContainer}
                  datatestid="add-member-button"
                  datatestidText="add-new-member"
                >
                  add new member
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {searchPopup && (
        <SearchModal
          open={searchPopup}
          onClose={() => setSearchPopup(false)}
          handleSeekerClick={handleSeekerClick}
          data-testid="search-modal"
        ></SearchModal>
      )}
      {popupOpen && (
        <CustomPopup
          open={true}
          title={"Delete Seeker"}
          description={`Are you sure you want to delete ${deletedseeker?.firstName}?`}
          onConfirm={() => {
            handleDelete(deletedseeker);
          }}
          onCancel={handleCancel}
          confirmText={"yes"}
          cancelText="no"
          note={""}
          data-testid="delete-popup"
        />
      )}
    </div>
  );
};

export default FriendsAndFamily;
