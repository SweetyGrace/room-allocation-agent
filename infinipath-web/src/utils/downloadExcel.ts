export const downloadExcelFromApi = async ({
  url,
  filePrefix = "Registrations",
}: {
  url: string;
  filePrefix?: string;
}) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch the file");
    const blob = await response.blob();
    // const currentDate = new Date();
    // const istOffset = 5.5 * 60 * 60 * 1000;
    // const istDate = new Date(currentDate.getTime() + istOffset);
    // const formattedTime = istDate.toISOString().replace(/:/g, "-");
    const fileName = `${filePrefix}`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading the file:", error);
  }
};
