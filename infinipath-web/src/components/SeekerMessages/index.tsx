import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { formatDateString } from "../../utils/commonFunctions";
import Loader from "../../common/components/Loader";
import colouredMessageIcon from "../../assets/images/read-icon.png";
import colouredVideoIcon from "../../assets/images/watch-icon.png";
import { BROWSER_DONT_CONTAIN_VIDEOTAG, DATE_PLACEHOLDER, ENTER_LABEL, HEART_FELT_Message, HEARTFELT_MESSAGE_FROM, NO_SEEKER_FOUND, NO_SEEKER_FOUND_SEARCH_VALUE, READ, RECORD_TYPE, SEARCH_NAME_PLACEHOLDER, SELECT_SEEKER_TO_VIEW, VIEWED, WATCH } from "../../constants/textConstants";
import styles from "./index.module.scss";
import CommonTextField from "../../common/components/SearchField";
import searchIcon from "../../assets/images/search.svg";
import noSeekerFoundIcon from "../../assets/images/no-seeker-found.svg";
import selectSeekerIcon from "../../assets/images/select-seeker.svg";
import { CardData, SeekerMessageProps } from "../../types/expressions";
import ImagePreview from "../../common/components/ImagePreview";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import closeIcon from "../../assets/images/closeIcon.svg"
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const SeekerMessage: React.FC<SeekerMessageProps> = ({
  open,
  onClose,
  messages,
  // newRecordsCount,
  // handleNewMessagesClick,
  isLoading,
  handleLoadMoreData,
  scrollRef,
  totalRecordCount,
  searchString,
  activeSearchString,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onMarkMessageViewed
}) => {
  const [selectedMessage, setSelectedMessage] = useState<CardData | null>(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMarkingViewedRef = useRef<boolean>(false);
  const [previewImageUrl, setPreviewImageUrl] = useState({
    image: '',
    altText: '',
  });
  const [openImage, setOpenImage] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [modalVideoData, setModalVideoData] = useState<CardData | null>(null);
  const loader = useSelector((state: RootState) => state.ProgramReducer.loaderCounts.largeLoaderCount);
  
  // Handle Enter key press for search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ENTER_LABEL) {
      e.preventDefault();
      onSearchSubmit();
    }
  };
  
  // Image click handler for preview
  const handleImageClick = (e: React.MouseEvent, message: CardData) => {
    e.stopPropagation();
    setPreviewImageUrl({
      image: message.profileIcon || defaultProfileIcon,
      altText: `${message.firstName} ${message.lastName}`,
    });
    setOpenImage(true);
  };

  const handleViewMessage = (msg: CardData, index: number) => {
    setShouldAutoPlay(true);
    setSelectedMessage({ ...msg, index });
     if (
      msg.mediaType === RECORD_TYPE.VIDEO &&
      window.innerWidth < 1025
    ) {
      setModalVideoData(msg);
      setShowVideoModal(true);
    }
  };

    const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setModalVideoData(null);
    setSelectedMessage(null); // Clear selection on mobile
  };

  const handleCloseOverlay = () => {
    onClose();
    setSelectedMessage(null);
  // setShowMessageList(true);
  };

  const filteredMessages = messages;
  const autoMarkRef = useRef<number | null>(null);

  useEffect(() => {
    if (!selectedMessage || isMarkingViewedRef.current) {
      return;
    }
    const updatedMessage = filteredMessages.find(
      (messageItem) => messageItem.id === selectedMessage.id,
    );
    if (updatedMessage) {
      const newIndex =
        updatedMessage.index ??
        filteredMessages.findIndex(
          (messageItem) => messageItem.id === updatedMessage.id,
        );
      setSelectedMessage({ ...updatedMessage, index: newIndex });
    }
  }, [filteredMessages, selectedMessage?.id]);

  useEffect(() => {
    if (!selectedMessage || !onMarkMessageViewed) {
      autoMarkRef.current = null;
      return;
    }
    // Only auto-mark text messages as viewed, not videos
    if (!selectedMessage.isViewed && selectedMessage.mediaType === RECORD_TYPE.MESSAGE) {
      if (autoMarkRef.current !== selectedMessage.id) {
        autoMarkRef.current = selectedMessage.id;
        isMarkingViewedRef.current = true;
        onMarkMessageViewed(selectedMessage, () => {
          isMarkingViewedRef.current = false;
        });
      }
    } else if (autoMarkRef.current === selectedMessage.id) {
      autoMarkRef.current = null;
    }
  }, [selectedMessage, onMarkMessageViewed]);
  
  // Clear selection when active search changes (when Enter is pressed or search is cleared)
  useEffect(() => {
    if (isMarkingViewedRef.current) {
      return; // Don't clear selection while marking as viewed
    }

      setSelectedMessage(null);
  }, [activeSearchString]);
  
  // Auto-select first message on open or when messages change (but not on search)
  useEffect(() => {
    if (!open || isMarkingViewedRef.current) {
      if (!open) {
        setSelectedMessage(null);
      }
      return;
    }
    
    const hasSearch = activeSearchString && activeSearchString.trim().length > 0;
    
    if (filteredMessages && filteredMessages.length > 0) {
      // If no message is selected and no search is active, select the first one
      if (!selectedMessage && !hasSearch) {
        setShouldAutoPlay(false);
        setSelectedMessage({ ...filteredMessages[0], index: 0 });
      }
      // If selected message is not in the list anymore, clear it
      else if (selectedMessage && !filteredMessages.some(msg => msg.id === selectedMessage.id)) {
        setShouldAutoPlay(false);
        setSelectedMessage({ ...filteredMessages[0], index: 0 });
      }
      // else, keep the current selection (even if search is active)
    } else {
      setSelectedMessage(null);
    }
  }, [open, filteredMessages]);


  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={handleCloseOverlay}>
        <div 
          className={`${styles.container} ${selectedMessage ? styles.containerExpanded : ''}`}
          onClick={(e) => e.stopPropagation()}
        >

      <div className={styles.assignSearchContainer}>
        <div className={styles.yetToAssignContainer}>
          <h3 className={styles.heading}> {HEART_FELT_Message} ({totalRecordCount})</h3>

          <div className={styles.searchBlock}>
            <button className={styles.searchIcon} data-testid="search-button" onClick={onClearSearch}>
              <img src={searchIcon} alt="search icon" />
            </button>
            <div className={styles.searchInputWrapper}>
              <CommonTextField
                placeholder={SEARCH_NAME_PLACEHOLDER}
                name=""
                className={styles.searchInput2}
                {...(searchString !== undefined ? { value: searchString } : {})}
                onChange={onSearchChange}
                onClear={onClearSearch}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </div>
      </div>

          <div className={styles.contentWrapper}>
            {filteredMessages && filteredMessages.length > 0 ? (
              <Box
                display="flex"
                flex="1"
                height="100%"
                paddingBottom="10px"
              >
                <div
                  className={styles.messageListSection}
                  ref={scrollRef}
                  onScroll={handleLoadMoreData}
                >
                  <>
                    {filteredMessages.map((msg, index) => {
                      const uniqueKey = `${msg.id}-${index}`;
                      return (
                        <React.Fragment key={uniqueKey}>
                          <div
                            className={`${styles.messageCard} ${
                              selectedMessage?.id === msg.id ? styles.messageCardSelected : ''
                            } ${msg.isViewed ? styles.messageCardViewed : ''}`}
                            onClick={() => handleViewMessage(msg, index)}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <div className={styles.avatarContainer}>
                                <div className={styles.imageContainer}>
                                  {msg.profileIcon && (
                                    <img
                                      src={msg.profileIcon}
                                      alt={msg.firstName + msg.lastName}
                                      className={styles.avatar}
                                    />
                                  )}
                                  <div
                                    className={styles.hoverEyePreview}
                                    onClick={(e) => handleImageClick(e, msg)}
                                  ></div>
                                </div>
                                <div className={styles.detailsContainer}>
                                  <p className={styles.name} title={`${msg.firstName} ${msg.lastName}`}>
                                    {`${msg.firstName} ${msg.lastName}`}
                                  </p>
                                  <div className={styles.dateContainer}>
                                  <p className={styles.date}>
                                    {msg.createdAt
                                      ? formatDateString(msg.createdAt)
                                      : DATE_PLACEHOLDER}
                                  </p>
                                  {msg.allocatedProgramName && (
                                    <>
                                      <span className={styles.separator}></span>
                                    <p className={styles.date}>
                                        From: {msg.allocatedProgramName}
                                    </p>
                                    </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className={styles.cardMeta}>
                                {msg.mediaType === RECORD_TYPE.VIDEO ? (
                                  <div className={styles.mediaIcon}>
                                    <img src={colouredVideoIcon} alt="videoIcon" />
                                    <span className={styles.watchText}>
                                      {msg.isViewed ? VIEWED : WATCH}
                                    </span>
                                  </div>
                                ) : msg.mediaType === RECORD_TYPE.MESSAGE && msg.message ? (
                                  <div className={styles.mediaIcon}>
                                    <img src={colouredMessageIcon} alt="envelopIcon" />
                                    <span className={styles.envelopeText}>
                                      {msg.isViewed ? VIEWED : READ}
                                    </span>
                                  </div>
                                ) : null}
                              </div>
                            </Box>
                          </div>
                          <div className={styles.cardSeparator} />
                        </React.Fragment>
                      );
                    })}
                  </>
                </div>

                <div
                className={`${styles.messageContentSection} ${
                  selectedMessage ? styles.messageContentSectionVisible : ''
                } ${activeSearchString && activeSearchString.trim().length > 0  && filteredMessages.length > 0 && !selectedMessage ? styles.messageContentSectionPlaceholder : ''}
                  ${isLoading ? styles.messageContentSectionPlaceholder : ''}`}
              >
                  {selectedMessage ? (
                    <>
                      {selectedMessage.mediaType === RECORD_TYPE.VIDEO ? (
                        <div className={styles.messageDetailContent}>
                          <div className={styles.messageMetaSection}>
                            <p className={styles.messageTitle}>
                              {HEARTFELT_MESSAGE_FROM(`${selectedMessage.firstName} ${selectedMessage.lastName}`, selectedMessage.allocatedProgramName || '')}
                            </p>
                          </div>
                          <video
                            ref={videoRef}
                            key={selectedMessage.id}
                            controlsList="nodownload"
                            controls
                            playsInline
                            webkit-playsinline="true"
                            preload="auto"
                            className={styles.video}
                            autoPlay={shouldAutoPlay}
                            onEnded={() => {
                              if (selectedMessage && !selectedMessage.isViewed && onMarkMessageViewed) {
                                onMarkMessageViewed(selectedMessage);
                              }
                            }}
                          >
                            <source src={selectedMessage.mediaUrl || undefined} type="video/mp4" />
                            <source src={selectedMessage.mediaUrl || undefined} type="video/webm" />
                            {BROWSER_DONT_CONTAIN_VIDEOTAG}
                          </video>
                        </div>
                      ) : (
                        <div className={styles.messageDetailContent}>
                          <div className={styles.messageMetaSection}>
                            <p className={styles.messageTitle}>
                              {HEARTFELT_MESSAGE_FROM(
                            `${selectedMessage.firstName} ${selectedMessage.lastName}`,
                                selectedMessage.allocatedProgramName || "",
                              )}
                            </p>
                          </div>
                          <div className={styles.message}>
                            {selectedMessage.message}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.placeholderContent}>
                      <img
                        src={selectSeekerIcon}
                        alt="select seeker"
                        className={styles.placeholderIcon}
                      />
                      <p className={styles.placeholderText}>
                        {SELECT_SEEKER_TO_VIEW}
                      </p>
                    </div>
                  )}
                </div>
              </Box>
            ) : (
              <div className={styles.noResultsContainer}>
                <img src={noSeekerFoundIcon} alt="no seekers" className={styles.noMessagesIcon} />
                <p className={styles.bannerPara}>
                  {activeSearchString && activeSearchString.trim().length > 0 
                    ? NO_SEEKER_FOUND_SEARCH_VALUE(activeSearchString) 
                    : NO_SEEKER_FOUND}
                </p>
              </div>
            )}
            {isLoading && loader === 0 && (
              <div className={styles.loaderOverlay}>
                <Loader type="default" />
              </div>
            )}
            <ImagePreview 
              imageUrl={previewImageUrl?.image} 
              altText={previewImageUrl?.altText || "Profile Image"} 
              setOpen={setOpenImage} 
              isOpen={openImage} 
              width={600}
              height={400}
            />
          </div>
        </div>
      </div>
      {showVideoModal && modalVideoData && (
        <div className={styles.overlayContainer}>
          <div
            className={styles.videoModalOverlay}
            onClick={handleCloseVideoModal}
          >
            <div
              className={styles.videoModalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.videoModalHeader}>
                <p>{RECORD_TYPE.MESSAGE}</p>
                <button
                  className={styles.videoModalClose}
                  onClick={handleCloseVideoModal}
                >
                  <img
                    className={styles.videoModalCloseIcon}
                    src={closeIcon}
                    alt="Close"
                  />
                </button>
              </div>
              <div className={styles.videoModalBody}>
                <video
                  controls
                  autoPlay
                  className={styles.videoModalPlayer}
                  controlsList="nodownload"
                  playsInline
                  webkit-playsinline="true"
                  preload="auto"
                  onEnded={() => {
                    if (
                      modalVideoData &&
                      !modalVideoData.isViewed &&
                      onMarkMessageViewed
                    ) {
                      onMarkMessageViewed(modalVideoData);
                    }
                  }}
                >
                  <source
                    src={modalVideoData.mediaUrl || undefined}
                    type="video/mp4"
                  />
                  {BROWSER_DONT_CONTAIN_VIDEOTAG}
                </video>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SeekerMessage;