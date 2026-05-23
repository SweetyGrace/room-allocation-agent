import { create } from "@mui/material/styles/createTransitions";
import { PENDING_APPROVAL, WAIT_LIST } from "../constants";
import { endPoints, PORTAL } from "../constants/urlConstants";
import { getCall } from "../services/apiService";
import {
  ProgramDetails,
  RegistrationApproval,
  UserData,
  userRegistration,
} from "../types/seatApproval";
import { formatDateString } from "./commonFunctions";
interface ProgramPreference {
  name: string;
  id: string | number;
}

export const sortPreferences = (
  preferences: any[],
  grouped: boolean,
): ProgramPreference[] => {
  if (!preferences || preferences.length === 0) return [];

  return preferences
    .sort((a, b) => a.priorityOrder - b.priorityOrder)
    .map((pref) => {
      const program = grouped ? pref.preferredProgram : pref.preferredSession;
      return program
        ? {
            name: program.name || "",
            id: program.id || "",
          }
        : null;
    })
    .filter((program): program is ProgramPreference => program !== null);
};

export const getDemand = (
  registration: UserData | null,
  requirement: string,
): string | null => {
  if (!registration?.swapsRequests || registration.swapsRequests.length === 0) {
    return null;
  }
  // Sort swapRequests by id in descending order
  const sortedSwapRequests = [...registration.swapsRequests].sort((a, b) => b.id - a.id);

  // Get the most recent swap request (highest id)
  const latestSwapRequest = sortedSwapRequests[0];

  // Check if swapRequirement is "SWAP_DEMAND" and status is "on_hold"
  if (
    latestSwapRequest.swapRequirement === "SWAP_DEMAND" &&
    latestSwapRequest.status === "on_hold" &&
    latestSwapRequest.requestedPrograms
  ) {
    if(requirement==="currentProgram"){
      return latestSwapRequest.currentProgram?.name || null;
    }
    else if(requirement==="programs"){
    return latestSwapRequest.requestedPrograms?.map((program) => ({
      id: program.id,
      name: program.name,
    }))
  }
  else if(requirement==="comment"){
    return latestSwapRequest.comment || null;
  }
}

  return null;
};


export const mapApiDataToUserCards = (
  apiData: RegistrationApproval[],
  grouped?: boolean,
): UserData[] => {
  return apiData.map((item) => {
    const registration = item;
    const calculateAge = (dob: string | null): number => {
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
    const activeSwapRequest = registration.swapsRequests?.find(
      (request) => request.status === "active" && request.type !== "can_shift" ,
    );
    const swapRequestedPrograms =
      activeSwapRequest?.requestedPrograms?.map((program) => ({
        id: program.id,
        name: program.name,
      })) || [];

    const activeShiftRequest = registration.swapsRequests?.find(
      (request) => request.status === "active" && request.type === "can_shift",
    );

    const programPreferences = registration.preferences
      ? sortPreferences(registration.preferences, grouped)
      : [];
    return {
      id: item.id,
      registrationId: registration.id,
      fullName: registration.fullName || `User ${registration.userId}`,
      gender: registration.gender || "other",
      age: calculateAge(registration.dob),
      totalPrograms: registration?.totalPrograms || 0,
      city: registration.city || null,
      registrationDate: registration.registrationDate || null,
      profileImage: registration.profileUrl,
      approvalStatus: registration.approvals[0]?.approvalStatus || "pending",
      rating: registration.averageRating || null,
      lastActiveDate: (() => {
        const date = new Date(
          new Date(registration?.createdAt).getTime() + 5.5 * 60 * 60 * 1000,
        );
        return formatDateString(date);
      })(),
      completedHDBs: registration?.noOfHDBs || 0,
      preferredRoomMate: registration.preferredRoomMate || "",
      programPreferences,
      emailAddress: registration.emailAddress || "",
      mobileNumber: registration.mobileNumber || "",
      otherCityName: registration.otherCityName || null,
      isAssigned: false,
      assignedSession: undefined,
      swapRequests: swapRequestedPrograms || [],
      swapRequestId: activeSwapRequest?.id || null,
      swapDemandPrograms: getDemand(registration, "programs") ,
      swapDemandCurrentProgram: getDemand(registration, "currentProgram") ,
      swapDemandComment: getDemand(registration, "comment") ,
      shiftRequests:
        activeShiftRequest?.requestedPrograms.length > 0
          ? swapRequestedPrograms
          : null || [],
      shiftRequestId: activeSwapRequest?.id || null,
      allocatedProgram: registration.allocatedProgram || null,
      createdAt: registration.createdAt || "",
      isOrganizationUser: registration?.isOrganizationUser,
      prevRating: registration.prevRating || {
         hdbYear:null,
          rating: null,
          review: null,
          rmContactId: null,
          rmContactName: null,
        }, 
      statusDateTime: registration?.statusDateTime || null,
      statusDateTimeLabel : registration?.statusDateTimeLabel || null,
      recommendation:
        registration?.isRecommended === true ||
        registration?.recommendation?.[0]?.isRecommended === true
          ? Array.isArray(registration?.recommendation)
            ? registration?.recommendation[0]?.recommendationKey || ""
            : registration?.recommendation || ""
          : "",
      recommendationText:
        registration?.recommendation?.[0]?.isRecommended === true &&
        registration?.recommendation?.[0]?.recommendationKey !== ""
          ? Array.isArray(registration?.recommendation)
            ? registration?.recommendation[0]?.recommendationText || ""
            : ""
          : "",
      rmContactUser: {
         orgUsrName: registration?.rmContactUser?.orgUsrName || null, 

      },
      otherInfinitheismContact: registration?.otherInfinitheismContact || null,
      isDefaulter: registration?.user?.hdbDefaulter || false,

    };
  });
};

export const mapswapApiDataToUserCards = (
  apiData: RegistrationApproval[],
  grouped?: boolean,
): UserData[] => {
  return apiData.map((item) => {
    const registration = item.programRegistration;
    const calculateAge = (dob: string | null): number => {
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

    const programPreferences = registration.preferences
      ? sortPreferences(registration.preferences, grouped)
      : [];
    return {
      id: item.id,
      registrationId: registration.id,
      fullName: registration.fullName || `User ${registration.userId}`,
      gender: registration.gender || "other",
      age: calculateAge(registration.dob),
      totalPrograms: registration?.totalPrograms || 0,
      city: registration.city || null,
      profileImage: registration.profileUrl,
      approvalStatus: registration.approvals[0]?.approvalStatus || "pending",
      rating: registration.averageRating || null,
      lastActiveDate: (() => {
        const date = new Date(
          new Date(registration?.createdAt).getTime() + 5.5 * 60 * 60 * 1000,
        );
        return formatDateString(date);
      })(),
      completedHDBs: registration?.noOfHDBs || 0,
      preferredRoomMate: registration.preferredRoomMate || "",
      programPreferences,
      emailAddress: registration.emailAddress || "",
      mobileNumber: registration.mobileNumber || "",
      isAssigned: false,
      assignedSession: undefined,
      swapRequests: registration.requestedPrograms || [],
      swapDemandPrograms: getDemand(registration, "programs") ,
      swapDemandCurrentProgram: getDemand(registration, "currentProgram") ,
      allocatedProgram: registration.allocatedProgram || null,
      profileUrl: registration.profileUrl || "",
      createdAt: registration.createdAt || "",
      isOrganizationUser: registration?.isOrganizationUser,
      isDefaulter: registration?.user?.hdbDefaulter || false,
    };
  });
};

export const fetchProgramsData = async (userId: string) => {
  try {
    const [programsResponse, registrationsResponse] = await Promise.all([
      getCall(endPoints.getProgramEndPoint({ status: "published" }), undefined, PORTAL), // list og published programs
      getCall(`registration`, undefined, PORTAL), //list of registrations for the user
    ]);

    return {
      programs: programsResponse.data.data.data,
      registrations: registrationsResponse.data.data.data,
    };
  } catch (error) {
    throw new Error("Failed to fetch program data");
  }
};

export const getStatusOfProgram = (
  programs: ProgramDetails[],
  registrations: userRegistration[],
) => {
  const programStatusMap: ProgramDetails[] = [];
  programs.map((program: ProgramDetails) => {
    const registration = registrations.find(
      (reg) => reg?.program?.id === program?.id && reg?.userId != null,
    );

    programStatusMap.push({
      ...program,
      statusMessage: registration
        ? getStatusMessage(program, registration)
        : undefined,
    });
  });
  return programStatusMap;
};
const getStatusMessage = (
  program: ProgramDetails,
  registration: userRegistration,
): string => {
  if (registration.registrationStatus === PENDING_APPROVAL) {
    return "Registered to program and awaiting for approval";
  } else if (
    program.limitedSeats &&
    registration.registrationStatus === WAIT_LIST
  ) {
    return "Registered to program and seat is waiting list";
  } else if (
    registration?.program.requiresPayment &&
    registration?.paymentDetails.length === 0
  ) {
    return "Registered to program and payment pending";
  } else if (
    registration?.program.requiresPayment &&
    registration?.paymentDetails.length > 0
  ) {
    if (registration?.paymentDetails[0]?.status?.includes("online_pending")) {
      return "Registered to program and online payment pending";
    } else if (
      registration?.paymentDetails[0]?.status?.includes("offline_pending")
    ) {
      return "Registered to program and offline payment pending";
    } else if (registration?.paymentDetails[0]?.status?.includes("completed")) {
      return "Registered to program and payment completed";
    }
  } else if (
    registration?.program.isTravelInvolved &&
    registration?.travelInfo.length === 0
  ) {
    return "Registered to program and travel details pending";
  }
  return "Registered to program completed";
};

export const capitalize = (str: string) =>
  str
    ? str
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ")
    : "";

export const padNumber = (num: string | number) => {
  const n = Number(num);
  return isNaN(n) ? "-" : n < 10 ? `0${n}` : `${n}`;
};

export const formatGender = (gender: string) => {
  if (!gender) return "-";
  const g = gender.toLowerCase();
  if (g === "male" || g === "m") return "M";
  if (g === "female" || g === "f") return "F";
  return "-";
};

export const transformSeekerResponse = (response: any): UserData => {
  const calculateAge = (dob: string | null): number => {
    if (!dob) return 25;
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

  return {
    id: response?.id,
    registrationId: response.id,
    fullName:
      response.fullName || response.seekerName || `User ${response.userId}`,
    gender: response.gender || "other",
    age: calculateAge(response.dob),
    totalPrograms: response?.totalPrograms || 0,
    city: response.city || null,
    profileImage: response.profileUrl,
    approvalStatus:
      response.approvals?.[0]?.approvalStatus ||
      response?.approvalStatus ||
      "pending",
    rating: response.averageRating || null,
    lastActiveDate: (() => {
      const date = new Date(
        new Date(response?.createdAt).getTime() + 5.5 * 60 * 60 * 1000,
      );
      return formatDateString(date);
    })(),
    otherCityName: response.otherCityName || null,
    registrationDate: response.registrationDate || null,
    completedHDBs: response?.noOfHDBs || 0,
    preferredRoomMate: response.preferredRoomMate || "",
    programPreferences: response.preferences
      ? sortPreferences(response.preferences, true)
      : response.preference
        ? sortPreferences(response.preference, true)
        : [],
    emailAddress: response.emailAddress || "",
    mobileNumber: response.mobileNumber || "",
    isAssigned: false,
    assignedSession: undefined,
    swapRequests:
      response.swapsRequests
        ?.find((req) => req.status === "active")
        ?.requestedPrograms?.map((program) => ({
          id: program.id,
          name: program.name,
        })) || [],
    swapRequestId:
      response.swapsRequests?.find((req) => req.status === "active")?.id ||
      null,
    swapDemandPrograms: getDemand(response, "programs") ,
    swapDemandCurrentProgram: getDemand(response, "currentProgram") ,
    swapDemandComment:getDemand(response, "comment") ,
    shiftRequests:
      response.swapsRequests
        ?.find((req) => req.status === "active" && req.type === "can_shift")
        ?.requestedPrograms?.map((program) => ({
          id: program.id,
          name: program.name,
        })) || [],
    shiftRequestId:
      response.swapsRequests?.find(
        (req) => req.status === "active" && req.type === "can_shift",
      )?.id || null,
    allocatedProgram: response.allocatedProgram || null,
    createdAt: response.createdAt || "",
    isOrganizationUser: response?.isOrganizationUser,
    prevRating: response.prevRating || {
           hdbYear:null,
          rating: null,
          review: null,
          rmContactId: null,
          rmContactName: null,
    },
    statusDateTime: response?.statusDateTime || null,
    statusDateTimeLabel : response?.statusDateTimeLabel || null,
    recommendation:
      response?.isRecommended === true ||
      response?.recommendation?.[0]?.isRecommended === true
        ? Array.isArray(response?.recommendation)
          ? response?.recommendation[0]?.recommendationKey || ""
          : response?.recommendation || ""
        : "",
    recommendationText:
      response?.recommendation?.[0]?.isRecommended === true &&
      response?.recommendation?.[0]?.recommendationKey !== ""
        ? Array.isArray(response?.recommendation)
          ? response?.recommendation[0]?.recommendationText || ""
          : ""
        : "",
    rmContactUser: {
      orgUsrName: response?.rmContactUser?.orgUsrName || null, 
    },
    otherInfinitheismContact: response?.otherInfinitheismContact || null, 
    isDefaulter: response?.user?.hdbDefaulter || false,
    
  };
};
