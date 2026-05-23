import React, { useEffect, useMemo, useCallback } from "react";
import { Modal } from "@mui/material";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "../Button";
import DropdownWithInput from "../DropdownTextfield";
import styles from "./index.module.scss";
import { getItemInLocalStorage } from "../../../services/localStorage";
import { postCall } from "../../../services/apiService";
import { endPoints, PORTAL } from "../../../constants/urlConstants";
import {
  AddOptionModalProps,
  CategoryOption,
  categorySelectOption,
  OptionFormData,
} from "../../../types/option";
import { schema } from "./optionFormSchema";
import {
  OPTION_MODAL_TEXT,
  COMMON_FORM_FIELDS,
} from "../../../constants/textConstants";
import { createOptionPayload } from "../../../utils/adminUtils";

/**
 * Modal component for adding, editing, and duplicating options
 * Handles form submission, category creation, and option management
 */
const AddOptionModal: React.FC<AddOptionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  editingOption,
  categories,
  fetchCategories,
  isDuplicating = false,
}) => {
  // Get form methods from FormContext
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    reset,
  } = useFormContext<OptionFormData>();

  const userId = getItemInLocalStorage("seekerDetails")?.id;

  const categoryOptions: CategoryOption[] = useMemo(
    () => [
      ...(Array.isArray(categories?.data) ? categories.data : []).map(
        (cat: categorySelectOption): CategoryOption => ({
          value: cat.id,
          label: cat.name,
        }),
      ),
      { value: "Other", label: "Other" },
    ],
    [categories],
  );

  // Watch category field for conditional rendering
  const selectedCategory = watch("category");
  const showOtherCategoryField =
    selectedCategory === OPTION_MODAL_TEXT.OTHER_VALUE;

  /**
   * Resets form to initial state and clears errors
   */
  const resetForm = useCallback(() => {
    reset({
      name: "",
      type: "",
      category: "",
      otherCategory: "",
    });
    clearErrors();
  }, [reset, clearErrors]);

  /**
   * Creates a new category and returns its ID
   */
  const createNewCategory = async (categoryName: string): Promise<number> => {
    const categoryPayload = {
      name: categoryName,
      createdBy: userId,
      updatedBy: userId,
    };

    const response = await postCall(endPoints.category, categoryPayload, PORTAL);
    if (response?.data?.statusCode !== 201) {
      throw new Error(response?.data?.message || "Failed to create category");
    }

    return response.data.data.id;
  };

  /**
   * Handles form submission for both new and existing categories
   */
  const handleFormSubmit = async (data: OptionFormData) => {
    try {
      let categoryId = data.category;

      // Handle "Other" category creation
      if (data.category === "Other" && data.otherCategory) {
        categoryId = (await createNewCategory(data.otherCategory)).toString();
        await fetchCategories();
      }
      const optionPayload = createOptionPayload(
        data,
        typeof categoryId === "string" ? parseInt(categoryId) : categoryId,
      );
      await onAdd(optionPayload);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error submitting:", error);
      // TODO: Add proper error handling
    }
  };

  // Prefill form when editing
  useEffect(() => {
    if (editingOption && isOpen) {
      reset({
        name: editingOption.name,
        type: editingOption.type,
        category: editingOption.categoryId?.toString() || "",
        otherCategory: "",
      });
    }
  }, [editingOption, isOpen, reset]);

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className={styles.modalContent}>
        <form onSubmit={handleSubmit(handleFormSubmit)} role="form">
          <div className={styles.modalBody}>
            {/* Option Text Field */}
            <div className={styles.labelInput}>
              <div className={styles.fieldLabel}>
                {OPTION_MODAL_TEXT.FORM.LABELS.OPTION}
              </div>
              <div className={styles.fieldBlock}>
                <input
                  {...register("name")}
                  className={`${styles.inputFields} ${errors.name ? styles.errorFields : ""}`}
                  placeholder={OPTION_MODAL_TEXT.FORM.LABELS.OPTION_PLACEHOLDER}
                  data-testid={COMMON_FORM_FIELDS.TEST_IDS.OPTION_INPUT}
                />
                {errors.name && (
                  <span role="alert" className={styles.errorMsg}>
                    <span>{String(errors.name.message)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Type Dropdown */}
            <Controller
              name="type"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <DropdownWithInput
                  {...field}
                  label={OPTION_MODAL_TEXT.FORM.LABELS.TYPE}
                  options={OPTION_MODAL_TEXT.TYPE_OPTIONS}
                  onValueChange={(value: string | string[]) => {
                    setValue("type", value as string);
                    if (value !== OPTION_MODAL_TEXT.OTHER_VALUE) {
                      setValue("otherType", "");
                    }
                    clearErrors("type");
                  }}
                  error={errors.type?.message}
                  otherError={errors.otherType?.message}
                  showOtherField={
                    watch("type") === OPTION_MODAL_TEXT.OTHER_VALUE
                  }
                  height="35px"
                />
              )}
            />

            {/* Category Dropdown */}
            <Controller
              name="category"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <DropdownWithInput
                  {...field}
                  label={OPTION_MODAL_TEXT.FORM.LABELS.CATEGORY}
                  options={categoryOptions}
                  onValueChange={(value: string | string[]) => {
                    setValue("category", value as string);
                    if (value !== OPTION_MODAL_TEXT.OTHER_VALUE) {
                      setValue("otherCategory", "");
                    }
                    clearErrors("category");
                  }}
                  error={errors.category?.message}
                  otherError={errors.otherCategory?.message}
                  showOtherField={
                    watch("category") === OPTION_MODAL_TEXT.OTHER_VALUE
                  }
                  height="35px"
                />
              )}
            />

            {showOtherCategoryField && (
              <div
                className={styles.labelInput}
                data-testid={COMMON_FORM_FIELDS.TEST_IDS.OTHER_CATEGORY_FIELD}
              >
                <div className={styles.fieldBlock}>
                  <input
                    {...register("otherCategory")}
                    className={`${styles.inputFields} ${errors.otherCategory ? styles.errorFields : ""}`}
                    placeholder={
                      OPTION_MODAL_TEXT.FORM.LABELS.OTHER_CATEGORY_PLACEHOLDER
                    }
                    data-testid={
                      COMMON_FORM_FIELDS.TEST_IDS.OTHER_CATEGORY_INPUT
                    }
                  />
                </div>
                {errors.otherCategory && (
                  <span role="alert" className={styles.errorMsg}>
                    {errors.otherCategory.message}
                  </span>
                )}
              </div>
            )}

            <div className={styles.buttonContainer}>
              <Button
                type="button"
                buttonClassName={styles.buttonText}
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                datatestid={COMMON_FORM_FIELDS.TEST_IDS.CANCEL_BUTTON}
              >
                {OPTION_MODAL_TEXT.FORM.BUTTONS.CANCEL}
              </Button>
              <Button
                type="submit"
                buttonClassName={styles.buttonText}
                datatestid={COMMON_FORM_FIELDS.TEST_IDS.SUBMIT_BUTTON}
              >
                {isDuplicating
                  ? OPTION_MODAL_TEXT.FORM.BUTTONS.DUPLICATE
                  : editingOption
                    ? OPTION_MODAL_TEXT.FORM.BUTTONS.UPDATE
                    : OPTION_MODAL_TEXT.FORM.BUTTONS.SUBMIT}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export { schema };
export default AddOptionModal;
