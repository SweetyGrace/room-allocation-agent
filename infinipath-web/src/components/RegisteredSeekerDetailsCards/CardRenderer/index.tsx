import React, { useEffect } from "react";
import styles from "./index.module.scss";
import DetailsCard from "../DetailsCard";
import RenderField from "../../../common/components/RenderFeilds";
import { ProgramQuestionMap } from "../../../types/seatApproval";
import { Button } from "../../../common/components/Button";
import { colorizeMahatriaInfinitheism } from "../../../common/components/ColorizeMahatriaInfinitheism";
import CustomCard from "../../../common/components/CustomCard";
import { noData } from "../../../constants";
import { GOODIES_NOTE, OFFLINE_PENDING } from "../../../constants/seekerdetails";
import { putCall } from "../../../services/apiService";
import { endPoints, PORTAL } from "../../../constants/urlConstants";
import {
  CircularProgress,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { getItemInLocalStorage } from "../../../services/localStorage";
import { ROLES } from "../../../utils/roleBasedAccess";
import { ProgramDetails } from "../../../types/seatApproval";
import { SECTION_NAME } from "../../../constants/textConstants";
interface CardRendererProps {
  heading: string; // Heading for the card (e.g., "Basic Details", "Payment Details")
  editable?: boolean; // Determines if the card is editable
  data: Array<any>;
  questionMapList: ProgramQuestionMap[];
  formData?: Record<string, any>;
  handleFieldChange: any;
  errors: any;
  sectionName: string;
  toggleEditMode?: any;
  editMode?: boolean;
  handleFormSubmit?: () => void; // Optional function to handle form submission
  rawData?: any; // Optional raw data for the card
  customClass?: string; // Optional custom class for additional styling
  seekerDetails?: any; // Details of the seeker, used for prefill
  seekerStatus?: any;
  resetUpload?: number;
  sectionKey?: string;
  refetchSeekerDetails?: () => void;
  programDetails?: ProgramDetails | null;
  handleFieldBlur: any;
   manuallyChangedAirline?: string | null;
  setManuallyChangedAirline?: (value: string | null) => void;
}

const CardRenderer: React.FC<CardRendererProps> = ({
  heading,
  data,
  editable,
  questionMapList,
  formData,
  handleFieldChange,
  errors,
  sectionName,
  toggleEditMode,
  editMode,
  handleFormSubmit,
  seekerDetails,
  rawData,
  customClass = "",
  resetUpload = 0,
  sectionKey,
  refetchSeekerDetails,
  programDetails,
  handleFieldBlur,
manuallyChangedAirline, 
setManuallyChangedAirline
}) => {
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";
  let hideEditButton = false;
  const [togglePaymentRequest, setTogglePaymentRequest] = React.useState({
    isShow:
      sectionKey === "FS_PAYMENTINVOICE" &&
      seekerDetails?.paymentDetails?.[0]?.paymentStatus == OFFLINE_PENDING &&
      seekerDetails?.registrationStatus !== "cancelled" &&
      (userRole == ROLES.ADMIN || userRole == ROLES.FINANCE_ADMIN || userRole == ROLES.RM || userRole == ROLES.RM_SUPPORT), 
    toggle: false,
    loading: false,
  });
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [pendingToggle, setPendingToggle] = React.useState(false);

if (sectionKey === "FS_PAYMENTINVOICE") {
  const paymentStatus = data?.find(
    (item) => item?.label === "Payment Status",
  );
  
  if (paymentStatus) {
    // Hide edit button when payment details have only "-" values AND user is NOT RM or RM_SUPPORT
    if (data.some(item => item.value && item.value === "-") && userRole !== ROLES.RM && userRole !== ROLES.RM_SUPPORT) {
      hideEditButton = true;
    }
    // Hide edit button when payment status is "failed"
    else if (paymentStatus?.value?.toLowerCase() === "failed" || paymentStatus?.value?.toLowerCase() === "online") {
      hideEditButton = true;
    }
    // Show edit button when payment details have only "-" values AND user is RM or RM_SUPPORT (will show "Add details")
    else if (data.some(item => item.value && item.value === "-") && (userRole === ROLES.RM || userRole === ROLES.RM_SUPPORT)) {
      hideEditButton = false;
    }
    // Show edit button when data has real values AND user is RM/ADMIN/FINANCE_ADMIN/RM_SUPPORT (will show "Edit details")
    else if (data.some(item => item.value && item.value !== "-") && 
             (userRole === ROLES.RM || userRole === ROLES.ADMIN || userRole === ROLES.FINANCE_ADMIN || userRole === ROLES.RM_SUPPORT)) {
      hideEditButton = false;
    }
    // Default case: hide for all other scenarios
    else {
      hideEditButton = true;
    }
  }
}

  const getToogleStatus = (seekerDetails: any) => {
    if (
      seekerDetails?.paymentDetails?.[0]?.editRequests?.length > 0 &&
      seekerDetails?.paymentDetails?.[0]?.editRequests[0]?.requestStatus ==
        "requested"
    ) {
      return true;
    }
    return false;
  };
  const payemntRequest = () => {
    const payload = {
      requestStatus: !togglePaymentRequest.toggle ? "requested" : "closed",
    };
    setTogglePaymentRequest((prevState) => ({
      ...prevState,
      loading: true,
    }));

    putCall(endPoints.paymentRequest(seekerDetails?.id), payload, PORTAL)
      .then((res) => {
        if (res?.status === 200) {
          // Update local state only - no page refresh
          setTogglePaymentRequest({
            isShow:
              sectionKey === "FS_PAYMENTINVOICE" &&
              seekerDetails?.paymentDetails?.[0]?.paymentStatus ==
                OFFLINE_PENDING &&
              seekerDetails?.registrationStatus !== "cancelled" &&
              (userRole == ROLES.ADMIN || userRole == ROLES.FINANCE_ADMIN || userRole == ROLES.RM || userRole == ROLES.RM_SUPPORT),
            toggle: payload.requestStatus === "requested",
            loading: false,
          });
        }
      })
      .catch((err) => {
        console.error("Error in payment request:", err);
        setTogglePaymentRequest((prevState) => ({
          ...prevState,
          loading: false,
        }));
      });
  };

  const handleToggleClick = () => {
    setPendingToggle(!togglePaymentRequest.toggle);
    setShowConfirmDialog(true);
  };

  const handleConfirmToggle = () => {
    setShowConfirmDialog(false);
    payemntRequest();
  };

  const handleCancelToggle = () => {
    setShowConfirmDialog(false);
  };

  useEffect(() => {
    if (
      sectionKey === "FS_PAYMENTINVOICE" &&
      seekerDetails?.paymentDetails?.[0]?.paymentStatus == OFFLINE_PENDING
    ) {
      setTogglePaymentRequest({
      isShow: (userRole == ROLES.ADMIN || userRole == ROLES.FINANCE_ADMIN || userRole == ROLES.RM || userRole == ROLES.RM_SUPPORT) &&
              seekerDetails?.registrationStatus !== "cancelled",
        toggle: getToogleStatus(seekerDetails),
        loading: false,
      });
    }
  }, []);
  if (
    (seekerDetails?.registrationStatus == "pending_approval" ||
      seekerDetails?.registrationStatus == "rejected" ||
      seekerDetails?.approvals[0].approvalStatus == "on_hold") &&
     (sectionKey === "FS_TRAVELPLAN" || sectionKey === "FS_GOODIES"|| (sectionKey === "FS_PAYMENTINVOICE"))
  ) {
    hideEditButton = true;
  }
  const headerSection = (
    <div className={styles.cardHeader}>
      <h2 className={styles.heading}>
        {colorizeMahatriaInfinitheism(heading)}
        {editable && editMode === false && !hideEditButton && (
          <>
            <span
              className={styles.editButton}
              onClick={() => {
                toggleEditMode &&
                  toggleEditMode(
                    sectionName,
                    questionMapList?.[0]?.programQuestionFormSection?.key,
                  );
              }}
            >
             {data.length > 0 && data.some(item => item.value && item.value !== "-") ? "Edit details" : "Add details"}
            </span>
          </>
        )}
        {sectionKey === "FS_GOODIES" && editable && editMode === true  && (
              <div className={styles.goodiesNote}>
                {GOODIES_NOTE}
              </div>
        )}
      </h2>
      {togglePaymentRequest.isShow && (
        <span className={styles.paymentRequest}>
          Enable edit access
          <Switch
            checked={togglePaymentRequest.toggle}
            onChange={handleToggleClick}
            className={`${styles.switch}`}
            sx={{
              "& .MuiSwitch-thumb": {
                backgroundColor: "white",
                width: "16px",
                height: "16px",
                marginLeft: "4px",
                marginTop: "4px",
              },
              "& .MuiSwitch-track": {
                height: "18px",
                opacity: 1,
                borderRadius: "9px",
                backgroundColor: "#B0B0B0",
              },
              "& .Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#2F73F1 !important",
              },
              "& .Mui-checked .MuiSwitch-thumb": {
                backgroundColor: "white",
              },
            }}
          />
        </span>
      )}
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={handleCancelToggle}>
        <DialogTitle>
          {pendingToggle
            ? "Are you sure you want to give access to update payment details to seeker?"
            : "Are you sure you want to remove access to update payment details from seeker?"}
        </DialogTitle>
        <DialogContent>
          This action will {pendingToggle ? "allow" : "disallow"} the seeker to
          update payment details.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelToggle}
            buttonClassName={styles.cancelButton}
            buttonTextClassName={styles.cancelText}
          >
            no
          </Button>
          <Button
            onClick={handleConfirmToggle}
            buttonClassName={styles.saveButton}
            buttonTextClassName={styles.saveButton}
          >
            yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );

  return (
    <div className={styles.cardContainer}>
      {headerSection}
      {editMode === false ? (
        <>
          {(data?.length > 0 && sectionName !== SECTION_NAME.PAYMENTSECTION) || (data?.length > 1) ? (
            <div className={styles.cardContent}>
              <DetailsCard
                data={data}
                heading={heading}
                questionMapList={questionMapList}
                singleColumn={
                  !!customClass &&
                  customClass.includes("mahatriaQuestionsWrapper")
                }
              />
            </div>
          ) : (
            <div className={styles.noDataMessage}>
              <p>{noData}</p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className={styles.formSection}>
            {questionMapList.map((pqm) => (
              <React.Fragment key={pqm.question.id}>
                <RenderField
                  pqm={pqm}
                  formData={formData ? formData : {}}
                  errors={errors}
                  handleFieldChange={handleFieldChange}
                  handleFieldBlur={handleFieldBlur}
                  sectionName={sectionName}
                  rawData={rawData}
                  seekerDetails={seekerDetails}
                  sectionKey={sectionKey}
                  resetUpload={resetUpload}
                  heading={heading}
                  programDetails={programDetails}
                 manuallyChangedAirline={manuallyChangedAirline}
                  setManuallyChangedAirline={setManuallyChangedAirline}
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
                onClick={() => {
                  toggleEditMode &&
                    toggleEditMode(
                      sectionName,
                      questionMapList[0]?.programQuestionFormSection?.key,
                    );
                }}
                buttonClassName={styles.cancelButton}
                buttonTextClassName={styles.cancelText}
                datatestid="cancel-button"
              >
                {"cancel"}
              </Button>
              <Button
                onClick={() => {
                  handleFormSubmit && handleFormSubmit();
                }}
                buttonClassName={styles.saveButton}
                buttonTextClassName={styles.saveButton}
                datatestid="save-button"
              >
                {"save"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardRenderer;