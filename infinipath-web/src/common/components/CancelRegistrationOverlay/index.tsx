import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import UserCard from "../../../components/SeatApprovalFlow/SeekerDetailsOverlay/Common/UserCards";
import Line from "../../../assets/images/LineImg.svg";
import Close from "../../../assets/images/close-cross.svg";
import { Button } from "../Button";
import LineImg from "../../../assets/images/LineImage.svg";
import { CANCEL_REGISTRATION_CONSTANTS } from "../../../constants/index";
import { getCallWithLoader, putCallWithLoader } from "../../../services/apiService";
import { endPoints, PORTAL } from "../../../constants/urlConstants";
import { useDispatch } from "react-redux";
import { incrementLoader } from "../../../reducers/ProgramReducer";
import { textConstant } from "../../../constants/textConstants";

interface CancelOverlayProps {
  onClose: (flag: boolean) => void;
  seekersData: any;
}

const CancelRegistrationOverlay: React.FC<CancelOverlayProps> = ({
  onClose,
  seekersData,
}) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [cancellationReasons, setCancellationReasons] = useState([]);
  const [comments, setComments] = useState("");
  const isFormInvalid = !selectedReason || !comments.trim();
  const dispatch = useDispatch();

  useEffect(() => {
    const cancelReasons = async () => {
      try {
        const response = await getCallWithLoader(endPoints.cancelRegistrationReasons, undefined, PORTAL, textConstant.LARGE);
        if (response.data.statusCode === 200 && response.data.data) {
          setCancellationReasons(response.data.data.data);
        } else {
          console.error("No data found in the response");
        }
      } catch (error) {
        console.error("Error fetching cancellation reasons:", error);
      }
    };
    cancelReasons();
  }, []);

  const handleClear = () => {
    setSelectedReason("");
    setComments("");
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (seekersData?.registrationStatus === "cancelled") {
    alert("This registration is already cancelled.");
    return;
  }
  try {
    dispatch(incrementLoader(textConstant.LARGE));
    const payload = {
      programRegistrationId: Number(seekersData?.id),
      cancellationReason: selectedReason,
      cancellationComments: comments,
    };
    await putCallWithLoader(endPoints.cancelRegistrationData, payload, PORTAL, textConstant.LARGE);
    onClose(true);
  } catch (error) {
    console.error("Error submitting cancellation:", error);
  } 
};


  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <form onSubmit={handleSubmit} autoComplete="on">
          <div className={styles.headerContainer}>
            <div className={styles.header}>{CANCEL_REGISTRATION_CONSTANTS.HEADER_TITLE}</div>
            <div>
              <img
                src={Line}
                alt={CANCEL_REGISTRATION_CONSTANTS.ALT_TEXT.SEPARATOR_LINE}
                className={styles.headerLine}
              />
            </div>
            <button className={styles.closeButton} type="button" onClick={() => onClose(false)}>
              <img
                src={Close}
                alt={CANCEL_REGISTRATION_CONSTANTS.ALT_TEXT.CLOSE}
                className={styles.closeIcon}
              />
            </button>
          </div>

          <div className={styles.userCardWrapper}>
            {seekersData && (
              <UserCard
                seeker={seekersData}
                disablePreferences={true}
                hideRoommatePreferences={true}
                appliedDateOn={true}
              />
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.reasonLabel}>{CANCEL_REGISTRATION_CONSTANTS.LABELS.REASON}</div>
            <div className={styles.radioGroup}>
              {cancellationReasons?.map((reason: any) => (
                <label key={reason.key}>
                  <input
                    type="radio"
                    name="reason"
                    value={reason.key}
                    checked={selectedReason === reason.key}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />{" "}
                  {reason.displayName}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.reasonLabel}>{CANCEL_REGISTRATION_CONSTANTS.LABELS.COMMENTS}</div>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <div className={styles.footerContainer}>
            <div className={styles.footerLine}>
              <img
                src={LineImg}
                alt={CANCEL_REGISTRATION_CONSTANTS.ALT_TEXT.FOOTER_LINE}
              />
            </div>

            <div className={styles.footer}>
              <button
                className={styles.clearBtn}
                type="button"
                onClick={handleClear}
              >
                {CANCEL_REGISTRATION_CONSTANTS.BUTTON_TEXT.CLEAR}
              </button>
              <Button
                type="submit"
                buttonClassName={styles.saveBtn}
                buttonTextClassName={styles.saveText}
                datatestid={CANCEL_REGISTRATION_CONSTANTS.TEST_IDS.SAVE_BUTTON}
                datatestidText={CANCEL_REGISTRATION_CONSTANTS.BUTTON_TEXT.SAVE}
                disable={isFormInvalid}
              >
                {CANCEL_REGISTRATION_CONSTANTS.BUTTON_TEXT.SAVE}
              </Button>
            </div>
          </div>
        </form>
      
      </div>
    </div>
  );
};

export default CancelRegistrationOverlay;