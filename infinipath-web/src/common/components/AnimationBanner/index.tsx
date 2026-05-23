import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import bgAnimation from "../../../assets/images/web-home.json";
import mobileAnimation from "../../../assets/images/mobile-animation-home.json";

const AnimationBanner: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isHighResolution, setIsHighResolution] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      setIsMobile(screenWidth <= 600);
      setIsHighResolution(screenWidth > 1366);
    };

    if (typeof window !== "undefined") {
      handleResize(); // Call initially to set the correct state based on the current window size
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: isMobile
      ? mobileAnimation
      : isHighResolution
        ? bgAnimation
        : bgAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "auto",
      }}
      data-testid="lottie-container"
    >
      <Lottie
        options={defaultOptions}
        data-testid="lottie-animation"
      />
    </div>
  );
};

export default AnimationBanner;
