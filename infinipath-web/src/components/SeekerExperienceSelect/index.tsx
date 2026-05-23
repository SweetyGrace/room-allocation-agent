
import * as React from "react";
import styles from "./index.module.scss";
import MultiSelect from "../../pages/SearchProp";
import { getCall } from "../../services/apiService";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import { seekerExperiencesText } from "../../constants/textConstants";

interface SeekerExperienceSelectProps {
  selectedTags: any[];
  setSelectedTags: (tags: any[]) => void;
  onInteraction?: () => void;
  placeholder?: string;
  labelText?: string;
}

const SeekerExperienceSelect: React.FC<SeekerExperienceSelectProps> = ({
  selectedTags,
  setSelectedTags,
  onInteraction,
  placeholder = seekerExperiencesText.PLACEHOLDER_TEXT,
  labelText,
}) => {
  const [tagOptions, setTagOptions] = React.useState<
    { label: string; value: string }[]
  >([]);

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
          value: item.id.toString(),
        })),
      );
    });
  }, []);

  return (
    <div className={styles.seekerExperienceContainer}>
      {labelText && (
        <span className={styles.label} style={{ marginTop: 16, marginBottom: 8 }}>
          {labelText}
        </span>
      )}
      {selectedTags.length > 0 && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          {selectedTags.map((tag) => (
            <span key={tag.value} className={styles.chip}>
              {tag.label}
            </span>
          ))}
        </div>
      )}
      <div style={{ marginTop: "8px" }}>
        <MultiSelect
          options={tagOptions}
          selected={selectedTags}
          setSelected={(newTags) => {
            setSelectedTags(newTags);
            if (onInteraction) onInteraction();
          }}
          placeholder={placeholder}
          closeOnClickOutside={true}
        />
      </div>
    </div>
  );
};

export default SeekerExperienceSelect;

