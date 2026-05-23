import React from "react";
import { Typography, Button, Card, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import styles from "./index.module.scss";
import AddNewProgram from "../AddProgram";

type Program = {
  id: string;
  name: string;
  noOfSession: number;
  startDate: string;
  hasForm?: boolean;
  meta?: {
    location?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

type ProgramsListType = {
  programs: Program[];
  [key: string]: any;
};

type ProgramListProps = {
  programsList: ProgramsListType;
  onBackToProgramTypes?: () => void;
  onAddProgram?: () => void;
  onEditForm?: (cardName: string, programId: string) => void;
  onAddForm?: (
    cardName: string,
    program: Program,
    programsList: ProgramsListType,
  ) => void;
  onEditProgram?: (programId: string) => void;
  onDeleteProgram?: (programId: string) => void;
  onCreateProgram?: (programsList: ProgramsListType) => void;
};

const ProgramList: React.FC<ProgramListProps> = ({
  programsList,
  //   selectedCard,
  onBackToProgramTypes,
  onEditProgram,
  onDeleteProgram,
  onCreateProgram, // Add this new prop
}) => {
  const [addProgram, setAddProgram] = React.useState(false);

  const handleAddProgramClick = () => {
    // Instead of setting local state, call the parent handler
    if (onCreateProgram) {
      onCreateProgram(programsList); // Pass the current program type data
    } else {
      // Fallback to old behavior if onCreateProgram is not provided
      setAddProgram(true);
    }
  };

  const handleEditProgram = (programId:string) => {
    onEditProgram?.(programId);
  };

  const handleDeleteProgram = (programId:string) => {
    onDeleteProgram?.(programId);
  };


  // Get the programs from the selected program type
  const programs = programsList?.programs || [];

  return (
    <div className={styles.rightContainer}>
      <div className={styles.rightHeader}>
        {/* Back button */}
        {onBackToProgramTypes && (
          <IconButton
            onClick={onBackToProgramTypes}
            className={styles.backButton}
            style={{ marginRight: "16px" }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        {/* Header with selected card name */}
       

        <Button onClick={handleAddProgramClick} className={styles.addButton}>
          Add Program
        </Button>
      </div>

      <div className={styles.programsList}>
        {programs.length > 0 ? (
          programs.map((program) => (
            <Card key={program.id} className={styles.programCard}>
              <div className={styles.programCardContent}>
                <div className={styles.programHeader}>
                  <div>
                    <Typography variant="subtitle1">{program.name}</Typography>
                  </div>
                  <div className={styles.programActions}>
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
                    Start: {new Date(program.startDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Location: {program?.meta?.location}
                  </Typography>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className={styles.noPrograms}>
            <Typography variant="body1">
              {/* No programs yet for {selectedCard} */}
            </Typography>
          </div>
        )}
      </div>

      {/* Add Program Modal/Component - Keep this as fallback */}
      {addProgram && (
        <AddNewProgram
          programData={programsList as any}
          onClose={() => setAddProgram(false)}
          onSuccess={() => setAddProgram(false)}
        />
      )}
    </div>
  );
};

export default ProgramList;
