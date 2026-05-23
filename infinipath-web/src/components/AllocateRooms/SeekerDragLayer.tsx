import React from "react";
import { useDragLayer } from "react-dnd";
import SeekerCard from "../SeekerCard";
import SeekerOccupantCard from "../SeekerOccupantCard";
import { ITEM_TYPES } from "../../constants/textConstants";
import styles from "./SeekerDragLayer.module.scss";

const layerStyles: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 1000,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
};

function getItemStyles(currentOffset: { x: number; y: number } | null): React.CSSProperties {
    if (!currentOffset) {
        return {
            display: "none",
        };
    }

    const { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform,
        position: "fixed" as const,
        pointerEvents: "none" as const,
        left: 0,
        top: 0,
        zIndex: 1000,
    };
}

const SeekerDragLayer: React.FC = () => {
    const {
        itemType,
        isDragging,
        item,
        currentOffset,
    } = useDragLayer((monitor) => ({
        itemType: monitor.getItemType(),
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        currentOffset: monitor.getSourceClientOffset(),
    }));

    if (!isDragging || !item) {
        return null;
    }

  // Only show for seeker drag
  if (itemType !== ITEM_TYPES.USER) {
    return null;
  }

    // Check if item.user has a 'user' property (nested structure) - indicates SeekerOccupantCard
    const isOccupantCard = item.user?.user !== undefined;

    return (
        <div style={layerStyles}>
            <div style={getItemStyles(currentOffset)}>
                <div className={styles.dragPreviewCard}>
                    {isOccupantCard ? (
                        <SeekerOccupantCard
                            occupantProfile={item.user.user?.profilePicture || null}
                            occupantGender={item.user.user?.userDetail?.gender || ""}
                            occupantName={item.user.user?.fullName || ""}
                            occupantAge={item.user.age || 0}
                            occupantCity={item.user.user?.userDetail?.city || item.user.city || ""}
                            isClicked={false}
                            onCardClick={() => {}}
                            seekerPaired={item.user.isPaired || false}
                            preferredRoomMate={item.user.preferredRoomMate || null}
                            seekerId={item.user.programRegistrationId || item.user.id}
                            onShowMatches={() => {}}
                            hideRoommatePreference={true}
                            rmContactUser={item.user.rmContactUser || null}
                            departureDatetime={item.user.departureDatetime || null}
                            noOfHDBs={item.user.noOfHDBs || 0}
                        />
                    ) : (
                        <SeekerCard
                            profile={item.user.profile}
                            gender={item.user.gender}
                            name={item.user.name}
                            age={item.user.age}
                            city={item.user.city}
                            selectedSeekerIds={[]}
                            userId={item.user.id}
                            pairCodes={[]}
                            registrationPairId={item.user.registrationPairId}
                            index={0}
                            userPairCode={item.user.pairCode}
                            setCheckReload={() => {}}
                            setSelectedSeekers={() => {}}
                            preferredRoomMate={item.user.preferredRoomMate || null}
                            seekerId={item.user.programRegistrationId || item.user.id}
                            onShowMatches={() => {}}
                            hideRoommatePreference={true}
                            noOfHDBs={item.user.noOfHDBs}
                            departureDatetime={item.user.departureDatetime}
                            rmName={item.user.rmName}
                            user={item.user}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeekerDragLayer;
