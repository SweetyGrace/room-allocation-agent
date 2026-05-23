export async function downloadPdf(fileUrl: string, name: string|undefined): Promise<void> {
  try {
    // Extract the file name from the URL
    const urlParts = fileUrl.split("/");
    const originalFileName = urlParts[urlParts.length - 1]; // Get the last part of the URL
    const timestamp = new Date().toISOString().replace(/[:.-]/g, "_"); // Format timestamp
    let fileNameWithTimestamp = `${originalFileName.split(".")[0]}.pdf`; // Append timestamp
    if (name) {
      fileNameWithTimestamp = `${name}.pdf`;
    }

    const response = await fetch(fileUrl, { method: "GET" });
    if (!response.ok) throw new Error("Network response was not ok");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileNameWithTimestamp;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading file:", error);
    alert("Failed to download the file. Please try again later.");
  }
}