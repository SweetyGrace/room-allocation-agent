import React from "react";
import styles from "./index.module.scss";

const TermsAndConditions: React.FC = () => {
  return (
    <div className={styles.termsContainer}>
      <div className={styles.content}>
        <p className={styles.paragraph}>
          <span className={styles.accessHeading}>
            With Video Access (Panelist):
          </span>{" "}
          Your video will be enabled and hence Mahatria will be able to see you.
        </p>
        <p className={styles.paragraph}>
          <span className={styles.accessHeading}>
            Without Video Access (Attendee):
          </span>{" "}
          Your video will NOT be enabled and hence Mahatria will NOT be able to
          see you. However, you will be able to see Mahatria on screen in both
          the given options.
        </p>
        <div>
          <h3 className={styles.subHeader}>infinipath Guidelines:</h3>
          <p className={styles.paragraph}>
            Attendance for infinipath is mandatory. Do join the session 15
            minutes earlier before the session time, i.e. @ 9:45 a.m. IST. There
            must be sanctity to presence and hence be appropriately dressed even
            if you are at home. To gain the maximum from the session, give your
            undivided attention. Avoid all external distractions including
            sipping on water/eating. infinitheism management reserves the right
            to deny entry and registration, without assigning any reason
            therefor. Any kind of disturbances or distractions will not be
            allowed during the sessions. If found disturbing or distracting, the
            individual(s) will be made to leave the session.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
