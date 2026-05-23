import { FilterConfig } from '../types/roomAllocation';
import { ALL } from '../constants/textConstants';

/**
 * Normalizes a value to a string representation
 * @param value - The value to normalize (can be array or any type)
 * @returns String representation of the value
 */
export const normalizeValue = (value: any): string => {
  if (Array.isArray(value)) {
    return value.join(',');
  }
  return String(value || '');
};

/**
 * Filters options to exclude 'ALL' when only 2 options exist
 * @param filter - The filter configuration object
 * @returns Filtered array of options
 */
export const getFilteredOptions = (filter: FilterConfig) => {
  const options = filter.options || [];
  const allOption = options.find(opt => 
    opt.label && opt.label.trim().toUpperCase() === ALL
  );
  
  // If exactly 2 options and one is ALL, filter out ALL
  if (options.length === 2 && allOption) {
    return options.filter(opt => 
      opt.label && opt.label.trim().toUpperCase() !== ALL
    );
  }
  
  return options;
};

/**
 * Gets the default value for a filter based on its options
 * @param filter - The filter configuration object
 * @returns Default value string
 */
export const getDefaultValue = (filter: FilterConfig) => {
  const options = filter.options || [];
  const allOption = options.find(opt => 
    opt.label && opt.label.trim().toUpperCase() === ALL
  );
  
  if (options.length === 2 && allOption) {
    // Select the non-ALL option
    const otherOption = options.find(opt => 
      opt.label && opt.label.trim().toUpperCase() !== ALL
    );
    return normalizeValue(otherOption?.value);
  } else if (options.length > 2 && allOption) {
    // Select ALL option
    return normalizeValue(allOption.value);
  }
  
  return "";
};

/**
 * Checks if a program has ended based on its end date
 * @param endsAt - The end date string of the program
 * @returns True if the program has ended, false otherwise
 */
export const isProgramEnded = (endsAt: string | null): boolean => {
  if (!endsAt) return false;
  const endDate = new Date(endsAt);
  const currentDate = new Date();
  return endDate < currentDate;
};

/**
 * Finds the first active (non-ended) program from a list of programs
 * @param programs - Array of program objects with endsAt property
 * @returns The first active program or undefined if none found
 */
export const findFirstActiveProgram = (programs: any[]) => {
  return programs.find(program => !isProgramEnded(program.endsAt));
};