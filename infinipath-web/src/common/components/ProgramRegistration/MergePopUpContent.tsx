import React from "react";
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

interface MergePopUpContentProps {
  isOpen: boolean;
  onClose: () => void;
  onMerge: (selectedQuestions: number[], mergeTitle: string) => void;
  availableQuestions: Question[];
  formQuestions: Question[];
  selectedQuestions: number[];
  setSelectedQuestions: React.Dispatch<React.SetStateAction<number[]>>;
  mergeTitle: string;
  setMergeTitle: React.Dispatch<React.SetStateAction<string>>;
  sections: Section[];
  selectedSections: string[];
  toggleSectionSelection: (sectionId: string) => void;
}

const MergePopUpContent: React.FC<MergePopUpContentProps> = ({
  isOpen,
  onClose,
  onMerge,
  availableQuestions,
  formQuestions,
  selectedQuestions,
  setSelectedQuestions,
  mergeTitle,
  setMergeTitle,
  sections,
  selectedSections,
  toggleSectionSelection,
}) => {
  let numberOfUntitledSections = 0;
  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions((prevIds) =>
      prevIds.includes(questionId)
        ? prevIds.filter((id) => id !== questionId)
        : [...prevIds, questionId],
    );
  };

  const handleMerge = () => {
    onMerge(selectedQuestions, mergeTitle);
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
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Merge Sections
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
            label="Section Title (Optional)"
            value={mergeTitle}
            onChange={(e) => setMergeTitle(e.target.value)}
            variant="outlined"
          />
        </Box>

        {sections.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Select Sections to Merge:
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              gutterBottom
              style={{ padding: "2px" }}
            >
              Click on a section to include it in the merge. Selected sections
              will be highlighted.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {sections.map((section) => {
                const isSelected = selectedSections.includes(section.id);
                numberOfUntitledSections += section.title ? 0 : 1;
                return (
                  <Chip
                    key={section.id}
                    label={section.title || `Untitled Section - ${numberOfUntitledSections}`}
                    color={isSelected ? "primary" : "default"}
                    variant={isSelected ? "filled" : "outlined"}
                    onClick={() => toggleSectionSelection(section.id)}
                    clickable
                  />
                );
              })}
            </Box>
          </>
        )}
        {
          sections.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No sections available to merge.
            </Typography>
          )
        }
        {/* Selected Questions Section */}
        {selectedQuestions.length > 0 && (
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
              These questions will be part of the merged section.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {selectedQuestions.map((questionId) => {
                const question = [...availableQuestions, ...formQuestions].find(
                  (q) => q.id === questionId,
                );
                return (
                  question && (
                    <Chip
                      title={question.text}
                      key={question.id}
                      label={question.text}
                      color="primary"
                      variant="filled"
                      onClick={() => toggleQuestionSelection(question.id)}
                      clickable
                    />
                  )
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
              These questions are not yet part of any section.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {availableQuestions.map((question) => {
                const isSelected = selectedQuestions.includes(question.id);
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
              These questions are already part of the form but can be added to
              the merged section.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {formQuestions.map((question) => {
                const isSelected = selectedQuestions.includes(question.id);
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
        <Button onClick={handleMerge} variant="contained" color="primary">
          Merge
        </Button>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MergePopUpContent;
