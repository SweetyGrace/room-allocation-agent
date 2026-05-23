import { getCall, postCall } from "./apiService";
import { endPoints, PORTAL } from "../constants/urlConstants";
import { ID_PROOF_EXPORT } from "../constants";

export interface IdProofExportInitiateResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    jobId: string;
    status: "processing" | "completed" | "failed" | "pending";
    progress: number;
  };
}

export interface IdProofExportStatusResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    jobId: string;
    status: "processing" | "completed" | "failed" | "pending";
    progress: number;
    totalRecords?: number;
    processedRecords?: number;
    signedUrl?: string;
    completedAt?: string;
    errorMessage?: string | null;
  };
}

/**
 * Initiate ID proof export job
 * @param programId - The main program ID
 * @param allocatedProgramId - The allocated program ID (optional)
 * @param key - The bulk download key identifier (e.g., "all_blessed_id_proofs")
 * @param folderName - Name of the folder for the ZIP file
 * @returns Response with job ID and initial status
 */
export const initiateIdProofExport = async (
  programId: number | string,
  allocatedProgramId: string | number | undefined,
  key: string,
  folderName: string
): Promise<IdProofExportInitiateResponse> => {
  const payload: any = {
    programId: typeof programId === 'string' ? Number(programId) : programId,
    key,
    folderName,
  };

  // Only add allocatedProgramId if it exists and is valid, convert to number
  if (allocatedProgramId !== undefined && allocatedProgramId !== null && allocatedProgramId !== '') {
    const numericValue = typeof allocatedProgramId === 'string' 
      ? Number(allocatedProgramId.trim()) 
      : allocatedProgramId;
    
    // Only add if it's a valid number
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      payload.allocatedProgramId = numericValue;
    }
  }


  const response = await postCall(
    endPoints.idProofExportInitiate,
    payload,
    PORTAL
  );

  // postCall returns error.response on failure, or undefined
  if (!response) {
    console.error('Response is undefined or null');
    throw new Error('No response from server');
  }

  // Check status - could be response.status or response.statusCode
  const statusCode = response.status || response.statusCode || 0;
  
  // Check if this is an error response (status >= 400)
  if (statusCode >= 400) {
    const errorData = response.data || response;
    let errorMessage = 'Failed to initiate ID proof export';
    
    console.error('API returned error. Status:', statusCode, 'Full error data:', errorData);
    
    if (errorData?.message) {
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(', ');
      } else if (typeof errorData.message === 'object' && errorData.message.message) {
        if (Array.isArray(errorData.message.message)) {
          errorMessage = errorData.message.message.join(', ');
        } else {
          errorMessage = String(errorData.message.message);
        }
      } else if (typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      }
    }
    
    console.error('Extracted error message:', errorMessage);
    throw new Error(errorMessage);
  }

  // Check if we have data in the response
  if (!response.data) {
    console.error('Response data is missing');
    throw new Error('Invalid response from server - no data');
  }

  // Check if totalRecords is 0
  if (response.data.data && response.data.data.totalRecords === 0) {
    console.error('No records available for download');
    throw new Error('No records available to download.');
  }

  // Success response
  console.log('Returning success response data');
  return response.data;
};

/**
 * Check the status of an ID proof export job
 * @param jobId - Job ID to check status for
 * @returns Response with current job status and progress
 */
export const checkIdProofExportStatus = async (
  jobId: string
): Promise<IdProofExportStatusResponse> => {
  const response = await getCall(
    endPoints.idProofExportStatus(jobId),
    undefined,
    PORTAL
  );

  return response.data;
};

/**
 * Poll for export status until completion or failure
 * @param jobId - Job ID to poll
 * @param onProgress - Callback for progress updates
 * @param pollingInterval - Time between polls in milliseconds
 * @param maxPollingTime - Maximum time to poll in milliseconds
 * @returns Final status response when completed or failed
 */
export const pollIdProofExportStatus = async (
  jobId: string,
  onProgress: (progress: number, status: string) => void,
  pollingInterval: number = ID_PROOF_EXPORT.POLLING_INTERVAL,
  maxPollingTime: number = ID_PROOF_EXPORT.MAX_POLLING_TIME
): Promise<IdProofExportStatusResponse> => {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const pollInterval = setInterval(async () => {
      try {
        // Check if we've exceeded max polling time
        if (Date.now() - startTime > maxPollingTime) {
          clearInterval(pollInterval);
          reject(new Error("Export polling timeout. Please try again."));
          return;
        }

        const response = await checkIdProofExportStatus(jobId);
        const { status, progress } = response.data;

        // Call progress callback
        onProgress(progress, status);

        // Check if job is complete or failed
        if (status === ID_PROOF_EXPORT.STATUS.COMPLETED) {
          clearInterval(pollInterval);
          resolve(response);
        } else if (status === ID_PROOF_EXPORT.STATUS.FAILED) {
          clearInterval(pollInterval);
          reject(
            new Error(
              response.data.errorMessage || "Export failed. Please try again."
            )
          );
        }
        // Continue polling for 'pending' or 'processing' status
      } catch (error) {
        clearInterval(pollInterval);
        reject(error);
      }
    }, pollingInterval);
  });
};

/**
 * Download file from signed URL
 * @param signedUrl - S3 signed URL for the file
 * @param fileName - Name for the downloaded file
 */
export const downloadFromSignedUrl = (
  signedUrl: string,
  fileName: string = "id-proofs.zip"
): void => {
  const link = document.createElement("a");
  link.href = signedUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
