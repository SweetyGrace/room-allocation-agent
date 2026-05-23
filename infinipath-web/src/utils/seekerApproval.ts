import { ApprovalStatus, textConstant } from "../constants/textConstants";
import { PORTAL } from "../constants/urlConstants";
import { getCall, getCallWithLoader } from "../services/apiService";
import { ApiService } from "../services/mockService";
import { SessionGridBlessParams } from "../types/seatApproval";
import { mapApiDataToUserCards, mapswapApiDataToUserCards } from "./dataMapper";

interface SwapKpi {
  kpiName: string;
  count: number;
  filters: {
    requestedProgramId?: number;
    gender?: string;
  };
}

interface SwapResponse {
  statusCode: number;
  message: string;
  data: {
    kpis: SwapKpi[];
    data: any[];
  };
}

interface RegistrationResponse {
  statusCode: number;
  message: string;
  data: {
    kpis: {
      mahatria: {
        groupedProgramMetrics: {
          unallocated: {
            programs: any[];
          };
          allocated: {
            programs: any[];
          };
        };
      };
    };
    data: any[];
  };
}

export const fetchSwapRequests = async (
  programId: string | number,
  setApprovedUsers: (users: any[]) => void,
  setKpiData: (data: any) => void,
) => {
  try {
    const response = await getCallWithLoader<SwapResponse>(
      `program-registration/swap/${programId}`,
        undefined,
        PORTAL,
        textConstant.LARGE 
    );

    if (response?.data?.statusCode === 200) {
      // Transform kpis to match sidebar format while keeping original filters
      const transformedKpis = {
        unallocatedCounts: {
          totals: {
            totalUnallocatedCount: {
              value: 3,
              label: "Total",
              kpiFilter: response.data.data.kpis[0]?.filters || {},
              kpiCategory: "swap",
            },
            // Keep original gender filters
            totalMaleCount: {
              value:
                response.data.data.kpis.find((k) => k.filters.gender === "male")
                  ?.count || 0,
              label: "Male",
              kpiFilter:
                response.data.data.kpis.find((k) => k.filters.gender === "male")
                  ?.filters || {},
              kpiCategory: "swap",
            },
            totalFemaleCount: {
              value:
                response.data.data.kpis.find(
                  (k) => k.filters.gender === "female",
                )?.count || 0,
              label: "Female",
              kpiFilter:
                response.data.data.kpis.find(
                  (k) => k.filters.gender === "female",
                )?.filters || {},
              kpiCategory: "swap",
            },
          },
        },
        // Keep original program filters
        unallocatedPrograms: response.data.data.kpis
          .filter((kpi) => kpi.filters.requestedProgramId)
          .map((kpi) => ({
            programId: kpi.filters.requestedProgramId,
            programName: kpi.kpiName,
            count: kpi.count,
            kpiFilter: kpi.filters,
            kpiCategory: "swap",
          })),
      };

      setKpiData(transformedKpis);
     
      const swapUsers = mapswapApiDataToUserCards(response.data.data.data, true);
      setApprovedUsers(swapUsers);
    }
  } catch (error) {
    console.error("Error fetching swap requests:", error);
    setApprovedUsers([]);
  }
};

export const handleSwapSidebarClick = async (
  kpiFilter: any,
  programId: string | number,
  setApprovedUsers: (users: any[]) => void,
  setLoading: (loading: boolean) => void,
) => {
  try {
    setLoading(true);

    // Convert filters to query parameters
    const queryParams = new URLSearchParams();
    queryParams.append(
      "filters",
      JSON.stringify({
        requestedProgramId: kpiFilter?.requestedProgramId,
      }),
    );

    // Append query parameters to URL
    const url = `program-registration/swap/${programId}${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

  
    const response = await getCall(url, undefined, PORTAL);
    if (response?.data?.statusCode === 200) {
      const swapUsers = mapApiDataToUserCards(response.data.data.data, true);
      setApprovedUsers(swapUsers);
    }
  } catch (error) {
    console.error("Error handling swap sidebar click:", error);
    setApprovedUsers([]);
  } finally {
    setLoading(false);
  }
};

export const fetchAllocatedUsers = async (
  programId: string | number,
  selectedSession: any,
  setTotalRecords: (count: number) => void,
  setApprovedUsers: (users: any[]) => void,
  setKpiData: (data: any) => void,
  paginationProps,
  setPaginationProps,
  setSessions?: (data: any) => void,
  formatSessionsWithSpecial: (sessions: any[]) => any[],
) => {
  try {
    const { pageSize, currentPage } = paginationProps;
    const offset = (currentPage - 1) * pageSize;
    const response = await ApiService.getRegistrationApprovals({
      programId: programId,
      limit: paginationProps.pageSize,
      offset,
      kpiFilter: selectedSession.kpiFilter,
      approvalStatus: "allocated",
    });


    if (response?.data?.statusCode === 200) {
      const responseData = response.data.data;

      setTotalRecords(
        responseData?.pagination?.totalRecords || 0,
      );

      // Set KPI data
      setKpiData({
        unallocatedCounts:
          responseData?.kpis.mahatria.groupedProgramMetrics.unallocated,
        unallocatedPrograms:
          responseData?.kpis.mahatria.groupedProgramMetrics.unallocated
            .programs,
        allocatedPrograms:
          responseData?.kpis.mahatria.groupedProgramMetrics.allocated
            .programs,
        allocatedCounts:
          responseData?.kpis.mahatria.groupedProgramMetrics.allocated,
        allKpi:
          responseData?.kpis.mahatria.groupedProgramMetrics?.allKpis || {},
        swapRequests:
          responseData?.kpis.mahatria.groupedProgramMetrics?.swapRequests ||
          [],
      });

      // Map and set approved users
      const approved = mapApiDataToUserCards(responseData.data, true);
      const sessionsWithSpecial = formatSessionsWithSpecial(responseData);

        setSessions(sessionsWithSpecial);
      setApprovedUsers(approved);

      setPaginationProps((prev) => {
        return {
          ...prev,
          totalRecords: responseData?.pagination?.totalRecords || 0,
        };
      })
    }
  } catch (error) {
    console.error("Error fetching allocated users:", error);
    setApprovedUsers([]);
  } 
};



export const handleSessionGridBlessAction = ({
  user,
  session,
  selectedSwapSeeker,
  handleBlessed,
  onBless
}: SessionGridBlessParams): void => {
  if (user.approvalStatus !== ApprovalStatus?.PENDING) {
   
    handleBlessed?.(
      selectedSwapSeeker ? user?.registrationId : user.id,
      session.id,
      selectedSwapSeeker ? "swap" : "move",
      user?.swapRequestId || undefined
    );
  } else {
    onBless(user, session.id, session.type);
  }
};
