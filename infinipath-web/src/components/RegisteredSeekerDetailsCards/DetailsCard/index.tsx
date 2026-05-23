import React from "react";
import styles from "./index.module.scss";
import { colorizeMahatriaInfinitheism } from "../../../common/components/ColorizeMahatriaInfinitheism";
import ImagePreview from "../../../common/components/ImagePreview";
import { getCall } from "../../../services/apiService";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ProgramQuestionMap } from "../types";
import { set } from "date-fns";
import { formatDateTimeUniversal, formatDateWithoutTime } from "../../../utils/commonFunctions";
import { pdf_viewer } from "../../../constants/textConstants";

interface DetailsCardProps {
  data: Array<{
    label: string;
    value: any;
    config?: any;
    type?: "text" | "date" | "image" | "datetime" | "video" | "apiCall" | "draganddrop"|"yearRange"|"multiQuestion";
    bindingKey?: string;
  }>;
  singleColumn?: boolean; // New prop for single column layout
  questionMapList: ProgramQuestionMap[];
}

const DetailsCard: React.FC<DetailsCardProps & { heading?: string }> = ({
  data,
  singleColumn,
  questionMapList,
  heading
}) => {
  const [open, setOpen] = React.useState(false);
  const [previewImageUrl, setPreviewImageUrl] = React.useState({ image: "", altText: "" });
   const [pdfOpen, setPdfOpen] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState("");
  
  const renderAnswer = (answer: string) => {
  const trimmed = answer.trim();
  
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed).map(([key, value], idx) => (
          <div key={key} className={styles.aspectItem}>
            <span className={styles.aspectValue}>
              {`${idx + 1}. ${colorizeMahatriaInfinitheism(typeof value === 'object' ? JSON.stringify(value) : String(value))}`}
            </span>
          </div>
        ));
      }
    } catch {}
  }
  
  return colorizeMahatriaInfinitheism(answer);
};

  const formatIndianCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return `${numAmount.toLocaleString("en-IN")}`;
  };
  
  const showLabelIndex =
    heading && heading.trim().toLowerCase() === "questions and answers";

  return (
    <div className={styles.detailsCard}>
      <div
        className={
          styles.cardContent + (singleColumn ? ` ${styles.singleColumn}` : "")
        }
      >
        {data.map((item, index) => {
          // Exclude dependency check for "Upload video" label or heading "Questions and Answers"
          // Also exclude if any dependsOn has questionBindingKey === "no_of_hdbs"
          const skipDependencyCheck =
            (heading && heading.trim().toLowerCase() === "questions and answers") &&
            (
              item.config &&
              Array.isArray(item.config.dependsOn) &&
              item.config.dependsOn.some(dep => dep.questionBindingKey === "no_of_hdbs")
            );

          if (
            !skipDependencyCheck &&
            item.config &&
            Array.isArray(item.config.dependsOn) &&
            item.config.dependsOn.length > 0
          ) {
            const depsSatisfied = item.config.dependsOn.some(dep => {
              const dependedQuestion = data.find(q => q?.id == dep.questionId);
              if (!dependedQuestion) {
                return false;
              }      
              return dependedQuestion.value == dep.value;
            });
            if (!depsSatisfied) {
              return null;
            }
          }
          if(item.value === "") return false ;
        
          if(item.type==="draganddrop"){
            try {
              const pref = JSON.parse(decodeURIComponent(item.value));
              const sortedPref = Array.isArray(pref)
                ? [...pref].sort((a, b) => a.priorityOrder - b.priorityOrder)
                : pref;
               item.value = sortedPref
                .map((session: any) =>
                  session.sessionName &&
                  session.sessionName !== null &&
                  session.sessionName !== ""
                    ? `${session.sessionName}`
                    : `${session.sessionId}`,
                )
                .join(", ");
              if(sortedPref.length === 0) {
                item.value = "Any HDB/MSD";
              }
              // eslint-disable-next-line no-console
            } catch (error) {
              console.error("Error parsing drag and drop value:", error);
            }
          }
          return (
            <div
              key={index}
              className={
                styles.detailItem +
                (singleColumn ? ` ${styles.singleColumnItem}` : "")
              }
            >
              <span className={styles.label}>
                {showLabelIndex ? (
                  <>
                    {item.bindingKey !== 'videoUrl' ? <span className={styles.index}>{data[0].bindingKey !== 'videoUrl'  ? index+1 : index}. </span> : null}
                    {item.bindingKey !== 'videoUrl' && <span className={styles.labelText}>
                      {colorizeMahatriaInfinitheism(item.label)}
                    </span>}
                  </>
                ) : (
                  <span className={styles.labelText}>
                    {colorizeMahatriaInfinitheism(item.label)}
                  </span>
                )}
              </span>
              <span className={styles.value}>
                {item.type === "text" ? (
                  typeof item.value === "string" ? (
                    item.label === "Alternate phone number" ? (
                      (() => {
                        const phoneNumber = parsePhoneNumberFromString(
                          item.value || "",
                        );
                        // Show only if a valid national number exists
                        return phoneNumber && phoneNumber.nationalNumber
                          ? colorizeMahatriaInfinitheism(item.value)
                          : "-";
                      })()
                    ) : item.label === "Amount" ? (
                      formatIndianCurrency(item.value)
                    ) : showLabelIndex ? (
                      <div className={styles.answerIndent}>
                        {renderAnswer(item.value)}
                      </div>
                    ) : (
                      renderAnswer(item.value)
                    )
                ) : (
                  "Invalid text"
                )
              ) : item.type === "multiQuestion" ? (
                (() => {
                  try {
                    const parsed = JSON.parse(item.value);
                    if (parsed && typeof parsed === "object") {
                      return Object.entries(parsed).map(([key, value], idx) => {
                        const safeValue =
                          value && typeof value === "object"
                            ? JSON.stringify(value, null, 2) 
                            : String(value);
              
                        return (
                          <div key={key} className={styles.aspectItem}>
                            <span className={styles.value}>
                             {`${idx+1}. `}  {" "}
                             
                              {colorizeMahatriaInfinitheism(safeValue)}
                            </span>
                          </div>
                        );
                      });
                    }
                  } catch {}
                  return colorizeMahatriaInfinitheism(item.value);
                })()
              ) 
               : item.type === "datetime" ? (
                item.bindingKey === "arrivalDateTime" || item.bindingKey === "departureDateTime" 
                  ? formatDateTimeUniversal(item.value,'dateTime12HrFormat')
                  : formatDateWithoutTime(item.value)
              ) : item.type === "date" ? (
                formatDateWithoutTime(item.value)
              ) : item.type === "image" ? (
                item.value.includes("pdf") ? (
                  <div className={styles.pdfContainer}>
                  <span 
                  onClick={() => {
                  setPdfUrl(item.value);
                  setPdfOpen(true);
                   }}
                  className={`${styles.thumbnail} ${styles.thumbnailLink} `} >
                    📄
                  </span>
                  <div className={styles.hoverEyePreview}
                  onClick={() => {
                  setPdfUrl(item.value);
                  setPdfOpen(true);
                  }}></div>
                  </div>
                ) : (
                  <div className={styles.imageContainer}>
                      <img
                      src={item.value}
                      alt={item.label}
                      className={styles.image}
                      />
                      <div className={styles.hoverEyePreview} onClick={() => {
                        setPreviewImageUrl({
                          image: item.value,
                          altText: item.label
                        })
                        setOpen(true)
                      }}></div>
                      <ImagePreview imageUrl={previewImageUrl.image} altText={previewImageUrl.altText} setOpen={setOpen} isOpen = {open} height={500}></ImagePreview>
                    </div>
                )
                ) : item.type === "video" ? ( 
                    <div className={styles.imageContainer}>
                      <video
                        src={item.value}
                        controls
                        className={styles.video}
                        preload="metadata"
                        controlsList= "" //"nodownload"
                      >
                      </video>
                    </div>
                ) : item.type === "apiCall" ? (
                <span className={styles.value}>
                  <ApiCallValueRenderer item={item} questionMapList = {questionMapList}/>
                </span>
              ) : item.type === "draganddrop" ? (
                <span className={styles.value}>
                  {colorizeMahatriaInfinitheism(item.value)}
                </span>
              ) : (
                "Invalid type"
              )}
            </span>
          </div>
          );
        })}
      </div>
        {pdfOpen && (
        <div className={styles.pdfModal} onClick={() => setPdfOpen(false)}>
          <div className={styles.pdfModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.pdfCloseButton} onClick={() => setPdfOpen(false)}>
              ✕
            </button>
            <iframe
              src={pdfUrl}
              title={pdf_viewer}
              className={styles.pdfView}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const ApiCallValueRenderer: React.FC<{ item: any, questionMapList?:ProgramQuestionMap[] }> = ({ item, questionMapList }) => {
  // const [fullName, setFullName] = React.useState<string>("Loading...");
  let finalAnswer = "No data available";
  // React.useEffect(() => {
  questionMapList?.forEach((questionMap: ProgramQuestionMap) => {
    if( questionMap.question.id == item.id) {
      const answer = questionMap.question.questionOptionMaps.filter((option) => {
        if(option.option.id == item.value){
          // setFullName(option.option.name);
          return true;
        }
        return false;
      })
      if(answer.length > 0) {
        finalAnswer = answer[0].option.name;
        // setFullName(answer[0].option.name);
      }
    }
  })
  return finalAnswer;
};

export default DetailsCard;
