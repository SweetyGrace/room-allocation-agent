import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import closeIcon from "../../../assets/images/Close.svg"; // Importing Close.svg from assets
import { Button } from "../../../common/components/Button";
const CustomVenueModal = ({
  isOpen,
  onClose,
  // onAdd,
  title = "Adding a Custom Venue",
  message = "Enter the Venue Address",
  showInput = true,
  value = "", // new prop to receive the current value
  setValue: setParentValue, // new prop to update the parent value
}) => {
  const [venue, setVenue] = useState(value);

  // Sync local state with parent value when modal opens
  useEffect(() => {
    if (isOpen) {
      setVenue(value);
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.heading}>{title}</div>
          <div className={styles.headerLine}></div>
          <img
            src={closeIcon}
            className={styles.closeIcon}
            onClick={onClose}
            alt="Close"
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="venue">{message}</label>
          {showInput && (
            <input
              id="venue"
              type="text"
              placeholder="Eg: Leonia Holistic Destination, Hyderabad"
              className={styles.input}
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          )}
        </div>
        <div className={styles.bottomLine}></div>
        <div className={styles.Container}>
          <button className={styles.cancelText} onClick={onClose}>
            cancel
          </button>
          <Button
            type="button"
            buttonClassName={styles.buttonContainer}
            buttonTextClassName={styles.buttonText}
            datatestid="add-program-save-button"
            datatestidText="add-program-save"
            onClick={() => {
              if (showInput) {
                onAdd(venue);
                if (setParentValue) setParentValue(venue); // update parent field
                setVenue("");
              } else {
                onAdd();
              }
            }}
            disabled={showInput ? !venue.trim() : false}
          >
            {showInput ? "add" : "delete"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomVenueModal;

