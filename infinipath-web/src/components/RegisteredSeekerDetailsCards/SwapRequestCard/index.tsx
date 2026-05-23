import React, { useState } from "react";
import Select from "react-select";
import styles from "./index.module.scss";
import { Button } from "../../../common/components/Button";
import { endPoints, PORTAL } from "../../../constants/urlConstants";
import { putCall } from "../../../services/apiService";
import { getItemInLocalStorage } from "../../../services/localStorage";

interface DetailsCardProps {
  seekerDetails?: any;
  blessed?: string;
  categoryOptions?: Array<{ value: string; label: string }>;
  onSubmit?: (selectedValues: string[]) => void;
  seekerId?: number;
  swapDetails?: any;
  allocatedTo?: string;
}

const SwapRequestCard: React.FC<DetailsCardProps> = ({
  seekerDetails,
  blessed,
  categoryOptions = [],
  onSubmit,
  seekerId,
  swapDetails,
  allocatedTo,
}) => {
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [proceedOption, setProceedOption] = useState<string>("");

  const handleProceedOptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setProceedOption(event.target.value);
  };

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      minWidth: 200,
      marginTop: 8,
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        status: proceedOption === "swap" ? "accepted" : "yet_to_decide",
        // comment: "",
        swapTo: selectedCategories[0],
      };

      const url = endPoints.swapPorcessUrl(swapDetails?.[0]?.id);
      const response = await putCall(url, payload, PORTAL);
      const data = response?.data;
      if (
        data?.statusCode === 200 &&
        data?.message?.includes("Swap request updated successfully")
      ) {
        window.location.reload();
      } else {
        alert("data?.message");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.detailsCard}>
        <h2 className={styles.title}>Swap or shift request</h2>
        <div className={styles.cardContent}>
          <div className={styles.section1}>
            <div>
              <label className={styles.selectLabel}>Blessed with</label>
              <p className={styles.values}>{seekerDetails?.allocatedProgram?.name}</p>
            </div>
            <div>
              <label className={styles.selectLabel}>Swap request</label>
              <p className={styles.values}>
                {/* {seekerDetails?.allocatedProgram?.name} */}
                {swapDetails?.[0]?.targetProgram?.name}
              </p>
            </div>
            {(swapDetails?.[0]?.status === "accepted" ||
              swapDetails?.[0]?.status === "yet_to_decide") && (
              <div>
                <label className={styles.selectLabel}>Swapped to</label>
                <p className={styles.values}>{allocatedTo?.name || ""}</p>
              </div>
            )}
          </div>
          {swapDetails?.[0]?.status !== "accepted" &&
            swapDetails?.[0]?.status !== "yet_to_decide" &&
            userRole === "shoba" && (
              <>
                <div className={styles.section2}>
                  <div>
                    <p className={styles.question}>
                      How would you like to proceed ?
                    </p>
                    <div className={styles.radioGroup}>
                      <div className={styles.radioOption}>
                        <input
                          type="radio"
                          id="swap"
                          name="proceedOption"
                          value="swap"
                          className={styles.radioInput}
                          onChange={handleProceedOptionChange}
                        />
                        <label htmlFor="swap">Swap program</label>
                      </div>
                      <div className={styles.radioOption}>
                        <input
                          type="radio"
                          id="undecided"
                          name="proceedOption"
                          value="undecided"
                          className={styles.radioInput}
                          onChange={handleProceedOptionChange}
                        />
                        <label htmlFor="undecided">YTD</label>
                      </div>
                    </div>
                  </div>
                </div>
                {proceedOption === "swap" && (
                  <div className={styles.selectSection}>
                    <p className={styles.question}>Select a program for swap</p>
                    <Select
                      options={categoryOptions}
                      className="select"
                      classNamePrefix="filterSelect"
                      menuPlacement="top"
                      placeholder="Select Category"
                      onChange={(selectedOption) => {
                        const value = selectedOption
                          ? selectedOption.value
                          : "";
                        setSelectedCategories([value]); // Wrap single value in array to maintain state structure
                      }}
                      value={categoryOptions.find(
                        (option) => selectedCategories[0] === option.value,
                      )}
                      styles={selectStyles}
                    />
                  </div>
                )}

                <div className={styles.buttonSection}>
                  <div
                    className={styles.buttonContainer}
                    data-testid="custom-popup-button-container"
                  >
                    <Button
                      onClick={() => {
                        handleSubmit();
                      }}
                      buttonClassName={styles.confirmButton}
                      buttonTextClassName={styles.confirmText}
                      datatestid="custom-popup-confirm-button"
                    >
                      {"save"}
                    </Button>
                  </div>
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default SwapRequestCard;
