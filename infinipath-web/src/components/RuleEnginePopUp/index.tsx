import React from "react";
import styles from "./index.module.scss";
import closeIcon from "../../assets/images/closeIcon.svg";
import FormLine from "../../common/components/FormLine";

interface RoomAllocationFilterPopUpProps {
  onClose: () => void;
}

const RuleEnginePopUp: React.FC<RoomAllocationFilterPopUpProps> = ({
  onClose,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.filtersHeader}>
        <p className={styles.heading}>Auto room allocation rules</p>
        <FormLine />
        <img
          src={closeIcon}
          alt="close icon"
          onClick={onClose}
          className={styles.closeIcon}
        />
      </div>
      <div className={styles.termsAndConditions}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Priority</th>
              <th className={styles.rulenameStyles}>Rule name</th>
              <th>Rule description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.centerAlign}>1</td>
              <td>Gender match rule</td>
              <td>
                Ensures the seeker’s gender matches the gender of the seeker who
                is already allocated to the room.
              </td>
            </tr>
            <tr>
              <td className={styles.centerAlign}>2</td>
              <td>City match rule</td>
              <td>
                Matches the seeker’s city with the city of the seeker
                who is already assigned to the allocated room.
              </td>
            </tr>
            <tr>
              <td className={styles.centerAlign}>3</td>
              <td>Age group rule</td>
              <td>
                Groups seekers by defined age criteria and assigns them to rooms accordingly.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RuleEnginePopUp;
