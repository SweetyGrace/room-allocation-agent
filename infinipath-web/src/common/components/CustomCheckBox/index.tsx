import React, { ChangeEvent } from "react";
import Checkbox from "@mui/material/Checkbox";
import uncheckedIcon from "../../../assets/images/unchecked-checkbox.svg";
import checkedIcon from "../../../assets/images/checked-checkbox.svg";
import indeterminateIcon from "../../../assets/images/indeterminate.svg";
import styles from "./index.module.scss";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";

interface CheckboxWithTextProps {
  text: string;
  checked: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  diffStyles?: boolean;
  colorDot?: string;
  disable?: boolean;
  disableWithDate?: boolean
}
const CustomCheckbox: React.FC<CheckboxWithTextProps> = ({
  text,
  checked,
  onChange,
  diffStyles,
  colorDot,
  disable,
  disableWithDate
}) => {
  const isDisable = disable || disableWithDate;
  return (
    <div
      className={`
        ${diffStyles ? styles.checkBoxWithoutWidth : styles.checkboxContainer}
        ${isDisable ? styles.cursorNotAllowed : ""}
      `.trim()}
    >
      <Checkbox
        icon={
          <img
            src={uncheckedIcon}
            alt="unchecked"
            loading="lazy"
            className={isDisable ? styles.disabledIcon : ""}
          />
        }
        checkedIcon={
          <img
            src={checkedIcon}
            alt="checked"
            loading="lazy"
            className = {isDisable ? styles.disabledIcon : ""}
          />
        }
        indeterminateIcon={
          <img
            src={indeterminateIcon}
            alt="indeterminate"
            className = {isDisable ? styles.disabledIcon : ""}
          />
        }
        checked={checked}
        onChange={onChange}
        disabled={disable || disableWithDate}
        sx={{
          padding: "0px !important",
          cursor: disable ? "not-allowed" : "pointer",
          ...(disable && {
            backgroundColor: "rgb(215, 215, 215)",
            borderRadius: "4px",
            "& .MuiSvgIcon-root": {
              backgroundColor: "rgb(215, 215, 215)",
              borderRadius: "4px",
            },
          }),
        }}
      />

      {colorDot && checked && (
        <span
          className={styles.colorDot}
          style={{ backgroundColor: colorDot }}
        ></span>
      )}
      <span className={styles.checkboxTextWrapper}>
        <p
          className={`${styles.checkboxText} ${
            disable && !disableWithDate
              ? styles.checkboxTextDisabled
              : disableWithDate
                ? styles.checkboxTextOrange
                : ""
          }`}
          onClick={(e) => {
            if (disable || disableWithDate) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            if (onChange) {
              onChange(e as any);
            }
          }}
        >
          {colorizeMahatriaInfinitheism(text)}
        </p>
      </span>
    </div>
  );
};

export default CustomCheckbox;
