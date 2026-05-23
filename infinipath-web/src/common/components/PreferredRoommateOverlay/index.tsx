import React, { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { endPoints } from "../../../constants/urlConstants";
import { getCallApi } from "../../../services/apiService";
import SeekerOccupantCard from "../../../components/SeekerOccupantCard";
import Loader from "../Loader";
import Drawer from "@mui/material/Drawer";
import { X } from "lucide-react";
import { PreferredRoommateOverlayProps , SeekerData} from "../../../types/roomAllocation";
import { PREFERRED_ROOMMATE_MESSAGES } from "../../../constants/textConstants";
import { pairYetToAssignSeekers } from "../../../components/AllocateRooms/allocateRoomsUtils";

const ERROR_CODES = [400, 401, 403, 404, 500] as const;

const PreferredRoommateOverlay: React.FC<PreferredRoommateOverlayProps> = ({
  isOpen,
  onClose,
  preferredName,
  seekerId,
  programId,
  subProgramId,
  setToastState,
  roommateOverlayDetails,
  setCheckReload,
  setSeekerLoading,
}) => {
  const [seekers, setSeekers] = useState<SeekerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeeker, setSelectedSeeker] = useState<number | null>(null);

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams({
      programId: String(programId),
      search: preferredName,
      limit: "100",
      offset: "0",
    });

    if (subProgramId) {
      params.append("subProgramId", String(subProgramId));
    }

    return `${endPoints.preferredRoommate}?${params}`;
  }, [programId, subProgramId, preferredName]);

  const showError = useCallback(
    (message: string) => {
      setToastState({ open: true, message });
      setSeekers([]);
    },
    [setToastState]
  );

  const fetchPreferredRoommates = useCallback(async () => {
    try {
      setLoading(true);
      const url = buildApiUrl();
      const response = await getCallApi(url);

      if (!response?.data) {
        setSeekers([]);
        return;
      }

      const { data: responseData } = response;

      // Check for error status codes
      if (
        ERROR_CODES.includes(responseData.statusCode) ||
        responseData.success === false
      ) {
        showError(
          responseData.message ||
            responseData.error ||
            "Error fetching preferred roommates"
        );
        return;
      }

      // Validate response structure
      const seekersData = responseData.data?.data;
      if (!Array.isArray(seekersData) || seekersData.length === 0) {
        setSeekers([]);
        return;
      }

      // Filter out current seeker
      const filteredSeekers = seekersData.filter(
        (seeker: SeekerData) => Number(seeker.id) !== Number(seekerId)
      );

      setSeekers(filteredSeekers);
    } catch (error: any) {
      showError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Error fetching preferred roommates"
      );
    } finally {
      setLoading(false);
    }
  }, [buildApiUrl, seekerId, showError]);

  useEffect(() => {
    if (isOpen && preferredName) {
      fetchPreferredRoommates();
    }
  }, [isOpen, preferredName, fetchPreferredRoommates]);

  const calculateAge = useCallback((dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }, []);

  const handlePair = (seekerId: number | string) => {
    const selectedSeekers = [
      { id: Number(seekerId) },
      { id: Number(roommateOverlayDetails?.user?.programRegistrationId) },
    ];
    pairYetToAssignSeekers(
      selectedSeekers,
      setCheckReload,
      undefined,
      undefined,
      programId,
      subProgramId,
      onClose,
      setToastState={setToastState}
    );
  };

  const abbreviateGender = useCallback((gender: string): string => {
    return gender ? gender.charAt(0).toUpperCase() : "N/A";
  }, []);

  const handleCardClick = useCallback((id: number) => {
    setSelectedSeeker((prev) => (prev === id ? null : id));
  }, []);

  const modalClassName = useMemo(
    () => `${styles.seekerDetailsModal} ${isOpen ? styles.open : ""}`,
    [isOpen]
  );

  if (!isOpen) return null;

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <div className={styles.seekerOverlay}>
        <div className={modalClassName}>
          <div className={styles.modalHeader}>
            <span className={styles.modalTitle}>
              {PREFERRED_ROOMMATE_MESSAGES.HEADER} {preferredName}
            </span>
            <X size={24} onClick={onClose} className={styles.closeButton} />
          </div>
          <div className={styles.modalContent}>
            {loading ? (
              <div className={styles.loaderContainer}>
                <Loader type="small" />
              </div>
            ) : seekers.length === 0 ? (
              <div className={styles.noDataContainer}>
                <p className={styles.noDataText}>
                  {PREFERRED_ROOMMATE_MESSAGES.NO_MATCHES} "{preferredName}"
                </p>
              </div>
            ) : (
              <div className={styles.seekersGrid}>
                {seekers.map((seeker) => (
                  <SeekerOccupantCard
                    key={seeker.id}
                    occupantProfile={seeker.profileUrl || null}
                    occupantGender={abbreviateGender(seeker.gender)}
                    occupantName={seeker.fullName || "N/A"}
                    occupantAge={calculateAge(seeker.dob)}
                    occupantCity={
                      seeker.city === "other"
                        ? seeker.otherCityName || "N/A"
                        : seeker.city || "N/A"
                    }
                    isClicked={selectedSeeker === seeker.id}
                    onCardClick={() => handleCardClick(seeker.id)}
                    setIsClicked={() => {}}
                    seekerPaired={false}
                    preferredRoomMate={seeker.preferredRoomMate || null}
                    seekerId={seeker.id}
                    hideRoommatePreference={true}
                    seekerDetails={seeker}
                    showPair={roommateOverlayDetails?.user?.pairCode === null}
                    handlePair={handlePair}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default PreferredRoommateOverlay;