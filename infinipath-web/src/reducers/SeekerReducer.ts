import { createSlice } from "@reduxjs/toolkit";

interface seekerState {
  seekerData: unknown;
  selectedSeekersBeforeJoin: Array<string>;
  seekerToVerify: unknown;
  verifiedSeekersIds: Array<string>;
  notVerifiedSeekersIds: Array<string>;
  seekerProfile: {
    profilePicture: string;
    registeredfaceId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
    fullName: string;
  };
  members: Array<unknown>;
  kpiLabel: string;
  sideNavId: string; // Added sideNavId to the state
  seekerDetails : unknown;
}

const initialState: seekerState = {
  seekerData: {},
  selectedSeekersBeforeJoin: [],
  seekerToVerify: {},
  verifiedSeekersIds: [],
  sideNavId: "", // Default sideNavId
  notVerifiedSeekersIds: [],
  seekerProfile: {
    profilePicture: "",
    registeredfaceId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "",
    fullName: "",
  },
  members: [],
  kpiLabel: "",
  seekerDetails : {}
};

const seekerDataSlice = createSlice({
  name: "seekerState",
  initialState,
  reducers: {
    addSeekerData: (state, data) => {
      state.seekerData = data.payload;
    },
    addSelectedSeekersBeforeJoin: (state, data) => {
      state.selectedSeekersBeforeJoin = data.payload;
    },
    addSeekerToVerify: (state, data) => {
      state.seekerToVerify = data.payload;
    },
    addVerifiedSeekersIds: (state, data) => {
      state.verifiedSeekersIds = data.payload;
    },
    addNotVerifiedSeekersIds: (state, data) => {
      state.notVerifiedSeekersIds = data.payload;
    },
    setProfilePicture: (state, data) => {
      state.seekerProfile = {
        ...state.seekerProfile, // Preserve existing seekerProfile data
        profilePicture: data.payload, // Update only profilePicture
      };
    },
    setRegisteredFaceId: (state, data) => {
      state.seekerProfile = {
        ...state.seekerProfile, // Preserve existing seekerProfile data
        registeredfaceId: data.payload, // Update only registeredfaceId
      };
    },
    setFirstName: (state, data) => {
      state.seekerProfile = {
        ...state.seekerProfile, // Preserve existing seekerProfile data
        firstName: data.payload, // Update only firstName
      };
    },
    setLastName: (state, data) => {
      state.seekerProfile = {
        ...state.seekerProfile, // Preserve existing seekerProfile data
        lastName: data.payload, // Update only lastName
      };
    },
    setEmail: (state, data) => {
      state.seekerProfile = {
        ...state.seekerProfile, // Preserve existing seekerProfile data
        email: data.payload, // Update only email
      };
    },
    setPhoneNumberstore: (state, data) => {
      state.seekerProfile = {
        ...state.seekerProfile, // Preserve existing seekerProfile data
        phone: data.payload, // Update only phone
      };
    },
    setCountryCodestore: (state, data) => {
      state.seekerProfile = {
        ...state.seekerProfile, // Preserve existing seekerProfile data
        countryCode: data.payload, // Update only countryCode
      };
    },
    removeSeekerProfile: (state) => {
      state.seekerProfile = initialState.seekerProfile;
    },
    setNonInfinipathSeeker: (state, data) => {
      state.seekerProfile.firstName = data.payload?.firstName;
      state.seekerProfile.lastName = data.payload?.lastName;
      state.seekerProfile.email = data.payload?.email;
      state.seekerProfile.phone = data.payload?.phoneNumber;
      state.seekerProfile.countryCode = data.payload?.countryCode;
      state.seekerProfile.profilePicture = data.payload?.profileUrl;
      state.seekerProfile.fullName = data.payload?.fullName;
    },
    //for join memebers details
    addMembers: (state, data) => {
      state.members = data.payload;
    },
    setKpiLabel: (state, data) => {
      state.kpiLabel = data.payload;
    },//for kpi label
    setSideNavId: (state, data) => {
      state.sideNavId = data.payload; // Update sideNavId
    },
    setSeekerDetails: (state, data) => {
      state.seekerDetails = data.payload;
    }
  },
});

export const {
  addSeekerData,
  addSelectedSeekersBeforeJoin,
  addSeekerToVerify,
  addVerifiedSeekersIds,
  addNotVerifiedSeekersIds,
  setProfilePicture,
  setRegisteredFaceId,
  setFirstName,
  setLastName,
  setEmail,
  setPhoneNumberstore,
  setCountryCodestore,
  setNonInfinipathSeeker,
  removeSeekerProfile,
  addMembers,
  setKpiLabel,
  setSideNavId,
  setSeekerDetails,
} = seekerDataSlice.actions;

export default seekerDataSlice.reducer;
