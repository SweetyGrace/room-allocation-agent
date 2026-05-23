import { Avatar } from "@mui/material";
import styles from "./index.module.scss";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import CrossIcon from "../../../assets/images/Cross.svg";

interface iSwappingUserCard {
  user: Record<string, any>;
  currentProgram: string;
  onCancel: () => void;
}

const SwappingUserCard = (props: iSwappingUserCard) => {
  const { user, currentProgram, onCancel } = props;
  return (
    <div className={styles.cardContainer}>
      <div className={styles.userInfoSection}>
        <Avatar
          alt={user.fullName}
          src={user.profileImage || user.profileUrl|| defaultProfileIcon}
          sx={{
            width: 48,
            height: 48,
          }}
        />
        <div className={styles.textSection}>
          <div className={styles.nameText}>{user.fullName}</div>
          <div className={styles.programTag}>{currentProgram}</div>
        </div>
      </div>
      <div
        className={styles.closeIcon}
        onClick={onCancel}
        style={{ cursor: "pointer" }}
      >
        <img src={CrossIcon} alt="close" />
      </div>
    </div>
  )
};

export default SwappingUserCard;
