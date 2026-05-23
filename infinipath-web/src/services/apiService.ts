import Axios, { AxiosError, AxiosResponse } from "axios";
import { getItemInLocalStorage } from "./localStorage";
import { getValidToken } from "./authService";
import { INFINIPATH, PORTAL } from "../constants/urlConstants";
import { ROLE_STORAGE_KEYS, ROLE_API_HEADERS } from "../constants/roleConstants";
import { useState } from "react";
import store from "../store";
import { incrementLoader, decrementLoader } from "../reducers/ProgramReducer";
import { STATUS_CODES, textConstant } from "../constants/textConstants";
import { notify } from "../common/components/ToastMessage";


const PORTAL_BASE_URL = process.env.REACT_APP_PORTAL_BASE_URL;
const INFINIPATH_BASE_URL = process.env.REACT_APP_INFINIPATH_BASE_URL;

const api = Axios.create({
  baseURL: PORTAL_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getValidToken();
    const roleKey = getItemInLocalStorage(ROLE_STORAGE_KEYS.ROLE_KEY);
    config.headers.Authorization = `Bearer ${token} custom`;
    
    // Add active role to headers only for PORTAL API requests
    const isPortalRequest = config.url?.includes(PORTAL_BASE_URL || '');
    if (roleKey && isPortalRequest) {
      config.headers[ROLE_API_HEADERS.ACTIVE_ROLE] = roleKey;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorResponse = error.response;
    // Handle Bad Request (400) errors
    if ((errorResponse && errorResponse.status === 400 && errorResponse.data?.message?.includes("Bad request, user not found")) || errorResponse && errorResponse.status === 401 || ( errorResponse && errorResponse.status === 403)) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }

    return Promise.reject(errorResponse);
  }
);

/**
 * @description This call is prior checking the user while login, before sending the OTP to check the user is already registered or not, this does not require any token
 */
export const postCallForGetUser = <T>(url: string, payload: T, type: string = PORTAL) => {
  return Axios.post( (type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, payload, {})
    .then((response) => response)
    .catch((error) => {
      return error.response;
    });
};

export const postCall = <T>(url: string, payload: T, type: string = PORTAL) => {
  const userId = getItemInLocalStorage("localId");
  const headers: any = {
    Authorization: `Bearer ${getItemInLocalStorage("idToken")}`,
    userid: typeof userId === "number" ? `'${userId}'` : userId,
  };
  
  return api
    .post((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, payload, {
      headers,
    })
    .then((response) => {
      if (response?.data?.message?.includes("User authorization has failed")) {
        signOut();
      }
      return response;
    })
    .catch((error) => {
      return error.response || error.data;
    });
};

export const putCall = <T>(url: string, payload: T, type: string = PORTAL) => {
  const userId = getItemInLocalStorage("localId");
  const headers: any = {
    Authorization: `Bearer ${getItemInLocalStorage("idToken")}`,
    userid: typeof userId === "number" ? `'${userId}'` : userId,
  };
  
  return api
    .put((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, payload, {
      headers,
    })
    .then((response) => {
      if (response?.data?.message?.includes("User authorization has failed")) {
        signOut();
      }
      return response;
    })
    .catch((error) => {
      return error.response;
    });
};

export const getCall = ( 
  url: string,
  _signal?: AbortSignal,
  type: string = PORTAL
  ) => {
  const userId = getItemInLocalStorage("localId");
  const headers: any = {
    Authorization: `Bearer ${getItemInLocalStorage("idToken")}`,
    userid: typeof userId === "number" ? `'${userId}'` : userId,
  };
  
  return api
    .get((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, {
      headers,
    })
    .then((response) => {
      if (response?.data?.message?.includes("User authorization has failed")) {
        signOut();
      }
      return response;
    })
    .catch((error) => {
      return error.response || error;
    });
};

export const getCallApi = ( 
  url: string,
  _signal?: AbortSignal,
  type: string = PORTAL
  ) => {
  const userId = getItemInLocalStorage("localId");
  const headers: any = {
    Authorization: `Bearer ${getItemInLocalStorage("idToken")}`,
    userid: typeof userId === "number" ? `'${userId}'` : userId,
  };
  
  return api
    .get((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, {
      headers,
    })
    .then((response) => {
      if (response?.data?.message?.includes("User authorization has failed")) {
        signOut();
      }
      return response;
    })
    .catch((error) => {
      return error.response || error;
    });
};

export const deleteCall = <T>(url: string, payload?: T, type: string = PORTAL) => {
  const userId = getItemInLocalStorage("localId");
  const headers: any = {
    Authorization: `Bearer ${getItemInLocalStorage("idToken")}`,
    userid: typeof userId === "number" ? `'${userId}'` : userId,
  };
  
  return api
    .delete((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, {
      headers,
      data: payload, // Include the payload in the data property
    })
    .then((response) => {
      if (response?.data?.message?.includes("User authorization has failed")) {
        signOut();
      }
      return response;
    })
    .catch((error) => {
      console.error("Error in deleteCall:", error);
      return error.response;
    });
};

export const getCallForFaceLogin = (url: string, type: string = PORTAL) => {
  return Axios.get((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, {})
    .then((response) => response)
    .catch((error) => {
      return error.response;
    });
};

/**
 * @description Function to sign out the user once the session expires
 */
const signOut = () => {
  alert("Session expired. Please login again.");
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/";
};

/**
 * @description This call is to get user details this does not require any token
 */
export const getCallWithoutAuth = (url: string, type: string = INFINIPATH) => {
  return Axios.get((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url)
    .then((response) => response)
    .catch((error) => {
      return error.response;
    });
};


//infinipath
export const getCallHDBWithoutAuth = (url: string, type: string = INFINIPATH) => {

return Axios.get((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url)
    .then((response) => response)
    .catch((error) => {
      return error.response;
    });
};

export const getCallHDB = (url: string , type: string = INFINIPATH) => {
  const userId = getItemInLocalStorage("localId");
  const headers: any = {
    Authorization: `Bearer ${getItemInLocalStorage("idToken")}`,
    userid: typeof userId === "number" ? `'${userId}'` : userId,
  };
  
  return api
    .get((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, {
      headers,
    })
    .then((response) => {
      if (response?.data?.message?.includes("User authorization has failed")) {
        signOut();
      }
      return response;
    })
    .catch((error) => {
      return error.response;
    });
};


export const postCallWithoutAuth = (url: string, payload: unknown, type: string = PORTAL) => {
  return Axios.post((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, payload, {})
    .then((response) => response)
    .catch((error) => {
      return error.response;
    });
};


export const patchCall=(
  url: string,
  payload: unknown,
  type: string = PORTAL
) => {
  const userId = getItemInLocalStorage("localId");
  const headers: any = {
    Authorization: `Bearer ${getItemInLocalStorage("idToken")} custom`,
    userid: typeof userId === "number" ? `'${userId}'` : userId,
  };
  
  return api
    .patch((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, payload, {
      headers,
    })
    .then((response) => {
      if (response?.data?.message?.includes("User authorization has failed")) {
        signOut();
      }
      return response;
    })
    .catch((error) => {
      return error.response;
    });
};

// API calls with loader integration
export const postCallWithLoader = <T>(
  url: string, 
  payload: T, 
  type: string = PORTAL,
  loaderType?: string,
  notifyConfig?: {
    onSuccess?: { title: string; message: string; type?: string };
    onError?: { title: string; message: string; type?: string };
  }
) => {
  const userId = getItemInLocalStorage("localId");
  const headers: any = {
    Authorization: `Bearer ${getItemInLocalStorage("idToken")}`,
    userid: typeof userId === "number" ? `'${userId}'` : userId,
  };
  
  // Increment loader before API call
  if(loaderType)
  {
    store.dispatch(incrementLoader(loaderType));
  }
  
  return api
    .post((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, payload, {
      headers,
    })
    .then((response) => {
      if (response?.data?.message?.includes("User authorization has failed")) {
        signOut();
      }
      
      const statusCode = response?.statusCode || response?.data?.statusCode;
      
      // Handle error status codes (400, 404, etc.)
      if (statusCode === STATUS_CODES.BAD_REQUEST || statusCode === STATUS_CODES.NOT_FOUND) {
        if (notifyConfig?.onError) {
          // Use dynamic message from response if available
          const errorMessage = response?.message || response?.data?.message || notifyConfig.onError.message;
          notify(
            notifyConfig.onError.title,
            errorMessage,
            notifyConfig.onError.type || "warning"
          );
        }
        return response;
      }
      
      // Show success notification if configured
      if (notifyConfig?.onSuccess && statusCode === 200) {
        // Use dynamic message from response if available
        const successMessage = response?.data?.message || notifyConfig.onSuccess.message;
        notify(
          notifyConfig.onSuccess.title,
          successMessage,
          notifyConfig.onSuccess.type || "success"
        );
      }
      return response;
    })
    .catch((error) => {
      // Show error notification if configured
      if (notifyConfig?.onError) {
        notify(
          notifyConfig.onError.title,
          notifyConfig.onError.message,
          notifyConfig.onError.type || "error"
        );
      }
      return error.response || error.data;
    })
    .finally(() => {
      // Decrement loader after API call completes
      if(loaderType)
      {
      store.dispatch(decrementLoader(loaderType));
      }
    });
};

export const putCallWithLoader = <T>(
  url: string, 
  payload: T, 
  type: string = PORTAL,
  loaderType?: string,
  notifyConfig?: {
    onSuccess?: { title: string; message: string; type?: string };
    onError?: { title: string; message: string; type?: string };
  }
) => {
  const userId = getItemInLocalStorage("localId");
  const headers: any = {
    Authorization: `Bearer ${getItemInLocalStorage("idToken")}`,
    userid: typeof userId === "number" ? `'${userId}'` : userId,
  };
  
  // Increment loader before API call
  if(loaderType)
  {
  store.dispatch(incrementLoader(loaderType));
  }
  
  return api
    .put((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, payload, {
      headers,
    })
    .then((response) => {
      if (response?.data?.message?.includes("User authorization has failed")) {
        signOut();
      }
      
      const statusCode = response?.statusCode || response?.data?.statusCode;
      
      // Handle error status codes (400, 404, etc.)
      if (statusCode === STATUS_CODES.BAD_REQUEST || statusCode === STATUS_CODES.NOT_FOUND) {
        if (notifyConfig?.onError) {
          // Use dynamic message from response if available
          const errorMessage = response?.message || response?.data?.message || notifyConfig.onError.message;
          notify(
            notifyConfig.onError.title,
            errorMessage,
            notifyConfig.onError.type || "warning"
          );
        }
        return response;
      }
      
      // Show success notification if configured
      if (notifyConfig?.onSuccess && statusCode === STATUS_CODES.SUCCESS) {
        // Use dynamic message from response if available
        const successMessage = response?.data?.message || notifyConfig.onSuccess.message;
        notify(
          notifyConfig.onSuccess.title,
          successMessage,
          notifyConfig.onSuccess.type || "success"
        );
      }
      return response;
    })
    .catch((error) => {
      // Show error notification if configured
      if (notifyConfig?.onError) {
        notify(
          notifyConfig.onError.title,
          notifyConfig.onError.message,
          notifyConfig.onError.type || "error"
        );
      }
      return error.response;
    })
    .finally(() => {
      // Decrement loader after API call completes
      if(loaderType)
      {
        store.dispatch(decrementLoader(loaderType));
      }
    });
};

export const getCallWithLoader = (
  url: string,
  _signal?: AbortSignal,
  type: string = PORTAL,
  loaderType?: string,
  notifyConfig?: {
    onSuccess?: { title: string; message: string; type?: string };
    onError?: { title: string; message: string; type?: string };
  }
) => {
  const userId = getItemInLocalStorage("localId");
  const headers: any = {
    Authorization: `Bearer ${getItemInLocalStorage("idToken")}`,
    userid: typeof userId === "number" ? `'${userId}'` : userId,
  };
  
  // Increment loader before API call
  if(loaderType)
  {
  store.dispatch(incrementLoader(loaderType));
  }
  
  return api
    .get((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, {
      headers,
    })
    .then((response) => {
      if (response?.data?.message?.includes("User authorization has failed")) {
        signOut();
      }
      
      const statusCode = response?.statusCode || response?.data?.statusCode;
      
      // Handle error status codes (400, 404, etc.)
      if (statusCode === STATUS_CODES.BAD_REQUEST || statusCode === STATUS_CODES.NOT_FOUND) {
        if (notifyConfig?.onError) {
          // Use dynamic message from response if available
          const errorMessage = response?.message || response?.data?.message || notifyConfig.onError.message;
          notify(
            notifyConfig.onError.title,
            errorMessage,
            notifyConfig.onError.type || "warning"
          );
        }
        return response;
      }
      
      // Handle server errors (500+)
      if (statusCode >= 500) {
        if (notifyConfig?.onError) {
          const errorMessage = response?.message || response?.data?.message || notifyConfig.onError.message;
          notify(
            notifyConfig.onError.title,
            errorMessage,
            notifyConfig.onError.type || "error"
          );
        }
        return response;
      }
      
      // Show success notification if configured
      if (notifyConfig?.onSuccess && statusCode === STATUS_CODES.SUCCESS) {
        // Use dynamic message from response if available
        const successMessage = response?.data?.message || notifyConfig.onSuccess.message;
        notify(
          notifyConfig.onSuccess.title,
          successMessage,
          notifyConfig.onSuccess.type || "success"
        );
      }
      return response;
    })
    .catch((error) => {
      // Show error notification if configured
      if (notifyConfig?.onError) {
        notify(
          notifyConfig.onError.title,
          notifyConfig.onError.message,
          notifyConfig.onError.type || "error"
        );
      }
      return error.response || error;
    })
    .finally(() => {
      // Decrement loader after API call completes
      if(loaderType)
      {
      store.dispatch(decrementLoader(loaderType));
      }
    });
};

export const deleteCallWithLoader = <T>(
  url: string,
  payload?: T,
  type: string = PORTAL,
  loaderType?: string,
  notifyConfig?: {
    onSuccess?: { title: string; message: string; type?: string };
    onError?: { title: string; message: string; type?: string };
  }
) => {
  const userId = getItemInLocalStorage("localId");
  const headers: any = {
    Authorization: `Bearer ${getItemInLocalStorage("idToken")}`,
    userid: typeof userId === "number" ? `'${userId}'` : userId,
  };
  
  // Increment loader before API call
  if(loaderType)
  {
  store.dispatch(incrementLoader(loaderType));
  }
  
  return api
    .delete((type == PORTAL ? PORTAL_BASE_URL: INFINIPATH_BASE_URL) + url, {
      headers,
      data: payload,
    })
    .then((response) => {
      if (response?.data?.message?.includes("User authorization has failed")) {
        signOut();
      }
      // Show success notification if configured
      if (notifyConfig?.onSuccess && response?.data?.statusCode === 200) {
        notify(
          notifyConfig.onSuccess.title,
          notifyConfig.onSuccess.message,
          notifyConfig.onSuccess.type || "success"
        );
      }
      return response;
    })
    .catch((error) => {
      console.error("Error in deleteCallWithLoader:", error);
      // Show error notification if configured
      if (notifyConfig?.onError) {
        notify(
          notifyConfig.onError.title,
          notifyConfig.onError.message,
          notifyConfig.onError.type || "error"
        );
      }
      return error.response;
    })
    .finally(() => {
      // Decrement loader after API call completes
      if(loaderType)
      {
      store.dispatch(decrementLoader(loaderType));
      }
    });
};


const useFetch = () => {
  const [data, setData] = useState<AxiosResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AxiosError | null | unknown>(null);

  const doFetch = async (url: string, type: string = PORTAL) => {
    setLoading(true);
    try {
      const response = await getCallWithLoader(url, undefined, type, textConstant.LARGE );
      setData(response);
    } catch (error: unknown) {
      setError(error);
    } 
    finally {
      setLoading(false);
    }
  };

  return { data, loading, error, doFetch };
};

export default useFetch;
