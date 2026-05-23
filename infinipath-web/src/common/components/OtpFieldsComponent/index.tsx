import React from "react";
import OtpFields from "../../../components/OtpFields";
import styles from "./index.module.scss";
import { Button } from "../Button";
import Loader from "../Loader";
import PhoneNumberMasking from "../PhonenumberMasking";

interface OtpComponentProps {
  otp: string;
  setOtp: (value: string) => void;
  verifyOTP: (otp: string) => void;
  setOtpError: (value: string) => void;
  otpError: string;
  phoneNumber: string;
  onCaptchVerify: (phnNumber: string) => void;
  phoneNumberError: string;
  loader?: boolean;
  countryCode?: string;
  selectedSeekerToAdd?: unknown;
}

const OtpComponent: React.FC<OtpComponentProps> = ({
  otp,
  setOtp,
  verifyOTP,
  setOtpError,
  otpError,
  phoneNumber,
  onCaptchVerify,
  phoneNumberError,
  countryCode,
  loader,
  selectedSeekerToAdd,
}) => {
  const verifyOTPEntered = (otp: string) => {
    if (otp?.length === 6) {
      setOtp(otp);
    } else {
      setOtp("");
    }
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    verifyOTP(otp);
  };

  const handleResendOTP = () => {
    const phoneNumberWithCountryCode = formatPhoneNumber(
      phoneNumber,
      countryCode,
    );
    onCaptchVerify(phoneNumberWithCountryCode);
  };

  const formatPhoneNumber = (phoneNumber: string, countryCode?: string) => {
    if (phoneNumber?.startsWith("+")) {
      return phoneNumber;
    } else if (phoneNumber?.startsWith(countryCode)) {
      return `+${phoneNumber}`;
    } else if (countryCode?.startsWith("+")) {
      return `${countryCode}${phoneNumber}`;
    } else {
      return `+${countryCode}${phoneNumber}`;
    }
  };

  return (
    <div className={styles.container} data-testid="otp-container">
      <span className={styles.titleOtp} data-testid="title-otp">
        Confirm OTP
      </span>
      <form
        onSubmit={handleSubmit}
        className={styles.OTPForm}
        data-testid="otp-form"
      >
        <div className={styles.OTPForm} data-testid="otp-form-inner">
          <div className={styles.caption} data-testid="otp-caption">
            <span>
              Enter the OTP sent to{" "}
              <span className={styles.phoneNumber} data-testid="phone-number">
                {/* {formatPhoneNumber(phoneNumber, countryCode)} */}
                {selectedSeekerToAdd?.countryCode?.startsWith("+")
                  ? selectedSeekerToAdd?.countryCode
                  : `+${selectedSeekerToAdd?.countryCode}`}{" "}
                <PhoneNumberMasking
                  phoneNumber={selectedSeekerToAdd?.phoneNumber}
                  className={styles?.phoneText}
                  data-testid={`search-modal-user-phone-${selectedSeekerToAdd?.id}`}
                />
              </span>
            </span>
          </div>
          <OtpFields
            onComplete={verifyOTPEntered}
            setOtpError={setOtpError}
            className={styles.otpContainer}
            data-testid="otp-fields"
          />
          {otpError && (
            <div className={styles.error} data-testid="otp-error">
              {otpError}
            </div>
          )}
          {loader ? (
            <Loader type="small" data-testid="loader" />
          ) : (
            <>
              <div
                className={styles.buttonContainer}
                data-testid="button-container"
              >
                <Button
                  buttonClassName={styles.buttonText}
                  type="submit"
                  onClick={() => verifyOTP(otp)}
                  datatestid="verify-button"
                  datatestidText="verify"
                >
                  verify
                </Button>
              </div>
              <div className={styles.caption} data-testid="resend-caption">
                Didn{"'"}t receive an OTP?{" "}
                <span
                  className={styles.changeMobileNumber}
                  onClick={() => handleResendOTP()}
                  data-testid="resend-link"
                >
                  Resend
                </span>
              </div>
              {phoneNumberError && (
                <div
                  className={styles.errorResend}
                  data-testid="phone-number-error"
                >
                  {phoneNumberError}
                </div>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default OtpComponent;
