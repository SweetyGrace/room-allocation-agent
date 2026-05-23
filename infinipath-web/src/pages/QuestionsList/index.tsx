import React, { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "../../common/components/Button";
import GrayLine from "../../common/components/GrayLine";
import AddQuestionModal from "../../common/components/AddQuestionModal";
import { schema, QuestionFormData } from "../../common/components/AddQuestionModal/addQuestionSchema";
import styles from "./index.module.scss";
import {
  CategoryResponsequestion,
  Question,
  QuestionOption,
} from "../../types/question";
import {
  deleteCall,
  getCall,
  postCall,
  putCall,
} from "../../services/apiService";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import { getItemInLocalStorage } from "../../services/localStorage";
import Loader from "../../common/components/Loader";
import TabsComponent from "../../common/components/TabsComponent";
import { NESTEDTAB, questionStatus, questionTabs } from "../../constants";
import DataGridWithPagination from "../../common/components/DataGridWithPagination";
import { GridColDef } from "@mui/x-data-grid";
import KebabMenu from "../../common/components/KebabMenu";
import QuestionDetailModal from "../../common/components/QuestionDetailModal";
import { formatQuestions, mapOptionsArray, mapQuestionRowToFormData } from "../../utils/adminUtils";

/**
 * QuestionsList Component
 * Manages the display, creation, modification, and deletion of questions
 * Supports draft and published states with tabbed navigation
 */
const QuestionsList: React.FC = () => {
  // State management for questions data and UI
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // User and category management
  const userId = getItemInLocalStorage("seekerDetails")?.id;
  const [categories, setCategories] = useState<CategoryResponsequestion>({
    totalPages: 0,
    pageNumber: 0,
    pageSize: 0,
    totalRecords: 0,
    currentRecords: [],
  });

  // Tab and pagination state
  const [selectedTab, setSelectedTab] = useState(questionTabs?.draft);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Question options and duplication state
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Detail modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null,
  );

  // Form handling with yup validation
  const methods = useForm<QuestionFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: { question: "" },
  });

  /**
   * Fetches categories from the API
   */
  const fetchCategories = async () => {
    try {
      const response = await getCall(
        `${endPoints.category}?limit=50&offset=0&searchText=`,
        undefined,
        PORTAL
        
      );
      if (response?.data?.statusCode === 200) {
        setCategories(response.data.data);
      } else {
        console.error("Error fetching categories:", response?.data?.message);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  /**
   * Fetches and formats questions data from the API
   */
  const fetchQuestionsData = async () => {
    setIsLoading(true);
    try {
      const response = await getCall(
        `${endPoints.question}?limit=50&offset=0&searchText=`,
        undefined,
        PORTAL
      );
      if (response.data?.statusCode === 200) {
        // Map the API response to match our Question interface
        const formattedQuestions = formatQuestions(response.data.data.data);
        setQuestions(formattedQuestions);
        setError(null);
      } else {
        setError("Failed to fetch questions. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles question creation and updates
   * @param data Form data for the question
   * @param status Status of the question (draft/published)
   */
  const handleAddQuestion = async (
    data: QuestionFormData,
    status: string = questionStatus.draft,
  ) => {
    setIsLoading(true);
    try {
      const payload = {
        status: status,
        type: data.type,
        label: data.name,
        createdBy: userId,
        updatedBy: userId,
        options: data.options,
        formSectionId: data?.formSection?.id,
        config: data?.config, // Add config object to payload
        categoryId: data.category === "Other" ? null : data.category,
      };

      if (editingQuestion) {
        const response = await putCall(
          `${endPoints.question}/${editingQuestion.id}`,
          payload,
          PORTAL
        );
        if (response?.data?.statusCode === 200) {
          fetchQuestionsData();
          setIsModalOpen(false);
          setEditingQuestion(null);
          methods.reset();
          setError(null);
          return response;
        } else {
          console.error("Error:", response?.data?.message);
          setError("Failed to update question. Please try again.");
        }
      } else {
        const response = await postCall(endPoints.question, payload, PORTAL);
        if (response?.data?.statusCode === 201) {
          setQuestions([...questions, response.data.data]);
          setIsModalOpen(false);
          methods.reset();
          if (isDuplicating) {
            setSelectedTab(questionTabs?.published);
            setCurrentPage(1);
            setPageSize(10);
          }
          setIsDuplicating(false); // Reset the duplication state
          fetchQuestionsData();
          setEditingQuestion(null);
          setError(null);

          return response;
        } else {
          console.error("Error:", response?.data?.message);
          setError("Failed to create question. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        `Failed to ${editingQuestion ? "update" : "create"} question. Please try again.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles question deletion
   * @param id Question ID to delete
   */
  const handleDeleteQuestion = async (id: number) => {
    setIsLoading(true);
    try {
      const payload = {
        id: id,
      };
      const response = await deleteCall(`${endPoints.question}/${id}`, payload, PORTAL);

      if (response.data?.statusCode === 200) {
        fetchQuestionsData();
        setError(null);
      } else {
        console.error("Error:", response?.data?.message);
        setError("Failed to fetch questions. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles question editing
   * @param data Updated question data
   * @param id Question ID to update
   */
  const handleEditQuestion = async (data: QuestionFormData, id: string | undefined) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const payload = {
        label: data.question,
        createdBy: userId,
        updatedBy: userId,
      };
      const response = await putCall(`${endPoints.question}/${id}`, payload, PORTAL);
      setEditingQuestion(null);
      if (response.data?.statusCode === 200) {
        fetchQuestionsData();
        setIsModalOpen(false);
        setEditingQuestion(null);
        methods.reset();
        setError(null);
      } else {
        console.error("Error:", response?.data?.message);
        setIsModalOpen(false);
        setEditingQuestion(null);
        methods.reset();
        setError("Failed to fetch questions. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Tab change handler
   * @param tab Selected tab identifier
   */
  const handleselectTabChange = (tab: string) => {
    setSelectedTab(tab);
    setCurrentPage(1);
  };

  /**
   * Resets modal and form state
   */
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
    setIsDuplicating(false); // Reset the duplication state
    methods.reset();
  };

  /**
   * Defines grid columns and their rendering
   */
  const getQuestionHeaders = (): GridColDef[] => [
    {
      field: "label",
      headerName: "Question",
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

        const getDraftOptions = [
          {
            label: "Edit",
            action: () => {
              const questionData = mapQuestionRowToFormData(params.row);
              setOptions(mapOptionsArray(params.row.options));
              methods.reset(questionData);
              setEditingQuestion(params.row);
              setIsModalOpen(true);
            },
          },
          {
            label: "Delete",
            action: () => handleDeleteQuestion(id),
          },
        ];
        const getPublishedOptions = [
          {
            label: "duplicate",
            action: () => {
              const questionData = mapQuestionRowToFormData(params.row);
              setOptions(mapOptionsArray(params.row.options) as any);
              methods.reset(questionData as any);
              setEditingQuestion(null);
              setIsModalOpen(true);
              setIsDuplicating(true);
            },
          },
        ];

        const handlePublish = async (question: Question, newStatus: string) => {
          try {
            const payload = {
              ...question,
              status: newStatus,
              updatedBy: userId,
            };
            const response = await putCall(
              `${endPoints.question}/${id}`,
              payload,
              PORTAL
            );
            if (response.data?.statusCode === 200) {
              fetchQuestionsData();
              setSelectedTab(questionTabs?.published);
              setCurrentPage(1);
              setPageSize(10);
              setError(null);
            }
          } catch (error) {
            console.error("Error publishing question:", error);
          }
        };

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
   * Filters questions based on status
   * @param status Status to filter by (draft/published)
   */
  const filterQuestions = (status: string) => {
    const filtered = questions.filter((question: any) => question.status === status);
    return filtered;
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

  /**
   * Counts questions by status
   * @param status Status to count (draft/published)
   */
  const getQuestionCountByStatus = (status: string) => {
    return questions.filter((question: any) => question.status === status).length;
  };

  /**
   * Handles row click for question details
   * @param params Grid row parameters
   */
  const handleRowClick = (rowData: unknown) => {
    const params = rowData as { id: string };
    setSelectedQuestionId(Number(params.id));
    setIsDetailModalOpen(true);
  };

  // Initial data fetch
  useEffect(() => {
    fetchQuestionsData();
    fetchCategories();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading && <Loader type="large" data-testid="loader" />}
      <div className={styles.topShadow}>
        <div className={styles.contentContainer}>
          <div className={styles.breadcrumbs}>
            <p className={styles.active}>
              Questions Configuration{" "}
              <span className={styles.questionCount}>
                (
                {getQuestionCountByStatus(
                  selectedTab === questionTabs?.draft
                    ? questionStatus?.draft
                    : questionStatus?.published,
                )}{" "}
                Questions)
              </span>
            </p>
          </div>
          {error && (
            <div className={styles.errorMessage} data-testid="error-message">
              {error}
            </div>
          )}

          {isLoading && (
            <div className={styles.loadingState} data-testid="loading-state">
              Loading...
            </div>
          )}
        </div>
      </div>

      <FormProvider {...methods}>
        <AddQuestionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onAdd={handleAddQuestion as any}
          onEdit={handleEditQuestion as any}
          editingQuestion={editingQuestion}
          categories={categories}
          fetchCategories={fetchCategories}
          fetchQuestionsData={fetchQuestionsData}
          options={options}
          setOptions={setOptions}
          isDuplicating={isDuplicating} // Add this line
        />
      </FormProvider>

      <div className={styles.tabsContainer}>
        <div className={styles.tabsAndSearch}>
          <TabsComponent
            tabs={[
              {
                label: NESTEDTAB.DRAFTS,
                count: getQuestionCountByStatus(questionStatus?.draft),
              },
              {
                label: NESTEDTAB.PUBLISHED,
                count: getQuestionCountByStatus(questionStatus?.published),
              },
            ]}
            selectedTab={selectedTab}
            onChange={handleselectTabChange}
          />
          <div>
            <Button
              type="button"
              buttonClassName={styles.submitButton}
              onClick={() => {
                methods.reset({ question: "" });
                setEditingQuestion(null);
                setIsModalOpen(true);
              }}
              datatestid="add-question-button"
            >
              Add Question
            </Button>
          </div>
        </div>
        <GrayLine />
        <div className={styles.questionsGrid}>
          {selectedTab === questionTabs?.draft && (
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
                  onRowClick={handleRowClick}
                  withoutStartAt={true}
                  data-testid="questions-dashboard-draft"
                />
              ) : (
                <p className={styles.noQuestionsText}>No draft questions!</p>
              )}
            </div>
          )}

          {selectedTab === questionTabs?.published && (
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
                  onRowClick={handleRowClick}
                  withoutStartAt={true}
                  data-testid="questions-dashboard-published"
                />
              ) : (
                <p className={styles.noQuestionsText}>
                  No published questions!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add QuestionDetailModal to the JSX */}
      <QuestionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedQuestionId(null);
        }}
        questionId={selectedQuestionId}
      />
    </div>
  );
};

export default QuestionsList;
