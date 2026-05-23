import { useState, useEffect, useCallback, useMemo } from "react";
import SideDrawerOverlay from "../SideOverLay";
import styles from "./index.module.scss";
import UserCard from "../SeatApprovalFlow/SeekerDetailsOverlay/Common/UserCards";
import GrayLine from "../../common/components/GrayLine";
import { formatDateWithoutTime } from "../../utils/commonFunctions";
import swapDemanded from '../../assets/images/swap-demand1.svg'
import {
  QUICK_VIEW_OVERLAY,
  LABEL_ANY_HDB_MSD,
  QUICK_VIEW_HEADERS,
} from "../../constants/textConstants";
import {
  SeekerData,
  QuickViewOverlayProps,
  QuickViewHeader,
  FormattedValue,
} from "../../types/registration";
const QuickViewOverlay: React.FC<QuickViewOverlayProps> = ({
  open,
  onClose,
  seekersData,
  quickViewData,
}) => {
  const [quickViewHeaders, setQuickViewHeaders] = useState<QuickViewHeader[]>(
    quickViewData || [],
  );
  const [detailedSeekerData, setDetailedSeekerData] =
    useState<SeekerData | null>(seekersData || null);

  const isEmpty = (value: unknown): boolean => {
    return value === null || value === undefined || value === "";
  };

  const shouldShowBlessedDate = (seekerData?: SeekerData | null): boolean => {
    if (!seekerData) return false;

    const status = seekerData.approvalStatus;

    return (
      typeof status === "string" && status.toLowerCase().trim() === "approved"
    );
  };

  const shouldShowSwapPreference = (seekerData?: SeekerData | null): boolean => {
    if (!seekerData) return false;

    const status = seekerData.approvalStatus;
    const isSwapActive = seekerData.isSwapRequestActive;

    return (
      (typeof status === "string" && status.toLowerCase().trim() === "on_hold") ||
      isSwapActive === true
    );
  };

  const shouldShowSwapDemand = (seekerData?: SeekerData | null): boolean => {
    if (!seekerData) return false;

    const status = seekerData.approvalStatus;

    return (
      (typeof status === "string" && status.toLowerCase().trim() === "on_hold") 
    );
  };

  const formatValue = useCallback(
    (value: unknown, type: string, fieldKey?: string): string => {
      if (fieldKey === "approvalStatus" && detailedSeekerData) {
        const { blessedWith, approvalStatus } = detailedSeekerData;

        if (isEmpty(blessedWith)) {
          const mappedStatus =
            QUICK_VIEW_OVERLAY.STATUS_MAPPING.approvalStatus[
              approvalStatus as keyof typeof QUICK_VIEW_OVERLAY.STATUS_MAPPING.approvalStatus
            ];
          return mappedStatus || (approvalStatus as string) || "-";
        }
        return blessedWith as string;
      }

      if (isEmpty(value)) return "-";

    switch (type) {
      case "date":
        return formatDateWithoutTime(value as string);
      
      case "array":
        if (Array.isArray(value)) {
          if (value.length === 0) return LABEL_ANY_HDB_MSD;
          
              return value
                .slice() // shallow copy to avoid mutating original
                .sort((a, b) => {
                  const orderA = a?.priorityOrder ?? 0;
                  const orderB = b?.priorityOrder ?? 0;
                  return orderA - orderB;
                })
                .map((item) => {
                  if (typeof item === "object" && item !== null) {
                    const obj = item as Record<string, unknown>;
                    return (
                      (obj.preferredProgram as { name?: string })?.name ||
                      obj.name ||
                      obj.label ||
                      obj.value ||
                      String(item)
                    );
                  }
                  return String(item);
                })
                .join(", ");
            }
            return String(value);
          

        case "number":
          return typeof value === "number"
            ? String(value)
            : String(value) || "-";

        default:
          return String(value);
      }
    },
    [detailedSeekerData],
  );

  const formatGroupedValue = useCallback(
    (
      primaryValue: unknown,
      secondaryValue: unknown,
      primaryKey?: string,
      secondaryKey?: string,
    ): FormattedValue => {
      const formattedPrimary = formatValue(primaryValue, "string");
      const formattedSecondary = formatValue(secondaryValue, "string");

      const hasValidPrimary = formattedPrimary !== "-";
      const hasValidSecondary = formattedSecondary !== "-";
     if (primaryKey === "swapDemand" && secondaryKey === "swapDemandComments") {
       // Get the current program from detailedSeekerData
       const currentProgram = detailedSeekerData?.swapDemandFrom;
       const targetProgram = formattedPrimary; // The program they want to swap to
       const comments = formattedSecondary;

       if (!hasValidPrimary && !hasValidSecondary) {
         return { display: "-", hasLineBreak: false };
       }

       const swapDisplay = hasValidPrimary ? (
         <div className={styles.swapDemand}>
           <span>{currentProgram}</span>
           <img
             src={swapDemanded}
             alt="swap arrow"
             className={styles.swapDemandImage}
           />
           <span>{targetProgram}</span>
         </div>
       ) : (
         "-"
       );

       if (hasValidPrimary && hasValidSecondary) {
         return {
           display: {
             primary: swapDisplay,
             secondary: comments,
           },
           hasLineBreak: true,
         };
       }

       if (hasValidPrimary) {
         return { display: swapDisplay, hasLineBreak: false };
       }

       // Only comments available
       return { display: comments, hasLineBreak: false };
     }

      if (primaryKey === "averageRating" && secondaryKey === "rmComments") {
        if (!hasValidSecondary) {
          return { display: "-", hasLineBreak: false };
        }
        if (hasValidPrimary && hasValidSecondary) {
          return {
            display: {
              primary: formattedPrimary,
              secondary: formattedSecondary,
            },
            hasLineBreak: true,
          };
        }
        return { display: formattedSecondary, hasLineBreak: false };
      }

      if (!hasValidPrimary && !hasValidSecondary) {
        return { display: "-", hasLineBreak: false };
      }

      if (!hasValidPrimary) {
        return { display: formattedSecondary, hasLineBreak: false };
      }

      if (!hasValidSecondary) {
        return { display: formattedPrimary, hasLineBreak: false };
      }

      return {
        display: { primary: formattedPrimary, secondary: formattedSecondary },
        hasLineBreak: true,
      };
    },
    [formatValue],
  );

  const processHeaders = useMemo((): QuickViewHeader[] => {
    const processedHeaders: QuickViewHeader[] = [];
    const processedKeys = new Set<string>();

    const sortedHeaders = quickViewHeaders
      .sort((a, b) => parseInt(a.order || "0") - parseInt(b.order || "0"))
      .filter(
        (header) =>
          !QUICK_VIEW_OVERLAY.EXCLUDED_FIELDS.includes(header.key as any),
      )
      .filter((header) => {
        if (header.key === "blessedDate") {
          return shouldShowBlessedDate(detailedSeekerData);
        }
        if (header.key === QUICK_VIEW_HEADERS.swapPreference) {
          return shouldShowSwapPreference(detailedSeekerData);
        }
        if (header.key === QUICK_VIEW_HEADERS.swapDemand) {
          return shouldShowSwapDemand(detailedSeekerData);
        }
        return true;
      });

    for (const header of sortedHeaders) {
      if (processedKeys.has(header.key)) continue;

      const groupConfig = Object.values(QUICK_VIEW_OVERLAY.GROUPED_FIELDS).find(
        (config) =>
          config.primaryKey === header.key ||
          config.secondaryKey === header.key,
      );

      if (groupConfig) {
        if (
          groupConfig.primaryKey === "blessedDate" ||
          groupConfig.secondaryKey === "blessedDate"
        ) {
          if (!shouldShowBlessedDate(detailedSeekerData)) {
            processedKeys.add(groupConfig.primaryKey);
            processedKeys.add(groupConfig.secondaryKey);
            continue;
          }
        }

        if (
          groupConfig.primaryKey === QUICK_VIEW_HEADERS.swapPreference ||
          groupConfig.secondaryKey === QUICK_VIEW_HEADERS.swapPreference
        ) {
          if (!shouldShowSwapPreference(detailedSeekerData)) {
            processedKeys.add(groupConfig.primaryKey);
            processedKeys.add(groupConfig.secondaryKey);
            continue;
          }
        }

        if (
          groupConfig.primaryKey === QUICK_VIEW_HEADERS.swapDemand ||
          groupConfig.secondaryKey === QUICK_VIEW_HEADERS.swapDemand
        ) {
          if (!shouldShowSwapDemand(detailedSeekerData)) {
            processedKeys.add(groupConfig.primaryKey);
            processedKeys.add(groupConfig.secondaryKey);
            continue;
          }
        }
 

        const primaryHeader = sortedHeaders.find(
          (h) => h.key === groupConfig.primaryKey,
        );
        const secondaryHeader = sortedHeaders.find(
          (h) => h.key === groupConfig.secondaryKey
        );

        if (primaryHeader || secondaryHeader) {
          processedHeaders.push({
            key: groupConfig.groupedKey,
            label: groupConfig.label,
            type: "grouped",
            order: primaryHeader?.order || secondaryHeader?.order,
            primaryKey: groupConfig.primaryKey,
            secondaryKey: groupConfig.secondaryKey,
          });

          processedKeys.add(groupConfig.primaryKey);
          processedKeys.add(groupConfig.secondaryKey);
        }
      } else {
        processedHeaders.push(header);
        processedKeys.add(header.key);
      }
    }

    return processedHeaders;
  }, [quickViewHeaders, detailedSeekerData]);

  const { gridHeaders, singleColumnHeaders } = useMemo(
    () => ({
      gridHeaders: processHeaders.filter(
        (header) =>
          !QUICK_VIEW_OVERLAY.SINGLE_COLUMN_FIELDS.includes(header.key as any),
      ),
      singleColumnHeaders: processHeaders.filter((header) =>
        QUICK_VIEW_OVERLAY.SINGLE_COLUMN_FIELDS.includes(header.key as any),
      ),
    }),
    [processHeaders],
  );

  useEffect(() => {
    setQuickViewHeaders(quickViewData);
    setDetailedSeekerData(seekersData || null);
  }, [seekersData, quickViewData]);

  const handleClose = useCallback(() => {
    setQuickViewHeaders([]);
    setDetailedSeekerData(null);
    onClose();
  }, [onClose]);

  const renderValue = (value: string | FormattedValue) => {
    if (
      typeof value === "object" &&
      value.hasLineBreak &&
      typeof value.display === "object"
    ) {
      return (
        <>
          <p>{value.display.primary}</p>
          <p>{value.display.secondary}</p>
        </>
      );
    }
    return typeof value === "object" ? value.display : value;
  };

  const renderSingleColumnValue = (
    value: string | FormattedValue,
    header: QuickViewHeader,
  ) => {
    if (
      typeof value === "object" &&
      value.hasLineBreak &&
      typeof value.display === "object"
    ) {
      if (header.primaryKey === "averageRating") {
        return <div>{value.display.secondary}</div>;
      }
      return (
        <>
          <div>{value.display.primary}</div>
          <div className={styles.recommendationGap}>
            {value.display.secondary}
          </div>
        </>
      );
    }
    return typeof value === "object" ? value.display : value;
  };

  const renderGridItem = (header: QuickViewHeader) => {
    if (!detailedSeekerData) return null;

    const value =
      header.type === "grouped" && header.primaryKey && header.secondaryKey
        ? formatGroupedValue(
            detailedSeekerData[header.primaryKey],
            detailedSeekerData[header.secondaryKey],
            header.primaryKey,
            header.secondaryKey,
          )
        : formatValue(
            detailedSeekerData[header.key],
            header.type || "string",
            header.key,
          );

    return (
      <div key={header.key} className={styles.detailItem}>
        <span className={styles.detailLabel}>{header.label}</span>
        <span className={styles.detailValue}>{renderValue(value)}</span>
      </div>
    );
  };

  const renderSingleColumnItem = (header: QuickViewHeader, index: number) => {
    if (!detailedSeekerData) return null;

    const value =
      header.type === "grouped" && header.primaryKey && header.secondaryKey
        ? formatGroupedValue(
            detailedSeekerData[header.primaryKey],
            detailedSeekerData[header.secondaryKey],
            header.primaryKey,
            header.secondaryKey,
          )
        : formatValue(
            detailedSeekerData[header.key],
            header.type || "string",
            header.key,
          );

    return (
      <div
        key={header.key}
        className={`${styles.singleColumnItem} ${index > 0 ? styles.withTopMargin : ""}`}
      >
        <span className={styles.detailLabel}>
          {header.label}
          {header.type === "grouped" &&
            header.primaryKey === "averageRating" && (
              <span className={styles.ratingValue}>
                {formatValue(detailedSeekerData[header.primaryKey], "string")}
              </span>
            )}
        </span>
        <span
          className={`${styles.detailValue} ${styles.singleColumnDetailValue}`}
        >
          {renderSingleColumnValue(value, header)}
        </span>
      </div>
    );
  };

  if (!open) return null;

  const hasValidSeekerData =
    seekersData &&
    typeof seekersData === "object" &&
    Object.keys(seekersData).length > 0;

  const hasProcessedHeaders = processHeaders.length > 0 && detailedSeekerData;

  return (
    <SideDrawerOverlay
      open={open}
      grayLine={true}
      onClose={handleClose}
      headerText={QUICK_VIEW_OVERLAY.QUICK_VIEW_HEADING}
    >
      <div className={styles.quickViewForm}>
        {hasValidSeekerData && (
          <UserCard seeker={seekersData} disablePreferences={true} />
        )}

        <div className={styles.filterlabelName}>
          {QUICK_VIEW_OVERLAY.DETAILS_HEADING} <GrayLine />
        </div>

        {hasProcessedHeaders ? (
          <>
            {gridHeaders.length > 0 && (
              <div className={styles.detailsGrid}>
                {gridHeaders.map(renderGridItem)}
              </div>
            )}
            {singleColumnHeaders.length > 0 && (
              <div className={styles.singleColumnContainer}>
                {singleColumnHeaders.map(renderSingleColumnItem)}
              </div>
            )}
          </>
        ) : (
          <div className={styles.noDataMessage}>
            {QUICK_VIEW_OVERLAY.NO_DATA_MESSAGE}
          </div>
        )}
      </div>
    </SideDrawerOverlay>
  );
};

export default QuickViewOverlay;
