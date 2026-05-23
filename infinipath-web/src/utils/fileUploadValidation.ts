export const BYTES_PER_KB = 1024;
export const KB_PER_MB = 1024;

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image dimensions'));
    };
    img.src = url;
  });

export const buildAcceptString = (formats: string[]): string =>
  formats.join(',');

/** Converts MIME type array to a deduplicated, uppercased label string e.g. "JPEG, PNG" */
export const buildFormatLabels = (formats: string[]): string =>
  formats
    .map((f) => f.split('/')[1].toUpperCase())
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(', ');

/** Converts a KB value to a human-readable size string e.g. "2MB" or "500KB" */
export const buildFileSizeLabel = (maxFileSizeKB: number): string =>
  maxFileSizeKB >= KB_PER_MB
    ? `${maxFileSizeKB / KB_PER_MB}MB`
    : `${maxFileSizeKB}KB`;

export const buildHintText = (
  formats: string[],
  maxFileSizeKB: number,
  minWidth?: number,
  maxWidth?: number,
  minHeight?: number,
  maxHeight?: number,
): string => {
  const dimParts: string[] = [];
  if (minWidth && minHeight) dimParts.push(`min ${minWidth}×${minHeight}px`);
  if (maxWidth && maxHeight) dimParts.push(`max ${maxWidth}×${maxHeight}px`);

  return [buildFormatLabels(formats), `up to ${buildFileSizeLabel(maxFileSizeKB)}`, ...dimParts].join(' · ');
};

export const validateFileTypeAndSize = (file: File | null): boolean => {
  if (!file) return false;

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  const maxSize = 3 * KB_PER_MB * BYTES_PER_KB;

  if (!allowedTypes.includes(file.type)) {
    console.error("Invalid file type");
    alert("Please upload only JPG, JPEG or PNG images");
    return false;
  }
  if (file.size > maxSize) {
    console.error("File size exceeds 3MB limit");
    alert("File size should not exceed 3MB");
    return false;
  }
  return true;
};
