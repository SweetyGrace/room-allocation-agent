import React from "react";
import styles from "./index.module.scss";

export interface iButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode | string;
  buttonTextClassName?: string;
  buttonClassName?: string;
  type?: "button" | "submit" | "reset";
  disable?: boolean;
  isNonActive?: boolean;
  datatestid?: string;
  datatestidText?: string;
  lessPadding?: boolean;
}

export const Button: React.FC<iButtonProps> = ({
  onClick,
  children,
  buttonClassName,
  buttonTextClassName,
  type,
  disable,
  isNonActive,
  datatestid,
  datatestidText,
  lessPadding
}) => {
  return (
    <button
      className={`${buttonClassName} ${disable === true ? styles.disableButton : isNonActive ? styles.nonActiveButton : lessPadding? styles.lessPadding : styles.button}`}
      onClick={onClick}
      type={type || "button"}
      disabled={disable}
      data-testid={datatestid}
    >
      <span
        className={buttonTextClassName || ""}
        data-testid={datatestidText}
      >
        {children}
      </span>
    </button>
  );
};
