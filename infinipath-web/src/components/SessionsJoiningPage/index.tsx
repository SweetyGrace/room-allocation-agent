import React from "react";
import styles from "./index.module.scss";
import { Button } from "../../common/components/Button";
import mahatriaText from "../../assets/images/mahatria-text-image.svg";
import { setItemInLocalStorage } from "../../services/localStorage";
import { MeetingData } from "../../components/TrackSessions";
import { handleZoomRedirection } from "../../utils/commonFunctions";
interface SessionsJoiningPageProps {
    meeting?: MeetingData;
  }
const SessionsJoiningPage: React.FC<SessionsJoiningPageProps> = ({ meeting }) => {
  return (
    <div className={styles.sessionsJoiningPageContainer}>
      <div className={styles.sessionsJoiningPageContainer__content}>
        <h3
          className={styles.sessionsJoiningPageContainer__content__welcomeText}
        >
          Welcome
        </h3>
        <div
          className={
            styles.sessionsJoiningPageContainer__content__imageContainer
          }
        >
          <img
            src={mahatriaText}
            alt="mahatia"
            className={
              styles.sessionsJoiningPageContainer__content__imageContainer__image
            }
          />
        </div>
        <p className={styles.sessionsJoiningPageContainer__content__paragraph}>
          Please join the infinipath to elevate the experience of seekers
        </p>
        <Button 
        buttonTextClassName={styles.sessionsJoiningPageContainer__content__buttonText}
        buttonClassName={styles.sessionsJoiningPageContainer__content__button}
        onClick={()=>{
            setItemInLocalStorage("table_meeting_id", (meeting.id).toString());
            handleZoomRedirection();
        }
        }
        >
            join
        </Button>
      </div>
    </div>
  );
};

export default SessionsJoiningPage;
