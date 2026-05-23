import React from "react";
import styles from "./index.module.scss";
import { BANNER_UPLOAD_TEXT } from "../../../constants/textConstants";

interface BannerRendererProps {
  bannerAnimationUrl?: string | null;
  bannerImageUrl?: string | null;
  fallbackImage?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
}

const BannerRenderer: React.FC<BannerRendererProps> = ({
  bannerAnimationUrl,
  bannerImageUrl,
  fallbackImage = "",
  alt = "Banner",
  className = "",
  containerClassName = "",
}) => {
  // Helper function to check if URL is a video type
  const VIDEO_EXTENSIONS = [".mp4", ".webm"] as const;

  const isVideoType = (url: string): boolean => {
    if (!url) return false;
    try {
      const pathname = new URL(url).pathname;
      return VIDEO_EXTENSIONS.some((ext) =>
        pathname.toLowerCase().endsWith(ext),
      );
    } catch {
      // relative URL — strip query/hash manually
      const clean = url.split(/[?#]/)[0];
      return VIDEO_EXTENSIONS.some((ext) => clean.toLowerCase().endsWith(ext));
    }
  };

  // Determine what to render
  const renderBanner = () => {
    // Priority: bannerAnimationUrl > bannerImageUrl > fallbackImage
    if (bannerAnimationUrl) {
      if (isVideoType(bannerAnimationUrl)) {
        return (
          <video
            src={bannerAnimationUrl}
            autoPlay
            loop
            muted
            className={`${styles.bannerVideo} ${className}`}
            aria-label={alt}
          />
        );
      } else {
        // GIF animation or other image format
        return (
          <img
            src={bannerAnimationUrl}
            alt={alt}
            className={`${styles.bannerImage} ${className}`}
          />
        );
      }
    } else if (bannerImageUrl) {
      return (
        <img
          src={bannerImageUrl}
          alt={alt}
          className={`${styles.bannerImage} ${className}`}
        />
      );
    } else if (fallbackImage) {
      return (
        <img
          src={fallbackImage}
          alt={alt}
          className={`${styles.bannerImage} ${className}`}
        />
      );
    } else {
      // No banner available - show placeholder
      return (
        <div className={`${styles.bannerPlaceholder} ${className}`}>
          <span className={styles.placeholderText}>{BANNER_UPLOAD_TEXT.NO_BANNER_PLACEHOLDER}</span>
        </div>
      );
    }
  };

  return (
    <div className={`${styles.bannerContainer} ${containerClassName}`}>
      {renderBanner()}
    </div>
  );
};

export default BannerRenderer;
