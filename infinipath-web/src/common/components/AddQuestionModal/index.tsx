import React, { useEffect, useState } from "react";
import { IconButton, Modal } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFormContext, Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "../Button";
import DropdownWithInput from "../DropdownTextfield";
import styles from "./index.module.scss";
import {
  Option,
  AddQuestionModalProps,
  QuestionFormData,
} from "../../../types/question";
import { getCall } from "../../../services/apiService";
import { getItemInLocalStorage } from "../../../services/localStorage";
import { endPoints, PORTAL } from "../../../constants/urlConstants";
import Select from "react-select";
import { schema } from "./addQuestionSchema";
import {
  questionStatus,
  typeConfigMap,
  typeOptions,
  validationRuleOptions,
} from "../../../constants";
import ConfigField from "../ConfigField";
import { QUESTION_MODAL_TEXT } from "../../../constants/textConstants";
import { createQuestionPayload } from "../../../utils/adminUtils";
import { questionService } from "../../../services/questionService";
import { selectStyles } from "../../../constants/selectStyles";
import "../../styles/common.scss";
import { validateInput } from "../../../utils/validationUtils";

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  editingQuestion,
  fetchCategories,
  fetchQuestionsData,
  categories,
  options = [],
  setOptions = () => {},
  isDuplicating = false, // Add default value
}) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
  } = useFormContext();

  const methods = useForm<QuestionFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      question: "",
      type: "",
      sectionDetails: undefined,
      category: "",
      displayLabel: "",
      placeholder: "",
      minChars: undefined,
      maxChars: undefined,
      minValue: undefined,
      maxValue: undefined,
      validationRule: '', // Change this from [] to ''
      otherValidationRule: "",
      isMandatory: false,
      isMultiple: false,
      isDisabled: false,
      options: [],
    },
  });

  const [setExistingOptions] = useState<Option[]>([]);
  const [showOtherOptionFields, setShowOtherOptionFields] = useState<{
    [key: number]: boolean;
  }>({});

  // Update the renderConfigField to show error message for options
  const renderConfigField = (field: string) => { 
    return(
    <ConfigField
      key={field}
      field={field}
      control={control}
      register={register}
      errors={errors}
      watch={watch}
      setValue={setValue}
      clearErrors={clearErrors}
      validationRuleOptions={validationRuleOptions}
    />
  )
};

  const [sectionDetailsOptions, setSectionDetailsOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const options = await fetchSectionDetailsOptions();
      setSectionDetailsOptions(options);
    };

    fetchOptions();
  }, []);

  const fetchSectionDetailsOptions = async () => {
    try {
      const params = new URLSearchParams({
        limit: "10",
        offset: "0",
        searchText: "",
      });

      const response = await getCall(
        `${endPoints.formSection}?${params.toString()}`,
        undefined,
        PORTAL
      );

      if (response?.data?.statusCode === 200) {
        // Map the API response to dropdown options
        return response.data.data.data.map(
          (section: { id: number; name: string }) => ({
            value: section.id.toString(),
            label: section.name,
          }),
        );
      }
    } catch (error) {
      console.error("Error fetching section details:", error);
      return [{
        value: "1",
        label: "Basic Details"
      }];
    }
  };
  // Add cleanup function
  const resetFormState = () => {
    // Reset form values
    methods.reset({
      question: "",
      type: "",
      sectionDetails: "",
      category: "",
      displayLabel: "",
      placeholder: "",
      minChars: undefined,
      maxChars: undefined,
      minValue: undefined,
      maxValue: undefined,
      validationRule: '', // Change this from [] to ''
      isMandatory: false,
      isDisabled: false,
      isMultiple: false,
      enableOtherOption: false,
      options: [],
    });

    // Reset local state
    setOptions([]);
    setShowOtherOptionFields({});
  };



  // Update the onClose handler
  const handleClose = () => {
    resetFormState();
    onClose();
  };
  const userId = getItemInLocalStorage("seekerDetails")?.id;

  // Convert categories to options format
  const categoryOptions = [
    ...(categories?.data || []).map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  const handleFormSubmit = async (data: QuestionFormData) => {
    try {
      const questionCategoryId = data.category;
      const regex = validateInput(data)
      // Process options
      const processedOptions = await Promise.all(
        (data.options || []).map(async (option) => {
          if (option.label === "Other") {
            const optionCategoryId = option.optionCategory;

            return await questionService.createOption({
              name: option.otherLabel,
              type: option.optionType,
              categoryId: optionCategoryId,
              userId,
            });
          }
          return parseInt(option.label);
        }),
      );

      // Filter valid options and create question
      const validOptionIds = processedOptions.filter(Boolean);
      const questionPayload = createQuestionPayload(
        data,
        userId,
        questionCategoryId,
        processedOptions,
        regex
      );

      // Create question and associate options
      const questionResponse = await onAdd(
        questionPayload,
        isDuplicating ? questionStatus.published : questionStatus.draft,
      );

      if (
        validOptionIds.length > 0 &&
        (questionResponse?.data?.statusCode === 201 ||
          questionResponse?.data?.statusCode === 200)
      ) {
        await questionService.createQuestionOptionAssociation({
          questionId: parseInt(
            editingQuestion?.id || questionResponse.data.data.id,
          ),
          optionIds: validOptionIds,
          userId,
        });
      }

      // Refresh data and close modal
      await Promise.all([
        fetchCategories(),
        fetchQuestionsData(),
        fetchOptions(),
      ]);

      resetFormState();
      onClose();
    } catch (error) {
      console.error("Error submitting question:", error);
      // Show error message to user
    }
  };

  // Add this function to fetch options
  const fetchOptions = async (categoryId?: string) => {
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: "0",
        searchText: "",
        ...(categoryId && { categoryId: JSON.stringify([categoryId]) }), // Send as array
      });

      const response = await getCall(
        `${endPoints.option}?${params.toString()}`,
        undefined,
        PORTAL
      );

      if (response?.data?.statusCode === 200) {
        setExistingOptions(response.data.data.data);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  useEffect(() => {
    const selectedCategory = watch("category");

    if (selectedCategory && selectedCategory !== "Other") {
      // Fetch options for selected category
      fetchOptions(selectedCategory);
    } else {
      // Fetch all options when no category is selected or "Other" is selected
      fetchOptions();
    }
  }, [watch("category")]); // Add dependency on category changes

  // Add state to store options for each option index
  const [optionsByCategory, setOptionsByCategory] = useState<{
    [key: number]: Array<{ value: string; label: string }>;
  }>({});

  // Update fetchOptions to handle multiple categories per option
  const fetchOptionsByCategory = async (
    categories: string[] | null,
    optionIndex: number,
  ) => {
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: "0",
        searchText: "",
        // Only include categoryId if categories are provided
        ...(categories?.length && { categoryId: JSON.stringify(categories) }),
      });

      const response = await getCall(
        `${endPoints.option}?${params.toString()}`,
        undefined,
        PORTAL
      );

      if (response?.data?.statusCode === 200) {
        setOptionsByCategory((prev) => ({
          ...prev,
          [optionIndex]: response.data.data.data.map((opt: unknown) => ({
            value: opt.id.toString(),
            label: opt.name,
          })),
        }));
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const handleOptionChange = (
    index: number,
    field: "label" | "priority",
    value: string | number,
  ) => {
    const updatedOptions = [...options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    };
    setOptions(updatedOptions);
  };

  // Add useEffect to fetch all options initially for each option field
  useEffect(() => {
    if (options.length > 0) {
      options.forEach((_, index) => {
        // Get current categories for this option
        const categories = methods.getValues(`options.${index}.optionCategory`);
        if (!categories || categories.length === 0) {
          // If no categories selected, fetch all options
          fetchOptionsByCategory(null, index);
        }
      });
    }
  }, [options.length]);

  // Add this function to check if type allows options
  const isOptionTypeQuestion = (type: string) => {
    return ["radio", "checkbox", "dropdown"].includes(type) && type !== ""; // Exclude empty type as well
  };


  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className={styles.modalContent}>
        <form onSubmit={handleSubmit(handleFormSubmit)} role="form">
          <div className={styles.modalBody}>
            <div className={styles.labelInput}>
              <div className={styles.fieldLabel}>
                {QUESTION_MODAL_TEXT.FORM.LABELS.QUESTION}
              </div>
              <div className={styles.fieldBlock}>
                <input
                  {...register("question")}
                  className={`${styles.inputFields} ${errors.question ? styles.errorFields : ""}`}
                  placeholder={QUESTION_MODAL_TEXT.FORM.LABELS.PLACEHOLDER}
                  data-testid="question-input"
                />
                {errors.question && (
                  <span role="alert" className={styles.errorMsg}>
                    {errors.question.message}
                  </span>
                )}
              </div>
            </div>

            <Controller
              name="type"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <DropdownWithInput
                  {...field}
                  label={QUESTION_MODAL_TEXT.FORM.LABELS.TYPE}
                  options={typeOptions}
                  onValueChange={(value: string) => {
                    // Clear previous type-specific fields
                    const fieldsToReset = {
                      placeholder: "",
                      minChars: undefined,
                      maxChars: undefined,
                      minValue: undefined,
                      maxValue: undefined,
                      validationRule: "",
                      otherValidationRule: "",
                      fileTypes: [],
                      enableOtherOption: false,
                      options: [],
                    };

                    // Reset form with new type and cleared fields
                    setValue("type", value);
                    Object.keys(fieldsToReset).forEach((fieldName) => {
                      setValue(
                        fieldName as keyof QuestionFormData,
                        fieldsToReset[fieldName as keyof typeof fieldsToReset],
                      );
                    });

                    // Clear all errors
                    clearErrors([
                      "placeholder",
                      "minChars",
                      "maxChars",
                      "minValue",
                      "maxValue",
                      "validationRule",
                      "otherValidationRule",
                      "fileTypes",
                      "options",
                    ]);

                    // Reset options state if changing to/from option-based types
                    if (!["radio", "checkbox", "dropdown"].includes(value)) {
                      setOptions([]);
                      setOptionsByCategory({});
                      setShowOtherOptionFields({});
                    }
                  }}
                  error={errors.type?.message}
                  otherError={errors.otherType?.message}
                  showOtherField={watch("type") === "Other"}
                  height="35px"
                />
              )}
            />
            <Controller
              name="sectionDetails"
              control={control}
              render={({ field }) => (
                <DropdownWithInput
                  {...field}
                  label="Section Details"
                  options={sectionDetailsOptions}
                  onValueChange={(value: string) => {
                    // Find the selected section details
                    if (!value) {
                      setValue("sectionDetails", undefined);
                      return;
                    }
                    const selectedSection = sectionDetailsOptions.find(
                      option => option.value === value
                    );
                    
                    // Set the full object structure
                    setValue("sectionDetails", {
                      id: Number(selectedSection?.value || undefined),
                      name: selectedSection?.label || undefined,
                    });
                    clearErrors("sectionDetails");
                  }}
                  value={field.value?.id?.toString() || undefined} // Show selected value
                  error={errors.sectionDetails?.message}
                  height="35px"
                />
              )}
            />
            <div className={styles.labelInput}>
              <div className={styles.optionsSection}>
                {/* Show options list only if type is selected and options exist */}
                {watch("type") &&
                  options.map((option, index) => (
                    <div
                      key={option.id}
                      className={styles.optionInputContainer}
                    >
                      <div className={styles.otherOptionFields}>
                        {/* Only show category fields if no category is selected at question level */}

                        <>
                          <Controller
                            name={`options.${index}.optionCategory`}
                            control={control}
                            defaultValue={[]} // For multi-select, use empty array as default
                            render={({ field }) => (
                              <Select
                                options={categoryOptions}
                                isMulti
                                className="select"
                                classNamePrefix="filterSelect"
                                menuPlacement="top"
                                placeholder="Select Category"
                                onChange={(selectedOptions) => {
                                  const values = selectedOptions
                                    ? selectedOptions.map((item) => item.value)
                                    : [];
                                  field.onChange(values); // Send only values to form
                                  // Fetch options for this specific option's categories
                                  if (values.length > 0) {
                                    fetchOptionsByCategory(values, index);
                                  } else {
                                    // Clear options for this index if no categories selected
                                    setOptionsByCategory((prev) => {
                                      const updated = { ...prev };
                                      delete updated[index];
                                      return updated;
                                    });
                                  }
                                }}
                                value={categoryOptions.filter(
                                  (option) =>
                                    Array.isArray(field.value) &&
                                    field.value.includes(option.value),
                                )}
                                styles={selectStyles}
                              />
                            )}
                          />
                        </>
                      </div>
                      <div className={styles.optionHeader}>
                        Option {index + 1}
                        <IconButton
                          onClick={() => {
                            const updatedOptions = options.filter(
                              (_, i) => i !== index,
                            );
                            setOptions(updatedOptions);
                            // Clean up other option state
                            const updatedFields = { ...showOtherOptionFields };
                            delete updatedFields[index];
                            setShowOtherOptionFields(updatedFields);
                          }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>

                      <Controller
                        name={`options.${index}.label`}
                        control={control}
                        defaultValue={option.label}
                        render={({ field }) => (
                          <>
                            <DropdownWithInput
                              {...field}
                              label={``}
                              options={[...(optionsByCategory[index] || [])]}
                              value={option.label}
                              onValueChange={(value: string) => {
                                handleOptionChange(index, "label", value);
                              }}
                              error={errors?.options?.[index]?.label?.message}
                              height="35px"
                            />
                          </>
                        )}
                      />
                    </div>
                  ))}

                {/* Show Add Option button only if a type is selected and it's not text/textarea */}
                {watch("type") && isOptionTypeQuestion(watch("type")) && (
                  <Button
                    type="button"
                    buttonClassName={styles.addButton}
                    onClick={() => {
                      setOptions([
                        ...options,
                        {
                          id: `option-${Date.now()}`,
                          label: "",
                          priority: 1,
                          optionId: undefined,
                        },
                      ]);
                    }}
                    datatestid="add-option-button"
                  >
                    {QUESTION_MODAL_TEXT.FORM.BUTTONS.ADD_OPTION}
                  </Button>
                )}
                {errors.options && (
                  <span className={styles.errorMsg}>
                    {errors.options.message}
                  </span>
                )}

                {/* Show validation section */}
                {typeConfigMap[watch("type")]?.length > 0 && (
                  <div className={styles.validationsSection}>
                    {typeConfigMap[watch("type")].map(renderConfigField)}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <Button
                type="button"
                buttonClassName={styles.buttonText}
                onClick={onClose}
                datatestid="cancel-button"
              >
                {QUESTION_MODAL_TEXT.FORM.BUTTONS.CANCEL}
              </Button>
              <Button
                type="submit"
                buttonClassName={styles.buttonText}
                datatestid="submit-button"
              >
                {isDuplicating
                  ? QUESTION_MODAL_TEXT.FORM.BUTTONS.DUPLICATE
                  : editingQuestion
                    ? QUESTION_MODAL_TEXT.FORM.BUTTONS.UPDATE
                    : QUESTION_MODAL_TEXT.FORM.BUTTONS.SUBMIT}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export { schema };
export default AddQuestionModal;
