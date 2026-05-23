import { Shuffle } from "lucide-react";
import clsx from "clsx";
import styles from "./index.module.scss";
import SectionCard from "../../../components/SectionCard";

const requests = [
  {
    name: "Ananya Sharma",
    avatar: "https://ui-avatars.com/api/?name=Ananya+Sharma",
    from: "HDB 1",
    to: "HDB 2",
    text: "Can shift from",
  },
  {
    name: "Rahul Vikram Sharma",
    avatar: "https://ui-avatars.com/api/?name=Rahul+Vikram+Sharma",
    from: "MSD 2",
    to: "HDB 3",
    text: "Wants swap from",
  },
  {
    name: "Priya Anjali Patel",
    avatar: "https://ui-avatars.com/api/?name=Priya+Anjali+Patel",
    from: "HDB 3",
    to: "HDB 2",
    text: "Can shift from",
  },
  {
    name: "Vijay Kumar Jain",
    avatar: "https://ui-avatars.com/api/?name=Vijay+Kumar+Jain",
    from: "MSD 1",
    to: "HDB 1",
    text: "Can shift from",
  },
];

const SwapRequests = () => {
  return (
    <SectionCard title="Swap requests">
      <ul className={styles.listWrapper}>
        {requests.map((req, index) => (
          <li
            key={index}
            className={clsx(styles.listItem, {
              [styles.altBackground]: index % 2 === 1,
            })}
          >
            <div className={styles.userInfo}>
              <img src={req.avatar} alt={req.name} className={styles.avatar} />
              <span className={styles.name}>{req.name}</span>
            </div>
            <div className={styles.swapInfo}>
              <span className={styles.swapText}>{req.text}</span>
              <span className={styles.swapBadge}>{req.from}</span>
              <Shuffle className={styles.swapIcon} />
              <span className={styles.swapBadge}>{req.to}</span>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
};

export default SwapRequests;
