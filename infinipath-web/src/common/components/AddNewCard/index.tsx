import styles from "./index.module.scss";
import addCircle from "../../../assets/images/add-circle.svg";
interface AddNewCardProps {
  handleOpenSearchPopUp: () => void;
  cardStyles?: string;
}

const AddNewCard: React.FC<AddNewCardProps> = ({
  handleOpenSearchPopUp,
  cardStyles,
}) => {
  return (
    <div
      className={`${styles.addNewCard} ${cardStyles || ""}`}
      onClick={() => handleOpenSearchPopUp()}
      data-testid="add-new-card-container"
    >
      <div className={styles.addCircleStyles} data-testid="add-new-card-circle">
        <img
          src={addCircle}
          alt="Add new card"
          data-testid="add-new-card-icon"
        />
      </div>
      <p className={styles.addText} data-testid="add-new-card-text">
        Add<div>new member</div>{" "}
      </p>
    </div>
  );
};

export default AddNewCard;
