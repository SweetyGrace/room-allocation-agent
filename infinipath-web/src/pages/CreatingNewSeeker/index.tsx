import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUpSchema } from "./signUpSchema";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import styles from "./index.module.scss";
import { Button } from "../../common/components/Button";
import Loader from "../../common/components/Loader";
import { Avatar } from "@mui/material";

import { useNavigate } from "react-router-dom";
import editPen from "../../assets/images/edit-pen.svg";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  removeSeekerProfile,
  setCountryCodestore,
  setEmail,
  setFirstName,
  setLastName,
  setPhoneNumberstore,
} from "../../reducers/SeekerReducer";
import RegisteredFaceId from "../../common/components/RegisteredFaceId";
import { handleFriendsAndFamilyUpdate } from "../../utils/addNewSeeker";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../Firebase.js";
import OtpComponent from "../../common/components/OtpFieldsComponent/index.tsx";
import {
  getItemInLocalStorage,
  removeItemInLocalStorage,
} from "../../services/localStorage.ts";
import { seekerExistanceCheck } from "../../utils/commonFunctions.ts";
import { RootState } from "../../store/index.ts";

interface IFormInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  terms: boolean;
  signIn: boolean;
  countryCode: string;
}

const NewSeeker = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    setFocus,
    watch,
    trigger,
  } = useForm<IFormInput>({
    resolver: yupResolver(signUpSchema),
    mode: "onSubmit",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryParams = new URLSearchParams(location.search);
  const friendsAndFamily = queryParams.get("friendsAndFamily");
  const [loader, setLoader] = useState(false);
  const seekerDetails =
    getItemInLocalStorage("seekerToAdd") ||
    useSelector((state: RootState) => state?.seekerReducer?.seekerProfile);
  const [phone, setPhone] = useState<string>(
    seekerDetails?.phone ? seekerDetails?.phone : "+91",
  );
  const [confirmationResult, setConfirmationResult] = useState<unknown>();
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countryCode, setCountryCode] = useState("");

  // Set form values based on seekerDetails in redux store
  useEffect(() => {
    setLoader(loader);
    if (seekerDetails) {
      setValue("firstName", seekerDetails?.firstName);
      setValue("lastName", seekerDetails?.lastName);
      setValue("email", seekerDetails?.email);
      setValue("phone", seekerDetails?.phone);
      setValue("faceId", seekerDetails?.registeredfaceId);
      setCountryCode(seekerDetails?.countryCode);
    }

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

  // Set focus to the first name input field
  useEffect(() => {
    setFocus("firstName");
  }, [setFocus]);

  // Handle update member api call response
  const handleUpdateSeeker = (status: boolean) => {
    if (status) {
      if (friendsAndFamily) {
        navigate("/infinipath/friendsandfamily");
      } else {
        navigate("/infinipath/joinwithothers");
      }
    } else {
      //else
    }
  };

  // Handle add user api call
  const handleAddUser = () => {
    setLoader(true);
    const phoneWithoutCountryCodeForSignup = phone?.slice(
      seekerDetails?.countryCode?.length,
    );
    /*sign user api call*/
    const signUpPayload = {
      phone_number: phoneWithoutCountryCodeForSignup,
      full_name: seekerDetails?.firstName + " " + seekerDetails?.lastName,
      first_name: seekerDetails?.firstName,
      last_name: seekerDetails?.lastName,
      app_type: "infinipath",
      email: seekerDetails?.email,
      face_url:
        seekerDetails?.registeredfaceId?.length > 0
          ? seekerDetails?.registeredfaceId
          : "",
      profile_url:
        seekerDetails?.profilePicture?.length > 0
          ? seekerDetails?.profilePicture
          : "",
      address: "",
      country_code: seekerDetails?.countryCode,
    };
    handleFriendsAndFamilyUpdate(signUpPayload, handleUpdateSeeker, setLoader);
  };

  // Handle form submission
  const onSubmit: SubmitHandler<IFormInput> = async () => {
    setLoader(true);
    const seekerCheck = await hanldeSeekerChecking();
    setLoader(false);

    const phoneNumberForOTP = phone?.startsWith("+") ? phone : `+${phone}`;
    if (!seekerCheck) {
      setLoader(true);
      onCaptchVerify(phoneNumberForOTP);
    }
  };

  //  update phone number in the store
  useEffect(() => {
    dispatch(setPhoneNumberstore(phone));
  }, [phone]);

  // Watch first name value and trigger validation
  const firstNameValue = watch("firstName");
  useEffect(() => {
    dispatch(setFirstName(firstNameValue));
    if (firstNameValue?.length > 30) {
      trigger("firstName");
    } else if (firstNameValue?.length > 3) {
      trigger("firstName");
    }
  }, [firstNameValue]);

  // Watch last name value and trigger validation
  const lastNameValue = watch("lastName");
  useEffect(() => {
    dispatch(setLastName(lastNameValue));
    if (lastNameValue?.length > 30) {
      trigger("lastName");
    } else if (lastNameValue?.length > 3) {
      trigger("lastName");
    }
  }, [lastNameValue]);

  // Watch email value and update in the store
  const emailValue = watch("email");
  useEffect(() => {
    dispatch(setEmail(emailValue));
  }, [emailValue]);

  // Handle OTP verification
  const verifyOTP = (pin: string) => {
    setLoader(true);
    confirmationResult
      .confirm(pin)
      ?.then(() => {
        setLoader(false);
        handleAddUser();
      })
      .catch((error) => {
        setLoader(false);
        setOtpError("Invalid OTP, please try again.");
      });
  };

  // Handle OTP sending
  const sendOtpHandler = (
    auth: unknown,
    phnNumber: string,
    recaptcha: unknown,
  ) => {
    signInWithPhoneNumber(auth, phnNumber, recaptcha)
      .then((confirmationResult) => {
        setConfirmationResult(confirmationResult);
        setIsOTPSent(true);
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

  // Handle Captcha verification
  const onCaptchVerify = async (phnNumber: string) => {
    setLoader(true);
    const phoneNumberForOTP = phnNumber?.startsWith("+")
      ? phnNumber
      : `+${phnNumber}`;
    try {
      const appVerifier = window.recaptchaVerifier;
      if (appVerifier) {
        sendOtpHandler(auth, phoneNumberForOTP, appVerifier);
      } else {
        console.error("reCAPTCHA verifier not initialized");
        setLoader(false);
      }
    } catch (error) {
      console.error("Error in onCaptchVerify:", error);
      setLoader(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    removeItemInLocalStorage("seekerToAdd");
    dispatch(removeSeekerProfile());
    //to navigateto friends and family when the query parameter is friendsAndFamily
    if (friendsAndFamily) {
      navigate("/infinipath/friendsandfamily");
    } else {
      navigate("/infinipath/joinwithothers");
    }
  };

  // checking seeker existence if the phone number already exists or not if exists then show the message
  const hanldeSeekerChecking = async () => {
    const formattedPhone = phone.slice(-10);
    try {
      const response = await seekerExistanceCheck(formattedPhone);
      if (
        response?.data?.statusCode === 200 &&
        response?.data?.data?.is_infipath &&
        response?.data?.data?.is_infipath_user_active
      ) {
        if (
          response?.data?.message?.includes("Successfully retrieved user data")
        ) {
          setPhoneNumberError("This phone number already exist");
          return true;
        } else {
          setPhoneNumberError("");
          return false;
        }
      } else {
        setPhoneNumberError("");
        return false;
      }
    } catch (error) {
      console.error("Error fetching seeker data:", error);
      setPhoneNumberError("Failed to check user existence. Please try again.");
    }
  };

  // Handle edit avatar button click
  const handleNavigate = () => {
    if (friendsAndFamily) {
      navigate("/verifyuserface?profilePicture=true&friendsAndFamily=true");
    } else {
      navigate("/verifyuserface?profilePicture=true&join_with_others=true");
    }
  };

  return (
    <div className={styles.signupPage} data-testid="signup-page">
      <div id="recaptcha-container" data-testid="recaptcha-container"></div>
      {!isOTPSent ? (
        <>
          <div className={styles.profileIconDiv} data-testid="profile-icon-div">
            <Avatar
              alt="Remy Sharp"
              src={
                seekerDetails?.profilePicture?.length > 0
                  ? `${seekerDetails?.profilePicture}?timestamp=${new Date().getTime()}` 
                  : defaultProfileIcon
              }
              sx={{
                width: 160,
                height: 160,
                border: "1px solid #DDDDDD",
              }}
              data-testid="profile-avatar"
            />
            <div
              className={styles.editDiv}
              onClick={() => handleNavigate()}
              data-testid="edit-avatar-button"
            >
              <img src={editPen} alt="edit" />
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles.formContainer}
            data-testid="signup-form"
          >
            <div className={styles.wrapInputs} data-testid="form-inputs">
              <div
                className={styles.labelInputOdd}
                data-testid="first-name-input"
              >
                <div
                  className={styles.labelText}
                  data-testid="first-name-label"
                >
                  First name*
                </div>
                <div className={styles.fieldBlock}>
                  <input
                    {...register("firstName")}
                    className={`${styles.inputFields} ${
                      errors.firstName ? styles.errorFields : ""
                    }`}
                    data-testid="first-name-field"
                  />
                </div>
                {errors.firstName && (
                  <i className={styles.error} data-testid="first-name-error">
                    {errors.firstName.message}
                  </i>
                )}
              </div>

              <div className={styles.labelInput} data-testid="last-name-input">
                <div className={styles.labelText} data-testid="last-name-label">
                  Last name*
                </div>
                <div className={styles.fieldBlock}>
                  <input
                    {...register("lastName")}
                    className={`${styles.inputFields} ${
                      errors.lastName ? styles.errorFields : ""
                    }`}
                    data-testid="last-name-field"
                  />
                </div>
                {errors.lastName && (
                  <i className={styles.error} data-testid="last-name-error">
                    {errors.lastName.message}
                  </i>
                )}
              </div>

              <div className={styles.labelInputOdd} data-testid="email-input">
                <div className={styles.labelText} data-testid="email-label">
                  Email address*
                </div>
                <div className={styles.fieldBlock}>
                  <input
                    {...register("email")}
                    className={`${styles.inputFields} ${
                      errors.email ? styles.errorFields : ""
                    }`}
                    data-testid="email-field"
                  />
                </div>
                {errors.email && (
                  <i className={styles.error} data-testid="email-error">
                    {errors.email.message}
                  </i>
                )}
              </div>

              <div className={styles.labelInput} data-testid="mobile-input">
                <div className={styles.labelText} data-testid="mobile-label">
                  Mobile*
                </div>
                <div className={styles.fieldBlock}>
                  <PhoneInput
                    country={"IN"}
                    value={phone}
                    onChange={(phone, country) => {
                      setCountryCode(country?.dialCode);
                      dispatch(setCountryCodestore(country?.dialCode));
                      setPhone(phone);
                      setValue("phone", phone);
                      clearErrors("phone"); // Clear the error once the user starts entering
                    }}
                    containerClass={styles.customContainer}
                    inputClass={`${styles.customInput} ${errors.phone ? styles.errorFieldPhone : ""}`}
                    buttonClass={styles.customButton}
                    dropdownClass={styles.customDropdown}
                    enableSearch={true}
                    disableSearchIcon={true}
                    countryCodeEditable={false}
                    data-testid="phone-input"
                  />
                </div>
                {errors.phone && !phoneNumberError && (
                  <i
                    className={styles.error}
                    style={{ textAlign: "right" }}
                    data-testid="phone-error"
                  >
                    {errors.phone.message}
                  </i>
                )}
                {phoneNumberError && !errors.phone && (
                  <i
                    className={styles.error}
                    style={{ textAlign: "right" }}
                    data-testid="phone-number-error"
                  >
                    {phoneNumberError}
                  </i>
                )}
                {/* {seekerExistMessage && (
                  <i
                    className={styles.error}
                    style={{ textAlign: "right" }}
                    data-testid="seeker-exist-message"
                  >
                    {seekerExistMessage}
                  </i>
                )} */}
              </div>
              <RegisteredFaceId
                registeredFaceId={seekerDetails?.registeredfaceId}
                errors={errors}
                friendsAndFamily={friendsAndFamily === "true" ? true : false}
                data-testid="registered-face-id"
              />
            </div>
            {!loader ? (
              <div className={styles.buttonsContent} data-testid="form-buttons">
                <Button
                  buttonTextClassName={styles.buttonText}
                  buttonClassName={styles.buttonContainer}
                  type="submit"
                  datatestid="add-button"
                  datatestidText="add-text"
                >
                  add
                </Button>
                <Button
                  buttonClassName={styles.buttonContainerSecondary}
                  buttonTextClassName={styles.buttonTextSecondary}
                  onClick={() => handleCancel()}
                  datatestid="cancel-button"
                  datatestidText="cancel-text"
                >
                  cancel
                </Button>
              </div>
            ) : (
              <Loader type="small" data-testid="form-loader" />
            )}
          </form>
        </>
      ) : (
        <div data-testid="otp-container">
          <OtpComponent
            otp={otp}
            setOtp={setOtp}
            verifyOTP={verifyOTP}
            setOtpError={setOtpError}
            otpError={otpError}
            phoneNumber={phone}
            countryCode={countryCode}
            onCaptchVerify={onCaptchVerify}
            phoneNumberError={phoneNumberError}
            loader={loader}
            data-testid="otp-component"
          />
        </div>
      )}
    </div>
  );
};
export default NewSeeker;
