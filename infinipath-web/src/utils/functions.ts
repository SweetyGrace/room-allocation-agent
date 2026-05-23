import { useState, useEffect } from "react";

export const cityList = [
    { "id": 1, "name": "Hyderabad" },
    { "id": 2, "name": "Mumbai" },
    { "id": 3, "name": "Delhi" },
    { "id": 4, "name": "Bangalore" },
    { "id": 5, "name": "Chennai" },
    { "id": 6, "name": "Kolkata" },
    { "id": 7, "name": "Pune" },
    { "id": 8, "name": "Ahmedabad" },
    { "id": 9, "name": "Jaipur" },
    { "id": 10, "name": "Surat" },
    { "id": 11, "name": "Lucknow" },
    { "id": 12, "name": "Kanpur" },
    { "id": 13, "name": "Nagpur" },
    { "id": 14, "name": "Patna" },
    { "id": 15, "name": "Indore" },
    { "id": 16, "name": "Bhopal" },
    { "id": 17, "name": "Vadodara" },
    { "id": 18, "name": "Ludhiana" },
    { "id": 19, "name": "Agra" },
    { "id": 20, "name": "Varanasi" },
    { "id": 21, "name": "Amritsar" },
    { "id": 22, "name": "Coimbatore" },
    { "id": 23, "name": "Thiruvananthapuram" },
    { "id": 24, "name": "Guwahati" },
    { "id": 25, "name": "Ranchi" },
    {"id": 26, "name": "Other"}
  ]



export function useResponsive() {
  const [isMobileResolution, setIsMobileResolution] = useState(false);
  const [isTabletResolution, setIsTabletResolution] = useState(false);
  const [isWebResolution, setIsWebResolution] = useState(false);

  useEffect(() => {
    function handleResize() {
      const width = screen.width;
      setIsMobileResolution(width <= 600);
      setIsTabletResolution(width > 600 && width <= 1024);
      setIsWebResolution(width > 1024);
    }

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobileResolution, isTabletResolution, isWebResolution };
}
export const PREFERENCE_KEYS = {
  TOTAL_PREFERENCES: "totalPreferences",
  TOTAL_BLESSED_SEEKERS: "totalBlessedSeekers",
};