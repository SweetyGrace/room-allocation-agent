import * as React from "react";
import SideDrawerOverlay from "../SideOverLay";
import styles from "./index.module.scss";
import { Button } from "../../common/components/Button";
import { Button as MuiButton } from "../components/Common/Button";
import MultiSelect from "../../pages/SearchProp";
import { getCall, postCall, putCall } from "../../services/apiService";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import { getItemInLocalStorage } from "../../services/localStorage";
import {
  BUTTONLABELS,
  seekerExperiencesText,
} from "../../constants/textConstants";

interface SeekerTagsProps {
  open: boolean;
  onClose: () => void;
  onSave: (selectedTags: any[]) => void;
  initialTags?: any[];
  seekerData?: any;
  onRefresh?: () => void;
}

const SeekerTags: React.FC<SeekerTagsProps> = ({
  open,
  onClose,
  onSave,
  initialTags = [],
  seekerData,
  onRefresh,
}) => {
  // Convert initialTags to MultiSelect format if needed
  const initialSelected = React.useMemo(() => {
    if (!initialTags || initialTags.length === 0) return [];
    return initialTags.map((tag: any) => {
      if (tag.label && tag.value) {
        return tag;
      }
      if (tag.lookupData) {
        return {
          label: tag.lookupData.lookupLabel,
          value: tag.lookupData.id,
        };
      }
      return {
        label: tag.title,
        value:
          tag.id?.toString() || tag.title?.toLowerCase().replace(/\s+/g, "_"),
      };
    });
  }, [initialTags]);

  const [selectedTags, setSelectedTags] =
    React.useState<any[]>(initialSelected);
  const [tagOptions, setTagOptions] = React.useState<
    { label: string; value: number }[]
  >([]);
  const [showMultiSelect, setShowMultiSelect] = React.useState(false);

  React.useEffect(() => {
    setSelectedTags(initialSelected);
    setShowMultiSelect(initialSelected.length === 0);
  }, [initialSelected]);

  React.useEffect(() => {
    // Fetch SEEKER_PROGRAM_EXPERIENCE from lookupDataCategory API
    getCall(
      endPoints.lookupDataCategory("SEEKER_PROGRAM_EXPERIENCE"),
      undefined,
      PORTAL,
    ).then((response: any) => {
      const experienceArr = response?.data?.data?.data || [];
      setTagOptions(
        experienceArr.map((item: any) => ({
          label: item.label,
          value: item.id,
        })),
      );
    });
  }, []);

  const handleSave = async () => {
    const localUserId = getItemInLocalStorage("seekerDetails")?.id;
    const updatedBy = localUserId ? Number(localUserId) : undefined;
    const putUserId = seekerData?.userId;

    const lookupDataIds = selectedTags.map((tag: any) => Number(tag.value));

    try {
      if (initialTags && initialTags.length > 0) {
        // PUT call for update
        const payload = {
          lookupDataIds,
          updatedBy,
          registrationId: seekerData?.id,
        };
        await putCall(endPoints.userProgramExperience(putUserId), payload, PORTAL);
      } else {
        // POST call for create
        const payload = {
          userId: seekerData?.userId,
          registrationId: seekerData?.id,
          lookupDataIds,
          createdBy: updatedBy,
          updatedBy,
        };
        await postCall(endPoints.userExperience, payload, PORTAL);
      }
      onSave(selectedTags);
      if (onRefresh) {
        onRefresh();
      }
      onClose();
    } catch (err) {
      // handle error if needed
      console.error(seekerExperiencesText.ERROR_MESSAGE, err);
    }
  };

  const handleCancel = () => {
    setSelectedTags(initialSelected);
    onClose();
  };
  return (
    <SideDrawerOverlay
      open={open}
      onClose={handleCancel}
      headerText={
        initialTags && initialTags.length > 0
          ? seekerExperiencesText.UPDATE_HEADER_TEXT
          : seekerExperiencesText.HEADER_TEXT
      }
      grayLine={true}
      footer={
        <>
          <MuiButton
            variant="outline"
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            {BUTTONLABELS.CANCEL}
          </MuiButton>
          <Button
            buttonTextClassName={styles.saveButtonText}
            buttonClassName={styles.saveButton}
            onClick={handleSave}
            disable={selectedTags.length === 0}
          >
            {" "}
            {BUTTONLABELS.SAVE}
          </Button>
        </>
      }
    >
      <div className={styles.tagsForm}>
        <div
          className={styles.selectedLabels}
          style={{
            marginBottom: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <p className={styles.tagsLabel}>
            {selectedTags.length === 0
              ? `Add experiences to ${seekerData?.seekerName}`
              : `Experiences of ${seekerData?.seekerName}`}
          </p>
          {/* Show chips always when dropdown is open or tags are selected */}
          {selectedTags.length > 0 && (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              {selectedTags.map((tag) => (
                <span key={tag.value} className={styles.chip}>
                  {tag.label}
                </span>
              ))}
            </div>
          )}
          {/* Add More button logic */}
          {initialTags &&
            initialTags.length > 0 &&
            selectedTags.length > 0 &&
            !showMultiSelect && (
              <button
                type="button"
                className={styles.addMoreButton}
                onClick={() => setShowMultiSelect(true)}
              >
              {seekerExperiencesText.ADD_MORE}
              </button>
            )}
        </div>
        <div className={styles.multiSelectContainer}>
          {showMultiSelect && (
            <MultiSelect
              options={tagOptions}
              selected={selectedTags}
              setSelected={setSelectedTags}
              placeholder="Select tags"
              closeOnClickOutside={true}
            />
          )}
        </div>
      </div>
    </SideDrawerOverlay>
  );
};

export default SeekerTags;
