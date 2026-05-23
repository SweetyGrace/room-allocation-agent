import React from 'react';
import { Controller } from 'react-hook-form';
import { ImageUploadFieldProps } from '../../../types/dynamicForm';
import { handleAWSFileUpload } from '../../../pages/RegisteredSeekersDetails/service';
import { getNestedError } from '../../../utils/validationUtils';
import { getImageDimensions, buildAcceptString, buildHintText, buildFormatLabels, buildFileSizeLabel, BYTES_PER_KB } from '../../../utils/fileUploadValidation';
import { IMAGE_UPLOAD_DEFAULTS, IMAGE_UPLOAD_ERRORS } from '../../../constants/textConstants';
import styles from './index.module.scss';

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  field,
  control,
  errors,
  getFieldClassName,
  isPublished,
}) => {
  const [uploading, setUploading] = React.useState(false);
  const [fileName, setFileName] = React.useState('');
  const [validationError, setValidationError] = React.useState('');
  const error = getNestedError(errors, field.name);
  const isDisabled = field.disabled || isPublished;

  const allowedFormats: string[] = (field as any).allowedFormats ?? IMAGE_UPLOAD_DEFAULTS.ALLOWED_FORMATS;
  const maxFileSizeKB: number = (field as any).maxFileSizeKB ?? IMAGE_UPLOAD_DEFAULTS.MAX_FILE_SIZE_KB;
  const minWidth: number | undefined = (field as any).minWidth;
  const maxWidth: number | undefined = (field as any).maxWidth;
  const minHeight: number | undefined = (field as any).minHeight;
  const maxHeight: number | undefined = (field as any).maxHeight;

  const hintText = buildHintText(allowedFormats, maxFileSizeKB, minWidth, maxWidth, minHeight, maxHeight);
  const acceptString = buildAcceptString(allowedFormats);

  const validateFile = async (file: File): Promise<string | null> => {
    if (!allowedFormats.includes(file.type)) {
      return IMAGE_UPLOAD_ERRORS.INVALID_FORMAT(buildFormatLabels(allowedFormats));
    }

    const maxBytes = maxFileSizeKB * BYTES_PER_KB;
    if (file.size > maxBytes) {
      return IMAGE_UPLOAD_ERRORS.FILE_TOO_LARGE(buildFileSizeLabel(maxFileSizeKB));
    }

    if (minWidth || maxWidth || minHeight || maxHeight) {
      try {
        const { width, height } = await getImageDimensions(file);
        if (minWidth && width < minWidth) return IMAGE_UPLOAD_ERRORS.MIN_WIDTH(minWidth, width);
        if (maxWidth && width > maxWidth) return IMAGE_UPLOAD_ERRORS.MAX_WIDTH(maxWidth, width);
        if (minHeight && height < minHeight) return IMAGE_UPLOAD_ERRORS.MIN_HEIGHT(minHeight, height);
        if (maxHeight && height > maxHeight) return IMAGE_UPLOAD_ERRORS.MAX_HEIGHT(maxHeight, height);
      } catch {
        return IMAGE_UPLOAD_ERRORS.DIMENSION_READ_FAILED;
      }
    }

    return null;
  };

  return (
    <div className={getFieldClassName()}>
      <label className={styles.fieldLabel}>
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </label>
      <Controller
        name={field.name}
        control={control}
        render={({ field: controllerField }) => (
          <label
            className={`${styles.fileUploadZone} ${(error || validationError) ? styles.fileUploadZoneError : ''} ${isDisabled || uploading ? styles.imageUploadDisabled : ''}`}
          >
            <input
              type="file"
              accept={acceptString}
              className={styles.imageUploadInput}
              disabled={isDisabled || uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setValidationError('');
                const errMsg = await validateFile(file);
                if (errMsg) {
                  setValidationError(errMsg);
                  e.target.value = '';
                  return;
                }
                setUploading(true);
                setFileName(file.name);
                try {
                  const url = await handleAWSFileUpload(file);
                  if (url) controllerField.onChange(url);
                } finally {
                  setUploading(false);
                }
              }}
            />
            {uploading ? (
              <div className={styles.fileUploadEmpty}>
                <span className={styles.fileUploadText}>Uploading…</span>
              </div>
            ) : controllerField.value ? (
              <div className={styles.fileUploadSelected}>
                <img src={controllerField.value} alt="preview" className={styles.imagePreview} />
                <div className={styles.fileUploadInfo}>
                  <span className={styles.fileUploadFileName}>{fileName || 'Image uploaded'}</span>
                  <span className={styles.fileUploadChange}>Click to change</span>
                </div>
              </div>
            ) : (
              <div className={styles.fileUploadEmpty}>
                <svg className={styles.fileUploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className={styles.fileUploadText}>{field.placeholder || 'Click to upload image'}</span>
                <span className={styles.fileUploadHint}>{hintText}</span>
              </div>
            )}
          </label>
        )}
      />
      {validationError && <span className={styles.errorText}>{validationError}</span>}
      {error && !validationError && <span className={styles.errorText}>{error.message}</span>}
    </div>
  );
};

export default ImageUploadField;
