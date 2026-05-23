import React, { useState } from "react";
import styles from "./index.module.scss";
import { Button } from "../Button";

import closeIcon  from "../../../assets/images/closebtn.svg";
import { getItemInLocalStorage } from "../../../services/localStorage";
import { ApiService } from "../../../services/mockService";
import defaultSeeker from "../../../assets/images/default-profile.svg";

interface BlessCardProps {
  onClose: () => void;
  seekerName?: string;
  programRegId: number;
  programPreferences?:any;
  profileUrl?: string; 
}

const BlessCard: React.FC<BlessCardProps> = ({
  onClose,
  seekerName,
  programRegId,
  profileUrl,
  onBlessSuccess,
  programPreferences = [],
  subProgramsData = [],
}) => {
  
  const userId = getItemInLocalStorage("seekerDetails")?.id;

  const [selectedProgram, setSelectedProgram] = useState<number>(programPreferences[0]?.id || "");
 const handleBless = async (
  ) => {
  
    let payload = {
      allocatedProgramId: selectedProgram,
      registrationId: Number(programRegId),
      approvalStatus: "approved",
      approvalDate: new Date().toISOString(),
      approvedBy: userId,
      updatedBy: userId,
    };


    try {
    
      const response = await ApiService.blessUser(programRegId, payload);

      if (response.data.statusCode === 200) {
        if (onBlessSuccess) {
          onBlessSuccess();
        } else if (onClose) {
          onClose();
        }
      } else {
        alert(response.data.message || "Failed to bless user");
      }
    } catch (error) {
      console.error("Error blessing user:", error);
      alert("Failed to bless user. Please try again.");
    }
  };
  // If no program preferences are provided it means seekers choosed mahatria's choice. so we are showing all sub programs
  const programOptions = programPreferences.length === 0 ? subProgramsData : programPreferences; 

  const renderMessage = () => {
  if (programPreferences.length === 0) {
    return (
      <div className={styles.blessMessageContainer}>
        <span>
          <span >{seekerName}</span> has selected{" "}
          <span className={styles.mahatriaText}>Mahatria’s</span> choice.
        </span>
        <span>Bless with</span>
      </div>
    );
  }
  return (
    <>Choose a program to bless <span>{seekerName}</span></>
  );
};
  
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div
          className={styles.closeIcon}
          data-testid="custom-popup-close-icon-container"
        >
          <img
            src={closeIcon}
            alt="close"
            className={styles.closeIcon}
            onClick={onClose}
            data-testid="custom-popup-close-icon"
          />
        </div>
        <img
          src={profileUrl ? profileUrl : defaultSeeker}
          alt="avatar"
          className={styles.avatar}
          onError={(img) => {
            img.currentTarget.src = defaultSeeker;
          }}
        />
        <p className={styles.cardTitle}>{renderMessage()}</p>
        <div className={styles.programs}>
           {programOptions.map((p) => (
            <button
              key={p.id}
              className={`${styles.program} ${
                selectedProgram === p.id ? styles.active : ""
              }`}
              onClick={() => setSelectedProgram(p.id)}
              type="button"
            >
              {p.name}
            </button>
        ))}
        </div>
        <Button
          buttonClassName={styles.blessBtn}
          buttonTextClassName={styles.blessText}
          onClick={handleBless}
        >
          bless
        </Button>
      </div>
    </div>
  );
};

export default BlessCard;

