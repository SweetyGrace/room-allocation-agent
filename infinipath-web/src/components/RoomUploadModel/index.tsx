import React, { useState, useRef } from "react";
import { /*FormLabel*/ Modal, CircularProgress, Box } from "@mui/material";
import styles from "./index.module.scss";
import readXlsxFile from "read-excel-file";
import { useNavigate } from "react-router-dom";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import { UploadFormat } from "../../utils/commonFunctions";
import { postCall } from "../../services/apiService";
import RoomUpload from "../RegisterUpload";
import UploadTable from "../../pages/UploadTable";
import crossIcon from "../../assets/images/cross-icon.svg";
import { BULK_UPLOAD_MESSAGES } from "../../constants";

interface CustomModelProps {
  isOpen: boolean;
  closePopUp: () => void;
  id?: string;
  onUpload: (message: string) => void;
}
const RoomUploadModel: React.FC<CustomModelProps> = ({
  isOpen,
  closePopUp,
  id,
  onUpload,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false); // State for loading
  const [excelData, setExcelData] = useState("");
  const [bulkdata, setBulkData] = useState([]);
  const [url, setUrl] = useState("");
  const [openToast, setOpenToast] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [fileName, setFileName] = useState("");
  const [loader, setLoader] = useState(false);

  /**
   * @description this function is to handle cancel upload
   */
  const handleCancelUpload = () => {
    setLoading(false);
    setErrorCount(0);
    setExcelData("");
    setFileName("");
    setOpenToast(false);
    setBulkData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * @description this function is to call bulk upload api
   * @param fileName
   * @param excelData
   */
  const handleBulkUpload = async (fileName: string, excelData: string) => {
    const payload = {
      key: fileName,
      contentType: "application/vnd.ms-excel",
      data: excelData,
    };
    setLoading(true);
    await postCall(endPoints.uploadFileAws, payload, INFINIPATH)
      .then((response) => {
        const url = response?.data?.data?.url;
        handleBulkFileUpload(url);
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      });
  };


   const handleBulkFileUpload = async (excelUrl: string) => {
     const payload = {
       excelUrl: excelUrl,
     };
     const endpoint = `${endPoints?.webinars}/${id}/${endPoints?.uploadFileToRegistrations}`;
     setLoading(true);
     await postCall(endpoint, payload, INFINIPATH)
       .then((response) => {
         if (response?.data?.statusCode === 200) {
           const payload = {
             webinarId: id,
           };
           postCall(endPoints?.bulkRegistrationsUploadSuccess, payload, INFINIPATH)
             .then((res) => {
               if (res?.data?.statusCode === 200) {
               }
             })
             .catch((error) => {
               console.error(BULK_UPLOAD_MESSAGES.FETCH_ERROR, error);
             });
           // Pass the success message from the response to onUpload
           const successMessage = response?.data?.message || BULK_UPLOAD_MESSAGES.SUCCESS;
           onUpload(successMessage);
         } else {
           const errorMessage = response?.data?.message || BULK_UPLOAD_MESSAGES.ERROR;
           // Pass the error message from the response to onUpload api 
           onUpload(errorMessage);
         }
         closePopUp();
       })
       .catch((error) => {
         console.error(BULK_UPLOAD_MESSAGES.ERROR, error);
         const errorMessage = error?.data?.message || BULK_UPLOAD_MESSAGES.ERROR;
          // Pass the error message from the response to onUpload api
         onUpload(errorMessage);
       });
   };

  /**
   * @description this function is to convert file to base64
   * @param file
   */
  const convertFileToBase64 = (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64WithoutPrefix = base64.replace(
          /^data:application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,/,
          "",
        );
        resolve(base64WithoutPrefix);
      };
      reader.onerror = (error) => {
        console.error("Error converting file to Base64:", error);
        reject(null);
      };
    });
  };

  /**
   * @description this function is call auto register api
   * @param url
   * @param webinarId
   * @param popUpShow
   */
  const handleAutoRegister = async (
    url: string,
    webinarId: number,
    popUpShow?: boolean,
  ) => {
    const payload = {
      excelUrl: url,
      webinarId: webinarId,
    };
    setLoader(true);
    await postCall(endPoints.autoRegisterSeekers, payload, INFINIPATH)
      .then((response) => {

        setLoading(false);
        setLoader(false);
        setOpenToast(false);
        closePopUp();
        if (response?.data?.statusCode === 200) {
          alert("Seekers registered successfully");
        } else {
          alert(response?.data?.message);
        }
        if (popUpShow) {
          setErrorCount(0);
          // setBulkData(mergeErrors(response?.data?.data));
          setOpenToast(false);
          navigate("/admin/infinipath/sessions");
        } else {
          setOpenToast(false);
          navigate("/admin/infinipath/sessions");
        }
      })
      .catch((error) => {
        console.error("Error auto registering seekers:", error);
        setLoading(false);
        setLoader(false);
      });
  };

  /**
   * @description this function is to handle file upload
   * @param event
   */
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
    const validExtensions = [
      ".xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (file && validExtensions.includes(file.type)) {
      try {
        const rows = await readXlsxFile(file);
        const database64 = await convertFileToBase64(file);
        setExcelData && setExcelData(database64);
        if (rows && UploadFormat(rows)) {
          handleBulkUpload(file.name, database64);
        } else {
          alert("Invalid file format. Please upload a valid file");
        }
      } catch (error) {
        console.error("Error processing file:", error);
        alert("An error occurred while processing the file. Please try again.");
      }
    } else {
      alert("Invalid file format. Please upload a valid .xlsx file");
    }
  };
  //To trigger file input
  const triggerFileInput = (event: unknown) => {
    event.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // To handle download template
  const handleDownloadTemplate = async () => {
 //write the function accordingly
  };

  return (
    <>
      <Modal
        open={isOpen}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className={styles.tryagainModal1}>
          <div className={styles.container}>
            <div className={styles.uploadText}>Registrations bulk upload</div>
            <div className={styles.closeGSTINPopupMain}>
              <button
                className={styles.closeGSTINPopup}
                onClick={closePopUp}
              >
                <img src={crossIcon} loading="lazy" alt="image"></img>
              </button>
            </div>
          </div>
          <div
            onClick={(event) => {
              event.stopPropagation();
              triggerFileInput(event);
            }}
          >
            <RoomUpload
              fileName={fileName}
              handleCancelUpload={handleCancelUpload}
              loading={loading}
              triggerFileInput={triggerFileInput}
            />
          </div>
          <div className={styles.tryagainButtonContainer1}>
            <div
              className={styles.buttonContainer1}
              onClick={handleDownloadTemplate}
            >
              {loading ? (
                <Box sx={{ height: "24px" }}>
                  <CircularProgress
                    sx={{
                      color: "inherit",
                      width: "24px !important",
                      height: "24px !important",
                    }}
                  />
                </Box>
              ) : (
                ""
                // "Download template"
              )}
            </div>
          </div>
          <input
            type="file"
            accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className={styles.input}
            style={{ display: "none" }}
          />
        </div>
      </Modal>
      {openToast && (
        <UploadTable
          isOpen={openToast}
          close={() => {
            setErrorCount(0);
            setOpenToast(false);
            closePopUp();
          }}
          url={url}
          id={id}
          setUrl={setUrl}
          errorCount={errorCount}
          loader={loader}
          excelData={excelData}
          adminData={bulkdata}
          handleAutoRegister={handleAutoRegister}

        />
      )}

    
    </>
  );
};

export default RoomUploadModel;
