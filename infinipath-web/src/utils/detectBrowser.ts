export function detectBrowser() {
  const userAgent = navigator.userAgent.toLowerCase();
  const userAgentData = navigator.userAgentData;

  // Check for newer browsers that support userAgentData
  if (userAgentData) {
    const brand = userAgentData.brands.find(
      (brand) => brand.brand !== "Not A(Brand",
    )?.brand;
    if (brand) {
      return brand;
    }
  }

  // Fallback to userAgent string parsing for older browsers
  if (userAgent.indexOf("firefox") > -1) {
    return "Firefox";
  } else if (userAgent.indexOf("opera") > -1 || userAgent.indexOf("opr") > -1) {
    return "Opera";
  } else if (userAgent.indexOf("edge") > -1) {
    return "Microsoft Edge";
  } else if (userAgent.indexOf("chrome") > -1) {
    return "Chrome";
  } else if (userAgent.indexOf("safari") > -1) {
    return "Safari";
  } else if (userAgent.indexOf("trident") > -1) {
    return "Internet Explorer";
  } else {
    return "Unknown";
  }
}
