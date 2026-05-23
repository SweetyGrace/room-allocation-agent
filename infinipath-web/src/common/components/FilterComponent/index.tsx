import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import Select from "react-select";
import styles from "./index.module.scss";
import crossIcon from "../../../assets/images/text-cross-icon.svg";
import checkedIcon from "../../../assets/images/checked-checkbox.svg"; // Checked image
import uncheckedIcon from "../../../assets/images/unchecked-checkbox.svg"; // Unchecked image
import { AGE_FILTER_OPTIONS, ATTENDANCE_DETAILS_OPTIONS, ATTENDANCE_STATUS_OPTIONS, GENDER_FILTER_OPTIONS, JOIN_MODE_OPTIONS, MODAL_TITLES, PLATFORM_FILTER_OPTIONS, REGISTRATION_STATUS_OPTIONS, REGISTRATION_TYPE_OPTIONS, VERIFICATION_FILTER_OPTIONS } from "../../../constants";

// Filters interface
export interface Filters {
  selectedAge: string[];
  selectedRegistrationType: string[];
  selectedGender: string[];
  selectedPlatform: string[];
  selectedVerification: string[];
  selectedLocation: string[];
  selectedAttendanceStatus: string[];
  selectedAttendanceDetails: string[];
  selectedJoinMode: string[];
}

// Props remain the same
interface FilterModalProps {
  isOpen: boolean;
  handleClose: () => void;
  handleSubmit: (filters: Filters) => void;
  locationOptions: unknown[];
  initialFilters: Filters;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  handleClose,
  handleSubmit,
  locationOptions,
  initialFilters,
}) => {
  // Default filter values
  const defaultFilters: Filters = {
    selectedAge: [],
    selectedRegistrationType: [],
    selectedGender: [],
    selectedPlatform: [],
    selectedVerification: [],
    selectedLocation: [],
    selectedAttendanceStatus: [],
    selectedAttendanceDetails: [],
    selectedJoinMode: [],
  };

  const [filters, setFilters] = useState<Filters>(defaultFilters);

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters || defaultFilters); // Reset to default values when modal opens
    }
  }, [isOpen]);

  /**
   * Handles the change event for a checkbox input, updating the filters state accordingly.
   *
   * @param category - The key of the filter category being updated. It must be a key of the `Filters` type.
   * @param value - The value associated with the checkbox that was toggled.
   *
   * The function performs the following:
   * - Toggles the presence of the `value` in the array corresponding to the given `category` in the filters state.
   * - If the `category` is `selectedAttendanceStatus` and "Absent" or "Registered" is selected, 
   *   it clears the `selectedAttendanceDetails` array.
   * - If the `category` is `selectedAttendanceStatus` and "Attended" is deselected, 
   *   it also clears the `selectedAttendanceDetails` array.
   * - Updates the filters state with the new values.
   */
  const handleCheckboxChange = (category: keyof Filters, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value]; 
      // Clear attendance details if "Absent" is selected
      if (category === "selectedAttendanceStatus" && (newValues.includes("Absent") || newValues.includes("Registered"))) {
        return { ...prev, [category]: newValues, selectedAttendanceDetails: [] };
      }

      // Clear attendance details if "Attended" is deselected
      if (category === "selectedAttendanceStatus" && !newValues.includes("Attended")) {
        return { ...prev, [category]: newValues, selectedAttendanceDetails: [] };
      }
      return { ...prev, [category]: newValues };
    });
  };

  // Clear all filters
  const clearFilter = () => {
    setFilters(defaultFilters);
  };

  // Submit filters
  const onSubmit = () => {
    handleSubmit(filters);
    handleClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose} className={styles.modal}>
      <Paper className={styles.modalPaper}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <Typography variant="h6">Filter Options</Typography>
          <Button onClick={handleClose}>
            <img src={crossIcon} alt="close" />
          </Button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className={styles.modalContentScrollable}>
          {/* <Divider className={styles.divider}/> */}

          {/* Age Filter - Custom Checkboxes */}
          <div className={styles.section}>
            <Typography variant="subtitle1" className={styles.sectionTitle}>
              {MODAL_TITLES.AGE}
            </Typography>
            <div className={styles.checkboxGroup}>
              {AGE_FILTER_OPTIONS.map((age) => (
                <label key={age} className={styles.customCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.selectedAge.includes(age)}
                    onChange={() => handleCheckboxChange("selectedAge", age)}
                    className={styles.hiddenCheckbox}
                  />
                  <img
                    src={
                      filters.selectedAge.includes(age) ? checkedIcon : uncheckedIcon
                    }
                    alt={filters.selectedAge.includes(age) ? "Checked" : "Unchecked"}
                    className={styles.checkboxIcon}
                  />
                  <span>{age}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Registration Type - Custom Checkboxes */}
          <div className={styles.section}>
            <Typography variant="subtitle1" className={styles.sectionTitle}>
              {MODAL_TITLES.REGISTRATION_TYPE}
            </Typography>
            <div className={styles.checkboxGroup}>
              {REGISTRATION_TYPE_OPTIONS.map((type) => (
                <label key={type} className={styles.customCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.selectedRegistrationType.includes(type)}
                    onChange={() =>
                      handleCheckboxChange("selectedRegistrationType", type)
                    }
                    className={styles.hiddenCheckbox}
                  />
                  <img
                    src={
                      filters.selectedRegistrationType.includes(type)
                        ? checkedIcon
                        : uncheckedIcon
                    }
                    alt={
                      filters.selectedRegistrationType.includes(type)
                        ? "Checked"
                        : "Unchecked"
                    }
                    className={styles.checkboxIcon}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Registration status - Custom Checkboxes */}
          <div className={styles.section}>
            <Typography variant="subtitle1" className={styles.sectionTitle}>
              {MODAL_TITLES.REGISTRATION_STATUS}
            </Typography>
            <div className={styles.checkboxGroup}>
              {REGISTRATION_STATUS_OPTIONS.map((type) => (
                <label key={type} className={styles.customCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.selectedRegistrationType.includes(type)}
                    onChange={() =>
                      handleCheckboxChange("selectedRegistrationType", type)
                    }
                    className={styles.hiddenCheckbox}
                  />
                  <img
                    src={
                      filters.selectedRegistrationType.includes(type)
                        ? checkedIcon
                        : uncheckedIcon
                    }
                    alt={
                      filters.selectedRegistrationType.includes(type)
                        ? "Checked"
                        : "Unchecked"
                    }
                    className={styles.checkboxIcon}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Gender Filter - Custom Checkboxes */}
          <div className={styles.section}>
            <Typography variant="subtitle1" className={styles.sectionTitle}>
              {MODAL_TITLES.GENDER}
            </Typography>
            <div className={styles.checkboxGroup}>
              {GENDER_FILTER_OPTIONS.map((gender) => (
                <label key={gender} className={styles.customCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.selectedGender.includes(gender)}
                    onChange={() => handleCheckboxChange("selectedGender", gender)}
                    className={styles.hiddenCheckbox}
                  />
                  <img
                    src={
                      filters.selectedGender.includes(gender)
                        ? checkedIcon
                        : uncheckedIcon
                    }
                    alt={
                      filters.selectedGender.includes(gender)
                        ? "Checked"
                        : "Unchecked"
                    }
                    className={styles.checkboxIcon}
                  />
                  <span>{gender}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Platform Filter - Custom Checkboxes */}
          <div className={styles.section}>
            <Typography variant="subtitle1" className={styles.sectionTitle}>
              {MODAL_TITLES.PLATFORM}
            </Typography>
            <div className={styles.checkboxGroup}>
              {PLATFORM_FILTER_OPTIONS.map((platform) => (
                <label key={platform} className={styles.customCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.selectedPlatform.includes(platform)}
                    onChange={() =>
                      handleCheckboxChange("selectedPlatform", platform)
                    }
                    className={styles.hiddenCheckbox}
                  />
                  <img
                    src={
                      filters.selectedPlatform.includes(platform)
                        ? checkedIcon
                        : uncheckedIcon
                    }
                    alt={
                      filters.selectedPlatform.includes(platform)
                        ? "Checked"
                        : "Unchecked"
                    }
                    className={styles.checkboxIcon}
                  />
                  <span>{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Verification Filter - Custom Checkboxes */}
          <div className={styles.section}>
            <Typography variant="subtitle1" className={styles.sectionTitle}>
              {MODAL_TITLES.VERIFICATION}
            </Typography>
            <div className={styles.checkboxGroup}>
              {VERIFICATION_FILTER_OPTIONS.map((status) => (
                <label key={status} className={styles.customCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.selectedVerification.includes(status)}
                    onChange={() =>
                      handleCheckboxChange("selectedVerification", status)
                    }
                    className={styles.hiddenCheckbox}
                  />
                  <img
                    src={
                      filters.selectedVerification.includes(status)
                        ? checkedIcon
                        : uncheckedIcon
                    }
                    alt={
                      filters.selectedVerification.includes(status)
                        ? "Checked"
                        : "Unchecked"
                    }
                    className={styles.checkboxIcon}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Attendance Status - Custom Checkboxes */}
          <div className={styles.section}>
            <Typography variant="subtitle1" className={styles.sectionTitle}>
              {MODAL_TITLES.ATTENDANCE_STATUS}
            </Typography>
            <div className={styles.checkboxGroup}>
              {ATTENDANCE_STATUS_OPTIONS.map((status) => (
                <label key={status} className={styles.customCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.selectedAttendanceStatus.includes(status)}
                    onChange={() =>
                      handleCheckboxChange("selectedAttendanceStatus", status)
                    }
                    className={styles.hiddenCheckbox}
                  />
                  <img
                    src={
                      filters.selectedAttendanceStatus.includes(status)
                        ? checkedIcon
                        : uncheckedIcon
                    }
                    alt={
                      filters.selectedAttendanceStatus.includes(status)
                        ? "Checked"
                        : "Unchecked"
                    }
                    className={styles.checkboxIcon}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
            
          </div>
          {/* <div className={styles.section}> */}
          {filters.selectedAttendanceStatus.includes("Attended") && !filters.selectedAttendanceStatus.includes("Absent") && !filters.selectedAttendanceStatus.includes("Registered") && (
              <div className={styles.section + " " + styles.attendanceDetails}>
                <Typography variant="subtitle1" className={styles.sectionTitle}>{MODAL_TITLES.ATTENDANCE_DETAILS}</Typography>
                <div className={styles.checkboxGroup}>
                  {ATTENDANCE_DETAILS_OPTIONS.map((detail) => (
                    <label key={detail} className={styles.customCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.selectedAttendanceDetails.includes(detail)}
                        onChange={() =>
                          handleCheckboxChange("selectedAttendanceDetails", detail)
                        }
                        className={styles.hiddenCheckbox}
                      />
                      <img
                        src={
                          filters.selectedAttendanceDetails.includes(detail)
                            ? checkedIcon
                            : uncheckedIcon
                        }
                        alt={
                          filters.selectedAttendanceDetails.includes(detail)
                            ? "Checked"
                            : "Unchecked"
                        }
                        className={styles.checkboxIcon}
                      />
                      <span>{detail}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          {/* </div> */}
          {/* Join Mode - Custom Checkboxes */}
          <div className={styles.section}>
            <Typography variant="subtitle1" className={styles.sectionTitle}>
            {MODAL_TITLES.JOIN_MODE}
            </Typography>
            <div className={styles.checkboxGroup}>
              {JOIN_MODE_OPTIONS.map((mode) => (
                <label key={mode} className={styles.customCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.selectedJoinMode.includes(mode)}
                    onChange={() => handleCheckboxChange("selectedJoinMode", mode)}
                    className={styles.hiddenCheckbox}
                  />
                  <img
                    src={
                      filters.selectedJoinMode.includes(mode)
                        ? checkedIcon
                        : uncheckedIcon
                    }
                    alt={
                      filters.selectedJoinMode.includes(mode)
                        ? "Checked"
                        : "Unchecked"
                    }
                    className={styles.checkboxIcon}
                  />
                  <span>{mode}</span>
                </label>
              ))}
            </div>
          </div>
            
           {/* Location Filter - Multi-Select Dropdown */}
           <div className={styles.section}>
            <Typography variant="subtitle1" className={styles.sectionTitle}>
              {MODAL_TITLES.LOCATION}
            </Typography>
            <Select
              options={locationOptions}
              onChange={(val) => {
                const locationValues = val ? val.map((item: unknown) => item.value) : [];
                setFilters((prev) => ({ ...prev, selectedLocation: locationValues }));
              }}
              value={locationOptions.filter((option) =>
                filters.selectedLocation.includes(option.value)
              )}
              isMulti
              className={styles.select}
              classNamePrefix="filterSelect"
              menuPlacement="top"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  maxHeight: "100px", // Limit height to 3 lines
                  overflowY: "auto", // Enable internal scroll
                  borderColor: state.isFocused ? "#051b46" : provided.borderColor, // Blue outline on focus
                  boxShadow: state.isFocused ? "none" : provided.boxShadow, // Blue shadow on focus
                  "&:hover": {
                    borderColor: "#051b46", // Blue outline on hover
                  },
                }),
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: "transparent", // Transparent background
                  border: "1px solid #051b46", // Blue outline
                  borderRadius: "16px", // Rounded corners
                  padding: "0 6px", // Adjust padding for height
                  height: "20px", // Set height to 20px
                  display: "flex",
                  alignItems: "center", // Center content vertically
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: "#051b46", // Blue text
                  fontSize: "12px", // Adjust font size for better fit
                  lineHeight: "20px", // Match line height to height
                }),
                multiValueRemove: (provided) => ({
                  ...provided,
                  color: "#051b46", // Blue cross
                  height: "20px", // Match height
                  display: "flex",
                  alignItems: "center", // Center cross vertically
                  ":hover": {
                    backgroundColor: "transparent", // No background on hover
                    color: "#051b46", // Darker blue on hover
                  },
                }),
                menu: (provided) => ({
                  ...provided,
                  maxHeight: "290px", // Limit dropdown height
                  overflowY: "auto", // Enable scroll for dropdown
                }),
              }}
            />
          </div>
          {/* <Divider /> */}
        </div>

        {/* Modal Actions */}
        <div className={styles.actions}>
          <Button
            variant="text"
            onClick={clearFilter}
            className={styles.clearButton}
          >
            Clear
          </Button>
          <Button
            onClick={onSubmit}
            className={styles.applyButton}
          >
            Apply
          </Button>
        </div>
      </Paper>
    </Modal>
  );
};

export default FilterModal;