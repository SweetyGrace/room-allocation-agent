import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../common/components/Loader";
import {
  FetchWebinarList,
  UpdateWebinar,
} from "../../utils/commonFunctions";
import styles from "./index.module.scss";
import { getSessionDataGridHeaders } from "../../common/components/SessionCard";
import SessionsSubHeader from "../SessionsSubHeader/index.tsx";
import TabsComponent from "../../common/components/TabsComponent/index.tsx";
import DataGridWithPagination from "../../common/components/DataGridWithPagination/index.tsx";
import { getSessionPublishedHeaders } from "../../common/components/SessionExternalHeaders/index.tsx";
import { getSessionCompletedHeaders } from "../../common/components/SessionsCompletedHeaders/index.tsx";
import { useDispatch, useSelector } from "react-redux";
import { setAnaltyicsFilters, setSessionDate, setSessionType, setTotalAudience } from "../../reducers/AnalyticsReducer.ts";
import { endPoints } from "../../constants/urlConstants.ts";
import { NESTEDTAB, NO_SESSIONS_DATA, SELECTEDTABS, SNACKBAR_MESSAGES, TABS, WEBINARSTATUS } from "../../constants/index.ts";
import SnackBarComponent from "../../common/components/SnackBar/index.tsx";
import successIcon from "../../assets/images/successIcon.svg.svg";
import snackbarCloseIcon from "../../assets/images/close-icon.svg";
import errorIcon from "../../assets/images/error-snackbar.svg";
import { EmptyState } from "../../common/components/EmptyState/index.tsx";

interface MeetingData {
  title: string;
  startAt: string;
  duration: string;
  webinarStatus: string;
  actualMeetingEndsAt: string;
}

export interface CompletedMeetingData {
  id: number;
  webinarStatus: string;
  title: string;
  startAt: string;
  registrationStartsAt: string;
  registrationEndsAt: string;
  actualmeetingEndsAt: string;
  totalParticipantCount: number;
  panelistParticipantCount: number;
  attendeeParticipantCount: number;
  absenteeCount: number;
  dropOffCount: number;
  newSeekerCount: number;
}

export const TrackRegistrations = () => {
  const initialPageSize = 25;
  const [loading, setLoading] = useState(false);
  const [adminMeetingData, setAdminMeetingData] = useState<MeetingData[]>([]);
  const [adminCompletedMeetingData, setAdminCompletedMeetingData] = useState<CompletedMeetingData[]>([]);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState(() => {
    const storedTab = localStorage.getItem(TABS.SELECTEDTAB);
    return storedTab ? storedTab : SELECTEDTABS.UPCOMING; // No need to parse if it's already a string
  });

  const [nestedTab, setNestedTab] = useState(() => {
    const storedNestedTab = localStorage.getItem(TABS.NESTEDSELECTEDTAB);
    return storedNestedTab ? storedNestedTab : NESTEDTAB.DRAFTS; // No need to parse if it's already a string
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [adminDataLoading, setAdminDataLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState({ open: false, message: "" });
  const sideNavId = useSelector((state: any) => state.seekerReducer.sideNavId);


  /**
  /**
   * @description Fetch admin meeting data
   */
  const getAdminMeetingData = () => {
    FetchWebinarList(setAdminDataLoading, setLoading, setAdminMeetingData, setAdminCompletedMeetingData);
  };

  /**
   * @description Fetch admin meeting data on component mount
   */
  useEffect(() => {
    setLoading(true);
    localStorage.setItem(TABS.SELECTEDTAB, selectedTab);
    localStorage.setItem(TABS.NESTEDSELECTEDTAB, nestedTab);
    getAdminMeetingData();
  }, [selectedTab, nestedTab]);

  useEffect(() => {
    if (!adminDataLoading) {
      setLoading(false);
    }
  }, [adminDataLoading]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSeekersListDashBoard = (id: number, webinarTitle: string) => {
    if (id) {
      navigate(`/admin/infinipath/session-seeker-list`, {
        state: {
          meetingId: id,
          webinarTitle: webinarTitle,
        },
      });
    } else {
      console.error("Meeting ID is not available!");
    }
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
          ageGroup:[],
          location: []
        }));
      navigate(endPoints.sessionAnalytics+`?sessionId=${id}`);
    } else {
      console.error("Meeting ID is not available!");
      if (!isReportGenerated) {
        alert('Analytics report is not generated for this session. Please try again after sometime.')
      }
    }
  };

  /**
   * @description function to update the webinar
   * @param meeting
   * @param type
   */
  const handleTabSwitch = (meeting: MeetingData, type?: string) => {
    if (meeting.webinarStatus === WEBINARSTATUS.DRAFT && type === WEBINARSTATUS.INTERNAL) {
      setNestedTab(NESTEDTAB.INTERNAL);
    } else if (meeting.webinarStatus === WEBINARSTATUS.INTERNAL && type === WEBINARSTATUS.PUBLISHED) {
      setNestedTab(NESTEDTAB.PUBLISHED);
    } else if (meeting.webinarStatus === WEBINARSTATUS.INTERNAL && type === WEBINARSTATUS.DRAFT) {
      setNestedTab(NESTEDTAB.DRAFTS);
    } else if (meeting.webinarStatus === WEBINARSTATUS.PUBLISHED && type === WEBINARSTATUS.COMPLETED) {
      setSelectedTab(SELECTEDTABS.COMPLETED);
    }
  }
  /**
   * Handles the publishing of a meeting by updating its status and performing necessary actions.
   *
   * @param {MeetingData} meeting - The meeting data object that needs to be updated.
   * @param {string} [type] - An optional parameter to specify the type of operation or context.
   *
   * @returns {void}
   *
   * @remarks
   * - Sets the loading state to `true` while the update operation is in progress.
   * - Calls the `UpdateWebinar` function to update the meeting's status.
   * - If the update is successful (statusCode 200), it switches the tab using `handleTabSwitch`.
   * - If the update fails, it stops the loading state and displays an alert with the error message.
   * - Logs any errors encountered during the update process to the console.
   *
   * @example
   * ```typescript
   * handlePublished(meetingData, "webinar");
   * ```
   */
  const handlePublished = (meeting: MeetingData, type?: string) => {
    setLoading(true);

    UpdateWebinar(setLoading, meeting, true, meeting?.id, type)
      .then((res) => {
        if (res?.data?.statusCode === 200) {
          handleTabSwitch(meeting, type);
          // getAdminMeetingData();
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
   * @description To filter the meetings based on the state
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
      // dispatch(setKpiType(type));
      navigate(endPoints.sessionAnalytics);
    }
  }
 
  /**
   * Filters the completed meetings based on the provided webinar status.
   *
   * @param status - The status of the webinar to filter by (e.g., "completed", "pending").
   * @returns An array of meetings that match the specified webinar status.
   */
  const completedMeetings = (status: string) => {
    const filteredData = adminCompletedMeetingData.filter(
      (meeting) =>
        meeting.webinarStatus === status
    );
    return filteredData;
  }
 
  /**
   * Determines if a specific tab is selected and has no associated meetings.
   *
   * @param tab - The tab to check, represented as a string.
   * @returns `true` if the specified tab is selected and has no meetings; otherwise, `false`.
   *
   * The function evaluates the following conditions:
   * - If the `selectedTab` is `SELECTEDTABS.UPCOMING` and the provided `tab` is `NESTEDTAB.DRAFTS`,
   *   it checks if there are no meetings with the status `WEBINARSTATUS.DRAFT`.
   * - If the `selectedTab` is `SELECTEDTABS.UPCOMING` and the provided `tab` is `NESTEDTAB.INTERNAL`,
   *   it checks if there are no meetings with the status `WEBINARSTATUS.INTERNAL`.
   * - If the `selectedTab` is `SELECTEDTABS.UPCOMING` and the provided `tab` is `NESTEDTAB.PUBLISHED`,
   *   it checks if there are no meetings with the status `WEBINARSTATUS.PUBLISHED`.
   */
  const isTabEmptyForSelectedState = (tab: string) => {
    return (
      (selectedTab === SELECTEDTABS.UPCOMING && tab === NESTEDTAB.DRAFTS && filterMeetings(WEBINARSTATUS.DRAFT, false).length === 0) ||
      (selectedTab === SELECTEDTABS.UPCOMING && tab === NESTEDTAB.INTERNAL && filterMeetings(WEBINARSTATUS.INTERNAL, false).length === 0) ||
      (selectedTab === SELECTEDTABS.UPCOMING && tab === NESTEDTAB.PUBLISHED && filterMeetings(WEBINARSTATUS.PUBLISHED, false).length === 0)
    );
  }

  return (
    <div className={styles.container}>
      {loading && <Loader type="large" data-test-id="loader" />}
      {!loading && sideNavId === "infinipath" &&
        <div>
          <SessionsSubHeader
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />

          {selectedTab === SELECTEDTABS.UPCOMING ? (
            <div className={styles.tabsContainer}>
              <div className={`${styles.tabsAndSearch} ${ isTabEmptyForSelectedState(nestedTab)  ? styles.bottomBorder : ""}`}>
                <TabsComponent
                  tabs={[
                    {
                      label: NESTEDTAB.DRAFTS,
                      count: filterMeetings(WEBINARSTATUS.DRAFT, false).length,
                    },
                    {
                      label: NESTEDTAB.INTERNAL,
                      count: filterMeetings(WEBINARSTATUS.INTERNAL, false).length,
                    },
                    {
                      label: NESTEDTAB.PUBLISHED,
                      count: filterMeetings(WEBINARSTATUS.PUBLISHED, false).length,
                    },
                  ]}
                  selectedTab={nestedTab}
                  onChange={setNestedTab}
                />
              </div>
              {nestedTab === NESTEDTAB.DRAFTS && (
                <div className={styles.completedSessions}>
                  {filterMeetings(WEBINARSTATUS.DRAFT, false).length > 0 ? (
                    <DataGridWithPagination
                      headers={getSessionDataGridHeaders(handlePublished, setLoading, getAdminMeetingData)}
                      seekersData={filterMeetings(WEBINARSTATUS.DRAFT, false)}
                      hoverImageClass={styles.actionHoverImg}
                      totalData={filterMeetings(WEBINARSTATUS.DRAFT, false).length}
                      pageSize={pageSize}
                      setPageSize={handlePageSizeChange}
                      currentPage={currentPage}
                      setCurrentPage={handlePageChange}
                      loading={loading}
                      heightToApplyonGrid="calc(100vh - 265px)"
                      data-testid="sessions-dashboard-draft"
                    />
                  ) : <EmptyState msg = {NO_SESSIONS_DATA.Drafts}/>}
                </div>
              )}
              {nestedTab === NESTEDTAB.INTERNAL && (
                <div className={styles.completedSessions}>
                  {filterMeetings(WEBINARSTATUS.INTERNAL, false).length > 0 ? (
                    <DataGridWithPagination
                      headers={getSessionDataGridHeaders(handlePublished, setLoading, getAdminMeetingData)}
                      seekersData={filterMeetings(WEBINARSTATUS.INTERNAL, false)}
                      hoverImageClass={styles.actionHoverImg}
                      totalData={
                        filterMeetings(WEBINARSTATUS.INTERNAL, false).length
                      }
                      pageSize={pageSize}
                      setPageSize={handlePageSizeChange}
                      currentPage={currentPage}
                      setCurrentPage={handlePageChange}
                      loading={loading}
                      heightToApplyonGrid="calc(100vh - 265px)"
                      data-testid="sessions-dashboard-internal"
                      onRowClick={(rowData) =>
                        handleSeekersListDashBoard(rowData.id, rowData.title)
                      }
                    />
                  ) : <EmptyState msg = {NO_SESSIONS_DATA.Internal}/>}
                </div>
              )}
              {nestedTab === NESTEDTAB.PUBLISHED && (
                <div className={styles.completedSessions}>
                  {filterMeetings(WEBINARSTATUS.PUBLISHED, false).length > 0 ? (
                    <DataGridWithPagination
                      headers={getSessionPublishedHeaders(handlePublished, setSnackbarOpen)}
                      seekersData={filterMeetings(WEBINARSTATUS.PUBLISHED, false)}
                      hoverImageClass={styles.actionHoverImg}
                      totalData={filterMeetings(WEBINARSTATUS.PUBLISHED, false).length}
                      pageSize={pageSize}
                      setPageSize={handlePageSizeChange}
                      currentPage={currentPage}
                      setCurrentPage={handlePageChange}
                      loading={loading}
                      heightToApplyonGrid="calc(100vh - 265px)"
                      data-testid="sessions-dashboard-external"
                      onRowClick={(rowData) =>
                        handleSeekersListDashBoard(rowData.id, rowData.title)
                      }
                    />
                  ) : <EmptyState msg = {NO_SESSIONS_DATA.Published}/>}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className={styles.upComingSessions}>
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
                    heightToApplyonGrid="calc(100vh - 245px)"
                    onRowClick={(rowData) =>
                      handleCompletedSesions(rowData.id, rowData.title, rowData.startAt, rowData.isReportGenerated)
                    }
                  />
                ) : <EmptyState msg = {NO_SESSIONS_DATA.Completed}/>}
              </div>
            </div>
          )}
        </div>
      }
      <div data-testid="snackbar">
        <SnackBarComponent
          icon={
            <img
            src={snackbarOpen.message?.includes(SNACKBAR_MESSAGES.toLowerCase()) ? successIcon : errorIcon}
              alt="success"
              data-testid="snackbar-success-icon"
            />
          }
          message={snackbarOpen.message} // Pass the dynamic message here
          snackbarCloseIcon={
            <img
              src={snackbarCloseIcon}
              alt="close"
              data-testid="snackbar-close-icon"
            />
          }
          registered={snackbarOpen.open} // Use the `open` property
          onClose={() => setSnackbarOpen({ open: false, message: "" })} // Reset both `open` and `message`
          data-testid="snackbar-component"
        />
      </div>
    </div>
  );
};
