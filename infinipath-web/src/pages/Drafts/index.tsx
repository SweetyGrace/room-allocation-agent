import React, { lazy, useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import DashboardHeader from "../../common/components/DashboardHeader";
import DataGridWithPagination from "../../common/components/DataGridWithPagination";
import { getCall } from "../../services/apiService";
import { colorizeMahatriaInfinitheism } from "../../common/components/ColorizeMahatriaInfinitheism";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import styles from "./index.module.scss";
import { PORTAL } from "../../constants/urlConstants";
import { downloadExcelFromApi } from "../../utils/downloadExcel";
import { DOWNLOAD_ERRORS } from "../../constants/textConstants";

// Lazy load overlay components
const AlertPopup = lazy(() => import("../../common/components/AlertPopup"));
const ImagePreview = lazy(() => import("../../common/components/ImagePreview"));

const Drafts = () => {
  const location = useLocation();
  const { programId: paramProgramId } = useParams<{ programId?: string }>();
  const programId = location.state?.programId || paramProgramId;

  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState({ value: "", open: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState<{ message: string; open: boolean }>({
    message: "",
    open: false,
  });
  const [previewImageUrl, setPreviewImageUrl] = useState({
    image: "",
    altText: "",
  });
  const [open, setOpen] = useState(false);

  const fetchDraftsList = async () => {
    setLoading(true);
    try {
      let url = `registration/drafts?limit=${pageSize}&offset=${(currentPage - 1) * pageSize}`;
      if (programId) url += `&programId=${programId}`;
      if (searchQuery && searchQuery.trim()) {
        url += `&searchText=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await getCall(url, undefined, PORTAL);
      const rawData = res?.data?.data?.data || [];
      const tableHeaders = res?.data?.data?.tableHeaders || [];
      const pagination = res?.data?.data?.pagination || {};
      setData(rawData);
      setColumns(buildDynamicColumns(tableHeaders));
      setTotalData(pagination.totalRecords || 0);
    } catch {
      setData([]);
      setColumns([]);
      setTotalData(0);
    } finally {
      setLoading(false);
    }
  };

  const buildDynamicColumns = (tableHeaders: any[]) => {
    const filteredHeaders = tableHeaders.filter(
      (header: any) =>
        header.key !== "profileUrl" &&
        header.label?.toLowerCase() !== "profile url",
    );

    const widthMap: Record<string, number> = {
      seekerName: 230,
      rmContact: 230,
      gender: 100,
      age: 100,
      location: 120,
      mobileNumber: 180,
      emailAddress: 230,
      numberOfHDBs: 130,
    };

    const cols = filteredHeaders.map((header: any) => ({
      field: header.key,
      headerName: header.label,
      sortable: header.sortable,
      width: widthMap[header.key] !== undefined ? widthMap[header.key] : 130,
      renderCell: (params: any) => {
        const value = params.row[header.key] ?? "-";

        if (["seekerName", "fullName", "name"].includes(header.key)) {
          return (
            <span
              style={{
                width: widthMap[header.key] || 230,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              title={value}
            >
            <div className={styles.imageContainer}>
              <img
                src={params.row.profileUrl || defaultProfileIcon}
                alt={value}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: 8,
                  background: "#f0f0f0",
                  border: "1px solid #eee",
                  cursor: "pointer",
                }}
                 onClick={(e) => handleImageClick(e, params.row)} 
              />
              <div
                className={styles.hoverEyePreview}
                onClick={(e) => handleImageClick(e, params.row)}
              ></div>
            </div>
              <span
                title={value}
                className={styles.seekerNameText}
              >
                {value}
              </span>
            </span>
          );
        }

        return (
          <span
            style={{
              maxWidth: widthMap[header.key] ,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              verticalAlign: "middle",
              
            }}
            title={typeof value === "string" ? value : ""}
          >
            {value === null || value === undefined || value === ""
              ? "-"
              : value}
          </span>
        );
      },
    }));

    return cols;
  };

  const handleDownload = async (reportName: string, selectedReport?: string) => {
    setLoading(true);
    try {
      let url = `registration/drafts?limit=${pageSize}&offset=${(currentPage - 1) * pageSize}`;
      if (programId) url += `&programId=${programId}`;
      url += `&downloadType=drafts_report`;

      const response = await getCall(url, undefined, PORTAL);
      const statusCode = response?.data?.statusCode;
      const message = response?.data?.message;
      const downloadUrl = response?.data?.data?.downloadUrl;

      if (statusCode >= 400 && statusCode < 500) {
        setAlert({
          message: message || DOWNLOAD_ERRORS.GENERIC,
          open: true,
        });
        return;
      }
      if (statusCode >= 500) {
        setAlert({
          message: DOWNLOAD_ERRORS.GENERIC,
          open: true,
        });
        return;
      }
      
      
      await downloadExcelFromApi({
        url: downloadUrl,
        filePrefix: reportName,
      });
    } catch (error: any) {
      setAlert({
        message: DOWNLOAD_ERRORS.GENERIC,
        open: true,
      });
      console.error("Error downloading drafts report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent, row: any) => {
    e.stopPropagation();
    setPreviewImageUrl({
      image: row.profileUrl || defaultProfileIcon,
      altText: row.fullName || row.seekerName || "Profile Image",
    });
    setOpen(true);
  };

  useEffect(() => {
    fetchDraftsList();
    // eslint-disable-next-line
  }, [pageSize, currentPage, searchQuery, programId]);

  return (
    <div className={styles.draftsContainer}>
      <DashboardHeader
        title={` ${totalData} seekers`}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        isDraftsPage={true}
        onSearch={(val) => setSearchQuery(val)}
        enableExport={true}
        onSearchValueChange={(value: string) =>
          setSearchValue((prev) => ({ ...prev, value }))
        }
        totalDataLength={totalData}
        handleDownload={handleDownload}
      />

      {alert.open && (
        <AlertPopup
          message={alert.message}
          confirmText="ok"
          onConfirm={() => setAlert({ ...alert, open: false })}
          type="warning"
        />
      )}

      <DataGridWithPagination
        headers={columns}
        seekersData={data.map((items) => ({
          ...items,
          seekerName: colorizeMahatriaInfinitheism(items.seekerName),
          emailAddress : colorizeMahatriaInfinitheism(items.emailAddress),
        }))}
        totalData={totalData}
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        loading={loading}
      />

      <ImagePreview
        imageUrl={previewImageUrl.image}
        altText={previewImageUrl.altText}
        setOpen={setOpen}
        isOpen={open}
        width={600}
        height={400}
      />
    </div>
  );
};

export default Drafts;