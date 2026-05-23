import * as yup from "yup";
import { attendeesMaxValue, panelistMaxValue } from "../../constants";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);

export const meetingFormSchema = yup.object().shape({
  // Title Validation
  title: yup
    .string()
    .required("Title is required")
    .max(50, "Title cannot exceed 50 characters"),

  // Meeting Date Validation
  meetingDate: yup
    .date()
    .required("Meeting date is required")
    .test(
      "is-not-in-past",
      "Please select a valid meeting date. Past dates are not allowed.",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day
        return value >= today;
      }
    )
    .typeError("Entered date is invalid"),

  // Meeting Time Validation
  meetingTime: yup
    .date()
    .required("Meeting time is required")
    .test(
      "is-not-too-soon",
      "Please select a valid meeting time. Past times are not allowed.",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const meetingDate = this.parent.meetingDate;
        if (!meetingDate) return true; // Skip validation if meetingDate is not provided
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day
        meetingDate.setHours(0, 0, 0, 0); // Set to start of the day
        if (
          meetingDate.getFullYear() === today.getFullYear() &&
          meetingDate.getMonth() === today.getMonth() &&
          meetingDate.getDate() === today.getDate()
        ) {
          const currentTime = new Date();
          const currentHours = currentTime.getHours();
          const currentMinutes = currentTime.getMinutes();
          const meetingHours = value.getHours();
          const meetingMinutes = value.getMinutes();
          // Compare the time parts
          if (
            meetingHours < currentHours ||
            (meetingHours === currentHours && meetingMinutes < currentMinutes)
          ) {
            return false;
          }
          return true;
        }
        return true;
      }
    )
    .typeError("Entered time is invalid"),

  // Registration Start Date Validation
  registrationStartDate: yup
    .date()
    .required("Registration start date is required")
    .test(
      "is-not-in-past",
      "Please select a valid registration date. Past dates are not allowed.",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day
        return value >= today;
      }
    )
    .test(
      "is-before-meeting-date",
      "Registration start date must be before or on meeting date",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const meetingDate = this.parent.meetingDate;
        if (!meetingDate) return true; // Skip validation if meetingDate is not provided
        meetingDate.setHours(0, 0, 0, 0); // Set to start of the day
        value.setHours(0, 0, 0, 0);
        return value <= meetingDate;
      }
    )
    .test(
      "is-before-registration-end",
      "Registration start date should be before or on registration end date",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const registrationEnd = this.parent.registrationEndDate;
        if (!registrationEnd) return true; // Skip validation if registrationEndDate is not provided
        value.setHours(0, 0, 0, 0); // Set to start of the day
        registrationEnd.setHours(0, 0, 0, 0); // Set to start of the day
        return value <= registrationEnd;
      }
    )
    .typeError("Entered date is invalid"),

  // Registration Start Time Validation
  registrationStartTime: yup
    .date()
    .required("Registration start time is required")
    .test(
      "is-not-too-soon",
      "Please select a valid registration start time. Past times are not allowed.",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const registrationStartDate = this.parent.registrationStartDate;
        if (!registrationStartDate) return true; // Skip validation if registrationStartDate is not provided
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day
        registrationStartDate.setHours(0, 0, 0, 0);
        if (
          registrationStartDate.getFullYear() === today.getFullYear() &&
          registrationStartDate.getMonth() === today.getMonth() &&
          registrationStartDate.getDate() === today.getDate()
        ) {
          const currentTime = new Date();
          const currentHours = currentTime.getHours();
          const currentMinutes = currentTime.getMinutes();
          const startHours = value.getHours();
          const startMinutes = value.getMinutes();
          // Compare the time parts with 10-minute buffer
          if (
            startHours < currentHours ||
            (startHours === currentHours && startMinutes < currentMinutes)
          ) {
            return false;
          }
          return true;
        }
        return true;
      }
    )
    .test(
      "is-before-registration-end-time",
      "Registration start time should be before registration end time on the same day",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const registrationEndTime = this.parent.registrationEndTime;
        const registrationStartDate = this.parent.registrationStartDate;
        const registrationEndDate = this.parent.registrationEndDate;
        if (!registrationEndTime || !registrationStartDate || !registrationEndDate) return true;
        registrationStartDate.setHours(0, 0, 0, 0);
        registrationEndDate.setHours(0, 0, 0, 0);
        if (
          registrationStartDate.getFullYear() === registrationEndDate.getFullYear() &&
          registrationStartDate.getMonth() === registrationEndDate.getMonth() &&
          registrationStartDate.getDate() === registrationEndDate.getDate()
        ) {
          registrationEndTime.setFullYear(value.getFullYear());
          registrationEndTime.setMonth(value.getMonth());
          registrationEndTime.setDate(value.getDate());
          return value <= registrationEndTime;
        }
        return true;
      }
    )
    .test(
      "is-before-meeting-time",
      "Registration start time should not exceed meeting time on the same day",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const meetingDate = this.parent.meetingDate;
        const registrationStartDate = this.parent.registrationStartDate;
        if (!meetingDate || !registrationStartDate) return true;
        if (
          registrationStartDate.getFullYear() === meetingDate.getFullYear() &&
          registrationStartDate.getMonth() === meetingDate.getMonth() &&
          registrationStartDate.getDate() === meetingDate.getDate()
        ) {
          const meetingTime = this.parent.meetingTime;
          if (!meetingTime) return true;
          value.setFullYear(meetingTime.getFullYear());
          value.setMonth(meetingTime.getMonth());
          value.setDate(meetingTime.getDate());
          const diff = meetingTime.getTime() - value.getTime();
          const diffInMinutes = Math.floor(diff / (1000 * 60));
          return diffInMinutes >= 0;
        }
        return true;
      }
    )
    .test(
      "is-before-meeting-time",
      "Registration start time should be less than meeting time",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const meetingDate = this.parent.meetingDate;
        const meetingTime = this.parent.meetingTime;
        const registrationStartDate = this.parent.registrationStartDate;

        // Ensure all dependent fields are defined
        if (!meetingDate || !meetingTime || !registrationStartDate) return true;

        // Check if registration start date and meeting date are the same
        registrationStartDate.setHours(0, 0, 0, 0);
        meetingDate.setHours(0, 0, 0, 0);

        if (
          registrationStartDate.getFullYear() === meetingDate.getFullYear() &&
          registrationStartDate.getMonth() === meetingDate.getMonth() &&
          registrationStartDate.getDate() === meetingDate.getDate()
        ) {
          // Align the registration start time and meeting time to the same date for comparison
          value.setFullYear(meetingTime.getFullYear());
          value.setMonth(meetingTime.getMonth());
          value.setDate(meetingTime.getDate());

          // Ensure the registration start time is less than the meeting time
          return value < meetingTime;
        }

        // If dates are different, skip this validation
        return true;
      }
    )
    .typeError("Entered time is invalid"),

  // Registration End Date Validation
  registrationEndDate: yup
    .date()
    .required("Registration end date is required")
    .test(
      "is-not-in-past",
      "Please select a valid registration end date. Past dates are not allowed.",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day
        return value >= today;
      }
    )
    .test(
      "is-before-meeting-date",
      "Registration end date must be before or on meeting date",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const meetingDate = this.parent.meetingDate;
        if (!meetingDate) return true; // Skip validation if meetingDate is not provided
        meetingDate.setHours(0, 0, 0, 0); // Set to start of the day
        value.setHours(0, 0, 0, 0);
        return value <= meetingDate;
      }
    )
    .test(
      "is-after-registration-start",
      "Registration end date should be after or on registration start date",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const registrationStartDate = this.parent.registrationStartDate;
        if (!registrationStartDate) return true; // Skip validation if registrationStartDate is not provided
        value.setHours(0, 0, 0, 0); // Set to start of the day
        registrationStartDate.setHours(0, 0, 0, 0); // Set to start of the day
        return value >= registrationStartDate;
      }
    )
    .typeError("Entered date is invalid"),

  // Registration End Time Validation
  registrationEndTime: yup
    .date()
    .required("Registration end time is required")
    .test(
      "is-not-too-soon",
      "Please select a valid registration end time. Past times are not allowed.",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const registrationEndDate = this.parent.registrationEndDate;
        if (!registrationEndDate) return true; // Skip validation if registrationEndDate is not provided
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day
        registrationEndDate.setHours(0, 0, 0, 0);
        if (registrationEndDate.getTime() === today.getTime()) {
          const currentTime = new Date();
          const currentHours = currentTime.getHours();
          const currentMinutes = currentTime.getMinutes();
          const endHours = value.getHours();
          const endMinutes = value.getMinutes();
          // Compare the time parts with 10-minute buffer
          if (
            endHours < currentHours ||
            (endHours === currentHours && endMinutes < currentMinutes)
          ) {
            return false;
          }
          return true;
        }
        return true;
      }
    )
    .test(
      "is-after-registration-start-time",
      "Registration end time should be after registration start time on the same day",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const registrationStartTime = this.parent.registrationStartTime;
        const registrationStartDate = this.parent.registrationStartDate;
        const registrationEndDate = this.parent.registrationEndDate;
        if (!registrationStartTime || !registrationStartDate || !registrationEndDate) return true;
        registrationStartDate.setHours(0, 0, 0, 0);
        registrationEndDate.setHours(0, 0, 0, 0);
        if (
          registrationStartDate.getFullYear() === registrationEndDate.getFullYear() &&
          registrationStartDate.getMonth() === registrationEndDate.getMonth() &&
          registrationStartDate.getDate() === registrationEndDate.getDate()
        ) {
          registrationStartTime.setFullYear(value.getFullYear());
          registrationStartTime.setMonth(value.getMonth());
          registrationStartTime.setDate(value.getDate());
          return value >= registrationStartTime;
        }
        return true;
      }
    )
    .test(
      "is-before-meeting-time",
      "Registration end time should not exceed meeting time on the same day",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const meetingDate = this.parent.meetingDate;
        const registrationEndDate = this.parent.registrationEndDate;
        if (!meetingDate || !registrationEndDate) return true;
        if (
          registrationEndDate.getFullYear() === meetingDate.getFullYear() &&
          registrationEndDate.getMonth() === meetingDate.getMonth() &&
          registrationEndDate.getDate() === meetingDate.getDate()
        ) {
          const meetingTime = this.parent.meetingTime;
          if (!meetingTime) return true;
          meetingTime.setFullYear(value.getFullYear());
          meetingTime.setMonth(value.getMonth());
          meetingTime.setDate(value.getDate());
          const diffInMs = meetingTime.getTime() - value.getTime();
          const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
          return diffInMinutes >= 0;
        }
        return true;
      }
    )
    .test(
      "is-after-registration-start-time",
      "Registration end time should be after registration start time",
      function (value) {
        if (!value) return false; // Ensure value is defined
        const registrationStartTime = this.parent.registrationStartTime;
        const registrationStartDate = this.parent.registrationStartDate;
        const registrationEndDate = this.parent.registrationEndDate;

        // Ensure all dependent fields are defined
        if (!registrationStartTime || !registrationStartDate || !registrationEndDate) return true;

        // Check if registration start and end dates are the same
        registrationStartDate.setHours(0, 0, 0, 0);
        registrationEndDate.setHours(0, 0, 0, 0);

        if (
          registrationStartDate.getFullYear() === registrationEndDate.getFullYear() &&
          registrationStartDate.getMonth() === registrationEndDate.getMonth() &&
          registrationStartDate.getDate() === registrationEndDate.getDate()
        ) {
          // Align the start time and end time to the same date for comparison
          registrationStartTime.setFullYear(value.getFullYear());
          registrationStartTime.setMonth(value.getMonth());
          registrationStartTime.setDate(value.getDate());

          // Ensure the end time is after the start time
          return value > registrationStartTime;
        }

        // If dates are different, skip this validation
        return true;
      }
    )
    .typeError("Entered time is invalid"),

  preJoinTime: yup
    .mixed<dayjs.Dayjs>()
    .required("Pre-join session time is required")
    .test(
      "does-not-exceed-registration-meeting-difference",
      "Pre-session join time should not be before registrations open time",
      function (value) {
        const registrationStartDate = this.parent.registrationStartDate;
        const registrationStartTime = this.parent.registrationStartTime;
        const meetingDate = this.parent.meetingDate;
        const meetingTime = this.parent.meetingTime;
    
        // Ensure all dependent fields are defined
        if (
          !registrationStartDate ||
          !registrationStartTime ||
          !meetingDate ||
          !meetingTime ||
          !value
        )
          return true; // Skip validation if any field is missing
    
        // Combine registration date and time into a single timestamp
        const registrationStartTimestamp = dayjs(
          `${dayjs(registrationStartDate).format("YYYY-MM-DD")} ${dayjs(registrationStartTime).format("HH:mm")}`
        );
    
        // Combine meeting date and time into a single timestamp
        const meetingTimestamp = dayjs(
          `${dayjs(meetingDate).format("YYYY-MM-DD")} ${dayjs(meetingTime).format("HH:mm")}`
        );
    
        // Calculate the difference in minutes between meeting time and registration start time
        const totalDiffInMinutes = meetingTimestamp.diff(registrationStartTimestamp, 'minute');
    
        // The join enable time value represents minutes before the meeting
        const preSessionJoinTimeInMinutes = Number(value.format("mm"));

        // Check if join enable time (in minutes before meeting) doesn't exceed the total timespan
        return preSessionJoinTimeInMinutes <= totalDiffInMinutes;
      }
    ),


  startEnableTime: yup
    .mixed<dayjs.Dayjs>()
    .required("Start enable time is required")
    .test(
      "is-greater-than-or-equal-to-pre-join-time",
      "Start enable time must be greater than or equal to pre-join time",
      function (value) {
        const preJoinTime = this.parent.preJoinTime;
        if (!value || !preJoinTime) return true; // Skip validation if either value is undefined
        const preJoinTimeInMinutes = Number(preJoinTime.format("mm"));
        const startEnableTimeInMinutes = Number(value.format("mm"));
        return preJoinTimeInMinutes <= startEnableTimeInMinutes;
      }
    )
    .test(
      "does-not-exceed-registration-meeting-difference",
      "Start enable time should not be before registrations open time",
      function (value) {
        const registrationStartDate = this.parent.registrationStartDate;
        const registrationStartTime = this.parent.registrationStartTime;
        const meetingDate = this.parent.meetingDate;
        const meetingTime = this.parent.meetingTime;
    
        // Ensure all dependent fields are defined
        if (
          !registrationStartDate ||
          !registrationStartTime ||
          !meetingDate ||
          !meetingTime ||
          !value
        )
          return true; // Skip validation if any field is missing
    
        // Combine registration date and time into a single timestamp
        const registrationStartTimestamp = dayjs(
          `${dayjs(registrationStartDate).format("YYYY-MM-DD")} ${dayjs(registrationStartTime).format("HH:mm")}`
        );
    
        // Combine meeting date and time into a single timestamp
        const meetingTimestamp = dayjs(
          `${dayjs(meetingDate).format("YYYY-MM-DD")} ${dayjs(meetingTime).format("HH:mm")}`
        );
    
        // Calculate the difference in minutes between meeting time and registration start time
        const totalDiffInMinutes = meetingTimestamp.diff(registrationStartTimestamp, 'minute');
    
        // The start enable time value represents minutes before the meeting
        const startEnableTimeInMinutes = Number(value.format("mm"));

        // Check if start enable time (in minutes before meeting) doesn't exceed the total timespan
        return startEnableTimeInMinutes <= totalDiffInMinutes;
      }
    ),

  // Duration Validation
  duration: yup
    .number()
    .required("Duration is required")
    .min(1, "Duration must be at least 1 minute")
    .max(1440, "Duration cannot exceed 24 hours")
    .typeError("Duration must be a number"),

  // Video Limit Validation
  videoLimit: yup
    .number()
    .required("Video limit is required")
    .min(1, "Video limit must be at least 1")
    .max(panelistMaxValue, `Video limit cannot exceed ${panelistMaxValue}`)
    .typeError("Video limit is required"),

  // Non-Video Limit Validation
  nonVideoLimit: yup
    .number()
    .required("Non-video limit is required")
    .min(1, "Non-video limit must be at least 1")
    .max(attendeesMaxValue, `Non-video limit cannot exceed ${attendeesMaxValue}`)
    .typeError("Non-video limit is required"),
});