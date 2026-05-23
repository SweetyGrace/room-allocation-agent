
import { PAYMENT_STATUSES, STATUSES } from "../../../constants/textConstants";
import { StepData } from "./HorizontalStepper";

// Define the API response interface (based on your data structure)
interface ApiResponse {
  basicDetailsStatus: string;
  registrationDate: string;
  registrationStatus?: string;
  cancellationDate?: string;
  isFreeSeat: boolean;
  updatedAt: string;
  approvals: Array<{
    approvalStatus: string;
    approvalDate?: string;
    createdAt: string;
    updatedAt: string;
    programMessage?: string; // Added programMessage here
  }>;
  paymentDetails: Array<{
    paymentStatus: string;
    paymentMode?: string;
    paymentDate?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  invoiceDetails: Array<{
    invoiceStatus: string;
    invoiceIssuedDate?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  travelInfo: Array<{
    travelInfoStatus: string;
    createdAt: string;
    updatedAt: string;
  }>;
  travelPlans: Array<any>; // You can define this interface based on your travel plans structure
  swapsRequests: Array<{
    status: string;
    updatedAt: string;
    // Add other fields if needed
  }>;
  allocatedProgram?: {
    name?: string;
    // Add other fields if needed
  };
}

// Function to determine step status based on API response
const getStepStatus = (
  status: string,
  hasData: boolean = true,
): StepData["status"] => {
  if (!hasData) return "not_started";

  switch (status.toLowerCase()) {
    case "completed":
    case "approved":
    case "accepted":
    case "invoice_completed":
    case "offline_completed":
    case "online_completed":
      return "done";
    case "pending":
    case "in_progress":
    case "active":
    case "processing":
    case "online_pending":
    case "travel_plans_pending":
    case "offline_pending":
      return "inprogress";
    case "on_hold":
      return "hold";
    case "rejected":
      return "rejected";
    case "closed":
    case "cancelled":
      return "cancelled";
    default:
      return "not_started";
  }
};

// Function to format date for display
const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "short" }).slice(0, 3);
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
};

// Main transformer function
export const transformApiDataToStepperData = (
  apiData: ApiResponse,
  getTravelStatus?:any
): StepData[] => {
  const steps: StepData[] = [];

  // 1. Registration Step
  const registrationStatus = getStepStatus(apiData.basicDetailsStatus);
  steps.push({
    id: "1",
    title: "Registered",
    subtitle: apiData.registrationDate
      ? formatDate(apiData.registrationDate)
      : "",
    status: registrationStatus,
  });

  // 2. Seat Allocation Step
  const latestApproval =
    apiData.approvals && apiData.approvals.length > 0
      ? apiData.approvals[apiData.approvals.length - 1]
      : null;
  const programName = apiData?.allocatedProgram?.name || "";
  const seatAllocationStatus = latestApproval
    ? getStepStatus(latestApproval.approvalStatus, true)
    : getStepStatus("", false);
  const seatAllocationDate =
    latestApproval?.updatedAt || latestApproval?.approvalDate || "";

  const seatAllocationDescription =
    latestApproval &&
    latestApproval.approvalStatus?.toLowerCase() === "approved"
      ? `Blessed with ${programName}` || ""
      : seatAllocationStatus === "rejected"
        ? "Hold"
        : seatAllocationStatus === "hold"
          ? "Swap demand"
          : "Seat allocation";
  const statusOfPayment =
    seatAllocationDescription === "Seat allocation"
      ? "inprogress"
      : seatAllocationStatus;
  steps.push({
    id: "2",
    title: seatAllocationDescription,
    subtitle: seatAllocationDate ? formatDate(seatAllocationDate) : "",
    status: statusOfPayment,
    description: programName,
    
  });


  // 6. swap request Step
  if (apiData?.swapsRequests && apiData.swapsRequests.length > 0) {
    // Find the latest active swap (status: 'active', 'pending', etc.)
    const activeSwaps = apiData.swapsRequests.filter(
      (swap: any) => swap.status && ["active"].includes(swap.status.toLowerCase())
    );
    
    let latestSwapRequest;
    if (activeSwaps.length > 0) {
      latestSwapRequest = activeSwaps.reduce((latest: any, current: any) => {
        const latestDate = latest.updatedAt || latest.createdAt;
        const currentDate = current.updatedAt || current.createdAt;
        return new Date(currentDate) > new Date(latestDate) ? current : latest;
      }, activeSwaps[0]);

      const latestProgramName =
        latestSwapRequest?.requestedPrograms?.map((program: any) => program.name).join(", ") || "";
      steps.push({
        id: "6",
        title: "Swap Request to " + latestProgramName,
        subtitle: latestSwapRequest ? formatDate(latestSwapRequest.updatedAt || latestSwapRequest.createdAt) : "",
        status: latestSwapRequest
          ? getStepStatus(latestSwapRequest.status, true)
          : getStepStatus("", false),
      });
    } 
  }
  // 3. Payment Step
  const latestPayment =
    apiData.paymentDetails && apiData.paymentDetails.length > 0
      ? apiData.paymentDetails[apiData.paymentDetails.length - 1]
      : null;

  const paymentStatus = latestPayment
    ? getStepStatus(latestPayment.paymentStatus, true)
    : getStepStatus("", false);
const getPaymentDate = (payment: any) => {
  if (payment?.paymentMode === PAYMENT_STATUSES.MODE.ONLINE) {
    return payment?.paymentDate || payment?.updatedAt || "";
  }
  return payment?.markAsReceivedDate || payment?.updatedAt || "";
};

const paymentDate = getPaymentDate(latestPayment);

  if(apiData.isFreeSeat === false)
  {
  steps.push({
    id: "3",
    title: "Payment",
    subtitle: paymentDate ? formatDate(paymentDate) : "",
    status: paymentStatus,
  });
}

  // 4. Invoice Step
  const latestInvoice =
    apiData.invoiceDetails && apiData.invoiceDetails.length > 0
      ? apiData.invoiceDetails[apiData.invoiceDetails.length - 1]
      : null;

  const invoiceStatus = latestInvoice
    ? getStepStatus(latestInvoice.invoiceStatus, true)
    : getStepStatus("", false);

  const invoiceDate =
    latestInvoice?.invoiceIssuedDate || latestInvoice?.updatedAt || "";

  if(apiData.isFreeSeat === false)
  {
  steps.push({
    id: "4",
    title: "Invoice",
    subtitle: invoiceDate ? formatDate(invoiceDate) : "",
    status: invoiceStatus,
  });
}

  // 5. Travel Step
 const hasTravelInfo = apiData.travelInfo?.length > 0;
const hasTravelPlans = apiData.travelPlans?.length > 0;

let travelStatus: StepData["status"] = "not_started";
let travelDate = "";

if (hasTravelInfo || hasTravelPlans) {
  const latestTravelInfo = hasTravelInfo ? apiData.travelInfo[apiData.travelInfo.length - 1] : null;
  const latestTravelPlan = hasTravelPlans ? apiData.travelPlans[apiData.travelPlans.length - 1] : null;
  
if (getTravelStatus === STATUSES.COMPLETED) {
  travelStatus = getStepStatus(STATUSES.COMPLETED, true); 
}
else if (getTravelStatus === STATUSES.PENDING) {
  travelStatus = getStepStatus(STATUSES.PENDING, true); 
}
else {
  travelStatus = getStepStatus(STATUSES.NOT_STARTED, false);
}
  
  // Get the latest date
  const travelInfoDate = latestTravelInfo?.updatedAt || "";
  const travelPlanDate = latestTravelPlan?.updatedAt || "";
  
  travelDate = travelInfoDate > travelPlanDate ? travelInfoDate : travelPlanDate;
}

steps.push({
  id: "5",
  title: "Travel",
  subtitle: travelDate ? formatDate(travelDate) : "",
  status: travelStatus,
});
  if (apiData.registrationStatus === "cancelled") {
  steps.push({
    id: "6",
    title: "Cancelled",
    subtitle: apiData.cancellationDate ? formatDate(apiData.cancellationDate) : "",
    status : apiData.registrationStatus,
  })
}

  return steps;
};

// Usage example function
export const useStepperData = (apiResponseData: ApiResponse): StepData[] => {
  return transformApiDataToStepperData(apiResponseData);
};
