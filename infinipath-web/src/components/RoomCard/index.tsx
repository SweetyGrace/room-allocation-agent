import styles from "./index.module.scss";
import PhysicallyChallengedIcon from "../../assets/images/physicallyChallenged.svg";
import SeniorCitizensIcon from "../../assets/images/seniorCitizen.svg";
import ChildrenIcon from "../../assets/images/childIcon.svg";
import { RESERVED, ROOM_CATEGORY_ALT_TEXT } from "../../constants";

interface RoomCardProps {
  roomNumber: string;
  seperator?: boolean;
  capacity: number;
  roomCategory?: string;
  occupiedBedPositions: number[]; // CHANGE: Array of occupied bed positions
  roomStatus?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({ 
  roomNumber, 
  seperator, 
  capacity, 
  roomCategory ,
  occupiedBedPositions,
  roomStatus
}) => {
const getCategoryIcon = () => {
  if (!roomCategory || roomCategory === ROOM_CATEGORY_ALT_TEXT.NORMAL) {
    return null;
  }
  const iconMap: { [key: string]: { src: string; alt: string } } = {
    physically_challenged: { src: PhysicallyChallengedIcon, alt: ROOM_CATEGORY_ALT_TEXT.PHYSICALLY_CHALLENGED },
    senior_citizens: { src: SeniorCitizensIcon, alt: ROOM_CATEGORY_ALT_TEXT.SENIOR_CITIZENS },
    children: { src: ChildrenIcon, alt: ROOM_CATEGORY_ALT_TEXT.CHILDREN },
  };

  const icon = iconMap[roomCategory];
  return icon ? (
    <img src={icon.src} alt={icon.alt} className={styles.categoryIcon} />
  ) : null;
};
  // Generate array of bed indicators based on capacity
  const bedIndicators = Array.from({ length: capacity }, (_, index) => {
    const bedPosition = index + 1; // Bed positions are 1-indexed
    const isOccupied = occupiedBedPositions.includes(bedPosition); // CHANGE: Check if this specific position is occupied
    
    return (
      <div
        key={index}
        className={`${styles.bedIndicator} ${
          isOccupied ? styles.occupied : styles.vacant
        }`}
        title={`Bed ${bedPosition}: ${isOccupied ? 'Occupied' : 'Vacant'}`}
      />
    );
  });

  return (
    <div className={seperator ? styles.container : styles.noSeparatorContainer}>
      {getCategoryIcon()}
      <div className={styles.floorRoom}>
        <div className={styles.roomInfo}>
          <p className={styles.roomNumber}>{roomNumber}</p>
        </div>
        <div className={styles.bedIndicators}>
          {bedIndicators}
        </div>
          {roomStatus === RESERVED && (
          <div className={styles.reservedBadge}>{RESERVED}</div>
        )}
      </div>
    </div>
  );
};
export default RoomCard;
