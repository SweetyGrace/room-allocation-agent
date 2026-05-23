import { getCall, getCallWithLoader, postCall, putCall } from "./apiService";
import { endPoints, PORTAL } from "../constants/urlConstants";
import { MarkDefaulterPayload } from "../types/registration";
import { textConstant } from "../constants/textConstants";


export const markSeekerAsDefaulter = async (payload: MarkDefaulterPayload) => {
  try {
    const response = await postCall(endPoints.seekerDefaulter, payload, PORTAL);
    return response;
  } catch (error) {
    console.error("Error marking seeker as defaulter:", error);
    throw error;
  }
};

export const updateSeekerDefaulter = async (id: string | number, payload: MarkDefaulterPayload) => {
  try {
    const response = await putCall(endPoints.UpdateSeekerDefaulter(id), payload, PORTAL);
    return response;
  } catch (error) {
    console.error("Error updating seeker defaulter status:", error);
    throw error;
  }
};

export const fetchDefaulterTrackingData = async (userId: string | number) => {
  try {
    const response = await getCallWithLoader(
      endPoints.trackSeekerDefaulter(userId),
      undefined,
      PORTAL,
      textConstant.LARGE ,
    );
    
    if (response?.data?.data) {
      return response.data.data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching defaulter tracking data:", error);
    return [];
  }
};