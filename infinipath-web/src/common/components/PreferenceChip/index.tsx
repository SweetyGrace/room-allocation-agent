import React from 'react';
import styles from './index.module.scss';
import { colorizeMahatriaInfinitheism } from '../ColorizeMahatriaInfinitheism';
import { isSessionDisabledByStartDate } from '../../../utils/commonFunctions';

interface PreferenceChipProps {
  name: string;
  id?: string | number;
  isAllocated: boolean;
  allocatedProgramId?: string | number;
  onPrefClick: (pref: any) => void;
  isSeekerOverlay?: boolean; 
  sessions?:any;
}

export const PreferenceChip: React.FC<PreferenceChipProps> = ({
  name,
  id,
  isAllocated,
  allocatedProgramId,
  onPrefClick,
  isSeekerOverlay = false, 
  sessions,
}) => {
    const isDisabled = isSessionDisabledByStartDate(
    { id, name },
    sessions
  );
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Only allow click if not disabled and not in seeker overlay
    if (!isDisabled && !isSeekerOverlay) {
      onPrefClick({ name, id });
    }
  };
    return (
    <span
      className={`
        ${styles.preferenceChip}
        ${isAllocated && allocatedProgramId === id ? styles.allocatedChip : ''}
        ${isDisabled ? styles.disabledChip : ''}
       ${isSeekerOverlay ? styles.seekerOverlay : ''}
      `.trim()}
      onClick={handleClick}
    >
      {colorizeMahatriaInfinitheism(name)}
    </span>
  );
};