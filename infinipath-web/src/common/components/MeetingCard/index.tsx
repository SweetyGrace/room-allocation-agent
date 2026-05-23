import React from 'react';
import styles from './index.module.scss';
import calenderIcon from "../../../assets/images/meeting-list-calender.svg";
import rightArrow from "../../../assets/images/left-arrow.svg";
import {
  getDateFromString,
  getDayOfWeek,
  getMonthAbbreviation,
  getYearBasedOnDate,
} from "../../../utils/commonFunctions";

interface MeetingCardProps {
  meeting: {
    title: string;
    webinarId: string;
    sessionDate: string;
  };
  onWebinarClick: (meeting: { title: string; webinarId: string; sessionDate: string; }) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onWebinarClick }) => {
  return (
    <div className={styles.meetingCard}>
      <div className={styles.meetingName}>
        <span>{meeting.title}</span>
        <img 
          src={rightArrow} 
          alt="arrow" 
          onClick={() => onWebinarClick(meeting)}
          style={{ cursor: 'pointer' }}
        />
      </div>
      <div className={styles.dateContainer}>
        <img src={calenderIcon} alt="calendar" />
        <span className={styles.dateText}>
          {getDayOfWeek(meeting.sessionDate)},{" "}
          {getDateFromString(meeting.sessionDate)}{" "}
          {getMonthAbbreviation(meeting.sessionDate)}{" "}
          {getYearBasedOnDate(meeting.sessionDate)}
        </span>
      </div>
    </div>
  );
};

export default MeetingCard;