/* eslint-disable react/prop-types */
import { Avatar, Tooltip } from "@mui/material";
import styles from "./index.module.scss";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import menuIcon from "../../assets/images/menu.svg";
import pairedIcon from "../../assets/images/pairedIcon.svg";
import unpairIcon from "../../assets/images/UnpairIcon.svg";
import React, { useState, useRef, useEffect } from "react";
import { unpairYetToAssignSeekers } from "../AllocateRooms/allocateRoomsUtils";
import ImagePreview from "../../common/components/ImagePreview";
import RoommatePreferencePopup from "../HdbDotPopover";
import { formatDateTimeUniversal } from "../../utils/commonFunctions";
import { HDB_LABEL } from "../../constants";
import { formatHDBCount } from "../AllocateRooms/allocateRoomsUtils";
import {GENDER_MALE} from "../../constants/textConstants"
interface User {
  [x: string]: any;
  id: string;
  name: string;
  age: number;
  city: string;
  profile: string | null;
  gender: string;
}

export interface SeekerCardProps {
  profile: string | null;
  gender: string;
  name: string;
  age: number;
  city: string;
  selectedSeekerIds?: Array<string>;
  userId?: string;
  pairCodes?: Array<number>;
  index: number;
  userPairCode: number;
  setCheckReload: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedSeekers: React.Dispatch<React.SetStateAction<User[]>>;
  registrationPairId: number | null;
  preferredRoomMate?: string | null;
  seekerId?: number | string;
  onShowMatches?: ( preferredName: string, seekerId: string | number, user?:User) => void;
  hideRoommatePreference?: boolean;
  noOfHDBs?: number;
  departureDatetime?: string | null;
  rmName?: string | null;
   user: User;
   setSkipRoom?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SeekerCard: React.FC<SeekerCardProps> = ({
  profile,
  gender,
  name,
  age,
  city,
  selectedSeekerIds,
  userId,
  pairCodes,
  index,
  userPairCode,
  setCheckReload,
  setSelectedSeekers,
  registrationPairId,
  preferredRoomMate,
  seekerId,
  onShowMatches,
  hideRoommatePreference = false,
  noOfHDBs,
  departureDatetime,
  rmName,
  user,
  setSkipRoom,
}) => {
  const tipRef = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState({
    image: "",
    altText: "",
  });
  const [open, setOpen] = useState(false);

  const [showRoommatePopup, setShowRoommatePopup] = useState(false);
  const popupLeaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const dotElementRef = useRef<HTMLDivElement>(null);
  const displayDepartureTime = departureDatetime 
    ? formatDateTimeUniversal(departureDatetime, 'dateTime24HrFormat')
    : null;
  const cb = (entries) => {
    const [entry] = entries;
    entry.isIntersecting ? setInView(true) : setInView(false);
  };

  // Image click handler
  const handleImageClick = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    setPreviewImageUrl({
      image: user.profileImage || defaultProfileIcon,
      altText: user.fullName || "Profile Image",
    });
    setOpen(true);
  };

  const handleShowMatches = () => {
    onShowMatches && onShowMatches(preferredRoomMate!, seekerId!, user );
  };

  React.useEffect(() => {
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

  return (
    <div className={styles.cardContainer}>
      {name ? (
        <div
          className={
            (gender === "M"
              ? `${styles.container}`
              : `${styles.femaleContainer}`) +
            (selectedSeekerIds?.includes(userId)
              ? ` ${gender === "M" ?styles.occupantDetailsColor : styles.femaleOccupantDetailsColor}`
              : "") +
            (pairCodes?.includes(userPairCode) && index % 2 === 0
              ? ` ${styles.marginBottom}`
              : "")
          }
        >
          {/* <img src={menuIcon} alt="menu" className={styles.menuIcon} /> */}
          <div className={styles.profileContainer}>
            <div className={styles.imageContainer}>
              <Avatar
                alt="Remy Sharp"
                src={profile?.length > 0 ? profile : defaultProfileIcon}
                sx={{ width: 56, height: 53.27, border: "1px solid #DDDDDD" }}
              />
             
              <div
                className={styles.hoverEyePreview}
                onClick={(e) =>
                  handleImageClick(e, { profileImage: profile, fullName: name })
                }
              ></div>
            </div>
            {preferredRoomMate && !hideRoommatePreference && (
              <>
                <div
                  ref={dotElementRef}
                  className={styles.hdbDotPopoverWrapper}
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
                  <div
                    className={
                      gender === GENDER_MALE
                        ? `${styles.hdbDot} ${styles.maleHdbDot}`
                        : `${styles.hdbDot} ${styles.femaleHdbDot}`
                    }
                  ></div>
                </div>

                {/* MOVED: Popup inside the same conditional */}
                {showRoommatePopup && (
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
                      diffWidth={true}
                    />
                  </div>
                )}
              </>
            )}
            <div
              className={
                gender === GENDER_MALE
                  ? styles.hdbBadge
                  : `${styles.hdbBadge} ${styles.femaleHdbBadge}`
              }
            >
              {formatHDBCount(noOfHDBs)} {HDB_LABEL}
            </div>

            <div className={styles.seekerContainer}>
              <Tooltip
                title={name}
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
                className={styles.tooltip}
              >
                <p className={styles.seekerName}>{name}</p>
              </Tooltip>
              {displayDepartureTime && (
                <div className={styles.departureTime}>{displayDepartureTime}</div>
              )}

              <div className={styles.seekerDetails}>
                {/* <p className={styles.gender}>{gender}</p> */}
                <div
                  className={`${styles.age}`}
                >
                  {age} yrs
                </div>
                { age && city &&  <div className={styles.separator}></div>}
                <Tooltip
                  title={city}
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
                  className={styles.tooltip}
                >
                  <p className={styles.city}>{city}</p>
                </Tooltip>
                {city && rmName && <div className={styles.separator}></div>}
                {rmName && (
                  <Tooltip
                    title={rmName}
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
                    className={styles.tooltip}
                  >
                    <div className={styles.rmName}>{rmName}</div>
                  </Tooltip>
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
                    className={styles.tooltip}
                  >
                    <p
                      className={`${styles.mateStyles}`}
                      onClick={(e: unknown) => {
                        e.stopPropagation();
                        onShowMatches &&
                          onShowMatches(preferredRoomMate!, seekerId!, user);
                      }}
                    >
                      {preferredRoomMate}
                    </p>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>

          {pairCodes?.includes(userPairCode) && index % 2 === 0 && (
            <>
              {selectedSeekerIds?.includes(userId) ? (
                <div className={styles.pairedUnallocateUnpairIcon}>
                  <img
                    src={unpairIcon}
                    alt="unpair icon"
                    className={styles.unpairIcon}
                    onClick={() =>
                      unpairYetToAssignSeekers(
                        registrationPairId,
                        setCheckReload,
                        setSelectedSeekers,
                        setSkipRoom,
                      )
                    }
                  />
                </div>
              ) : (
                <div className={styles.pairedUnallocateIcon}>
                  <img src={pairedIcon} alt="paired icon" />
                </div>
              )}
            </>
          )}
        </div>
      ) : null}

      <ImagePreview
        imageUrl={previewImageUrl?.image}
        altText={previewImageUrl?.altText || "Profile Image"}
        setOpen={setOpen}
        isOpen={open}
        width={600}
        height={400}
      />
    </div>
  );
};
export default SeekerCard;
