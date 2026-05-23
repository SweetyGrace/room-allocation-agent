import { useEffect, useState, useRef } from "react";
import * as faceapi from "face-api.js";
import { uploadImageToS3 } from "../../services/imageUploadToAws";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../common/components/Loader";
import styles from "./index.module.scss";
import VerificationResultComponent from "../../components/VerificationResultComponent";
import { checkForCamera } from "../../utils/checkForCamera";
import { detectBrowser } from "../../utils/detectBrowser";

interface SeekerData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  countryCode?: string;
  faceUrl?: string;
  profileUrl?: string;
  address?: string;
  id?: number;
  role?: string;
  userId?: number;
}

interface SeekerDataToVerify {
  userId?: number;
}
import {
  getItemInLocalStorage,
  removeItemInLocalStorage,
  setItemInLocalStorage,
} from "../../services/localStorage";
import { getCall, getCallWithoutAuth, postCall } from "../../services/apiService";
import { endPoints, INFINIPATH, PORTAL } from "../../constants/urlConstants";
import { Button } from "../../common/components/Button";
import { auth } from "../../Firebase.js";
import { signInWithCustomToken } from "firebase/auth";
import failedIcon from "../../assets/images/failure-tick.svg";
import GrayLine from "../../common/components/GrayLine";
import rightArrow from "../../assets/images/right-arrow.svg";
import CustomPopup from "../../common/components/CustomPopup";
import { handleMarkAttendance } from "../../utils/markAttendance";
import { useDispatch, useSelector } from "react-redux";
import {
  addNotVerifiedSeekersIds,
  addVerifiedSeekersIds,
} from "../../reducers/SeekerReducer";
import {
  setProfilePicture,
  setRegisteredFaceId,
} from "../../reducers/SeekerReducer";
import ScannerAnimation from "../../common/components/ScannerAnimation";
import infoIcon from "../../assets/images/info-icon.svg";
import { modifyProfileUrl } from "../../utils/commonFunctions";
import { RootState } from "../../store";
import { ROLES } from "../../utils/roleBasedAccess";

const VerifyUserFace = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation(); // Get the current location
  const queryParams = new URLSearchParams(location.search);
  const source = queryParams.get("source");

  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [models, setModels] = useState(false);
  const [verificationResult, setVerificationResult] = useState("");
  const [cameraFound, setCameraFound] = useState(true);
  const seekerData = getItemInLocalStorage("seekerDetails");
  const [errorMessage, setErrorMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupDescription, setPopupDescription] = useState("");
  const [note, setNote] = useState("");
  const [capturedImage, setCapturedImage] = useState(false);
  const meetingId = getItemInLocalStorage("table_meeting_id");

  // Ref to store the media stream
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const seeker = getItemInLocalStorage("selectedSeekerDetails");
  const selectedFriendOrFamily = getItemInLocalStorage(
    "selectedFriendOrFamily",
  );

  const seekerDetails = getItemInLocalStorage("seekerDetails");

  //Capturing Query params
  const fromLogin = queryParams.get("login");
  const updateProfilePicture = queryParams.get("updateProfilePicture");
  const through_search = queryParams.get("through_search");
  const join_with_others = queryParams.get("join_with_others");
  const nonInfinipathSeeker = queryParams.get("nonInfinipathSeeker");
  const addNewFriend = queryParams.get("addNewFriend");
  const fromFriendsAndFamily = queryParams.get("fromFriendsAndFamily");
  const profilePicture = queryParams.get("profilePicture");
  const enrollFaceId = queryParams.get("enrollFaceId");
  const newSeekerCapture = queryParams.get("newSeekerCapture");
  const friendsAndFamily = queryParams.get("friendsAndFamily");

  //Redux state
  const seekerDataToVerify = useSelector(
    (state: RootState) => state?.seekerReducer?.seekerToVerify || {},
  );
  const verifiedSeekersIds = useSelector(
    (state: RootState) => state?.seekerReducer?.verifiedSeekersIds || [],
  );
  const notVerifiedSeekersIds = useSelector(
    (state: RootState) => state?.seekerReducer?.notVerifiedSeekersIds || [],
  );
  const seekerDetailsFromRedux = useSelector(
    (state: RootState) => state?.seekerReducer?.seekerProfile || {},
  );

  /**
   * @description: This function is used to load the models
   */
  useEffect(() => {
    // Load models when component mounts
    const loadModels = async () => {
      setLoading(true);
      await faceapi.loadTinyFaceDetectorModel(`/models`);
      await faceapi.loadFaceLandmarkTinyModel(`/models`);
      setModels(true);
    };
    loadModels();

    return () => {
      setModels(false);
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (through_search || join_with_others || nonInfinipathSeeker) {
      setVerificationResult("");
    }
    if (models) {
      start();
    }
  }, [models]);

  /**
   * @description: This function is used to add the memeber to the user as a friends and family
   */
  const updateSeekerDetails = (seeker: SeekerData) => {
    const updateSeekerPayload = {
      members: [
        {
          firstName: seeker?.firstName,
          phoneNumber: seeker?.phoneNumber,
          email: seeker?.email,
          countryCode: seeker?.countryCode?.startsWith("+")
            ? seeker?.countryCode
            : `+${seeker?.countryCode}`,
          relation: "brother",
          faceUrl: seeker?.faceUrl,
          lastName: seeker?.lastName,
          profileUrl: seeker?.profileUrl,
          ...(seeker?.address && seeker.address.length > 0 && { address: seeker.address }),
        },
      ],
    };
    setLoading(true);
    postCall(
      `${endPoints.users}/${seekerDetails?.id}/members`,
      updateSeekerPayload,
      INFINIPATH,
    ).then((res) => {
      if (res?.data?.statusCode === 200) {
        setLoading(false);
        if (friendsAndFamily) {
          removeItemInLocalStorage("selectedFriendOrFamily");
          navigate("/infinipath/friendsandfamily");
        } else if (
          through_search &&
          getItemInLocalStorage("selectedSeekerDetails")
        ) {
          removeItemInLocalStorage("selectedSeekerDetails");
          navigate(`/infinipath/joinwithothers`);
        }
      } else {
        setLoading(false);
        setErrorMessage(res?.data?.message);
      }
    });
  };

  /**
   * @description: This function is used to update the seeker details when face verification is successful from search results
   */
  const handleSearchUpdate = (seeker: SeekerData) => {
    updateSeekerDetails(seeker);
  };

  /**
   * @description: This function is used to stop the camera
   */
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      tracks.forEach((track) => track.stop()); // Stop each track
      mediaStreamRef.current = null; // Clear the reference
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null; // Set the srcObject to null
    }
  };

  /**
   *@description : This function is used to handle the camera permission error
   */
  const handleCameraPermissionError = () => {
    if (fromLogin) {
      alert("Error accessing the camera, please allow camera access");
      navigate("/login?skipFaceVerify=true", { replace: true });
    } else if (enrollFaceId || updateProfilePicture || profilePicture) {
      alert("Error accessing the camera, please allow camera access");
      navigate("/infinipath/myspace", { replace: true });
    } else if (source === "join") {
      alert("Error accessing the camera, please allow camera access");
      setItemInLocalStorage("verification_status", "failed");
      navigate("/infinipath/myspace", { replace: true });
    }
  };

  /**
   * @description: This function is used to launch the camera
   */
  const launchCamera = async () => {
    try {
      const constraints = {
        video: true,
        audio: false,
      };

      mediaStreamRef.current =
        await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        setLoading(false);
        videoRef.current.srcObject = mediaStreamRef.current; // Use the ref to set the stream
        videoRef.current.play();
      }
    } catch (error: unknown) {
      setLoading(false);
      handleCameraPermissionError();
    }
  };

  /**
   * @description: This function is used to capture the image and upload to S3
   */
  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    // Get the actual dimensions of the video
    const videoWidth = videoRef.current?.videoWidth || 330; // Default to 330 if not available
    const videoHeight = videoRef.current?.videoHeight || 400; // Default to 400 if not available

    // Set canvas dimensions to match video dimensions
   if(canvas) {
    canvas.width = videoWidth;
    canvas.height = videoHeight;
   }

    context && context.drawImage(videoRef.current as CanvasImageSource, 0, 0, videoWidth, videoHeight);
    const image = canvas && canvas.toDataURL("image/png");

    setLoading(true);
    const payload = image?.replace("data:image/png;base64,", "") || "";
    const binary = atob(payload);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    setCapturedImage(true);
    uploadImageToS3(
      buffer as any,
      "images/temp",
      verificationSuccess,
      fromLogin,
      updateProfilePicture,
      enrollFaceId,
      through_search,
      join_with_others,
      seekerDataToVerify,
      profilePicture,
      newSeekerCapture,
      nonInfinipathSeeker,
      friendsAndFamily,
    );
    /**Stopping camera once face detected and started uploading */
    stopCamera();
  };

  /*
   * @description: This function is used to start the face detection
   */
  const startFaceDetection = async () => {
    const video = videoRef?.current;
    const canvas:any = canvasRef?.current;
    const ctx:any = canvas?.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Define the central detection box dimensions
    const detectionBox = {
      width: 180,
      height: 260,
    };

    // Draw the mask and border consistently
    const drawMaskAndBorder = () => {
      // Draw semi-transparent overlay and dashed border for the mask area
      ctx.fillStyle = "#051b46";
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Draw overlay only once per frame

      // Cut-out circle mask in the middle of the canvas
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.ellipse(
        canvas.width / 2, // Center X
        canvas.height / 2, // Center Y
        detectionBox.width / 2,
        detectionBox.height / 2,
        0,
        0,
        2 * Math.PI,
      );
      ctx.fill();

      // Draw dashed border around the detection area
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";

      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(
        canvas.width / 2, // Center X
        canvas.height / 2, // Center Y
        detectionBox.width / 2,
        detectionBox.height / 2,
        0,
        0,
        2 * Math.PI,
      );
      ctx.stroke();
    };

    // Start the video stream if not already started
    if (video && !video.srcObject) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    }

    const faceDetectionLoop = async () => {
      // Call the function to draw the mask and border
      if (!updateProfilePicture && !profilePicture) {
        drawMaskAndBorder();
      }
      if (video && video?.readyState === 4) {
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.9,
        });
        const face = await faceapi
          .detectAllFaces(video, options)
          .withFaceLandmarks(true);

        // Process face detections
        if (face?.length === 1) {
          if (!updateProfilePicture && !profilePicture) {
            setScanning(true);
          }
          // Not used: 19/01/2026
          // setDetected("found");
          const dims = faceapi.matchDimensions(canvas, video, false);
          const resizedFace = faceapi.resizeResults(face, dims);
          const isFaceInCenter = resizedFace.some((detection) => {
            const { left, right, top } = detection.detection.box;
            return (
              left >= detectionBox.width / 2 &&
              right <= detectionBox.width + detectionBox.width / 2 &&
              canvas.height - top <= canvas.height * 0.75
            );
          });

          if (isFaceInCenter && !updateProfilePicture && !profilePicture) {
            setScanning(false);
            captureImage();
          }
        } 
        // Not used: 19/01/2026
        // else if (face?.length > 1) {
        //   setDetected("Multiple faces detected");
        // } else {
        //   setDetected("not_found");
        // }
      }
      requestAnimationFrame(faceDetectionLoop); // Continue detecting
    };
    faceDetectionLoop();
  };

  /*
   * @description: This function is used to start the camera and face detection
   */
  const start = async () => {
    // If the face url is not present, then set the verification status to false and redirecting to zoom
    if (
      seekerData &&
      !updateProfilePicture &&
      !enrollFaceId &&
      (seekerData?.faceUrl == null || seekerData?.faceUrl?.length === 0) &&
      !profilePicture &&
      !fromLogin &&
      !newSeekerCapture &&
      !nonInfinipathSeeker &&
      !through_search &&
      !friendsAndFamily &&
      !join_with_others
    ) {
      verificationSuccess(false);
      return;
    }

    const cameraFound = await checkForCamera();
    if (cameraFound) {
      await launchCamera();
      //In safari camera initialization takes time, hence delaying the face detection by 2 seconds
      if (detectBrowser() === "Safari") {
        setTimeout(() => {
          startFaceDetection();
        }, 2000);
      } else {
        startFaceDetection();
      }
    } else {
      setLoading(false);
      setCameraFound(false);
    }
  };

  /**
   * @description: This function is used to handle the face login
   * @param {boolean | string} status - The status of the face login, in this case it will be the face id string
   */
  const handleFaceLogin = async (status: boolean | string) => {
    try {
      const res = await getCallWithoutAuth(
        `${endPoints.faceLoginV1}/${status}?appType=infinipath`,
      );
      if (res?.data?.statusCode === 200) {
        const userCredential = await signInWithCustomToken(
          auth,
          res?.data?.data?.tokenData?.customToken,
        );
        const idToken = await userCredential?.user?.getIdToken();
        setItemInLocalStorage("idToken", idToken);

        const localId = res?.data?.data?.userData?.id;
        setItemInLocalStorage("localId", localId);
        setItemInLocalStorage(
          "tokenExpirationTime",
          (userCredential?.user as any)?.stsTokenManager?.expirationTime?.toString() || "",
        );
        const dataReq = res?.data?.data?.userData;
        if (dataReq?.profileUrl?.length > 0) {
          dataReq.profileUrl = modifyProfileUrl(dataReq?.profileUrl);
        }
        setItemInLocalStorage("seekerDetails", dataReq);

        if (
          res?.data?.data?.userData?.role === "mahatria" ||
          res?.data?.data?.userData?.role === "admin"
        ) {
          navigate("/admin/infinipath/sessions", { replace: true });
        } else {
          alert("User does not exist");
          window.location.replace("/");
        }
      } else {
        handleError("Sorry, we are unable to validate your Face ID.");
      }
    } catch (error) {
      handleError("Login failed, please try with OTP");
    }
  };

  const handleError = (message: string) => {
    setLoading(false);
    setErrorMessage(message);
    setPopupOpen(true);
    setPopupDescription(message);
  };

  /**
   * @description: This function is used to get the user details once profile picture is updated
   */
  const getUserDetails = (id: number) => {
    getCall(`${endPoints.profile}/${id}`, undefined, PORTAL)
      .then((res) => {
        if (res?.data?.statusCode === 200) {
          const dataReq = res?.data?.data;
          // Replace the beginning of the profileUrl string
          // if (dataReq?.profileUrl?.length > 0) {
            // dataReq.profileUrl = modifyProfileUrl(dataReq.profileUrl);
          // }
          setItemInLocalStorage("seekerDetails", dataReq);
          setTimeout(() => {
            window.location.replace("/admin/profile");
          }, 2000);
        } else {
          setTimeout(() => {
            window.location.replace("/admin/profile");
          }, 2000);
        }
      })
      .catch(() => {
        setTimeout(() => {
          window.location.replace("/admin/profile");
        }, 2000);
      });
  };

  /*
   * @description: This function is used to handle the verification success or failure from Amazon rekognition
   */
  const verificationSuccess = (status: boolean | string) => {

    const showPopup = (description: string, errorMessage?: string) => {
      setLoading(false);
      setPopupOpen(true);
      setPopupDescription(description);
      if (errorMessage) setErrorMessage(errorMessage);
    };

    const navigateTo = (path: string, delay: number = 0) => {
      setTimeout(() => {
        navigate(path, { replace: true });
      }, delay);
    };

    /** When facial login is successful */
    if (fromLogin) {
      handleFaceLogin(status);
      return;
    }
    /** When profile picture is updated through my profile*/
    if (updateProfilePicture && !newSeekerCapture) {
      getUserDetails(seekerDetails?.id);
      return;
    }

    /** While trying to enroll a new face through my profile */
    if (enrollFaceId) {
      if (typeof status === "boolean" && !status) {
        showPopup("Face ID enrolled successfully");
        setNote("Please wait, you are being redirected to Infinipath….");
        navigateTo("/admin/profile", 3000);
      } else if (typeof status === "string") {
        //String format status
        /** While trying already existing face to enroll though my profile*/
        showPopup(
          "Face ID matches with existing Face ID",
          "Face ID matches with existing Face ID",
        );
      }
      return;
    }

    if (through_search === "true") {
      if (status) {
        /**While verifying face ID from the search result seeker - Success scenario */
        handleSearchUpdate(seeker);
      } else {
        /**While verifying face ID from the search result seeker - Failure scenario */
        showPopup("Face ID did not match", "Face ID did not match");
      }
      return;
    }

    if (join_with_others === "true" && !profilePicture) {
      if (status) {
        /**When verifying face ID for join with others - Success scenario */
        dispatch(
          addVerifiedSeekersIds([
            ...verifiedSeekersIds,
            (seekerDataToVerify as SeekerDataToVerify)?.userId,
          ]),
        );
        navigateTo("/infinipath/joinwithothers");
      } else {
        /**When verifying face ID for join with others - Failure scenario */
        showPopup("Face ID did not match", "Face ID did not match");
      }
      return;
    }

    if (newSeekerCapture) {
      if (typeof status === "string" && status.includes(".com")) {
        /**Adding new seeker when search results are empty */
        //Handling the tryagain case
        const seekerToAdd = getItemInLocalStorage("seekerToAdd");
        if (seekerToAdd) {
          setItemInLocalStorage("seekerToAdd", {
            ...seekerToAdd,
            registeredfaceId: status,
          });
        } else {
          dispatch(setRegisteredFaceId(status));
        }
        /**Conditional navigation */
        navigateTo(
          addNewFriend
            ? "/infinipath/newseeker?friendsAndFamily=true"
            : "/infinipath/newseeker",
        );
      } else if (typeof status === "string") {
        /**Adding new seeker when search results are empty - but face ID already exists*/
        showPopup(
          "Face ID matches with existing Face ID",
          "Face ID matches with existing Face ID",
        );
      }
      return;
    }

    if (nonInfinipathSeeker) {
      /**In this scenario success case we will get the Url of updating faceID */
      if (typeof status === "string" && status.includes(".com") && friendsAndFamily) {
        /**Adding Non infinipath seeker from search results - faceID success scenario*/
        dispatch(setRegisteredFaceId(status));
        navigateTo("/infinipath/verifyphonenumber?friendsAndFamily=true");
      } else if (typeof status === "string" && status.includes(".com") && !fromFriendsAndFamily) {
        /**Adding Non infinipath seeker from search results - faceID success scenario*/
        dispatch(setRegisteredFaceId(status));
        navigateTo("/infinipath/verifyphonenumber");
      } else if (typeof status === "string") {
        /**In this scenario we will get an esisting faceID example: 341be823-ba2d-4a80-a3e7-1ae636c8f35f */
        /**Adding Non infinipath seeker from search results - faceID failure scenario*/
        showPopup(
          "Face ID matches with existing Face ID",
          "Face ID matches with existing Face ID",
        );
      }
      return;
    }

    if (status && !fromLogin && !profilePicture && !friendsAndFamily) {
      setLoading(false);
      if (source === "attendance" && status === true) {
        /** When seeker clicked on mark attendance while joining from other device */
        setLoading(true);
        setItemInLocalStorage("joining_from_other_device", "true");
        handleMarkAttendance(
          seekerData,
          meetingId,
          navigate,
          setLoading,
          status,
        );
      } else if (source === "join" && status === true) {
        /** When verification is successful while joining zoom */
        setItemInLocalStorage("verification_status", "success");
        navigateTo("/admin/infinipath/sessions");
      }
      return;
    }

    /**Adding profile picture from add new seeker */
    if (profilePicture) {
      dispatch(setProfilePicture(status));
      if (friendsAndFamily) {
        navigateTo("/infinipath/newseeker?friendsAndFamily=true");
      } else {
        navigateTo("/infinipath/newseeker");
      }
      return;
    }

    /**When verifying face ID for friends and family - Success scenario */
    if (status && friendsAndFamily) {
      handleSearchUpdate(selectedFriendOrFamily);
      return;
    }

    /**When verifying face ID for friends and family - Failure scenario */
    if (!status && friendsAndFamily) {
      showPopup("Face ID did not match", "Face ID did not match");
      return;
    }

    setLoading(false);
    if (source === "attendance") {
      /** When seeker clicked on mark attendance while joining from other device, but face verification failed */
      showPopup("Verification failed", "Verification failed");
    } else if (source === "join") {
      /**When user clicked on join meeting but face verification failed */
      showPopup("Verification failed", "Verification failed");
    }
  };

  /**
   * @description: This function is used to handle the skip button
   */
  const handleSkip = () => {
    stopCamera();
    if (fromLogin) {
      navigate("/login?skipFaceVerify=true", { replace: true });
    } else if (enrollFaceId) {
      if (Object.values(ROLES).includes(seekerData?.role)) {
        navigate("/admin/profile", { replace: true });
      }
    } else if (newSeekerCapture && addNewFriend) {
      navigate("/infinipath/newseeker?friendsAndFamily=true", {
        replace: true,
      });
    } else if (newSeekerCapture) {
      navigate("/infinipath/newseeker", { replace: true });
    } else if (updateProfilePicture) {
      if (Object.values(ROLES).includes(seekerData?.role)) {
        navigate("/admin/profile", { replace: true });
      }
    } else if (nonInfinipathSeeker && friendsAndFamily) {
      navigate("/infinipath/verifyphonenumber?friendsAndFamily=true", {
        replace: true,
      });
    } else if (nonInfinipathSeeker) {
      navigate("/infinipath/verifyphonenumber", { replace: true });
    } else if (profilePicture && friendsAndFamily) {
      navigate("/infinipath/newseeker?friendsAndFamily=true", {
        replace: true,
      });
    } else if (profilePicture && join_with_others) {
      navigate("/infinipath/newseeker", {
        replace: true,
      });
    } else if (join_with_others === "true") {
      dispatch(
        addNotVerifiedSeekersIds([
          ...notVerifiedSeekersIds,
          (seekerDataToVerify as SeekerDataToVerify)?.userId,
        ]),
      );
      removeItemInLocalStorage("seekerDataToVerify");
      navigate("/infinipath/joinwithothers", { replace: true });
    } else if (through_search === "true") {
      removeItemInLocalStorage("selectedSeekerDetails");
      navigate("/infinipath/joinwithothers", { replace: true });
    } else if (friendsAndFamily) {
      navigate("/infinipath/friendsandfamily", { replace: true });
    } else if (source === "attendance") {
      navigate("/infinipath/myspace", { replace: true });
    } else {
      setPopupOpen(false);
      setVerificationResult("failed");
      setItemInLocalStorage("verification_status", "failed");
      if (
        seekerData?.role === "mahatria" ||
        seekerData?.role === "admin" ||
        seekerData?.role === "superadmin"
      ) {
        navigate("/admin/infinipath/sessions", { replace: true });
      }
    }
  };

  const handleCancel = () => {
    //Handling the tryagain case
    if (!getItemInLocalStorage("seekerToAdd")) {
      setItemInLocalStorage("seekerToAdd", JSON.stringify(seekerDetailsFromRedux));
    }
    window.location.reload();
  };

  return (
    <div className={styles.container} data-testid="container">
      {verificationResult === "" && cameraFound && (
        <>
          <div className={styles.textDiv} data-testid="text-block">
            {(!updateProfilePicture || popupOpen) && (
              <>
                <p className={styles.text} data-testid="verifying-text">
                  Verifying using face ID
                </p>
                <p className={styles.text2} data-testid="align-face-text">
                  Please align your face within the frame
                  <br /> for an accurate scan.
                </p>
              </>
            )}
            {errorMessage?.length > 0 && !popupOpen ? (
              <>
                <div
                  className={styles.errorMessageContainer}
                  data-testid="error-message-container"
                >
                  <img
                    src={failedIcon}
                    alt="failed"
                    data-testid="failed-icon"
                  />
                  <p
                    className={styles.errorMessage}
                    data-testid="error-message"
                  >
                    {errorMessage}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div
                  className={styles.videoContainer}
                  data-testid="video-container"
                >
                  <video
                    ref={videoRef}
                    width="330"
                    height="400"
                    autoPlay
                    muted
                    style={{
                      objectFit: "cover",
                      borderRadius: "3%",
                    }}
                    data-testid="video-element"
                  />
                  {!capturedImage && (
                    <canvas
                      ref={canvasRef}
                      width="330"
                      height="400"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        borderRadius: "3%",
                        objectFit: "cover",
                      }}
                      data-testid="canvas-element"
                    />
                  )}
                  {scanning && (
                    <div className={styles.scannerAnimation}>
                      <ScannerAnimation />
                      <p>Verifying...</p>
                    </div>
                  )}
                </div>
              </>
            )}
            {(updateProfilePicture || profilePicture) && (
              <Button
                type="button"
                onClick={() => captureImage()}
                buttonClassName={styles.buttonClass}
                datatestid="capture-button"
                datatestidText="capture"
              >
                capture
              </Button>
            )}
            {fromLogin &&
              !updateProfilePicture &&
              errorMessage?.length > 0 &&
              !popupOpen && (
                <>
                  <span
                    className={styles.text3}
                    onClick={() => navigate("/")}
                    data-testid="try-again-link"
                  >
                    try again
                  </span>
                </>
              )}

            <div className={styles.orDiv} data-testid="line-or-text">
              <GrayLine data-testid="gray-line" />
              or
              <GrayLine data-testid="gray-line" />
            </div>

            {fromLogin && !updateProfilePicture ? (
              <>
                <span
                  className={styles.text3}
                  onClick={() => handleSkip()}
                  data-testid="login-with-otp-link"
                >
                  click here to login with OTP
                  <img
                    src={rightArrow}
                    alt="skip"
                    data-testid="right-arrow-icon"
                  />
                </span>
              </>
            ) : updateProfilePicture && !popupOpen ? (
              <>
                <span
                  className={styles.text3}
                  onClick={() => handleSkip()}
                  data-testid="skip-profile-updateLink"
                >
                  click here to skip for now
                  <img
                    src={rightArrow}
                    alt="skip"
                    data-testid="right-arrow-icon"
                  />
                </span>
              </>
            ) : source === "join" ? (
              <>
                <span
                  className={styles.text3}
                  onClick={() => handleSkip()}
                  data-testid="skip-link"
                >
                  skip for now
                </span>
                <div className={styles.joinInfoDiv}>
                  <img
                    src={infoIcon}
                    alt="info-icon"
                    data-testid="info-icon"
                    className={styles.arrowIcon}
                  />
                  <p data-testid="info-message">
                    By clicking skip, you will be marked as ‘unverified’
                  </p>
                </div>
              </>
            ) : (
              !popupOpen && (
                <span
                  className={styles.text3}
                  onClick={() => handleSkip()}
                  data-testid="skip-link"
                >
                  skip
                </span>
              )
            )}
          </div>
        </>
      )}
      {loading && <Loader type="large" data-testid="loading-indicator" />}
      {verificationResult && !profilePicture && (
        <VerificationResultComponent
          status={verificationResult === "success"}
          seekerData={seekerData}
          enrollFaceId={enrollFaceId as any}
          data-testid="verification-result-component"
        />
      )}

      {!cameraFound && (
        <p className={styles.text} data-testid="camera-not-foundText">
          Camera not found!
          <br></br>Your attendance will not be marked.
          <br></br>Please wait, you have been redirected to Infinipath....
        </p>
      )}

      {popupOpen && (
        <CustomPopup
          open={popupOpen}
          title={errorMessage?.length > 0 ? "Error" : "Success"}
          description={popupDescription}
          onConfirm={() => {
            handleSkip();
          }}
          onCancel={handleCancel}
          confirmText={fromLogin ? "sign in using OTP" : "skip for now"}
          cancelText="try again"
          note={note}
          data-testid="custom-popup"
        />
      )}
    </div>
  );
};

export default VerifyUserFace;
