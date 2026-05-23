//extract Zak from strat URL
export function extractZak(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const zakParam = parsedUrl.searchParams.get("zak");

    if (!zakParam) {
      throw new Error("zak parameter not found in the URL");
    }

    return zakParam;
  } catch (error) {
    console.error("Error extracting zak:", error);
    return "";
  }
}

//extract tk from join URL
export function extractTk(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const tkParam = parsedUrl.searchParams.get("tk");

    if (!tkParam) {
      throw new Error("tk parameter not found in the URL");
    }

    return tkParam;
  } catch (error) {
    console.error("Error extracting tk:", error);
    return "";
  }
}
