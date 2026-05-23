import { ReactNode } from "react";
import styles from "./index.module.scss";
import { colorizeMahatriaInfinitheism } from "../../common/components/ColorizeMahatriaInfinitheism";

interface SectionCardProps {
  title: string;
  totalLabel?: string;
  label?: string;
  children: ReactNode;
  actionItem?: string;
  height?: number;
  customClass?: string;
  cardHeight?: string | number;
  onClick?: () => void; // Add this prop
}

const SectionCard = ({
  title,
  totalLabel,
  label,
  children,
  actionItem,
  height,
  customClass,
  cardHeight,
  onClick, // Destructure onClick
}: SectionCardProps) => {
  return (
    <div className={styles.card} style={{ height: cardHeight ? cardHeight : (height && `${height}px`) }}>
      <div className={styles.header}>
        <div className={styles.nameContent}>
          <span>{colorizeMahatriaInfinitheism(title)}</span>
          {actionItem && (
            <>
              <div className={styles.divider}></div>
              <span
                className={styles.actionItem}
                onClick={onClick} // Attach onClick to the actionItem
                style={{ cursor: onClick ? "pointer" : "default" }}
              >
                {actionItem}
              </span>
            </>
          )}
        </div>
        {totalLabel && label !== "Locations" && (
          <span>
            <span className={styles.total}>{totalLabel}</span>{" "}
            <span className={styles.registation}>{label}</span>
          </span>
        )}
      </div>
      <div className={`${styles.body}${customClass ? ` ${customClass}` : ""}`}>{children}</div>
    </div>
  );
};

export default SectionCard;
