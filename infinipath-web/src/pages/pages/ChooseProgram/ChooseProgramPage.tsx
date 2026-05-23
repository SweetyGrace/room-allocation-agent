import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";
import { endPoints, PORTAL } from "../../../constants/urlConstants";
import { getCall } from "../../../services/apiService";
import ArrowLeft from "../../../assets/images/arrow-left.svg";
import Loader from "../../../common/components/Loader";
import { fetchProgramTemplates } from "../../../utils/programUtils";
import { PROGRAM_TYPE } from "../../../constants/textConstants";

const ChooseProgramPage = ({ onBack }: { onBack: any }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [programTypesData, setProgramTypesData] = useState<any[]>([]);
  const fetchProgramsList = () => {
    setLoading(true);

    getCall(`${endPoints.programType}?limit=100&offset=0&searchText=`, undefined, PORTAL)
      .then((response) => {

        if (response?.data?.data) {
          setProgramTypesData(response.data.data.data);

          // Extract all programs from the nested structure
        } else {
          console.error("No data found in response");
        }
      })
      .catch((error) => {
        console.error("Error fetching programs:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProgramsList();
  }, []);

  // Function to get CSS class based on program type
  const getProgramClass = (programTypeName: string) => {
    const name = programTypeName.toLowerCase();
    if (name.includes("hdb") || name.includes("msd")) {
      return "hdb";
    } else if (name.includes("entertainment") || name.includes("entrainment")) {
      return "entrainment";
    } else if (name.includes("tat")) {
      return "tat";
    }
    return "hdb"; // Default class
  };

  const handleProgramClick = async (
    programTypeId: string,
    programTypeName: string,
  ) => {
    setLoading(true);
    
    try {
      // Fetch templates for this program type
      const templates = await fetchProgramTemplates(programTypeId);

      // If there's exactly one template, navigate directly to create program page
      if (templates.length === 1) {
        const template = templates[0];
        navigate(
          `/admin/add-program?programTypeId=${programTypeId}&templateId=${template.id}&templateName=${encodeURIComponent(template.name)}&programTypeName=${encodeURIComponent(programTypeName)}`,
          {
            state: {
              programTypeId: programTypeId,
              templateId: template.id,
              templateName: template.name,
              programTypeName: programTypeName
            },
          }
        );
      } else {
        // Multiple templates or no templates - show the choose template page
        navigate(
          `/admin/choose-template?programType=${encodeURIComponent(programTypeName)}&programTypeId=${programTypeId}`
        );
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      // On error, fall back to the choose template page
      navigate(
        `/admin/choose-template?programType=${encodeURIComponent(programTypeName)}&programTypeId=${programTypeId}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/admin/action-cards");
    }
  };

  return (
    <div className={styles.container}>
      {loading && <Loader type="large" />}
      <div className={styles.mainContent}>
        <div className={styles.mainBody}>
          <div className={styles.contentWrapper}>
            <div className={styles.titleSection}>
              <div className={styles.titleWithBack}>
                <div>
                  <div className={styles.mainTitle}>
                    <img src={ArrowLeft} alt="Back" onClick={handleBackClick} />
                    Create program
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className={styles.subtitle}>
                Create a program from existing templates
              </p>
            </div>

            <div className={styles.programGrid}>
              {programTypesData.map((programType) => {
                const programClass = getProgramClass(programType.name);
                const programImage = programType.bannerUrl;
                if(programType?.key === PROGRAM_TYPE.INFINIPATH_KEY)
                {
                  return null; // Skip rendering Infinipath program type as it is not required as per the current requirements
                }
                return (
                  <div
                    key={programType.id}
                    onClick={() =>
                      handleProgramClick(programType.id, programType.name)
                    }
                    className={styles.programCard}
                  >
                    <div
                      className={`${styles.programCardImage} ${styles[programClass]}`}
                    >
                      <div className={styles.bannerContainer}>
                        <img src={programImage} alt={programType.name} />
                      </div>
                    </div>
                    <div className={styles.programCardContent}>
                      <h3 className={styles.programTitle}>
                        {programType.name}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseProgramPage;
