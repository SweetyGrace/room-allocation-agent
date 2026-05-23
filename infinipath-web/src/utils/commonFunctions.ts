import { useNavigate } from "react-router-dom";
import { endPoints, INFINIPATH, PORTAL } from "../constants/urlConstants";
import { deleteCall, getCall, getCallWithLoader, postCall, putCall } from "../services/apiService";
import {
  getItemInLocalStorage,
  setItemInLocalStorage,
} from "../services/localStorage";
import { CompletedMeetingData } from "../components/TrackRegistrations";
import { MeetingData } from "../components/TrackSessions";
import { WEBINARSTATUS } from "../constants";
import CryptoJS from "crypto-js";
import hdbMsd from "../assets/images/hdbMsd.png";
import entrainment from "../assets/images/entrainment.png";
import tat from "../assets/images/tat.png";
import imageBanner from "../assets/images/bannerImg.png";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { ApprovalStatus, textConstant } from "../constants/textConstants";
import { SortOrderLower } from "../types/seatApproval";
import { downloadExcelFromApi } from "./downloadExcel";
import { WARNING } from "../constants";
import { KPI_FILTERS } from "../constants";
import { notify } from "../common/components/ToastMessage";


export function formatDateTime(
  dateTimeString: string,
  options: {
    showDayOfWeek?: boolean;
    use24HourFormat?: boolean;
  } = {},
): string {
  // Parse the input string manually to ensure correct IST interpretation
  const [datePart, timePart] = dateTimeString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Create a date object in local time zone (which should be IST)
  const date = new Date(year, month - 1, day, hour, minute);

  // Get day of the week
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = daysOfWeek[date.getDay()];

  // Get hours and minutes
  let hours = date.getHours();
  const minutes = date.getMinutes();

  let timeString = "";

  if (options.use24HourFormat) {
    // 24-hour format
    timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  } else {
    // 12-hour format
    const ampm = hours >= 12 ? "p.m." : "a.m.";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    timeString = `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }

  // Construct the formatted string
  return options.showDayOfWeek ? `${dayOfWeek}, ${timeString}` : timeString;
}

export function formatDateTimeCustom(dateTimeString: string): string {
  // Parse the input string manually to ensure correct IST interpretation
  const [datePart, timePart] = dateTimeString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Create a date object in local time zone (which should be IST)
  const date = new Date(year, month - 1, day, hour, minute);

  // Get month abbreviation
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const monthAbbr = months[date.getMonth()];

  // Get day of the week
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = daysOfWeek[date.getDay()];

  // Get hours and minutes
  let hours = date.getHours();
  const minutes = date.getMinutes();

  // 12-hour format
  const ampm = hours >= 12 ? "p.m." : "a.m.";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Construct the formatted string
  return `${monthAbbr} ${day.toString().padStart(2, "0")}, ${dayOfWeek} at ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export function getMonthAbbreviation(dateTimeString: string): string {
  if (dateTimeString === null) {
    return "";
  }
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  if (!dateTimeString) return "";
  // Extract the month from the date string
  const monthIndex = parseInt(dateTimeString.split("-")[1], 10) - 1;

  // Return the corresponding month abbreviation
  return months[monthIndex];
}

export function getDateFromString(dateTimeString: string): string {
  // Extract the date part from the string
  if (!dateTimeString) return "";
  const datePart = dateTimeString?.split("T")[0];
  // Split the date part and get the day
  const day = parseInt(datePart?.split("-")[2], 10);

  return day.toString().padStart(2, "0");
}

export function formatTime(dateTimeString: string): string {
  if (dateTimeString === null) {
    return "";
  }
  // Extract the time part from the string
  if (!dateTimeString) return "";
  const timePart = dateTimeString.split("T")[1];

  // Split the time part and get hours and minutes
  const [hours, minutes] = timePart.split(":").map(Number);

  // Determine if it's AM or PM
  const period = hours >= 12 ? "p.m." : "a.m.";

  // Convert to 12-hour format
  const hours12 = hours % 12 || 12;

  // Format the time string with leading zero for single digit hours
  return `${hours12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function getFutureTime(
  startDate: string,
  durationMinutes: number,
): string {
  // Parse the start date
  const [datePart, timePart] = startDate.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Create a Date object and add the duration
  const futureDate = new Date(year, month - 1, day, hour, minute);
  futureDate?.setMinutes(futureDate.getMinutes() + durationMinutes);

  // Extract hours and minutes from the future date
  let futureHours = futureDate.getHours();
  const futureMinutes = futureDate.getMinutes();

  // Determine AM or PM
  const period = futureHours >= 12 ? "p.m." : "a.m.";

  // Convert to 12-hour format
  futureHours = futureHours % 12 || 12;

  // Format the time string
  return `${futureHours}:${futureMinutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * @description this function is used to parse the ISO date to local date, when the dateString directly converting to date object it will converting to +5.30 hrs and making my day to next day
 * @param dateTimeString
 * @returns
 */
export function parseISOToLocalDate(dateTimeString?: string): Date {
  // Generated by Copilot
  if (!dateTimeString) return new Date(NaN);

  const [datePart, timePart] = dateTimeString.split("T");
  if (!datePart) return new Date(NaN);

  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) return new Date(NaN);

  if (!timePart) {
    // Only date provided, return local date at midnight
    return new Date(year, month - 1, day);
  }

  // Handle time part if present
  const [hours = 0, minutes = 0, seconds = 0] = timePart
    .split(":")
    .map((part) => {
      const [mainPart] = part.split(".");
      return Number(mainPart);
    });

  return new Date(year, month - 1, day, hours, minutes, seconds);
}
// Generated by Copilot

export function getDayOfWeek(dateTimeString: string): string {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Create a Date object from the input string
  const date = dateTimeString && parseISOToLocalDate(dateTimeString);

  // Get the day of the week (0-6, where 0 is Sunday)
  const dayIndex = date ? date.getDay() : 0;

  // Return the corresponding day name
  return daysOfWeek[dayIndex];
}

// Utility function to capitalize each word
export const capitalizeWords = (str: string) =>
  str?.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));

// Utility function to clean values by removing leading equals signs and whitespace
export const cleanValue = (value: string | number, pattern: RegExp = /^[=]/, replaceWith: string = ""): string =>{
  return String(value).replace(pattern, replaceWith);
};

// Utility function to replace underscores with spaces
export const replaceUnderscoresWithSpaces = (text: string): string => {
  return text.replace(/_/g, " ");
};

export function formatDateTimeWithHiphens(
  dateTimeString: string,
  includeTime: boolean = true,
): string {
  // Parse the input string manually to ensure correct IST interpretation
  const [datePart, timePart] = dateTimeString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Create a date object in local time zone (which should be IST)
  const date = new Date(year, month - 1, day, hour, minute);

  // Get month abbreviation
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthAbbr = months[date.getMonth()];

  // Get day of the week
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = daysOfWeek[date.getDay()];

  // Get hours and minutes
  let hours = date.getHours();
  const minutes = date.getMinutes();

  // 12-hour format
  const ampm = hours >= 12 ? "p.m" : "a.m.";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Base formatted string
  const dateString = `${dayOfWeek}, ${day.toString().padStart(2, "0")}-${monthAbbr}-${year.toString()}`;

  // Add time only if includeTime is true
  if (includeTime) {
    return `${dateString} at ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }

  return dateString;
}

export function calculateTimeForMeeting(
  meetingDateTimeString: string,
): string | null {
  const currentDateTime = new Date();
  // const meetingDateTime = new Date(meetingDateTimeString);

  // Parse the ISO string manually to avoid automatic time zone conversion
  const [datePart, timePart] = meetingDateTimeString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hoursEnd, minutesEnd, secondsEnd] = timePart.split(":").map((part) => {
    // Handle milliseconds and timezone information
    const [mainPart] = part.split(".");
    return Number(mainPart);
  });

  // Create a new Date object in local time
  const meetingDateTime = new Date(
    year,
    month - 1,
    day,
    hoursEnd,
    minutesEnd,
    secondsEnd,
  );

  // Calculate the time difference in milliseconds
  const timeDifference =
    meetingDateTime?.getTime() - currentDateTime?.getTime();

  if (timeDifference <= 0) {
    // If the meeting time is now or has already passed
    return null;
  }

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Pluralization helper
  const pluralize = (value: number, unit: string) =>
    `${value} ${unit}${value === 1 ? "" : "s"}`;

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${pluralize(days, "day")} ${pluralize(remainingHours, "hr")}`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${pluralize(hours, "hr")} ${pluralize(remainingMinutes, "min")}`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${pluralize(minutes, "min")} ${pluralize(remainingSeconds, "sec")}`;
  } else {
    return `${pluralize(seconds, "sec")}`;
  }
}

// GET YEAR FROM DATE STRING
export function getYearBasedOnDate(dateTimeString: string): string {
  if (dateTimeString === null) {
    return "";
  }
  // Extract the year from the date string
  if (!dateTimeString) return "";
  return dateTimeString.split("-")[0];
}

/**
 * Removes the country code from a phone number.
 * @param phoneNumber - The phone number with country code.
 * @param countryCode - The country code to remove.
 * @returns The phone number without the country code.
 */
export function removeCountryCode(
  phoneNumber: string,
  countryCode: string,
): string {
  // Ensure the country code starts with a plus sign
  if (countryCode.startsWith("+")) {
    countryCode = countryCode.slice(1);
  }

  // Remove the country code from the phone number
  if (phoneNumber.startsWith(countryCode)) {
    return phoneNumber.slice(countryCode.length);
  }

  // If the phone number does not start with the country code, return it as is
  return phoneNumber;
}
/**
 * Converts a date string in IST (Indian Standard Time) to a UTC (Coordinated Universal Time) string.
 *
 * @param istDateStr - The date string in IST format to be converted.
 * @returns A string representing the equivalent date and time in UTC format.
 */
export function convertISTToUTC(istDateStr: string): string {
  const istDate = new Date(istDateStr); // Parses the IST date
  const utcDate = new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000); // Subtract 5 hours 30 minutes
  return utcDate.toISOString(); // Returns in UTC format
}
/**
 * @param date - Date object to convert
 * @returns ISO string in UTC format
 */
export function convertDateToUTC(date: Date): string {
  const utcDate = new Date(date);
  utcDate.setHours(0, 0, 0, 0);
  
  // Get the user's timezone offset and adjust
  const offset = utcDate.getTimezoneOffset();
  utcDate.setMinutes(utcDate.getMinutes() - offset);
  
  return utcDate.toISOString();
}

/**
 * Converts a date to UTC ISO format with end of day time (23:59:59.999)
 * @param date - Date object to convert
 * @returns ISO string in UTC format with end of day time
 */
export function convertDateToUTCEndOfDay(date: Date): string {
  const utcDate = new Date(date);
  utcDate.setHours(23, 59, 59, 999);
  
  // Get the user's timezone offset and adjust
  const offset = utcDate.getTimezoneOffset();
  utcDate.setMinutes(utcDate.getMinutes() - offset);
  
  return utcDate.toISOString();
}

/**
 * Converts a date range to UTC ISO format
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Object with startDate and endDate in UTC ISO format
 */
export function convertDateRangeToUTC(startDate: Date, endDate: Date): { startDate: string; endDate: string } {
  return {
    startDate: convertDateToUTC(startDate),
    endDate: convertDateToUTCEndOfDay(endDate),
  };
}

/**
 * Converts a Dayjs object to UTC ISO format
 * @param dayjsDate - Dayjs object to convert
 * @returns ISO string in UTC format
 */
export function convertDayjsToUTC(dayjsDate: any): string {
  return dayjsDate.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
}

/**
 * Converts a date-time range to UTC ISO format
 * @param minDateTime - Minimum date-time (Dayjs)
 * @param maxDateTime - Maximum date-time (Dayjs)
 * @returns Object with min and max in UTC ISO format
 */
export function convertDateTimeRangeToUTC(minDateTime: any, maxDateTime: any): { min: string; max: string } {
  return {
    min: convertDayjsToUTC(minDateTime),
    max: convertDayjsToUTC(maxDateTime),
  };
}
/**
 * Checks if a given UTC date string is in the future compared to the current UTC time.
 *
 * @param utcDateString - The UTC date string to check.
 * @returns True if the given date is in the future, false otherwise.
 */
export function isFutureUTCTime(utcDateString: string): boolean {
  const givenDate = new Date(utcDateString);
  const currentUTCDate = new Date();

  // Get the current UTC time
  const currentUTC = new Date(
    Date.UTC(
      currentUTCDate.getUTCFullYear(),
      currentUTCDate.getUTCMonth(),
      currentUTCDate.getUTCDate(),
      currentUTCDate.getUTCHours(),
      currentUTCDate.getUTCMinutes(),
      currentUTCDate.getUTCSeconds(),
    ),
  );
  // Compare the given date with the current UTC time
  if (givenDate.getTime() < currentUTC.getTime()) {
    return true;
  } else {
    return false;
  }
}

// Adjust the import path as necessary
export const fetchSearchMemberDetails = (
  userId: string,
  searchText: string,
  setLoading: (loading: boolean) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSeekersData: (data: unknown) => void,
  setErrorMsg: (message: string) => void,
) => {
  setLoading(true);
  getCall(
    `${endPoints.getUsers}?user_id=${userId}&search_string=${searchText}`,
    undefined,
    INFINIPATH,
  )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((response: unknown) => {
      if (response?.data?.statusCode === 200) {
        setLoading(false);
        setSeekersData(response?.data?.data);
      } else {
        setLoading(false);
        console.error("Error:", response?.data?.message);
        setErrorMsg(response?.data?.message);
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((error: unknown) => {
      setLoading(false);
      console.error("Error:", error);
      setErrorMsg("Failed to fetch data");
    });
};

export const handleJoin = (
  verifiedSeekersIds: string[],
  isChecked: string[],
  setItemInLocalStorage: (key: string, value: unknown) => void,
  navigate: ReturnType<typeof useNavigate>,
) => {
  const attendanceIds = Array.from(
    new Set(
      [...verifiedSeekersIds, ...isChecked]?.filter(
        (id) => verifiedSeekersIds?.includes(id) && isChecked?.includes(id),
      ),
    ),
  );
  setItemInLocalStorage("verifiedSeekersIds", attendanceIds);
  navigate("/infinipath/zoom");
};

export const seekerExistanceCheck = (formattedPhone: unknown) => {
  const getUserPayload = {
    phone_number: formattedPhone,
    app_type: "infinipath",
  };
  return postCall(endPoints.getUser, getUserPayload, INFINIPATH)
    .then((response) => {
      if (response?.data?.statusCode === 200) {
        return response;
      }
      if (response?.data?.statusCode === 200) {
        return response;
      }
    })
    .catch((error) => {
      throw error;
    });
};

export const deleteSeekerAccount = (id: unknown) => {
  const seekerPayload = {
    // phone_number: phoneNumber,
    appType: "infinipath",
  };

  return deleteCall(`${endPoints.users}/${id}`, seekerPayload, INFINIPATH)
    .then((response) => {
      if (response?.data?.statusCode === 200) {
        return response;
      }
      return response;
    })
    .catch((error) => {
      throw error;
    });
};

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const formattedHours = hours.toString().padStart(2, "0");

  const formattedMinutes = remainingMinutes.toString().padStart(2, "0");
  if (hours === 0) {
    return `${formattedMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${formattedHours}h`;
  } else {
    return `${formattedHours}h ${formattedMinutes}m`;
  }
}

export const convertToISOFormat = (
  dateString: string,
  timeString?: string | Date,
): string => {
  const date = new Date(dateString);

  if (timeString instanceof Date) {
    const hours = timeString?.getHours();
    const minutes = timeString?.getMinutes();
    date.setHours(hours, minutes, 0, 0);
  } else if (typeof timeString === "string") {
    const [hours, minutes] = timeString.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
  // Adjust for the local time zone offset
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - offset);

  return date.toISOString();
};

export const calculateEndTime = (
  startTime: string,
  duration: string,
): string => {
  const [time, period] = startTime.split(" ");
  const [hours, minutes] = time.split(":").map(Number);

  let durationMinutes = 0;
  if (duration.includes("h")) {
    const [hours, mins] = duration.split("h");
    durationMinutes = Number(hours) * 60;
    if (mins) {
      durationMinutes += Number(mins.replace("m", ""));
    }
  } else {
    durationMinutes = Number(duration.replace("m", ""));
  }

  let totalMinutes = hours * 60 + minutes;
  if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
  if (period === "AM" && hours === 12) totalMinutes = minutes;

  totalMinutes += durationMinutes;

  let newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  let newPeriod = "AM";

  if (newHours >= 12) {
    newPeriod = "PM";
    if (newHours > 12) newHours -= 12;
  }
  if (newHours === 0) newHours = 12;

  return `${newHours}:${newMinutes.toString().padStart(2, "0")} ${newPeriod}`;
};

export const convertTimeToMinutes = (timeString: string): string => {
  let totalMinutes = 0;

  // Extract hours and minutes using regular expressions
  const hoursMatch = timeString.match(/(\d+)h/);
  const minutesMatch = timeString.match(/(\d+)m/);

  // Convert hours to minutes and add to total minutes
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60;
  }

  // Add minutes to total minutes
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
  }

  return totalMinutes.toString();
};

export const formattedTime = (time: string): string => {
  if (!time) return "";
  return time.replace(/AM/, "a.m").replace(/PM/, "p.m").replace(/a.m./, "a.m");
};

export const replaceDashWithTo = (timeRange: string): string => {
  return timeRange.replace(" - ", " to ");
};

export const formatTimeString = (timeString: string): string => {
  const timePattern = /(\d{1,2})h\s*(\d{1,2})m/;
  const minutePattern = /(\d{1,2})m/;
  const hourPattern = /(\d{1,2})h/;
  if (timePattern.test(timeString)) {
    const match = timeString.match(timePattern);
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const hourLabel = hours === 1 ? "hour" : "hours";
    const minuteLabel = "min";
    return `${hours} ${hourLabel} ${minutes} ${minuteLabel}`;
  } else if (minutePattern.test(timeString)) {
    const match = timeString.match(minutePattern);
    const minutes = parseInt(match[1], 10);
    const minuteLabel = "min";
    return `${minutes} ${minuteLabel}`;
  } else if (hourPattern.test(timeString)) {
    const match = timeString.match(hourPattern);
    const hours = parseInt(match[1], 10);
    const hourLabel = hours === 1 ? "hour" : "hours";

    return `${hours} ${hourLabel}`;
  } else {
    throw new Error("Invalid time format");
  }
};

/**
 * @description this function is used to get the admin latest meeting data
 * @param setLoading
 * @param setAdminMeetingData
 */
export const FetchMeetingDetails = (
  setLoading: (loading: boolean) => void,
  setAdminMeetingData: (data: unknown) => void,
) => {
  const userData = getItemInLocalStorage("seekerDetails");
  setLoading(true);
  getCall(`${endPoints.admin}/${userData?.id}/webinars`, undefined, INFINIPATH)
    .then((res) => {
      if (res?.data?.statusCode === 200) {
        setLoading(false);
        setAdminMeetingData(res?.data.data);
        setItemInLocalStorage("table_meeting_id", res?.data?.data?.meetingId);
      } else {
        setLoading(false);
      }
    })
    .catch((err) => {
      setLoading(false);
    })
    .finally(() => setLoading(false));
};
// Utility function to capitalize the first letter of a string
export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Utility function to calculate the age from a date of birth string
export const calculateAge = (dobString: string): string => {
  if (!dobString) return "-"; // Handle empty values
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age.toString();
};
export const FetchWebinarList = (
  setAdminDataLoading: (loading: boolean) => void,
  setLoading: (loading: boolean) => void,
  setAdminMeetingData: React.Dispatch<React.SetStateAction<MeetingData[]>>,
  setAdminCompletedMeetingData: React.Dispatch<
    React.SetStateAction<CompletedMeetingData[]>
  >,
) => {
  const userData = getItemInLocalStorage("seekerDetails");
  getCall(
    `${endPoints.webinars}?userId=${userData?.id}&page=1&limit=2000`,
    undefined,
    INFINIPATH,
  )
    .then((res) => {
      if (res?.data?.statusCode === 200) {
        setAdminDataLoading(false);
        const meetingData = res?.data.data.data.filter(
          (item: MeetingData) =>
            item?.webinarStatus !== WEBINARSTATUS.COMPLETED,
        );
        setAdminMeetingData(meetingData);
        const completedData = res?.data.data.data.filter(
          (item: CompletedMeetingData) =>
            item?.webinarStatus == WEBINARSTATUS.COMPLETED,
        );
        setAdminCompletedMeetingData(completedData);
      } else {
        setLoading(false);
      }
    })
    .catch((err) => {
      setLoading(false);
    })
    .finally(() => setLoading(false));
};

export const FetchCompletedWebinarList = (
  setCompletedDataLoading: (loading: boolean) => void,
  setLoading: (loading: boolean) => void,
  setAdminCompletedMeetingData: React.Dispatch<
    React.SetStateAction<CompletedMeetingData[]>
  >,
) => {
  const userData = getItemInLocalStorage("seekerDetails");
  getCall(
    `${endPoints.completedWebinars}?userId=${userData?.id}&page=1&limit=2000`,
    undefined,
    INFINIPATH,
  )
    .then((res) => {
      if (res?.data?.statusCode === 200) {
        setCompletedDataLoading(false);
        setAdminCompletedMeetingData(res?.data.data);
      } else {
        setLoading(false);
        alert("Failed to fetch data");
      }
    })
    .catch((err) => {
      setLoading(false);
      alert("Failed to fetch data");
    })
    .finally(() => setLoading(false));
};

/**
 * @description Function to update the webinar details
 * @param setLoading
 * @param data
 *  @param isPublished
 * @param webinarId
 * @param type
 */
export const UpdateWebinar = (
  setLoading: (loading: boolean) => void,
  data: unknown,
  isPublished: boolean,
  webinarId: string,
  type?: string,
): Promise<unknown> => {
  let payload: unknown;

  const finalStatus = isPublished
    ? data?.webinarStatus === WEBINARSTATUS.DRAFT
      ? WEBINARSTATUS.INTERNAL
      : type === WEBINARSTATUS.PUBLISHED
        ? WEBINARSTATUS.PUBLISHED
        : type === WEBINARSTATUS.COMPLETED
          ? WEBINARSTATUS.COMPLETED
          : WEBINARSTATUS.DRAFT
    : data?.webinarStatus;

  // If webinarStatus is 'completed', send minimal payload
  if (finalStatus === WEBINARSTATUS.COMPLETED) {
    payload = {
      webinarStatus: WEBINARSTATUS.COMPLETED,
      meeting_id: data?.meeting_id, // fallback if not provided
    };
  } else {
    payload = {
      title: data?.title,
      password: "",
      startDate: data?.startAt,
      duration: data?.duration,
      startAt: data?.startAt,
      registrationStartsAt: data?.registrationStartsAt,
      registrationEndsAt: data?.registrationEndsAt,
      meeting_id: data?.meeting_id,
      webinarStatus: finalStatus,
      programSessionId: 1,
      createdBy: "Admin",
      maxVideoLimit: data?.maxVideoLimit,
      maxNonVideoLimit: data?.maxNonVideoLimit,
      joinEnableTime: data?.joinEnableTime,
      startEnableTime: data?.startEnableTime,
    };
  }
  return putCall(`${endPoints.webinars}/${webinarId}`, payload, INFINIPATH)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw err;
    })
    .finally(() => setLoading(false));
};

/**
 * @description Converting the age distribution to a combined format as per UI
 * @param agePercentages
 * @returns
 */
export const convertAgeDestribution = (agePercentages: {
  [key: string]: number;
}) => {
  const combinedAgePercentages = {
    "3-18": parseFloat(agePercentages["3-18"].toFixed(2)),
    "19-60": parseFloat(
      (
        agePercentages["18-29"] +
        agePercentages["29-40"] +
        agePercentages["40-60"]
      ).toFixed(2),
    ),
    "60+": parseFloat(agePercentages["60+"].toFixed(2)),
  };
  return combinedAgePercentages;
};

/**
 * @description Converting the method of attendance as per UI
 * @param agePercentages
 * @returns
 */
export const modifyMethodOfAttendance = (data: unknown) => {
  const modifiedData = {
    "Own device": data?.selfJoiningPercentage,
    "Other device": data?.joiningOnOtherDevicePercentage,
    "Cross device": data?.joiningWithOthersPercentage,
  };
  return modifiedData;
};

/**
 * @description Custom Numbers for method of attendance
 * @param agePercentages
 * @returns
 */
export const customNumbersMethodOfAttendance = (data: unknown) => {
  const modifiedData = {
    "Own device": data?.joiningModeData?.selfJoining,
    "Other device": data?.joiningModeData?.joiningOnOtherDevice,
    "Cross device": data?.joiningModeData?.joiningWithOthers,
  };
  return modifiedData;
};
interface DeviceData {
  deviceType: string;
  percentage: number;
}

export const convertArrayToObject = (
  data: DeviceData[],
): { [key: string]: number } => {
  return data?.reduce(
    (acc, item) => {
      acc[item?.deviceType] = item.percentage;
      return acc;
    },
    {} as { [key: string]: number },
  );
};

export const modifyAudienceDiscipline = (data: unknown) => {
  const modifiedData = {
    Cancellations: data?.cancellations || 0,
    "Video downgrades": data?.videoDowngraded || 0,
    "Late joiners count": data?.lateJoinersCount || 0,
    Rejoins: data?.rejoinersCount || 0,
  };
  return modifiedData;
};

export const modifyProfileUrl = (url: string): string => {
  if (!url) {
    console.warn("modifyProfileUrl called with invalid url:", url);
    return ""; // or return some default image URL
  }

  try {
    const urlObject = new URL(url, process.env.REACT_APP_WEB_URL);
    // If `url` is relative, `new URL(relative, base)` will work

    const newDomain = new URL(process.env.REACT_APP_WEB_URL || "");
    urlObject.protocol = newDomain.protocol;
    urlObject.hostname = newDomain.hostname;

    return urlObject.toString();
  } catch (error) {
    console.error("Invalid URL passed to modifyProfileUrl:", url);
    return ""; // or return fallback
  }
};

/**
 * @description Function to convert the ISO date to 12 hour format
 * @param isoString
 */

export const convertISOTo12HourFormat = (isoString: string) => {
  const date = new Date(isoString);
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const formattedTime = `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
  return formattedTime;
};

/**
 * @description function to format the minutes to hours and minutes
 * @param totalMinutes
 */
export const formatMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hoursString = hours > 0 ? hours.toString().padStart(2, "0") + "h" : "";
  const minutesString =
    minutes > 0 ? " " + minutes.toString().padStart(2, "0") + "m" : "";

  return hoursString + minutesString;
};

/**
 * @description function to format date
 * @param isoString
 */
export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "UTC", // Adjust this to your desired timezone if needed
  });
};

export const formatDateWithDay = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * @description this function is used to validate bulk upload room columns xl format
 * @param data
 */
export const validateFormat = (data: unknown) => {
  const headers = data[0];
  const requiredHeaders =
    '["First name","Last name","Age","Mobile number","City","Type of registration"]';
  return JSON.stringify(headers) === requiredHeaders;
};

/**
 * @description this function is used to convert the bulk upload register columns header xl format to required format
 * @param data
 */
export const UploadFormat = (data: unknown) => {
  const headers = data[0]; // Extract the headers from the data
  const requiredHeaders = [
    "SNo",
    "Country Code",
    "Phone Number",
    "First Name",
    "Last Name",
    "Email",
    "Registration Type",
  ]; // Define the required headers as an array

  // Sort both arrays alphabetically and compare them
  const isValidFormat =
    JSON.stringify(headers.sort()) === JSON.stringify(requiredHeaders.sort());
  return isValidFormat;
};

/**
 * @description this function is used to convert to base64
 * @param file
 */
export const convertFileToBase64 = (file: File) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    const base64 = reader.result as string;
    const base64WithoutPrefix = base64.replace(
      /^data:application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,/,
      "",
    );
    return base64WithoutPrefix;
  };
  reader.onerror = (error) => {
    console.error("Error converting file to Base64:", error);
    return null;
  };
};

export const canStartSession = (
  startAt: string,
  startEnableTime: number = 15,
): boolean => {
  if (!startAt) return false;

  // Parse the ISO string manually to avoid timezone conversion
  const [datePart, timePart] = startAt.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  // Create dates in local timezone
  const now = new Date();
  const meetingStartTime = new Date(year, month - 1, day, hours, minutes);
  const enableTimeInMinutes = startEnableTime || 15;
  // Calculate enable time in local timezone
  const enableTime = new Date(
    meetingStartTime.getTime() - enableTimeInMinutes * 60 * 1000,
  );

  // Return true if current time is between enable time and meeting start time
  return now >= enableTime;
};

// function to convert date to format Day, DD-MMM-YYYY
export const formattedDateWithDay = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  };
  const formatted = date.toLocaleDateString("en-GB", options);
  const [weekday, day, month, year] = formatted.split(" ");
  return `${weekday} ${day}-${month}-${year}`;
};

export const formatSingleDigit = (num: number): string => {
  return num < 10 ? `0${num}` : `${num}`;
};

export const updateNumberFormat = (value: string): string => {
  const numberValue = parseInt(value, 10);
  if (numberValue > 9) {
    return numberValue.toString();
  } else {
    return "0" + numberValue.toString();
  }
};

export const abbreviateGender = (gender: string): string => {
  const normalizedGender = gender.toLowerCase();
  if (normalizedGender === "male" || normalizedGender === "Male") {
    return "M";
  } else if (normalizedGender === "female" || normalizedGender === "Female") {
    return "F";
  } else {
    return "Other";
  }
};

export const ageMapping: { [key: string]: string } = {
  AgeLessThan18: "<=18",
  AgeBetween19And29: "19 - 29",
  AgeBetween30And59: "30 - 59",
  AgeGreaterThan60: ">=60",
};

export const camelCaseAgeMapping: { [key: string]: string } = {
  ageLessThan18: "<=18",
  ageBetween19And29: "19 - 29",
  ageBetween30And59: "30 - 59",
  ageGreaterThan60: ">=60",
};

/**
 * Formats a time range based on a start date and a duration in minutes.
 *
 * The function calculates the end time by adding the duration (in minutes)
 * to the start date and formats both the start and end times in a
 * 12-hour clock format with "a.m." and "p.m." suffixes.
 *
 * @param startDate - The starting date and time of the range.
 * @param durationMinutes - The duration of the time range in minutes.
 * @returns A formatted string representing the time range in the format
 *          "startTime - endTime" (e.g., "10:00 a.m. - 11:30 a.m.").
 */
export const formatTimeRange = (startDate: Date, durationMinutes: number) => {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  // Format start time
  const startTime = new Intl.DateTimeFormat("en-US", options).format(startDate);

  // Calculate end time
  const endDate = new Date(startDate.getTime() + durationMinutes);
  const endTime = new Intl.DateTimeFormat("en-US", options).format(endDate);
  // Return formatted time range
  // replace AM and PM with a.m. and p.m.
  const formattedStartTime = startTime
    .replace(/AM/, "a.m.")
    .replace(/PM/, "p.m.");
  const formattedEndTime = endTime.replace(/AM/, "a.m.").replace(/PM/, "p.m.");
  return `${formattedStartTime} - ${formattedEndTime}`;
};

export const canStartEnableSession = (
  startAt: string,
  startEnableTime: number = 15,
  endDate: string,
): boolean => {
  if (!startAt || !endDate) return false;

  const currentTime = new Date();
  const endDateTime = new Date(endDate.replace("Z", "+05:30"));
  const endDateTimePlus45Mins = new Date(
    endDateTime.getTime() + 45 * 60 * 1000,
  ); // Add  45 minutes to the end date
  // Check if the current time is less than or equal to the end time plus 45 minutes
  if (currentTime > endDateTimePlus45Mins) {
    return false;
  }

  // Parse the ISO string manually to avoid timezone conversion
  const [datePart, timePart] = startAt.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  // Create dates in local timezone
  const meetingStartTime = new Date(year, month - 1, day, hours, minutes);
  const enableTimeInMinutes = startEnableTime || 15;

  // Calculate enable time in local timezone
  const enableTime = new Date(
    meetingStartTime.getTime() - enableTimeInMinutes * 60 * 1000,
  );
  // Check if the current time is between enable time and meeting start time
  return currentTime >= enableTime;
};

export const formatTimeDuration = (duration: string): string => {
  // my string is hh:mm:ss if hh 00 the retunr mm m ss s like that
  if (duration === "-") return "0";
  const [hours, minutes, seconds] = duration.split(":").map(Number);
  let formattedDuration = "";
  if (hours > 0) {
    formattedDuration += `${hours}h `;
  }
  if (minutes > 0) {
    formattedDuration += `${minutes}m `;
  }
  if (seconds > 0) {
    formattedDuration += `${seconds}s`;
  }
  // if all 0 then return 0
  if (formattedDuration.trim() === "") {
    return "0";
  }
  return formattedDuration.trim();
};

export const checkStartTime = (startAt: string): boolean => {
  if (!startAt) return false;

  const currentTime = new Date();
  const startDateTime = new Date(startAt.replace("Z", "+05:30"));
  if (currentTime > startDateTime) {
    return false;
  }

  return true;
};

export const checkForMarkAsCompleted = (endDate: string): boolean => {
  if (!endDate) return false;

  const currentTime = new Date();
  const endDateTime = new Date(endDate.replace("Z", "+05:30"));
  if (currentTime > endDateTime) {
    return true;
  }

  return false;
};

// filter options mapping
export const filterOptionsMapping: { [key: string]: string } = {
  ageGroup: "Age Groups",
  audienceType: "Audience Types",
  gender: "Gender",
  location: "Locations",
};
// gender mapping
export const genderMapping: { [key: string]: string } = {
  Male: "Male",
  Female: "Female",
};

/**
 * Converts an array of age range strings into their corresponding descriptive mappings.
 *
 * This function takes an array of age range strings (e.g., "<=18", "19 - 29") and maps
 * them to more descriptive string representations (e.g., "AgeLessThan18", "AgeBetween19And29").
 * If an age range does not match any of the predefined cases, it is returned as-is.
 *
 * @param ages - An array of age range strings to be converted.
 * @returns A new array of strings with the descriptive mappings for the age ranges.
 *
 * @example
 * ```typescript
 * const ages = ["<=18", "19 - 29", "30 - 59", ">=60"];
 * const result = reverseAgeMapping(ages);
 * ```
 */
export const reverseAgeMapping = (ages: string[]): string[] => {
  return ages.map((age) => {
    switch (age) {
      case "<=18":
        return "AgeLessThan18";
      case "19 - 29":
        return "AgeBetween19And29";
      case "30 - 59":
        return "AgeBetween30And59";
      case ">=60":
        return "AgeGreaterThan60";
      default:
        return age;
    }
  });
};

// Function to generate a random color
export const generateRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Function to create an array of colors
export const getColorsArray = (
  baseColors: string[],
  length: number,
): string[] => {
  const colors = [...baseColors]; // Start with the base colors
  while (colors.length < length) {
    colors.push(generateRandomColor()); // Add random colors until the desired length is reached
  }
  return colors;
};

// Function to format a date to YYYY-MM-DD 00:00:00+00
export const formatDateRange = (time: string, date: Date | null): string => {
  if (!date) return "";
  // Adjust the date to UTC midnight
  const utcDate =
    time === "startDate"
      ? new Date(
          Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            0,
            0,
            0,
          ),
        )
      : new Date(
          Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            23,
            59,
            59,
          ),
        );

  // Get the UTC components of the date
  const year = utcDate.getUTCFullYear();
  const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
  const day = utcDate.getUTCDate().toString().padStart(2, "0");
  const hours = utcDate.getUTCHours().toString().padStart(2, "0");
  const minutes = utcDate.getUTCMinutes().toString().padStart(2, "0");
  const seconds = utcDate.getUTCSeconds().toString().padStart(2, "0");

  // Format the date as "YYYY-MM-DD HH:mm:ss+00"
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}+00`;
};

// Function to format a decimal value to one decimal place
// This function takes a string or number as input and returns a number formatted to one decimal place
export const formateDecimalValue = (value: string | number): number => {
  if (value === null || value === undefined) return 0;
  const number = parseFloat(value.toString());
  if (isNaN(number)) return 0;
  return Math.floor(number * 10) / 10;
};

// Function to format object values to one decimal place
// This function takes an object with string keys and number values
export const formatKpiObjectValues = (
  data: Record<string, number>,
): Record<string, number> | null => {
  const formattedData: Record<string, number> = {};
  if (data === null || data === undefined) return null;
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      formattedData[key] = 0;
    } else {
      formattedData[key] = formateDecimalValue(value.toString());
    }
  });

  return formattedData;
};

export function formatCount(count: number): string {
  if (count >= 100000) {
    return (count / 100000).toFixed(count % 100000 === 0 ? 0 : 1) + "l";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + "k";
  }
  return count.toString();
}

export const getFormattedDate = (date: string) => {
  if (date != undefined && date != null && date.length > 0)
    return (
      getDateFromString(date) +
      "-" +
      getMonthAbbreviation(date) +
      "-" +
      getYearBasedOnDate(date) +
      " | " +
      formatTime(date)
    );
  else return "-";
};

/**
 *
 * @param seconds - The duration in seconds to be formatted.
 * @description This function takes a duration in seconds and formats it into a human-readable string.
 * It converts the duration into hours and minutes, and returns a string representation.
 * @returns
 */
export const formateTimeSpentDuration = (seconds: number): string => {
  // Handle zero case first
  if (seconds === 0 || seconds === undefined) return "0 minutes";

  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  let result = "";
  if (hours > 0) result += `${hours} hour${hours !== 1 ? "s" : ""}`;
  if (minutes > 0) result += ` ${minutes} minute${minutes !== 1 ? "s" : ""}`;
  return result.trim();
};

/**
 * @description this function is used to decrypt the data
 * @param encryptedData
 * @returns decrypted string
 */
export const decryptData = (encryptedData: string): string => {
  try {
    // Return empty string if no data provided
    if (!encryptedData) return "";

    // Split the encrypted data into IV and actual encrypted content
    // Format is "IV:encryptedContent"
    const [ivHex, encryptedHex] = encryptedData.split(":");

    // Convert the hexadecimal IV string to CryptoJS WordArray format
    const iv = CryptoJS.enc.Hex.parse(ivHex);

    // Convert the hexadecimal encrypted content to CryptoJS WordArray
    const ciphertext = CryptoJS.enc.Hex.parse(encryptedHex);

    // Convert the encryption key from UTF8 string to WordArray
    const key = CryptoJS.enc.Utf8.parse(
      `${process.env.REACT_APP_DECRYPTION_KEY}`,
    );

    // Perform decryption using AES
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext }, // Pass encrypted data as object
      key, // Encryption key
      {
        iv: iv, // Initialization Vector
        mode: CryptoJS.mode.CBC, // Cipher Block Chaining mode
        padding: CryptoJS.pad.Pkcs7, // Standard padding scheme
      },
    );

    // Convert the decrypted WordArray to UTF8 string
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

    return plaintext;
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
};

export const formatDurationTime = (seconds: number): string => {
  if (!seconds) return "-";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

  return parts.join(" ") || "0s";
};

export const calculateOffset = (currentPage: number, pageLimit: number) => {
  return (currentPage - 1) * pageLimit;
};

export const formattingCount = (count: number | undefined): string => {
  if (!count && count !== 0) return "00";
  return count < 10 ? `0${count}` : `${count}`;
};

export const formatDateToolTip = (dateStr: string) => {
  try {
    // Extract parts from "apr29,2025" format
    const match = dateStr.match(/([a-z]+)(\d+),(\d+)/i);
    if (!match) return dateStr;

    // Destructure array starting from index 1 to skip full match
    const [, month, day, year] = match;

    // Month abbreviations map
    const monthAbbreviations: { [key: string]: string } = {
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      june: "Jun",
      july: "Jul",
      aug: "Aug",
      sept: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Dec",
    };

    // Add ordinal suffix to date
    const dayNum = parseInt(day);

    // Format month
    const formattedMonth = monthAbbreviations[month.toLowerCase()] || month;

    // Format year to 2 digits
    const shortYear = year.slice(-2);

    return `${dayNum} ${formattedMonth} ${shortYear}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateStr; // Return original string if formatting fails
  }
};

/**
 * @description this function is used to redirect the user to zoom link in other tab
 * @param meetingId
 * @param seekerId
 */
export const handleZoomRedirection = () => {
  const selectedMeetingData = getItemInLocalStorage("table_meeting_id");
  const seekerDetails = getItemInLocalStorage("seekerDetails");
  getCall(
    `${endPoints.webinars}/${selectedMeetingData}/user/${seekerDetails?.id}/join-details`,
    undefined,
    INFINIPATH,
  )
    .then((response) => {
      if (response?.data?.statusCode === 200) {
        const meetingUrl =
          response?.data?.data?.joinUrl || response?.data?.data?.startUrl;
        if (meetingUrl) {
          window.open(meetingUrl, "_blank");
        } else {
          console.warn("No Zoom link available.");
        }
      } else {
        console.log(
          "The session has been ended, you are being redirected to the home page…",
        );
      }
    })
    .catch((err: unknown) => {
      console.error(err, "error");
    });
};

/**
 * Converts a time string in the format "HH:MM:SS" to seconds.
 * @param timeString - The time string to convert (e.g., "01:30:45").
 * @returns The total number of seconds.
 */
export const convertToSeconds = (timeString: string): number => {
  if (!timeString) return 0;

  const [hours, minutes, seconds] = timeString.split(":").map(Number);

  return (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
};

export const FetchAggregateWebinarList = (
  setAdminDataLoading: (loading: boolean) => void,
  setLoading: (loading: boolean) => void,
  setAdminMeetingData: React.Dispatch<React.SetStateAction<MeetingData[]>>,
  setAdminCompletedMeetingData: React.Dispatch<
    React.SetStateAction<CompletedMeetingData[]>
  >,
) => {
  const userData = getItemInLocalStorage("seekerDetails");
  getCall(
    `${endPoints.aggregateWebinarsList}?userId=${userData?.id}&page=1&limit=2000`,
    undefined,
    INFINIPATH,
  )
    .then((res) => {
      if (res?.data?.statusCode === 200) {
        setAdminDataLoading(false);
        const meetingData = res?.data.data.data.filter(
          (item: MeetingData) =>
            item?.webinarStatus !== WEBINARSTATUS.COMPLETED,
        );
        setAdminMeetingData(meetingData);
        // setAdminMeetingData(res?.data.data.data);
        const completedData = res?.data.data.data.filter(
          (item: CompletedMeetingData) =>
            item?.webinarStatus == WEBINARSTATUS.COMPLETED,
        );
        setAdminCompletedMeetingData(completedData);
      } else {
        setLoading(false);
        // setErrorMsg(res?.data?.message);
        alert("Failed to fetch data");
      }
    })
    .catch((err) => {
      setLoading(false);
      // setErrorMsg("Failed to fetch data");
      alert("Failed to fetch data");
    })
    .finally(() => setLoading(false));
};

// Utility function to format dates as "YYYY-MM-DD HH:mm:ss+00" in UTC
export const formatDateToUTC = (date: Date, isStart: boolean) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate() + 1).padStart(2, "0");
  const time = isStart ? "00:00:00" : "23:59:59";
  return `${year}-${month}-${day} ${time}+00`;
};

// Utility function to format dates as "YYYY-MM-DD HH:mm:ss"
export const formatDateWithoutUTC = (date: Date, isStart: boolean) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const time = isStart ? "00:00:00" : "23:59:59";
  return `${year}-${month}-${day} ${time}`;
};

// Function to get the appropriate image based on program type name
export const getProgramImage = (programTypeName) => {
  const name = programTypeName?.toLowerCase();
  if (name?.includes("hdb") || name?.includes("msd")) {
    return hdbMsd;
  } else if (name?.includes("entertainment") || name?.includes("entrainment")) {
    return entrainment;
  } else if (name?.includes("tat")) {
    return tat;
  }
  return hdbMsd; // Default image
};

const s3 = new S3Client({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY || "",
  },
});

export const getProgramImageForBanner = (programTypeName: string) => {
  const name = programTypeName?.toLowerCase();
  if (name?.includes("hdb") || name?.includes("msd")) {
    return hdbMsd;
  } else if (name?.includes("entertainment") || name?.includes("entrainment")) {
    return imageBanner;
  } else if (name?.includes("tat")) {
    return tat;
  }
  return imageBanner; // Default image
};

export const handleAWSFileUpload = async (
  file: File,
): Promise<string | null> => {
  // testS3Connection().then((isConnected) => {
  //   if (!isConnected) {
  //     alert('AWS S3 connection failed. Please check your configuration.');
  //     return null;
  //   }
  // })
  // debugger;
  const fileKey = `temp/${Date.now().toString()}`;
  const fileUrl = `https://${process.env.REACT_APP_AWS_BUCKET_NAME}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${fileKey}`;
  const blob = await convertFileToBlob(file);
  const params = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME, // "infinitheism-serverless",
    Key: fileKey,
    Body: blob,
    ContentType: file.type,
  };
  // Using AWS SDK to upload the image
  const upload = new Upload({
    client: s3,
    params: params,
  });

  await upload.done();
  return fileUrl;
};
const convertFileToBlob = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });
  return blob;
};

export const handleQuestionList = async () => {
  try {
    const response = await getCall(
      `${endPoints.question}?filters=%7B%22createdBy%22%3A%22-2%22%7D&limit=100`,
      undefined,
      PORTAL,
    );
    if (response?.data?.statusCode === 200) {
      return response.data.data;
    }
    throw new Error("Failed to fetch questions");
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const formatTimeToHHMMSS = (date: Date | string): string => {
  if (!date) return null; // Return default value if date is null or undefined
  const d = new Date(date);
  return d.toTimeString().split(" ")[0]; // Gets HH:MM:SS
};

// Or if you want to ensure exactly HH:MM:SS format:
export const formatTimer = (date: Date | string): string => {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
};

export const parseTimeStringToDate = (timeString: string): Date => {
  if (!timeString) return null; // Return current date if no time string is provided
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds);
  return date;
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const formatDatewithYear = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear().toString().slice(-2);

  return `${day}${getOrdinalSuffix(day)} ${month}'${year}`;
};

// Helper function to add ordinal suffixes (th, st, nd, rd)
export const getOrdinalSuffix = (day: string) => {
  const num = parseInt(day);
  if (num > 3 && num < 21) return "th";
  switch (num % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const calculateAges = (dob: string | null): number => {
  if (!dob) return 25; // Default age
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

// Calculate overall rating out of 5 points
export const calculateOverallRating = (ratings: unknown) => {
  if (ratings.length === 0) return "0";

  const totalPoints = ratings.reduce(
    (acc, curr) => acc + Number(curr.rating),
    0,
  );
  const maxPossiblePoints = ratings.length * 5; // Each rating has max 5 points
  const overallPercentage = (totalPoints / maxPossiblePoints) * 5; // Convert to 5-point scale
  return overallPercentage.toFixed(2);
};
export function calculateDaysLeft(registrationStartDate?: string) {
  let daysLeft: number | null = null;
  let registrationMessage = "";
  if (registrationStartDate) {
    const today = new Date();
    const regDate = new Date(registrationStartDate);
    today.setHours(0, 0, 0, 0);
    regDate.setHours(0, 0, 0, 0);
    // Use floor instead of ceil to not count the registration day itself
    const diffTime = regDate.getTime() - today.getTime();
    daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (daysLeft > 0) {
      registrationMessage = `${daysLeft - 1} day${daysLeft > 1 ? "s" : ""} left`;
    } else if (daysLeft === 0) {
      registrationMessage = "Registrations starts today";
    } else {
      registrationMessage = "Registrations started";
    }
  }
  return { daysLeft, registrationMessage };
}
export const getAverageRating = (
  data: RatingData,
  totalFactors: number,
): number => {
  const ratings = Object.values(data).map((item) => Number(item.rating) || 0);
  const sum = ratings.reduce((acc, val) => acc + val, 0);
  return totalFactors > 0 ? parseFloat((sum / totalFactors).toFixed(2)) : 0;
};

export const calculateKPIValue = (data: any[], key: string): number => {
  if (!Array.isArray(data) || !key) return 0;
  return data.reduce((sum, item) => {
    const value = Number(item?.[key]);
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
};

export const getPageNumbers = (totalPages: number, currentPage: number) => {
  const pages: (number | string)[] = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 2) {
      pages.push(1, 2, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage, "...", totalPages);
    }
  }

  return pages;
};

export function contentDateFormat(
  dateString: string,
  nextDay: boolean = false,
): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  // If nextDay is true, add one day to the date
  if (nextDay) {
    date.setDate(date.getDate() + 1);
  }

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayOfWeek = daysOfWeek[date.getDay()];
  const day = date.getDate().toString().padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayOfWeek}, ${day} ${month} ${year}`;
}

export function extractTime(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "p.m." : "a.m.";

  // Convert to 12-hour format
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

export const formatDateString = (dateTimeString: string): string => {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return "Invalid Date";
  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
};

export const formatDateWithoutTime = (dateTimeString: string): string => {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return "Invalid Date";
  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};
// Helper to format date "2002-01-01" to "15th Dec 1989"
export const formatDateOfBirth = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const day = date.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  // Add ordinal suffix
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getOrdinal(day)} ${month} ${year}`;
};

export const formateYearDate = (date: Date | string): string => {
  const yearsDate = new Date(date);
  const startYear = yearsDate ? yearsDate.getFullYear().toString() : "";
  const nextYear = yearsDate
    ? (yearsDate.getFullYear() + 1).toString().slice(-2)
    : "";
  return `${startYear}-${nextYear}`;
};

export function seekerRegisterDate(isoString) {
  const date = new Date(isoString);

  // Convert to local time parts
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }); // Sep
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
}
export function filterProgramsByTypeStatus(
  programs: any[],
  filterBy: { type: string; status: string },
  programtype?: boolean,
): any[] {
  const type = filterBy.type;
  const status = filterBy.status;

  return programs.filter((program) => {
    const typeMatch = programtype
      ? program.programType === type
      : program.type?.key === type;
    return typeMatch && program.status === status;
  });
}

/**
 * Normalizes a string by converting to string, trimming whitespace, and converting to lowercase
 * @param value - The value to normalize (can be string, number, or any type)
 * @returns Normalized lowercase string
 */
export const normalizeString = (value: any): string => {
  return String(value).trim().toLowerCase();
};

// Add this date formatting helper function
export const formatDateInAiAnswers = (dateString: string): string => {
  // Check if the string matches a date format like "YYYY-MM-DD"
  // const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  // if (!dateRegex.test(dateString)) return dateString;

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Pad the day with leading zero if needed
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
};

export const transformFiltersForUpdate = (data) => {
  const transformedFilters = {};

  if (!data?.filters) return transformedFilters;

  Object.entries(data.filters).forEach(([key, value]) => {
    if (key === "kpiFilter" || key === "kpiCategory") {
      return;
    }

    transformedFilters[key] = {
      label: data.label || key,
      value: Array.isArray(value)
        ? value.map((item) => ({
            value: item,
            label: data.displayName || item,
          }))
        : [
            {
              value: value,
              label: data.displayName || value,
            },
          ],
    };
  });

  return transformedFilters;
};

export const transformFiltersForLocation = (data) => {
  const transformedFilters = {};
  console.log("transformFilters input", data);

  // If data already IS the filters object
  const filters = data.filters ?? data;

  Object.entries(filters).forEach(([key, value]) => {
    if (key === "kpiFilter" || key === "kpiCategory") {
      return;
    }

    transformedFilters[key] = {
      label: key, // or data.displayName if available
      value: Array.isArray(value)
        ? value.map((item) =>
            typeof item === "object" && "value" in item
              ? { value: item.value, label: item.label ?? item.value }
              : { value: item, label: item },
          )
        : [{ value, label: value }],
    };
  });

  console.log("transformFilters output", transformedFilters);
  return transformedFilters;
};

/**
 * Universal date and time formatting utility
 * @param dateTimeString - Date string or Date object to format
 * @param format - Format type to return
 * @param options - Additional formatting options
 * @returns Formatted date/time string
 */
/**
 * Formats a given date or datetime string into various formats such as date, time, or datetime.
 *
 * @param dateTimeString - The input date or datetime string, or a `Date` object.
 * @param format - The desired format for the output string. Supported formats:
 *   - `'date'`: Returns the date in `DD MMM YYYY` format.
 *   - `'time12'`: Returns the time in 12-hour format (e.g., `hh:mm a.m./p.m.`).
 *   - `'time24'`: Returns the time in 24-hour format (e.g., `HH:mm`).
 *   - `'dateTime12'`: Returns the date and time in 12-hour format (e.g., `DD MMM YYYY, hh:mm a.m./p.m.`).
 *   - `'dateTime24'`: Returns the date and time in 24-hour format (e.g., `DD MMM YYYY, HH:mm`).
 *   - `'dateWithDay'`: Returns the date with the day of the week (e.g., `Day, DD MMM YYYY`).
 *   - `'fullDateTime12'`: Returns the full date and time in 12-hour format with the day of the week.
 *   - `'fullDateTime24'`: Returns the full date and time in 24-hour format with the day of the week.
 *   - `'timeRange12'`: Returns a time range in 12-hour format (e.g., `hh:mm a.m. - hh:mm a.m.`).
 *   - `'timeRange24'`: Returns a time range in 24-hour format (e.g., `HH:mm - HH:mm`).
 *   - `'dayMonth'`: Returns the day and month (e.g., `DD MMM`).
 *   - `'monthYear'`: Returns the month and year (e.g., `MMM YYYY`).
 *   - `'year'`: Returns the year (e.g., `YYYY`).
 *   - `'dayOfWeek'`: Returns the day of the week (e.g., `Monday`).
 * @param options - Optional configuration for formatting:
 *   - `duration` (number): The duration in minutes for time range formats.
 *   - `showSeconds` (boolean): Whether to include seconds in the time format.
 *   - `emptyValue` (string): The value to return for empty or invalid dates.
 *     Defaults to `"-"` for date formats and `""` for time-only formats.
 * @returns The formatted date or time string based on the specified format.
 *          Returns `"Invalid Date"` for invalid date inputs.
 */
export const formatDateTimeUniversal = (
  dateTimeString: string | Date,
  format:
    | "date"
    | "time12HrFormat"
    | "time24HrFormat"
    | "dateTime12HrFormat"
    | "dateTime24HrFormat"
    | "dateWithDay"
    | "fullDateTime12HrFormat"
    | "fullDateTime24HrFormat"
    | "timeRange12HrFormat"
    | "timeRange24HrFormat"
    | "dayMonth"
    | "monthYear"
    | "year"
    | "dayOfWeek",
  options?: {
    duration?: number; // Duration in minutes (for time ranges)
    showSeconds?: boolean; // Include seconds in time
    emptyValue?: string; // Value to return for empty dates ("-" for date, "" for time)
  },
): string => {
  // Handle empty input based on format type
  if (!dateTimeString) {
    if (format.includes("time") && !format.includes("date")) {
      return options?.emptyValue || ""; // Empty string for time-only formats
    }
    return options?.emptyValue || "-"; // Dash for date formats
  }

  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) {
    if (format.includes("time") && !format.includes("date")) {
      return ""; // Empty string for invalid time-only formats
    }
    return "Invalid Date";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = dayNames[date.getDay()];

  // Helper function for 12-hour time format
  const formatTime12 = (inputDate: Date, includeSeconds = false): string => {
    let hours = inputDate.getHours();
    const minutes = inputDate.getMinutes().toString().padStart(2, "0");
    const seconds = inputDate.getSeconds().toString().padStart(2, "0");
    const period = hours >= 12 ? "p.m." : "a.m.";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    let timeStr = `${hours}:${minutes}`;
    if (includeSeconds) {
      timeStr += `:${seconds}`;
    }
    return `${timeStr} ${period}`;
  };

  // Helper function for 24-hour time format
  const formatTime24 = (inputDate: Date, includeSeconds = false): string => {
    const hours = inputDate.getHours().toString().padStart(2, "0");
    const minutes = inputDate.getMinutes().toString().padStart(2, "0");
    const seconds = inputDate.getSeconds().toString().padStart(2, "0");

    let timeStr = `${hours}:${minutes}`;
    if (includeSeconds) {
      timeStr += `:${seconds}`;
    }
    return timeStr;
  };

  switch (format) {
    case "date":
      return `${day} ${month} ${year}`;

    case "time12HrFormat":
      return formatTime12(date, options?.showSeconds);

    case "time24HrFormat":
      return formatTime24(date, options?.showSeconds);

    case "dateTime12HrFormat":
      return `${day} ${month} ${year}, ${formatTime12(date, options?.showSeconds)}`;

    case "dateTime24HrFormat":
      return `${day} ${month} ${year}, ${formatTime24(date, options?.showSeconds)}`;

    case "dateWithDay":
      return `${dayName}, ${day} ${month} ${year}`;

    case "fullDateTime12HrFormat":
      return `${dayName}, ${day} ${month} ${year}, ${formatTime12(date, options?.showSeconds)}`;

    case "fullDateTime24HrFormat":
      return `${dayName}, ${day} ${month} ${year}, ${formatTime24(date, options?.showSeconds)}`;

    case "timeRange12HrFormat": {
      if (!options?.duration) return formatTime12(date, options?.showSeconds);
      const endDate = new Date(date.getTime() + options.duration * 60000);
      return `${formatTime12(date)} - ${formatTime12(endDate)}`;
    }

    case "timeRange24HrFormat": {
      if (!options?.duration) return formatTime24(date, options?.showSeconds);
      const endDate = new Date(date.getTime() + options.duration * 60000);
      return `${formatTime24(date)} - ${formatTime24(endDate)}`;
    }

    case "dayMonth":
      return `${day} ${month}`;

    case "monthYear":
      return `${month} ${year}`;

    case "year":
      return year.toString();

    case "dayOfWeek":
      return dayName;

    default:
      return `${day} ${month} ${year}`;
  }
};
export const selectedKpiOptionArray = [
  "hdb1Blessed",
  "hdb2Blessed",
  "hdb3Blessed",
  "msd1Blessed",
  "msd2Blessed",
];

export const kpiStatusArray = [
  "blessed",
  "hdb1",
  "hdb2",
  "hdb3",
  "msd1",
  "msd2",
];

export const viewVisibleScreens = ["registrations"];

export const periodGapFromProgram = 0

export const isSessionStartingSoon = (sessions : any) => {
  console.log("sessions in isSessionStartingSoon", sessions);
  if (!sessions?.blessEndsAt) return false;
  const blessEndsAt = sessions?.blessEndsAt
  const sessionStart = new Date(blessEndsAt);
  const today = new Date();
  const durationFromToday = new Date();
  durationFromToday.setDate(today.getDate() + periodGapFromProgram);
  return sessionStart <= durationFromToday;
};
export const isSessionDisabledByStartDate = (
  item: any,
  sessions?: any,
): boolean => {
  // Always keep Hold and YTD enabled
  if (item.name === ApprovalStatus.HOLD || item.name === ApprovalStatus.YTD) {
    return false;
  }

  // Find matching session from sessions array if provided
  let blessEndsAt = item.blessEndsAt;
  
  if (!blessEndsAt && sessions && sessions.length > 0) {
    const matchingSession = sessions.find(
      (session) => session.id === item.id || session.name === item.name
    );
    blessEndsAt = matchingSession?.blessEndsAt;
  }

  // If no start date, keep it enabled
  if (!blessEndsAt) {
    return false;
  }

  // Compare using Date objects with time included
  const sessionStart = new Date(blessEndsAt);
  const today = new Date();
  const durationFromToday = new Date();
  durationFromToday.setDate(today.getDate() + periodGapFromProgram);
  // Disable if session starts before or at the duration threshold
  return sessionStart <= durationFromToday;
};

export const getSortTooltipText = (sortState: { key: string; order: SortOrderLower } | null, filterData: any[]) => {
  if (!sortState) {
    return textConstant.SORT;
  }
  // Find the label for the current sort key
  const currentFilter = filterData?.find((filter: unknown) => filter.key === sortState.key);
  const label = currentFilter?.label || sortState.key;
  
  const orderText = sortState.order === textConstant.LOWER_CASE_ASC ? textConstant.COMPLETE_ASC : textConstant.COMPLETE_DESC;
  return `${textConstant.SORTED_BY} ${label} ${orderText}`;
};

export const extractSearchFromUrl = (requestUrl?: string): string => {
  if (!requestUrl) return "";
  try {
    const parsedUrl = new URL(requestUrl);
    return parsedUrl.searchParams.get(textConstant.SEARCH) ?? "";
  } catch (error) {
    try {
      const parsedUrl = new URL(requestUrl, window.location.origin);
      return parsedUrl.searchParams.get(textConstant.SEARCH) ?? "";
    } catch {
      return "";
    }
  }
};
/**
 * Downloads a report with optional filters
 * @param options - Configuration options for the download
 */
export const handleReportDownload = async (options: {
  reportName: string;
  selectedReport?: string;
  selectedMainFilter: string;
  programId: string | number;
  subProgramId?: string | number;
  selectedFilters: { [key: string]: any };
  selectedDropdownFilters: { [key: string]: string };
  kpivalue: { type: any; key: string } | null;
  debouncedSearchTerm: string;
  downloadEndpoint: string;
  setLoader: (loading: boolean) => void;
  setToastState: (state: { message: string; open: boolean }) => void;
  onCloseModal: () => void;
  DOWNLOAD_ERRORS: { GENERIC: string };
}): Promise<void> => {
  const {
    reportName,
    selectedReport,
    selectedMainFilter,
    programId,
    subProgramId,
    selectedFilters,
    selectedDropdownFilters,
    kpivalue,
    debouncedSearchTerm,
    downloadEndpoint,
    // setLoader,
    setToastState,
    onCloseModal,
    DOWNLOAD_ERRORS,
  } = options;

  onCloseModal();

  try {
    // setLoader(true);

    let url = `${downloadEndpoint}?downloadType=${selectedMainFilter || 'all'}&reportCode=${selectedReport || 'room_inventory_allocation_report'}`;
    
    if (programId) {
      url += `&programId=${programId}`;
    }
    
    if (subProgramId) {
      url += `&subProgramId=${subProgramId}`;
    }
    
    const filtersObj: { [key: string]: any } = {};

    if (selectedMainFilter === "filtered") {
      Object.assign(filtersObj, selectedFilters);
      
      if (Object.keys(selectedDropdownFilters).length > 0) {
        Object.keys(selectedDropdownFilters).forEach((key) => {
          const value = selectedDropdownFilters[key];
          if (value && value !== "") {
            filtersObj[key] = [Number(value)];
          }
        });
      }
      
      if (kpivalue && kpivalue.type && kpivalue.key !== KPI_FILTERS.TYPES.ALL) {
        filtersObj.roomStatus = kpivalue.type;
      }
      
      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
      }
    }
    
    if (Object.keys(filtersObj).length > 0) {
      const filtersParam = encodeURIComponent(JSON.stringify(filtersObj));
      url += `&filters=${filtersParam}`;
    }
    
    const response = await getCallWithLoader(url, undefined, PORTAL, textConstant.LARGE );
    const statusCode = response?.data?.statusCode;
    const message = response?.data?.message;
    const downloadUrl = response?.data?.data?.downloadUrl;
    
    if (statusCode >= 400 && statusCode < 500) {
      notify("error", message, WARNING);
      return;
    }

    if (statusCode >= 500) {
      notify("error", message, WARNING);
      return;
    }

    if (!downloadUrl) {
      notify("error", message, WARNING);
      return;
    }

    await downloadExcelFromApi({
      url: downloadUrl,
      filePrefix: reportName,
    });

  } catch (error: any) {
    setToastState({
      message: error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        DOWNLOAD_ERRORS.GENERIC,
      open: true,
    });
    console.error("Error downloading room allocation report:", error);
  }
};
export const getValidFilters = (filters: { [key: string]: string }): { [key: string]: string } => {
  return Object.entries(filters).reduce((acc, [key, value]) => {
    if (value && value !== "" && value !== "null" && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {} as { [key: string]: string });
};

export const extractMonth = (dateStr: string): string | null => {
  const match = dateStr.match(/\b([A-Z][a-z]+)\b/);
  return match ? match[1] : null;
};

export const capPercentage = (value: number): number => {
  if (typeof value !== 'number' || isNaN(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
};

// Type definition for session objects used in time/date calculations
interface SessionTimeData {
  startTime?: string;
  checkinTime?: string;
  endTime?: string;
  checkoutTime?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

// Helper function to get the earliest start time from all sessions
export const getEarliestStartTime = (sessions: SessionTimeData[] | null | undefined): string => {
  if (!sessions || sessions.length === 0) return '09:00:00';
  const times = sessions.map(s => s.startTime || s.checkinTime).filter(Boolean) as string[];
  if (times.length === 0) return '09:00:00';
  // Sort times and get the earliest
  const sortedTimes = times.sort((a, b) => a.localeCompare(b));
  const earliestTime = sortedTimes[0];
  // Ensure format is HH:mm:ss
  return earliestTime.length === 5 ? earliestTime + ':00' : earliestTime;
};

// Helper function to get the latest end time from all sessions
export const getLatestEndTime = (sessions: SessionTimeData[] | null | undefined): string => {
  if (!sessions || sessions.length === 0) return '18:00:00';
  const times = sessions.map(s => s.endTime || s.checkoutTime).filter(Boolean) as string[];
  if (times.length === 0) return '18:00:00';
  // Sort times and get the latest
  const sortedTimes = times.sort((a, b) => b.localeCompare(a));
  const latestTime = sortedTimes[0];
  // Ensure format is HH:mm:ss
  return latestTime.length === 5 ? latestTime + ':00' : latestTime;
};

// Helper function to calculate max session duration in days
export const getMaxSessionDurationDays = (sessions: SessionTimeData[] | null | undefined): number => {
  if (!sessions || sessions.length === 0) return 0;
  let maxDuration = 0;
  sessions.forEach((session) => {
    if (session.startDate && session.endDate) {
      const start = new Date(session.startDate);
      const end = new Date(session.endDate);
      const durationInMs = end.getTime() - start.getTime();
      const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
      if (durationInDays > maxDuration) {
        maxDuration = durationInDays;
      }
    }
  });
  return maxDuration;
};

// Helper function to safely capitalize strings and handle undefined/null values
export function safeCapitalize(str: string | undefined | null): string {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates a program code placeholder based on program name and current year
 * @param programName - The name of the program
 * @returns A formatted placeholder string (e.g., "Health Program 2026")
 */
export const generateProgramCodePlaceholder = (programName: string): string => {
  const currentYear = new Date().getFullYear();
  if (!programName || programName.trim() === "") {
    return `Program ${currentYear}`;
  }
  return `${programName.trim()} ${currentYear}`;
};

/**
 * Generates a program name based on the program type with correct year formatting
 * @param programTypeName - The name of the program type (e.g., "HDB", "TAT", "Entrainment")
 * @param year - Optional year to use (defaults to current year)
 * @returns Formatted program name with year
 * 
 * @example
 * generateProgramName("HDB") // Returns "HDB 2026–27"
 * generateProgramName("TAT") // Returns "TAT 2026"
 * generateProgramName("Entrainment") // Returns "Entrainment 2026"
 */
export const generateProgramName = (programTypeName: string, year?: number): string => {
  if (!programTypeName) return "";
  
  const currentYear = year || new Date().getFullYear();
  const nextYear = currentYear + 1;
  const baseTypeName = programTypeName.trim();
  const upperTypeName = baseTypeName.toUpperCase();
  
  // En-dash character for year ranges
  const YEAR_SEPARATOR = '–';
  
  // HDB/MSD format: HDB 2026–27 (with en-dash and year range)
  if (upperTypeName.includes('HDB') || upperTypeName.includes('MSD')) {
    return `${baseTypeName} ${currentYear}${YEAR_SEPARATOR}${String(nextYear).slice(-2)}`;
  }
  
  // Entrainment/TAT format: Entrainment 2026 (single year)
  if (upperTypeName.includes('ENTRAINMENT') || upperTypeName.includes('TAT')) {
    return `${baseTypeName} ${currentYear}`;
  }
  
  // Default format: single year
  return `${baseTypeName} ${currentYear}`;
};

/**
 * Generates a program code based on the program type name
 * @param programTypeName - The name of the program type
 * @param year - Optional year to use (defaults to current year)
 * @returns Formatted program code
 * 
 * @example
 * generateProgramCode("HDB") // Returns "HDB_2026"
 * generateProgramCode("TAT Program") // Returns "TAT_PROGRAM_2026"
 */
export const generateProgramCode = (programTypeName: string, year?: number): string => {
  if (!programTypeName) return "";
  
  const currentYear = year || new Date().getFullYear();
  const CODE_SEPARATOR = '_';
  const baseTypeName = programTypeName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, CODE_SEPARATOR) // replace any non-alphanumeric run (spaces, slashes, etc.) with _
    .replace(/^_|_$/g, '');                  // strip leading/trailing underscores
  
  return `${baseTypeName}${CODE_SEPARATOR}${currentYear}`;
};
