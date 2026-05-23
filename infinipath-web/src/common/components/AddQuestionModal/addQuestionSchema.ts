import * as yup from "yup";

/**
 * Validation schema for question form
 */
export const schema = yup.object().shape({
  question: yup.string().required("Question is required"),
  type: yup.string().required("Type is required"),
  sectionDetails: yup.object().shape({
    id: yup.number(),
    name: yup.string()
  }).required("Form section is required"),

  minChars: yup.number().when("type", {
    is: "text",
    then: (schema) =>
      schema
        .transform((value) => (isNaN(value) ? undefined : value))
        .nullable()
        .test("min-value", "Minimum characters must be at least 0", (value) => {
          if (value === undefined || value === null) return true;
          return value >= 0;
        }),
    otherwise: (schema) => schema.nullable(),
  }),

  maxChars: yup.number().when("type", {
    is: "text",
    then: (schema) =>
      schema
        .transform((value) => (isNaN(value) ? undefined : value))
        .nullable()
        .min(1, "Maximum characters must be at least 1")
        .test(
          "is-greater-than-min",
          "Max chars must be greater than min chars",
          function (value) {
            const minChars = this.parent.minChars;
            if (!value || !minChars) return true;
            return value > minChars;
          },
        ),
    otherwise: (schema) => schema.nullable(),
  }),

  minValue: yup.number().when("type", {
    is: (val: string) => ["number", "rating"].includes(val),
    then: (schema) => schema.required("Minimum value is required"),
    otherwise: (schema) => schema.nullable(),
  }),

  validationRule: yup.string()
   
    .when("type", {
      is: (val: string) => ["text", "number", "textarea"].includes(val),
      then: (schema) => schema.nullable(),
      otherwise: (schema) => schema.nullable(),
    }),

  otherValidationRule: yup.string().when("validationRule", {
    is: (value: string[]) => value?.includes("Other"),
    then: (schema) => schema.required("Please specify the validation rule"),
    otherwise: (schema) => schema.nullable(),
  }),

  isMandatory: yup.boolean().nullable(),
  isDisabled: yup.boolean().nullable(),
  isMultiple: yup.boolean().nullable(),
  enableOtherOption: yup.boolean().nullable(),
  options: yup.array().when("type", {
    is: (val: string) => {
      const optionRequiredTypes = [
        "radio",
        "checkbox",
        "dropdown",
        "rating",
        "select box with text box",
        "location",
      ];
      return optionRequiredTypes.includes(val);
    },
    then: (schema) =>
      schema
        .required("Options are required for this question type")
        .min(1, "At least one option is required")
        .of(
          yup.object().shape({
            label: yup.string().required("Option label is required"),
            optionCategory: yup.array().of(yup.string()).nullable(),
          }),
        ),
    otherwise: (schema) => schema.nullable(),
  }),
});

export type QuestionFormData = yup.InferType<typeof schema>;