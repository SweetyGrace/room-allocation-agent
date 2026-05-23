import React from "react";
import styles from "./index.module.scss";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <div className={styles.text}>
          {" "}
          Helpline:&nbsp;{" "}
          <a className={styles.mailLink} href="tel:+919841660000">
            +91-9841660000
          </a>{" "}
          &nbsp; (9:30 a.m. - 6:00 p.m. IST)
        </div>
        <div className={styles.textLine}>|</div>
        <div className={styles.text}>
          Email address:&nbsp;
          <a
            className={styles.mailLink}
            href="mailto:events@infinitheism.com?subject=Entrainment 24 - Query"
          >
            events@infinitheism.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
