import clsx from "clsx";
import styles from "./index.module.scss";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import opendropdown from "../../../assets/images/opendropdown.svg";
import closedropdown from "../../../assets/images/closedropdown.svg";
import { getItemInLocalStorage } from "../../../services/localStorage";
import { getFilterConfig } from "../../../utils/hdbDashboardUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedKpiOption,
  setFilterOptions,
  setFilterConfig,
  setActiveTab,
  setSelectedKpiTab,
  setSelectedKpiFilter,
  resetProgramState,
  setProgramOptions,
  setSelectedSubProgram,
  setSubProgramId,
  setProgramEndsAt,
  setProgramName,
} from "../../../reducers/ProgramReducer";
import { RootState } from "../../../store";
import { colorizeMahatriaInfinitheism } from "../../../common/components/ColorizeMahatriaInfinitheism";
import AIOverlay from "../../../common/components/AI-overlay";
import aiIcon from "../../../assets/images/aiIconImg.svg";
import { dropDownnJSON, HEADER_TABS, HEADERTABS } from "../../../constants/textConstants";
// ADD: Import CustomDropDown and getCall
import CustomDropDown from "../../../common/components/CustomDropDown";
import { getCall } from "../../../services/apiService";
import { findFirstActiveProgram, isProgramEnded } from "../../../services/roomAllocation";

const DashboardTabs = ({ activeTab = "dashboard", onTabChange, tabs }) => {
  const location = useLocation();
  const { programId } = useParams<{ programId: string }>();
  const dispatch = useDispatch();
  
  const programTitle = useSelector(
    (state: RootState) => state.ProgramReducer.programName,
  );
  const selectedOption = useSelector(
    (state: RootState) => state.ProgramReducer.selectedKpiOption,
  );
  const filterOptions = useSelector(
    (state: RootState) => state.ProgramReducer.filterOptions,
  );
  const filterResponse = useSelector(
    (state: RootState) => state.ProgramReducer.filterConfigList
  );
  const filterConfig = useSelector(
    (state: RootState) => state.ProgramReducer.filterConfigList
  )?.data?.parentOptions;

  const programOptions = useSelector(
    (state: RootState) => state.ProgramReducer.programOptions
  );
  const selectedSubProgram = useSelector(
    (state: RootState) => state.ProgramReducer.selectedSubProgram
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [programLoading, setProgramLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProgramOptions = async () => {
      // Fetch for both ROOM_ALLOCATION and EXPRESSIONS tabs
      if ((activeTab !== HEADERTABS.ROOM_ALLOCATION && activeTab !== HEADERTABS.EXPRESSIONS) || !programId) {
        // Clear program options when not on these tabs
        if (activeTab !== HEADERTABS.ROOM_ALLOCATION && activeTab !== HEADERTABS.EXPRESSIONS) {
          dispatch(setProgramOptions([]));
          if (activeTab !== HEADERTABS.ROOM_ALLOCATION) {
            dispatch(setSelectedSubProgram(null));
            dispatch(setSubProgramId(null));
          }
        }
        return;
      }

      try {
        setProgramLoading(true);

        const response = await getCall(
          `program/${programId}`,
          undefined,
          "portal",
        );
        const data = response?.data?.data;
        dispatch(setProgramName(data?.name));
        if (data?.endsAt) {
          dispatch(setProgramEndsAt(data.endsAt));
        }

        if (data?.groupedPrograms) {
          const transformedOptions = data.groupedPrograms.map(
            (program: any) => {
              const programEndsAt = program.endsAt || program.sessions?.[0]?.endsAt;
              return {
                value: program.id.toString(),
                label: program.name,
                endsAt: programEndsAt,
                // Only add disabled property for ROOM_ALLOCATION tab
                ...(activeTab === HEADERTABS.ROOM_ALLOCATION && {
                  disabled: isProgramEnded(programEndsAt),
                }),
              };
            },
          );

          // For EXPRESSIONS tab, add "Blessed" as the first option
          if (activeTab === HEADERTABS.EXPRESSIONS) {
            const blessedOption = {
              value: dropDownnJSON.BLESSED.value,
              label: dropDownnJSON.BLESSED.label,
              endsAt: null,
            };
            const allOptions = [blessedOption, ...transformedOptions];
            dispatch(setProgramOptions(allOptions));

            // Set "Blessed" as default if nothing is selected
            if (!selectedSubProgram) {
              dispatch(setSelectedSubProgram(dropDownnJSON.BLESSED.value));
              dispatch(setSubProgramId(null)); // null for "Blessed"
              dispatch(setProgramEndsAt(null));
            }
          } else {
            // For ROOM_ALLOCATION, use original behavior
            dispatch(setProgramOptions(transformedOptions));

            if (transformedOptions.length > 0) {
              // Always find and set the first active program for ROOM_ALLOCATION
              const firstActive = findFirstActiveProgram(transformedOptions);
              if (firstActive) {
                dispatch(setSelectedSubProgram(firstActive.value));
                dispatch(setSubProgramId(Number(firstActive.value)));
                dispatch(setProgramEndsAt(firstActive.endsAt || ""));
              }
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching program options:", error);
      } finally {
        setProgramLoading(false);
      }
    };

    activeTab !== HEADER_TABS.EXPRESSIONS && fetchProgramOptions();
  }, [activeTab, programId]);

  

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleOpenAIOverlay = () => {
    setIsOverlayOpen(true);
  };

  const handleCloseAIOverlay = () => {
    setIsOverlayOpen(false);
  };

  // ADD: Handle sub-program change
  const handleSubProgramChange = (value: string) => {
    dispatch(setSelectedSubProgram(value));
    
    // Handle "Blessed" option specially - set subProgramId to null
    if (value === dropDownnJSON.BLESSED.value) {
      dispatch(setSubProgramId(null));
      dispatch(setProgramEndsAt(null));
    } else {
      dispatch(setSubProgramId(Number(value)));
      const selectedOption = programOptions.find(opt => opt.value === value);
      if (selectedOption?.endsAt) {
        dispatch(setProgramEndsAt(selectedOption.endsAt));
      }
    }
  };

  return (
    <>
      <div className={styles.tabsWrapper}>
        <div className={styles.headerSection}>
          <h2 className={styles.logo}>
            {colorizeMahatriaInfinitheism(
              programTitle ? programTitle : "HDB/MSD 2025-26",
            )}
          </h2>

          {activeTab === "registrations" && (
            <div className={styles.statusSelector} ref={dropdownRef} onClick={() => setIsDropdownOpen((prev) => !prev)}>
              <span className={styles.toolbar}>
                {colorizeMahatriaInfinitheism(
                  selectedOption?.label || "Select",
                )}{" "}
              </span>
              <span className={styles.dropdownArrow}>
                <img
                  src={isDropdownOpen ? opendropdown : closedropdown}
                  alt="dropdown"
                  style={{ pointerEvents: 'none' }}
                />
              </span>
              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {filterOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`${styles.dropdownItem} ${selectedOption?.value === option.value ? styles.selected : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setSelectedKpiTab(option?.kpiOptions[0]));
                        dispatch(
                          setSelectedKpiOption({
                            label: option.label,
                            value: option.value,
                            // kpiOptions: option.kpiOptions,
                          }),
                        );
                        dispatch(setActiveTab(0));

                        dispatch(setSelectedKpiFilter(null));
                        setIsDropdownOpen(false);
                      }}
                    >
                      {colorizeMahatriaInfinitheism(option.label)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(activeTab === HEADERTABS.ROOM_ALLOCATION || activeTab === HEADERTABS.EXPRESSIONS) && programOptions.length > 0 && (
              <CustomDropDown
                value={selectedSubProgram || (activeTab === HEADERTABS.EXPRESSIONS ? dropDownnJSON.BLESSED.value : "")}
                onChange={handleSubProgramChange}
                options={programOptions}
                height={28}
                width="auto"
                customColor="#F9FAFB"
                className={styles.programDropdown}
                disabled={programLoading}
              />
          )}
        </div>

        <div className={styles.tabs}>
          <>
            <img
              src={aiIcon}
              alt="ai icon"
              onClick={handleOpenAIOverlay}
              className={styles.aiIcon}
            />
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={clsx(styles.tab, {
                  [styles.active]: activeTab === tab.key,
                })}
                onClick={() => {
                  if (tab.key !== "registrations") {
                    dispatch(resetProgramState());
                    setIsDropdownOpen(false);
                    onTabChange?.(tab.key);
                  } else {
                    setIsDropdownOpen(false);
                    onTabChange?.(tab.key);
                  }
                  if (filterConfig?.length > 0) {
                    const defaultOption = filterConfig[0];
                    dispatch(
                      setSelectedKpiOption({
                        label: defaultOption?.label,
                        value: defaultOption?.value,
                      }),
                    );
                    dispatch(setSelectedKpiTab(defaultOption.kpiOptions[0]));
                  }
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </>
        </div>
      </div>
      {/* AI Overlay Component */}
      <AIOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseAIOverlay}
        apiEndpoint={process.env.REACT_APP_AI_ASSISTANT_URL}
        programId={programId}
      />
    </>
  );
};

export default DashboardTabs;
