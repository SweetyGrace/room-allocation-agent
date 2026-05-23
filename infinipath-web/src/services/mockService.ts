import { DROPDOWNFILTERS, textConstant } from "../constants/textConstants";
import { PORTAL } from "../constants/urlConstants";
import {
  ApiResponse,
  BlessedResponse,
  RegistrationApproval,
} from "../types/seatApproval";
import { getCall, getCallWithLoader, postCallWithLoader, putCallWithLoader } from "./apiService";

export class ApiService {

  static async getRegistrationApprovals(params: {
    id?: number; // Optional ID for specific registration approval
    programId: number;
    limit: number;
    offset: number;
    search?: string;
    gender?: string;
    kpiFilter?: string; // Optional preferred program ID for filtering
    mahatriaChoice?: boolean; // Optional flag for Mahatria's choice
    approvalStatus?: string;
    swapRequests?: string;
    preferredRoomMate?: string; // Optional preferred roommate for the API call
    shiftRequests?: string; // Optional shift requests for the API call
    appliedFilters?: any; // Optional filters for the API call
    kpifilters?: any; // Additional filters for the API call
    setOverlayLoader?: (loading: boolean) => void; // Optional function to set overlay loading state
    sortKey?: string;
    sortOrder?: 'asc' | 'desc';
    programPreference?:unknown;
  }): Promise<ApiResponse> { 

    const filters: any = {
      kpiCategory: params?.approvalStatus,
      kpiFilter: params?.kpiFilter,
      ...(params?.kpifilters || {}), // Spread the kpifilters object if it exists
    };


    // Add gender filter for allocated status
    if ((params.approvalStatus === "allocated" || params.kpiFilter === "swap-requests" || params.kpiFilter=== DROPDOWNFILTERS.pending.kpiFilter) && params.gender) {
      filters.gender = params.gender;
    }
    // ...existing code...

    if (params.preferredRoomMate) {
      filters.preferredRoomMate = params.preferredRoomMate;
    }
    if(params?.programPreference){
      filters.programPreference = params?.programPreference;
    }
    if (params.swapRequests || params?.shiftRequests) {
      filters.swapRequests = [];
      if (params.swapRequests) {
        filters.swapRequests.push(params?.swapRequests);
      }
      if (params?.shiftRequests) {
        filters.swapRequests.push(params?.shiftRequests);
      }
    }
    // ...existing code...
    if (params.appliedFilters) {
      // Merge applied filters into the filters object
      Object.assign(filters, params.appliedFilters);
    }

    const queryParams = new URLSearchParams({
      programId: params.programId.toString(),
      limit: params.limit.toString(),
      offset: params.offset.toString(),
      filters: JSON.stringify(filters),
      ...(params.search ? { searchText: params.search } : {}), // Changed 'search' to 'searchText'
      ...(params.sortKey ? { sortKey: params.sortKey } : {}),
      ...(params.sortOrder ? { sortOrder: params.sortOrder } : {})
    }).toString();
    // Actual API call (uncomment when ready) /registration-approvals?${queryParams}
    params.setOverlayLoader && params.setOverlayLoader(true);
    const response = await getCallWithLoader(`registration/mahatria-kpis?${queryParams}`,undefined, PORTAL, textConstant.LARGE );
    if (response?.data?.statusCode === 200) {
      params.setOverlayLoader && params.setOverlayLoader(false);
    }
    return response;
  }
  static async getSeekerDetails(
    registrationId: number,
  ): Promise<RegistrationApproval> {
    const response = await getCall(
      `registration/mahatria-kpis/${registrationId}`,
      undefined,
      PORTAL
    );
    return response;
  }

  static async getProgramByID(params: {
    programId: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams({
      programId: params.programId.toString(),
    });
    const response = await getCall(`program/${params.programId}`, undefined, PORTAL);
    return response;
  }

  static async blessUser(
    registrationId: number,
    payload: any,
  ): Promise<BlessedResponse> {

    const response = await putCallWithLoader(
      `registration-approval/by-registration/${registrationId}`,
      payload,
      PORTAL,
      textConstant.LARGE,
    );
    return response;
  }

  static async blessSwapUser(payload: any): Promise<BlessedResponse> {
    const response = await postCallWithLoader(
      "program-registration/swap/direct",
      payload,
      PORTAL,
      textConstant.LARGE ,
    );
    return response;
  }
static async cancelSwapRequest(
    id: number,
    payload: any,
    notifyConfig?: {
      onSuccess?: { title: string; message: string; type?: string };
      onError?: { title: string; message: string; type?: string };
    }
  ): Promise<BlessedResponse> {
    const response = await putCallWithLoader(
      `program-registration/swap/${id}/action`,
      payload,
      PORTAL,
      "",
      notifyConfig,
    );
    return response;
}

  private static generateMockData(
    offset: number,
    limit: number,
  ): RegistrationApproval[] {
    const mockData: RegistrationApproval[] = [];
    const names = [
      "Anjali Kumari",
      "Anjan Kumar",
      "Baskar Sharma",
      "Priya Singh",
      "Rahul Gupta",
      "Sneha Patel",
    ];
    const cities = [
      "Bangalore",
      "Chennai",
      "Hyderabad",
      "Mumbai",
      "Delhi",
      "Pune",
    ];
    const genders: ("male" | "female")[] = ["male", "female"];

    for (let i = 0; i < limit; i++) {
      const index = offset + i;
      const name = names[index % names.length];
      const city = cities[index % cities.length];
      const gender = genders[index % genders.length];

      mockData.push({
        id: (index + 1).toString(),
        registrationId: (200 + index).toString(),
        approvalStatus: "pending",
        approvalDate: null,
        approvedBy: null,
        rejectionReason: null,
        reviewerComments: null,
        autoApproved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        registration: {
          id: (200 + index).toString(),
          program: {
            id: 192,
            typeId: 6,
            name: "HDB/MSD 2025-2026",
            code: "HDB2025",
            description: "Human Development & Management Skills Development",
            modeOfOperation: "offline",
            meta: {
              price: [{ HDB: 200 }, { MSD: 100 }],
            },
            noOfSession: 2,
          },
          userId: 9000 + index,
          programRegistrationSeqNumber: null,
          waitingListSeqNumber: null,
          registrationStatus: "pending_approval",
          basicDetailsStatus: "completed",
          registrationDate: new Date().toISOString(),
          cancellationDate: null,
          cancelledBy: null,
          rmContact: 8319,
          preferredRoomMate: null,
          fullName: name,
          gender: gender,
          mobileNumber: `98765${(43210 + index).toString().slice(-5)}`,
          emailAddress: `${name.toLowerCase().replace(" ", ".")}@example.com`,
          dob: `199${0 + (index % 10)}-0${1 + (index % 9)}-${(10 + (index % 20)).toString().padStart(2, "0")}`,
          infinitheismContact: null,
          city: city,
          notes: `Notes for ${name}`,
          termsAccepted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      });
    }

    return mockData;
  }

  static async getSeekersForSwap(params: {
    search?: string;
    programId: number;
    subProgramId: number;
    limit: number;
    offset: number;
  }): Promise<void> {
    const queryParams = new URLSearchParams({
      limit: params.limit.toString(),
      offset: params.offset.toString(),
      ...(params.search ? { search: params.search } : {}),
    }).toString();

    const response = await getCall(
      `program-registration/${params.programId}/sub-program/${params.subProgramId}?${queryParams}`,
      undefined,
      PORTAL
    );
    return response;
  }

  static async updateSwapRequest(
    swapRequestId: number,
    payload: any,
  ): Promise<any> {
    const response = await putCallWithLoader(
      `program-registration/swap/${swapRequestId}`,
      payload,
      PORTAL,
      textConstant.LARGE ,
    );
    return response;
  }
}
