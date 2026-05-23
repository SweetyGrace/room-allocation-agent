import React, { useState, useEffect, useRef } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import styles from "./index.module.scss";
import { Button } from "../Button/index.tsx";
import Loader from "../Loader/index.tsx";
import { Avatar, Tooltip } from "@mui/material";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import PhoneNumberMasking from "../PhonenumberMasking";

interface PhoneInputComponentProps {
  setIsOTPEntered?: (value: boolean) => void;
  setPhoneNumberError?: string;
  onCaptchVerify?: (phnNumber: string) => void;
  setCountryCode?: (value: string) => void;
  countryCode?: string;
  seekerPhoneNumber?: string;
  setPhoneNumber?: (value: string) => void;
  setLoader?: (value: boolean) => void;
  loader?: boolean;
  selectedSeekerToAdd?: unknown;
}

const PhoneInputComponent: React.FC<PhoneInputComponentProps> = ({
  setPhoneNumberError,
  onCaptchVerify,
  setCountryCode,
  setLoader,
  seekerPhoneNumber,
  loader,
  selectedSeekerToAdd,
}) => {
  const [phone, setPhone] = useState<string>(seekerPhoneNumber || "");
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Update phone state if seekerPhoneNumber prop changes
    setPhone(seekerPhoneNumber);
  }, [seekerPhoneNumber]);

  // Handles the process of getting an OTP (One Time Password) for the provided phone number.
  const handleGetOTP = () => {
    onCaptchVerify(seekerPhoneNumber);
    setLoader(true);
  };

  // Handle form submission on Enter key press
  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleGetOTP();
    }
  };
  return (
    <form
      className={styles.container}
      onKeyDown={handleKeyDown}
      data-testid="mobile-number-form"
    >
      <div className={styles.userItem} data-testid="user-item">
        <Avatar
          alt="Remy Sharp"
          src={
            selectedSeekerToAdd?.profileUrl &&
            selectedSeekerToAdd?.profileUrl?.length > 0
              ? `${selectedSeekerToAdd?.profileUrl}?timestamp=${new Date().getTime()}`
              : defaultProfileIcon
          }
          sx={{
            width: 130,
            height: 130,
            border: "1px solid #fffff",
          }}
          data-testid="user-avatar"
        />
        <div className={styles.userDetails} data-testid="user-details">
          {selectedSeekerToAdd?.fullName &&
          selectedSeekerToAdd?.fullName?.length > 30 ? (
            <Tooltip
              title={selectedSeekerToAdd?.fullName}
              arrow
              placement="top"
            >
              <span>
                {selectedSeekerToAdd?.fullName?.slice(0, 30)}
                {"..."}
              </span>
            </Tooltip>
          ) : (
            selectedSeekerToAdd?.fullName
          )}
          <p className={styles?.phoneText} data-testid="user-phone">
            {selectedSeekerToAdd?.countryCode?.startsWith("+")
              ? selectedSeekerToAdd?.countryCode
              : `+${selectedSeekerToAdd?.countryCode}`}{" "}
            <PhoneNumberMasking
              phoneNumber={selectedSeekerToAdd?.phoneNumber}
              className={styles?.phoneText}
              data-testid={`search-modal-user-phone-${selectedSeekerToAdd?.id}`}
            />
          </p>
        </div>
      </div>
      <div className={styles.labelInput} data-testid="label-input">
        <div className={styles.labelText} data-testid="label-text">
          Mobile number*
        </div>
        <div className={styles.fieldBlock} data-testid="phone-input-container">
          <PhoneInput
            country={"in"}
            value={phone}
            onChange={(phone: string, country: unknown) => {
              setCountryCode(country?.dialCode);
              setPhone(phone);
            }}
            containerClass={styles.loginCustomContainer}
            inputClass={`${styles.loginCustomInput} `}
            buttonClass={`${styles.loginCustomButton} ${styles.disabledButton}`}
            dropdownClass={styles.loginCustomDropdown}
            enableSearch={true}
            disableSearchIcon={true}
            countryCodeEditable={false}
            inputProps={{
              readOnly: true, // Prevent editing
              ref: phoneInputRef,
            }}
            data-testid="phone-input"
          />
        </div>
        {setPhoneNumberError !== "" && (
          <p className={styles.error} data-testid="phone-error">
            {setPhoneNumberError}
          </p>
        )}
      </div>
      {loader ? (
        <Loader type="small" data-testid="loader" />
      ) : (
        <div className={styles.buttonContainer} data-testid="button-container">
          <Button
            buttonClassName={styles.buttonText}
            type="button"
            onClick={handleGetOTP}
            datatestid="get-otp-button"
            datatestidText="get-otp"
          >
            send OTP
          </Button>
          {setPhoneNumberError !== "" && (
            <p className={styles.error} data-testid="phone-error">
              {setPhoneNumberError}
            </p>
          )}
        </div>
      )}
    </form>
  );
};

export default PhoneInputComponent;
