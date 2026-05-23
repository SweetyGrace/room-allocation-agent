import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import { deleteCallWithLoader, getCall, putCallWithLoader } from "../../services/apiService";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import ChooseProgramPage from "../../pages/pages/ChooseProgram/ChooseProgramPage.tsx"; // Import the component
import { Button } from "../../common/components/Button/index.tsx";
import { filterProgramsByTypeStatus, getProgramImageForBanner } from "../../utils/commonFunctions.ts";
import editIcon from "../../assets/images/edit-background.svg";
import deleteIcon from "../../assets/images/delete-background.svg";
import NoPrograms from "./NoPrograms";
import { getItemInLocalStorage } from "../../services/localStorage.ts";
import { hasPermission, ROLES } from "../../utils/roleBasedAccess.ts";
import { colorizeMahatriaInfinitheism } from "../../common/components/ColorizeMahatriaInfinitheism/index.tsx";
import BannerRenderer from "../../common/components/BannerRenderer";
import {
  API_LIMIT_100,
  COMMON_FORM_FIELDS,
  HDB_MSD_LABEL,
  LOCAL_STORAGE_KEYS,
  PROGRAM_TYPE,
  PROGRAM_TYPE_TABS,
  PUBLISH_MODAL_TEXT,
  textConstant,
  USER_ROLE_MAHATRIA,
  USER_ROLE_SHOBA,
} from "../../constants/textConstants.ts";
import { useDispatch, useSelector } from "react-redux";
import {clearSearch, clearSort, decrementLoader, incrementLoader, resetPagination, setDashboardActiveTab, setProgramsList, setSelectViewList } from "../../reducers/ProgramReducer.ts";
import { RootState } from "../../store/index.ts";
import { NESTEDTAB } from "../../constants/index.ts";

const ProgramCard = ({
  title,
  description,
  program,
  dateRange,
  status,
  programId,
  programQuestionMaps,
  bannerImage, // Add this prop
  fetchProgramsList,
}: {
  program: any; // Use a more specific type if available
  programQuestionMaps: any[];
  bannerImage?: string; // Add banner image prop
  fetchProgramsList: () => void;
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  // Get button text based on status
  const getActionButtonText = () => {
    if (program?.status === "published") return "view details";
    if (program?.programQuestionMaps?.length > 0) return "publish";
    return "submit";
  };
  const userId = getItemInLocalStorage("seekerDetails").id || 0;
  const handleDeleteProgram = async (programId: number) => {
    try {

      const response = await deleteCallWithLoader(`${endPoints.program}/${programId}`, undefined, PORTAL, textConstant.LARGE);
      if (response.status === 200) {
        // Refresh programs list after successful deletion
        fetchProgramsList();
      }
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  const handlePublish = async (programId: unknown) => {
    try {
      // Prepare the payload with the status
      const payload = {
        status: "published", // Set the status to published
        updatedBy: userId,
      };
      // Make the PUT call to update the program status
      const response = await putCallWithLoader(
        `${endPoints.program}/${programId}/status`,
        payload,
        PORTAL,
        textConstant.LARGE,
      );

      if (response.status === 200) {
        // Refresh programs list after successful publish
        fetchProgramsList();
      } else {
        console.error("Failed to publish program:", response.data);
      }
    } catch (error) {
      console.error("Error publishing program:", error);
    } finally {
    }
  };

  const handleProgramClick = async (program: any) => {
    const queryParams = new URLSearchParams({
      programTypeId: program.id,
      ...(program.programTemplateId && { templateId: program.programTemplateId.toString() }),
      ...(program.templateName && { templateName: program.templateName }),
      ...(program.programType && { programTypeName: program.programType }),
    }).toString();

    navigate(`/admin/add-program?${queryParams}`, {
      state: {
        programTypeId:  program.id,
        isEditMode: true,
        ...(program.programTemplateId && { templateId: program.programTemplateId }),
        ...(program.templateName && { templateName: program.templateName }),
        ...(program.programType && { programTypeName: program.programType }),
      },
    });
  };

  const handleActionButton = (programId: number) => {
    dispatch(resetPagination())
    dispatch(clearSearch())
    dispatch(clearSort())
    dispatch(setSelectViewList({ key: 'registrations', label: 'Registrations', value: 'registrations' }));

    const typeKey = program.typeKey || "";
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRAM_TYPE_KEY, typeKey);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRAM_ID, String(programId));

    const allowedTabs = PROGRAM_TYPE_TABS[typeKey];
    const userRole = getItemInLocalStorage("seekerDetails")?.role || "";

    let defaultTab: string;
    if (typeKey === PROGRAM_TYPE.TAT_KEY) {
      defaultTab = textConstant.REGISTRATIONS;
    } else if (userRole === USER_ROLE_MAHATRIA || userRole === USER_ROLE_SHOBA) {
      const seatTab = textConstant.SEAT_ALLOCATIONS;
      defaultTab = allowedTabs && !allowedTabs.includes(seatTab) ? textConstant.REGISTRATIONS : seatTab;
    } else {
      const dashTab = textConstant.DASHBOARD;
      defaultTab = allowedTabs && !allowedTabs.includes(dashTab) ? textConstant.REGISTRATIONS : dashTab;
    }

    dispatch(setDashboardActiveTab(defaultTab));
    localStorage.setItem(LOCAL_STORAGE_KEYS.HDB_ACTIVE_TAB, defaultTab);
    if (status === "published") {
      // Navigate to details page 
      navigate(`/admin/hdb-dashboard/${programId}`, {
        state: { programTitle: program?.title },
      });
    } else if (programQuestionMaps?.length > 0) {
      // Handle publish
      handlePublish(program?.id);
    } else {
      // Handle submit/add form
      handlePublish(program?.id);
    }
  };

  return (
    <div className={styles.allProgramCard}>
      <div className={styles.programCard}>
        {/* Banner Image */}
        <div className={styles.bannerContainer}>
          <BannerRenderer
            bannerAnimationUrl={program?.bannerAnimationUrl}
            bannerImageUrl={program?.bannerImageUrl}
            fallbackImage={getProgramImageForBanner(program?.programType)}
            alt={program?.title}
            className={styles.bannerImage}
          />

          {/* Overlay Actions */}
          <div className={styles.cardActions}></div>
        </div>

        {/* Content */}
        <div className={styles.cardContent}>
          {/* Status Badge */}

          {/* Title */}
          <div className={styles.programCont}>
            <div className={styles.titleAndActions}>
              <div className={styles.titleContainer}>
                <span className={styles.title}>
                  {colorizeMahatriaInfinitheism(program?.title)}
                </span>
                <span
                  className={`${styles.statusBadge} ${styles[program?.status]}`}
                >
                  {program?.status === "registration_open"
                    ? "On Going"
                    : program?.status === "published"
                      ? "Published" 
                      :program?.status === PUBLISH_MODAL_TEXT.STATUS_INTERNAL ? PUBLISH_MODAL_TEXT.INTERNAL_STATUS_CAPITALIZED : PUBLISH_MODAL_TEXT.DRAFT_STATUS_CAPITALIZED}
                </span>
              </div>
              <div className={styles.actionIcons}>
                <img
                  src={editIcon}
                  alt="edit"
                  className={styles.editIcon}
                  onClick={() =>
                    handleProgramClick(program)
                  }
                />
                {program?.status !== COMMON_FORM_FIELDS.STATUS.PUBLISHED && (
                  <img
                    src={deleteIcon}
                    alt="delete"
                    className={styles.deleteIcon}
                    onClick={() => handleDeleteProgram(program?.id)}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div className={styles.descriptionContainer}>
              <p className={styles.description}>
                {colorizeMahatriaInfinitheism(program?.description)}
              </p>
              <span className={styles.dateRange}>{program?.dateRange}</span>
            </div>
          </div>
          {/* Action Buttons */}
          <div className={styles.actions}>
            {program?.status !== "published" ? (
              <Button
                buttonClassName={styles.actionButton}
                onClick={() => handleActionButton(program?.id)}
              >
                <span className={styles.actionButtonText}>
                  {getActionButtonText()}
                </span>
              </Button>
            ) : (
              <button
                className={`${styles.viewButton} ${styles.viewButtonText}`}
                onClick={() => handleActionButton(program?.id)}
              >
                view details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const ProgramsDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const programs = useSelector((state:RootState) => state.ProgramReducer.programsList);
  const filteredProgramsList = useSelector((state:RootState) => state.ProgramReducer.filteredProgramsList) || [];

  // const [programData, setProgramData] = useState(false);
  const [localProgramsList, setLocalProgramsList] = useState<any[]>([]);
  // const [programTypesData, setProgramTypesData] = useState([]); // Store the original API data
  const [showChooseProgram, setShowChooseProgram] = useState(false); // State to control component rendering
  const userRole = getItemInLocalStorage("seekerDetails")?.role || ""; // Assuming you store the user role in local storage
  const seekerDetails = getItemInLocalStorage("seekerDetails");
  const loader  = useSelector((state:RootState) => state.ProgramReducer.loaderCounts.largeLoaderCount);

  // Function to extract and flatten all programs from the nested API response
  const extractProgramsFromResponse = (responseData) => {
    const allPrograms = [];
    responseData.forEach((program) => {
      const formattedProgram = {
        id: program.id,
        title: program.name,
        description: program.description || program.type?.description,
        dateRange: formatDateRange(program.startsAt, program.endsAt),
        status: program.status,
        code: program.code,
        basePrice: program.basePrice,
        totalSeats: program.totalSeats,
        availableSeats: program.availableSeats,
        programType: program.type?.name,
        typeKey: program.type?.key,
        bannerImageUrl: program.bannerImageUrl,
        bannerAnimationUrl: program.bannerAnimationUrl,
        programQuestionMaps: program.programQuestionMaps || [],
        programTemplateId: program?.programTemplateId,
        templateName: program?.template?.name || program?.templateName,
        typeId: program?.typeId,
      };

      allPrograms.push(formattedProgram);
    });
    return allPrograms;
  };
  // Helper function to format date range
  const formatDateRange = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return "Date TBD";

    const formatDate = (dateString: string): string => {
      try {
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.error("Invalid date:", dateString);
          return "Invalid Date";
        }

        const day = date.getDate();
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
      } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
      }
    };

    // Parse the ISO date string
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    // Return formatted range
    if (start === "Invalid Date" || end === "Invalid Date") {
      return "Date TBD";
    }

    return `${start} to ${end}`;
  };

  const fetchProgramsFromAPI = async () => {
    dispatch(incrementLoader(textConstant.LARGE));
    
    // Build query parameters based on user role
    let queryParams = `limit=${API_LIMIT_100}`;
    
    // Only add status filter for users who are not admin or shoba
    if (userRole !== ROLES.ADMIN && userRole !== USER_ROLE_SHOBA) {
      const filters = { status: [NESTEDTAB.INTERNAL, NESTEDTAB.PUBLISHED] };
      queryParams += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }
    
    try {
      const response = await getCall(`${endPoints.program}?${queryParams}`, undefined, PORTAL);
      if (response?.data?.data?.data) {
        dispatch(setProgramsList(response.data.data.data));
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      dispatch(decrementLoader(textConstant.LARGE));
    }
  };

  const formatAndSetProgramsList = () => {
    if (filteredProgramsList.length === 1 && !hasPermission(userRole, "ADD_PROGRAM", "C")) {
      navigate(`/admin/hdb-dashboard/${filteredProgramsList[0].id}`);
    }
    const formattedPrograms = extractProgramsFromResponse(programs);
    if (userRole === USER_ROLE_MAHATRIA) {
      const filteredPrograms = filterProgramsByTypeStatus(formattedPrograms, {
        type: HDB_MSD_LABEL,
        status: COMMON_FORM_FIELDS.STATUS.PUBLISHED,
      },true);
      setLocalProgramsList(filteredPrograms);
    } else {
      setLocalProgramsList(formattedPrograms);
    } 
  };

  useEffect(() => {
    // Fetch fresh data from API when component mounts
    fetchProgramsFromAPI();
  }, []);

  useEffect(() => {
    // Format and filter data when Redux state updates
    formatAndSetProgramsList();
  }, [programs, filteredProgramsList, userRole]);


  const handleAddProgram = () => {
    setShowChooseProgram(true); // Show the ChooseProgramPage component
  };

  const handleBackToDashboard = () => {
    setShowChooseProgram(false); // Go back to dashboard
  };

  // Conditionally render the component
  if (showChooseProgram) {
    return <ChooseProgramPage onBack={handleBackToDashboard} />;
  }

  return (
    <div className={styles.programsDashboard}>
      <div className={styles.programsDashboardMain}>
        <div className={styles.programsDashboardContent}>
          <div className={styles.programsDashboardTitleSection}>
            <div>
              <h2 className={styles.programsDashboardTitle}>
                {seekerDetails?.firstName === "Mahatria" ? (
                  <>
                    Loving you{" "}
                    <span className={styles.mahatriaText}>
                      {seekerDetails?.firstName}
                    </span>
                    , please select a program to view details.
                  </>
                ) : (
                  <>
                    Hi {seekerDetails?.firstName}, Here's a quick overview of
                    your created programs.
                  </>
                )}
              </h2>
            </div>
            {hasPermission(userRole, "ADD_PROGRAM", "C") && (
              <Button
                buttonClassName={styles.programsDashboardAddButton}
                onClick={handleAddProgram}
                datatestid="create-infinipath"
                datatestidText="create-infinipath-text"
              >
                Add program
              </Button>
            )}
          </div>

          <div className={styles.programsDashboardGrid}>
            {localProgramsList.length > 0
              ? (
                localProgramsList.map((program) => (
                  <ProgramCard
                    key={program.id}
                    fetchProgramsList={fetchProgramsFromAPI}
                    program={program}
                    title={program.name}
                    description={program.description}
                    status={program.status}
                    programId={program.id}
                    bannerImage={program?.bannerImageUrl}
                    programQuestionMaps={program.programQuestionMaps}
                  />
                ))
              )
              : loader < 1 && (
                <div className={styles.noProgramsWrapper}>
                  <NoPrograms onCreateProgram={handleAddProgram} />
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramsDashboard;
