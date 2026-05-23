import React, { useEffect, useState } from "react";
import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUpSchema } from "./signUpSchema";
import signUpImage from "../../assets/images/sign-up.svg";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import styles from "./index.module.scss";
import { Button } from "../../common/components/Button";
import Loader from "../../common/components/Loader";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import Header from "../../common/Header";
import closeIcon from "../../assets/images/cross-icon.svg";
import DropdownWithInput from "../../common/components/DropdownTextfield";
import { cityList } from "../../utils/functions";
import { LocalizationProvider } from "@mui/x-date-pickers";
import CustomDatePicker from "../../common/components/DobTextfield";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
interface IFormInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  terms: boolean;
  signIn: boolean;
  countryCode: string;
}

interface Props {
  signIn: boolean;
  handleSignIn: () => void; // Function to handle signIn toggle
  signUpHandler: (data: IFormInput) => void; // Function to handle signUp
  loader: boolean;
  signUpData: unknown;
  phoneNumberError: string;
  setPhoneNumberError: (error: string) => void;
}

const Signup: React.FC<Props> = ({
  handleSignIn,
  signUpHandler,
  loader,
  signUpData,
  phoneNumberError,
  setPhoneNumberError,
}) => {
  const [phone, setPhone] = useState<string>("91");
  const [checked, setChecked] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    setFocus,
    watch,
    trigger,
    unregister,
    control,
  } = useForm<IFormInput>({
    resolver: yupResolver(signUpSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    setFocus("firstName");
  }, [setFocus]);

  useEffect(() => {
    setValue("terms", checked); // Update the terms value in the form state
  }, [checked, setValue]);

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    const payload = {
      ...data,
    };
    signUpHandler(payload);
  };

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
  }, []);
  const methods = useForm();
  const [open, setOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");

  const handleOpenModal = (url: string) => {
    setIframeUrl(url); // Set the URL based on the clicked link
    setOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setOpen(false); // Close the modal
    setIframeUrl(""); // Reset the iframe URL
  };

  useEffect(() => {
    if (signUpData !== null) {
      setValue("phone", signUpData?.phone);
      setPhone(signUpData?.phone);
      setValue("email", signUpData?.email);
      setValue("firstName", signUpData?.firstName);
      setValue("lastName", signUpData?.lastName);
      setValue("countryCode", signUpData?.countryCode);
      setValue("city", signUpData?.city);
      setValue("otherCity", signUpData?.otherCity);
      setValue("dob", signUpData?.dob);
      setChecked(signUpData?.terms);
    }
  }, [signUpData]);

  useEffect(() => {
    setPhoneNumberError("");
  }, [phone]);

  const firstNameValue = watch("firstName");
  useEffect(() => {
    if (firstNameValue?.length > 30) {
      trigger("firstName");
    } else if (firstNameValue?.length > 3) {
      trigger("firstName");
    }
  }, [firstNameValue]);

  const lastNameValue = watch("lastName");
  useEffect(() => {
    if (lastNameValue?.length > 30) {
      trigger("lastName");
    } else if (lastNameValue?.length > 3) {
      trigger("lastName");
    }
  }, [lastNameValue]);

  const citiesData = cityList.map((city) => {
    return {
      value: city.name,
      label: city.name,
    };
  });
  const cityValue = watch("city"); // Watch the city field
  const showOtherField = cityValue === "Other"; // Show other field only if city is "Other"
  const handleValueChange = (value: string) => {
    setValue("city", value);
    unregister("otherCity");
    clearErrors("city");
  };

  const handleDateChange = (date: Date | null) => {
    if (date !== null) {
      setValue("dob", date, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };
  useEffect(() => {
    if (cityValue === "Other") {
      register("otherCity", { required: "Other City is required" });
    }
  }, [cityValue, register]);

  return (
    <div className={styles.signupPage} data-testid="signup-page">
      <img
        src={signUpImage}
        alt="Sign-up image"
        data-testid="signup-image"
        className={styles.signUpImage}
      />
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.formContainer}
          data-testid="signup-form"
        >
          <div className={styles.inputFieldsBlock}>
            <div className={styles.fieldsContainer}>
              <div className={styles.labelInput} data-testid="first-name-field">
                <div className={styles.labelText}>First name*</div>
                <div className={styles.fieldBlock}>
                  <input
                    data-testid="first-name-input"
                    {...register("firstName")}
                    className={`${styles.inputFields} ${errors.firstName ? styles.errorFields : ""}`}
                  />
                </div>
                {errors.firstName && (
                  <i className={styles.error} data-testid="first-name-error">
                    {errors.firstName.message}
                  </i>
                )}
              </div>

              <div className={styles.labelInput} data-testid="last-name-field">
                <div className={styles.labelText}>Last name*</div>
                <div className={styles.fieldBlock}>
                  <input
                    {...register("lastName")}
                    className={`${styles.inputFields} ${errors.lastName ? styles.errorFields : ""}`}
                    data-testid="last-name-input"
                  />
                </div>
                {errors.lastName && (
                  <i className={styles.error} data-testid="last-name-error">
                    {errors.lastName.message}
                  </i>
                )}
              </div>
              <div className={styles.labelInput} data-testid="phone-field">
                <div className={styles.labelText}>Mobile number*</div>
                <div className={styles.fieldBlock}>
                  <PhoneInput
                    country={"IN"}
                    value={phone}
                    onChange={(phone, country) => {
                      setValue("countryCode", country?.dialCode);
                      const cleanedPhone = phone ? phone.replace(/-/g, "") : "";
                      setPhone(cleanedPhone);
                      setValue("phone", cleanedPhone);
                      clearErrors("phone");
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
                {errors.phone && (
                  <i
                    className={styles.error}
                    style={{ textAlign: "right" }}
                    data-testid="phone-number-error"
                  >
                    {errors.phone.message}
                  </i>
                )}
                {/* Showing OTP send failure error */}
                {phoneNumberError && !errors.phone && (
                  <i
                    className={styles.error}
                    style={{ textAlign: "right" }}
                    data-testid="phone-error"
                  >
                    {phoneNumberError.includes(
                      "Phone number already exists, please sign in",
                    ) ? (
                      <>
                        Phone number already exists, please
                        <span
                          className={styles.loginText}
                          onClick={handleSignIn}
                          data-testid="signin-link"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault(); // Prevent form submission
                              handleSignIn();
                            }
                          }}
                          tabIndex={0} // Make the element focusable with the Tab key
                          role="button" // Indicate that the element acts as a button
                          aria-label="Sign up" // Provide an accessible label
                        >
                          &nbsp;sign in
                        </span>
                      </>
                    ) : (
                      phoneNumberError
                    )}
                  </i>
                )}
              </div>

              <div className={styles.labelInput} data-testid="email-field">
                <div className={styles.labelText}>Email address*</div>
                <div className={styles.fieldBlock}>
                  <input
                    {...register("email")}
                    className={`${styles.inputFields} ${errors.email ? styles.errorFields : ""}`}
                    data-testid="email-input"
                  />
                </div>
                {errors.email && (
                  <i className={styles.error} data-testid="email-error">
                    {errors.email.message}
                  </i>
                )}
              </div>

              <Controller
                name="city"
                control={control}
                defaultValue="" // Provide a default value
                render={({ field }) => (
                  <DropdownWithInput
                    {...field} // Connect form state
                    label="Location*"
                    options={citiesData}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleValueChange(value);
                    }}
                    error={errors.city?.message}
                    otherError={errors.otherCity?.message}
                    showOtherField={showOtherField}
                    height="35px"
                  />
                )}
              />
              {showOtherField && (
                <div
                  className={styles.labelInput}
                  data-testid="other-city-field"
                >
                  <div className={styles.fieldBlock}>
                    <input
                      {...register("otherCity")}
                      className={`${styles.inputFields} ${errors.otherCity ? styles.errorFields : ""}`}
                      data-testid="other-city-input"
                    />
                  </div>
                  {errors.otherCity && (
                    <i className={styles.error} data-testid="other-city-error">
                      {errors.otherCity.message}
                    </i>
                  )}
                </div>
              )}
              <div>
                <div className={styles.muiInputField}>
                  <div className={styles.dobLabelText}>Date of birth*</div>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div className={styles.textField}>
                      <Controller
                        name="dob"
                        control={control}
                        render={({ field }) => (
                          <CustomDatePicker
                            value={field.value}
                            futureDate={false}
                            onChange={(date) => {
                              field.onChange(date);
                              handleDateChange(date);
                            }}
                            errorExist={errors.dob ? true : false}
                            className={styles.dropdownInputFromEmail}
                            height="35px"
                          />
                        )}
                      />
                    </div>
                  </LocalizationProvider>
                  {errors?.dob && (
                    <i className={styles.error}>{errors?.dob?.message}</i>
                  )}
                </div>
              </div>
              <div>
                <div className={styles.termsConditionsBlock}>
                  <input
                    type="checkbox"
                    onClick={() => setChecked(!checked)}
                    className={styles.methodTypesInput1}
                    checked={checked}
                    id="checkbox1"
                    {...register("terms")}
                    data-testid="terms-checkbox"
                  />
                  <div>
                    <p>I have read and agreed to the infinipath {""}</p>
                    <span
                      className={styles.loginText}
                      onClick={() =>
                        handleOpenModal(
                          "https://infinipdev.divami.com/termsAndConditions.html",
                        )
                      }
                      data-testid="terms-link"
                    >
                      terms & conditions
                    </span>{" "}
                    and
                    <span
                      className={styles.loginText}
                      onClick={() =>
                        handleOpenModal(
                          "https://infinipdev.divami.com/privacyAndPolicy.html",
                        )
                      }
                      data-testid="privacy-policy-link"
                    >
                      {" "}
                      privacy policy{" "}
                    </span>
                  </div>
                </div>
                {errors.terms && (
                  <i className={styles.error} data-testid="terms-error">
                    {errors.terms.message}
                  </i>
                )}
              </div>
            </div>
          </div>
          <div>
            <div id="recaptcha" data-testid="recaptcha-container"></div>
            {!loader ? (
              <div className={styles.buttonBlock}>
                <Button
                  buttonTextClassName={styles.buttonText}
                  buttonClassName={styles.buttonContainer}
                  type="submit"
                  data-testid="get-otp-button"
                >
                  get OTP
                </Button>
              </div>
            ) : (
              <Loader type="small" data-testid="loader" />
            )}
          </div>
        </form>
      </FormProvider>
      <div className={styles.textBlock} data-testid="signin-block">
        Already have an account?{" "}
        <span
          className={styles.loginText}
          onClick={handleSignIn}
          data-testid="signin-link"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevent form submission
              handleSignIn();
            }
          }}
          tabIndex={0} // Make the element focusable with the Tab key
          role="button" // Indicate that the element acts as a button
          aria-label="Sign up" // Provide an accessible label
        >
          sign in
        </span>
      </div>

      <div>
        <Dialog
          open={open}
          onClose={handleCloseModal}
          maxWidth={false}
          fullScreen
          data-testid="terms-dialog"
        >
          <Header data-testid="dialog-header" />
          <DialogTitle className={styles.dialogBlock}>
            <div>
              {iframeUrl.includes("terms") && "Terms & conditions"}
              {iframeUrl.includes("privacy") && "Privacy policy"}
            </div>
            <IconButton
              onClick={handleCloseModal}
              data-testid="dialog-close-button"
            >
              <img src={closeIcon} alt="Close" className={styles.modalClose} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <iframe
              src={iframeUrl}
              title="Terms and Policy"
              className={styles.DialogText}
              style={{
                width: "100%",
                height: "calc(100vh - 200px)",
                border: "none",
              }}
              data-testid="dialog-iframe"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
export default Signup;
