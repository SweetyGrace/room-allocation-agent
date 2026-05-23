import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";
import SessionsModal from "../SessionsModal";
import MeetingCard from "../MeetingCard";
import { endPoints } from "../../../constants/urlConstants";
import { useDispatch } from "react-redux";
import { setAnaltyicsFilters, setSessionDate, setSessionType, setTotalAudience } from "../../../reducers/AnalyticsReducer";
import noDataIcon from "../../../assets/images/no-behaviour-data.svg";

interface Meeting {
  title: string;
  webinarId: string;
  sessionDate: string;
}

interface Meetings {
  seekersAttendedInfinipath: Meeting[];
  limit?: number;
  setLimit?: (limit: number) => void;
  page?: number;
  setPage?: (page: number) => void;
}

const MeetingsList: React.FC<Meetings> = ({
  seekersAttendedInfinipath = [],
  limit,
  setLimit,
  page,
  setPage,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [meetingData, setMeetingData] = useState<Meeting[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    seekersAttendedInfinipath.length > 0 ?
    setMeetingData(seekersAttendedInfinipath || []): setMeetingData([])
  }, [seekersAttendedInfinipath]);

  const handleOpenModal = () => {
    if (setLimit) {
      setLimit(10);
    }
    setIsModalOpen(true);
  }

  const handleCloseModal = () => setIsModalOpen(false);

  const handleWebinarClick = (meeting: Meeting) => {
          dispatch(setSessionDate(meeting?.sessionDate));
          dispatch(setSessionType("default"));
          dispatch(setTotalAudience(0));
          dispatch(setAnaltyicsFilters(
            {
              audienceType: [],
              gender: [],
              ageGroup:[],
              location: []
            }));
    navigate(`${endPoints.sessionAnalytics}?sessionId=${meeting?.webinarId}`);
  };
  // Add a helper function to check if meeting has data
  const isMeetingEmpty = (meeting: unknown): boolean => {
    return !meeting || (typeof meeting === 'object' && Object.keys(meeting).length === 0);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.title}>
          Recent infinipath(s)
          {meetingData.length > 0 && !meetingData.every(isMeetingEmpty) && <span className={styles.viewAll} onClick={handleOpenModal}>View All</span>}
        </div>
        {meetingData.length > 0 && !meetingData.every(isMeetingEmpty) ? (
          <div className={styles.meetings}>
            {meetingData
              .filter(meeting => !isMeetingEmpty(meeting))
              .slice(0, 3)
              .map((meeting, index) => (
                <MeetingCard
                  key={index}
                  meeting={meeting}
                  onWebinarClick={handleWebinarClick}
                />
              ))}
          </div>
        ) : (
          <div className={styles.noSeekers}>
              <div className={styles.noSeekersImage}>
          <img src = {noDataIcon}/>
          </div>
          <p>No infinipath attended.</p>
          </div>
        )}
      </div>
      <SessionsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="All infinipath(s)"
        data={seekersAttendedInfinipath as any}
        limit={limit}
        setLimit={setLimit}
        page={page}
        setPage={setPage}
      />
    </>
  );
};

export default MeetingsList;
