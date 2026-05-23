import React from "react";
import Lottie from "react-lottie";
import ScanningAnimation from "../../../assets/images/scanner-animation.json";

const ScannerAnimation: React.FC = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: ScanningAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div
      style={{
        width: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "auto",
      }}
      data-testid="lottie-container"
    >
      <Lottie options={defaultOptions} data-testid="lottie-animation" />
    </div>
  );
};

export default ScannerAnimation;
