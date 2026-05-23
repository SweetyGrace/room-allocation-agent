import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
// import InputTextField from "../InputTextField";
import RegisteredFaceId from "../RegisteredFaceId";
import { Button } from "../Button";
import { Avatar, Tooltip } from "@mui/material";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { handleFriendsAndFamilyUpdate } from "../../../utils/addNewSeeker";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../Loader";

interface SeekerDetailsProps {
  seekerDetails: {
    email?: string;
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    countryCode?: string;
    phone?: string;
    registeredFaceId: string;
  };
  setLoader?: (value: boolean) => void;
  loader?: boolean;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Invalid email format",
    ),
});

const EmailVerifyComponent: React.FC<SeekerDetailsProps> = ({
  seekerDetails,
  setLoader,
  loader,
}) => {
  const {
    handleSubmit,
    reset,
    // formState: { errors },
    getValues,
    setFocus,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: seekerDetails?.email || "",
    },
  });

  const location = useLocation(); // Get the current location
  const queryParams = new URLSearchParams(location.search);
  const friendsAndFamily = queryParams.get("friendsAndFamily");
  const navigate = useNavigate();
  const nonInfinipathSeeker = true;
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setFocus("email");
  }, []);

  useEffect(() => {
    if (setLoader) {
      setLoader(!seekerDetails?.email);
    }
  }, [seekerDetails?.email, setLoader]);

  useEffect(() => {
    reset({
      email: seekerDetails?.email || "",
    });
  }, [seekerDetails, reset]);

  //Hanlding member add API Success or failure
  const handleUpdateSeeker = (status: boolean, message: string) => {
    if (status) {
      if (friendsAndFamily) {
        navigate(`/infinipath/friendsandfamily`);
      } else {
        navigate("/infinipath/joinwithothers");
      }
    } else {
      setErrorMessage(message);
    }
  };

  const onSubmit = (data: { email: string }) => {
    const payload = {
      email: data.email,
      phoneNumber: seekerDetails?.phone,
      countryCode: seekerDetails?.countryCode,
      faceUrl: seekerDetails?.registeredfaceId,
      profileUrl: seekerDetails?.profilePicture,
      firstName: seekerDetails?.firstName,
      lastName: seekerDetails?.lastName,
      // address: seekerDetails?.address,
      fullName: seekerDetails?.firstName + " " + seekerDetails?.lastName,
    };
    setLoader(true);
    handleFriendsAndFamilyUpdate(payload, handleUpdateSeeker, setLoader);
  };

  // To form submission on Enter key press and manually trigger form submission
  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const emailValue = getValues("email");
      if (emailValue) {
        handleSubmit(onSubmit)();
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={handleKeyDown}
      data-testid="user-form"
    >
      <div className={styles.userItem} data-testid="user-item">
        <Avatar
          alt="Remy Sharp"
          src={
            seekerDetails?.profilePicture &&
            seekerDetails?.profilePicture?.length > 0
              ? `${seekerDetails?.profilePicture}?timestamp=${new Date().getTime()}`
              : defaultProfileIcon
          }
          sx={{
            width: 40,
            height: 40,
            border: "1px solid #fffff",
          }}
          data-testid="user-avatar"
        />
        <div className={styles.userDetails} data-testid="user-details">
          {seekerDetails?.fullName && seekerDetails?.fullName?.length > 30 ? (
            <Tooltip title={seekerDetails?.fullName} arrow placement="top">
              <span>
                {seekerDetails?.fullName?.slice(0, 30)}
                {"..."}
              </span>
            </Tooltip>
          ) : (
            seekerDetails?.fullName
          )}
          <p className={styles?.phoneText} data-testid="user-phone">
            {seekerDetails?.countryCode?.startsWith("+")
              ? seekerDetails.countryCode
              : `+${seekerDetails?.countryCode || ""}`}{" "}
            {seekerDetails?.phone && seekerDetails?.phone?.length > 0
              ? seekerDetails.phone
              : "Invalid phone number"}
          </p>
        </div>
      </div>
      <div className={styles.labelInput} data-testid="label-input">
        <div className={styles.scanStyles} data-testid="scan-id-container">
          <RegisteredFaceId
            registeredFaceId={seekerDetails?.registeredfaceId}
            friendsAndFamily={friendsAndFamily ? true : false}
            errors={{}}
            scanClassname={styles.scanStyles}
            nonInfinipathSeeker={nonInfinipathSeeker}
            data-testid="registered-face-id"
          />
        </div>
      </div>
      {loader ? (
        <Loader type="small" data-testid="loader" />
      ) : (
        <div className={styles.buttonContainer} data-testid="button-container">
          <Button
            buttonClassName={styles.buttonText}
            type="submit"
            datatestid="add-button"
            datatestidText="add"
          >
            add
          </Button>
        </div>
      )}
      <div data-testid="error-message">{errorMessage}</div>
    </form>
  );
};
export default EmailVerifyComponent;
