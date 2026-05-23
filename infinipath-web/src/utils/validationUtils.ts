export const isSameDayDate = (d1: Date | string, d2: Date | string): boolean =>
  new Date(d1).toDateString() === new Date(d2).toDateString();

export const isTimeAfter = (time: Date | string, refTime: Date | string): boolean => {
  const t = new Date(time);
  const r = new Date(refTime);
  const th = t.getHours(), tm = t.getMinutes();
  const rh = r.getHours(), rm = r.getMinutes();
  return th > rh || (th === rh && tm > rm);
};

export const getNestedError = (errors: any, path: string): any => {
  const keys = path.split('.');
  let error = errors;
  for (const key of keys) {
    if (!error) return null;
    error = isNaN(Number(key)) ? error[key] : error[Number(key)];
  }
  return error;
};

interface ValidationConfig {
  validationRule?: string;
  minChars?: number;
  maxChars?: number;
  minValue?: number;
  maxValue?: number;
  type: string;
  format?: string;
}

// Extended validation patterns
const validationPatterns = {
  // Basic patterns
  onlyNumbers: "^[0-9]+$",
  onlyCharacters: "^[A-Za-z\\s]+$",
  alphaNumericWithSpecialChars: "^[A-Za-z0-9\\s!@#$%^&*(),.?\":{}|<>]+$",
  
  // New patterns
  alphanumeric: "^[A-Za-z0-9\\s]+$",
  email: "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$",
  phone: {
    india: "^[6-9]\\d{9}$", // Indian phone numbers
    international: "^\\+(?:[0-9] ?){6,14}[0-9]$", // International format
    us: "^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$" // US format
  },
  date: {
    iso: "^\\d{4}-\\d{2}-\\d{2}$", // YYYY-MM-DD
    us: "^(0[1-9]|1[0-2])/(0[1-9]|[12]\\d|3[01])/\\d{4}$", // MM/DD/YYYY
    uk: "^(0[1-9]|[12]\\d|3[01])/(0[1-9]|1[0-2])/\\d{4}$", // DD/MM/YYYY
  },
  url: "^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*\\/?$",
  password: "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
};

export const generateValidationPattern = (config: ValidationConfig): string => {
  const { 
    validationRule = "", 
    minChars, 
    maxChars, 
    minValue, 
    maxValue, 
    type,
    format = 'international'
  } = config;


  let basePattern = "";

  // Handle special validation types
  switch(type) {
    // case 'phone':
    //   basePattern = validationPatterns.phone[format] || validationPatterns.phone.international;
    //   break;
    case 'text':         
      basePattern = validationRule.length > 0 ? validationPatterns[validationRule] : "";
      break;
    case 'date':
      basePattern = validationPatterns.date[format] || validationPatterns.date.iso;
      break;
    case 'number':
      basePattern = validationPatterns.onlyNumbers 
      break;
    case 'email':
      basePattern = validationPatterns.email;
      break;
    
    case 'url':
      basePattern = validationPatterns.url;
      break;
    
    case 'password':
      basePattern = validationPatterns.password;
      break;
    
    case 'alphanumeric':
      basePattern = validationPatterns.alphanumeric;
      break;
    
    default:
      // Handle basic validation rules
      if (validationRule.includes("onlyNumbers")) {
        basePattern = validationPatterns.onlyNumbers;
      } else if (validationRule.includes("onlyCharacters")) {
        basePattern = validationPatterns.onlyCharacters;
      } else if (validationRule.includes("specialCharacters")) {
        basePattern = validationPatterns.specialCharacters;
      }
  }

  // Add length/value constraints
  if ((type === "text" || type === "textarea") && basePattern) {
    basePattern = basePattern.replace(/^\^|\$$/g, "");
    
    if (minChars && maxChars) {
      return `^${basePattern}{${minChars},${maxChars}}$`;
    } else if (minChars) {
      return `^${basePattern}{${minChars},}$`;
    } else if (maxChars) {
      return `^${basePattern}{0,${maxChars}}$`;
    }
} 
  return basePattern || "";
};

// Validation helper function
export const validateInput = ( config: ValidationConfig) => {
  const pattern = generateValidationPattern(config);
//   const regex = new RegExp(pattern);
//   return regex.test(value);

return pattern;
};

// Export validation regex patterns for direct use
export const VALIDATION_REGEX = {
  ALPHANUMERIC_WITH_HYPHENS: /^[a-zA-Z0-9-]+$/,
  WHITESPACE: /\s+/g,
  NON_ALPHANUMERIC: /[^a-zA-Z0-9]/g,
  XLSX_EXTENSION: /\.xlsx$/i,
  ZIP_EXTENSION: /\.zip$/i,
};

// Export replacement strings
export const REPLACEMENT_STRINGS = {
  EMPTY: "",
};

// Generic replace utility function
export const replacePattern = (value: string, pattern: RegExp, replacement: string): string => {
  return value.replace(pattern, replacement);
};