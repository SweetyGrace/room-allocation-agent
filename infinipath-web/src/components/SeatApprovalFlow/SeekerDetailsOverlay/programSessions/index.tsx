import { Button } from "../../../../common/components/Button";
import { ApprovalStatus } from "../../../../constants/textConstants";
import styles from "./index.module.scss";
import React, { useState } from "react";


interface Session {
    id: string | number;
    name: string;
    type: string;
    assignedUsers: any[];
    allocatedCount: number;
    totalSeekers: number;
}

interface SessionProps {
    user: any;
    sessions: Session[];
    onClose?: () => void;
    onBless: (user: any, sessionId: number, sessionType: string) => void;

}
const SessionsCard: React.FC<SessionProps> = ({ user, sessions = [], onBless, onClose }) => {
    const [blessSession, setBlessSession] = useState<Session | null>({ id: "", name: "", type: "", assignedUsers: [], allocatedCount: 0, totalSeekers: 0 });
    if (!sessions.length) {
        return <div className={styles.noSessions}>No sessions available.</div>;
    }
    return (
        <div className={styles.sessionsWrapper}>
            <p className={styles.sessionsHeading}>Choose a Program to bless</p>
            <div className={styles.sessionButtons}>
                {sessions.map((session) => {
                    const isHoldOrYetToDecide =
                        session.name === "Hold" || session.name === ApprovalStatus.YTD;
                    const allocatedCount =
                        typeof session.allocatedCount === "object"
                            ? session.allocatedCount.value
                            : session.allocatedCount;
                    if (
                        isHoldOrYetToDecide ||
                        allocatedCount < session.totalSeekers
                    ) {
                        return (
                            <button
                                className={`${styles.sessionTitle} ${blessSession?.id === session.id ? styles.selected : ""
                                    }`}
                                key={session.id}
                                onClick={() => {
                                    setBlessSession(session); 
                                }}
                            >
                                {session.name}
                            </button>
                        );
                    }
                    return null;
                })}
            </div>
            <Button
                buttonClassName={styles.confirmButton}
                onClick={(e) => {
                    e.stopPropagation();
                    const response=onBless(user, blessSession?.id as number, blessSession?.type as string);
                    if(response){
                        onClose?.();
                     }
                }}
            >
                {blessSession?.name !== "Hold"
                        ? blessSession?.name !== ApprovalStatus.YTD
                          ? "bless"
                          : ApprovalStatus.YTD
                        : "Hold"}
            </Button>
        </div>
    );
};

export default SessionsCard;