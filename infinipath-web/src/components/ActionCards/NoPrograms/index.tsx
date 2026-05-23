import React from "react";
import styles from "./index.module.scss";
import card from "../../../assets/images/no_program_cards.svg";
import { Button } from "../../../common/components/Button/index.tsx"; // Import Button

const NoPrograms = ({ onCreateProgram }) => (
  <div className={styles.noPrograms}>
    <div className={styles.noProgramsContent}>
      <img
        src={card}
        alt="No programs"
        className={styles.noProgramsImage}
      />
      <div className={styles.noProgramsText}>
        No programs available yet. Start by creating a program to view and manage it here.
      </div>
    </div>
    <div className={styles.noProgramsButtonWrapper}>
      <Button
        buttonClassName={styles.programsDashboardAddButton}
        onClick={onCreateProgram}
        datatestid="create-infinipath"
        datatestidText="create-infinipath-text"
      >
        create program
      </Button>
    </div>
  </div>
);

export default NoPrograms;
