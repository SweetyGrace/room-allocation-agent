import React, { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import GrayLine from "../../common/components/GrayLine";
import AddOptionModal, {
  schema,
  OptionFormData,
} from "../../common/components/AddOptionModal";
import styles from "./index.module.scss";
import {
  deleteCall,
  getCall,
  postCall,
  putCall,
} from "../../services/apiService";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import { getItemInLocalStorage } from "../../services/localStorage";
import Loader from "../../common/components/Loader";
import { CategoryResponse, Option } from "../../types/question";
import TabsComponent from "../../common/components/TabsComponent";
import { NESTEDTAB, questionStatus, questionTabs } from "../../constants";
import { Button } from "../../common/components/Button";
import DataGridWithPagination from "../../common/components/DataGridWithPagination";
import KebabMenu from "../../common/components/KebabMenu";
import { GridColDef } from "@mui/x-data-grid";

/**
 * OptionsList Component
 * Manages the display, creation, modification, and deletion of options
 * Supports draft and published states with tabbed navigation
 */
const OptionsList: React.FC = () => {
  // Data state management
  const [options, setOptions] = useState<Option[]>([]);
  const [categories, setCategories] = useState<CategoryResponse>({
    totalPages: 0,
    pageNumber: 0,
    pageSize: 0,
    totalRecords: 0,
    currentRecords: [],
  });

  // UI state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [nestedTab, setNestedTab] = useState(questionTabs.draft);

  // Get user ID from local storage
  const userId = getItemInLocalStorage("seekerDetails")?.id;

  // Form handling setup
  const methods = useForm<OptionFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      option: "",
      type: "",
    },
  });

  /**
   * Fetches options data from the API
   * Updates options state and handles loading/error states
   */
  const fetchOptionsData = async () => {
    setIsLoading(true);
    try {
      const response = await getCall(
        `${endPoints.option}?limit=50&offset=0&searchText=`,
        undefined,
        PORTAL

      );
      if (response.data?.statusCode === 200) {
        setOptions(response.data.data.data);
        setError(null);
      } else {
        console.error("Error:", response?.data?.message);
        setError("Failed to fetch options. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch options. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches categories from the API
   * Updates categories state
   */
  const fetchCategories = async () => {
    try {
      const response = await getCall(
        `${endPoints.category}?limit=50&offset=0&searchText=`,
        undefined,
        PORTAL
      );
      if (response?.data?.statusCode === 200) {
        // Access the nested data array
        setCategories(response.data.data);
      } else {
        console.error("Error fetching categories:", response?.data?.message);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  /**
   * Handles option creation and updates
   * @param data Form data for the option
   */
  const handleAddOption = async (data: OptionFormData) => {
    setIsLoading(true);
    try {
      if (editingOption) {
        // Handle edit
        const response = await putCall(
          `${endPoints.option}/${editingOption.id}`,
          data,
          PORTAL
        );
        if (response?.data?.statusCode === 200) {
          fetchOptionsData();
          setIsModalOpen(false);
          setEditingOption(null);
          methods.reset();
          setError(null);
        }
      } else {
        // Handle add
        const response = await postCall(endPoints.option, data, PORTAL);
        if (response?.data?.statusCode === 201) {
          fetchOptionsData();
          setIsModalOpen(false);
          methods.reset();
          setError(null);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        `Failed to ${editingOption ? "update" : "create"} option. Please try again.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles option deletion
   * @param id Option ID to delete
   */
  const handleDeleteOption = async (id: number) => {
    setIsLoading(true);
    try {
      const payload = {
        id: id,
      };
      const response = await deleteCall(`${endPoints.option}/${id}`, payload, PORTAL);
      if (response.data?.statusCode === 200) {
        fetchOptionsData();
        setError(null);
      } else {
        setError("Failed to delete option. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to delete option. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Defines grid columns and their rendering
   * Includes name, type, and action columns
   */
  const getQuestionHeaders = (): GridColDef[] => [
    {
      field: "name",
      headerName: "Option",
      width: 300,
      type: "string",
      renderCell: (params) => (
        <div className={styles.questionCell}>
          <span className={styles.questionText} title={params.value}>
            {params.row.name}
          </span>
        </div>
      ),
    },
    {
      field: "type",
      headerName: "Type",
      width: 200,
      type: "string",
      renderCell: (params) => (
        <div className={styles.questionCell}>
          <span className={styles.questionText} title={params.value}>
            {params.row.type}
          </span>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 300,
      renderCell: (params) => {
        const { status, id } = params.row;
        const handlePublish = async (options: Option, newStatus: string) => {
          try {
            const payload = {
              ...options,
              status: newStatus,
              updatedBy: userId,
            };
            const response = await putCall(
              `${endPoints.option}/${id}`,
              payload,
              PORTAL
            );
            if (response.data?.statusCode === 200) {
              fetchOptionsData();
              setNestedTab(questionTabs.published);
              setPageSize(10);
              setCurrentPage(1);
              setError(null);
            }
          } catch (error) {
            console.error("Error publishing question:", error);
          }
        };

        const getDraftOptions = [
          {
            label: "Edit",
            action: () => {
              // Prepare option data for editing
              const optionData = {
                name: params.row.name,
                type: params.row.type,
                categoryId: params.row.categoryId || "",
                config: params.row.config || {},
              };

              // Reset form with option data
              methods.reset(optionData);

              // Set editing option
              setEditingOption(params.row);
              setIsModalOpen(true);
            },
          },
          {
            label: "Delete",
            action: () => handleDeleteOption(id),
          },
        ];

        const getPublishedOptions = [
          {
            label: "duplicate",
            action: () => {
              // Prepare option data for duplication

              const optionData = {
                name: params.row.name,
                type: params.row.type,
                category: params.row.categoryId || "",
                config: params.row.config || {},
              };

              // Reset form with option data
              methods.reset(optionData);

              // Set duplicating mode
              setIsDuplicating(true);
              setEditingOption(null); // Clear editing state
              setIsModalOpen(true);
            },
          },
        ];

        return (
          <div>
            {status === questionStatus.draft && (
              <div className={styles.actions}>
                <Button
                  type="button"
                  buttonClassName={styles.publishButton}
                  onClick={() =>
                    handlePublish(params.row, questionStatus.published)
                  }
                  datatestid="publish-button"
                >
                  Publish
                </Button>

                <KebabMenu items={getDraftOptions} disableMenu={false} />
              </div>
            )}

            {status === questionStatus.published && (
              <div className={styles.actions}>
                <KebabMenu items={getPublishedOptions} disableMenu={false} />
              </div>
            )}
          </div>
        );
      },
    },
  ];

  /**
   * Filters options based on status (draft/published)
   * @param status Status to filter by
   */
  const filterQuestions = (status: string) => {
    if (!Array.isArray(options)) {
      console.error("Options is not an array:", options);
      return [];
    }
    const filtered = options.filter((options) => options.status === status);
    return filtered;
  };

  /**
   * Counts options by status
   * @param status Status to count
   */
  const getQuestionCountByStatus = (status: string) => {
    if (!Array.isArray(options)) {
      console.error("Options is not an array:", options);
      return [];
    }
    return options.filter((options) => options.status === status).length;
  };

  /**
   * Pagination handlers
   */
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchOptionsData();
    fetchCategories();
  }, []);

  // Debug log for tab changes
  useEffect(() => {
  }, [nestedTab]);

  return (
    <div className={styles.container}>
      {isLoading && <Loader type="large" data-testid="loader" />}
      <div className={styles.breadcrumbs}>
        <p className={styles.active}>
          Options Configuration <span>({options.length} Options)</span>
        </p>
      </div>
      <div className={styles.tabsHeader}>
        <TabsComponent
          tabs={[
            {
              label: NESTEDTAB.DRAFTS,
              count: getQuestionCountByStatus(questionStatus.draft),
            },
            {
              label: NESTEDTAB.PUBLISHED,
              count: getQuestionCountByStatus(questionStatus.published),
            },
          ]}
          selectedTab={nestedTab}
          onChange={setNestedTab}
        />
        <div className={styles.formRowButton}>
          <Button
            type="button"
            buttonClassName={styles.submitButton}
            onClick={() => {
              setEditingOption(null); // Reset editing state
              methods.reset(); // Reset form
              setIsModalOpen(true);
            }}
            datatestid="add-option-button"
          >
            Add Option
          </Button>
        </div>
      </div>
      <GrayLine />
      <div className={styles.topShadow}>
        <div className={styles.breadcrumbs}>
          {error && (
            <div className={styles.errorMessage} data-testid="error-message">
              {error}
            </div>
          )}
          {isLoading ? (
            <div className={styles.loadingState} data-testid="loading-state">
              Loading...
            </div>
          ) : (
            <>
              {options.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>
                    No options added yet. Click the button below to add your
                    first option.
                  </p>
                </div>
              ) : (
                <div className={styles.optionsList}>
                  {nestedTab === questionTabs.draft && (
                    <div className={styles.gridSection}>
                      {filterQuestions("draft").length > 0 ? (
                        <DataGridWithPagination
                          headers={getQuestionHeaders()}
                          seekersData={filterQuestions("draft")}
                          totalData={filterQuestions("draft").length}
                          pageSize={pageSize}
                          setPageSize={handlePageSizeChange}
                          currentPage={currentPage}
                          setCurrentPage={handlePageChange}
                          loading={isLoading}
                          data-testid="questions-dashboard-draft"
                        />
                      ) : (
                        <p className={styles.noQuestionsText}>
                          No draft questions!
                        </p>
                      )}
                    </div>
                  )}
                  {nestedTab === questionTabs.published && (
                    <div className={styles.gridSection}>
                      {filterQuestions("published").length > 0 ? (
                        <DataGridWithPagination
                          headers={getQuestionHeaders()}
                          seekersData={filterQuestions("published")}
                          totalData={filterQuestions("published").length}
                          pageSize={pageSize}
                          setPageSize={handlePageSizeChange}
                          currentPage={currentPage}
                          setCurrentPage={handlePageChange}
                          loading={isLoading}
                          data-testid="questions-dashboard-draft"
                        />
                      ) : (
                        <p className={styles.noQuestionsText}>
                          No published questions!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <FormProvider {...methods}>
        <AddOptionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setIsDuplicating(false);
            methods.reset();
          }}
          onAdd={handleAddOption}
          editingOption={editingOption}
          categories={categories} // Pass categories to modal
          fetchCategories={fetchCategories}
          isDuplicating={isDuplicating}
        />
      </FormProvider>
    </div>
  );
};

export default OptionsList;
