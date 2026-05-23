import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FetchWebinarList, UpdateWebinar } from "../../utils/commonFunctions";
import styles from "./index.module.scss";
import Loader from "../../common/components/Loader";
import TabsComponent from "../../common/components/TabsComponent";
import { getSessionCompletedHeaders } from "../../common/components/SessionsCompletedHeaders";
import DataGridWithPagination from "../../common/components/DataGridWithPagination";
import { getSessionDataGridHeaders } from "../../common/components/SessionCard";
import SessionsJoiningPage from "../SessionsJoiningPage";
import expandIcon from "../../assets/images/expand-icon.svg";
import { CompletedMeetingData } from "../TrackRegistrations";
import { useDispatch } from "react-redux";
import { setAnaltyicsFilters, setSessionDate, setSessionType, setTotalAudience } from "../../reducers/AnalyticsReducer";
import { endPoints } from "../../constants/urlConstants";
import { SELECTEDTABS, WEBINARSTATUS } from "../../constants";

export interface MeetingData {
  id: number;
  title: string;
  startAt: string;
  duration: string;
  webinarStatus: string;
  actualMeetingEndsAt: string;
  endDate: string;
}

const TrackSessions: React.FC = () => {
  const initialPageSize = 10;
  const [loading, setLoading] = useState(false);
  const [adminMeetingData, setAdminMeetingData] = useState<MeetingData[]>([]);
  const [adminCompletedMeetingData, setAdminCompletedMeetingData] = useState<CompletedMeetingData[]>([]);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState(() => {
    const storedTab = localStorage.getItem("selectedRoleTab");
    return storedTab ? storedTab : SELECTEDTABS.UPCOMING; // No need to parse if it's already a string
  });
  const [showSessionJoiningPage, setShowSessionJoiningPage] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<MeetingData | null>(null);
  const [isListExpanded, setisListExpanded] = useState(false);
  const [publishedDataLoading, setPublishedDataLoading] = useState(true);
  const navigate = useNavigate();
  const tabsRef = useRef<HTMLDivElement>(null);
  const sessionsJoiningPageRef = useRef<HTMLDivElement>(null);
  const [isUpComingSessionChecked, setIsUpComingSessionChecked] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const dispatch = useDispatch();
  /**
   * @description Check for any meeting starting within 15 minutes
   */
  const checkUpcomingSession = () => {
    const currentTime = new Date();
    const currentTimeIST = new Date(currentTime.getTime() + 5.5 * 60 * 60 * 1000);
    let upcomingSession = null;

    for (const meeting of adminMeetingData) {
      const sessionStartTime = new Date(meeting.startAt);
      const timeDifference = sessionStartTime.getTime() - currentTimeIST.getTime();

      if (
        meeting.webinarStatus === WEBINARSTATUS.PUBLISHED &&
        timeDifference <= 15 * 60 * 1000 && 
        meeting.actualMeetingEndsAt === null && 
        new Date(meeting.endDate) > currentTimeIST
      ) {
        upcomingSession = meeting;
        break;
      }
    }

    // Set the state for current meeting to show
    if (upcomingSession) {
      setCurrentMeeting(upcomingSession);
      setShowSessionJoiningPage(true);
    } else {
      setShowSessionJoiningPage(false);
    }
    if (isDataFetched) {
      setIsUpComingSessionChecked(true);
    }
  };

  useEffect(() => {
    checkUpcomingSession();
  }, [adminMeetingData]);

  useEffect(() => {
    setLoading(true);
    localStorage.setItem("selectedRoleTab", selectedTab);
    getAdminMeetingData();
  }, [selectedTab]);

  /**
   * @description Fetch admin meeting data
   */
  const getAdminMeetingData = () => {
    FetchWebinarList(setPublishedDataLoading,setLoading, setAdminMeetingData, setAdminCompletedMeetingData);
    setIsDataFetched(true);
  };


  useEffect(() => {
    if (!publishedDataLoading) {
      setLoading(false);
    }
  }, [publishedDataLoading]);

  /**
   * @description Handle page size change
   */
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  /**
   * @description Handle page change
   */
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };


  // on click of completed session row redirect to analytics page if report is generated
  const handleCompletedSesions = (id: number, webinarTitle: string, startAt: string, isReportGenerated: boolean) => {
    if (id && isReportGenerated) {
      dispatch(setSessionDate(startAt));
      dispatch(setSessionType("default"));
      dispatch(setTotalAudience(0));
      dispatch(setAnaltyicsFilters(
        {
          audienceType: [],
          gender: [],
          ageGroup: [],
          location:[]
        }));
      navigate(endPoints.sessionAnalytics+`?sessionId=${id}`)
    } else {
      console.error("Meeting ID is not available!");
      if (!isReportGenerated) {
        alert("Report is not generated for this session. Please wait for sometime.");
      }
    }
  };  
  /**
   * @description Function to update the webinar
   */
  const handlePublished = (meeting: MeetingData, type?: string) => {
    setLoading(true);
    UpdateWebinar(setLoading, meeting, true, meeting?.id, type)
      .then((res) => {
        if (res?.data?.statusCode === 200) {
          getAdminMeetingData();
        } else {
          setLoading(false);
          alert(res?.data?.message);
        }
      })
      .catch((error) => {
        console.error("Error updating webinar:", error);
      });
  };

   /**
   * Handles the click event on a table cell.
   *
   * @param type - A string representing the type of the cell or action.
   * @param meeting - An object representing the meeting data. 
   *                  It is expected to have a property `isReportGenerated` 
   *                  which determines if a report has been generated for the meeting.
   *
   * If the `isReportGenerated` property of the `meeting` object is true, 
   * the function navigates to the session analytics page.
   */
  const handleCellClick = (type: string, meeting: unknown) => {
    if (meeting.isReportGenerated) {
    navigate(endPoints.sessionAnalytics);
    }
  }
  /**
   * @description Filter meetings based on status
   */
  const filterMeetings = (status: string, isCompleted: boolean) => {
    const filteredData = adminMeetingData.filter(
      (meeting) =>
        meeting.webinarStatus === status &&
        (isCompleted
          ? meeting.actualMeetingEndsAt !== null
          : meeting.actualMeetingEndsAt === null),
    );
    return filteredData;
  };


    /**
   * Filters the completed meetings based on the provided webinar status.
   *
   * @param status - The status of the webinar to filter by (e.g., "completed", "pending").
   * @returns An array of meetings that match the specified webinar status.
   */
  const completedMeetings = (status: string) => {
    const completedData = adminCompletedMeetingData.filter(
      (meeting) =>
        meeting.webinarStatus === status,
    );
    return completedData;
  }
  /**
   * Combine all upcoming data (draft, internal, published)
   */
  const getAllUpcomingMeetings = () => {
    return [...filterMeetings(WEBINARSTATUS.PUBLISHED, false)];
  };

  const seekerDetails = localStorage.getItem("seekerDetails");
  const firstName = seekerDetails ? JSON.parse(seekerDetails).firstName : "";

  /**
   * @description Handle collapse click
   */
  const handleCollapseClick = () => {
    setisListExpanded((prevState) => {
      const newState = !prevState;
      setTimeout(() => {
        if (newState) {
          if (tabsRef.current) {
            tabsRef.current.scrollIntoView({ behavior: "smooth" });
          }
        } else if (sessionsJoiningPageRef.current) {
          sessionsJoiningPageRef.current.scrollIntoView({
            behavior: "smooth",
          });
        }
      }, 100); // Small delay to ensure state is updated properly
      return newState;
    });
  };

  /**
   * @description Observe the visibility of the tabs container
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setisListExpanded(true);
          } else {
            setisListExpanded(false);
          }
        });
      },
      {
        threshold: 0.9, 
      },
    );

    if (tabsRef.current) {
      observer.observe(tabsRef.current);
    }

    return () => {
      if (tabsRef.current) {
        observer.unobserve(tabsRef.current);
      }
    };
  }, []);
  
  const handleTabChange = (tabValue: string) => {
    setPageSize(initialPageSize);
    setCurrentPage(1);
    setSelectedTab(tabValue);
  }
  return (
    <div className={styles.container}>
      
      {loading && !isUpComingSessionChecked && <Loader type="large" />}
      {showSessionJoiningPage && currentMeeting && (
        <div ref={sessionsJoiningPageRef}>
          <SessionsJoiningPage meeting={currentMeeting} />
        </div>
      )}
      {isUpComingSessionChecked && <div
        className={
          showSessionJoiningPage
            ? styles.sessionJoiningContentContainer
            : styles.contentContainer
        }
      >
        {/* Header */}
        <div
          className={`${styles.subHeaderContainer} ${
            (!showSessionJoiningPage || isListExpanded) ? styles.expanded : ""
          }`}
        >
          <div className={styles.subHeaderContent}>
            {`Welcome `}
            <span className={styles.firstName}>{firstName}</span>
            {`, here are the list of sessions`}
          </div>
        </div>

        {/* Tabs for Upcoming and Completed */}
        <div className={styles.tabsContainer} ref={tabsRef}>
          {showSessionJoiningPage && (
            <div
              className={styles.collapseContainer}
              onClick={handleCollapseClick}
            >
              <img
                src={expandIcon}
                alt="expand"
                className={isListExpanded ? styles.rotateUp : styles.rotateDown}
              />
              <p>{isListExpanded ? "collapse list" : "expand list"}</p>
            </div>
          )}
          <TabsComponent
            tabs={[
              {
                label: SELECTEDTABS.UPCOMING,
              },
              {
                label: SELECTEDTABS.COMPLETED,
              },
            ]}
            selectedTab={selectedTab}
            onChange={
              (tabValue: string) => {
                handleTabChange(tabValue)
              }
            }
          />
          {/* Content Based on Selected Tab */}
          {selectedTab === SELECTEDTABS.UPCOMING ? (
            <div className={styles.upComingSessions}>
              {getAllUpcomingMeetings().length > 0 ? (
                <DataGridWithPagination
                  headers={getSessionDataGridHeaders(handlePublished)}
                  seekersData={getAllUpcomingMeetings()}
                  hoverImageClass={styles.actionHoverImg}
                  totalData={getAllUpcomingMeetings().length}
                  pageSize={pageSize}
                  setPageSize={handlePageSizeChange}
                  currentPage={currentPage}
                  setCurrentPage={handlePageChange}
                  loading={loading}
                  data-testid="sessions-dashboard-upcoming"
                  height={!showSessionJoiningPage || isListExpanded ? "calc(100vh - 240px)" : "calc(100vh - 206px)"}
                />
              ) : (
                <p className={styles.noMeetingText}>No upcoming infinipaths!</p>
              )}
            </div>
          ) : (
            <div className={styles.completedSessions}>
              {completedMeetings(WEBINARSTATUS.COMPLETED).length > 0 ? (
                <DataGridWithPagination
                  headers={getSessionCompletedHeaders(handleCellClick)}
                  seekersData={completedMeetings(WEBINARSTATUS.COMPLETED)}
                  hoverImageClass={styles.actionHoverImg}
                  totalData={completedMeetings(WEBINARSTATUS.COMPLETED).length}
                  pageSize={pageSize}
                  setPageSize={handlePageSizeChange}
                  currentPage={currentPage}
                  setCurrentPage={handlePageChange}
                  loading={loading}
                  data-testid="sessions-dashboard-completed"
                  onRowClick={(rowData) =>
                    handleCompletedSesions(rowData.id, rowData.title, rowData.startAt, rowData.isReportGenerated)
                  }
                  height={!showSessionJoiningPage || isListExpanded ? "calc(100vh - 240px)" : "calc(100vh - 206px)"}
                />
              ) : (
                <p className={styles.noMeetingText}>
                  No completed infinipaths!
                </p>
              )}
            </div>
          )}
        </div>
      </div>}
    </div>
  );
};

export default TrackSessions;