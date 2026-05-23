/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ChangeEvent, useEffect } from "react";
import styles from "./index.module.scss";
import closeIcon from "../../../assets/images/close-cross.svg";
import { Drawer } from "@mui/material";
import GrayLine from "../GrayLine";
import CustomCheckbox from "../CustomCheckBox";
import { Button } from "../Button";

// Define the structure of seekersSelected filters
interface seekersFilters{
    gender: string[];
    age: string[];
    registration: string[];
  }
  
interface seekerListFilterPopUpProps {
  onApplyClick: (selectedFilters: seekersFilters) => void;
  open: boolean;
  onClose: () => void;

  seekersFilters: seekersFilters; 
}

const SeekerListFilterPopUp: React.FC<seekerListFilterPopUpProps> = ({
  onApplyClick,
  onClose,
  seekersFilters, 
  open,
}) => {

const genders = ["Male", "Female"];
const ageGroups = ["18-25", "26-35", "36-45"];
const registrationsType = ["Video", "Non-video", "Downgraded"];

  const [checkedState, setCheckedState] =
    useState<seekersFilters>(seekersFilters);
  const [disable, setDisable] = useState(true);

  // Disable the apply button if no filters are selected
  useEffect(() => {
    const isAnyFilterSelected = Object.values(checkedState).some(
      (filterArray) => filterArray.length > 0,
    );
    setDisable(!isAnyFilterSelected); // Disable if no filters are selected
  }, [checkedState]);


  // Handle checkbox and radio button selection
  const handleChange =
    (filterType: keyof seekersFilters, value: string) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;

   
        const updatedValues = isChecked
          ? [...checkedState[filterType], value]
          : checkedState[filterType].filter((item) => item !== value);

        setCheckedState((prevState) => ({
          ...prevState,
          [filterType]: updatedValues,
        }));
      
    };

    // Apply selected filters
  const handleApplyClick = () => {
    onApplyClick(checkedState); // Now onApplyClick receives the correctly typed selected filters
  };

//   Clear all selected filters
  const handleClear = () => {
    setCheckedState({
      gender: [],
      age: [],
      registration: [],
    });
  };
  return (
    <Drawer open={open} onClose={onClose} anchor={"right"}>
    <div className={styles.container}>
      <div className={styles.filtersHeader}>
        <p className={styles.heading}>Filters</p>
        <GrayLine/>
        <img
          src={closeIcon}
          alt="close icon"
          onClick={onClose}
          className={styles.closeIcon}
        />
      </div>
      <div >
        <div className={styles.overAllLevelContainer}>
          <div className={styles.levelContainer}>
            <p className={styles.levelHeading}>Gender</p>
            <div className={styles.checkboxesContainer}>
              {genders?.map((gender) => (
                <CustomCheckbox
                key={gender}
                text={`${gender} (200)`}
                checked={checkedState.gender.includes(gender)}
                onChange={handleChange("gender", gender)}
              />
              ))}
            </div>
          </div>
          <div className={styles.levelContainer}>
            <p className={styles.levelHeading}>Age</p>
            <div className={styles.checkboxesContainer}>
              {ageGroups?.map((age) => (
                <CustomCheckbox
                  key={age}
                  text={age}
                  checked={checkedState.age.includes(age)}
                  onChange={handleChange("age", age)}
                />
              ))}
            </div>
          </div>
      
          <div className={styles.levelContainer}>
            <p className={styles.levelHeading}>Gender</p>
            <div className={styles.checkboxesContainer}>
              {registrationsType?.map((registration) => (
                <CustomCheckbox
                 key={registration}
                 text={registration}
                 checked={checkedState.registration.includes(registration)}
                 onChange={handleChange("registration", registration)}
               />
              
              ))}
            </div>
          </div>
        </div>
      </div>
      <GrayLine />
      <div className={styles.buttonsContainer}>
        {!disable && (
          <div onClick={handleClear} className={styles.buttonCancel}>
            reset
          </div>
        )}
        <Button
          onClick={handleApplyClick}
          buttonClassName={styles.buttonContainer}
          buttonTextClassName={styles.buttonContainerText}
          type="submit"
        >
          {" "}
          apply
        </Button>
      </div>
    </div>
    </Drawer>
  );
};

export default SeekerListFilterPopUp;
