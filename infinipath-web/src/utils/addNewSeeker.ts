import { endPoints, PORTAL, INFINIPATH } from "../constants/urlConstants";
import { postCall } from "../services/apiService";
import { getItemInLocalStorage } from "../services/localStorage";

export const handleFriendsAndFamilyUpdate = (
  data: unknown,
  handleUpdateSeeker: (status: boolean, message: string) => void,
  setLoader: (value: boolean) => void,
) => {
  const loggedInSeekerData = getItemInLocalStorage("seekerDetails");
  const updateSeekerPayload = {
    members: [
      {
        firstName: data?.firstName,
        phoneNumber: data?.phoneNumber,
        email: data?.email,
        countryCode: data?.countryCode?.startsWith("+")
          ? data?.countryCode
          : `+${data?.countryCode}`,
        relation: "",
        faceUrl: data?.faceUrl?.length > 0 ? data?.faceUrl : "",
        lastName: data?.lastName,
        profileUrl: data?.profileUrl,
        fullName: data?.fullName,
        ...(data?.address?.length > 0 && { address: data?.address }),
        dob: data?.dob,
        ...(data?.city === "Other" && { otherAddress: data?.otherCity }),
      },
    ],
  };

  postCall(
    `${endPoints.users}/${loggedInSeekerData?.id}/members`,
    updateSeekerPayload,
    INFINIPATH
  )
    .then((res) => {
      if (res?.data?.statusCode === 200) {
        handleUpdateSeeker(true, res?.data?.message);
        setLoader(false);
      } else {
        console.error("Error:", res?.data?.message);
        handleUpdateSeeker(false, res?.data?.message);
        setLoader(false);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      handleUpdateSeeker(false, error?.message);
      setLoader(false);
    });
};

export const formatDateToISOString = (date: Date | null): string | null => {
  if (!date) return null;
  const clonedDate = new Date(date);
  clonedDate.setHours(0, 0, 0, 0);
  return clonedDate.toISOString();
};
