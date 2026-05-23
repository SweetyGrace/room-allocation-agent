/* eslint-disable react/prop-types */
import { useState } from "react";
import styles from "./index.module.scss";
import { ImageAndTextProps } from "../../types/roomAllocation";

const ImageAndText: React.FC<ImageAndTextProps> = ({
  image,
  text,
  additionalClassName,
  additionalTextClassName,
  handleContainerClick,
  handleImageClick,
  hoverImage,
}) => {
  const [currentImage, setCurrentImage] = useState(image);
  return (
    <div
      onClick={handleContainerClick}
      className={`${styles.container} ${additionalClassName}`}
    >
      <img
        onClick={handleImageClick}
        src={currentImage}
        alt="image"
        onMouseEnter={() => hoverImage && setCurrentImage(hoverImage)}
        onMouseLeave={() => setCurrentImage(image)}
      />
        <p className={`${styles.text} ${additionalTextClassName}`}>{text}</p>
    </div>
  );
};
export default ImageAndText;
