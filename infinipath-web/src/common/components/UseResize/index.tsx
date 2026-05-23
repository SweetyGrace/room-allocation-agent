import { useState, useEffect } from "react";

const UseResize = () => {
  // Initialize with actual screen dimensions
  const getInitialScreenWidth = () => {
    if (typeof window !== "undefined" && typeof screen !== "undefined") {
      return screen.width;
    }
    return 1920; // Default desktop width
  };

  const initialWidth = getInitialScreenWidth();

  const [isMobileResolution, setIsMobileResolution] = useState(initialWidth <= 600);
  const [isTabResolution, setIsTabResolution] = useState(initialWidth > 600 && initialWidth <= 1024);
  const [isHighResolution, setIsHighResolution] = useState(initialWidth > 1024);
  const [isCustomResolution, setIsCustomResolution] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = screen.width;
      const screenHeight = screen.height;
      setIsMobileResolution(screenWidth <= 600);
      setIsTabResolution(screenWidth > 600 && screenWidth <= 1024);
      setIsHighResolution(screenWidth > 1024);
      setIsCustomResolution(screenWidth > 1023 && screenWidth <= 1200 && screenHeight > 767 && screenHeight <= 900);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return { isMobileResolution, isTabResolution, isHighResolution, isCustomResolution };
};

export default UseResize;
