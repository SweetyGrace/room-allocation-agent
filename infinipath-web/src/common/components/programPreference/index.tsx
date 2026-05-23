import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import { formatDateWithDay } from "../../../utils/commonFunctions";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";
import { Question } from "../ProgramRegistration/types";
import { Program } from "../../../types/seatApproval";

interface PreferenceOrder {
    sessionId: number;
    priorityOrder: number;
}

interface ProgramWithPriority extends Program {
    priority: number | null;
}

interface ProgramPreferenceProps {
    availablePrograms: Program[] | undefined;
    maxPreferences?: number;
    onPreferencesChange?: (preferences: PreferenceOrder[] | null) => void;
    question?: Question;
    mahatriaChoice?: any | null;
    addedclassName?: string;
    value: PreferenceOrder[];
}

const ProgramPreference: React.FC<ProgramPreferenceProps> = ({
    availablePrograms,
    maxPreferences = 5,
    onPreferencesChange,
    question,
    mahatriaChoice,
    addedclassName = "",
    value,
}) => {
    const [programs, setPrograms] = useState<ProgramWithPriority[]>([]);
    const [isDisable, setIsDisable] = useState(true);
    const [selectedPreferences, setSelectedPreferences] = useState<PreferenceOrder[]>([]);
    const [isMahatriaChoiceSelected, setIsMahatriaChoiceSelected] = useState(
        Array.isArray(value) && value.length === 0 && question?.config?.mahatriaChoiceConfig?.allowMahatriaChoice
    );
    useEffect(() => {
        // Check if Mahatria's choice should be selected based on value and question config
        if (Array.isArray(value) && value.length === 0 && question?.config?.mahatriaChoiceConfig?.allowMahatriaChoice) {
            setIsMahatriaChoiceSelected(true);
        } else {
            setIsMahatriaChoiceSelected(false);
        }
    }, [availablePrograms, question?.config?.mahatriaChoiceConfig?.allowMahatriaChoice]);
    useEffect(() => {
        // Map available programs and set priority from value if present
        const programsWithPriority = availablePrograms?.map((program) => {
            const found = value && value.find((v) => v.sessionId === program.id);
            return {
                ...program,
                priority: found ? found.priorityOrder : null,
            };
        });
        setPrograms(programsWithPriority);

        // Set selectedPreferences from value
        setSelectedPreferences(Array.isArray(value) ? value : []);
    }, [availablePrograms, value, mahatriaChoice]);

    // Handle Mahatria's choice selection
    const handleMahatriaChoiceToggle = () => {
        if (isMahatriaChoiceSelected) {
            // Deselect Mahatria's choice
            setIsMahatriaChoiceSelected(false);
            onPreferencesChange?.(null);
        } else {
            // Select Mahatria's choice - clear all other selections
            setIsMahatriaChoiceSelected(true);
            setPrograms((prev) => prev.map((p) => ({ ...p, priority: null })));
            setSelectedPreferences([]);
            onPreferencesChange?.([]);
        }
    };

    // Handle program priority selection
  const handlePriorityClick = (programId: number, priority: number) => {
    if (isMahatriaChoiceSelected) {
      return;
    }

    setPrograms((prev) => {
      const clicked = prev.find((p) => p.id === programId);

      // If this program already has this priority, toggle it OFF
      // and also clear all priorities with lower precedence (higher numbers)
      if (clicked && clicked.priority === priority) {
        const cleared = prev.map((p) => {
          if (p.priority !== null && (p.priority as number) >= priority) {
            return { ...p, priority: null };
          }
          return p;
        });

        const preferences = cleared
          .filter((p) => p.priority !== null)
          .sort((a, b) => (a.priority! - b.priority!))
          .map((p) => ({
            sessionId: p.id,
            sessionName: p.name,
            priorityOrder: p.priority!,
          }));

        setSelectedPreferences(preferences);
        onPreferencesChange?.(
            preferences.length > 0 ? preferences : null
        );

        return cleared;
      }

      // Otherwise assign this priority to the clicked program and remove it from others
      const updated = prev.map((p) => {
        if (p.id === programId) return { ...p, priority };
        if (p.priority === priority) return { ...p, priority: null };
        return p;
      });

      const preferences = updated
        .filter((p) => p.priority !== null)
        .sort((a, b) => (a.priority! - b.priority!))
        .map((p) => ({
          sessionId: p.id,
          sessionName: p.name,
          priorityOrder: p.priority!,
        }));

      setSelectedPreferences(preferences);
      onPreferencesChange?.(
       preferences.length > 0 ? preferences : null 
      );

      return updated;
    });
  };

    // Reset all preferences
    const resetPreferences = () => {
        setPrograms((prev) => prev.map((p) => ({ ...p, priority: null })));
        // setIsMahatriaChoiceSelected(false);
        setSelectedPreferences([]);
        onPreferencesChange?.([]);
    };



    // Render priority buttons for a program
    const renderPriorityButtons = (program: ProgramWithPriority) => {
        // Find the highest assigned priority (stepwise logic)
        const assignedPriorities = programs
            .filter((p) => p.priority !== null)
            .map((p) => p.priority as number);
        const currentStep = assignedPriorities.length + 1; // 1-based

        return (
            <div className={styles.priorityButtons}>
                {Array.from({ length: maxPreferences }, (_, index) => {
                    const priority = index + 1;
                    const isSelected = program.priority === priority;
                    const isMahatriaChoiceDisabled = isMahatriaChoiceSelected;


                    // Enable only the current step's column for unassigned programs
                    // For already assigned programs, only their assigned button is enabled
                    let isDisabled = false;
                    if (isMahatriaChoiceDisabled) {
                        isDisabled = true;
                    } else if (program.priority !== null) {
                        // Only allow the selected priority for this program
                        isDisabled = !isSelected;
                    } else {
                        // For unassigned programs, only enable the current step's column
                        isDisabled = priority !== currentStep;
                    }

                    return (
                        <button
                            key={priority}
                            className={`${styles.priorityButton} ${
                            isSelected ? styles.selected : ""
                            } ${styles[`priority${priority}`]} ${isDisabled ? styles.disabled : ""}`}
                            onClick={() => handlePriorityClick(program.id, priority)}
                            disabled={isDisabled}
                        >
                            Choice {priority}
                        </button>
                    );
                })}
            </div>
        );
    };

    // Render program item
    const renderProgramItem = (program: ProgramWithPriority) => (
        <div key={program.id} className={styles.programItem}>
            <div className={styles.programHeader}>
                <div className={styles.programInfo}>
                    <div className={styles.programHead}>
                        <div className={styles.programName}>{colorizeMahatriaInfinitheism (program.name)}</div>
                        {/* <div className={styles.separator}></div> */}
                        {/* {program?.venue?.length > 20 ? (
              <Tooltip title={program.venue} arrow placement="bottom">
                <div className={styles.programName}>
                  {program.venue.slice(0, 20)}...
                </div>
              </Tooltip>
            ) : (
              <div className={styles.programName}>{program.venue}</div>
            )} */}
                    </div>
                    <div className={styles.programDatesSection}>
                        <div className={styles.programDates}>
                            {formatDateWithDay(program?.startsAt)} -{" "}
                            {formatDateWithDay(program?.endsAt)}
                        </div>
                    </div>
                </div>
            </div>
            {renderPriorityButtons(program)}
        </div>
    );

    useEffect(() => {
        // If any program is selected or Mahatria's choice is selected, enable
        if (selectedPreferences.length > 0 || isMahatriaChoiceSelected) {
            setIsDisable(false);
        } else {
            setIsDisable(true);
        }
    }, [selectedPreferences, isMahatriaChoiceSelected]);

    // Generate preference summary text
    const getPreferenceSummary = () => {
        if (isMahatriaChoiceSelected && selectedPreferences.length === 0) {
            return (
                <span className={styles.summaryText}>{colorizeMahatriaInfinitheism ("Any HDB/MSD selected")}</span>
            );
        }

        if (selectedPreferences.length === 0) {
            return (
                <span className={styles.summaryText}>No preferences selected</span>
            );
        }

        const sortedPreferences = [...selectedPreferences].sort(
            (a, b) => a.priorityOrder - b.priorityOrder,
        );
        const programNames = sortedPreferences.map((pref) => {
            const program = programs.find((p) => p.id === pref.sessionId);
            return program?.name || pref.sessionId;
        });

        return (
            <span className={styles.summaryContainer}>
                {programNames.map((name, idx) => (
                    <>
                        <div key={idx} className={styles.choiceBox}>
                            <div className={styles.choiceLabel}>
                                Choice {sortedPreferences[idx].priorityOrder}
                            </div>
                            <div className={`${styles.choiceValue} ${styles[`choice${sortedPreferences[idx].priorityOrder}`]}`}>{name}</div>
                        </div>
                        {idx !== programNames.length - 1 && (
                            <div className={styles.divider} />
                        )}
                    </>
                ))}
            </span>
        );
    };

    return (
        <>
            <div
                className={
                    addedclassName ? styles.renderformdragdrop : styles.dragdropcontainer
                }
            >
                <div className={styles.header}>
                    <div className={styles.headerData}>
                        <p className={styles.title}>{question?.label}</p>
                        {/* <div className={styles.infoIcon}>i
        </div> */}
                    </div>
                    <div className={styles.preferenceReset}>
                        <div
                            className={`${styles.reset} ${isDisable ? styles.disabled : ""}`}
                            onClick={() => {
                                if (isDisable) return;
                                setPrograms((prev) => prev.map((p) => ({ ...p, priority: null })));
                                setIsMahatriaChoiceSelected(false);
                                setSelectedPreferences([]);
                                onPreferencesChange?.(null);
                            }}
                        >
                           Reset preference
                        </div>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Mahatria's Choice Section */}
                    {mahatriaChoice && question?.config?.mahatriaChoiceConfig?.allowMahatriaChoice && (
                        <div className={styles.mahatriaChoiceSection}>
                            <div
                                className={`${styles.mahatriaChoiceCard} ${isMahatriaChoiceSelected ? styles.selected : ""
                                    }`}
                            >
                                <div className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={isMahatriaChoiceSelected}
                                        // readOnly
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            handleMahatriaChoiceToggle();
                                            setIsDisable(false);
                                        }}
                                    />
                                </div>
                                <div className={styles.choiceText} onClick={(e) => {
                                    e.stopPropagation();
                                    handleMahatriaChoiceToggle();
                                }}>
                                    {/* I'm Comfortable with{" "}
                  <span className={styles.highlight}>Mahatria</span>'s Choice
                  for My HDB Program selection */}
                                    {colorizeMahatriaInfinitheism (question?.config?.mahatriaChoiceConfig?.mahatriaChoicetText)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Programs Grid */}
                    <div className={styles.programsGrid}>
                        {programs.map((program) => renderProgramItem(program))}
                    </div>

                    {/* Disabled Choice Message */}
                    {/* {selectedPreferences.length > 0 && mahatriaChoice && !isMahatriaChoiceSelected && (
          <div className={styles.disabledChoice}>
            <p>
              <span className={styles.highlight}>Mahatria's</span> choice
              has been disabled as you have added other preferences. You can
              clear selections to re-enable it.
            </p>
            <button
              className={styles.resetButton}
              onClick={resetPreferences}
            >
              Reset preferences
            </button>
          </div>
        )} */}

                    {/* Preference Summary */}
                </div>
                {/* <div className={styles.preferenceSummary}>
          <div className={styles.summaryText}>{getPreferenceSummary()}</div>
        </div> */}
                <div className={styles.preferenceSummary}>{getPreferenceSummary()}</div>
            </div>
            {/* </div> */}
        </>
    );
};

export default ProgramPreference;
