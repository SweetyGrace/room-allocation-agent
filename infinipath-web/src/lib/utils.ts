import { clsx, type ClassValue } from "clsx"

type StyleObject = { [key: string]: boolean }

export function cn(...inputs: (string | StyleObject | undefined | null | false)[]) {
  // Convert inputs to flat array of classes
  const classes = inputs.reduce<string[]>((acc, input) => {
    if (!input) return acc;
    
    if (typeof input === 'string') {
      return [...acc, ...input.split(' ')];
    }
    
    if (typeof input === 'object') {
      return [
        ...acc,
        ...Object.entries(input)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key)
      ];
    }
    
    return acc;
  }, []);

  // Create a map to track property conflicts
  const propertyMap = new Map<string, string>();
  
  // Process each class to handle conflicts
  classes.forEach(cls => {
    // Extract property and value from class name (e.g., "text-red-500" -> ["text", "red-500"])
    const [property, ...value] = cls.split('-');
    
    if (property && value.length > 0) {
      // Last definition wins
      propertyMap.set(property, cls);
    } else {
      // For classes without properties (e.g., "flex", "hidden")
      propertyMap.set(cls, cls);
    }
  });

  return Array.from(propertyMap.values()).join(' ');
}


