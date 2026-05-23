import * as yup from "yup";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export const signUpSchema = yup.object().shape({
  firstName: yup
    .string()
    .required("First name is required")
    .matches(
      /^[A-Za-z\s.]*$/,
      "First name must not contain numbers or special characters",
    )
    .min(3, "First name must be at least 3 characters")
    .max(30, "First name must not exceed 30 characters"),
  lastName: yup
    .string()
    .required("Last name is required")
    .matches(
      /^[A-Za-z\s.]*$/,
      "Last name must not contain numbers or special characters",
    )
    .min(3, "Last name must be at least 3 characters")
    .max(30, "Last name must not exceed 30 characters"),
  phone: yup
    .string()
    .required("Mobile number is required")
    .test(
      "is-valid-phone",
      "Mobile number is invalid or does not match the country code",
      (value) => {
        const phoneNumber = parsePhoneNumberFromString(`+${value}`);
        return phoneNumber ? phoneNumber.isValid() : false;
      },
    ),
  email: yup
    .string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Invalid email format",
    ),
});
