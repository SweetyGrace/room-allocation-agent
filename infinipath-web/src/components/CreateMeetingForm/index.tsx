import { Controller, UseFormHandleSubmit, useForm } from "react-hook-form";
import styles from "./index.module.scss";
import { meetingFormSchema } from "./creatingMeetingFormSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import CustomDatePicker from "../../common/components/CustomDatePicker";
import CustomTimePicker from "../../common/components/CustomTimePicker";
import { Button } from "../../common/components/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  UpdateWebinar,
  convertISOTo12HourFormat,
  convertToISOFormat,
  formatTime,
  formatTimeRange,
  formattedTime,
  getDateFromString,
  getDayOfWeek,
  getMonthAbbreviation,
  getYearBasedOnDate,
  replaceDashWithTo,
} from "../../utils/commonFunctions";
import {
  getItemInLocalStorage /*, setItemInLocalStorage*/,
} from "../../services/localStorage";
import GrayLine from "../../common/components/GrayLine";
import calendar from "../../assets/images/calendar.svg";
import clockIcon from "../../assets/images/clock.svg";
import SuccessPopUp from "../../common/components/SuccessPopUp";
import Loader from "../../common/components/Loader";
import RegistrationsOpenLayer from "../../common/components/RegistrationsOpenLayer";
import ArrowIcon from "../../assets/images/arrow-left.svg";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import { postCall } from "../../services/apiService";
import CustomTimer from "../../common/components/CustomTimer";
import dayjs from "dayjs";
import { attendeesMaxValue, NESTEDTAB, panelistMaxValue, SELECTEDTABS, TABS } from "../../constants";
import CustomTimeDropdown from "../../common/components/CustomTimeDropDown";



const CreateMeetingForm = () => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
    watch,
    trigger,
  } = useForm({
    resolver: yupResolver(meetingFormSchema),
    mode: "onChange", // Change from "onBlur" to "onChange"
    reValidateMode: "onChange", // Add this line
    shouldUnregister: true,
  });
  const location = useLocation();
  const { selectedMeeting } = location.state || {};
  const navigate = useNavigate();
  const [duration, setDuration] = useState(
    selectedMeeting ? (selectedMeeting?.duration) : "0",
  );
  //to set webinar initial time
  const [initialTime, setInitialTime] = useState(selectedMeeting
    ? convertISOTo12HourFormat(selectedMeeting?.startAt)
    : "",);
  //to set webinar duration time
  const [durationTime, setDurationTime] = useState(
    "");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");
  const seekerDetails = getItemInLocalStorage("seekerDetails");
  const registationstart = watch("registrationStartDate");
  const registrationEnd = watch("registrationEndDate");
  const registrationStartTimeWatch = watch("registrationStartTime");
  const registrationEndTimeWatch = watch("registrationEndTime");
  const meetingDateWatch = watch("meetingDate");
  const meetingTimeWatch = watch("meetingTime");
  const preJoinTimeWatch = watch("preJoinTime");
  const startEnableTimeWatch = watch("startEnableTime");
  const videoLimitWatch = watch("videoLimit");
  const nonVideoLimitWatch = watch("nonVideoLimit");
  const durationWatch = watch("duration");
  const titleWatch = watch("title");
  const [meetingTitleForPopup, setMeetingTitleForPopup] = useState("");
  const [clickedButton, setClickedButton] = useState("");

  // Convert ISO string to 12-hour format
  const utcToLocal = (isoString: string) => {
    const date = new Date(isoString);
    const localDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000,
    );
    return localDate;
  };

  
  const handleTriggerValidation = () => {
    if (registrationStartTimeWatch) {
      trigger("registrationStartTime");
      trigger("registrationStartDate");
    }
    if (registrationEndTimeWatch) {
      trigger("registrationEndTime");
      trigger("registrationEndDate");
    }
    if (registationstart) {
      trigger("registrationStartDate");
      trigger("registrationStartTime");
    }
    if (registrationEnd) {
      trigger("registrationEndDate");
      trigger("registrationEndTime");
    }
    if (meetingDateWatch) {
      trigger("meetingDate");
      trigger("meetingTime");
    }
    if (meetingTimeWatch) {
      trigger("meetingTime");
      trigger("meetingDate");
    }
    if (videoLimitWatch) {
      trigger("videoLimit");

    }
    if (nonVideoLimitWatch) {
      trigger("nonVideoLimit");
    }
    if (titleWatch) {
      trigger("title");
    }
    if (preJoinTimeWatch) {
      trigger("preJoinTime");
    }
    if (startEnableTimeWatch) {
      trigger("startEnableTime");
    }
    if (durationWatch) {
      trigger("duration");
    }
    
  }

  // Handle input change
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length <= 50) {
      setInputValue(value);
    } else {
      // Trim the input to the allowed length
      const trimmedValue = value.slice(0, 50);
      setInputValue(trimmedValue);
    }
  };

  // Adjust the date to local time
  const adjustToLocalTime = (date: Date) => {
    if (!isNaN(date.getTime())) {
      const offset = date.getTimezoneOffset() * 60000; // Get the offset in milliseconds
      const localTime = new Date(date.getTime() - offset); // Adjust the date by the offset
      return localTime.toISOString();
    } else {
      const today = new Date();
      // today.setHours(0, 0, 0, 0); // Set the time to 6 PM
      return today.toISOString();
    }
  };

  const formattedRegistrationStart = registationstart
    ? adjustToLocalTime(new Date(registationstart))
    : "";
  const registrationStartTime = registrationStartTimeWatch
    ? formatTime(adjustToLocalTime(new Date(registrationStartTimeWatch)))
    : "";
  const meetingStart = watch("meetingDate");

  const formattedMeetingStart = meetingStart
    ? adjustToLocalTime(new Date(meetingStart))
    : "";

  useEffect(() => {
  }, [initialTime]);

  //to prefill the form data while editing
    const selectedValuesSetting = (selectedMeeting) => {
    if (selectedMeeting?.title) {
      setInputValue(selectedMeeting.title);
      setValue("title", selectedMeeting.title);
      trigger("title");
    }
    if (selectedMeeting?.registrationStartsAt) {
      setValue("registrationStartDate", utcToLocal(selectedMeeting.registrationStartsAt));
      setValue("registrationStartTime", utcToLocal(selectedMeeting.registrationStartsAt));
      trigger("registrationStartDate");
      trigger("registrationStartTime");
    }
    if (selectedMeeting?.registrationEndsAt) {
      setValue("registrationEndDate", utcToLocal(selectedMeeting.registrationEndsAt));
      setValue("registrationEndTime", utcToLocal(selectedMeeting.registrationEndsAt));
      trigger("registrationEndDate");
      trigger("registrationEndTime");
    }
    if (selectedMeeting?.duration) {
      setValue("duration", selectedMeeting.duration);
      setDuration(selectedMeeting.duration);
      trigger("duration");
    }
    if (selectedMeeting?.startAt) {
      setValue("meetingDate", utcToLocal(selectedMeeting.startAt));
      setValue("meetingTime", utcToLocal(selectedMeeting.startAt));
      setInitialTime(convertISOTo12HourFormat(selectedMeeting.startAt));
      trigger("meetingDate");
      trigger("meetingTime");
    }
    if (selectedMeeting?.maxVideoLimit) {
      setValue("videoLimit", selectedMeeting.maxVideoLimit);
      trigger("videoLimit");
    }
    if (selectedMeeting?.maxNonVideoLimit) {
      setValue("nonVideoLimit", selectedMeeting.maxNonVideoLimit);
      trigger("nonVideoLimit");
    }
    if (selectedMeeting?.joinEnableTime) {
      setValue(
        "preJoinTime",
        dayjs().minute(selectedMeeting.joinEnableTime).second(0).millisecond(0),
      );
      trigger("preJoinTime");
    }
    if (selectedMeeting?.startEnableTime) {
      setValue(
        "startEnableTime",
        dayjs().minute(selectedMeeting.startEnableTime).second(0).millisecond(0),
      );
      trigger("startEnableTime");
    }
  };

  // Set default values for the form
  useEffect(() => {
    // const defaultDates = getDefaultDates();
    if (selectedMeeting) {
      selectedValuesSetting(selectedMeeting);
    } 
    
  }, [setValue, selectedMeeting]);

  // Call this function only when the meeting date changes
  const handleMeetingDateChange = (newMeetingDate: Date) => {
    setValue("meetingDate", newMeetingDate); // Update the meeting date
    // updateRegistrationDates(newMeetingDate); // Update registration dates based on the new meeting date
  };

  const closePopup = () => {
    setShowPopup(false);
  };

 
  /**
   * @description this function is call create meeting api
   * @param payload
   */
  const handleCreateMeeting = async (payload: unknown) => {
    setLoading(true);
    postCall(endPoints?.webinars, payload, INFINIPATH)
      .then((response: unknown) => {
        if (response?.data?.statusCode === 200) {
          // socket.emit("createWebinar", response.data.data); // Emit the createWebinar event
            setLoading(false);
            localStorage.setItem(TABS.SELECTEDTAB,SELECTEDTABS.UPCOMING);
            localStorage.setItem(TABS.NESTEDSELECTEDTAB,NESTEDTAB.DRAFTS);
            setShowPopup(true);
        } else {
          setLoading(false);
          const errorMessage =
            response?.data?.message ||
            "Failed to create meeting, please try again later";
          alert(errorMessage);
        }
      })
      .catch((error) => {
        console.error("Error creating meeting:", error);
        setLoading(false);
        alert("Failed to create meeting, please try again later");
      });
  };

  const onSubmit = (
    data: UseFormHandleSubmit<
      {
        meetingDate: Date;
        meetingTime: Date;
        duration: Date;
        registrationStartDate: Date;
        registrationStartTime: Date;
        registrationEndDate: Date;
        registrationEndTime: Date;
        title: string;
        passcode: string;
      },
      undefined
    >,
  ) => {
    const payload = {
      // meeting_update: "CREATE",
      userId: seekerDetails?.id,
      title: inputValue,
      password: "",
      startDate: convertToISOFormat(data?.meetingDate, data?.meetingTime),
      duration: Number((duration)),
      startAt: convertToISOFormat(data?.meetingDate, data?.meetingTime),
      registrationStartsAt: convertToISOFormat(
        data?.registrationStartDate,
        data?.registrationStartTime,
      ),
      registrationEndsAt: convertToISOFormat(
        data?.registrationEndDate,
        data?.registrationEndTime,
      ),
      joinEnableTime: data?.preJoinTime.minute(),
      startEnableTime: data?.startEnableTime.minute(),
      // meeting_id: 12, // for update
      maxVideoLimit: data?.videoLimit,
      maxNonVideoLimit: data?.nonVideoLimit,
      programSessionId: 1,
      createdBy: "Admin",
      webinarStatus: selectedMeeting ? selectedMeeting?.webinarStatus : "draft",
    };
    setMeetingTitleForPopup(data?.title);
    let isPublishedValue = false;
    if (clickedButton === "Save" || clickedButton === "Publish") {
      if (clickedButton === "Save") {
        isPublishedValue = false;
      } else if (clickedButton === "Publish") {
        isPublishedValue = true;
      }
      setLoading(true);
      UpdateWebinar(setLoading, payload, isPublishedValue, selectedMeeting?.id)
        .then((res) => {
          if (res?.data?.statusCode === 200) {
              navigate("/admin/infinipath/sessions");
          } else {
            alert(res?.data?.message);
          }
        })
        .catch((error) => {
          console.error("Error updating webinar:", error);
        });
    } else {
      handleCreateMeeting(payload);
    }
  };

  const handleNonVideoLimitInput = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const invalidChars = ["-", ".", "e", "E"];
    if (invalidChars.includes(e.key)) {
      // e.preventDefault();
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      // event.preventDefault();
    }
  };

  const handleDurationTime = (meetingDate: Date, duration: number, meetingTime: Date) => {
    if (!meetingDate || !duration || !meetingTime) return null; // Ensure all inputs are valid
  
    // Combine meetingDate and meetingTime into a single Date object
    const combinedDateTime = new Date(meetingDate);
    combinedDateTime.setHours(meetingTime.getHours(), meetingTime.getMinutes(), 0, 0);
  
    // Convert duration from minutes to milliseconds
    const durationTime = duration * 60000;
    const formatedTimeRange = formatTimeRange(combinedDateTime, durationTime);
    const formatedChangeTime = formattedTime(formatedTimeRange);

    return formatedChangeTime;
    // Calculate the meeting end time
    // const meetingEndTime = combinedDateTime.getTime() + durationTime;
  
    // return new Date(meetingEndTime); // Return the calculated end time
  };
  
  useEffect(() => {
    const meetingDate = watch("meetingDate");
    const meetingTime = watch("meetingTime");
    const duration = watch("duration");
  
    if (meetingDate && meetingTime && duration) {
      const endTime = handleDurationTime(meetingDate, duration, meetingTime);
      if (endTime) {
        setDurationTime(endTime); // Update the state with the calculated end time
      }
    }
  }, [watch("meetingDate"), watch("meetingTime"), watch("duration")]);
  
  const handleDurationFormat = (duration: number) => {
    if (duration) {
      const hours = Math.floor(duration / 60).toString().padStart(2, "0");
      const minutes = (duration % 60).toString().padStart(2, "0");
  
      if (hours !== "00" && minutes !== "00") {
        return `${hours}h ${minutes}m`;
      } else if (hours !== "00") {
        return `${hours}h`;
      } else if (minutes !== "00") {
        return `${minutes}m`;
      }
    }
    return "--"; // Default format if duration is not provided or is 0
  };

  return (
    <div className={styles.meetingContainer} data-testid="meeting-container">
      {loading && <Loader type="large" />}
      {/* <div className={styles.appTitle}>infinipath</div> */}
      <div className={styles.topShadow}>
        <div className={styles.breadcrumbs} data-testid="breadcrumbs">
          <div
            className={styles.backArrow}
            onClick={() => {
              navigate("/admin/infinipath/sessions");
            }}
            data-testid="back-icon-container"
          >
            <img src={ArrowIcon} alt="back" data-testid="back-icon" />
          </div>
          <div
            className={styles.activeHome}
            data-testid="breadcrumb-nonactive-myspace"
            onClick={() => navigate("/admin/infinipath/sessions")}
          >
            Sessions
          </div>
          <div className={styles.nonActive} data-testid="breadcrumb-separator">
            /
          </div>
          <div
            className={styles.active}
            data-testid="breadcrumb-active-session"
          >
            create infinipath
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.formContainer}
          data-testid="form-container"
        >
          <div
            className={styles.formWithoutButtons}
            data-testid="form-with-buttons"
          >
           
            <div className={styles.formFieldsContainer}>
              <div>
                <div
                  className={styles.subHeadingDiv}
                  data-testid="sub-heading-div"
                >
                  <p
                    className={styles.titleHeading}
                    data-testid="title-heading"
                  >
                    Session configuration
                  </p>
                  <GrayLine data-testid="gray-line" />
                </div>
                <div className = {styles.registrationsDiv}>
                <div className={styles.formRow}>
                  <div className={styles.formRowContainer} data-testid="">
                    <p className={styles.labelText} data-testid="">
                      Set date & time
                    </p>
                    <div>
                    {/* Meeting Date */}
                    <div className={styles.formFieldMeeting}>
                      <Controller
                        control={control}
                        {...register("meetingDate")}
                        render={({ field }) => (
                          <CustomDatePicker
                            value={field.value}
                            futureDate={false}
                            onChange={(date) => {
                              field.onChange(date);
                              handleMeetingDateChange(date);
                              trigger("meetingDate");
                              trigger("meetingTime");
                              handleTriggerValidation();
                            }}
                            startDate={new Date()}
                            borderRight={true}
                            errorExist={!!errors.meetingDate}
                            errorMessage={errors.meetingDate?.message}
                            onKeyDown={handleKeyDown}
                            dataTestId="set-date"
                          />
                        )}
                      />
                    </div>
                    

                    {/* Meeting Start Time */}
                    <div className={styles.formFields}>
                      <Controller
                        control={control}
                        {...register("meetingTime")}
                        render={({ field }) => (
                          <CustomTimePicker
                            value={field.value}
                            errorExist={!!errors.meetingTime}
                            onChange={(time) => {
                              if (time && !isNaN(time.getTime())) {
                                field.onChange(time);
                              }
                              trigger("meetingTime");
                              trigger("meetingDate");
                              handleTriggerValidation();
                            }}
                            errorMessage={errors.meetingTime?.message}
                            data-testid="start-time-picker"
                            onKeyDown={handleKeyDown}
                          />
                        )}
                      />
                    </div>
                   
                  </div >
                  {
                    errors.meetingDate && (
                      <i
                        className={styles.errorMsg}
                        data-testid="error-msg-meeting-date"
                      >
                        {errors.meetingDate.message}
                      </i>
                    )
                  }
                  {
                    errors.meetingTime && (
                      <i
                        className={styles.errorMsg}
                        data-testid="error-msg-meeting-start-time"
                      >
                        {errors.meetingTime.message}
                      </i>
                    )
                  }
                  
                  </div>
                </div>
                <div className={styles.formRowLimit}>
                <div className={styles.limitDivform}>
                  <div className={styles.eachRanged} data-testid="">
                    <p
                      className={styles.labelFont}
                      data-testid="label-text-colored"
                    >
                      Session Duration
                    </p>
                       {/* Duration */}
                    <div className={styles.formFields}>
                      <Controller
                        {...register("duration")}
                        control={control}
                        render={({ field }) => (
                          <CustomTimeDropdown
                            initialDuration={field.value || duration}
                            onDurationSelect={(selectedDuration) => {
                              setDuration(selectedDuration);
                              field.onChange(selectedDuration);
                              handleTriggerValidation();
                              trigger("duration");
                            }}
                            errorExist={!!errors.duration}
                            data-testid="duration-dropdown"
                          />
                        )}
                      />
                    </div>
                    </div>
                    {
                      errors.duration && (
                        <i
                          className={styles.errorMsg}
                          data-testid="error-msg-duration"
                        >
                          {errors.duration.message}
                        </i>
                      )
                    }
              </div>
              </div>
              </div>
              </div>
              <div>
                <div
                  className={styles.subHeadingDiv}
                  data-testid="sub-heading-div"
                >
                  <p
                    className={styles.titleHeading}
                    data-testid="title-heading"
                  >
                    Registration configuration
                  </p>
                  <GrayLine data-testid="gray-line" />
                </div>
                
                <div className={styles.registrationsDiv}>
                  <div className={styles.formRow}>
                    <div
                      className={styles.formRowContainerRegistrations}
                      data-testid="form-row-container-registrations"
                    >
                      <div
                        className={styles.registerdiv}
                        data-testid="register-div"
                      >
                        <div
                          className={styles.RegisterDateDiv}
                          data-testid="register-date-div"
                        >
                          <p
                            className={styles.labelText}
                            data-testid="label-text-start-date"
                          >
                            Start date & time
                          </p>
                          <div>
                            <div
                              className={styles.formFieldMeeting}
                              data-testid="form-fields-registrations"
                            >
                              <Controller
                                {...register("registrationStartDate")}
                                control={control}
                                render={({ field }) => (
                                  <CustomDatePicker
                                    value={field.value}
                                    futureDate={true}
                                    onChange={(date) => {
                                      field.onChange(date);
                                      handleTriggerValidation();
                                      trigger("registrationStartDate");
                                      trigger("registrationStartTime");
                                    }}
                                    startDate={new Date()}
                                    borderRight={true}
                                    maxDate={
                                      getValues("meetingDate") ||
                                      getValues("registrationEndDate")
                                    }
                                    errorExist={
                                      !!errors.registrationStartDate ||
                                      !!errors.registrationStartTime
                                    }
                                    errorMessage={
                                      errors.registrationStartDate?.message
                                    }
                                    data-testid="custom-date-picker"
                                    onKeyDown={handleKeyDown}
                                    dataTestId="start-date"
                                  />
                                )}
                              />
                            </div>
                            <div
                              className={styles.formFields}
                              data-testid="form-fields"
                            >
                              <Controller
                                {...register("registrationStartTime")}
                                control={control}
                                render={({ field }) => (
                                  <CustomTimePicker
                                    value={
                                      field.value 
                                    }
                                    errorExist={
                                      !!errors.registrationStartDate ||
                                      !!errors.registrationStartTime
                                    }
                                    onChange={(time: Date | null) => {
                                      if (time && !isNaN(time.getTime())) {
                                        setValue("registrationStartTime", time);
                                      }
                                      handleTriggerValidation();
                                      trigger("registrationStartTime");
                                      trigger("registrationStartDate");
                                    }}
                                    data-testid="custom-time-picker"
                                    onKeyDown={handleKeyDown}
                                    dataTestid="start"
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={styles.RegisterDateDiv}
                          data-testid="register-time-div"
                        >
                        </div>
                      </div>
                      {errors.registrationStartDate && (
                        <i
                          className={styles.errorMsg}
                          data-testid="error-msg-start-date"
                        >
                          {errors.registrationStartDate.message}
                        </i>
                      )}
                      {errors.registrationStartTime &&
                        !errors.registrationStartDate && (
                          <i
                            className={styles.errorMsg}
                            data-testid="error-msg-start-time"
                          >
                            {errors.registrationStartTime.message}
                          </i>
                        )}
                    </div>
                  </div>
                  <div className={styles.formRow} data-testid="form-row">
                    <div
                      className={styles.formRowContainerRegistrations}
                      data-testid="form-row-container-registrations"
                    >
                      <div
                        className={styles.registerdiv}
                        data-testid="register-div"
                      >
                        <div
                          className={styles.RegisterDateDiv}
                          data-testid="register-date-div"
                        >
                          <p
                            className={styles.labelText}
                            data-testid="label-text-end-date"
                          >
                            End date & time
                          </p>
                          <div>
                            <div
                              className={styles.formFieldMeeting}
                              data-testid="form-fields-registrations"
                            >
                              <Controller
                                {...register("registrationEndDate")}
                                control={control}
                                render={({ field }) => (
                                  <CustomDatePicker
                                    value={field.value}
                                    futureDate={true}
                                    onChange={(date) => {
                                      field.onChange(date);
                                      handleTriggerValidation();
                                      trigger("registrationEndDate");
                                      trigger("registrationEndTime");
                                    }}
                                    borderRight={true}
                                    startDate={
                                      getValues("registrationStartDate") ||
                                      new Date()
                                    }
                                    maxDate={getValues("meetingDate")}
                                    errorExist={
                                      !!errors.registrationEndDate ||
                                      !!errors.registrationEndTime
                                    }
                                    errorMessage={
                                      errors.registrationEndDate?.message
                                    }
                                    data-testid="custom-date-picker"
                                    onKeyDown={handleKeyDown}
                                    dataTestId="end-date"
                                  />
                                )}
                              />
                            </div>
                            <div
                              className={styles.formFields}
                              data-testid="form-fields"
                            >
                              <Controller
                                {...register("registrationEndTime")}
                                control={control}
                                render={({ field }) => (
                                  <CustomTimePicker
                                    value={
                                      getValues("registrationEndTime") ||
                                      field.value
                                    }
                                    errorExist={
                                      !!errors.registrationEndDate ||
                                      !!errors.registrationEndTime
                                    }
                                    onChange={(time: Date | null) => {
                                      if (time && !isNaN(time.getTime())) {
                                        setValue("registrationEndTime", time);
                                      }
                                      handleTriggerValidation();
                                      trigger("registrationEndTime");
                                      trigger("registrationEndDate");
                                    }}
                                    data-testid="custom-time-picker"
                                    onKeyDown={handleKeyDown}
                                    dataTestid="end"
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={styles.RegisterDateDiv}
                          data-testid="register-time-div"
                        >
                        </div>
                      </div>
                      {errors.registrationEndDate && (
                        <i
                          className={styles.errorMsg}
                          data-testid="error-msg-end-date"
                        >
                          {errors.registrationEndDate.message}
                        </i>
                      )}
                      {errors.registrationEndTime &&
                        !errors.registrationEndDate && (
                          <i
                            className={styles.errorMsg}
                            data-testid="error-msg-end-time"
                          >
                            {errors.registrationEndTime.message}
                          </i>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formRowLimit}>
                <div className={styles.limitDiv}>
                  <div className={styles.limitEach} data-testid="limit-each">
                    <div className={styles.eachRange} data-testid="each-range">
                      <p className={styles.labelFont} data-testid="label-font">
                        Set video registrations limit{" "}
                        <span
                          className={styles.labelText}
                          data-testid="label-text"
                        >
                          <i>(Max: {panelistMaxValue})</i>
                        </span>
                      </p>
                      <div
                        className={`${styles.authenticationCard} ${errors.videoLimit ? styles.errorFields : ""}`}
                        data-testid="authentication-card"
                      >
                        <input
                          type="number"
                          {...register("videoLimit", { valueAsNumber: true })}
                          className={styles.enrolledText}
                          data-testid="video-limit-input"
                          onKeyDown={handleNonVideoLimitInput}
                        />
                      </div>
                    </div>
                    {errors.videoLimit && (
                      <p
                        className={styles.errorMsg}
                        data-testid="error-msg-video-limit"
                      >
                        {errors.videoLimit.message}
                      </p>
                    )}
                  </div>
                  <div className={styles.limitEach} data-testid="limit-each">
                    <div className={styles.eachRange} data-testid="each-range">
                      <p className={styles.labelFont} data-testid="label-font">
                        {" "}
                        Set non-video registrations limit{" "}
                        <i
                          className={styles.labelText}
                          data-testid="label-text"
                        >
                          (Max: {attendeesMaxValue})
                        </i>
                      </p>
                      <div
                        className={`${styles.authenticationCard} ${errors.nonVideoLimit ? styles.errorFields : ""}`}
                        data-testid="authentication-card"
                      >
                        <input
                          type="number"
                          {...register("nonVideoLimit", {
                            valueAsNumber: true,
                          })}
                          className={styles.enrolledText}
                          data-testid="non-video-limit-input"
                          onKeyDown={handleNonVideoLimitInput}
                        />
                      </div>
                    </div>
                    {errors.nonVideoLimit && (
                      <i
                        className={styles.errorMsg}
                        data-testid="error-msg-non-video"
                      >
                        {errors.nonVideoLimit.message}
                      </i>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.limitEachTimer} data-testid="limit-each">
              <div className={styles.timers}>
                <p className={styles.labelFont} data-testid="label-font">
                  {" "}
                  Set webinar pre join time for seeker{" "}
                  <i
                    className={styles.labelText}
                    data-testid="label-text"
                  >
                    (in mins)
                  </i>
                </p>
                <div data-testid="authentication-card">
                  <Controller
                    {...register("preJoinTime")}
                    control={control}
                    render={({ field }) => (
                      <CustomTimer
                        value={field.value}
                        errorExist={errors.preJoinTime ? true : false}
                        onChange={(date) => {
                          field.onChange(date);
                          handleTriggerValidation();
                          trigger("preJoinTime");
                        }}
                        data-testid="custom-time-picker"
                        onKeyDown={handleKeyDown}
                        dataTestid="end"
                      />
                    )}
                  />
                </div>
              </div>
              {errors.preJoinTime && (
                <i
                  className={styles.errorMsg}
                  data-testid="error-msg-non-video"
                >
                  {errors.preJoinTime.message}
                </i>
              )}
            </div>
            <div className={styles.limitEachTimer} data-testid="limit-each">
              <div className={styles.timers}>
                <p className={styles.labelFont} data-testid="label-font">
                  {" "}
                  Set webinar start enable time for admin{" "}
                  <i
                    className={styles.labelText}
                    data-testid="label-text"
                  >
                    (in mins)
                  </i>
                </p>
                <div data-testid="authentication-card">
                  <Controller
                    {...register("startEnableTime")}
                    control={control}
                    render={({ field }) => (
                      <CustomTimer
                        value={field.value}
                        errorExist={errors.startEnableTime ? true : false}
                        onChange={(date) => {
                          field.onChange(date);
                          handleTriggerValidation();
                          trigger("startEnableTime");
                        }}
                        data-testid="custom-time-picker"
                        onKeyDown={handleKeyDown}
                        dataTestid="end"
                      />
                    )}
                  />
                </div>
              </div>
              {errors.startEnableTime && (
                <i
                  className={styles.errorMsg}
                  data-testid="error-msg-non-video"
                >
                  {errors.startEnableTime.message}
                </i>
              )}
            </div>
            <div className={styles.nameFormRow}>
              <div className={styles.labelInput} data-testid="title-input">
                <div
                  className={styles.titleHeadingDiv}
                  data-testid="sub-heading-div"
                >
                  <p
                    className={styles.titleHeading}
                    data-testid="title-heading"
                  >
                    Enter a title for the infinipath
                  </p>
                  <GrayLine data-testid="gray-line" />
                </div>
                <div className={styles.fieldBlock} data-testid="field-block">
                  <input
                    data-testid="title-input"
                    {...register("title")}
                    value={inputValue}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    className={`${styles.inputFields} ${errors.title ? styles.errorFields : ""}`}
                  />
                </div>
                {errors.title && (
                  <i className={styles.errorMsg} data-testid="title-est-id">
                    {errors.title.message}
                  </i>
                )}
              </div>
            </div>

            <div className={styles.floatRegistration}>
              <RegistrationsOpenLayer
                registrationStartsAt={formattedRegistrationStart}
                formattedTime={registrationStartTime}
                registrationStartDataTestId="registration-start-date-create-meeting"
                formattedTimeDataTestId="registration-start-time-create-meeting"
                cardTitle="Registrations open on"
              />
              <div className={styles.cardContainer}>
                <div className={styles.cardContent} data-testid="card-content">
                  <span
                    className={styles.titleDisplay}
                    data-testid="title-display"
                  >
                    {inputValue}
                  </span>
                  <div className={styles.dateTime} data-testid="date-time">
                    <div
                      className={styles.calendar}
                      data-testid="calendar-date"
                    >
                      <img
                        src={calendar}
                        alt="calendar icon"
                        data-testid="calendar-icon"
                      />
                      {formattedMeetingStart && <span data-testid="formatted-date">
                        {getDayOfWeek(formattedMeetingStart)},{" "}
                        {getDateFromString(formattedMeetingStart)}-
                        {getMonthAbbreviation(formattedMeetingStart)}-
                        {getYearBasedOnDate(formattedMeetingStart)}
                      </span>}
                      {!formattedMeetingStart && <span data-testid="formatted-date">
                        --
                        </span>}
                    </div>
                    <div
                      className={styles.calendar}
                      data-testid="calendar-time"
                    >
                      <img
                        src={clockIcon}
                        alt="clock icon"
                        data-testid="clock-icon"
                      />
                      <p data-testid="duration-time">
                        {durationTime ? replaceDashWithTo(durationTime):"--"}
                      </p>
                      <span className={styles.timer} data-testid="timer">
                        {duration ? handleDurationFormat(duration) : "--"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.divWithButtons}>
            <GrayLine />
            {/* while editing we will get options like cancel,save,publish buttons */}
            {selectedMeeting ? (
              <div className={styles.formRowButton}>
                <Button
                  type="button"
                  buttonClassName={styles.buttonContainerSecondary}
                  buttonTextClassName={styles.buttonTextSecondary}
                  onClick={() =>
                    // selectedValuesSetting(selectedMeeting)
                    navigate("/admin/infinipath/sessions")
                  }
                  datatestid="create-meeting-cancel-button"
                  datatestidText="create-meeting-cancel"
                >
                  cancel
                </Button>
                <Button
                  type="submit"
                  buttonClassName={styles.buttonContainer}
                  buttonTextClassName={styles.buttonText}
                  datatestid="create-meeting-button"
                  datatestidText="create-meeting-confirm"
                  onClick={() => setClickedButton("Save")}
                >
                  save
                </Button>
                {/* <Button
                  type="submit"
                  buttonClassName={styles.buttonContainer}
                  buttonTextClassName={styles.buttonText}
                  datatestid="create-meeting-button"
                  datatestidText="create-meeting-confirm"
                  onClick={() => setClickedButton("Publish")}
                >
                  publish
                </Button> */}
              </div>
            ) : (
              <div className={styles.formRowButton}>
                <Button
                  type="button"
                  buttonClassName={styles.buttonContainerSecondary}
                  buttonTextClassName={styles.buttonTextSecondary}
                  onClick={() => {
                    navigate("/admin/infinipath/sessions");
                  }}
                  datatestid="create-meeting-cancel-button"
                  datatestidText="create-meeting-cancel"
                >
                  cancel
                </Button>
                <Button
                  type="submit"
                  buttonClassName={styles.buttonContainer}
                  buttonTextClassName={styles.buttonText}
                  datatestid="create-meeting-button"
                  datatestidText="create-meeting-confirm"
                  onClick={() => setClickedButton("confirm")}
                >
                  confirm
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
      {showPopup && (
        <SuccessPopUp
          open={showPopup}
          onclose={closePopup}
          onConfirm={() => navigate("/admin/infinipath/sessions")}
          onCancel={closePopup}
          confirmText="sessions"
          cancelText="cancel"
          confirmDataTestId="create-meeting-confirm-popup"
          cancelDataTestId="create-meeting-cancel-popup"
          title={meetingTitleForPopup}
        />
      )}
    </div>
  );
};
export default CreateMeetingForm;
