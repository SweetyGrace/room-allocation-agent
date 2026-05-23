import { useState } from "react";
import styles from "./index.module.scss";
import ImagePreview from "../ImagePreview";
import { pdf_viewer } from "../../../constants/textConstants";

export const UploadSlot = ({ label, uploadedFile, onFileChange, required = false, error }: { label: string, uploadedFile: File | string | null, onFileChange: (file: File) => void, required?: boolean, error?: string }) => {
  const [dragActive, setDragActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState({ image: "", altText: "" });
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      onFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  // Render thumbnail for images, icon for PDF, and handle S3 URL string with MIME type at the end
  const renderPreview = () => {
    if (!uploadedFile) return null;
    // If uploadedFile is a File object
    if (uploadedFile instanceof File) {
      if (uploadedFile.type.startsWith('image/')) {
        return (
          <div className={styles.imageContainer}>
            <img
              src={URL.createObjectURL(uploadedFile)}
              alt="uploaded"
              className={styles.thumbnail}
            />
            <div className={styles.hoverEyePreview} onClick={() => {
                setPreviewImageUrl({
                    image: URL.createObjectURL(uploadedFile),
                    altText: "uploaded"
                  })
                  setTimeout(() => setOpen(true), 50)
              }}></div>
            <ImagePreview imageUrl={previewImageUrl.image} altText={previewImageUrl.altText} setOpen={setOpen} isOpen = {open} height={500}></ImagePreview>
          </div>
        );
      } else if (uploadedFile.type === 'application/pdf') {
        return (
          <div className={styles.pdfContainer}>
        <span className={`${styles.thumbnail} ${styles.thumbnailLink}`}
        onClick={() => {
        setPdfUrl(URL.createObjectURL(uploadedFile));
        setPdfOpen(true);
      }}>
            📄
          </span>
            <div 
        className={styles.hoverEyePreview}
        onClick={() => {
          setPdfUrl(URL.createObjectURL(uploadedFile));
          setPdfOpen(true);
        }}
      ></div>
          </div>
        );
      } else {
        return null;
      }
    }
    // If uploadedFile is a string (S3 URL with MIME type at the end)
    if (typeof uploadedFile === 'string') {
      if (uploadedFile.includes('png') || uploadedFile.includes('jpeg') || uploadedFile.includes('jpg') || uploadedFile.includes('webp')) {
        return (
          <div className={styles.imageContainer}>
            <img
            src={uploadedFile}
            alt="uploaded"
            className={styles.thumbnail}
          />
          <div className={styles.hoverEyePreview} onClick={() => {
              setPreviewImageUrl({
                image: uploadedFile,
                altText: "uploaded"
              })
              setTimeout(() => setOpen(true), 50)
            }}></div>
            <ImagePreview imageUrl={previewImageUrl.image} altText={previewImageUrl.altText} setOpen={setOpen} isOpen={open} height={500}></ImagePreview>
          </div>
        );
      } else if (uploadedFile.includes('pdf')) {
        return (
          <div className={styles.pdfContainer}>
          <span
            className={`${styles.thumbnail} ${styles.thumbnailLink} `}
            onClick={() => {
              setPdfUrl(uploadedFile);
              setPdfOpen(true);
            }}
          >
            📄
          </span>
         <div 
        className={styles.hoverEyePreview}
        onClick={() => {
          setPdfUrl(uploadedFile);
          setPdfOpen(true);
        }}
      ></div>
          </div>
        );
      } else {
        return (
          <span className={`${styles.thumbnail} ${styles.thumbnailLink}`}>
            📁
          </span>
        );
      }
    }
    return null;
  };
    const getDropAreaClass = () => { 
    let className = styles.dropArea; 
    if (dragActive) { 
      className += ` ${styles.dragActive}`; 
    }
    if (error) { 
      className += ` ${styles.fieldInputError}`;
    }
    return className; 
  };
  
  return (
    <div className={styles.uploadBox}>
      <label className={styles.uploadLabel}>
        {label}
        {!required && <span className={styles.optional}>(optional)</span>}
      </label>
      {uploadedFile ? (
        <div className={styles.uploadedPreview}>
          {renderPreview()}
          <div>
            <div className={styles.fileName}>{uploadedFile.name}</div>
            <div>
              <span
                className={styles.reuploadLabel}
                onClick={() => document.getElementById(label)?.click()}
              >
                re-upload file
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                id={label}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          className={getDropAreaClass()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className={styles.dragDropLabel}>
            Drag and drop or{' '}
            <label htmlFor={label} className={styles.uploadLink}>
              upload file here
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              id={label}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </p>
          <p className={styles.fileTypes}>
            Please upload your file in (JPEG/PNG/PDF)
          </p>
        </div>
      )}
          {pdfOpen && (
        <div className={styles.pdfModal} onClick={() => setPdfOpen(false)}>
          <div className={styles.pdfModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.pdfCloseButton} onClick={() => setPdfOpen(false)}>
              ✕
            </button>
            <iframe
              src={pdfUrl}
              title={pdf_viewer}
              className={styles.pdfView}
            />
          </div>
        </div>
      )}
    </div>
  );
};