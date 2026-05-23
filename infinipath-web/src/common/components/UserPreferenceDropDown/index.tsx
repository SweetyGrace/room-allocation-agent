import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.scss";
import opendropdown from "../../../assets/images/opendropdown.svg";
import closedropdown from "../../../assets/images/closedropdown.svg";
import {
  USER_PREFERENCE_DROPDOWN,
  swapRequestPayload,
  mousedown,
  scroll,
  resize,
  ApprovalStatus,
  startWithIn,
} from "../../../constants/textConstants";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";
import { isSessionStartingSoon, normalizeString } from "../../../utils/commonFunctions";

// Preference type
interface PreferencesDropdownProps {
  preferences: Array<{ name: string; value: string | number }>;
  highlightPreference?: string | number;
  onSelect: (pref: any) => void;
  onFlip?: () => void;
  user?: any;
  swapRequests?: any[];
  isswapRequest?: boolean;
  mahatriachoiceType?: string; // Added to handle mahatriaChoiceType
  sessions?: any[];
}


const UserPreferencesDropdown: React.FC<PreferencesDropdownProps> = ({
  preferences,
  highlightPreference,
  onSelect,
  swapRequests,
  mahatriachoiceType,
  isswapRequest = false,
  sessions,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
   const availableSessions = useMemo(() => {
    if (!sessions) return [];
    
    return sessions.filter(session => {
      // Always keep Hold and YTD
      if (session.name === ApprovalStatus.HOLD || session.name === ApprovalStatus.YTD) {
        return true;
      }
      // Filter out sessions starting within 10 days
      return !isSessionStartingSoon(session);
    });
  }, [sessions]);

  const handlePrefSelect = (e: React.MouseEvent, pref: any) => {
    e.stopPropagation();
    onSelect(pref);
    setIsOpen(false);
  };
  useEffect(() => {
    if (!isOpen) return;
    const checkDropdownDirection = () => {
      // Use anchorRef or triggerRef depending on which trigger is active
      const activeRef =
        highlightPreference ===
        USER_PREFERENCE_DROPDOWN.mahatriaChoiceUnallocated
          ? anchorRef.current
          : triggerRef.current;

      if (!activeRef || !dropdownRef.current) return;

      const triggerRect = activeRef.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const wouldBeCutOff = spaceBelow < dropdownHeight;
      const hasSpaceAbove = spaceAbove >= dropdownHeight;
    // Open upward if it would be cut off below AND there's space above
    // OR if we're in the bottom third of the viewport
    const isInBottomThird = triggerRect.top > (window.innerHeight * 0.67);

    
    if ((wouldBeCutOff && hasSpaceAbove) || (isInBottomThird && hasSpaceAbove)) {
      setOpenUpward(true);
    } else {
      setOpenUpward(false);
    }
  };
    checkDropdownDirection();
    window.addEventListener(resize, checkDropdownDirection);
    window.addEventListener(scroll, checkDropdownDirection, true);

    const handleClickOutside = (event: MouseEvent) => {
      const isClickInside =
        (dropdownRef.current &&
          dropdownRef.current.contains(event.target as Node)) ||
        (anchorRef.current &&
          anchorRef.current.contains(event.target as Node)) ||
        (triggerRef.current &&
          triggerRef.current.contains(event.target as Node));

      if (!isClickInside) {
        setIsOpen(false);
      }
    };

    document.addEventListener(mousedown, handleClickOutside);

    return () => {
      window.removeEventListener(resize, checkDropdownDirection);
      window.removeEventListener(scroll, checkDropdownDirection, true);
      document.removeEventListener(mousedown, handleClickOutside);
    };
  }, [isOpen, highlightPreference]);

  return (
    <>
      <div
        ref={anchorRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={styles.preferenceDropdownTrigger}
      >
        {highlightPreference ===
          USER_PREFERENCE_DROPDOWN.mahatriaChoiceUnallocated && (
          <>
            <p
              className={`${styles.staticLabel} ${styles.staticLabelMahatria}`}
            >
              {colorizeMahatriaInfinitheism("Any HDB/MSD")}
            </p>
            <span className={styles.dropdownArrowIcon}>
              <img src={isOpen ? opendropdown : closedropdown} alt="dropdown" />
            </span>
          </>
        )}
      </div>
      <div
        className={styles.preferenceDropdownWrapper}
        ref={dropdownRef}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {isOpen &&
          (isswapRequest === false ? (
            <div
              className={`${styles.dropdownMenu} ${openUpward ? styles.dropdownMenuUp : styles.dropdownMenuDown}`}
            >
              {!highlightPreference ||
              highlightPreference ===
                USER_PREFERENCE_DROPDOWN.preferencesUnallocated ? (
                <>
                  {Array.isArray(availableSessions) &&
                    availableSessions
                      .filter(
                        (session) =>
                          session.name !== ApprovalStatus.YTD &&
                          session.name !== "Hold" &&
                          !preferences.some(
                            (pref) =>
                              normalizeString(pref.label) ===
                              normalizeString(session.name),
                          ),
                      )
                      .map((session) => (
                        <div
                          key={session.id}
                          className={styles.dropdownItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(session);
                            setIsOpen(false);
                          }}
                        >
                          {colorizeMahatriaInfinitheism(session.name)}
                        </div>
                      ))}

                  <div
                    className={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(swapRequestPayload.Hold);
                      setIsOpen(false);
                    }}
                  >
                    {swapRequestPayload.Hold.name}
                  </div>
                </>
              ) : (
                <div>
                  <div className={styles.preferenceNameLabel}>
                    {highlightPreference !==
                      USER_PREFERENCE_DROPDOWN.mahatriaChoiceUnallocated &&
                    mahatriachoiceType !==
                      USER_PREFERENCE_DROPDOWN.mahatriaChoiceBlessed
                      ? USER_PREFERENCE_DROPDOWN.preferencesHeading
                      : ""}
                  </div>

                  {Array.isArray(availableSessions) &&
                    availableSessions
                      .filter(
                        (session) => session.name !== ApprovalStatus.YTD,
                        // && (session.name !== "Hold" )
                      )
                      .map((session, idx) => {
                        const isHighlighted =
                          highlightPreference === session.name ||
                          (highlightPreference ===
                            swapRequestPayload.YTD.value &&
                            session.id === swapRequestPayload.YTD.id) ||
                          (highlightPreference ===
                            swapRequestPayload.Hold.value &&
                            session.id === swapRequestPayload.Hold.id); // Generated by Copilot

                        return (
                          !(
                            session.name === "Hold" &&
                            highlightPreference ===
                              swapRequestPayload.Hold.value
                          ) && (
                            <div
                              key={session.id}
                              className={`${styles.dropdownItem} ${isHighlighted ? styles.highlight : ""} ${isHighlighted ? styles.disabled : ""}`}
                              onClick={
                                isHighlighted
                                  ? undefined
                                  : (e) => {
                                      e.stopPropagation();
                                      onSelect(session);
                                      setIsOpen(false);
                                    }
                              }
                              style={
                                isHighlighted
                                  ? {
                                      pointerEvents:
                                        USER_PREFERENCE_DROPDOWN.none as React.CSSProperties["pointerEvents"],
                                    }
                                  : {}
                              }
                            >
                              {colorizeMahatriaInfinitheism(session.name)}
                            </div>
                          )
                        );
                      })}

                  {/* {mahatriachoiceType !==
                    USER_PREFERENCE_DROPDOWN.mahatriaChoiceBlessed &&
                    highlightPreference !==
                      USER_PREFERENCE_DROPDOWN.mahatriaChoiceUnallocated &&
                    mahatriachoiceType !==
                      USER_PREFERENCE_DROPDOWN.mahatriaChoiceHold && (
                      <div className={styles.dropdownDivider} />
                    )} */}

                  <>
                    {/* If mahatriachoiceType is mahatriaChoiceUnallocated, show both Hold and YTD */}
                    {highlightPreference ===
                    USER_PREFERENCE_DROPDOWN.mahatriaChoiceUnallocated ? (
                      <>
                        {/* <div
                          className={`${styles.dropdownItem} ${highlightPreference === swapRequestPayload.Hold.value ? styles.highlight : ""} ${highlightPreference === swapRequestPayload.Hold.value ? styles.disabled : ""}`}
                          onClick={
                            highlightPreference ===
                            swapRequestPayload.Hold.value
                              ? undefined
                              : (e) => {
                                  e.stopPropagation();
                                  onSelect(swapRequestPayload.Hold);
                                  setIsOpen(false);
                                }
                          }
                          style={
                            highlightPreference ===
                            swapRequestPayload.Hold.value
                              ? {
                                  pointerEvents:
                                    USER_PREFERENCE_DROPDOWN.none as React.CSSProperties["pointerEvents"],
                                }
                              : {}
                          }
                        >
                          {swapRequestPayload.Hold.name}
                        </div> */}
                        {/* <div
                          className={`${styles.dropdownItem} ${highlightPreference === swapRequestPayload.YTD.value ? styles.highlight : ""} ${highlightPreference === swapRequestPayload.YTD.value ? styles.disabled : ""}`}
                          onClick={
                            highlightPreference === swapRequestPayload.YTD.value
                              ? undefined
                              : (e) => {
                                  e.stopPropagation();
                                  onSelect(swapRequestPayload.YTD);
                                  setIsOpen(false);
                                }
                          }
                          style={
                            highlightPreference === swapRequestPayload.YTD.value
                              ? {
                                  pointerEvents:
                                    USER_PREFERENCE_DROPDOWN.none as React.CSSProperties["pointerEvents"],
                                }
                              : {}
                          }
                        >
                          {swapRequestPayload.YTD.name}
                        </div> */}
                      </>
                    ) : (
                      <>
                        {/* Only show YTD if user is blessed in Hold */}
                        {/* {highlightPreference ===
                          swapRequestPayload.Hold.value && (
                          <div
                            className={`${styles.dropdownItem} ${highlightPreference === swapRequestPayload.YTD.value ? styles.highlight : ""} ${highlightPreference === swapRequestPayload.YTD.value ? styles.disabled : ""}`}
                            onClick={
                              highlightPreference ===
                              swapRequestPayload.YTD.value
                                ? undefined
                                : (e) => {
                                    e.stopPropagation();
                                    onSelect(swapRequestPayload.YTD);
                                    setIsOpen(false);
                                  }
                            }
                            style={
                              highlightPreference ===
                              swapRequestPayload.YTD.value
                                ? {
                                    pointerEvents:
                                      USER_PREFERENCE_DROPDOWN.none as React.CSSProperties["pointerEvents"],
                                  }
                                : {}
                            }
                          >
                            {swapRequestPayload.YTD.name}
                          </div>
                        )} */}
                        {/* Only show Hold if user is blessed in YTD */}
                        {/* {highlightPreference ===
                          swapRequestPayload.YTD.value && (
                          <div
                            className={`${styles.dropdownItem} ${highlightPreference === swapRequestPayload.Hold.value ? styles.highlight : ""} ${highlightPreference === swapRequestPayload.Hold.value ? styles.disabled : ""}`}
                            onClick={
                              highlightPreference ===
                              swapRequestPayload.Hold.value
                                ? undefined
                                : (e) => {
                                    e.stopPropagation();
                                    onSelect(swapRequestPayload.Hold);
                                    setIsOpen(false);
                                  }
                            }
                            style={
                              highlightPreference ===
                              swapRequestPayload.Hold.value
                                ? {
                                    pointerEvents:
                                      USER_PREFERENCE_DROPDOWN.none as React.CSSProperties["pointerEvents"],
                                  }
                                : {}
                            }
                          >
                            {swapRequestPayload.Hold.name}
                          </div>
                        )} */}
                      </>
                    )}
                  </>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`${styles.dropdownMenu} ${openUpward ? styles.dropdownMenuUp : styles.dropdownMenuDown}`}
            >
              <div className={styles.preferenceNameLabel}>
                {USER_PREFERENCE_DROPDOWN.swapPreferencesHeading}
              </div>
              {swapRequests &&
                swapRequests.length > 0 &&
                swapRequests.map((req, idx) => {
                  // Find the matching session by id
                  const session = sessions?.find((s) => s.id === req.id);
                  // Check if the session is starting soon
                  const isDisabled =
                    session && session.startsAt
                      ? isSessionStartingSoon(session)
                      : false;

                  return (
                    <div
                      key={idx}
                      className={`${styles.dropdownItem} ${isDisabled ? styles.disabledSession : ""}`}
                      onClick={
                        isDisabled
                          ? undefined
                          : (e) => {
                              e.stopPropagation();
                              handlePrefSelect(e, req);
                            }
                      }
                      title={isDisabled ? startWithIn : ""}
                    >
                      {colorizeMahatriaInfinitheism(req.name)}
                    </div>
                  );
                })}
              {/* Generated by Copilot */}
              {swapRequests && swapRequests.length > 0 && (
                <div className={styles.dropdownDivider} />
              )}
              {preferences
                .filter(
                  (pref) =>
                    !swapRequests?.some((req) => req.name === pref.name) &&
                    (pref.name === ApprovalStatus.YTD &&
                      highlightPreference === "yet-to-decide") === false,
                )
                // pref.name !== "YTD",

                .map((pref) => {
                  // Support both string/number and object for highlightPreference
                  const isHighlighted = highlightPreference === pref.name;

                      const session = sessions?.find((s) => s.id === pref.value);
                      // Check if the session is starting soon
                      const isDisabled =
                        session && session.startsAt
                          ? isSessionStartingSoon(session)
                          : false;
                  return (
                    <div
                      key={pref.value}
                      className={`${styles.dropdownItem} ${
                        isHighlighted ? styles.highlight : ""
                      } ${isHighlighted ? styles.disabled : ""} ${
                        isDisabled ? styles.disabledSession : ""
                      }`}
                      onClick={
                        isHighlighted || isDisabled
                          ? undefined
                          : (e) => {
                              e.stopPropagation();
                              handlePrefSelect(e, pref);
                            }
                      }
                    >
                      {colorizeMahatriaInfinitheism(pref.name)}
                    </div>
                  );
                })}
            </div>
          ))}
      </div>

      <div
        className={styles.preferenceDropdownTrigger}
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        {preferences.length > 0 &&
          highlightPreference !==
            USER_PREFERENCE_DROPDOWN.preferencesUnallocated && (
            <span className={styles.staticLabel}>
              {highlightPreference !==
                USER_PREFERENCE_DROPDOWN.mahatriaChoiceUnallocated &&
                USER_PREFERENCE_DROPDOWN.selectToMove}
            </span>
          )}
        {highlightPreference !==
          USER_PREFERENCE_DROPDOWN.mahatriaChoiceUnallocated && (
          <span className={styles.dropdownArrowIcon}>
            <img src={isOpen ? opendropdown : closedropdown} alt="dropdown" />
          </span>
        )}
      </div>
    </>
  );
};

export default UserPreferencesDropdown;
