import {
  CompareFacesCommand,
  RekognitionClient,
  SearchFacesByImageCommand,
} from "@aws-sdk/client-rekognition";
import { getItemInLocalStorage, setItemInLocalStorage } from "./localStorage";
import { patchCall } from "./apiService";
import { endPoints, PORTAL } from "../constants/urlConstants";
import { handleAWSFileUpload } from "../pages/RegisteredSeekersDetails/service";

const BUCKET_NAME = process.env.REACT_APP_AWS_BUCKET_NAME;
// const COLLECTION_ID = process.env.REACT_APP_AWS_COLLECTION_ID;

// const s3Client = new S3Client({
//   region: process.env.REACT_APP_AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
//   },
// });

const rekognitionClient = new RekognitionClient({
  region: process.env.REACT_APP_AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY as string,
  },
});

const blobToFile = (theBlob: Blob, fileName: string): File => {
  // A Blob() is almost a File() - it's just missing the two properties below which we will add
  const file = new File([theBlob], fileName, { type: "image/jpeg" });
  return file; // Return the newly created File object
};

/**
 * Uploads an image to AWS S3 and returns the URL of the uploaded image.
 * @param {File} imageFile - The image file to upload.
 * @param {string} path - The path in the S3 bucket where the image will be stored.
 * @param {function} completion - A callback function that will be called with the status of the upload.
 */
export const uploadImageToS3 = async (
  imageFile: File,
  _path: string,
  completion: (status: boolean) => void,
  fromLogin?: boolean,
  updateProfilePicture?: boolean,
  enrollFaceId?: boolean,
  through_search?: boolean,
  join_with_others?: boolean,
  seekerToVerify?: { faceUrl?: string },
  profilePicture?: boolean,
  newSeekerCapture?: boolean,
  nonInfinipathSeeker?: boolean,
  friendsAndFamily?: boolean,
) => {
  const seekerData = getItemInLocalStorage("seekerDetails") || {};
  const selectedFriendOrFamilyData =
    getItemInLocalStorage("selectedFriendOrFamily") || {};
  const selectedSeekerData =
    getItemInLocalStorage("selectedSeekerDetails") || {};
  const seekerDataToVerify: { faceUrl?: string } = seekerToVerify || {};
  try {
    // const fileName = `${path}/${crypto.randomUUID()}.jpeg`; // Generate unique file name
    // const uploadParams = {
    //   Bucket: BUCKET_NAME,
    //   Key: fileName,
    //   Body: imageFile,
    //   ContentType: "image/jpeg",
    // };

    // // Using AWS SDK to upload the image
    // const upload = new Upload({
    //   client: s3Client,
    //   params: uploadParams,
    // });

    // await upload.done();

    // Construct the URL of the uploaded image
    // const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    // Call the completion callback with the image URL

    // const urlPayload = url?.split(".com/")[1];
    const imagefileurl = await blobToFile(imageFile, "profile.jpeg"); // Convert the Blob to a File object

    const url = await handleAWSFileUpload(imagefileurl).then(url => {
      return url
    }).catch(error =>{
      console.error(error)
      return null;
    });

    /**Setting up the target image url based on the flow to verify the face */
    const targetImageUrl = friendsAndFamily
      ? selectedFriendOrFamilyData?.faceUrl?.split("com/")[1]
      : through_search
        ? selectedSeekerData?.faceUrl?.split("com/")[1]
        : join_with_others
          ? seekerDataToVerify?.faceUrl?.split("com/")[1]
          : seekerData?.faceUrl?.split("com/")[1];

    if (fromLogin || enrollFaceId || newSeekerCapture || nonInfinipathSeeker) {
      // searchFacesByImage(
      //   BUCKET_NAME,
      //   url,
      //   COLLECTION_ID,
      //   1,
      //   70.0,
      //   completion,
      //   enrollFaceId,
      //   updateProfilePicture,
      //   url,
      //   newSeekerCapture,
      //   nonInfinipathSeeker,
      // );
    } else if (profilePicture) {
      completion(url as any);
    } else if (updateProfilePicture) {
        handleUploadProfilePicture(
          url || "",
          completion,
          updateProfilePicture,
          enrollFaceId,
        );
      } else {
        compareTwoImages(targetImageUrl, "", 70.0, completion); // removed urlPayload as it is commented at line no. 87
    }
  } catch (error) {
    console.error("Upload failed: ", error);
    // completion(null);
  }
};

/**
 * Searches for faces in an image in an AWS Rekognition collection which will be used for login
 * @param {string} bucketName - The name of the S3 bucket containing the image.
 * @param {string} imageName - The name of the image file in the S3 bucket.
 * @param {string} collectionId - The ID of the Rekognition collection to search.
 * @param {number} maxFaces - The maximum number of faces to return.
 * @param {number} faceMatchThreshold - The confidence threshold for face matches.
 * @param {function} completion - A callback function that will be called with the face ID if found.
 */
export const searchFacesByImage = async (
  bucketName: string,
  imageName: string,
  collectionId: string,
  maxFaces = 1,
  faceMatchThreshold: number,
  completion: (faceId: string) => void,
  enrollFaceId?: boolean,
  updateProfilePicture?: boolean,
  url?: string, 
  newSeekerCapture?: boolean,
  nonInfinipathSeeker?: boolean,
) => {
  try {
    const params = {
      CollectionId: collectionId,
      Image: {
        S3Object: {
          Bucket: bucketName,
          Name: imageName,
        },
      },

      MaxFaces: maxFaces,
      FaceMatchThreshold: faceMatchThreshold,
    };

    const command = new SearchFacesByImageCommand(params);
    const response = await rekognitionClient.send(command);

    if (response && response.FaceMatches) {
      const faceIds = response.FaceMatches.sort(
        (a, b) => (b.Face?.Confidence || 0) - (a.Face?.Confidence || 0),
      ).map((match) => match?.Face?.FaceId);

      if (faceIds?.length > 0) {
        //Face ID existing, so show the error popup
        completion(faceIds[0] || "");
      } else {
        //Face ID not existing, so update the face ID or if it is profile picture update it
        if (enrollFaceId && url) {
          handleUploadProfilePicture(
            imageName,
            completion as any,
            updateProfilePicture,
            enrollFaceId,
          );
          return;
        } else if (newSeekerCapture || nonInfinipathSeeker) {
            completion(url || "");
          return;
        }
          completion(faceIds[0] || "");
      }
    } 
  } catch (error) {
    console.error(error, "error");
  }
};

/**
 * Compares two images and returns the similarity status
 * @param {string} sourceImageName - The name of the source image file in the S3 bucket.
 * @param {string} targetImageName - The name of the target image file in the S3 bucket.
 * @param {number} similarityThreshold - The confidence threshold for face matches.
 * @param {function} completion - A callback function that will be called with the similarity status.
 * @returns {Promise<boolean>} - A promise that resolves to the similarity status.
 */
export const compareTwoImages = async (
  sourceImageName: string,
  targetImageName: string,
  similarityThreshold: number,
  completion: (status: boolean) => void,
): Promise<boolean> => {
  if (!sourceImageName || !targetImageName) {
    /**When face Id not enrolled target image will not be there, hence making verification failed */
    completion(false);
  }

  if (similarityThreshold < 0 || similarityThreshold > 100) {
    throw new Error("Similarity threshold must be between 0 and 100");
  }

  try {
    const params = {
      SourceImage: {
        S3Object: {
          Bucket: BUCKET_NAME,
          Name: sourceImageName,
        },
      },
      TargetImage: {
        S3Object: {
          Bucket: BUCKET_NAME,
          Name: targetImageName,
        },
      },
      SimilarityThreshold: similarityThreshold,
    };


    const command = new CompareFacesCommand(params);
    const response = await rekognitionClient.send(command);


    // Check if FaceMatches array has at least one object
    completion(response.FaceMatches && response.FaceMatches.length > 0 || false);
    return response.FaceMatches && response.FaceMatches.length > 0 || false;
  } catch (error) {
    console.error("Error comparing faces:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    // Return false in case of an error
    completion(false);
    return false;
  }
};

/**
 * updates the user details in the database
 * @param {string} imageName - The name of the image file in the S3 bucket.
 * @param {function} completion - A callback function that will be called with the status of the upload.
 * @param {boolean} updateProfilePicture - A boolean value indicating whether the profile picture is being updated.
 * @param {boolean} enrollFaceId - A boolean value indicating whether the face ID is being enrolled.
 */
const handleUploadProfilePicture = (
  imageName: string,
  completion: (status: boolean) => void,
  updateProfilePicture?: boolean,
  enrollFaceId?: boolean,
) => {
  const seekerData = getItemInLocalStorage("seekerDetails") || {};
  const NewFaceUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${imageName}`;

  const updateUserPayload = {
    appType: "infinipath",
    ...(updateProfilePicture ? { profileUrl: imageName } : {}),
    ...(enrollFaceId ? { faceUrl: NewFaceUrl } : {}),
  };
  patchCall(`${endPoints.profile}/${seekerData?.id}`, updateUserPayload, PORTAL)
    .then((res) => {
      if (
        res?.data?.statusCode === 200 ||
        res?.data?.data?.statusCode === 200
      ) {
        if (enrollFaceId) {
          updateLocalStorage(res?.data?.data?.faceUrl, completion);
        } else {
          completion(true);
        }
      } else {
        completion(false);
      }
    })
    .catch(() => {
      completion(false);
    });
};

/**This function using to update seekerDetails in localstorage, once face_url is updated */
const updateLocalStorage = (
  new_face_url: string,
  completion: (status: boolean) => void,
) => {
  const seekerData = getItemInLocalStorage("seekerDetails") || {};
  const updatedSeekerData = { ...seekerData, faceUrl: new_face_url };
  setItemInLocalStorage("seekerDetails", updatedSeekerData);
  completion(false);
};
