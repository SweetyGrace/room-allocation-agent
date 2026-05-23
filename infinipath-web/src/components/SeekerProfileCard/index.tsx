import styles from "./index.module.scss";
import userIcon from "../../assets/images/usercircle.svg";
import phoneIcon from "../../assets/images/phone.svg";
import emailIcon from "../../assets/images/envelope.svg";
import location from "../../assets/images/locationwithline.svg";
import defaultUser from "../../assets/images/default-profile.svg";
import calendarStar from "../../assets/images/CalendarStar.svg";
import { calculateAge } from "../../utils/programUtils";
import { colorizeMahatriaInfinitheism } from "../../common/components/ColorizeMahatriaInfinitheism";
import { ProgramQuestionMap } from "../RegisteredSeekerDetailsCards/types";
import { getCall } from "../../services/apiService";
import { useEffect, useState } from "react";
import RenderField from "../../common/components/RenderFeilds";
import React from "react";
import { Button } from "../../common/components/Button";
import CustomCard from "../../common/components/CustomCard";
import { ProgramDetails } from "../../types/seatApproval";
import { ROLES } from "../../utils/roleBasedAccess";

interface SeekerProfileCardProps {
  bindingKeyToQuestionId: Record<string, number>;
  profileData: Record<string, any>;
  errors: any;
  formData?: Record<string, any>;
  handleFieldChange: (
    questionId: string,
    value: any,
    sectionName: string,
  ) => void;
  handleFieldBlur: (questionId: string, sectionName: string) => void;
  rawData?: any;
  seekerDetails?: any; 
  resetUpload?: number;
  programDetails: ProgramDetails | null;
  seekerProfileQuestions: any;
  handleFormSubmit: any;
  userRole: string;
  editModes: any[];
  setEditModes?: React.Dispatch<
    React.SetStateAction<
      {
        sectionName: string;
        editMode: boolean;
      }[]
    >
  >;
}
const SeekerProfileCard: React.FC<SeekerProfileCardProps> = ({ userRole,bindingKeyToQuestionId, profileData, errors, formData, handleFieldChange, rawData, seekerDetails, resetUpload, programDetails, seekerProfileQuestions, handleFormSubmit, handleFieldBlur, editModes, setEditModes }) => {
const [rmName, setRmName] = useState("");
const isEdit = editModes?.find((mode) => mode.sectionName === "FS_PROFILEDETAILS")?.editMode || false;
 const [originalFormData, setOriginalFormData] = useState<Record<string, any>>({});

 const handleEditClick = () => {
    // Store original form data when entering edit mode
    setOriginalFormData({ ...formData });
    const modes = editModes?.map(mode => mode.sectionName === "FS_PROFILEDETAILS" ? { ...mode, editMode: !isEdit } : mode);
    setEditModes && setEditModes(modes);
  };
  const handleCancel = () => {
    setEditModes && setEditModes(editModes.map(mode => mode.sectionName === "FS_PROFILEDETAILS" ? { ...mode, editMode: !isEdit } : mode));
    // Restore original form data
    if (originalFormData && Object.keys(originalFormData).length > 0) {
      Object.keys(originalFormData).forEach(questionId => {
        handleFieldChange(questionId, originalFormData[questionId], "FS_PROFILEDETAILS");
      });
    }
  };

  useEffect(() => {
    if(profileData?.rmContact?.config){
    getCall(profileData?.rmContact?.config.apiUrl, undefined, PORTAL)
      .then((response) => {
        const arr = response?.data?.data;
        const answer = arr[profileData?.rmContact?.config.category].filter((each: any) => {
          if(each.key == profileData?.rmContact?.answer){
            return true;
          }
          return false;
        })

      if(answer.length > 0) {
        setRmName(answer[0].value);
      }
      })
      .catch(() => {
      })
    }
  },[])
useEffect(() => {
  const noOfHdbsValue = formData?.[bindingKeyToQuestionId["no_of_hdbs"]];
  const lastHdbValue = formData?.[bindingKeyToQuestionId["QK_LAST_HDB"]];
  
  // If no_of_hdbs is 0 and QK_LAST_HDB has a value, clear QK_LAST_HDB
  if (noOfHdbsValue === "0" && lastHdbValue && lastHdbValue !== "") {
    handleFieldChange(bindingKeyToQuestionId["QK_LAST_HDB"].toString(), "", "FS_PROFILEDETAILS");
  }
}, [formData?.[bindingKeyToQuestionId["no_of_hdbs"]], bindingKeyToQuestionId, handleFieldChange]);


    return (
        <>
        {
        !isEdit ? 
        <div className={seekerDetails?.user?.hdbDefaulter ? styles.defaulterCard : styles.containerCard}>
            { (userRole == ROLES.SHOBA || userRole == ROLES.RM || userRole == ROLES.ADMIN || userRole == ROLES.SUPER_ADMIN ) && 
              seekerDetails?.registrationStatus != "cancelled" && 
            <div className = {styles.edit}>
                <span onClick={handleEditClick}>Edit details</span>
            </div>}
            <div className = {styles.mainCard}>
                <div className={styles.profileSection}>
                    <img src={profileData?.profileUrl?.answer || defaultUser}
                    alt="Profile"
                />
                
                {/* <Avatar
                        alt="seeker profile"
                        src={profileData?.profileUrl?.answer || defaultUser}
                        sx={{
                          width: 32,
                          height: 32,
                          border: "1px solid #DDDDDD",
                        }}
                        data-testid="profile-avatar"
                      /> */}
                <span className={styles.caption}>{colorizeMahatriaInfinitheism(`${profileData?.no_of_hdbs?.answer < 10? '0': ''}${formData?.[bindingKeyToQuestionId["no_of_hdbs"]] || ""} HDBs`)}</span>
                </div>
                <div className={styles.profileDetails}>
                    <p className={styles.name}>{colorizeMahatriaInfinitheism(formData?.[bindingKeyToQuestionId["name"]])}</p>
                    <div className = {styles.profileDetailsInfo}>
                        <div className={styles.info}>
                            <div>
                                <img src = {userIcon}/>
                            </div>
                            <span className={styles.gender}>{formData?.[bindingKeyToQuestionId["gender"]]}</span>
                        </div>
                        <div className={styles.verticalLine}></div>
                        <div className={styles.info}>
                            <span>{calculateAge(formData?.[bindingKeyToQuestionId["dob"]])} yrs</span>
                        </div>
                        <div className={styles.verticalLine}></div>
                        <div className={styles.info}>
                            <div>
                                <img src = {location}/>
                            </div>
                            <span>{formData?.[bindingKeyToQuestionId["city"]]?.toLowerCase() != "other" ? formData?.[bindingKeyToQuestionId["city"]] : formData?.[bindingKeyToQuestionId["otherCityName"]]}</span>
                        </div>
                    </div>
                    <div className = {styles.profileDetailsInfo}>
                        <div className={styles.info}>
                            <div>
                                <img src = {phoneIcon}/>
                            </div>
                            <span>{formData?.[bindingKeyToQuestionId["mobileNumber"]]}</span>
                        </div>
                        <div className={styles.verticalLine}></div>
                        <div className={styles.info}>
                            <div>
                                <img src = {emailIcon}/>
                            </div>
                            <span>{formData?.[bindingKeyToQuestionId["email"]]}</span>
                        </div>
                        {/* <div className={styles.verticalLine}></div> */}
                        {/* <div className={styles.info}>
                            <div>
                                <img src = {rmContact}/>
                            </div>
                            <span>
                                {
                                    !profileData?.otherInfinitheismContact ? rmName
                                :
                            profileData?.otherInfinitheismContact?.answer
                            }
                            </span>
                        </div> */}
                    </div>
                    {formData?.[bindingKeyToQuestionId["QK_LAST_HDB"]] && (
                        <div className = {styles.profileDetailsInfo}>
                            <div className={styles.info}>
                                <div>
                                    <img src = {calendarStar}/>
                                </div>
                                <span>{formData?.[bindingKeyToQuestionId["QK_LAST_HDB"]]}</span>
                            </div>
                        </div>
                    )}
                   
                </div>
            </div>
        </div> :
            <div className={styles.formContainer}>
                <div className={styles.formSection}>
                  {seekerProfileQuestions?.map((pqm) => (
                    <React.Fragment key={pqm.question.id}>
                      <RenderField
                        pqm={pqm}
                        formData={formData? formData : {}}
                        errors={errors}
                        handleFieldChange={handleFieldChange}
                        handleFieldBlur={handleFieldBlur}
                        sectionName={"FS_PROFILEDETAILS"}
                        rawData={rawData}
                        seekerDetails={seekerDetails}
                        resetUpload={resetUpload}
                        heading={"Profile Details"}
                        programDetails={programDetails}
                      />
                      {pqm.question?.config?.showDialogMessage?.map((item, index) => {
                        // Defensive: Ensure formData and sectionName are valid and fallback to empty object if not found
                          
                          const questionValue = formData?.[pqm.question.id];
                        // Normalize both values to string and lowercase for comparison
                     
                     
                        if (
                          item.type === "card" &&
                          String(questionValue).toLowerCase() ===
                            String(item?.isShow).toLowerCase()
                        ) {
                          return (
                            <CustomCard
                              allocatedProgram={seekerDetails?.allocatedProgram}
                              key={item.type + index}
                              cardContent={item}
                              question={pqm.question}
                              content={item?.dialogueContent}
                            />
                          );
                        }
                        return null;
                      })}
                    </React.Fragment>
                  ))}
                </div>
                <div className={styles.buttonSection}>
                  <div
                    className={styles.buttonContainer}
                    data-testid="custom-popup-button-container"
                  >
                    <Button
                      onClick={handleCancel}
                      buttonClassName={styles.cancelButton}
                      buttonTextClassName={styles.cancelText}
                      datatestid="cancel-button"
                    >
                      {"cancel"}
                    </Button>
                    <Button
                      onClick={() => {
                        handleFormSubmit && handleFormSubmit("FS_PROFILEDETAILS");
                      }}
                      buttonClassName={styles.saveButton}
                      buttonTextClassName={styles.saveButton}
                      datatestid="save-button"
                    >
                      {"save"}
                    </Button>
                  </div>
                </div>
            </div>
        }
       </>
    )
}

export default SeekerProfileCard;
