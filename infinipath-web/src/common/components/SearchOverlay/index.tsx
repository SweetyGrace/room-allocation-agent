import React, { useEffect, useRef, useState } from "react";
import { Modal, Box, IconButton, Avatar } from "@mui/material";
import close from "../../../assets/images/close-icon.svg";
import styles from "./index.module.scss";
import searchIcon from "../../../assets/images/search-icon.svg";
import cancelText from "../../../assets/images/text-cross-icon.svg";
import Loader from "../Loader";
import { getItemInLocalStorage } from "../../../services/localStorage";
import personIcon from "../../../assets/images/person-icon.svg";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import PhoneNumberMasking from "../PhonenumberMasking";
import { getCall } from "../../../services/apiService";
import { endPoints, INFINIPATH } from "../../../constants/urlConstants";
// import { useLocation } from "react-router-dom";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  handleSeekerClick: (user: unknown) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  open,
  onClose,
  handleSeekerClick,
}) => {
   const [loading, setLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [users, setUsers] = useState<unknown[]>([]);
  const [apiCalled, setApiCalled] = useState<boolean>(false); // Tracks if the API call has completed
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const seekerData = getItemInLocalStorage("seekerDetails");
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* handleInputChange: Handles the input change event and fetches the seekers data */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    if (value.trim() === "") {
      setUsers([]);
      setApiCalled(false);
    }
  };

  /* handleClearInput: Clears the input field and resets the users array */
  const handleClearInput = () => {
    setInputValue("");
    setUsers([]);
    setApiCalled(false);
  };

  /* fetchSeekersData: Fetches the seekers data */
  const fetchSeekersData = async () => {
    if (!inputValue.trim()) {
      return;
    } else {
      setLoading(true);
      getCall(
        `${endPoints.users}?excludeUserAndMembers=${seekerData?.id}&page=1&size=20&searchString=${inputValue?.trim()}`,
        undefined,
        INFINIPATH
      )
        .then((response: unknown) => {
          if (response?.data?.statusCode === 200) {
            setLoading(false);
            setUsers(response?.data?.data?.usersData);
          } else {
            setLoading(false);
            console.error("Error:", response?.data?.message);
          }
        })
        .catch((error: unknown) => {
          setLoading(false);
          console.error("Error:", error);
        });
    }
  };

  /* useEffect: Fetches the seekers data on input change */
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchSeekersData();
    }, 500);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [inputValue]);

  /**
   * @description: useEffect to focus on the input field when the modal is opened
   */
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} data-testid="search-modal">
      <Box className={styles.modalBox} data-testid="search-modal-box">
        <div
          className={styles.searchContent}
          data-testid="search-modal-content"
        >
          <div className={styles.modalHeader} data-testid="search-modal-header">
            Find or add seekers using their name or phone number
            <div
              className={styles.closeButton}
              onClick={onClose}
              data-testid="search-modal-close-button"
            >
              <img src={close} alt="close" />
            </div>
          </div>
          <div
            className={styles.fieldBlock}
            data-testid="search-modal-field-block"
          >
            <img
              src={searchIcon}
              alt="search"
              className={styles.searchIcon}
              data-testid="search-modal-search-icon"
            />
            <input
              placeholder="search seekers"
              className={styles.inputFields}
              onChange={handleInputChange}
              value={inputValue}
              data-testid="search-modal-input"
              ref={inputRef}
            />
            {inputValue && (
              <IconButton
                className={styles.cancelButton}
                onClick={handleClearInput}
                data-testid="search-modal-clear-button"
              >
                <img src={cancelText} alt="clear" />
              </IconButton>
            )}
          </div>
          {loading ? (
            <Loader type="large" data-testid="search-modal-loader" />
          ) : (
            <div className={styles.results} data-testid="search-modal-results">
              {users?.length > 0 ? (
                <>
                  <div
                    className={styles.userBlocks}
                    data-testid="search-modal-user-blocks"
                  >
                    {users?.map((user, index) => (
                      <div
                        key={index}
                        className={styles.userItem}
                        onClick={() => handleSeekerClick(user)}
                        data-testid={`search-modal-user-item-${index}`}
                      >
                        <Avatar
                          alt="Remy Sharp"
                          src={
                            user?.profileUrl && user?.profileUrl?.length > 0
                              ? `${user?.profileUrl}?timestamp=${new Date().getTime()}`
                              : defaultProfileIcon
                          }
                          sx={{
                            width: 50,
                            height: 50,
                            border: "1px solid #DDDDDD",
                          }}
                          data-testid={`search-modal-user-avatar-${index}`}
                        />
                        <div
                          className={styles.userDetails}
                          data-testid={`search-modal-user-details-${index}`}
                        >
                          <span>{user?.fullName} </span>
                          <PhoneNumberMasking
                            phoneNumber={user?.phoneNumber}
                            className={styles?.phoneText}
                            data-testid={`search-modal-user-phone-${index}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className={styles.emptySearch}
                    data-testid="search-modal-empty-search"
                  >
                  </div>
                </>
              ) : apiCalled && inputValue.trim() ? (
                <div
                  className={styles.emptyUser}
                  data-testid="search-modal-empty-user"
                >
                  <img src={personIcon} alt="person icon" />
                  <span
                    className={styles.emptyUserText}
                    data-testid="search-modal-empty-text"
                  >
                    Seeker does not exist
                  </span>
                </div>
              ) : (
                <div
                  className={styles.emptySearch}
                  data-testid="search-modal-no-results"
                >
                </div>
              )}
            </div>
          )}
        </div>
      </Box>
    </Modal>
  );
};
export default SearchModal;
