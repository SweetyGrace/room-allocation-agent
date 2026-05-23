import React from "react";
import styles from "./index.module.scss";
import card from "../../../assets/images/no_program_cards.svg";
import { User } from "../../../types/seatApproval";
import UserCard from "../../../components/SeatApprovalFlow/SeekerDetailsOverlay/Common/UserCards";

interface UsersListProps {
  users: User[];
  selectedOption: {
    value: string;
    label: string;
  };
  isDropdownUserList: boolean;
  flippedUserId: number | null;
  approvedraggedUser: User | null;
  scrollableRef: React.RefObject<HTMLDivElement>;
  lastUserElementRef: (node: HTMLDivElement) => void;
  handleSeekersListScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  handleDragStart: (e: React.DragEvent, user: User) => void;
  handleDragEnd: () => void;
  handleDragMove: (e: React.DragEvent) => void;
  handleSeekerDetails: (userId: number) => void;
  getInitials: (name: string) => string;
  handleBless: (user: User, sessionId: number, sessionType: string) => void;
  sessionId: number | null;
  setFlippedUserId: (id: number | null) => void;
  programsList: Array<{ id: number; name: string }>;
  dropdownAllocatedSessionId: number | null;
}

export const UsersList: React.FC<UsersListProps> = ({
  users,
  selectedOption,
  isDropdownUserList,
  flippedUserId,
  approvedraggedUser,
  scrollableRef,
  lastUserElementRef,
  handleSeekersListScroll,
  handleDragStart,
  handleDragEnd,
  handleDragMove,
  handleSeekerDetails,
  getInitials,
  handleBless,
  sessionId,
  setFlippedUserId,
  programsList,
  dropdownAllocatedSessionId,
}) => {
  return (
    <div
      className={
        selectedOption.value === "all"
          ? `${styles.usersList} ${styles.userListAll}`
          : styles.usersList
      }
      ref={scrollableRef}
      onScroll={handleSeekersListScroll}
    >
      {users.length > 0 ? (
        users.map((user, index) => (
          <div
            key={user.id}
            ref={index === users.length - 1 ? lastUserElementRef : undefined}
            className={`
              ${selectedOption.value === "all" ? styles.userCardAll : styles.userCard}
              ${user.isAssigned ? styles.assigned : ""}
              ${user.isPending ? styles.pending : ""}
              ${flippedUserId === user.id || approvedraggedUser?.id === user.id ? styles.flipped : ""}
            `}
            draggable={!user.isAssigned && !user.isPending}
            onDragStart={(e) => handleDragStart(e, user)}
            onDragEnd={handleDragEnd}
            onDrag={handleDragMove}
            style={{
              opacity:
                user.isPending ||
                flippedUserId === user.id ||
                approvedraggedUser?.id === user.id
                  ? 0.5
                  : 1,
              cursor: user.isPending ? "not-allowed" : "pointer",
            }}
          >
            <UserCard
              user={user}
              handleSeekerClick={() => handleSeekerDetails(user.id)}
              getInitials={getInitials}
              handleBless={handleBless}
              sessionId={sessionId}
              isFlipped={flippedUserId === user.id}
              onFlip={() => !user.isPending && setFlippedUserId(user.id)}
              onCloseFlip={() => setFlippedUserId(null)}
              disabled={user.isPending}
              programsList={programsList}
              allocatedProgramId={
                isDropdownUserList ? dropdownAllocatedSessionId : null
              }
              highlightAllocated={isDropdownUserList}
            />
          </div>
        ))
      ) : (
        <div className={styles.noProgramsContent}>
          <img src={card} alt="No seekers" className={styles.noProgramsImage} />
          <div className={styles.noProgramsText}>
            {isDropdownUserList
              ? `No seekers allocated to ${selectedOption.label}`
              : "All the seekers are blessed into their destined programs."}
          </div>
        </div>
      )}
    </div>
  );
};
