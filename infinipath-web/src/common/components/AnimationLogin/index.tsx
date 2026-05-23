import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import animationData from "../../../assets/images/login-animation.json";

const AnimationLogin: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isHighResolution, setIsHighResolution] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      setIsMobile(screenWidth <= 360);
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
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div
      style={{
        width: "100%",
        // maxWidth: '1366px',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "95vh",
      }}
    >
      <Lottie
        options={defaultOptions}
        style={{ width: "100%", height: "100%" }}
        isClickToPauseDisabled={true}
      />
    </div>
  );
};

export default AnimationLogin;
