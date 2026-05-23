import React, { ChangeEvent } from "react";
import Checkbox from "@mui/material/Checkbox";
import uncheckedIcon from "../../../assets/images/unchecked.svg";
import checkedIcon from "../../../assets/images/checked.svg";
import indeterminateIcon from "../../../assets/images/indeterminate.svg";
import styles from "./index.module.scss";
import { CheckboxWithTextProps } from "../../../types/roomAllocation";


const CustomCheckbox: React.FC<CheckboxWithTextProps> = ({
  text,
  checked,
  onChange,
}) => {
  return (
    <div className={styles.checkboxContainer}>
      <Checkbox
        icon={<img src={uncheckedIcon} alt="unchecked" loading="lazy" />}
        checkedIcon={<img src={checkedIcon} alt="checked" loading="lazy" />}
        indeterminateIcon={<img src={indeterminateIcon} alt="indeterminate" />}
        checked={checked}
        onChange={onChange}
        sx={{ padding: "0px !important" }}
      />
      <p className={styles.checkboxText}>{text}</p>
    </div>
  );
};

export default CustomCheckbox;
