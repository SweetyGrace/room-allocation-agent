import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../common/components/Button";
import styles from "./index.module.scss";
import { useForm } from "react-hook-form";
import {
  getCall,
  getCallHDBWithoutAuth,
  postCall,
} from "../../services/apiService";
import signInImage from "../../assets/images/signin-img.svg";
import signUpImage from "../../assets/images/sign-up.svg";
import {
  getItemInLocalStorage,
  setItemInLocalStorage,
} from "../../services/localStorage";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import OtpFields from "../../components/OtpFields";
import Loader from "../../common/components/Loader";
import Signup from "../Signup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { auth } from "../../Firebase.js";
import { selectActiveRole } from "../../utils/roleUtils";
import { ROLE_STORAGE_KEYS } from "../../constants/roleConstants";
import { endPoints, INFINIPATH, PORTAL } from "../../constants/urlConstants";
import { addSeekerData } from "../../reducers/SeekerReducer.ts";
import { useDispatch } from "react-redux";
import faceLoginIcon from "../../assets/images/face-verify-icon3.svg";
import GrayLine from "../../common/components/GrayLine/index.tsx";
import { formatDateToISOString } from "../../utils/addNewSeeker.ts";
import { filterProgramsByTypeStatus, modifyProfileUrl } from "../../utils/commonFunctions.ts";
import {
  USER_ROLE_MAHATRIA,
  API_LIMIT_100,
  textConstant,
  USER_ROLE_SHOBA,
} from "../../constants/textConstants";
import {
  errorMessages,
  LOGIN_TEXT,
  textConstants,
} from "../../constants/index.ts";
import { login, validateOtp } from "../../services/nativeAuth.ts";
import { hasPermission } from "../../utils/roleBasedAccess";
import { Snackbar } from "@mui/material";
import alertIcon from "../../assets/images/alert-icon.svg";

const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedInUserData = getItemInLocalStorage("seekerDetails") || null;
  const [isOTPEntered, setIsOTPEntered] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpErrorWithAttempts, setOtpErrorWithAttempts] = useState("");
  const [loader, setLoader] = useState(false);
  const [disableButtons, setDisableButtons] = useState({
    verifyOTP: true,
  });
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3); // Total attempts: 3
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<unknown>();
  const [otp, setOtp] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [signUpData, setSignUpData] = useState<unknown>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const [signInWithFace, setSignInWithFace] = useState(true);
  const skipFaceVerify = new URLSearchParams(window.location.search).get(
    "skipFaceVerify",
  );
  const [addFaceUrl, setAddFaceUrl] = useState(false);
  const [phoneNumberWithoutCountryCode, setPhoneNumberWithoutCountryCode] =
    useState("");
  const [userIdFromValidateAPI, setUserIdFromValidateAPI] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const [resendTrigger, setResendTrigger] = useState(0);
  const [timer, setTimer] = useState<number>(0);
  interface getUserPayload {
    phone_number: string;
    app_type: string;
  }

  interface formData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    terms?: boolean;
  }

  useEffect(() => {
    if (skipFaceVerify) {
      setSignInWithFace(false);
    }
  }, [skipFaceVerify]);
  useEffect(() => {
    if (isOTPEntered || resendTrigger > 0) {
      setTimer(45); // Set the timer to 45 seconds
      setIsResendEnabled(false); // Disable the resend button initially
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(interval); // Clear the interval when timer reaches 0
            setIsResendEnabled(true); // Enable the resend button
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(interval); // Cleanup the interval on unmount
    }
  }, [isOTPEntered, resendTrigger]);

  const handleResendOtp = () => {
    resendOtp(getValues("phone") || "");
    setResendTrigger((prev) => prev + 1);
    setLoader(true); // Show loader while resending OTP
    resetAttempts();
  };

  useEffect(() => {
    if (loggedInUserData !== null) {
      // navigate("/admin/action-cards");
      redirectAfterLogin();
    }
    setSignInWithFace(false);

    // Automatically focus the mobile input field when the component mounts
    if (mobileInputRef.current) {
      mobileInputRef.current.focus();
    }

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
        },
      );
    }
    return () => {
      window.recaptchaVerifier = null;
    };
  }, []);
  const redirectAfterLogin = async () => {
    // Fetch programs
     setLoader(true);
    const response = await getCall(
      `${endPoints.program}?limit=${API_LIMIT_100}`,
      undefined,
      PORTAL
    );
    if (response?.data?.data?.data) {
      const extractedPrograms = Array.isArray(response.data.data.data)
        ? response.data.data.data
        : [];
      // If mahatria and only one program, redirect to hdb-dashboard
      const seekerDetails = getItemInLocalStorage("seekerDetails");
      const userRole = seekerDetails?.role || "";
      const filteredPrograms = filterProgramsByTypeStatus(extractedPrograms, {
                  type: "PT_HDBMSD",
                  status: "published",
                },false);
      if (filteredPrograms.length === 1 && !hasPermission(userRole, "ADD_PROGRAM", "C")) {
        setLoader(false);
        navigate(`/admin/hdb-dashboard/${filteredPrograms[0].id}`);
      } else {
        setLoader(false);
        navigate("/admin/action-cards");
      }
    } else {
      setLoader(false);
      navigate("/admin/action-cards");
    }
  };

  const schema = yup.object().shape({
    phone: yup.string().when([], {
      is: () => isMobileNumber, // Only required when mobile number is selected
      then: (schema) =>
        schema
          .required(`${errorMessages?.phoneRequired}`)
          .test(
            "is-valid-phone",
            `${errorMessages?.phoneRequired}`,
            (value) => {
              if (value === countryCode) return true;
              const phoneNumber = parsePhoneNumberFromString(`+${value}`);
              return phoneNumber ? phoneNumber.isValid() : false;
            },
          )
          .test(
            "is-valid-phone",
            `${errorMessages?.phoneRequired}`,
            (value) => {
              if (value === countryCode) return false;
              else return true;
            },
          ),
      otherwise: (schema) => schema.notRequired(), // Not required when email is selected
    }),

    email: yup.string().when([], {
      is: () => !isMobileNumber, // Only required when email is selected
      then: (schema) =>
        schema
          .email(`${errorMessages?.invalidEmail}`)
          .required(`${errorMessages?.emailRequired}`),
      otherwise: (schema) => schema.notRequired(), // Not required when phone is selected
    }),
  });

  const {
    handleSubmit,
    formState: { errors },
    clearErrors,
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [isMobileNumber, setIsMobileNumber] = useState(true);
  const verifyOTP = async (pin: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const navigateToPhoneInput = abortControllerRef.current.signal;

    setLoader(true);

    try {
      let payload;

      if (isMobileNumber) {
        // Phone OTP verification payload
        payload = {
          loginType: "phone",
          phoneNumber: phoneNumberWithoutCountryCode,
          countryCode: countryCode.startsWith("+")
            ? countryCode
            : `+${countryCode}`,
          otp: pin,
        };
      } else {
        // Email OTP verification payload
        payload = {
          loginType: "email",
          email: getValues("email"), // Get email from form
          otp: pin,
        };
      }

      const res = await validateOtp(payload);

      if (navigateToPhoneInput.aborted) {
        return;
      }
      if (res?.data?.statusCode === 200 || res?.data?.statusCode === 201) {
        const data = res?.data?.data || {};
        if (data.token) setItemInLocalStorage("idToken", data.token);
        if (data.userId) setItemInLocalStorage("localId", data.userId);
       
        const dataReq = data?.user;
        
        // Handle roles from API response
        const rolesFromAPI = data?.roles || [];
        let role = null;
        
        if (rolesFromAPI.length > 0) {
          // Select active role based on priority (excluding ROLE_VIEWER)
          role = selectActiveRole(rolesFromAPI);
          
          // If no role selected (all roles excluded), fallback to first available role
          if (!role && rolesFromAPI.length > 0) {
            role = rolesFromAPI[0];
            console.warn("All roles excluded from auto-selection, using first available role as fallback");
          }
          
          if (role) {
            
            // Store role information in localStorage (setItemInLocalStorage handles JSON serialization)
            setItemInLocalStorage(ROLE_STORAGE_KEYS.USER_ROLE, role);
            setItemInLocalStorage(ROLE_STORAGE_KEYS.ROLE_KEY, role.role_key);
            setItemInLocalStorage(ROLE_STORAGE_KEYS.AVAILABLE_ROLES, rolesFromAPI);
            
            // Update user object with role name for backward compatibility
            // API sends name as lowercase without prefix (e.g., "mahatria")
            dataReq.role = role.name;
          }
        }
        
        resetAttempts();
        setLoader(false);
        dispatch(addSeekerData(dataReq));
        setItemInLocalStorage("seekerDetails", dataReq);
        setPhoneNumberError("");
        setItemInLocalStorage("loggedIn", "yes");
        
        const userRole = dataReq.role || "";
 
        if (userRole == USER_ROLE_MAHATRIA || userRole == USER_ROLE_SHOBA ) {
          localStorage.setItem("hdb_active_tab", textConstant.SEAT_ALLOCATIONS);
        } else {
          localStorage.setItem("hdb_active_tab", textConstant.DASHBOARD);
        }
        // navigate("/admin/action-cards");

        redirectAfterLogin();
      } else {
        handleFailedAttempt();
        setLoader(false);
        setDisableButtons({ verifyOTP: true });
      }
    } catch (error) {
      const errorMessage = error?.message?.toLowerCase() || "";

      if (error.name === "AbortError") {
      } else if (
        errorMessage.includes(
          textConstants.invalidCodeFirebaseText?.toLowerCase(),
        )
      ) {
        handleFailedAttempt();
      } else if (
        errorMessage.includes(
          textConstants.sessionExpiredFirebaseText?.toLowerCase(),
        )
      ) {
        setOtpError(textConstants.sessionCodeText);
      } else if (errorMessage.includes(textConstants.code39?.toLowerCase())) {
        setOtpError(textConstants.code39Text);
      } else {
        setOtpError("An error occurred. Please try again.");
      }
      setLoader(false);
    }
  };

  const handleSnackbarClose = () => {
    editLoginForm();
    setPhone("+91");
    setValue("phone", "");
    setValue("email", "");
    resetAttempts();
  };
  const handleFailedAttempt = () => {
    // Calculate new remaining attempts
    const newRemainingAttempts = remainingAttempts - 1;
    if (newRemainingAttempts > 0) {
      setRemainingAttempts(newRemainingAttempts);
      setOtpError(textConstants.invalidCodeText);
      setOtpErrorWithAttempts(
        `You have ${newRemainingAttempts} attempt${newRemainingAttempts === 1 ? "" : "s"} left.`,
      );
    } else {
      // No attempts left
      setRemainingAttempts(0);
      setOtpError("");
      handleSnackbarClose();

      setShowSnackbar(true);
      // Don't set loader to true here as it will be handled by snackbar close
    }
  };

  const resetAttempts = () => {
    setRemainingAttempts(3);
    setOtpError("");
    setShowSnackbar(false);
    setLoader(false);
  };

  const sendOtpHandler = async (phoneNumber?: string, email?: string) => {
    setSignInWithFace(false);
    resetAttempts();

    let payload;
    setLoader(true);
    if (phoneNumber) {
      //add condition for phone number
      // Phone OTP payload
      payload = {
        loginType: "phone",
        phoneNumber: phoneNumber,
        countryCode: countryCode.startsWith("+")
          ? countryCode
          : `+${countryCode}`,
      };
    } else if (email) {
      // Email OTP payload
      payload = {
        loginType: "email",
        email: email,
      };
    } else {
      setPhoneNumberError("Invalid input data");
      setLoader(false);
      return;
    }

    try {
      const res = await login(payload);
      if (res?.data?.statusCode === 200 || res?.data?.statusCode === 201) {
        setSignIn(!signIn);
        setIsOTPEntered(true);
        // setResetOtp(true);
        setOtpError("");
      } else {
        setPhoneNumberError(LOGIN_TEXT.ERRORS.SEND_OTP);
      }
    } catch (error) {
      setPhoneNumberError(LOGIN_TEXT.ERRORS.SEND_OTP);
    } finally {
      setLoader(false);
      setSignIn(false);
    }
  };

  /**
   * @description: This function is used to verify the captcha and call send otp handler
   * @param phnNumber
   */
  const onCaptchVerify = async (phnNumber: string) => {
    try {
      const appVerifier = window.recaptchaVerifier;
      if (appVerifier) {
        sendOtpHandler(phnNumber, appVerifier);
      } else {
        console.error("reCAPTCHA verifier not initialized");
        setLoader(false);
      }
    } catch (error) {
      console.error("Error in onCaptchVerify:", error);
      setLoader(false);
    }
  };

  /**
   * @description: This function is used to get the user data by phone number
   * @param phnNumber
   */
  // const getUserByPhoneNumber = async () => {
  //   await getCallHDB(
  //     `${endPoints.users}/${userIdFromValidateAPI}?appType=infinipath`,
  //   )
  //     .then((response) => {
  //       if (response?.data?.statusCode === 200) {
  //          const dataReq = response?.data?.data;

  //         // Replace the beginning of the profileUrl string
  //         if (dataReq?.profileUrl?.length > 0) {
  //           dataReq.profileUrl = modifyProfileUrl(dataReq?.profileUrl);
  //         }
  //         dispatch(addSeekerData(dataReq));
  //         setItemInLocalStorage("seekerDetails", dataReq);
  //         setPhoneNumberError("");
  //       }
  //     })
  //     .catch((error) => {
  //       setLoader(false);
  //       setPhoneNumberError(
  //         "Failed to fetch user data, please try again later",
  //       );
  //     });
  // };

  /**
   * @description: This function is used to get the user data from
   * @param data
   */
  const onSubmit = async (data: formData) => {
    if (isOTPEntered && otp?.length === 6 && disableButtons.verifyOTP) {
      setLoader(true);
      verifyOTP(otp);
    } else if (!isOTPEntered) {
      // setLoader(true);

      if (isMobileNumber) {
        const phoneWithoutCountryCode = data?.phone?.slice(countryCode?.length);
        setPhoneNumberWithoutCountryCode(phoneWithoutCountryCode);
        await sendOtpHandler(phoneWithoutCountryCode, undefined);
      } else {
        await sendOtpHandler(undefined, data?.email);
      }
    }
  };

  /**
   * @description: This function is used to handle the form submit
   * @param data
   */
  const handleFormSubmit = (data: unknown) => {
    setPhoneNumberError("");
    onSubmit(data);
  };

  const [signIn, setSignIn] = useState(false);
  const [phone, setPhone] = useState<string>("91");

  /**
   * @description: This function is used to handle the seeker signup
   */

  const handleSeekerSignup = () => {
    const phoneWithoutCountryCodeForSignup = signUpData?.phone?.slice(
      signUpData?.countryCode?.length,
    );
    const formattedDob = formatDateToISOString(signUpData?.dob);
    const signUpPayload = {
      phoneNumber: phoneWithoutCountryCodeForSignup,
      fullName: signUpData?.firstName + " " + signUpData?.lastName,
      firstName: signUpData?.firstName,
      lastName: signUpData?.lastName,
      appType: "infinipath",
      email: signUpData?.email,
      faceUrl: "",
      profileUrl: "",
      address: signUpData?.city,
      dob: formattedDob,
      countryCode: signUpData?.countryCode?.startsWith("+")
        ? signUpData?.countryCode
        : `+${signUpData?.countryCode}`,
      ...(signUpData?.city === "Other" && {
        otherAddress: signUpData?.otherCity,
      }),
    };

    postCall(endPoints.users, signUpPayload, PORTAL)
      .then((response) => {
        if (response?.data?.statusCode === 200) {
          setLoader(false);
          setItemInLocalStorage("seekerDetails", response?.data?.data);
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";

          if (userRole == USER_ROLE_MAHATRIA || userRole == USER_ROLE_SHOBA ) {
            localStorage.setItem(
              "hdb_active_tab",
              textConstant.SEAT_ALLOCATIONS,
            );
          } else {
            localStorage.setItem("hdb_active_tab", textConstant.DASHBOARD);
          }
          if (
            response?.data?.data?.role?.includes("mahatria") ||
            response?.data?.data?.role?.includes("admin")
          ) {
            navigate("/infinipath/admin");
          } else if (response?.data?.data?.faceUrl?.length > 0) {
            navigate("/infinipath/myspace");
          } else {
            /**Handling faceID enrollment here if face_url is not present for seekers */
            setAddFaceUrl(true);
          }
        }
      })
      .catch((error) => {
        setLoader(false);
      });
  };

  /**
   * @description: This function is used to handle enter key press to submit form
   * @param event
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      if (otp?.length !== 6) {
        event.preventDefault();
        handleSubmit(handleFormSubmit)();
      } else {
        verifyOTP(otp);
      }
    }
  };

  /**
   * @description: This function is used to verify that the OTP is entered
   * @param otp
   * @param isComplete
   */
  const verifyOTPEntered = (otp: string, isComplete: boolean) => {
    if (otp?.length === 6) {
      setOtp(otp);
      setDisableButtons({ verifyOTP: !isComplete });
    } else {
      setOtp("");
      setDisableButtons({ verifyOTP: !isComplete });
    }
  };

  /**
   * @description: This function is used to handle the signup form submit
   * @param data
   */
  const signUpHandler = (data: unknown) => {
    setLoader(true);
    setSignUpData(data);
    // const formatPh = "+" + data?.phone;
    setPhoneNumberError("");
    const phoneWithoutCountryCode = data?.phone?.slice(
      data?.countryCode?.length,
    );
    const getUserPayload = {
      phone_number: phoneWithoutCountryCode,
      app_type: "infinipath",
    };
    validateUser(getUserPayload, data);
  };

  /**
   * @description: This function is used to resend the OTP
   * @param phone if it is signin flow, else it will be undefined and signupData.phone will be used
   */
  const resendOtp = (phone: string) => {
    setLoader(true);
    if (isMobileNumber) {
      const phoneWithoutCountryCode = getValues("phone").slice(
        countryCode?.length,
      );
      setPhoneNumberWithoutCountryCode(phoneWithoutCountryCode);
      sendOtpHandler(phoneWithoutCountryCode, undefined);
    } else {
      sendOtpHandler(undefined, getValues("email"));
    }
  };

  const flipOTPMethod = (type: string) => {
    setIsOTPEntered(false);
    setValue("email", "");
    setValue("phone", "");
    setPhone("+91");
    setOtp("");
    setDisableButtons({ verifyOTP: true });
    setOtpError("");
    setPhoneNumberError("");
    if (type == "email") {
      setIsMobileNumber(false);
      setValue("phone", "");
    } else {
      setIsMobileNumber(true);
    }
  };

  useEffect(() => {
    setPhoneNumberError("");
  }, [phone]);

  const handleSignIn = () => {
    setSignIn(!signIn);
    setPhoneNumberError("");
    setSignUpData(null);
    setPhone("+91");
    setValue("phone", "");
  };

  const editLoginForm = () => {
    if (signUpData) {
      setSignIn(true);
      setIsOTPEntered(false);
      setOtp("");
      setDisableButtons({ verifyOTP: true });
      setOtpError("");
    } else {
      setSignIn(false);
      setIsOTPEntered(false);
      setOtp("");
      setDisableButtons({ verifyOTP: true });
      setOtpError("");
    }
  };

  const handleSignInWithFaceNavigate = () => {
    window.location.replace("/verifyuserface?login=true");
  };

  /**
   * @param @description: This function is used to validate the user exist or not
   * @param data: form data
   */
  const validateUser = (payload: getUserPayload, data: formData) => {
    const formatPh = "+" + data?.phone;
    getCallHDBWithoutAuth(
      `users/${payload?.phone_number}/validate?appType=infinipath`,
    )
      .then((res) => {
        if (res?.data?.statusCode === 200) {
          setUserIdFromValidateAPI(res?.data?.data?.userId);
          // Here signIn state is for signupForm
          if (signIn) {
            setLoader(false);
            setPhoneNumberError("Phone number already exists, please sign in");
          } else {
            onCaptchVerify(formatPh);
          }
        } else if (res?.data?.statusCode === 400) {
          // Here signIn state is for signupForm
          if (signIn) {
            onCaptchVerify(formatPh);
          } else {
            setLoader(false);
            setPhoneNumberError("User does not exist");
          }
        }
      })
      .catch((err) => {
        setLoader(false);
        setPhoneNumberError("Failed to send the OTP, please try again later");
      });
  };

  return (
    <div
      className={styles.organisationLandingPage}
      data-testid="organisation-landing-page"
    >
      <div className={styles.bgImageIcon} data-testid="bg-image-icon"></div>

      <div className={styles.cardsWrapper} data-testid="cards-wrapper">
        <div id="recaptcha-container" data-testid="recaptcha-container"></div>
        <div className={styles.cards} data-testid="cards">
          {signIn ? (
            <>
              <Signup
                signIn={signIn}
                handleSignIn={handleSignIn}
                signUpHandler={signUpHandler}
                loader={loader}
                signUpData={signUpData}
                phoneNumberError={phoneNumberError}
                setPhoneNumberError={setPhoneNumberError}
                data-testid="signup-component"
              />
            </>
          ) : !addFaceUrl ? (
            <>
              <div
                className={styles.signInSection1}
                data-testid="sign-in-section-1"
              >
                <div className={styles.signIn} data-testid="sign-in">
                  {signUpData && !isOTPEntered ? (
                    <img
                      src={signUpImage}
                      alt="Sign-up image"
                      data-testid="sign-up-image"
                    />
                  ) : (
                    <>
                      {!isOTPEntered && (
                        <img
                          src={signInImage}
                          alt="Sign-in image"
                          data-testid="sign-up-image"
                        />
                      )}
                      {!isOTPEntered && skipFaceVerify && (
                        <p data-testid="enter-mobile-number">
                          Enter mobile number
                        </p>
                      )}
                    </>
                  )}
                </div>
                {signInWithFace ? (
                  /** Sign in with Face ID */
                  <div
                    className={styles.signInWithFace}
                    data-testid="sign-in-with-face"
                  >
                    <p
                      className={`${styles.signInCaption} ${styles.signInCaptionPaddingTop}`}
                      data-testid="sign-in-caption"
                    >
                      capture your face for <br></br>quick authentication
                    </p>
                    <img
                      src={faceLoginIcon}
                      alt="faceicon"
                      data-testid="face-login-icon"
                    />
                    <div
                      className={styles.signInWithFaceButtonDiv}
                      data-testid="sign-in-face-buttons"
                    >
                      <Button
                        buttonClassName={styles.submitButton}
                        onClick={() => navigate("/verifyuserface?login=true")}
                        datatestid="capture-face-button"
                        datatestidText="capture-face"
                      >
                        sign in using face ID
                      </Button>
                      <div className={styles.orDiv} data-testid="or-divider">
                        <GrayLine />
                        or
                        <GrayLine />
                      </div>
                      <Button
                        buttonClassName={styles.submitButtonSecondary}
                        onClick={() => navigate("/login?skipFaceVerify=true")}
                        datatestid="sign-in-otp-button"
                        datatestidText="sign-in-otp"
                      >
                        sign in using OTP
                      </Button>
                    </div>
                  </div>
                ) : (
                  /** Sign in with phone number and OTP*/
                  <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    onKeyDown={handleKeyDown}
                    className={styles.formTag}
                    data-testid="login-form"
                  >
                    {!isOTPEntered ? (
                      <>
                        {isMobileNumber ? (
                          <div
                            className={styles.labelInput}
                            data-testid="mobile-input-field"
                          >
                            <div className={styles.labelText}>
                              Mobile number*
                            </div>
                            <div className={styles.fieldBlock}>
                              {isMobileNumber ? (
                                <PhoneInput
                                  country={"IN"}
                                  value={phone}
                                  onChange={(
                                    phone: string,
                                    country: unknown,
                                  ) => {
                                    setCountryCode(country?.dialCode);
                                    const cleanedPhone = phone
                                      ? phone.replace(/-/g, "")
                                      : "";
                                    setPhone(cleanedPhone);
                                    setValue("phone", cleanedPhone);
                                    clearErrors("phone");
                                  }}
                                  containerClass={styles.loginCustomContainer}
                                  inputClass={`${styles.loginCustomInput} ${errors.phone ? styles.errorFieldPhone : ""}`}
                                  buttonClass={styles.loginCustomButton}
                                  dropdownClass={styles.loginCustomDropdown}
                                  enableSearch={true}
                                  disableSearchIcon={true}
                                  countryCodeEditable={false}
                                  inputProps={{
                                    ref: mobileInputRef,
                                    autoFocus: true,
                                    "data-testid": "phone-input-field",
                                  }}
                                  data-testid="phone-input"
                                />
                              ) : (
                                <></>
                              )}
                            </div>
                            {/* Showing invalid phone number error */}
                            {errors.phone && (
                              <div
                                className={styles.error}
                                data-testid="phone-number-error"
                              >
                                {errors.phone.message}
                              </div>
                            )}
                            {/* Showing phone number doest not exist error */}
                            {phoneNumberError && !errors.phone && (
                              <div
                                className={styles.error}
                                data-testid="phone-error"
                              >
                                {phoneNumberError.includes(
                                  "User does not exist, please sign up",
                                ) ? (
                                  <>
                                    User does not exist, please
                                    <span
                                      className={styles.signUpText}
                                      onClick={handleSignIn}
                                      data-testid="sign-up-link"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleSignIn();
                                        }
                                      }}
                                      tabIndex={0} // Make the element focusable with the Tab key
                                      role="button" // Indicate that the element acts as a button
                                      aria-label="Sign up" // Provide an accessible label
                                    >
                                      &nbsp;sign up
                                    </span>
                                  </>
                                ) : (
                                  phoneNumberError
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={styles.labelInput}
                            data-testid="email-input-field"
                          >
                            <div className={styles.labelText}>
                              {LOGIN_TEXT.EMAIL.LABEL}
                            </div>
                            <div className={styles.fieldBlock}>
                              <input
                                type="text"
                                className={`${styles.emailInput} ${errors.email ? styles.errorFieldEmail : ""}`}
                                autoFocus
                                value={getValues("email") || ""}
                                onChange={(e) => {
                                  setValue("email", e.target.value);
                                  clearErrors("email");
                                }}
                                data-testid="email-input"
                              />
                            </div>
                            {errors.email && (
                              <div
                                className={`${styles.error} ${styles.phoneErrorMobile}`}
                                data-testid="email-error"
                              >
                                {errors.email.message}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={styles.formFields}>
                        <div
                          className={styles.OTPForm}
                          data-testid="otp-section"
                        >
                          <div className={styles.text} data-testid="otp-text">
                            Confirm OTP
                          </div>
                          <div
                            className={styles.caption}
                            data-testid="otp-enter"
                          >
                            <span data-testid="enter-otp-text">
                              Enter the OTP sent to
                              {isMobileNumber
                                ? " +" + getValues("phone")
                                : " " + getValues("email")}
                            </span>
                            <p>
                              Click here to{" "}
                              <span
                                className={styles.changeMobileNumber}
                                onClick={() => editLoginForm()}
                                data-testid="otp-change-mobile"
                              >
                                change your{" "}
                                {isMobileNumber ? "mobile number" : "email"}.
                              </span>
                            </p>
                          </div>
                          <OtpFields
                            onComplete={verifyOTPEntered}
                            setOtpError={setOtpError}
                            data-testid="otp-fields"
                          />
                          {otpError && (
                            <div
                              className={`${styles.error} ${styles.otpError}`}
                              data-testid="otp-error"
                            >
                              {otpError}
                              <br />
                              {otpErrorWithAttempts && (
                                <span className={styles.otpErrorAttempts}>
                                  {otpErrorWithAttempts}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className={styles.buttonContainer}>
                      {!isOTPEntered && !loader && (
                        <>
                          <Button
                            buttonClassName={`${styles.submitButton} ${styles.buttonTopMargin}`}
                            type="submit"
                            datatestid="get-otp-button"
                            datatestidText="get-otp"
                          >
                            get OTP
                          </Button>
                          {process.env.REACT_APP_ENABLE_FACE_ID === "true" && (
                            <>
                              <div
                                className={styles.orDiv2}
                                data-testid="or-divider"
                              ></div>
                            </>
                          )}
                          <div
                            className={styles.bottomSection}
                            data-testid="caption2"
                          >
                            <p>Having trouble?</p>
                            <span>
                              sign in with your mobile number to get OTP.
                            </span>
                            <Button
                              buttonClassName={`${styles.submitButtonSecondary} ${styles.signinMethod}`}
                              onClick={() =>
                                flipOTPMethod(
                                  isMobileNumber ? "email" : "mobile",
                                )
                              }
                              datatestid="sign-in-with-face-id-button"
                              datatestidText="sign-in-with-face-id"
                            >
                              {isMobileNumber
                                ? "sign in using email"
                                : "sign in using mobile"}
                            </Button>
                          </div>
                        </>
                      )}

                      {isOTPEntered && !loader && (
                        <div
                          className={styles.otpResendDiv}
                          data-testid="otp-resend-div"
                        >
                          <Button
                            buttonClassName={`${styles.submitButton} ${styles.verifyBtnWidth}`}
                            type="button"
                            disable={disableButtons.verifyOTP}
                            onClick={() => {
                              // sendOTP();
                              verifyOTP(otp);
                            }}
                            datatestid="verify-otp-button"
                            datatestidText="verify"
                          >
                            verify
                          </Button>
                          {loader ? (
                            <Loader type="small" data-testid="loader" />
                          ) : (
                            <>
                              <div
                                className={styles.bottomSection}
                                data-testid="caption2"
                              >
                                <p>
                                  {" "}
                                  Didn't receive an OTP?{" "}
                                  <span
                                    className={
                                      isResendEnabled
                                        ? styles.resend
                                        : styles.resendTimer
                                    }
                                    onClick={() => {
                                      resendOtp(
                                        isMobileNumber
                                          ? getValues("phone")
                                          : getValues("email"),
                                      );
                                    }}
                                    data-testid="resend-otp-link"
                                  >
                                    {/* resend OTP in {timer}s */}
                                    {isResendEnabled
                                      ? LOGIN_TEXT.OTP.RESEND
                                      : `${LOGIN_TEXT.OTP.RESENDIN} ${timer}s`}
                                  </span>
                                </p>
                                <div>or</div>
                                <Button
                                  buttonClassName={`${styles.submitButtonSecondary} ${styles.signinMethod}`}
                                  onClick={() =>
                                    flipOTPMethod(
                                      isMobileNumber ? "email" : "mobile",
                                    )
                                  }
                                  datatestid="sign-in-with-face-id-button"
                                  datatestidText="sign-in-with-face-id"
                                >
                                  {isMobileNumber
                                    ? "get OTP on email"
                                    : "get OTP on mobile"}
                                </Button>
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
                      )}
                      {loader && <Loader type="small" data-testid="loader" />}
                    </div>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className={styles.signInWithFace}>
              <p
                className={`${styles.signInCaption} ${styles.paddingTop}`}
                data-testid="face-id-caption"
              >
                Your OTP is verified! Now, capture your <br></br>face for quick
                authentication.
              </p>
              <img
                src={faceLoginIcon}
                alt="faceicon"
                data-testid="face-id-icon"
                className={styles.faceIconSignup}
              />
              <div
                className={`${styles.signInWithFaceButtonDiv} ${styles.marginTopForBtns}`}
                data-testid="face-id-buttons"
              >
                <Button
                  buttonClassName={styles.submitButton}
                  onClick={() => navigate("/verifyuserface?enrollFaceId=true")}
                  datatestid="capture-face-id-button"
                  datatestidText="capture-face-id"
                >
                  capture my face ID
                </Button>
                <span
                  className={styles.skipText}
                  onClick={() => navigate("/infinipath/myspace")}
                  data-testid="skip-for-now-link"
                >
                  skip for now
                </span>
              </div>
            </div>
          )}
          <Snackbar
            open={showSnackbar}
            autoHideDuration={4000}
            onClose={handleSnackbarClose}
            className={styles.snackbar}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            message={
              <span className={styles.snackbarMessage}>
                <img src={alertIcon} alt="alert" />
                <span className={styles.snackbarError}>
                  {textConstants.attemptsCompleted}
                </span>
              </span>
            }
          />
        </div>
      </div>
    </div>

    //   );
  );
};
export default LoginScreen;
