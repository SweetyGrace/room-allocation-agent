import React, { useEffect, useState } from "react";
import defaultProfile from "../../../assets/images/default-profile.svg";
import styles from "./index.module.scss";
import { Avatar } from "@mui/material";
import noOtherData from "../../../assets/images/no-other-data.svg";
import { Seeker } from "../../../types/seatApproval";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";

interface User {
  seekersDataList?: unknown;
  seekerName?: string;
  handleMemberNaviagtion?: (id: number) => void;
}


// const MeetingsList: React.FC<Meetings> = ({
const SeekersFriendsFamily: React.FC<User> = ({
  seekersDataList = [],
  seekerName = "",
  handleMemberNaviagtion
} // Add this line to accept the prop
) => {
  const [seekersData, setSeekersData] = useState<Seeker[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setSeekersData(seekersDataList as Seeker[]);
  }, [seekersDataList]);

  const visibleUsers = expanded ? seekersData : seekersData.slice(0, 5);
  const extraUsersCount = seekersData.length - 5;

  const handleExpand = () => {
    setExpanded(true);
  };

  return (
    <div className={styles.seekersList}>
      <div className={styles.seekersTitle}>
        <span>{colorizeMahatriaInfinitheism(seekerName)}&apos;s inner circle ({seekersData?.length})</span>
      </div>
      {visibleUsers?.length > 0  ?
        <div className={styles.container}>
          {visibleUsers.map((user:any, index: number) => (
            <div key={index} className={styles.card} onClick={()=>handleMemberNaviagtion?.(user.userId)}>
              <Avatar
                alt={user.fullName}
                src={
                  user?.profileUrl?.length > 0
                    ? `${user?.profileUrl}?timestamp=${new Date().getTime()}`
                    : defaultProfile
                }
                sx={{
                  width: 48,
                  height: 48,
                  border: "1px solid #DDDDDD",
                  "@media (max-width: 780px)": {
                    width: 35,
                    height: 35,
                  },
                }}
                data-testid="profile-avatar"
              />
              <p className={styles.name}>{user.fullName}</p>
              <p
                className={`${styles.status} ${user.status === "joined" ? styles.joined : styles.notJoined
                  }`}
              >
                {user.status}
              </p>
            </div>
          ))}
          {!expanded && extraUsersCount > 0 && (
            <div className={styles.moreSeekersCard} onClick={handleExpand}>
              <div className={styles.moreUsers}>
                <div className={styles.content}>  +{extraUsersCount} </div>
                <span className={styles.moreText}> view all</span>
              </div>
            </div>
          )}
        </div>
        : (
          <div className={styles.noSeekers}>
            <div className={styles.noSeekersImage}>
           <img src = {noOtherData}/>
           </div>
           <p>This seeker has not added any group members yet.</p>
          </div>
        )}
    </div>
  );
};

export default SeekersFriendsFamily;
