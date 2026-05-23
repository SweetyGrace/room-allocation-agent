export const checkForCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput",
    );
    if (videoDevices.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking for camera:", error);
    return false;
  }
};
