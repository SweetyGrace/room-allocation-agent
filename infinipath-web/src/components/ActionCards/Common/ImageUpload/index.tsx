import React, { useState, useRef, useEffect } from 'react';
import styles from './index.module.scss'; // Import the CSS file
import { postCall } from '../../../../services/apiService';
import { endPoints } from '../../../../constants/urlConstants';
import Loader from '../../../../common/components/Loader';
import { handleAWSFileUpload } from '../../../../utils/commonFunctions';

type ImageData = {
  dataUrl: string | null;
  name: string | null;
};

type ImageUploadProps = {
  imageData: ImageData;
  onImageChange: any;
  accept?: string;
  placeholderText?: string;
  getImageUrl?: any;
  imageError?: boolean;
  uniqueId?: any;
  type?: string;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  imageData,
  onImageChange,
  accept = 'image/*',
  placeholderText = 'Upload image',
  getImageUrl,
  imageError,
  uniqueId,
  type,
}) => {
  const [image, setImage] = useState<ImageData>(imageData);
  const [profile, setProfile] = useState<ImageData>(imageData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfurl, setPdfurl] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [loading, setLoading] = useState(false);

  function removeimagePrefix(image: any) {
    let imageData = image.split('base64,');
    if (imageData && imageData.length > 0) {
      return imageData[1];
    }
    return '';
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const validExtensions = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];
    if (file && validExtensions.includes(file.type)) {
      if (file?.size <= 2097152) {
        setSizeError(false);
        const reader = new FileReader();
        reader.onloadend = async () => {
          let newImage;
          if (type === 'profile') {
            newImage = {
              dataUrl: reader.result as string,
              name: file.name + '_profile',
            };
            setProfile(newImage);
            onImageChange(newImage, type);
          } else {
            newImage = {
              dataUrl: reader.result as string,
              name: file.name,
            };
            setImage(newImage);
            onImageChange(newImage, type);
          }

          const payload = {
            name: String(uniqueId),
            imageBuffer: removeimagePrefix(reader.result as string),
            type: file.type,
          };
          const imgeUploadUrl = endPoints.uploaImage;
          setLoading(true);
          const imageResponse = await postCall(imgeUploadUrl, payload);
          const parsedImageResponse = JSON.parse(
            imageResponse?.data?.data?.body
          );
          if (type !== 'profile') {
            setPdfurl(parsedImageResponse?.url);
          }
          getImageUrl(parsedImageResponse.url, type);
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } else {
        setSizeError(true);
      }
    } else {
      onImageChange('');
    }
  };

  const removeImage = (event: any) => {
    event.preventDefault();
    const emptyImage = { dataUrl: null, name: null };
    if (type === 'profile') {
      setProfile(emptyImage);
    } else {
      setImage(emptyImage);
    }
    onImageChange(emptyImage, type);
    getImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = (event: any) => {
    event.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    if (imageData) {
      setImage(imageData);
    }
  }, [imageData]);

  return loading ? (
    <Loader />
  ) : (
    <div className={styles.container}>
      <div
        className={
          imageError && imageData ? styles.svg_borderError : styles.svg_border
        }
      >
        <svg>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="none"
            stroke={imageError ? '#E28619' : '#1859B4'}
            stroke-width="2"
            stroke-dasharray="8 5"
          />
        </svg>
        <input
          type="file"
          accept={
            type !== 'profile' ? '.jpeg, .jpg, .png, .pdf' : '.jpeg, .jpg, .png'
          }
          onChange={handleAWSFileUpload}
          ref={fileInputRef}
          className={styles.input}
          style={{ display: 'none' }}
        />
        {image?.dataUrl ? (
          <>
            <div
              className={
                image?.dataUrl?.endsWith('pdf') || image?.name?.endsWith('pdf')
                  ? `${styles.pdfDetails}`
                  : `${styles.imageDetails}`
              }
            >
              {image?.dataUrl?.endsWith('pdf') ||
              image?.name?.endsWith('pdf') ? (
                <div className={styles.pdfAnchor}>
                  <a
                    href={pdfurl?.length > 0 ? pdfurl : image?.dataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    preview file
                  </a>
                </div>
              ) : (
                <>
                  <img
                    src={image.dataUrl}
                    alt="Upload"
                    className={styles.image}
                  />
                  <div className={styles.imageName}>{image.name}</div>
                </>
              )}
            </div>
            <div className={styles.buttons}>
              <button
                onClick={(event) => removeImage(event)}
                className={styles.closeButton}
              >
                Delete file
              </button>
              <span>|</span>
              <div>
                <button
                  onClick={(event) => triggerFileInput(event)}
                  className={styles.closeButton}
                >
                  Re-upload file
                </button>
                {sizeError && (
                  <p className={styles.largeSize}>
                    File size is too large (Max. 2MB)
                  </p>
                )}
              </div>
            </div>
          </>
        ) : profile?.dataUrl ? (
          <>
            <div className={styles.imageDetails}>
              <img
                src={profile?.dataUrl}
                alt="Upload"
                className={styles.image}
              />
              <div className={styles.imageName}>{profile?.name}</div>
            </div>
            <div className={styles.buttons}>
              <button
                onClick={(event) => removeImage(event)}
                className={styles.closeButton}
              >
                Delete file
              </button>
              <span>|</span>
              <div>
                <button
                  onClick={(event) => triggerFileInput(event)}
                  className={styles.closeButton}
                >
                  Re-upload file
                </button>
                {sizeError && (
                  <p className={styles.largeSize}>
                    File size is too large (Max. 2MB)
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className={styles.placeholder}
              onClick={(event) => triggerFileInput(event)}
            >
              <p>{placeholderText}</p>
              <p> Maximum file size: 2MB</p>
              {sizeError && (
                <p className={styles.largeSize}>
                  File size is too large (Max. 2MB)
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
