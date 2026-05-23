import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Question, Section } from "./types";

interface SectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: { title: string; questions: Question[] }) => void;
  availableQuestions: Question[];
  initialSection?: Section | null;
  formQuestions: Question[];
  setAvailableQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setFormQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  editingSection: Section | null;
  setEditingSection: React.Dispatch<React.SetStateAction<Section | null>>;
}

const SectionPopup: React.FC<SectionPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  availableQuestions,
  initialSection = null,
  formQuestions,
  setAvailableQuestions,
  setFormQuestions,
  editingSection,
  setEditingSection,
}) => {
  const [title, setTitle] = useState<string>("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [combinedQuestions, setCombinedQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [selectedSections, setSelectedSections] = useState<Section[]>([]);

  // Navigation state (from second file)
  const [currentSection, setCurrentSection] = useState<Section | null>(
    initialSection,
  );
  const [breadcrumbs, setBreadcrumbs] = useState<Section[]>(
    initialSection ? [initialSection] : [],
  );

  let numberOfUntitledSections = 0;
  let sectionDisplayUntitled = 0;

  // Pre-populate on edit and combine questions
  useEffect(() => {
    if (initialSection) {
      setCurrentSection(initialSection);
      loadSectionData(initialSection);
    } else {
      setTitle("");
      setCurrentSection(null);
      setBreadcrumbs([]);
      const uniqueQuestions = [...availableQuestions, ...formQuestions];
      setCombinedQuestions(uniqueQuestions);
      setSelectedQuestionIds([]);
      setSelectedSections([]);
      setSelectedQuestions([]);
    }
  }, [initialSection, availableQuestions]);

  // Function to load section data when drilling down or navigating breadcrumbs
  const loadSectionData = (section: Section) => {
    setTitle(section.title ?? "");
    setSelectedQuestionIds(section.questions.map((q) => q.id));

    // Combine available questions with the section's questions
    const sectionQuestions = section.questions;
    const uniqueQuestions = [
      ...sectionQuestions.filter(
        (sectionQuestion) =>
          !availableQuestions.some((q) => q.id === sectionQuestion.id),
      ),
      ...availableQuestions,
      ...formQuestions.filter(
        (formQuestion) =>
          !sectionQuestions.some((q) => q.id === formQuestion.id),
      ),
    ];
    setSelectedSections(section.subSections || []);
    setSelectedQuestions(sectionQuestions);
    setCombinedQuestions(uniqueQuestions);
  };

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestionIds((prevIds) =>
      prevIds.includes(questionId)
        ? prevIds.filter((id) => id !== questionId)
        : [...prevIds, questionId],
    );
  };

  // Drill down navigation (from second file)
  const handleDrillDown = (section: Section) => {
    setBreadcrumbs((prev) => [...prev, section]);
    setCurrentSection(section);
    loadSectionData(section);
    setEditingSection(section);
  };

  // Breadcrumb navigation (from second file)
  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    const selectedSection = newBreadcrumbs[newBreadcrumbs.length - 1];
    setCurrentSection(selectedSection);
    loadSectionData(selectedSection);
  };

  const handleSave = () => {
    if (editingSection) {
      if (editingSection.id !== currentSection?.id && currentSection) {
        setEditingSection(currentSection);
      }
    }

    const selectedQuestions = combinedQuestions.filter((q) =>
      selectedQuestionIds.includes(q.id),
    );

    if (selectedQuestions.length === 0 && !currentSection) {
      alert("Please select at least one question.");
      return;
    }
    // Helper function to recursively update the section tree
    const updateSectionTree = (sections: Section[]): Section[] => {
      return sections.map((section) => {
        if (currentSection && section.id === currentSection.id) {
          // Update the current section or subsection
          return {
            ...section,
            title,
            questions: selectedQuestions,
            subSections: section.subSections || [],
          };
        }
        if (section.subSections && section.subSections.length > 0) {
          // Recursively update subsections
          return {
            ...section,
            subSections: updateSectionTree(section.subSections),
          };
        }
        return section;
      });
    };

    // Update the main section tree
    setFormQuestions((prevFormQuestions) =>
      prevFormQuestions.filter(
        (q) => !selectedQuestions.some((selected) => selected.id === q.id),
      ),
    );
    setAvailableQuestions((prevAvailableQuestions) =>
      prevAvailableQuestions.filter(
        (q) => !selectedQuestions.some((selected) => selected.id === q.id),
      ),
    );

    if (currentSection) {
      const unselectedQuestions = currentSection.questions.filter(
        (q) => !selectedQuestionIds.includes(q.id),
      );

      setAvailableQuestions((prevAvailableQuestions) => [
        ...prevAvailableQuestions,
        ...unselectedQuestions,
      ]);
    }

    // Save the updated section tree
    onSave({ title, questions: selectedQuestions });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxHeight: "80vh",
        },
      }}
    >
      {combinedQuestions.length > 0 && (
        <>
          <DialogTitle
            sx={{ m: 0, p: 2, display: "flex", flexDirection: "column" }}
          >
            {/* Display breadcrumb navigation */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                mb: 2,
                sx: { alignItems: "center", flexWrap: "wrap" },
              }}
            >
              {/* Initial Section */}
              {initialSection && (
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    color: "gray",
                    mb: 1,
                    textAlign: "center",
                  }}
                >
                  {initialSection ? "Editing Section" : "Creating New Section"}
                </Typography>
              )}

              {/* Breadcrumb Navigation */}
              {initialSection && (<Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 1,
                  backgroundColor: "background.paper",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                {breadcrumbs.length > 0 ? (
                  breadcrumbs.map((breadcrumb, index) => (
                    <Typography
                      key={breadcrumb.id}
                      variant="body2"
                      sx={{
                        cursor: "pointer",
                        color:
                          index === breadcrumbs.length - 1
                            ? "text.primary"
                            : "primary.main",
                        textDecoration:
                          index === breadcrumbs.length - 1
                            ? "none"
                            : "underline",
                        fontWeight:
                          index === breadcrumbs.length - 1 ? "bold" : "normal",
                      }}
                      onClick={() => handleBreadcrumbClick(index)}
                    >
                      {breadcrumb.title || "Untitled Section"}
                      {index < breadcrumbs.length - 1 && (
                        <span
                          style={{ margin: "0 4px", color: "text.secondary" }}
                        >
                          /
                        </span>
                      )}
                    </Typography>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontStyle: "italic",
                    }}
                  >
                    No breadcrumbs available
                  </Typography>
                )}
              </Box>)}
            </Box>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: "absolute",
                right: 12,
                top: 12,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Section Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
              />
            </Box>

            {/* Subsections (from second file) */}
            {currentSection?.subSections &&
              currentSection?.subSections?.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Subsections:
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                    style={{ padding: "2px" }}
                  >
                    Click on a subsection to drill down into it.
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}
                  >
                  {currentSection.subSections.map((subSection) => {  
                    if (subSection.title?.trim() === "") {
                      numberOfUntitledSections += 1;
                    }
                    return (
                      <Chip
                        key={subSection.id}
                        label={subSection.title || `Untitled Subsection - ${numberOfUntitledSections}`}
                        color="default"
                        variant="outlined"
                        onClick={() => handleDrillDown(subSection)}
                        clickable
                      />
                    );
                  })}
                  </Box>
                </>
              )}

            {/* selected section(s) of this section*/}
            {selectedSections && selectedSections.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Section(s):
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  style={{ padding: "2px" }}
                >
                  These sections are part of the section.
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                  {selectedSections.map((section, index) => {
                    if (section.title?.trim() === "") {
                      sectionDisplayUntitled += 1;
                    }
                    const isSelected = selectedSections.some(
                      (s) => s.id === section.id,
                    );
                    return (
                      <Chip
                        title={section.title}
                        key={section.id}
                        label={section.title || `Untitled Section - ${sectionDisplayUntitled}`}
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        onClick={() => {
                        }}
                        clickable
                      />
                    );
                  })}
                </Box>
              </>
            )}
            {/* selected question(s) of this section */}
            {selectedQuestions && selectedQuestions.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Questions:
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  style={{ padding: "2px" }}
                >
                  These questions are part of the section.
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                  {selectedQuestions.map((question) => {
                    const isSelected = selectedQuestionIds.includes(
                      question.id,
                    );
                    return (
                      <Chip
                        title={question.text}
                        key={question.id}
                        label={question.text}
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        onClick={() => toggleQuestionSelection(question.id)}
                        clickable
                      />
                    );
                  })}
                </Box>
              </>
            )}

            {/* Unused Questions Section */}
            {availableQuestions.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Unused Questions:
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  style={{ padding: "2px" }}
                >
                  These questions are not yet part of the form.
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                  {availableQuestions.map((question) => {
                    const isSelected = selectedQuestionIds.includes(
                      question.id,
                    );
                    return (
                      <Chip
                        title={question.text}
                        key={question.id}
                        label={question.text}
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        onClick={() => toggleQuestionSelection(question.id)}
                        clickable
                      />
                    );
                  })}
                </Box>
              </>
            )}

            {/* Form Questions Section */}
            {formQuestions.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Form Questions:
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  style={{ padding: "2px" }}
                >
                  These questions are already part of the form but can be added
                  to this section but will be removed from the seperate
                  question.
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formQuestions.map((question) => {
                    const isSelected = selectedQuestionIds.includes(
                      question.id,
                    );
                    return (
                      <Chip
                        title={question.text}
                        key={question.id}
                        label={question.text}
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        onClick={() => toggleQuestionSelection(question.id)}
                        clickable
                      />
                    );
                  })}
                </Box>
              </>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px",
              width: "100%",
            }}
          >
            <Button onClick={handleSave} variant="contained" color="primary">
              Save
            </Button>
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
          </DialogActions>
        </>
      )}

      {combinedQuestions.length === 0 && (
        <DialogContent dividers>
          <Typography variant="body1" color="textSecondary">
            No questions available to create a section.
          </Typography>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SectionPopup;
