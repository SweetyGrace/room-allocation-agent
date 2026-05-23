import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import useFetch, { getCallWithLoader, putCall } from "../../services/apiService";
import useCallbackState from "../../hooks/useCallbackState";
import {
  ALLOCATED,
  ApprovalStatus,
  DEFAULT_PAGE_SIZE,
  dropDownnJSON,
  INFINI_RECORDS_PAGINATION_API,
  SEEKER_EXPERIENCES,
  SEEKER_VIEWED_UPDATE_ERROR_MSG,
  textConstant,
  UNABLE_TO_LOAD,
  UNABLE_TO_LOAD_SEEKER_EXP,
} from "../../constants/textConstants";
import { notify } from "../../common/components/ToastMessage";
import { transformToCardData } from "../../utils/registrationUtils";
import { getItemInLocalStorage } from "../../services/localStorage";
import SeekerMessage from "../../components/SeekerMessages";
import Loader from "../../common/components/Loader";
import { WARNING } from "../../constants";
import styles from "./index.module.scss";
import { extractSearchFromUrl } from "../../utils/commonFunctions";
import { CardData, SeekerExperienceProps } from "../../types/expressions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  setProgramEndsAt,
  setProgramOptions,
  setSeatApprovalSessions,
  setSeatApprovalToolbarKpi,
  setSelectedSubProgram,
  setSubProgramId,
} from "../../reducers/ProgramReducer";
import { ApiService } from "../../services/mockService";
import { useParams, useNavigate } from "react-router-dom"; 
import { endPoints } from "../../constants/urlConstants";

const SeekerExperience: React.FC<SeekerExperienceProps> = ({
  isProgramDataReady = true,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate(); 
  const { programId: urlProgramId } = useParams<{ programId?: string }>(); 
  const getProgramId = (): number | null => {

    if (urlProgramId) {
      const parsed = parseInt(urlProgramId, 10);
      if (!isNaN(parsed)) return parsed;
    }

    const storedProgramId = getItemInLocalStorage("programId");
    if (storedProgramId) {
      const parsed = parseInt(storedProgramId, 10);
      if (!isNaN(parsed)) return parsed;
    }

    return null;
  };

  const [programId, setProgramId] = useState<number | null>(getProgramId());
  useEffect(() => {
    const validProgramId = getProgramId();
    if (validProgramId !== programId) {
      setProgramId(validProgramId);
    }
  }, [urlProgramId]);

  useEffect(() => {
    if (programId === null) {
      notify(
        WARNING,
       UNABLE_TO_LOAD ,
        WARNING
      );
    }
  }, [programId]);

  const [records, setRecords] = useCallbackState<CardData[]>([]);
  const [updatedRecords, setUpdatedRecords] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const { doFetch, data, loading } = useFetch();
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [searchString, setSearchString] = useState("");
  const [activeSearchString, setActiveSearchString] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewedRequestIdsRef = useRef<Set<number>>(new Set());
  const [hasInitialExperienceDataLoaded, setHasInitialExperienceDataLoaded] =
    useState(false);

  const dispatch = useDispatch();

  const sessions = useSelector(
    (state: RootState) => state.ProgramReducer.seatApprovalSessions
  );
  const kpis = useSelector(
    (state: RootState) => state.ProgramReducer.seatApprovalToolbarKpi
  );
  const selectedSubProgram = useSelector(
    (state: RootState) => state.ProgramReducer.selectedSubProgram
  );
  const programOptions = useSelector(
    (state: RootState) => state.ProgramReducer.programOptions
  );
  const subProgramId = useSelector(
    (state: RootState) => state.ProgramReducer.subProgramId
  );

  
  const fetchMessages = useCallback((pageNumber: number, search: string = "") => {
  if (!programId) {
    console.error(" Cannot fetch messages: programId is missing");
    return;
  }

  const offset = pageNumber > 1 ? (pageNumber - 1) * DEFAULT_PAGE_SIZE : 0;

// Inside fetchMessages:
let url = endPoints.getRecordsPaginationApi(
  programId,
  offset,
  DEFAULT_PAGE_SIZE,
  ApprovalStatus.APPROVED,
  textConstant.ID,
  textConstant.LOWER_CASE_DESC
);

  //  FIX: Use selectedSubProgram directly from closure instead of ref
  if (
    selectedSubProgram !== null &&
    selectedSubProgram !== undefined &&
    selectedSubProgram !== dropDownnJSON.BLESSED.value
  ) {
    const allocatedProgramId = Number(selectedSubProgram);
    
    if (!isNaN(allocatedProgramId) && allocatedProgramId > 0) {
      url += `&allocatedProgramId=${allocatedProgramId}`;
    } 
  }

  if (search.trim()) {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }
  doFetch(url);
}, [programId, doFetch, selectedSubProgram]); 

 useEffect(() => {
  const fetchProgramData = async () => {
    if (!programId) {
      console.error("Cannot fetch program data: programId is missing");
      return;
    }

    try {
      if(!programOptions?.length){
      const programResponse = await getCallWithLoader(
        endPoints.getProgram(programId),
        undefined,
        textConstant.PORTAL,
        textConstant.LARGE
      );
      if (programResponse?.status === 200) {
        const data = programResponse?.data?.data?.groupedPrograms || [];
        const transformedData = data.map(({ id, name, endsAt }: any) => ({
          value: id,
          label: name,
          endsAt: endsAt || null,
        }));
        const programOptionsWithBlessed = [
          {
            value: dropDownnJSON.BLESSED.value,
            label: dropDownnJSON.BLESSED.label,
            endsAt: null,
          },
          ...transformedData,
        ];
        dispatch(setProgramOptions(programOptionsWithBlessed));

        // Always reset to Blessed when program changes
        dispatch(setSelectedSubProgram(dropDownnJSON.BLESSED.value));
        dispatch(setSubProgramId(null));
        dispatch(setProgramEndsAt(null));
      } 
    }

      // 2. Fetch sessions and KPIs
      if (sessions.length === 0 || !kpis) {
        const response = await ApiService.getRegistrationApprovals({
          programId: programId,
          limit: 10,
          offset: 0,
          approvalStatus: ALLOCATED,
        });

        if (response?.data?.statusCode === 200) {
          const responseData = response.data.data;

          if (sessions.length === 0) {
            const sessionsData =
              responseData?.kpis?.mahatria?.groupedProgramMetrics?.allocated
                ?.programs || [];
            const formattedSessions = sessionsData.map((program: any) => ({
              id: program.programId,
              name: program.programName,
              value: program.programId,
            }));
            dispatch(setSeatApprovalSessions(formattedSessions));
          }

          if (!kpis) {
            dispatch(
              setSeatApprovalToolbarKpi(
                responseData?.kpis?.mahatria?.groupedProgramMetrics
              )
            );
          }
        }
      }
    } catch (error) {
      notify(
        SEEKER_EXPERIENCES,
        textConstant.FAILED_TO_LOAD,
        WARNING
      );
    }
  };

  fetchProgramData();
}, [programId]); 

  useEffect(() => {
    if (!programId) return; 
    
    if (selectedSubProgram !== null) {
      setHasInitialExperienceDataLoaded(false);
      setCurrentPage(1);
      setSearchString("");
      setActiveSearchString("");
      fetchMessages(1, "");
    }
  }, [selectedSubProgram, programId]); 


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchString(value);
    if (value.trim() === "") {
      setIsLoading(true);
      setCurrentPage(1);
      setActiveSearchString("");
      fetchMessages(1, "");
    }
  };

  const handleSearchSubmit = () => {
    if (searchString.trim() === activeSearchString.trim()) return;
    setIsLoading(true);
    setCurrentPage(1);
    setActiveSearchString(searchString);
    fetchMessages(1, searchString);
  };

  const handleClearSearch = () => {
    if (searchString.length === 0 && activeSearchString.length === 0) return;
    setIsLoading(true);
    setCurrentPage(1);
    setSearchString("");
    setActiveSearchString("");
    fetchMessages(1, "");
  };

  const handleNewMessagesClick = () => {
    handleClearSearch();
  };

  const updateMyRecords = (newRecord: CardData) => {
    setRecords((prevRecords: CardData[]) => {
      const isExisting = prevRecords.some((record) => record.id === newRecord.id);
      return isExisting ? prevRecords : [newRecord, ...prevRecords];
    });
  };

  useEffect(() => {
    const ENABLE_SOCKET = process.env.REACT_APP_ENABLE_SOCKET === "true";
    let socket: any = null;
    if (ENABLE_SOCKET) {
      socket = io(apiUrl);
      socket.on("recordsUpdated", (updatedRecords: any) => {
        if (updatedRecords.data && updatedRecords.data.length > 0) {
          setUpdatedRecords((prevRecords) => [
            ...updatedRecords.data,
            ...prevRecords,
          ]);
        }
        if (updatedRecords.count) {
          setTotalRecordCount(updatedRecords.count);
        }
      });

      socket.on("recordRemoved", (deletedRecordId: any) => {
        setRecords((prevRecords: CardData[]) =>
          prevRecords.filter((record: CardData) => record.id !== deletedRecordId)
        );
      });

      socket.on("recordAdded", (newRecord: any) => {
        updateMyRecords(newRecord);
      });
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [apiUrl]);

  useEffect(() => {
    if (!data) return;

    const responseSearchValue = extractSearchFromUrl(data?.config?.url);
    const normalizedResponseSearch = (responseSearchValue ?? "").trim();
    const normalizedActiveSearch = activeSearchString.trim();
    const isStaleResponse = normalizedResponseSearch !== normalizedActiveSearch;

    if (data.status !== 200 || !data?.data?.data?.data) {
      if (!isStaleResponse) {
        notify(
          SEEKER_EXPERIENCES,
          data?.data?.message || UNABLE_TO_LOAD_SEEKER_EXP,
          WARNING
        );
      }
      setIsLoading(false);
      return;
    }

    if (isStaleResponse) return;

    setTotalRecordCount(data?.data?.data?.total);
    const transformed = transformToCardData(data.data.data.data);
    const responsePage = Number(data?.data?.data?.pagination?.pageNumber) || 1;
    const isSearchActive = Boolean(normalizedActiveSearch);
    const shouldReplace = isSearchActive || responsePage === 1;

    if (shouldReplace) {
      if (!isSearchActive && updatedRecords.length > 0 && responsePage === 1) {
        setUpdatedRecords([]);
      }
      setRecords(transformed);
    } else {
      setRecords((prevRecords: CardData[]) => {
        const existingIds = new Set(prevRecords.map((record) => record.id));
        const dedupedRecords = transformed.filter(
          (record) => !existingIds.has(record.id)
        );
        if (!dedupedRecords.length) return prevRecords;
        return scrollDirection === "up"
          ? [...dedupedRecords, ...prevRecords]
          : [...prevRecords, ...dedupedRecords];
      });
    }
    setTotalRecords(data?.data?.data?.total);
    setCurrentPage(responsePage);
    setIsLoading(false);
    setHasInitialExperienceDataLoaded(true);
  }, [data, activeSearchString, scrollDirection, updatedRecords]);

  const handleCloseDrawer = () => {
    setShowMessage(false);
  };

  const handleLoadMoreData = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLDivElement;
    const distanceFromBottom =
      target.scrollHeight - (target.scrollTop + target.clientHeight);
    if (distanceFromBottom <= 50) {
      setScrollDirection("down");
      if (!isLoading && totalRecords / DEFAULT_PAGE_SIZE > currentPage) {
        setIsLoading(true);
        fetchMessages(currentPage + 1, activeSearchString);
      }
    }

    if (target.scrollTop === 0) {
      setScrollDirection("up");
      if (!isLoading && currentPage > 1) {
        setIsLoading(true);
        fetchMessages(currentPage - 1, activeSearchString);
      }
    }
  };

  const handleSubProgramChange = (value: string) => {
    dispatch(setSelectedSubProgram(value));

  if (value === dropDownnJSON.BLESSED.value) {
    dispatch(setSubProgramId(null));
    dispatch(setProgramEndsAt(null));
  } else {
    const numericId = Number(value);
    dispatch(setSubProgramId(numericId));
    const selectedOption = programOptions.find((opt) => opt.value === value);
    if (selectedOption?.endsAt) {
      dispatch(setProgramEndsAt(selectedOption.endsAt));
    }
  }
};

  const handleMarkAsViewed = async (
    message: CardData,
    onComplete?: () => void
  ) => {
    if (!message || message.isViewed) return;
    if (viewedRequestIdsRef.current.has(message.id)) return;
    viewedRequestIdsRef.current.add(message.id);
    try {
      const response = await putCall(
        `${INFINI_RECORDS_PAGINATION_API}/${message.id}`,
        { isViewed: true }
      );
      if (response?.status === 200) {
        setRecords((prevRecords) =>
          prevRecords.map((record) =>
            record.id === message.id ? { ...record, isViewed: true } : record
          )
        );
      } else {
        throw response;
      }
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        SEEKER_VIEWED_UPDATE_ERROR_MSG;
      notify(SEEKER_EXPERIENCES, message, WARNING);
    } finally {
      viewedRequestIdsRef.current.delete(message.id);
      if (onComplete) onComplete();
    }
  };


  if (programId === null) {
    return (
      <div className={styles.seekerExperienceContainerLoader}>
        <div className={styles.errorContainer}>
          <h3>{textConstant.PROGRAM_NOT_FOUND}</h3>
        </div>
      </div>
    );
  }


  return (
    <>
      <div className={styles.seekerExperienceContainer}>
        <div className={styles.sessionList}>
          {programOptions.map((session) => {
            const isSelected = selectedSubProgram === session.value.toString();
            return (
              <div
                key={session.value}
                className={`${styles.horizontalItem} ${
                  isSelected ? styles.selectedItem : ""
                }`}
                onClick={() => handleSubProgramChange(session.value.toString())}
              >
                <p>{`${session.label}`}</p>
              </div>
            );
          })}
        </div>

        <SeekerMessage
          newRecordsCount={
            updatedRecords.filter((record) => record.isPrivate === false).length
          }
          open={showMessage}
          onClose={handleCloseDrawer}
          messages={records}
          isLoading={isLoading || loading}
          handleNewMessagesClick={handleNewMessagesClick}
          handleLoadMoreData={handleLoadMoreData}
          scrollRef={scrollRef}
          totalRecordCount={totalRecordCount}
          searchString={searchString}
          activeSearchString={activeSearchString}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={handleClearSearch}
          onMarkMessageViewed={handleMarkAsViewed}
        />
      </div>
    </>
  );
};

export default SeekerExperience;