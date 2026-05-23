import React from "react";
import styles from "./index.module.scss";
import { Avatar } from "@mui/material";
import swaparrow from "../../../assets/images/swap-arrow.svg";
import uniarrow from "../../../assets/images/arrow-1.svg";
import profile from "../../../assets/images/profile-bg.webp";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import { Button } from "../Button"; // Adjust path as needed
import gridswap1 from "../../../assets/images/swap-arrow-1.svg";
import gridswap2 from "../../../assets/images/swap-arrow-2.svg";
import ProfilePicture from "../ProfilePicture";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";

interface SwapActionCardProps {
  user: any;
  selectedSwapSeeker: any;
  selectedPref: any;
  handleBlessAction: (e: React.MouseEvent) => void;
  handleOpenSessionOverlay: (userId: number, selectedPref: any) => void;
  _isFlipped?: boolean;
  isFromSessionsGrid?: boolean; // Optional prop to indicate if it's from SessionsGrid
}

const SwapActionCard: React.FC<SwapActionCardProps> = ({
  user,
  selectedSwapSeeker,
  selectedPref,
  handleBlessAction,
  handleOpenSessionOverlay,
  _isFlipped = false,
  isFromSessionsGrid = false, // Default to false if not provided
}) => {
  const swapTextClass = isFromSessionsGrid
    ? styles.swapgridText
    : styles.swapText;
  const hdbLabelClass = isFromSessionsGrid
    ? styles.hdbGridLabel
    : styles.hdbLabel;
  const roundImageClass = isFromSessionsGrid
    ? styles.roundGridImageBg
    : styles.roundImageBg;
  const selectSeekerTextClass = isFromSessionsGrid
    ? styles.selectSeekerGridText
    : styles.selectSeekerText;
  const hdbCardClass = isFromSessionsGrid ? styles.hdbCardGrid : styles.hdbCard;
  return (
    <div
      className={`${styles.userCardContent} ${_isFlipped ? styles.flipped : ""}`}
    >
      <div className={hdbCardClass}>
        <ProfilePicture
          profileUrl={user?.profileImage || defaultProfileIcon}
          width={isFromSessionsGrid ? 50 : 100}
          height={isFromSessionsGrid ? 50 : 100}
          alt={user?.fullName}
        />
       {!isFromSessionsGrid && ( <div className={hdbLabelClass}>{colorizeMahatriaInfinitheism(user?.allocatedProgram?.name)}</div>)}
      </div>

      <div className={styles.swapAction}>
        <div className={swapTextClass}>
          {selectedSwapSeeker ? (
            <>
              Moving   <span className={styles.swapNameEllipsis}  title={user?.fullName}>{user?.fullName}</span> to{" "}
              {selectedSwapSeeker?.allocatedProgram?.name} and{" "}
              <span className={styles.swapNameEllipsis} title={selectedSwapSeeker?.fullName}>
                {colorizeMahatriaInfinitheism(selectedSwapSeeker?.fullName)}
              </span> to {colorizeMahatriaInfinitheism(user?.allocatedProgram?.name)}
              <div>
                <img
                  src={isFromSessionsGrid ? gridswap2 : swaparrow}
                  alt="arrow"
                />
              </div>
            </>
          ) : (
            <>
              moving {user?.fullName} from {colorizeMahatriaInfinitheism(user?.allocatedProgram?.name)} to{" "}
              {colorizeMahatriaInfinitheism(selectedPref?.name)}
              <div>
                <img
                  src={isFromSessionsGrid ? gridswap1 : uniarrow}
                  alt="arrow"
                />
              </div>
            </>
          )}
        </div>

        <div className={isFromSessionsGrid ? styles.blessGridButton : styles.blessButton}>
          <Button
            type="submit"
            buttonClassName={
              isFromSessionsGrid
                ? `${styles.buttonContainer}`
                : styles.buttonContainerstyle
            }
            buttonTextClassName={styles.buttonText}
            datatestid="add-program-save-button"
            datatestidText="add-program-save"
            onClick={handleBlessAction}
          >
            <span className={styles.blessText}>bless</span>
          </Button>
        </div>
      </div>

      {selectedSwapSeeker ? (
        <div className={hdbCardClass}>
          <ProfilePicture
            profileUrl={selectedSwapSeeker?.profileImage}
            width={isFromSessionsGrid ? 50 : 100}
            height={isFromSessionsGrid ? 50 : 100}
            alt={selectedSwapSeeker?.fullName}
          />
          {!isFromSessionsGrid && (
                <div className={hdbLabelClass}>
                  {selectedSwapSeeker?.allocatedProgram?.name}
                </div>
              )}
        </div>
      ) : (
        <div
          className={hdbCardClass}
          onClick={() => {
            handleOpenSessionOverlay(user?.id, selectedPref);
          }}
        >
          <div className={styles.avatarWithText}>
            <span className={selectSeekerTextClass}>select seeker to swap</span>
            <div
              className={roundImageClass}
              style={{
                backgroundImage: `url(${profile})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
          </div>
          {!isFromSessionsGrid && (
            <div className={hdbLabelClass}>
              {colorizeMahatriaInfinitheism(selectedPref?.name)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SwapActionCard;
