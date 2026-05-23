import React, { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../Firebase.js";
import PhoneInputComponent from "../../common/components/PhoneInputComponent";
import OtpComponent from "../../common/components/OtpFieldsComponent";
import styles from "./index.module.scss";
import EmailVerifyComponent from "../../common/components/EmailVerifyComponent";
import { useLocation } from "react-router-dom";
import { getCall } from "../../services/apiService";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import { setNonInfinipathSeeker } from "../../reducers/SeekerReducer";
import { useDispatch, useSelector } from "react-redux";
import { getItemInLocalStorage } from "../../services/localStorage";
import { RootState } from "../../store/index.js";

const VerifySeekerPhoneNumber = () => {
  const dispatch = useDispatch();
  const [isOTPEntered, setIsOTPEntered] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [loader, setLoader] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<unknown>();
  const [otp, setOtp] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const location = useLocation();
  const seekerPhoneNumber = location.state?.phoneNumber;
  const seekerCountryCode = location.state?.countryCode;
  const seekerDetails = useSelector(
    (state: RootState) => state?.seekerReducer?.seekerProfile || null,
  );
  const selectedSeekerToAdd =
    getItemInLocalStorage("selectedFriendOrFamily") ||
    getItemInLocalStorage("selectedSeekerDetails");

  useEffect(() => {
    setCountryCode(seekerCountryCode || selectedSeekerToAdd?.countryCode);
    setPhoneNumber(seekerPhoneNumber || selectedSeekerToAdd?.phoneNumber);
    if (seekerDetails?.phone?.length > 0) {
      setOtpVerified(true);
    }
  }, []);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
          },
        },
      );
    }
    return () => {
      window.recaptchaVerifier = null;
    };
  }, []);

  const getUserDetails = () => {

    setLoader(true);
    getCall(`${endPoints.users}/${selectedSeekerToAdd?.id}?appType=infinipath`, undefined, INFINIPATH)
      .then((res) => {
        if (res?.data?.statusCode === 200) {
          setOtpVerified(true);
          dispatch(setNonInfinipathSeeker(res?.data?.data));
        } else {
          console.error(
            res?.data?.message,
            "Failed to fetch user details, please try again",
          );
        }
      })
      .catch((err) => {
        console.error(err, "Error in getUserDetails");
      })
      .finally(() => {
        setLoader(false);
      });
  };

  const verifyOTP = async (pin: string) => {
    setLoader(true);
    try {
      const result = await confirmationResult.confirm(pin);
      if (result) {
        setLoader(false);
        getUserDetails();
      }
    } catch (error) {
      setLoader(false);
      setOtpError("Invalid OTP, please try again.");
    }
  };

  const sendOtpHandler = (
    auth: unknown,
    phnNumber: string,
    recaptcha: unknown,
  ) => {
    setLoader(true);
    signInWithPhoneNumber(auth, phnNumber, recaptcha)
      .then((confirmationResult) => {
        setConfirmationResult(confirmationResult);
        setIsOTPEntered(true);
        setLoader(false);
      })
      .catch((error) => {
        setLoader(false);
        if (error.message?.includes("too", "many")) {
          setPhoneNumberError("Too many requests, please try again later");
        } else {
          setPhoneNumberError("Failed to send the OTP, please try again later");
        }
      });
  };

  const onCaptchVerify = async (phnNumber: string) => {
    try {
      const appVerifier = window.recaptchaVerifier;
      if (appVerifier) {
        sendOtpHandler(auth, phnNumber, appVerifier);
      } else {
        console.error("reCAPTCHA verifier not initialized");
        setLoader(false);
      }
    } catch (error) {
      console.error("Error in onCaptchVerify:", error);
      setLoader(false);
    }
  };

  const formateSeekerPhoneNumber = phoneNumber?.startsWith(
    countryCode?.toString(),
  )
    ? phoneNumber
    : `${countryCode}${phoneNumber}`;

  return (
    <div className={styles.verifyContent} data-testid="verify-content">
      <div id="recaptcha-container" data-testid="recaptcha-container"></div>

      {!isOTPEntered && !otpVerified ? (
        <PhoneInputComponent
          setLoader={setLoader}
          setIsOTPEntered={setIsOTPEntered}
          setPhoneNumberError={phoneNumberError}
          onCaptchVerify={onCaptchVerify}
          countryCode={countryCode}
          seekerPhoneNumber={formateSeekerPhoneNumber}
          setCountryCode={setCountryCode}
          setPhoneNumber={setPhoneNumber}
          data-testid="phone-input-component"
          loader={loader}
          selectedSeekerToAdd={selectedSeekerToAdd}
        />
      ) : isOTPEntered && !otpVerified ? (
        <OtpComponent
          otp={otp}
          setOtp={setOtp}
          verifyOTP={verifyOTP}
          setOtpError={setOtpError}
          otpError={otpError}
          phoneNumber={phoneNumber}
          countryCode={countryCode}
          onCaptchVerify={onCaptchVerify}
          phoneNumberError={phoneNumberError}
          setIsOTPEntered={setIsOTPEntered}
          data-testid="otp-component"
          loader={loader}
          selectedSeekerToAdd={selectedSeekerToAdd}
        />
      ) : (
        otpVerified && (
          <EmailVerifyComponent
            seekerDetails={seekerDetails}
            setLoader={setLoader}
            data-testid="email-verify-component"
            loader={loader}
          />
        )
      )}
    </div>
  );
};

export default VerifySeekerPhoneNumber;
