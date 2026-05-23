import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import downArrow from "../../../assets/images/downArrow.svg";
import upArrow from "../../../assets/images/up-arrow.svg";
import search from "../../../assets/images/search-icon.svg";
import { ApiService } from "../../../services/mockService.ts";
import PhoneNumberMasking from "../PhonenumberMasking/index.tsx";
import SwappingUserCard from "../SwappingUserCard/index.tsx";
import { Avatar } from "@mui/material";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import { useResponsive } from "../../../utils/functions.ts";
import swapMobileIcon from "../../../assets/images/swapMobileIcon.svg";

const MoveProgramCard = (props: any) => {
  const {
    user,
    currentProgram,
    availablePrograms,
    onProgramSelect,
    onCancel,
    programId,
    handleSwapUser,
  } = props;
  const [selectedProgram, setSelectedProgram] = useState<Record<string, any>>(
    {},
  );
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [programUsers, setProgramUsers] = useState<Array<Record<string, any>>>(
    [],
  );
  const [selectedUser, setSelectedUser] = useState<Record<string, any>>({});
  const handleProgramSelect = async (program: {
    id: number | string;
    name: string;
  }) => {
    setSelectedProgram(program);
    onProgramSelect(program);
    setSelectedUser({});
    setInputText("");
    setSearchText("");
    setProgramUsers([]);
  };

  const getSwapSeekers = async () => {
    try {
      const searchQuery = searchText.trim();
      if (searchQuery.length < 1) return;
      const response = await ApiService.getSeekersForSwap({
        programId,
        limit: 100,
        offset: 0,
        subProgramId: selectedProgram?.id,
        search: searchQuery,
      });

      setProgramUsers(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching approved users:", error);
      setProgramUsers([]);
    }
  };

  useEffect(() => {
    if (Object.keys(selectedProgram).length) {
      getSwapSeekers();
    }
  }, [searchText, selectedProgram]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setSearchText(e.target.value);
    if (e.target.value.trim().length === 0) {
    setProgramUsers([]); 
  }
  };

  const handleSearch = (search: string) => {
    setSearchText(search);
  };

  const handleUserSelect = (user: Record<string, any>) => {
    setSelectedUser(user);
    handleSwapUser(user);
  };

  const handleSelectedUserCancel = () => {
    setSelectedUser({});
    handleSwapUser({});
  };

  const { isMobileResolution, isTabletResolution } = useResponsive();
  return (
    <div className={styles.moveProgramCard}>
      {!isMobileResolution && !isTabletResolution && (
        <>
          <div className={styles.swapHeader}>
            <span className={styles.swapLabel}>Swapping / Moving</span>
          </div>

          <SwappingUserCard
            user={user}
            currentProgram={currentProgram}
            onCancel={onCancel}
          />
        </>
      )}

      <div>
        {!selectedUser?.id ? (
          <img src={downArrow} alt="down arrow" />
        ) : (
          <img src={swapMobileIcon} alt="swap mobile icon" />
        )}
      </div>

      <div className={styles.moveProgramContainer}>
        <div className={styles.filterContainer}>
          <div>
            <span className={styles.headingSwap}>
              Select a program to move or swap
            </span>
          </div>
          <div className={styles.filterTags}>
            {availablePrograms.map((program: { id: any; name: string }) => (
              <span
                key={program.id}
                className={`${styles.filterTag} ${
                  selectedProgram?.name === program.name ? styles.selected : ""
                }`}
                onClick={() => handleProgramSelect(program)}
              >
                {program.name}
              </span>
            ))}
          </div>
        </div>

        {selectedProgram && (
          <div className={styles.innercontainer}>
            <div className={styles.label}>Select seeker to swap</div>

            <div className={styles.selectBox}>
              <span className={styles.searchIcon}>
                <img src={search} alt="search" />
              </span>
              <input
                className={styles.inputField}
                type="text"
                placeholder="Search"
                value={inputText}
                onChange={handleInputChange}
              />
            </div>

            {Object.keys(selectedUser).length ? (
              <div className={styles.selectedUser}>
                <SwappingUserCard
                  user={selectedUser}
                  currentProgram={selectedProgram?.name}
                  onCancel={handleSelectedUserCancel}
                />
              </div>
            ) : programUsers.length > 0 ? (
              <div className={styles.usersListWrapper}>
                <div className={styles.usersList}>
                  {programUsers.map((user) => {
                    const activeSwapRequest = user.swapsRequests?.find(
                      (request) => request.status === "active",
                    );

                    return (
                      <div
                        key={user.id}
                        className={styles.userItem}
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className={styles.userInfo}>
                          <Avatar
                            alt={user.fullName}
                            src={user.profileUrl || defaultProfileIcon}
                            sx={{
                              width: 50,
                              height: 50,
                              border: "1px solid #fff",
                            }}
                          />
                          <div className={styles.namePhone}>
                            <div className={styles.name}>{user.fullName}</div>
                            <PhoneNumberMasking
                              phoneNumber={user.mobileNumber}
                              className={styles.phone}
                            />
                          </div>
                        </div>
                        {activeSwapRequest?.type === "can_shift" && (
                          <div className={styles.phone}>Flexible to shift</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={styles.noUsers}>No seekers found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveProgramCard;
