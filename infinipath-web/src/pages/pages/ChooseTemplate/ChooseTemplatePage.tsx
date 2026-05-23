import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./index.module.scss";
import { CHOOSE_TEMPLATE_TEXT } from "../../../constants/textConstants";
import ArrowLeft from "../../../assets/images/arrow-left.svg";
import Loader from "../../../common/components/Loader";
import { fetchProgramTemplates } from "../../../utils/programUtils";

interface Template {
  id: number;
  name: string;
  programType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const ChooseTemplatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programType = searchParams.get("programType");
  const programTypeId = searchParams.get("programTypeId");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  const fetchTemplates = async () => {
    if (!programTypeId) return;
    
    setLoading(true);
    try {
      const templates = await fetchProgramTemplates(programTypeId);
      if (templates.length > 0) {
        setTemplates(templates);
      } else {
        console.error(CHOOSE_TEMPLATE_TEXT.ERRORS.NO_TEMPLATES_FOUND);
      }
    } catch (error) {
      console.error(CHOOSE_TEMPLATE_TEXT.ERRORS.FETCH_ERROR, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [programTypeId]);

  const handleTemplateClick = (templateId: number, templateName: string) => {
    navigate(`/admin/add-program?programTypeId=${programTypeId}&templateId=${templateId}&templateName=${encodeURIComponent(templateName)}&programTypeName=${encodeURIComponent(programType || '')}`, {
      state: { 
        programTypeId: programTypeId,
        templateId: templateId,
        templateName: templateName,
        programTypeName: programType
      },
    });
  };

  const handleBackClick = () => {
    navigate("/admin/choose-program");
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
                    <img src={ArrowLeft} alt={CHOOSE_TEMPLATE_TEXT.MESSAGES.BACK_ALT} onClick={handleBackClick} />
                    {CHOOSE_TEMPLATE_TEXT.MESSAGES.PAGE_TITLE}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className={styles.subtitle}>
                {CHOOSE_TEMPLATE_TEXT.MESSAGES.SELECT_TEMPLATE_PREFIX}{programType}
              </p>
            </div>

            <div className={styles.templateGrid}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateClick(template.id, template.name)}
                  className={styles.templateCard}
                >
                  <div className={styles.templateCardContent}>
                    <h3 className={styles.templateTitle}>{template.name}</h3>
                    <div className={styles.templateInfo}>
                      <span className={styles.templateStatus}>
                        {template.status}
                      </span>
                      <span className={styles.templateDate}>
                        {CHOOSE_TEMPLATE_TEXT.MESSAGES.UPDATED_PREFIX}{new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {templates.length === 0 && !loading && (
                <div className={styles.noTemplates}>
                  {CHOOSE_TEMPLATE_TEXT.MESSAGES.NO_TEMPLATES_PREFIX}{programType}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseTemplatePage;
