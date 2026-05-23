import React, { useState, useRef, useEffect } from "react";
import dragIcon from "../../assets/images/drag-icon.svg";
import styles from "./index.module.scss";
import defaultImage from "../../assets/images/default-profile.svg";
// import selectedImage from "../../assets/images/checkbox-selection.svg";
import dragIconFilled from "../../assets/images/drag-icon-filled.svg";
import dotsIcon from "../../assets/images/menu.svg";
import { Avatar, Tooltip } from "@mui/material";
import ImagePreview from "../../common/components/ImagePreview";
import RoommatePreferencePopup from "../HdbDotPopover";
import { formatDateTimeUniversal } from "../../utils/commonFunctions";
import { HDB_LABEL } from "../../constants";
import { SeekerData } from "../../types/roomAllocation";
import { GENDER_MALE, textConstant } from "../../constants/textConstants";
import { formatHDBCount } from "../AllocateRooms/allocateRoomsUtils";

export interface OccupantDetailsProps {
  occupantProfile: string | null;
  occupantGender: string;
  occupantName: string;
  occupantAge: number;
  occupantCity: string;
  isClicked: boolean;
  onCardClick: () => void;
  seekerPaired: boolean;
  preferredRoomMate?: string | null;
  seekerId?: number | string;
  onShowMatches?: (preferredName: string, seekerId: string | number) => void;
  hideRoommatePreference?: boolean;
  rmContactUser?: { fullName: string } | null;
  departureDatetime?: string | null; 
  noOfHDBs?: number; 
  seekerDetails?:SeekerData;
  showPair?: boolean;
  handlePair?: (seekerId: number | string) =>void;
}

const SeekerOccupantCard: React.FC<OccupantDetailsProps> = ({
  occupantProfile,
  occupantGender,
  occupantName,
  occupantAge,
  occupantCity,
  isClicked,
  onCardClick,
  preferredRoomMate,
  seekerId,
  onShowMatches,
  hideRoommatePreference = false,
  rmContactUser, 
  departureDatetime,
  noOfHDBs, 
  seekerDetails,
  showPair,
  handlePair,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState({
    image: "",
    altText: "",
  });
  const [open, setOpen] = useState(false);
  const [showRoommatePopup, setShowRoommatePopup] = useState(false);
  
  const popupLeaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const dotElementRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef(null);
  const [inView, setInView] = useState(false);

console.log("preferredRoomMate", preferredRoomMate);

  // Image click handler
  const handleImageClick = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    setPreviewImageUrl({
      image: user.profileImage || defaultImage,
      altText: user.fullName || "Profile Image",
    });
    setOpen(true);
  };

  const handleMouseEnter = () => {
    if (!isClicked) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isClicked) setIsHovered(false);
  };

  // Intersection Observer for tooltips
  const cb = (entries) => {
    const [entry] = entries;
    entry.isIntersecting ? setInView(true) : setInView(false);
  };

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
    };
    const ref = tipRef.current;
    const observer = new IntersectionObserver(cb, options);

    if (ref) observer.observe(ref);

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [tipRef]);

  // Handle roommate popup positioning and click outside
  useEffect(() => {
    if (!showRoommatePopup) return;

   const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        dotElementRef.current?.contains(target) ||
        target.closest(`.${styles.roommatePopupWrapper}`)
      ) {
        return;
      }

      setShowRoommatePopup(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRoommatePopup]);
   const handleShowMatches = () => {
    console.log("handleShowMatches called", preferredRoomMate);
    onShowMatches && onShowMatches(preferredRoomMate!, seekerId!);
  };
  const getCardBackgroundColor = () => {
      console.log("Gender:", occupantGender);
    if (occupantGender === "F") return "#EEE9FD";
    if (occupantGender === "M") return "#E4F4FC";
    return ""; 
  };

  // Format departure time
  const displayRmContact = rmContactUser?.fullName || null;
  const displayDepartureTime = departureDatetime 
  ? formatDateTimeUniversal(departureDatetime, 'dateTime24HrFormat')
  : null;
  const displayNoOfHDBs = noOfHDBs !== undefined ? noOfHDBs : 0;

  // Check if pair button should be shown
  const shouldShowPairButton = 
    showPair && 
    seekerDetails?.allocationId === null && 
    seekerDetails?.pairCode === null;

  const handlePairClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePair && handlePair(seekerId);
  };

  return (
    <div className={styles.cardContainer} onClick={onCardClick}>
      <div
        className={`${styles.occupantCard} ${isClicked ? occupantGender === "M" ? styles.clickedborder: styles.femaleclickedborder : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={
            `${styles.occupantDetails}` +
            (isClicked ? ` ${styles.occupantDetailsColor}` : "")
          }
          style={{
            borderBottomLeftRadius: isHovered || isClicked ? "0px" : "2px",
            borderTopLeftRadius: isHovered || isClicked ? "0px" : "2px",
          }}
        >
          <div className={styles.profileContainer}>
            <div className={styles.profileDots}>
              <div className={styles.profileContainer}>
                <div className={styles.imageContainer}>
                  <Avatar
                    alt="Remy Sharp"
                    src={
                      occupantProfile?.length > 0
                        ? occupantProfile
                        : defaultImage
                    }
                    sx={{ width: 64, height: 64, border: "1px solid #DDDDDD" }}
                  />
                  <div
                    className={styles.hoverEyePreview}
                    onClick={(e) =>
                      handleImageClick(e, {
                        profileImage: occupantProfile,
                        fullName: occupantName,
                      })
                    }
                  ></div>
                  </div>
                  <div>
                  {/* Roommate Preference Dot - FIXED */}
                  {preferredRoomMate && (
                    <div
                      ref={dotElementRef}
                      className={styles.hdbDotPopoverWrapper}
                      onClick={(e)=>e.stopPropagation()}
                      onMouseEnter={() => {
                        if (popupLeaveTimeout.current)
                          clearTimeout(popupLeaveTimeout.current);
                        setShowRoommatePopup(true);
                      }}
                      onMouseLeave={() => {
                        popupLeaveTimeout.current = setTimeout(
                          () => setShowRoommatePopup(false),
                          100,
                        );
                      }}
                    >
                      <div
                        className={
                          occupantGender === GENDER_MALE
                            ? `${styles.hdbDot} ${styles.maleHdbDot}`
                            : `${styles.hdbDot} ${styles.femaleHdbDot}`
                          }
                        ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.seekerContainer}>
            <div className={styles.seekerHeader}>
              <Tooltip
                title={occupantName}
                ref={tipRef}
                arrow
                disableInteractive
                PopperProps={{
                  sx: { display: inView ? "block" : "none" },
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -8],
                      },
                    },
                  ],
                }}
              >
                <p className={styles.seekerName}>{occupantName}</p>
              </Tooltip>
              
              {/* Departure time from API */}
              {displayDepartureTime && (
                <div className={styles.departureTime}>{displayDepartureTime}</div>
              )}
            </div>

            
            <div className={styles.seekerDetailsWrapper}>
              {/* First row: Age and Location */}
              <div className={styles.seekerDetails}>
                <p className={styles.age}>{occupantAge} yrs</p>
                {occupantCity && (
                  <>
                    <div className={styles.separator}></div>
                    <Tooltip
                      title={occupantCity}
                      ref={tipRef}
                      arrow
                      disableInteractive
                      PopperProps={{
                        sx: { display: inView ? "block" : "none" },
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, -8],
                            },
                          },
                        ],
                      }}
                    >
                      <p className={styles.city}>{occupantCity}</p>
                    </Tooltip>
                  </>
                )}
                {displayRmContact && (
                  <>
                    <div className={styles.separator}></div>
                    <Tooltip
                      title={displayRmContact}
                      ref={tipRef}
                      arrow
                      disableInteractive
                      PopperProps={{
                        sx: { display: inView ? "block" : "none" },
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, -8],
                            },
                          },
                        ],
                      }}
                    >
                      <p className={styles.rmContact}>{displayRmContact}</p>
                    </Tooltip>
                  </>
                )}
              </div>
              {preferredRoomMate && (
                <div className={styles.seekerDetails}>
                  <Tooltip
                    title={preferredRoomMate}
                    ref={tipRef}
                    arrow
                    disableInteractive
                    PopperProps={{
                      sx: { display: inView ? "block" : "none" },
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [0, -8],
                          },
                        },
                      ],
                    }}
                  >
                    <p className={styles.preferredRoommate}
                      onClick={(e: unknown) => {
                        e.stopPropagation();
                        onShowMatches &&
                          onShowMatches(preferredRoomMate!, seekerId!);
                      }}
                    >{preferredRoomMate}</p>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>

          {/* ADD: Pair Button */}
          { shouldShowPairButton && (
            <div className={styles.pairButtonContainer}>
              <button 
                className={styles.pairButton}
                onClick={handlePairClick}
              >
               {textConstant.PAIR}
              </button>
            </div>
          )}
        </div>
      </div>

      {preferredRoomMate && showRoommatePopup && !hideRoommatePreference && (
        <div
          className={styles.roommatePopupWrapper}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => {
            if (popupLeaveTimeout.current)
              clearTimeout(popupLeaveTimeout.current);
            setShowRoommatePopup(true);
          }}
          onMouseLeave={() => {
            popupLeaveTimeout.current = setTimeout(
              () => setShowRoommatePopup(false),
              100,
            );
          }}
        >
          <RoommatePreferencePopup
            roommateName={preferredRoomMate}
            onShowMatches={handleShowMatches}
            isVisible={showRoommatePopup}
            anchorElement={dotElementRef.current}
          />
        </div>
      )}
      

      <ImagePreview
        imageUrl={previewImageUrl?.image}
        altText={previewImageUrl?.altText || "Profile Image"}
        setOpen={setOpen}
        isOpen={open}
        width={600}
        height={400}
      />
      <div
        className={
          occupantGender === GENDER_MALE
            ? styles.hdbBadge
            : `${styles.hdbBadge} ${styles.femaleHdbBadge}`
        }
      >
        {formatHDBCount(noOfHDBs)} {HDB_LABEL}
      </div>
    </div>
  );
};

export default SeekerOccupantCard;
