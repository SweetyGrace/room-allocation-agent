interface ProgramConfig {
  programType: string;
  disableFields: string[];
}

const disabledFieldsConfig: ProgramConfig[] = [
  {
    programType: "HDB/MSD",
    disableFields: [
      "modeOfProgram-online",
      "modeOfProgram-hybrid",
      "isResendential-no",
      "approvalRequired-no",
    ],
  },
  {
    programType: "DemoProgram",
    disableFields: ["title", "date"],
  },
  // Add more program configurations here
];

/**
 * Checks if a specific field should be disabled for a given program
 * @param programName - The name of the program
 * @param fieldName - The name of the field to check
 * @returns boolean - true if the field should be disabled, false otherwise
 */
export const checkToDisable = (
  programName?: string,
  fieldName: string,
): boolean => {
  if (!programName || !fieldName) return false;

  const program = disabledFieldsConfig.find((config) =>
    config.programType?.toLowerCase().includes(programName.toLowerCase()),
  );
  return program ? program.disableFields.includes(fieldName) : false;
};
