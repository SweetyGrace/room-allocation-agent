import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../common/components/Loader";
import styles from "./index.module.scss";
import { HomePageCards } from "../../common/components/HomePageCards";
import addCircle from "../../assets/images/add-circle-admin.svg";
import { RegistrationsCard } from "../../common/components/RegistrationsCard";
import trackRegistrations from "../../assets/images/track-registrations.svg";
import analytics from "../../assets/images/analytics.svg";
import { FetchMeetingDetails } from "../../utils/commonFunctions";
import { getItemInLocalStorage } from "../../services/localStorage";

function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminMeetingData, setAdminMeetingData] = useState<unknown>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const role = getItemInLocalStorage("seekerDetails")?.role || "";

  /**
   * @description Fetch admin meeting data
   */
  const getAdminMeetingData = () => {
    FetchMeetingDetails(setLoading, setAdminMeetingData);
  };

  /**
   * @description Fetch admin meeting data on component mount
   */
  useEffect(() => {
    getAdminMeetingData();
  }, []);

  /**
   *
   * @description cardName HandleCard to card to navigate to respective pages
   */
  const handleCardClick = (cardName: string) => {
    setSelectedCard(cardName);
    if (cardName === "create new infinipath") {
      navigate("/admin/infinipath/createinfinipath");
    } else if (cardName === "track & manage registrations") {
      // alert("Work in progress");
      navigate("/admin/infinipath/sessions");
    } else if (cardName === "view analytics") {
      // alert("Work in progress");
      navigate("/admin/infinipath/session-analytics");
    }
  };

  return loading ? (
    <Loader type="large" />
  ) : (
    <div className={styles.userStatusContainer}>
      <div className={styles.customSubheaderContainer}>{/* infinipath */}</div>
      <div className={styles.contentContainer}>
        <div className={styles.cardContent}>
          <span className={styles.titleStyle}>
            What do you want to do Today?
          </span>
          <div className={styles.cardsDiv}>
            {role !== "mahatria" && (
              <HomePageCards
                imgsrc={addCircle}
                text="create new infinipath"
                isClicked={selectedCard === "create new infinipath"}
                setIsClicked={() => handleCardClick("create new infinipath")}
                data-testid="create-new-infinipath"
              />
            )}
            <HomePageCards
              imgsrc={trackRegistrations}
              text="track & manage sessions"
              isClicked={selectedCard === "track & manage registrations"}
              setIsClicked={() =>
                handleCardClick("track & manage registrations")
              }
              data-testid="track-manage-registrations"
            />
            <HomePageCards
              imgsrc={analytics}
              text="view analytics"
              diffStyle={true}
              isClicked={selectedCard === "view analytics"}
              setIsClicked={() => handleCardClick("view analytics")}
              data-testid="view-analytics"
            />
          </div>
        </div>
        <div className={styles.MeetingCard}>
          {adminMeetingData?.startDate && (
            <RegistrationsCard
              formattedMeetingStart={adminMeetingData?.startDate}
              duration={adminMeetingData?.duration}
              isButtons={
                adminMeetingData?.meetingStatus?.includes("START MEETING") ||
                adminMeetingData?.meetingStatus?.includes("CREATED")
              }
              meetingId={adminMeetingData?.meetingId}
              title={
                adminMeetingData?.title
                  ? adminMeetingData?.title
                  : "Weekly Growth Session"
              }
              regEndsAt={adminMeetingData?.registrationEndsAt}
              data-testid={`meeting-card-${adminMeetingData?.title}`}
              menuOptions={true}
            />
          )}
        </div>
        <div
          className={styles.refreshText}
          onClick={() => window.location.reload()}
        >
          <span>click here to refresh</span>
        </div>
      </div>
    </div>
  );
}

export default Admin;
