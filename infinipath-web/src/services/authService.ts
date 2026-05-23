import { auth } from "../Firebase";
import { getItemInLocalStorage, setItemInLocalStorage } from "./localStorage";

const EXPIRATION_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
let alertShown = false; // Global flag to check if aleert has been shown

export const isTokenExpired = (): boolean => {
  const expirationTime = getItemInLocalStorage("tokenExpirationTime");
  if (!expirationTime) return true;
  return Date.now() >= parseInt(expirationTime) - EXPIRATION_THRESHOLD;
};

export const refreshIdToken = async (): Promise<string> => {
  const isLoggedIn = getItemInLocalStorage("loggedIn") === "yes";
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user: unknown) => {
      unsubscribe(); // Unsubscribe from the listener once we have the user
      if (!user && !isLoggedIn) {
        console.error("No authenticated user");
        localStorage.clear();
        if (!alertShown) {
          console.error("loged out intialized");

          alertShown = true;
        }
        window.location.replace("/");
        reject(new Error("No authenticated user"));
      } else {
        try {
          const newIdTokenObject = await user.getIdTokenResult(true);
          const newIdToken = newIdTokenObject?.token;
          const userId = newIdTokenObject?.claims?.user_id || user?.uid;
          setItemInLocalStorage("idToken", newIdToken);
          setItemInLocalStorage("localId", userId);
          setItemInLocalStorage(
            "tokenExpirationTime",
            new Date(newIdTokenObject?.expirationTime).getTime().toString(),
          );
          resolve(newIdToken);
        } catch (error) {
          localStorage.clear();
          if (!alertShown) {
          debugger;
            alertShown = true;
          }
          window.location.replace("/");
          reject(error);
        }
      }
    });
  });
};

export const getValidToken = async (): Promise<string> => {
  const token = getItemInLocalStorage("idToken");
  return token;
};
