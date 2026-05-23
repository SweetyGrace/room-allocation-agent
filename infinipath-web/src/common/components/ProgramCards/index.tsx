import React, { useState, useEffect } from "react";
import {
  Card,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import styles from "./index.module.scss";
import {
  programConfigurations,
  getFormSectionsForProgram,
} from "../../../constants/programConfigurations";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../Button";
import { ProgramSelection } from "../ProgramSelection";
import CrossIcon from "../../../assets/images/cross-icon.svg";
import { FormProvider, useForm, Controller } from "react-hook-form";
import DropdownTextfield from "../DropdownTextfieldCopy";
import {
  getCall,
  postCall,
  deleteCall,
  putCall,
} from "../../../services/apiService";
import { endPoints, PORTAL } from "../../../constants/urlConstants";
import CustomDatePicker from "../CustomDatePicker";
import CustomTimePicker from "../CustomTimePicker";
import GrayLine from "../GrayLine";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { getItemInLocalStorage } from "../../../services/localStorage";
import Loader from "../Loader";

interface ProgramForms {
  [key: string]: string[];
}

const mockForms: ProgramForms = {
  HDB: ["Form 1", "Form 2", "Form 3"],
  "TAT - Online": ["Form 1"],
  infinipath: ["Form 1", "Form 2"],
  // Add forms for other programs as needed
};

const questions = [
  {
    id: "programName",
    label: "Program Name",
    type: "text",
    placeholder: "Enter program name",
  },
  {
    id: "modeOfOperation",
    label: "Mode of Program operation",
    options: ["Offline", "Online", "Hybrid"],
  },
  {
    id: "onlineProgramType",
    label: "Type of online program",
    options: ["Webinar", "Meeting"],
    showWhen: (answers) =>
      answers.modeOfOperation === "Online" ||
      answers.modeOfOperation === "Hybrid",
  },
  {
    id: "programs",
    label: "Programs",
    options: ["Yes", "No"],
  },
  {
    id: "residence",
    label: "Residence",
    options: ["Yes", "No"],
  },
  {
    id: "sessions",
    label: "Sessions",
    options: ["Single", "Multiple"],
  },
  {
    id: "frequency",
    label: "Frequency",
    options: [
      "Daily",
      "Weekly",
      "Monthly",
      "Quarterly",
      "Half-Yearly",
      "Yearly",
    ],
  },
  {
    id: "isPaymentInvolved",
    label: "Is Payment Involved?",
    options: ["Yes", "No"],
  },
  {
    id: "isTravelInvolved",
    label: "Is Travel Involved?",
    options: ["Yes", "No"],
  },
  {
    id: "isAttendanceRequired",
    label: "Is attendance Required for All sessions?",
    options: ["Yes", "No"],
  },
  {
    id: "canMinorJoin",
    label: "Is Minor can be part of it?",
    options: ["Yes", "No"],
  },
  {
    id: "canOthersRegister",
    label: "Can others register for me?",
    options: ["Yes", "No"],
  },
  {
    id: "isRegistrationRequired",
    label: "Is program registration required",
    options: ["Yes", "No"],
  },
  {
    id: "areSeatsLimited",
    label: "Are Seats are limited?",
    options: ["Yes", "No"],
  },
  {
    id: "duration",
    label: "Duration",
    type: "text",
    placeholder: "Enter program duration",
  },
];

interface ProgramForm {
  id: string;
  name: string;
  sections: any[]; // Replace with your section type
  createdAt: Date;
  lastModified: Date;
}

interface ProgramData {
  [programName: string]: {
    forms: ProgramForm[];
  };
}

const programTypeOptions = [
  { id: 0, name: "" },
  { id: 1, name: "Existing Program" },
  { id: 2, name: "New Program" },
];

interface Program {
  id: number;
  program: string;
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  noOfSession: number;
  registrationStartDate: string;
  registrationStartTime: string;
  registrationEndDate: string;
  registrationEndTime: string;
  meta: {
    location: string;
    language: string;
  };
  programFee: string;
  isApprovalRequired: boolean;
  isResidenceRequired: boolean;
  isTravelInvolved: boolean;
  maxCapacity: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  programSessions: any[];
}

interface ProgramType {
  id: number;
  name: string;
  description: string;
  programs: Program[];
}

interface ApiResponse {
  data: ProgramType[];
  pagination: {
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    numberOfRecords: number;
  };
}

// Add to your form schema
const programFormSchema = yup.object().shape({
  programName: yup.string().required("Program name is required"),
  startDate: yup.date().required("Start date is required"),
  endTime: yup.date().required("End time is required"),
  startTime: yup.date().required("Start time is required"),
  endDate: yup
    .date()
    .required("End date is required")
    .test("isAfterStart", "Must be after start date", function (value) {
      const startDate = this.parent.startDate;
      if (!startDate || !value) return true;
      return value >= startDate;
    }),
  registrationStartDate: yup
    .date()
    .required("Registration start date is required")
    .test(
      "isBeforeStart",
      "Must be before program start date",
      function (value) {
        const startDate = this.parent.startDate;
        if (!startDate || !value) return true;
        return value <= startDate;
      },
    ),
  registrationStartTime: yup
    .date()
    .required("Registration start time is required"),
  registrationEndDate: yup
    .date()
    .required("Registration end date is required")
    .test(
      "isBeforeStart",
      "Must be before program start date",
      function (value) {
        const startDate = this.parent.startDate;
        if (!startDate || !value) return true;
        return value <= startDate;
      },
    )
    .test(
      "isAfterRegStart",
      "Must be after registration start date",
      function (value) {
        const regStartDate = this.parent.registrationStartDate;
        if (!regStartDate || !value) return true;
        return value >= regStartDate;
      },
    ),
  registrationEndTime: yup.date().required("Registration end time is required"),
  noOfSessions: yup
    .number()
    .required("Number of sessions is required")
    .min(1, "Must be at least 1 session")
    .typeError("Must be a number"),
  location: yup.string().required("Location is required"),
  programFee: yup
    .number()
    .required("Program fee is required")
    .min(0, "Program fee cannot be negative")
    .typeError("Must be a number"),
  maxCapacity: yup
    .number()
    .required("Maximum capacity is required")
    .min(1, "Must be at least 1")
    .typeError("Must be a number"),

  isApprovalRequired: yup
    .boolean()
    .typeError("Approval selection is required")
    .required("Approval selection is required"),

  isResidenceRequired: yup
    .boolean()
    .typeError("Residence selection is required")
    .required("Residence selection is required"),

  isTravelInvolved: yup
    .boolean()
    .typeError("Travel selection is required")
    .required("Travel selection is required"),

  isSuccessAfterBasicRequired: yup
    .boolean()
    .typeError("Success after basic selection is required")
    .required("Success after basic selection is required"),

  isSuccessAfterTravelRequired: yup
    .boolean()
    .typeError("Success after travel selection is required")
    .when("isTravelInvolved", {
      is: true,
      then: (schema) =>
        schema.required("Success after travel selection is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

  isSuccessAfterInvoiceRequired: yup
    .boolean()
    .typeError("Success after invoice selection is required")
    .when("programFee", {
      is: (val: unknown) => typeof val === "number" && val > 0,
      then: (schema) =>
        schema.required("Success after invoice selection is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

const ProgramCards = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, programName, isEditing } = location.state || {};
  const [programData, setProgramData] = useState<ProgramData>({});
  const [programsList, setProgramsList] = useState<ProgramType[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(
    programsList[0]?.name || null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [programType, setProgramType] = useState<"existing" | "new">("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({});
  const [duration, setDuration] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [sectionQuestions, setSectionQuestions] = useState({});

  const userId = getItemInLocalStorage("seekerDetails")?.id;

  const [selectedForms, setSelectedForms] = useState<{
    [key: string]: string[];
  }>({});

  // Update your defaultValues in useForm
  const methods = useForm({
    resolver: yupResolver(programFormSchema),

    mode: "onChange",
    defaultValues: {
      programName: "",
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null,
      registrationStartDate: null,
      registrationStartTime: null,
      registrationEndDate: null,
      registrationEndTime: null,
      noOfSessions: "",
      location: "",
      programFee: "",
      isApprovalRequired: undefined,
      isResidenceRequired: undefined,
      isTravelInvolved: undefined,
      maxCapacity: "",
      isSuccessAfterBasicRequired: undefined,
      isSuccessAfterTravelRequired: undefined,
      isSuccessAfterInvoiceRequired: undefined,
    },
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState(null);

  const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);
  useEffect(() => {
    if (formData && programName) {
      setProgramData((prev) => {
        const programForms = prev[programName]?.forms || [];

        if (isEditing) {
          // Update existing form
          const updatedForms = programForms.map((form) =>
            form.id === formData.id ? formData : form,
          );
          return {
            ...prev,
            [programName]: {
              forms: updatedForms,
            },
          };
        } else {
          // Check if form already exists to prevent duplicates
          const formExists = programForms.some(
            (form) => form.id === formData.id,
          );
          if (formExists) return prev;

          // Add new form
          return {
            ...prev,
            [programName]: {
              forms: [...programForms, formData],
            },
          };
        }
      });
    }
  }, [formData, programName, isEditing]);

  useEffect(() => {
    fetchProgramsList();
  }, []);

  const fetchProgramsList = () => {
    setLoading(true);
    getCall(`${endPoints.programType}`, undefined, PORTAL)
      .then((response) => {
        // if () {
        setProgramsList(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching programs:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCardClick = (program: string) => {
    setSelectedCard(program);
  };

  const handleSubmit = () => {
    if (programType === "new" && !formAnswers.programName) {
      alert("Please enter a program name");
      return;
    }

    const formData = {
      programType,
      program:
        programType === "existing" ? selectedProgram : formAnswers.programName,
      answers: formAnswers,
      duration,
    };

    // Add new program to the list if it's a new program
    if (programType === "new" && formAnswers.programName) {
      setProgramsList((prev) => [...prev, formAnswers.programName]);
      // Also update programConfigurations with the new program's settings
      programConfigurations[formAnswers.programName] = {
        modeOfOperation: formAnswers.modeOfOperation,
        onlineProgramType: formAnswers.onlineProgramType || "NA",
        hasPrograms: formAnswers.programs === "Yes",
        hasResidence: formAnswers.residence === "Yes",
        sessions: formAnswers.sessions,
        frequency: formAnswers.frequency,
        isPaymentRequired: formAnswers.isPaymentInvolved === "Yes",
        isTravelRequired: formAnswers.isTravelInvolved === "Yes",
        isAttendanceRequired: formAnswers.isAttendanceRequired === "Yes",
        allowMinors: formAnswers.canMinorJoin === "Yes",
        allowProxyRegistration: formAnswers.canOthersRegister === "Yes",
        timing: {
          duration: formAnswers.duration,
        },
      };
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setProgramType("");
    setSelectedProgram("");
    setFormAnswers({});
    setDuration(null);
  };

  const handleAddForm = async (
    programName: unknown,
    config: unknown,
    programsList: unknown,
  ) => {
    // const config = programConfigurations[programName];

    const selectedProgramType = programsList.find(
      (pt) => pt.name === selectedCard,
    );


    if (!selectedProgramType) {
      console.error(`No configuration found for program: ${programName}`);
      return;
    }

    // Get initial sections based on program requirements
    const initialSections = ["basicDetails"]; // Always include basic details

    if (selectedProgramType?.involvesTravel) {
      initialSections.push("travelDetails");
    }

    if (selectedProgramType?.requiresPayment) {
      initialSections.push("invoiceDetails");
    }

    try {
      const configPayload = {
        programId: config.id,
        modeOfProgramOperation: selectedProgramType?.modeOfOperation,
        typeOfOnlineProgram: selectedProgramType?.onlineType || "",
        programs: true,
        residence: selectedProgramType?.requiresResidence || false,
        sessions: selectedProgramType?.hasMultipleSessions
          ? "Multiple Sessions"
          : "",
        frequency: selectedProgramType?.frequency,
        duration: selectedProgramType?.defaultDuration || 120,
        paymentInvolved: selectedProgramType?.requiresPayment,
        isTravellInvolved: selectedProgramType?.involvesTravel || false,
        isAttendanceRequiredForAllSessions:
          selectedProgramType?.requiresAttendanceAllSessions,
        isMinorCanBePartOfIt: selectedProgramType?.allowsMinors,
        canOthersRegisterForMe: selectedProgramType?.allowsProxyRegistration,
      };
      setLoading(true);
      const configResponse = await postCall(
        endPoints.generateform,
        configPayload,
        PORTAL
      );

      if (configResponse.status === 200) {
        const programResponse = await getCall(
          `${endPoints.program}/${config.id}`,
          undefined,
          PORTAL
        );

        if (programResponse.status === 200) {
          const questionMaps =
            programResponse.data?.data.programQuestionMaps || [];
          setLoading(false);
          // Group questions by form section
          const sectionMap = new Map();

          questionMaps.forEach((qMap) => {
            const question = qMap.question;
            const sectionName = question?.formSection?.name;

            if (!sectionMap.has(sectionName)) {
              sectionMap.set(sectionName, {
                id: question?.formSection?.id,
                title: sectionName,
                fields: [],
              });
            }

            // Transform question options
            const options =
              question?.questionOptionMaps?.map((optMap) => ({
                value: optMap.option.name.toLowerCase().replace(/\s+/g, "_"),
                label: optMap.option.name,
              })) || [];
            // Add question to section
            sectionMap.get(sectionName).fields.push({
              programQuestionId: qMap.id,
              id: question.id,
              label: question.label,
              type: question.type,
              required: question.config?.required || false,
              options: options,
              validation: question.config,
              status: question.status,
            });
          });

          // Convert map to array and sort sections
          const formSection = Array.from(sectionMap.values()).sort((a, b) => {
            // Custom sort order: Basic Details first, then Travel, then Invoice
            const order = {
              "Basic Details": 1,
              "Travel Details": 2,
              Invoice: 3,
            };
            return (order[a.title] || 99) - (order[b.title] || 99);
          });

          // const formSections = config.data.sections.map((section: any) => ({
          //   id: section.id,
          //   title: section.name,
          //   fields: []
          // }));

          // setSteps(formSections);

          // Update form sections

          // Update section questions
          const newSectionQuestions = {};
          formSection.forEach((section) => {
            newSectionQuestions[
              section.title.toLowerCase().replace(/\s+/g, "_")
            ] = section.fields.map((field) => ({
              programQuestionId: field.programQuestionId,
              id: field.id,
              text: field.label,
              type: field.type,
              required: field.required,
              options: field.options?.map((opt) => opt.label) || [],
              validation: field.validation,
              status: field.status,
            }));
          });
          setSectionQuestions(newSectionQuestions);
          navigate("/admin/program-reg", {
            state: {
              programName,
              programConfig: config,
              selectedProgramType: selectedProgramType,
              availableSections: initialSections,
              formSections: formSection,
              newSectionQuestion: sectionQuestions,
            },
          });
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error generating form:", error);
    }
  };

  const handleEditForm = (programName: string, formId: string) => {
    const form = programData[programName]?.forms.find((f) => f.id === formId);
    if (form) {
      navigate("/admin/program-reg", {
        state: {
          programName,
          programConfig: programConfigurations[programName],
          formData: form,
          isEditing: true,
        },
      });
    }
  };

  const handleDeleteForm = (programName: string, formId: string) => {
    setProgramData((prev) => ({
      ...prev,
      [programName]: {
        forms:
          prev[programName]?.forms.filter((form) => form.id !== formId) || [],
      },
    }));
  };
  // Fix the prefillProgramData function - the time parsing was incorrect
  const prefillProgramData = (programDetails) => {
    // Helper function to parse time string (e.g., "06:00 PM" to Date object)
    const parseTimeString = (timeString) => {
      if (!timeString) return null;

      // Create a date object for today with the given time
      const today = new Date();
      const [time, period] = timeString.split(" ");
      const [hours, minutes] = time.split(":");

      let hour24 = parseInt(hours);
      if (period === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (period === "AM" && hour24 === 12) {
        hour24 = 0;
      }

      const timeDate = new Date();
      timeDate.setHours(hour24, parseInt(minutes), 0, 0);
      return timeDate;
    };

    methods.reset({
      programName: programDetails.name || "anan",
      startDate: programDetails.startDate
        ? new Date(programDetails.startDate)
        : null,
      startTime: parseTimeString(programDetails.startTime),
      endDate: programDetails.endDate ? new Date(programDetails.endDate) : null,
      endTime: parseTimeString(programDetails.endTime),
      registrationStartDate: programDetails.registrationStartDate
        ? new Date(programDetails.registrationStartDate)
        : null,
      registrationStartTime: parseTimeString(
        programDetails.registrationStartTime,
      ),
      registrationEndDate: programDetails.registrationEndDate
        ? new Date(programDetails.registrationEndDate)
        : null,
      registrationEndTime: parseTimeString(programDetails.registrationEndTime),
      noOfSessions: programDetails.noOfSession
        ? programDetails.noOfSession.toString()
        : "",
      location: programDetails.meta?.location || "",
      programFee: programDetails.programFee
        ? programDetails.programFee.toString()
        : "",
      isApprovalRequired: programDetails.isApprovalRequired,
      isResidenceRequired: programDetails.isResidenceRequired,
      isTravelInvolved: programDetails.isTravelInvolved,
      maxCapacity: programDetails.maxCapacity
        ? programDetails.maxCapacity.toString()
        : "",
      isSuccessAfterBasicRequired:
        programDetails.meta?.messageAfterBasic || false,
      isSuccessAfterTravelRequired:
        programDetails.meta?.messageAfterTravel || false,
      isSuccessAfterInvoiceRequired:
        programDetails.meta?.messageAfterInvoice || false,
    });
  };

  const handleSelectForm = (programName: string, formId: string) => {
    setSelectedForms((prev) => {
      const programForms = prev[programName] || [];
      if (programForms.includes(formId)) {
        return {
          ...prev,
          [programName]: programForms.filter((id) => id !== formId),
        };
      }
      return {
        ...prev,
        [programName]: [...programForms, formId],
      };
    });
  };

  const handleAddProgram = async (data: unknown[]) => {
    try {
      setLoading(true);
      const payload = {
        program: "PROGRAM001",
        programTypeId: programsList.find((pt) => pt.name === selectedCard)?.id,
        name: data.programName,
        startDate: format(new Date(data.startDate), "yyyy-MM-dd"),
        startTime: format(new Date(data.startTime), "hh:mm aa"),
        endDate: format(new Date(data.endDate), "yyyy-MM-dd"),
        endTime: format(new Date(data.endTime), "hh:mm aa"),
        noOfSession: Number(data.noOfSessions),
        registrationStartDate: format(
          new Date(data.registrationStartDate),
          "yyyy-MM-dd",
        ),
        registrationStartTime: format(
          new Date(data.registrationStartTime),
          "hh:mm aa",
        ),
        registrationEndDate: format(
          new Date(data.registrationEndDate),
          "yyyy-MM-dd",
        ),
        registrationEndTime: format(
          new Date(data.registrationEndTime),
          "hh:mm aa",
        ),
        meta: {
          location: data.location,
          "Basic Details": data.isSuccessAfterBasicRequired,
          Invoice: data.isSuccessAfterInvoiceRequired,
          "Travel Plan & Goodies": data.isSuccessAfterTravelRequired,
        },
        programFee: Number(data.programFee),
        isApprovalRequired: data.isApprovalRequired,
        isResidenceRequired: data.isResidenceRequired,
        isTravelInvolved: data.isTravelInvolved,
        maxCapacity: Number(data.maxCapacity),
        createdBy: userId,
        updatedBy: userId,
      };

      let response;

      if (isEditMode && editingProgramId) {
        response = await putCall(
          `${endPoints.program}/${editingProgramId}`,
          payload,
          PORTAL
        );
      } else {
        // Create new program
        response = await postCall(`${endPoints.program}`, payload, PORTAL);
      }

      if (response.status === 200 || response.status === 201) {
        // Close modal and reset form
        handleCloseAddProgramModal();
        resetAddProgramForm();
        // Refresh the programs list
        fetchProgramsList();
      }
    } catch (error) {
      console.error(
        isEditMode ? "Error updating program:" : "Error creating program:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async (programId: number) => {
    try {
      const response = await deleteCall(`${endPoints.program}/${programId}`, PORTAL);
      if (response.status === 200) {
        // Refresh programs list after successful deletion
        fetchProgramsList();
      }
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };
  // Add a function to reset the add program form
  const resetAddProgramForm = () => {
    setIsEditMode(false);
    setEditingProgramId(null);
    methods.reset({
      programName: "",
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null,
      registrationStartDate: null,
      registrationStartTime: null,
      registrationEndDate: null,
      registrationEndTime: null,
      noOfSessions: "",
      location: "",
      programFee: "",
      isApprovalRequired: undefined,
      isResidenceRequired: undefined,
      isTravelInvolved: undefined,
      maxCapacity: "",
      isSuccessAfterBasicRequired: undefined,
      isSuccessAfterTravelRequired: undefined,
      isSuccessAfterInvoiceRequired: undefined,
    });
  };
  const handleCloseAddProgramModal = () => {
    setIsAddProgramModalOpen(false);
    resetAddProgramForm();
  };

  const handleAddProgramClick = () => {
    setIsEditMode(false);
    setEditingProgramId(null);
    methods.reset();
    setIsAddProgramModalOpen(true);
  };

  const handleEditProgram = async (programId) => {
    try {
      setLoading(true);
      const response = await getCall(`${endPoints.program}/${programId}`, undefined, PORTAL);

      if (response.status === 200) {
        const programDetails = response.data.data;
        setIsEditMode(true);
        setEditingProgramId(programId);
        prefillProgramData(programDetails);
        setIsAddProgramModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageLayout}>
      <div className={styles.leftContainer}>
        <div className={styles.header}>
          <h2>Program Types</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            buttonClassName={styles.addButton}
          >
            Add Program type
          </Button>
        </div>

        <div className={styles.cardsContainer}>
          {programsList.map((programType) => (
            <Card
              key={programType.id}
              className={`${styles.programCard} ${
                selectedCard === programType.name ? styles.selected : ""
              }`}
              onClick={() => handleCardClick(programType.name)}
            >
              <Typography variant="h6">{programType.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {programType.programs?.length || 0} programs
              </Typography>
            </Card>
          ))}
        </div>
      </div>

      <div className={styles.rightContainer}>
        {selectedCard && (
          <>
            <div className={styles.rightHeader}>
              <Typography variant="h5">{selectedCard}</Typography>
              <Button
                onClick={handleAddProgramClick}
                buttonClassName={styles.addButton}
              >
                Add Program
              </Button>
            </div>
            <div className={styles.programsList}>
              {programsList
                .find((pt) => pt.name === selectedCard)
                ?.programs.map((program) => (
                  <Card key={program.id} className={styles.programCard}>
                    <div className={styles.programCardContent}>
                      <div className={styles.programHeader}>
                        <div>
                          <Typography variant="subtitle1">
                            {program.name}
                          </Typography>
                        </div>
                        <div className={styles.programActions}>
                          <Button
                            onClick={() =>
                              program.hasForm
                                ? handleEditForm(selectedCard, program.id)
                                : handleAddForm(
                                    selectedCard,
                                    program,
                                    programsList,
                                  )
                            }
                            buttonClassName={styles.formButton}
                          >
                            {program.hasForm ? "View/Edit Form" : "Add Form"}
                          </Button>
                          <IconButton
                            onClick={() => handleEditProgram(program.id)}
                            className={styles.editButton}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteProgram(program.id)}
                            className={styles.deleteButton}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </div>
                      </div>
                      <div className={styles.programDetails}>
                        <Typography variant="body2">
                          Sessions: {program.noOfSession}
                        </Typography>
                        <Typography variant="body2">
                          Start:{" "}
                          {new Date(program.startDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          Location: {program?.meta?.location}
                        </Typography>
                      </div>
                    </div>
                  </Card>
                ))}
              {!programsList.find((pt) => pt.name === selectedCard)?.programs
                .length && (
                <div className={styles.noPrograms}>
                  <Typography variant="body1">No programs yet</Typography>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth={false} // Remove maxWidth constraint
        PaperProps={{
          style: {
            width: "480px", // Fixed width like the analytics modal
            margin: "32px",
          },
        }}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <p>Add Program</p>
            <div className={styles.barhorizontallineFilter}></div>
            <img
              src={CrossIcon}
              alt="Close"
              className={styles.closeIcon}
              onClick={() => {
                resetForm();
                setIsModalOpen(false);
              }}
            />
          </div>

          <div className={styles.modalBody}>
            <div className={styles.filterOptions}>
              <div className={styles.optionsHeader}>
                <div className={styles.optionText}>Program Type</div>
                <div className={styles.barhorizontalline}></div>
              </div>
              <ProgramSelection
                options={programTypeOptions}
                selectedOption={programType}
                onChange={(value) => {
                  setProgramType(value);
                }}
              />
            </div>

            {programType === "Existing Program" && (
              <div className={styles.filterOptions}>
                <div className={styles.optionsHeader}>
                  <div className={styles.optionText}>Select Program</div>
                  <div className={styles.barhorizontalline}></div>
                </div>
                <FormProvider {...methods}>
                  <DropdownTextfield
                    name="existingProgram"
                    label=""
                    options={programsList.map((program) => ({
                      value: program.name,
                      label: program.name,
                    }))}
                    placeholder="Select program"
                    value={selectedProgram}
                    onValueChange={(value) =>
                      setSelectedProgram(value as string)
                    }
                  />
                </FormProvider>
              </div>
            )}

            {programType === "New Program" && (
              <div className={styles.questionsContainer}>
                {questions.map((question) => (
                  <div key={question.id} className={styles.filterOptions}>
                    <div className={styles.optionsHeader}>
                      <div className={styles.optionText}>{question.label}</div>
                      <div className={styles.barhorizontalline}></div>
                    </div>
                    {question.id === "frequency" ? (
                      <FormProvider {...methods}>
                        <DropdownTextfield
                          name="frequency"
                          label=""
                          options={[
                            { value: "Daily", label: "Daily" },
                            { value: "Weekly", label: "Weekly" },
                            { value: "Monthly", label: "Monthly" },
                            { value: "Quarterly", label: "Quarterly" },
                            { value: "Half-Yearly", label: "Half-Yearly" },
                            { value: "Yearly", label: "Yearly" },
                          ]}
                          placeholder="Select frequency"
                          value={formAnswers[question.id] || ""}
                          onValueChange={(value) =>
                            setFormAnswers({
                              ...formAnswers,
                              [question.id]: value,
                            })
                          }
                        />
                      </FormProvider>
                    ) : question.type === "text" ? (
                      <TextField
                        fullWidth
                        placeholder={question.placeholder}
                        value={formAnswers[question.id] || ""}
                        onChange={(e) =>
                          setFormAnswers({
                            ...formAnswers,
                            [question.id]: e.target.value,
                          })
                        }
                        className={styles.textField}
                      />
                    ) : question.options ? (
                      <ProgramSelection
                        options={[
                          { id: 0, name: "" },
                          ...question.options.map((opt, index) => ({
                            id: index + 1,
                            name: opt,
                          })),
                        ]}
                        selectedOption={formAnswers[question.id] || ""}
                        onChange={(value) =>
                          setFormAnswers({
                            ...formAnswers,
                            [question.id]: value,
                          })
                        }
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <span
              className={styles.cancelText}
              onClick={() => {
                resetForm();
                setIsModalOpen(false);
              }}
            >
              clear
            </span>
            <Button
              onClick={handleSubmit}
              buttonClassName={styles.applyButton}
              disable={programType === "new" && !formAnswers.programName}
            >
              apply
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={isAddProgramModalOpen}
        onClose={() => setIsAddProgramModalOpen(false)}
        maxWidth={false}
        PaperProps={{
          style: {
            width: "880px",
            margin: "32px",
          },
        }}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <p>{isEditMode ? "Edit Program" : "Add Program"}</p>
            <div className={styles.barhorizontallineFilter}></div>
            <img
              src={CrossIcon}
              alt="Close"
              className={styles.closeIcon}
              onClick={handleCloseAddProgramModal}
            />
          </div>

          <div className={styles.modalBody}>
            <form onSubmit={methods.handleSubmit(handleAddProgram)}>
              <div className={styles.formFieldsContainer}>
                <div>
                  <div className={styles.subHeadingDiv}>
                    <p className={styles.titleHeading}>Program Details</p>
                    <GrayLine />
                  </div>

                  <div className={styles.nameFormRow}>
                    <div
                      className={styles.labelInput}
                      data-testid="title-input"
                    >
                      <div
                        className={styles.titleHeadingDiv}
                        data-testid="sub-heading-div"
                      >
                        <p
                          className={styles.titleHeading}
                          data-testid="title-heading"
                        >
                          Program Name
                        </p>
                        <GrayLine data-testid="gray-line" />
                      </div>
                      <div
                        className={styles.fieldBlock}
                        data-testid="field-block"
                      >
                        <input
                          data-testid="title-input"
                          {...methods.register("programName")}
                          className={`${styles.inputFields} ${methods.formState.errors.programName ? styles.errorFields : ""}`}
                        />
                      </div>
                      {methods.formState.errors.programName && (
                        <i
                          className={styles.errorMsg}
                          data-testid="title-est-id"
                        >
                          {methods.formState.errors.programName.message}
                        </i>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className={styles.subHeadingDiv}>
                    <p className={styles.titleHeading}>Program Schedule</p>
                    <GrayLine />
                  </div>

                  <div className={styles.registrationsDiv}>
                    <div className={styles.formRow}>
                      <div className={styles.formRowContainer}>
                        <p className={styles.labelText}>Start Date & Time</p>
                        <div className={styles.registrationPeriod}>
                          <Controller
                            name="startDate"
                            control={methods.control}
                            render={({ field }) => (
                              <CustomDatePicker
                                value={field.value}
                                onChange={field.onChange}
                                borderRight={true}
                                errorExist={
                                  !!methods.formState.errors.startDate
                                }
                                errorMessage={
                                  methods.formState.errors.startDate?.message
                                }
                                dataTestId="start-date"
                              />
                            )}
                          />
                          <Controller
                            name="startTime"
                            control={methods.control}
                            render={({ field }) => (
                              <CustomTimePicker
                                value={field.value}
                                onChange={field.onChange}
                                errorExist={
                                  !!methods.formState.errors.startTime
                                }
                                errorMessage={
                                  methods.formState.errors.startTime?.message
                                }
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formRowContainer}>
                        <p className={styles.labelText}>End Date & Time</p>
                        <div className={styles.registrationPeriod}>
                          <Controller
                            name="endDate"
                            control={methods.control}
                            render={({ field }) => (
                              <CustomDatePicker
                                value={field.value}
                                onChange={field.onChange}
                                borderRight={true}
                                errorExist={!!methods.formState.errors.endDate}
                                errorMessage={
                                  methods.formState.errors.endDate?.message
                                }
                                dataTestId="end-date"
                              />
                            )}
                          />
                          <Controller
                            name="endTime"
                            control={methods.control}
                            render={({ field }) => (
                              <CustomTimePicker
                                value={field.value}
                                onChange={field.onChange}
                                errorExist={!!methods.formState.errors.endTime}
                                errorMessage={
                                  methods.formState.errors.endTime?.message
                                }
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formRowContainer}>
                        <p className={styles.labelText}>
                          Registration Start Date & Time
                        </p>
                        <div className={styles.registrationPeriod}>
                          <Controller
                            name="registrationStartDate"
                            control={methods.control}
                            render={({ field }) => (
                              <CustomDatePicker
                                value={field.value}
                                onChange={field.onChange}
                                borderRight={true}
                                dataTestId="reg-start-date"
                                errorExist={
                                  !!methods.formState.errors
                                    .registrationStartDate
                                }
                                errorMessage={
                                  methods.formState.errors.registrationStartDate
                                    ?.message
                                }
                              />
                            )}
                          />
                          <Controller
                            name="registrationStartTime"
                            control={methods.control}
                            render={({ field }) => (
                              <CustomTimePicker
                                value={field.value}
                                onChange={field.onChange}
                                errorExist={
                                  !!methods.formState.errors
                                    .registrationStartTime
                                }
                                errorMessage={
                                  methods.formState.errors.registrationStartTime
                                    ?.message
                                }
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formRowContainer}>
                        <p className={styles.labelText}>
                          Registration End Date & Time
                        </p>
                        <div className={styles.registrationPeriod}>
                          <Controller
                            name="registrationEndDate"
                            control={methods.control}
                            render={({ field }) => (
                              <CustomDatePicker
                                value={field.value}
                                onChange={field.onChange}
                                borderRight={true}
                                dataTestId="reg-end-date"
                                errorExist={
                                  !!methods.formState.errors.registrationEndDate
                                }
                                errorMessage={
                                  methods.formState.errors.registrationEndDate
                                    ?.message
                                }
                              />
                            )}
                          />
                          <Controller
                            name="registrationEndTime"
                            control={methods.control}
                            render={({ field }) => (
                              <CustomTimePicker
                                value={field.value}
                                onChange={field.onChange}
                                errorExist={
                                  !!methods.formState.errors.registrationEndTime
                                }
                                errorMessage={
                                  methods.formState.errors.registrationEndTime
                                    ?.message
                                }
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.formRowLimit}>
                      <div className={styles.limitDiv}>
                        <div
                          className={styles.limitEach}
                          data-testid="limit-each"
                        >
                          <div
                            className={styles.eachRange}
                            data-testid="each-range"
                          >
                            <p
                              className={styles.labelFont}
                              data-testid="label-font"
                            >
                              Number of Sessions
                            </p>
                            <div
                              className={`${styles.authenticationCard} ${methods.formState.errors.noOfSessions ? styles.errorFields : ""}`}
                              data-testid="authentication-card"
                            >
                              <input
                                type="number"
                                {...methods.register("noOfSessions")}
                                className={styles.enrolledText}
                                data-testid="video-limit-input"
                                placeholder="Enter number of sessions"
                              />
                            </div>
                          </div>
                          {methods.formState.errors.noOfSessions && (
                            <p
                              className={styles.errorMsg}
                              data-testid="error-msg-video-limit"
                            >
                              {methods.formState.errors.noOfSessions.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.formRowLimit}>
                      <div className={styles.limitDiv}>
                        <div
                          className={styles.limitEach}
                          data-testid="limit-each"
                        >
                          <div
                            className={styles.eachRange}
                            data-testid="each-range"
                          >
                            <p
                              className={styles.labelFont}
                              data-testid="label-font"
                            >
                              Location
                            </p>
                            <div
                              className={`${styles.authenticationCard} ${
                                methods.formState.errors.location
                                  ? styles.errorFields
                                  : ""
                              }`}
                              data-testid="authentication-card"
                            >
                              <input
                                type="text"
                                {...methods.register("location")}
                                className={styles.enrolledText}
                                data-testid="location-input"
                                placeholder="Enter program location"
                              />
                            </div>
                          </div>
                          {methods.formState.errors.location && (
                            <p
                              className={styles.errorMsg}
                              data-testid="error-msg-location"
                            >
                              {methods.formState.errors.location.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.formRowLimit}>
                      <div className={styles.limitDiv}>
                        <div
                          className={styles.limitEach}
                          data-testid="limit-each"
                        >
                          <div
                            className={styles.eachRange}
                            data-testid="each-range"
                          >
                            <p
                              className={styles.labelFont}
                              data-testid="label-font"
                            >
                              Program Fee
                            </p>
                            <div
                              className={`${styles.authenticationCard} ${
                                methods.formState.errors.programFee
                                  ? styles.errorFields
                                  : ""
                              }`}
                              data-testid="authentication-card"
                            >
                              <input
                                type="number"
                                {...methods.register("programFee")}
                                className={styles.enrolledText}
                                data-testid="program-fee-input"
                                placeholder="Enter program fee"
                              />
                            </div>
                          </div>
                          {methods.formState.errors.programFee && (
                            <p
                              className={styles.errorMsg}
                              data-testid="error-msg-program-fee"
                            >
                              {methods.formState.errors.programFee.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.formRowLimit}>
                      <div className={styles.limitDiv}>
                        <div
                          className={styles.limitEach}
                          data-testid="limit-each"
                        >
                          <div
                            className={styles.eachRange}
                            data-testid="each-range"
                          >
                            <p
                              className={styles.labelFont}
                              data-testid="label-font"
                            >
                              Maximum Capacity
                            </p>
                            <div
                              className={`${styles.authenticationCard} ${
                                methods.formState.errors.maxCapacity
                                  ? styles.errorFields
                                  : ""
                              }`}
                              data-testid="authentication-card"
                            >
                              <input
                                type="number"
                                {...methods.register("maxCapacity")}
                                className={styles.enrolledText}
                                data-testid="max-capacity-input"
                                placeholder="Enter maximum capacity"
                              />
                            </div>
                          </div>
                          {methods.formState.errors.maxCapacity && (
                            <p
                              className={styles.errorMsg}
                              data-testid="error-msg-max-capacity"
                            >
                              {methods.formState.errors.maxCapacity.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.formRowLimit}>
                      <div className={styles.limitDiv}>
                        <div className={styles.programOptions}>
                          <div className={styles.labelFont}>
                            Approval required
                          </div>
                          <div className={styles.optionItem}>
                            <ProgramSelection
                              options={[
                                { id: 0, name: "" },
                                { id: 1, name: "Yes" },
                                { id: 2, name: "No" },
                              ]}
                              selectedOption={
                                methods.watch("isApprovalRequired") ===
                                undefined
                                  ? ""
                                  : methods.watch("isApprovalRequired")
                                    ? "Yes"
                                    : "No"
                              }
                              onChange={(value) =>
                                methods.setValue(
                                  "isApprovalRequired",
                                  value === "" ? undefined : value === "Yes",
                                )
                              }
                              label="Is Approval Required?"
                            />
                            {methods.formState.errors.isApprovalRequired && (
                              <p
                                className={styles.errorMsg}
                                data-testid="error-msg-max-capacity"
                              >
                                {
                                  methods.formState.errors.isApprovalRequired
                                    .message
                                }
                              </p>
                            )}
                          </div>
                          <div className={styles.labelFont}>
                            Residence required
                          </div>
                          <div className={styles.optionItem}>
                            <ProgramSelection
                              options={[
                                { id: 0, name: "" },
                                { id: 1, name: "Yes" },
                                { id: 2, name: "No" },
                              ]}
                              selectedOption={
                                methods.watch("isResidenceRequired") ===
                                undefined
                                  ? ""
                                  : methods.watch("isResidenceRequired")
                                    ? "Yes"
                                    : "No"
                              }
                              onChange={(value) =>
                                methods.setValue(
                                  "isResidenceRequired",
                                  value === "" ? undefined : value === "Yes",
                                )
                              }
                              label="Is Residence Required?"
                            />
                            {methods.formState.errors.isResidenceRequired && (
                              <p
                                className={styles.errorMsg}
                                data-testid="error-msg-max-capacity"
                              >
                                {
                                  methods.formState.errors.isResidenceRequired
                                    .message
                                }
                              </p>
                            )}
                          </div>

                          <div className={styles.labelFont}>
                            Travel required
                          </div>

                          <div className={styles.optionItem}>
                            <ProgramSelection
                              options={[
                                { id: 0, name: "" },
                                { id: 1, name: "Yes" },
                                { id: 2, name: "No" },
                              ]}
                              selectedOption={
                                methods.watch("isTravelInvolved") === undefined
                                  ? ""
                                  : methods.watch("isTravelInvolved")
                                    ? "Yes"
                                    : "No"
                              }
                              onChange={(value) =>
                                methods.setValue(
                                  "isTravelInvolved",
                                  value === "" ? undefined : value === "Yes",
                                )
                              }
                              label="Is Travel Involved?"
                            />
                            {methods.formState.errors.isTravelInvolved && (
                              <p
                                className={styles.errorMsg}
                                data-testid="error-msg-travel-involved"
                              >
                                {
                                  methods.formState.errors.isTravelInvolved
                                    .message
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formRowLimit}>
                      <div className={styles.limitDiv}>
                        <div className={styles.programOptions}>
                          <div className={styles.labelFont}>
                            Success After Basic
                          </div>
                          <div className={styles.optionItem}>
                            <ProgramSelection
                              options={[
                                { id: 0, name: "" },
                                { id: 1, name: "Yes" },
                                { id: 2, name: "No" },
                              ]}
                              selectedOption={
                                methods.watch("isSuccessAfterBasicRequired") ===
                                undefined
                                  ? ""
                                  : methods.watch("isSuccessAfterBasicRequired")
                                    ? "Yes"
                                    : "No"
                              }
                              onChange={(value) =>
                                methods.setValue(
                                  "isSuccessAfterBasicRequired",
                                  value === "" ? undefined : value === "Yes",
                                )
                              }
                            />

                            {methods.formState.errors
                              .isSuccessAfterBasicRequired && (
                              <p
                                className={styles.errorMsg}
                                data-testid="error-msg-success-after-basic"
                              >
                                {
                                  methods.formState.errors
                                    .isSuccessAfterBasicRequired.message
                                }
                              </p>
                            )}
                          </div>

                          {methods.watch("isTravelInvolved") && (
                            <>
                              <div className={styles.labelFont}>
                                Success After Travel
                              </div>
                              <div className={styles.optionItem}>
                                <ProgramSelection
                                  options={[
                                    { id: 0, name: "" },
                                    { id: 1, name: "Yes" },
                                    { id: 2, name: "No" },
                                  ]}
                                  selectedOption={
                                    methods.watch(
                                      "isSuccessAfterTravelRequired",
                                    ) === undefined
                                      ? ""
                                      : methods.watch(
                                            "isSuccessAfterTravelRequired",
                                          )
                                        ? "Yes"
                                        : "No"
                                  }
                                  onChange={(value) =>
                                    methods.setValue(
                                      "isSuccessAfterTravelRequired",
                                      value === ""
                                        ? undefined
                                        : value === "Yes",
                                    )
                                  }
                                />

                                {methods.formState.errors
                                  .isSuccessAfterTravelRequired && (
                                  <p
                                    className={styles.errorMsg}
                                    data-testid="error-msg-success-after-travel"
                                  >
                                    {
                                      methods.formState.errors
                                        .isSuccessAfterTravelRequired.message
                                    }
                                  </p>
                                )}
                              </div>
                            </>
                          )}

                          {methods.watch("programFee") > 0 && (
                            <>
                              <div className={styles.labelFont}>
                                Success After Invoice
                              </div>
                              <div className={styles.optionItem}>
                                <ProgramSelection
                                  options={[
                                    { id: 0, name: "" },
                                    { id: 1, name: "Yes" },
                                    { id: 2, name: "No" },
                                  ]}
                                  selectedOption={
                                    methods.watch(
                                      "isSuccessAfterInvoiceRequired",
                                    ) === undefined
                                      ? ""
                                      : methods.watch(
                                            "isSuccessAfterInvoiceRequired",
                                          )
                                        ? "Yes"
                                        : "No"
                                  }
                                  onChange={(value) =>
                                    methods.setValue(
                                      "isSuccessAfterInvoiceRequired",
                                      value === ""
                                        ? undefined
                                        : value === "Yes",
                                    )
                                  }
                                />
                                {methods.formState.errors
                                  .isSuccessAfterInvoiceRequired && (
                                  <p
                                    className={styles.errorMsg}
                                    data-testid="error-msg-success-after-invoice"
                                  >
                                    {
                                      methods.formState.errors
                                        .isSuccessAfterInvoiceRequired.message
                                    }
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className={styles.modalFooter}>
            <span
              className={styles.cancelText}
              onClick={handleCloseAddProgramModal}
            >
              cancel
            </span>
            <Button
              onClick={methods.handleSubmit(handleAddProgram)}
              buttonClassName={styles.applyButton}
            >
              {isEditMode ? "Update Program" : "Create Program"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ProgramCards;
