import React from "react";
import styles from "./index.module.scss";
import { SidebarItemState } from "../../../types/seatApproval";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";
import { EXCLUDED_LABELS, PREFERENCE_LABEL, TOOLTIP_LABELS } from "../../../constants/textConstants";
import { Tooltip } from "@mui/material";
interface SideBarItemProps {
  key: string;
  kpiCategory: string;
  icon: string;
  label: string;
  count: number;
  showIcon: boolean;
}

interface SideBarProps {
  selectedSidebarItem: string | SidebarItemState;
  handleSidebarItemClick: (key: string) => void;
  items: SideBarItemProps[];
  sessions:any[];
}

export const SideBar: React.FC<SideBarProps> = ({
  selectedSidebarItem,
  handleSidebarItemClick,
  items,
  sessions,
}) => {
  const padCount = (count: number) => (count < 10 ? `0${count}` : `${count}`);
  let preferencesPrinted = false; 
  return (
    <div className={styles.sidebar}>
      {items.map((item) => {
        let preferencesLabel = null;
        let divider = null;
        if (
          !preferencesPrinted &&
          typeof item.label === "string" &&
          item.label.startsWith("Total") && 
           item.kpiCategory !== "cancelled"
        ) {
          preferencesLabel = (
            <span className={styles.preferenceLabel}>{PREFERENCE_LABEL}</span>
          );
          preferencesPrinted = true; 
        }
          const sessionIndex = sessions && sessions.length >= 2 ? sessions.length - 3 : 0;
        if (
          sessions &&
          sessions[sessionIndex] &&
          sessions[sessionIndex].name === item.label
        ) {
          divider = <div className={styles.sidebarDivider} />; 
        }
        const getTooltipText = (label: string) => {

            if (label === "Swap request") {
              return TOOLTIP_LABELS.SWAP;
            }
            if( label === "RoommatePreference") {
              return TOOLTIP_LABELS.ROOMMATE_PREFERENCE;
            }
            if(label=="total" || label=="Total" || label=="Total Unallocated"){
              return TOOLTIP_LABELS.TOTAL;
            }
            if(label=="Total Male" || label=="male"){
              return TOOLTIP_LABELS.MALE;
            }
            if(label=="Total Female" || label=="female"){
              return TOOLTIP_LABELS.FEMALE;
            }
            return label;
          };
        const shouldShowTooltip = (label: string) => {
          return !EXCLUDED_LABELS.includes(label);
        };
         
        return (
          <React.Fragment key={item.key}>
            <Tooltip 
              title={shouldShowTooltip(item.label) ? getTooltipText(item.label) : ""} 
              PopperProps={{
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [0, -8], 
                      },
                    },
                  ],
                }}
            >
            <div
              className={`${styles.sidebarItem} ${
                (selectedSidebarItem?.key || selectedSidebarItem) === item.key
                  ? styles.active
                  : ""
              }`}
              onClick={() => {
                handleSidebarItemClick(item);
              }}
            >
              {item.showIcon ? (
                <div className={styles.sidebarIcon}>
                  <img src={item.icon} alt={item.label} />
                </div>
              ) : (
                <div className={styles.sidebarLabel}>
                  {item.label === "Mahatria Choice" ? (
                    <span>
                      <span className={styles.choiceText}>
                        {colorizeMahatriaInfinitheism("Any HDB/MSD")}
                      </span>
                    </span>
                  ) : (
                    <>{colorizeMahatriaInfinitheism(item.label)}</>
                  )}
                </div>
              )}
              <div className={styles.sidebarCount}>
                {padCount(item.count || 0)}
              </div>
            </div>
            </Tooltip>
            {preferencesLabel}
            {divider}
          </React.Fragment>
        );
      })}
    </div>
  );
};
