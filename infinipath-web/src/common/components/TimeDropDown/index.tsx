import React, { useState, useRef, useEffect } from "react";
import styles from "./index.module.scss";
import { durations, times } from "../../../constants";
import { Button } from "../Button";
import {
  calculateEndTime,
  formattedTime,
} from "../../../utils/commonFunctions";
import clock from "../../../assets/images/clock.svg";

interface TimeDropdownProps {
  onTimeSelect?: (time: string) => void;
  onDurationSelect?: (duration: string) => void;
  getFormattedTime?: (time: string) => string;
  initialTime?: string;
  initialDuration?: string;
  errorExist?: boolean;
}

const TimeDropdown: React.FC<TimeDropdownProps> = ({
  onTimeSelect,
  onDurationSelect,
  getFormattedTime,
  initialTime,
  initialDuration,
  errorExist,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [selectedDuration, setSelectedDuration] = useState(initialDuration);
  const [selectedTimeStore, setSelectedTimeStore] = useState(initialTime);
  const [selectedDurationStore, setSelectedDurationStore] =
    useState(initialDuration);

  // Ref for dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ref for time buttons
  const timeButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>(
    {},
  );

  const durationsButtonRefs = useRef<{
    [key: string]: HTMLButtonElement | null;
  }>({});
  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      setIsOpen(!isOpen);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const scrollSmoothly = (container: HTMLElement, targetOffset: number) => {
        const currentScroll = container.scrollTop;
        const scrollStep = (targetOffset - currentScroll) / 10; // Divide the scroll distance into 10 steps
        let stepCount = 0;

        const scrollInterval = setInterval(() => {
          container.scrollTop += scrollStep;
          stepCount++;
          if (
            stepCount >= 10 ||
            Math.abs(container.scrollTop - targetOffset) < 1
          ) {
            clearInterval(scrollInterval);
            container.scrollTop = targetOffset; // Ensure it ends at the exact position
          }
        }, 20); // Adjust interval time (in ms) to control speed
      };

      // Smooth scroll for time options
      const timeContainer = dropdownRef.current?.querySelector(
        `.${styles.timeOptions}`,
      ) as HTMLElement;

      const timeButton = timeButtonRefs.current[selectedTime];
      if (timeContainer && timeButton) {
        const offsetTop = timeButton.offsetTop;
        scrollSmoothly(timeContainer, offsetTop - timeContainer.offsetTop);
      }

      // Smooth scroll for duration options
      const durationContainer = dropdownRef.current?.querySelector(
        `.${styles.durationOptions}`,
      ) as HTMLElement;

      const durationButton = durationsButtonRefs.current[selectedDuration];
      if (durationContainer && durationButton) {
        const offsetTop = durationButton.offsetTop;
        scrollSmoothly(
          durationContainer,
          offsetTop - durationContainer.offsetTop,
        );
      }
    }
  }, [isOpen, selectedTime, selectedDuration]);

  return (
    <div
      className={styles.dropdownContainer}
      ref={dropdownRef}
      data-testid="time-dropdown"
      onKeyDown={handleKeyDown}
    >
      <div
        className={errorExist ? styles.dropDownError : styles.dropdownTrigger}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        data-testid="dropdown-trigger"
      >
        {formattedTime(selectedTimeStore)} -{" "}
        {formattedTime(
          calculateEndTime(selectedTimeStore, selectedDurationStore),
        )}
        <div data-testid="set-date-timer" className={styles.dropdownIcon}>
          <div className={styles.seperator}></div>
          <img
            src={clock}
            alt="arrow-down"
            tabIndex={0}
            data-testId="set-date-timer-img"
          />
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdownContent} data-testid="dropdown-content">
          <div
            className={styles.selectionContainer}
            data-testid="selection-container"
          >
            <div className={styles.timeSection} data-testid="time-section">
              <div className={styles.label} data-testid="time-label">
                Start
              </div>
              <div className={styles.timeOptions} data-testid="time-options">
                {times.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={`${styles.timeButton} ${
                      selectedTime === time ? styles.selected : ""
                    }`}
                    onClick={() => {
                      setSelectedTime(time);
                      setSelectedDurationStore(selectedDurationStore);
                    }}
                    ref={(el) => (timeButtonRefs.current[time] = el)}
                    data-testid={`time-button-${time}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.lineseperator}></div>
            <div
              className={styles.durationSection}
              data-testid="duration-section"
            >
              <div className={styles.label} data-testid="duration-label">
                Duration
              </div>
              <div
                className={styles.durationOptions}
                data-testid="duration-options"
              >
                {durations.map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    className={`${styles.durationButton} ${
                      selectedDuration === duration ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedDuration(duration)}
                    ref={(el) => (durationsButtonRefs.current[duration] = el)}
                    data-testid={`duration-button-${duration}`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.grarLine}></div>
          <div className={styles.actions} data-testid="actions">
            <Button
              type="button"
              buttonClassName={styles.buttonClass}
              onClick={() => {
                setIsOpen(false);
                setSelectedTime(selectedTimeStore);
                setSelectedDuration(selectedDurationStore);
              }}
              datatestid="time-cancel-button"
              datatestidText="cancel-text"
            >
              cancel
            </Button>
            <Button
              buttonTextClassName={styles.buttonText}
              buttonClassName={styles.buttonContainer}
              onClick={() => {
                setSelectedTimeStore(selectedTime);
                setSelectedDurationStore(selectedDuration);
                getFormattedTime?.(
                  `${formattedTime(selectedTime)} - ${formattedTime(
                    calculateEndTime(selectedTime, selectedDuration),
                  )}`,
                );
                onTimeSelect?.(selectedTime);
                onDurationSelect?.(selectedDuration);
                setIsOpen(false);
              }}
              datatestid="time-apply-button"
              datatestidText="apply-text"
            >
              apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeDropdown;
