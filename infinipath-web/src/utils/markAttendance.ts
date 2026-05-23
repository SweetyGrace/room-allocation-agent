import { endPoints, INFINIPATH } from "../constants/urlConstants";
import { postCall } from "../services/apiService";
import { detectBrowser } from "./detectBrowser";

export const handleMarkAttendance = async (
  seekerData: { phone_number: string; id: string },
  meetingId: string,
  navigate: (path: string, options?: { replace?: boolean }) => void,
  setLoading: (loading: boolean) => void,
  verificationStatus: boolean,
) => {
  const browser = detectBrowser();
  const payload = {
    userId: seekerData?.id, // pass userId not mobile number
    modeOfJoining: "JOINING_ON_OTHER_DEVICE", //JOINING_ON_OTHER_DEVICE
    faceVerificationStatus: verificationStatus,
    attendees: [],
    deviceType: "Browser",
    deviceInfo: browser?.toUpperCase(),
  };

  try {
    const response = await postCall(
      `${endPoints.webinars}/${meetingId}/attendance`,
      payload,
      INFINIPATH
    );
    if (response?.data?.statusCode === 200) {
      navigate("/infinipath/myspace", { replace: true }); // Navigate to "/myspace" after marking attendance
    } else {
      navigate("/infinipath/myspace", { replace: true });
    }
  } catch (error) {
    console.error(error);
    navigate("/infinipath/myspace", { replace: true });
  } finally {
    setLoading(false);
  }
};
