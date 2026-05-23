export interface LoginPayload {
  loginType: string;
  phoneNumber: string;
  countryCode: string;
}

export interface ValidateOTPPayload extends LoginPayload {
  otp: string;
}

import { postCall, postCallWithoutAuth } from "./apiService";
import { endPoints, PORTAL } from "../constants/urlConstants";

export const login = (payload: LoginPayload) => {
  return postCallWithoutAuth(endPoints.login, payload, PORTAL);
};

export const validateOtp = (payload: ValidateOTPPayload) => {
  return postCallWithoutAuth(endPoints.validateOTP, payload, PORTAL);
};

export const resendOtp = (payload: LoginPayload) => {
  return postCallWithoutAuth(endPoints.resendOTP, payload, PORTAL);
};

export const logout = () => {
  return postCall(endPoints.logout, {}, PORTAL);
};
