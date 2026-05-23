import React from "react";
import styles from "./index.module.scss";

import NewSeeker from "../CreatingNewSeeker/index.tsx";
const NewSeekerPage = () => {
  return (
    <div
      className={styles.cardsWrapper}
      data-testids="newseeker-adding-session"
    >
      <div className={styles.cards}>
        <NewSeeker />
      </div>
    </div>
  );
};
export default NewSeekerPage;
