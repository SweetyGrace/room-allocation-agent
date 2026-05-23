import styles from "./index.module.scss";
import { useEffect, useRef } from "react";
import lottie from "lottie-web";
import { loader } from "./Loader.ts";
interface LoaderProps {
  type: string;
}
const Loader: React.FC<LoaderProps> = ({ type }) => {
  const loaderContainer = useRef(null);
  useEffect(() => {
    if (loaderContainer.current) {
      const anim = lottie.loadAnimation({
        container: loaderContainer.current, // the dom element that will contain the animation
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: loader, // the path to the animation json
      });

      return () => anim?.destroy(); // optional clean up for unmounting
    }
  }, []);

  return (
    <div
      className={
        type === "large" ? styles.largeLoaderOverlay : styles.smallLoaderOverlay
      }
      data-testid={
        type === "large" ? "large-loader-overlay" : "small-loader-overlay"
      }
    >
      <div
        ref={loaderContainer}
        className={styles.load}
        data-testid="loader-animation-container"
      >
        {" "}
      </div>
    </div>
  );
};

export default Loader;
