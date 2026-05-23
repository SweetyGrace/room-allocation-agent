import React from 'react';
import styles from './index.module.scss';
import { PreferenceChip } from '../PreferenceChip';
import UserPreferencesDropdown from '../UserPreferenceDropDown';
import { ApprovalStatus } from '../../../constants/textConstants';
import { isSessionStartingSoon } from '../../../utils/commonFunctions';

interface ProgramPreference {
  id?: string | number;
  allocatedCount?: object;
  organisationUserCount?: number;
  totalSeekers?: object;
  name: string;
  startsAt? : Date
}

interface UnallocatedPreferencesProps {
  preferences: ProgramPreference[];
  isOverlay?: boolean;
  sessions?: ProgramPreference[];
  highlightAllocated?: boolean;
  allocatedProgramId?: string | number;
  onPrefClick: (pref: any) => void;
  onSelect: (pref: any) => void;
  isSeekerOverlay?: boolean;
  removeHoldYTD?: boolean;
  removeStatus?:string;
  isSwap?:boolean;
}

export const UnallocatedPreferences: React.FC<UnallocatedPreferencesProps> = ({
  preferences,
  isOverlay = true,
  sessions = [],
  highlightAllocated = false,
  allocatedProgramId,
  onPrefClick,
  onSelect,
  isSeekerOverlay = false, // New prop to indicate if it's a seeker overlay
  removeHoldYTD = false,
  removeStatus="",
  isSwap= false,
}) => {
  const filteredPreferences = removeHoldYTD
    ? preferences.filter(
        (pref) =>  pref.name !== ApprovalStatus.YTD
      )
    : preferences;


  const preferencesWithDate = preferences.filter(sessions => !isSessionStartingSoon(sessions))

  return (
    <div className={styles.unallocatedPreferences}>
      {!isOverlay && preferences?.map((pref, idx) => (
        <PreferenceChip
          key={idx}
          name={pref.name}
          id={pref.id}
          isAllocated={highlightAllocated}
          allocatedProgramId={allocatedProgramId}
          onPrefClick={onPrefClick}
          isSeekerOverlay={isSeekerOverlay}
          sessions={sessions}
        />
      ))}
      {isOverlay && (
        <div className={styles.sessionsWrapper}>
          {preferencesWithDate.map((session, idx) => {
            const isAllocated =
              allocatedProgramId !== undefined &&
              allocatedProgramId !== null &&
              (session.id === allocatedProgramId || allocatedProgramId === ApprovalStatus.REJECTED && session.name === ApprovalStatus.HOLD);
            const isYTDWithAllocated =
              ((allocatedProgramId && session.name === ApprovalStatus.YTD && !isSwap) || session.name === removeStatus );
            const allowClick = !isAllocated && !isYTDWithAllocated;
            console.log(isYTDWithAllocated, "isAllocated", session.name)
            return (
              <div
                className={
                  isAllocated || isYTDWithAllocated
                    ? styles.sessionContainerAllocated
                    : styles.sessionContainer
                }
                key={idx}
                onClick={allowClick ? () => onPrefClick(session) : undefined}
                style={{
                  cursor: allowClick ? "pointer" : "not-allowed",
                  pointerEvents: allowClick ? "auto" : "none",
                }}
              >
                <p className={styles.sessionName}>{session.name}</p>
                {session.name !== ApprovalStatus.HOLD && session.name !== ApprovalStatus.YTD && (
                  <div
                    className={
                      isAllocated
                        ? styles.progressBarContainerAllocated
                        : styles.progressBarContainer
                    }
                  >
                    <div
                      className={
                        isAllocated
                          ? styles.progressBarAllocated
                          : styles.progressBar
                      }
                      style={{
                        width:
                          session?.totalSeekers > 0
                            ? `${(session?.allocatedCount / session?.totalSeekers) * 100 > 100 ? 100 : (session?.allocatedCount / session?.totalSeekers) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                )}
                <div className={styles.sessionCount}>
                  {session.name === ApprovalStatus.HOLD || session.name === ApprovalStatus.YTD ? (
                    <span className={styles.totalSeekers}>
                      {session?.allocatedCount}
                    </span>
                  ) : (
                    <p>
                      {session?.allocatedCount}({session?.organisationUserCount}) /
                      <span className={styles.totalSeekers}>
                        &nbsp;{session?.totalSeekers}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
