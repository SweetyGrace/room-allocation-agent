/* eslint-disable react/prop-types */
import { useEffect, useRef, useState, createContext, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles from "./index.module.scss";
import filterIcon from "../../assets/images/filter-icon.svg";
import searchIcon from "../../assets/images/search.svg";
import crossIcon from "../../assets/images/crossIcon.svg";
import crossHoverIcon from "../../assets/images/crossIconHover.svg";
import clearIcon from "../../assets/images/cross-bg.svg";
import { useDispatch, useSelector } from "react-redux";
import pairIcon from "../../assets/images/pairIcon.svg";
import pairedIcon from "../../assets/images/pairedIcon.svg";
import unpairIcon from "../../assets/images/UnpairIcon.svg";
import { deleteCallWithLoader, getCall, getCallWithLoader, postCallWithLoader, putCallWithLoader } from "../../services/apiService";
import { Tooltip } from "@mui/material";
import {
  checkRoomisOccupied,
  editRoomAllocationForPair,
  getOtherRoommateId,
  handleRoomAllocateForPair,
  pairYetToAssignSeekers,
  parseRoomId,
  unallocateRoomForPair,
} from "./allocateRoomsUtils";
import RuleEnginePopUp from "../RuleEnginePopUp";
import BorderButton from "../../common/components/BorderButton";
import AlertDialog from "../../common/components/AlertDialogue";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import ImageAndText from "../ImageAndText";
import CustomModal from "../../common/components/CustomModal";
import { UpdateReloadType } from "../../reducers/FilterReducer";
import CommonTextField from "../../common/components/SearchField";
import SeekerOccupantCard from "../SeekerOccupantCard";
import SeekerCard from "../SeekerCard";
import RoomAllocationKPI from "../RoomAllocationKPI";
import RoomCard from "../RoomCard";
import Loader from "../../common/components/Loader";
import { abbreviateGender, calculateAge, getSortTooltipText, getValidFilters, handleReportDownload } from "../../utils/commonFunctions";
import { useParams } from "react-router-dom";
import CustomDropDown from "../../common/components/CustomDropDown";
import sortIcon from "../../assets/images/sort-icon.svg";
import arrowUp from "../../assets/images/arrow-up.svg";
import arrowDown from "../../assets/images/down-arrow.svg";
import CommonFilterPopUp from "../../common/components/CommonFilterPopUp";
import PreferredRoommateOverlay from "../../common/components/PreferredRoommateOverlay";
import { ERROR_MESSAGES , ERROR_STATUS_CODES, INVALID_SELECTION, KPI_FILTERS, RESERVED, ROOM_RESERVATION_MESSAGES, WARNING, WARNING_MESSAGES} from "../../constants";
import {KPIData,SortItem,SelectedFilters,SeekersFilters,OccupantSlotProps,RoomProps,UsersListProps,PairedUsersProps,UserComponentProps,FilterConfig,FilterDropdownsProps,} from "../../types/roomAllocation";
import type { User, Room } from '../../types/roomAllocation';
import { RootState } from "../../store";
import autoAllocateIcon from "../../assets/images/auto-allocate-icon.svg";
import rulesIcon from "../../assets/images/rules-icon.svg";
import { dropDownnJSON, FILTER_TYPES, textConstant } from "../../constants/textConstants";
import { notify } from "../../common/components/ToastMessage";
import appliedSort from "../../assets/images/applied-sort.svg";
import descendingSortIcon from "../../assets/images/ascending-sort.svg";
import ascendingSortIcon from "../../assets/images/descending-sort.svg";
import arrowDescendingIcon from "../../assets/images/arrows-ascending-up.svg";
import AIOverlay from "../../common/components/AI-overlay";
import infiniAiIcon from "../../assets/images/infiniAiIcon.svg";
import arrowAscendingIcon from "../../assets/images/arrows-descending-up.svg";
import DownloadReport from "../DownloadReportPopup";
import { Select, MenuItem } from "@mui/material";
import { downloadExcelFromApi } from "../../utils/downloadExcel";
import { DOWNLOAD_ERRORS } from "../../constants/textConstants";
import { normalizeValue, getFilteredOptions, getDefaultValue } from '../../services/roomAllocation';

const ItemType = {
  USER: "USER",
};

const PairContext = createContext();

//Unassigned drag for paired seekers in usersList
const User = ({
  user,
  setSelectedSeekers,
  selectedSeekers,
  pairCodes,
  index,
  users,
  setCheckReload,
  setToastState,
  dataLength,
  onShowAllMatches, 
  isOverlayOpen,
  setSkipRoom,
}: {
  user: User;
  setSelectedSeekers: React.Dispatch<React.SetStateAction<User[]>>;
  selectedSeekers: User[];
  pairCodes: Array<number>;
  index: number;
  users: User[];
  setCheckReload: React.Dispatch<React.SetStateAction<boolean>>;
  setToastState: React.Dispatch<
    React.SetStateAction<{ message: string; open: boolean }>
  >;
  dataLength: number;
  onShowAllMatches?: (preferredName: string, seekerId: string | number, user?: User) => void; // ADD: Type
  isOverlayOpen: boolean;
  setSkipRoom?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemType.USER,
      item: { user },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [user],
  );

  const handleSelectSeekers = (user: User) => {
    const selectedSeekerIds = selectedSeekers?.map((seeker) => seeker?.id);
    if (
      !user?.isPaired &&
      selectedSeekers?.[0]?.isPaired &&
      selectedSeekers?.[1]?.isPaired &&
      dataLength > 1
    ) {
      setSelectedSeekers([user]);
    } else if (
      user?.isPaired &&
      selectedSeekers?.[0]?.pairCode === user?.pairCode
    ) {
      setSelectedSeekers([]);
    } else if (user?.isPaired) {
      const seekerPairedWith = users?.filter(
        (item) => item?.pairCode === user?.pairCode,
      );
      setSelectedSeekers(seekerPairedWith);
    } else if (
      selectedSeekers?.length < 2 &&
      !selectedSeekers?.includes(user) &&
      dataLength > 1
    ) {
      setSelectedSeekers((prev) => [...prev, user]);
    } else if (selectedSeekerIds?.includes(user?.id)) {
      setSelectedSeekers((prev) =>
        prev.filter((seeker) => seeker?.id !== user?.id),
      );
    } else if (dataLength > 1) {
      notify(INVALID_SELECTION,WARNING_MESSAGES.SELECT_MAX_TWO_SEEKERS_TEXT, WARNING);
    }
  };

  return (
    <div className={styles.userCardContainer}>
      {user?.pairCode ? (
        <div
          className={` ${isDragging ? styles.userItemDragging : styles.notDragging}`}
          onClick={() => handleSelectSeekers(user)}
        >
          <SeekerCard
            profile={user.profile}
            gender={user.gender}
            name={user.name}
            age={user.age}
            city={user.city}
            selectedSeekerIds={selectedSeekers?.map((seeker) => seeker?.id)}
            userId={user.id}
            pairCodes={pairCodes}
            registrationPairId={user.registrationPairId}
            index={index}
            userPairCode={user?.pairCode}
            setCheckReload={setCheckReload}
            setSelectedSeekers={setSelectedSeekers}
            preferredRoomMate={user.preferredRoomMate || null}
            seekerId={user.programRegistrationId || user.id}
            onShowMatches={onShowAllMatches}
            hideRoommatePreference={isOverlayOpen}
            noOfHDBs={user.noOfHDBs}
            departureDatetime={user.departureDatetime}
            rmName={user.rmName}
            user={user}
            setSkipRoom={setSkipRoom}
          />
        </div>
      ) : (
        <div
          ref={drag}
          className={` ${isDragging ? styles.userItemDragging : ""}`}
          onClick={() => handleSelectSeekers(user)}
        >
          <SeekerCard
            profile={user.profile}
            gender={user.gender}
            name={user.name}
            age={user.age}
            city={user.city}
            selectedSeekerIds={selectedSeekers?.map((seeker) => seeker?.id)}
            userId={user.id}
            pairCodes={pairCodes}
            index={index}
            userPairCode={user?.pairCode}
            setCheckReload={setCheckReload}
            setSelectedSeekers={setSelectedSeekers}
            preferredRoomMate={user.preferredRoomMate || null}
            seekerId={user.programRegistrationId || user.id}
            onShowMatches={onShowAllMatches}
            hideRoommatePreference={isOverlayOpen}
            noOfHDBs={user.noOfHDBs}
            departureDatetime={user.departureDatetime}
            rmName={user.rmName}
            user={user}
            setSkipRoom={setSkipRoom}
          />
        </div>
      )}
    </div>
  );
};


//Unassigned drag for paired seekers in rooms
const OccupantSlot: React.FC<OccupantSlotProps> = ({
  occupantId,
  occupant,
  roomvalue,
  onDropUser,
  onCheckboxChange,
  roomId,
  clear,
  setIsClicked,
  isClicked,
  ispairHighlight,
  setIsPairHighlight,
  setToastState,
  onShowAllMatches,
  isOverlayOpen,
}) => {
  const handleCardClick = () => {
    setIsClicked(!isClicked);
    if (roomvalue) {
      roomvalue.occupants.map((item) => {
        if (item?.value?.programRegistrationId) {
          onCheckboxChange(!isClicked, item?.value, roomId, roomvalue.offsetNumber);
        }
      });
    }
  };
 const [saveDetail, setSaveDetail] = useState(false);
  useEffect(() => {
    setIsClicked(false);
  }, [clear]);

  const [{ isOver }, drop] = useDrop({
    accept: ItemType.USER,
    drop: (item: { user: User }) => onDropUser(item.user, occupantId, roomvalue),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  useEffect(() => {
    if(isOver){
      setIsPairHighlight(true)
    }
    else{
      setIsPairHighlight(false)
    }
  },[isOver])
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.USER,
    item: {
      user: occupant,
      sourceRoom: roomvalue,
    },
    canDrag: !!occupant,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <>
      {occupant?.isPaired ? (
        <div
          className={`${styles.occupantSlot} ${
            occupant ? styles.occupantSlotFilled : ""
          } ${isDragging ? styles.occupantSlotDragging : ""} ${saveDetail ? (isOver ? styles.occupantSlotHighlight : "") : ispairHighlight ? styles.occupantSlotHighlight : ""} `}
        >
          <div className={styles.roomBlock}>
            {occupant?.user?.fullName ? (
              <SeekerOccupantCard
                occupantProfile={occupant?.user?.profilePicture}
                occupantGender={abbreviateGender(
                  occupant?.user?.userDetail?.gender,
                )}
                occupantName={occupant?.user?.fullName}
                occupantAge={calculateAge(occupant?.user?.userDetail?.dob)}
                occupantCity={occupant?.user?.userDetail?.city}
                isClicked={isClicked}
                onCardClick={handleCardClick}
                setIsClicked={setIsClicked}
                seekerId={occupant?.programRegistrationId}
                preferredRoomMate={occupant?.preferredRoomMate|| null}
                onShowMatches={onShowAllMatches}
                hideRoommatePreference={isOverlayOpen}
                rmContactUser={occupant?.rmContactUser}
                departureDatetime={occupant?.departureDatetime}
                noOfHDBs={occupant?.noOfHDBs}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div
          ref={occupant ? drag : drop}
          className={`${styles.occupantSlot} ${
            occupant ? styles.occupantSlotFilled : ""
          } ${isDragging ? styles.occupantSlotDragging : ""} ${saveDetail ? (isOver ? styles.occupantSlotHighlight : "") : ispairHighlight ? styles.occupantSlotHighlight : ""} `}
        >
          <div className={styles.roomBlock}>
            {occupant?.user?.fullName ? (
              <SeekerOccupantCard
                occupantProfile={occupant?.user?.profilePicture}
                occupantGender={abbreviateGender(
                  occupant?.user?.userDetail?.gender,
                )}
                occupantName={occupant?.user?.fullName}
                occupantAge={calculateAge(occupant?.user?.userDetail?.dob)}
                occupantCity={occupant?.user?.userDetail?.city}
                isClicked={isClicked}
                onCardClick={handleCardClick}
                setIsClicked={setIsClicked}
                seekerId={occupant?.programRegistrationId}
                preferredRoomMate={occupant?.preferredRoomMate|| null}
                onShowMatches={onShowAllMatches}
                hideRoommatePreference={isOverlayOpen}
                rmContactUser={occupant?.rmContactUser}
                departureDatetime={occupant?.departureDatetime}
                noOfHDBs={occupant?.noOfHDBs}
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};
// Room Component

//Assigned drag for paired seekers in rooms
const Room = ({
  roomIndex,
  room,
  onDropUser,
  onCheckboxChange,
  clear,
  setClear,
  isChecked,
  setCheckReload,
  setCheckedOccupants,
  checkedOccupants,
  programId,
  subProgramId,
  setToastState,
  onShowAllMatches,
  isOverlayOpen,
  setSelectedSeekers,
  fetchRoomData,
  fetchApi,
  setSeekerOffset,
  setRoomOffset,
  roomOffset,
}: {
  roomIndex: boolean;
  room: Room;
  onDropUser: (user: User, occupantId: string | null, roomInfo?: Room) => void;
  onCheckboxChange: (
    isChecked: boolean,
    occupant: User | null,
    roomId: string,
    offsetNumber: number,
  ) => void;
  clear: boolean;
  setClear: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isChecked: any;
  setCheckReload: React.Dispatch<React.SetStateAction<boolean>>;
  setCheckedOccupants: React.Dispatch<React.SetStateAction<User[]>>;
  programId: string | number;
  subProgramId?: string | number | undefined;
  setToastState: React.Dispatch<React.SetStateAction<{ message: string; open: boolean }>>; 
  onShowAllMatches: (preferredName: string, seekerId: string | number) => void;
  checkedOccupants: User[];
  isOverlayOpen: boolean;
  setSelectedSeekers: React.Dispatch<React.SetStateAction<User[]>>;
  fetchRoomData: (isLoader: boolean) => void;
  fetchApi: (isLoader: boolean) => void;
  setSeekerOffset: React.Dispatch<React.SetStateAction<number>>;
  setRoomOffset: React.Dispatch<React.SetStateAction<number>>;
  roomOffset: number;

}) => {
  // const { isPaired, setIsPaired } = useContext(PairContext);
  const roomIdsChecked = isChecked?.map((item) => item?.roomId);
  const idStore = room?.occupants?.map((item) => item);
  const roomId = idStore[0]?.value;
  // console.log(roomId, "idStore");
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.USER,
    item: {
      user: roomId,
      sourceRoom: room,
    },
    canDrag: !!roomId,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  // const isPaired = isChecked?.map((item) => item.isPaired);
  // console.log("isPaired", isPaired);
  const [isClicked, setIsClicked] = useState(false);
  const [ispairHighlight, setIsPairHighlight] = useState(false);

  const pairSeekers = () => {
    const Ids = room?.occupants?.map(
      (item) => Number(item?.value?.programRegistrationId),
    );
    const payload = {
      programId: Number(programId),
      subProgramId: subProgramId,
      registrationIds: Ids,
    };


    postCallWithLoader(endPoints.createPair, payload, PORTAL, textConstant.LARGE)
      .then((response) => {
        console.log("Paired successfully", response, Ids);
        setIsClicked(false);
        setCheckedOccupants([]);
        setSelectedSeekers([]);
        // FIX: Trigger clear to reset all rooms
        setClear(prev => !prev);
      })
      .catch((error) => {
        console.error("Error pairing seekers", error);
        setIsClicked(false);
      })
      .finally(() => {
        if(room?.offsetNumber === roomOffset){
        fetchRoomData(true);
        }
        else{
          setRoomOffset(room?.offsetNumber || 0);
        }
        fetchApi(true);
      });
  };

  const unpairSeekers = () => {
    let pairMapsId = null;
    for (const occupant of room?.occupants || []) {
      if (occupant?.value?.pairMaps && occupant.value.pairMaps.length > 0) {
        pairMapsId = occupant.value.pairMaps[0]?.registrationPair?.id;
        break;
      }
    }
    
    if (!pairMapsId) {
      return;
    }

    deleteCallWithLoader(endPoints.deletePair(pairMapsId), undefined, PORTAL, textConstant.LARGE)
      .then((response) => {
        setIsClicked(false);
        setCheckedOccupants([]);
        setSelectedSeekers([]);
        // FIX: Trigger clear to reset all rooms
        setClear(prev => !prev);
        if(response){
          return;
        }
      })
      .catch((error) => {
        setIsClicked(false);
        if(error){
           return;
        }
      })
      .finally(() => {
        if(room?.offsetNumber === roomOffset){
          fetchRoomData(true);
          }
          else{
            setRoomOffset(room?.offsetNumber || 0);
          }
        fetchApi(true);
      });
  };

  // Calculate occupied beds
  const occupiedBedPositions = room?.occupants
    .filter((occupant) => occupant?.value !== null)
    .map((occupant) => occupant?.bedId); // Get the actual bed positions

  return (
      <div className={styles.floorRoomsSub}>
        <RoomCard 
          roomNumber={room?.roomId} 
          seperator={roomIndex ? false : true}
          capacity={room?.capacity}
          occupiedBedPositions={occupiedBedPositions} // CHANGE: Pass positions instead of count
          roomCategory={room?.roomCategory}
          roomStatus={room?.roomStatus} 
        />
          {room?.occupants?.[0]?.value?.isPaired ? (
            <div className={styles.roomOccupants} ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
              {isChecked?.length > 0 &&
              roomIdsChecked?.includes(room.roomId) &&
              room?.remainingOccupancy === 0 &&
              isClicked ? (
                <div className={styles.pairingButtons}>
                  {room?.occupants?.[0]?.value?.isPaired ? (
                    <img
                      src={unpairIcon}
                      alt="unpair Icon"
                      onClick={() => unpairSeekers()}
                    />
                  ) : (
                    <img
                      src={pairIcon}
                      alt="pair icon"
                      onClick={() => pairSeekers()}
                    />
                  )}
                </div>
              ) : null}

              {/* Only show the paired icon if the pairing button is not shown */}
              {!(
                isChecked?.length > 0 &&
                roomIdsChecked?.includes(room.roomId) &&
                room?.remainingOccupancy === 0 &&
                isClicked
              ) && room?.occupants?.[0]?.value?.isPaired === true ? (
                <div className={styles.pairedButton}>
                  <img src={pairedIcon} alt="paired icon" />
                </div>
              ) : null}
              {room.occupants.map((occupant) => (
                <OccupantSlot
                  key={occupant.id}
                  roomvalue={room}
                  occupantId={occupant.id}
                  occupant={occupant.value}
                  onDropUser={onDropUser}
                  onCheckboxChange={onCheckboxChange}
                  roomId={room.roomId}
                  clear={clear}
                  isClicked={isClicked}
                  setIsClicked={setIsClicked}
                  ispairHighlight={ispairHighlight}
                  setIsPairHighlight={setIsPairHighlight}
                  setToastState={setToastState}
                  onShowAllMatches={onShowAllMatches}  
                  isOverlayOpen={isOverlayOpen}   
                />
              ))}
            </div>
          ) : (
            <div className={styles.roomOccupants}>
              {isChecked?.length > 0 &&
              roomIdsChecked?.includes(room.roomId) &&
              room?.remainingOccupancy === 0 &&
              isClicked ? (
                <div className={styles.pairingButtons}>
                  {room?.occupants?.[0]?.value?.isPaired ? (
                    <img
                      src={unpairIcon}
                      alt="unpair Icon"
                      onClick={() => unpairSeekers(room?.roomId)}
                    />
                  ) : (
                    <img
                      src={pairIcon}
                      alt="pair icon"
                      onClick={() => pairSeekers()}
                    />
                  )}
                </div>
              ) : null}

              {/* Only show the paired icon if the pairing button is not shown */}
              {!(
                isChecked?.length > 0 &&
                roomIdsChecked?.includes(room.roomId) &&
                room?.remainingOccupancy === 0 &&
                isClicked
              ) && room?.occupants?.[0]?.value?.isPaired === true ? (
                <div className={styles.pairedButton}>
                  <img src={pairedIcon} alt="paired icon" />
                </div>
              ) : null}
              {room.occupants.map((occupant) => (
                <OccupantSlot
                  key={occupant.id}
                  roomvalue={room}
                  occupantId={occupant.id}
                  occupant={occupant.value}
                  onDropUser={onDropUser}
                  onCheckboxChange={onCheckboxChange}
                  roomId={room.roomId}
                  clear={clear}
                  isClicked={isClicked}
                  setIsClicked={setIsClicked}
                  ispairHighlight={ispairHighlight}
                  setIsPairHighlight={setIsPairHighlight}
                  setToastState={setToastState}
                  onShowAllMatches={onShowAllMatches}
                  isOverlayOpen={isOverlayOpen}
                />
              ))}
            </div>
          )}
      </div>
  );
};

//made seperate component to get drag for the paired seekers div in userslist
//Assigned drag for paired seekers in usersList
const PairedUsers: React.FC<PairedUsersProps> = ({
  user1,
  user2,
  selectedSeekers,
  setSelectedSeekers,
  pairCodes,
  setCheckReload,
  setToastState,
  users,
  index,
  onShowAllMatches, 
  isOverlayOpen,
  setSkipRoom,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.USER,
    item: {
      user: user1,
      sourceRoom: undefined,
    },
    canDrag: !!user1,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  return (
    <div
      className={styles.pairedUsers}
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <User
        key={user1.id}
        user={user1}
        selectedSeekers={selectedSeekers}
        setSelectedSeekers={setSelectedSeekers}
        pairCodes={pairCodes}
        index={index}
        users={users}
        setCheckReload={setCheckReload}
        setToastState={setToastState}
        dataLength={users.length}
        onShowAllMatches={onShowAllMatches}
        isOverlayOpen={isOverlayOpen}
        setSkipRoom={setSkipRoom}
      />
      <User
        key={user2.id}
        user={user2}
        selectedSeekers={selectedSeekers}
        setSelectedSeekers={setSelectedSeekers}
        pairCodes={pairCodes}
        index={index + 1}
        users={users}
        setCheckReload={setCheckReload}
        setToastState={setToastState}
        dataLength={users.length}
        onShowAllMatches={onShowAllMatches} 
        isOverlayOpen={isOverlayOpen}
        setSkipRoom={setSkipRoom}
      />
    </div>
  );
};

const UsersList: React.FC<UsersListProps> = ({
  users,
  onDropUser,
  userListRef,
  setSearchValue,
  handleUserListScroll,
  setCheckReload,
  selectedSeekers,
  setSelectedSeekers,
  setToastState,
  dataLength,
  seekersFilters,
  setSeekersFilters,
  subProgramId,
  sortState,
  setSortState,
  onShowAllMatches, // ADD: New prop
  isOverlayOpen,
  programEndsAt,
  setSkipRoom,
}) => {
  const { programId } = useParams<{ programId: string }>();
  
  const [, drop] = useDrop<{ user: User; sourceRoom?: Room }>({
    accept: [ItemType.USER],
    drop: (item) => onDropUser(item.user, null, item.sourceRoom), // PASS: sourceRoom
  });
  
  const [search] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [pairCodes, setPairCodes] = useState<Array<number>>([]);
  const [seekerListFilterOpen, setSeekerListFilterOpen] = useState(false);
  const [filterData, setFilterData] = useState<any[]>([]); // Local state for filter data
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [reportOptions, setReportOptions] = useState<any[]>([]);

  // Fetch filter data on component mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        if (!programId || !subProgramId) return;
        
        const response = await getCall(
          `${endPoints.yetToAllocateFilters}?programId=${programId}&subProgramId=${subProgramId}`
        );
         if (!response?.data?.data) {
           if (
             response?.data?.statusCode === ERROR_STATUS_CODES.BAD_REQUEST || response?.data?.statusCode === ERROR_STATUS_CODES.UNAUTHORIZED || response?.data?.statusCode === ERROR_STATUS_CODES.FORBIDDEN || response?.data?.statusCode === ERROR_STATUS_CODES.INTERNAL_SERVER_ERROR || response?.data?.success === false
           ) {
             const errorMessage = response.data.message || response.data.error || ERROR_MESSAGES.FETCH_FILTER_DATA;
             setToastState({
               open: true,
               message: errorMessage,
             });
           }
           setFilterData([]);
           return;
         }
        
        const data = response.data.data;

        if (!data || !Array.isArray(data) || data.length === 0) {
          setFilterData([]);
          return;
        }

        setFilterData(data);
      } catch (error: any) {
        const errorMessage =error?.response?.data?.message ||error?.response?.data?.error ||error?.message || ERROR_MESSAGES.FETCH_FILTER_DATA;
        setToastState({
          open: true,
          message: errorMessage,
        });        
        setFilterData([]);
      }
    };

    fetchFilterData();
  }, [programId, subProgramId]);

  // Seeker filter modal handling
  const handleSeekerListFilterModal = () => {
    setSeekerListFilterOpen(!seekerListFilterOpen);
  };

  const handleSeekerFilterApplyClick = (newFilters: seekersFilters) => {
    setSeekersFilters(newFilters);
    handleSeekerListFilterModal();
  };

  const handlePairCode = (user: User) => {
    if (user?.pairCode && !pairCodes?.includes(user?.pairCode)) {
      setPairCodes((prev) => [...prev, user?.pairCode]);
    }
  };

  useEffect(() => {
    if (users.length > 0) {
      users.forEach((user) => handlePairCode(user));
    }
  }, [users]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
    setSearchValue(e.target.value);
  };

  // Flatten the selected filters
  const [flattenedFilters, setFlattenedFilters] = useState<string[]>([]);
  useEffect(() => {

    const flatFilters = Object.values(seekersFilters).flat();
    setFlattenedFilters(flatFilters);
  }, [seekersFilters]);

  const getSortState = (optionKey: string) => {
    return {
      isActive: sortState?.key === optionKey,
      order: sortState?.key === optionKey ? sortState.order : "asc",
    };
  };

  const getArrowDirection = (optionKey: string) => {
    const { order } = getSortState(optionKey);
    return order === "desc" ? arrowDown : arrowUp;
  };

  // Handle clicks outside sort dropdown
  useEffect(() => {
    if (!isSortDropdownOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortDropdownOpen]);

  // Handle single-select sort
  const handleSort = (sortKey: string) => {
    setSortState((prevState) => {
      // If clicking the same key
      if (prevState?.key === sortKey) {
        // Toggle: asc -> desc -> remove
        if (prevState.order === "asc") {
          return { key: sortKey, order: "desc" };
        } else {
          return  { key: sortKey, order: "asc" };
        }
      } else {
        // New key - set to asc
        return { key: sortKey, order: "asc" };
      }
    });

    setIsSortDropdownOpen(false);
  };

  return (
    <div ref={drop} className={styles.usersListContainer}>
      <div className={styles.assignSearchContainer}>
        <div className={styles.yetToAssignContainer}>
          {!search && (
            <h3 className={styles.heading}>{textConstant.YET_TO_ALLOCATE} ({dataLength})</h3>
          )}

          <div className={styles.searchBlock}>
            <button  className={styles.searchIcon} data-testid="search-button">
            <img
              src={searchIcon}
              alt="search icon"
            />
            </button>

              <CommonTextField
                placeholder={textConstant.SEARCH_SEEKER_TEXT}
                name=""
                className={styles.searchInput2}
                value={searchString}
                onChange={handleSearchChange}
                onClear={() => {
                  setSearchString("");
                  setSearchValue("");
                }}
              />

            <div className={styles.filterBlock}>
              <p className={styles.saperatorLine}></p>
              
              <Tooltip title="filters" arrow>
                <div className={styles.filterIcon}>
                  <ImageAndText
                    handleContainerClick={handleSeekerListFilterModal}
                    image={filterIcon}
                    text={""}
                  />
                  {flattenedFilters?.length > 0 && (
                    <div className={styles.grayRoundFilter}></div>
                  )}
                </div>
              </Tooltip>
              
              {/* Sort dropdown */}
              <div className={styles.sortContainer} ref={sortDropdownRef}>
                <Tooltip title={getSortTooltipText(sortState, filterData)} arrow>
                  <div className={styles.filterIcon}>
                    <img
                      src={
                        sortState 
                          ? (sortState.order === textConstant.LOWER_CASE_ASC ? arrowAscendingIcon : arrowDescendingIcon)
                          : sortIcon
                      }
                      alt={
                        sortState 
                          ? (sortState.order === textConstant.LOWER_CASE_ASC  ? textConstant.COMPLETE_ASC : textConstant.COMPLETE_DESC)
                          : textConstant.SORT
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isDropdownOpen) {
                          setIsDropdownOpen(false);
                        }
                        setIsSortDropdownOpen((prev) => !prev);
                      }}
                    />
                  </div>
                </Tooltip>
                
                {isSortDropdownOpen && filterData.length > 0 && (
                  <div className={styles.dropdownMenu}>
                    {filterData
                      .filter((filter: any) => filter.sortable)
                      .map((option: any) => {
                        const { isActive, order } = getSortState(option.key);
                        
                        return (
                          <div
                            key={option.key}
                            className={`${styles.dropdownItemSort} ${isActive ? styles.selected : ""}`}
                            onClick={() => handleSort(option.key)}
                          >
                            <div className={styles.sortLabelContainer}>
                              {/* CHANGE: Always render the icon container, but conditionally show the icon */}
                              <div className={styles.sortIconContainer}>
                                {isActive && (
                                  <img
                                    src={order === textConstant.LOWER_CASE_ASC ? ascendingSortIcon : descendingSortIcon}
                                    alt={order === textConstant.LOWER_CASE_ASC ? textConstant.COMPLETE_ASC  : textConstant.COMPLETE_DESC}
                                    className={styles.sortIconLeft}
                                  />
                                )}
                              </div>
                              <span className={styles.optionName}>{option.label}</span>
                            </div>
                            
                            {/* Only show applied icon for active sort */}
                            {isActive && (
                              <img
                                src={appliedSort}
                                alt={textConstant.SORT}
                                className={styles.sortArrow}
                              />
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedSeekers?.length === 1 &&
      !selectedSeekers?.[0]?.isPaired &&
      dataLength > 1 && (
        <p className={styles.selectMsg}>Select another seeker to pair</p>
      ) }
        {selectedSeekers?.length === 0 &&
      dataLength > 1 && (
        <p className={styles.selectMsg}>Select seekers to pair</p>
      ) }
      
      {selectedSeekers?.length === 2 && !selectedSeekers?.[0]?.isPaired && (
        <div className={styles.pairSeekersBtn}>
          <BorderButton
            text="pair seekers"
            onClick={() =>
              pairYetToAssignSeekers(
                selectedSeekers,
                setCheckReload,
                setSkipRoom,
                setSelectedSeekers,
                programId,
                subProgramId,
              )
            }
          />
        </div>
      )}

      <div
        ref={userListRef}
        onScroll={handleUserListScroll}
        className={styles.usersContainer}
      >
        {users && users?.length > 0
          ? users.reduce(
              (
                acc: { elements: JSX.Element[]; skipNext: boolean },
                user,
                index,
              ) => {
                if (acc.skipNext) {
                  acc.skipNext = false;
                  return acc;
                }
                
                const hasPairCode =
                  user.pairCode !== undefined && user.pairCode !== null;
                if (hasPairCode && index + 1 < users.length) {
                  acc.elements.push(
                    <PairedUsers
                      key={`pair-${user.id}`}
                      user1={user}
                      user2={users[index + 1]}
                      selectedSeekers={selectedSeekers}
                      setSelectedSeekers={setSelectedSeekers}
                      pairCodes={pairCodes}
                      index={index}
                      users={users}
                      setCheckReload={setCheckReload}
                      setToastState={setToastState}
                      onShowAllMatches={onShowAllMatches} 
                      isOverlayOpen={isOverlayOpen}
                      setSkipRoom={setSkipRoom}
                    />,
                  );
                  acc.skipNext = true;
                } else {
                  acc.elements.push(
                    <div key={user.id} className={styles.usersCardd}>
                      <User
                        user={user}
                        selectedSeekers={selectedSeekers}
                        dataLength={dataLength}
                        setSelectedSeekers={setSelectedSeekers}
                        pairCodes={pairCodes}
                        index={index}
                        users={users}
                        setCheckReload={setCheckReload}
                        setToastState={setToastState}
                        onShowAllMatches={onShowAllMatches} 
                        isOverlayOpen={isOverlayOpen}
                        setSkipRoom={setSkipRoom}
                      />
                    </div>,
                  );
                }
                return acc;
              },
              { elements: [], skipNext: false },
            ).elements
          : searchString.length > 0 && (
              <p className={styles.notFound}>Seeker not found!</p>
            )}
        {users.length === 0 && (
          <p className={styles.seekernotFound}>No seekers</p>
        )}
      </div>

      {/* Modal for filter */}
      <CustomModal
        open={seekerListFilterOpen}
        handleClose={handleSeekerListFilterModal}
      >
        <CommonFilterPopUp
          selectedFilters={seekersFilters}
          onApplyClick={handleSeekerFilterApplyClick}
          onClose={handleSeekerListFilterModal}
          filterData={filterData}
          title="Filters"
          showLabels={false}
          programEndsAt={programEndsAt}
        />
      </CustomModal>
    </div>
  );
};



const FilterDropdowns: React.FC<FilterDropdownsProps> = ({
  filters,
  onFilterChange,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string;
  }>({});
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (!Array.isArray(filters) || filters.length === 0) return;
    
    setSelectedFilters(prev => {
      const newSelections: { [key: string]: string } = { ...prev };
      
      filters
        .filter((filter) => filter.type === "dropdown" && filter.filterable)
        .forEach((filter) => {
          // Only set default if this filter doesn't have a value yet
          if (!newSelections[filter.key]) {
            const defaultValue = getDefaultValue(filter);
            if (defaultValue) {
              newSelections[filter.key] = defaultValue;
            }
          } else {
            // Validate existing value is still in options
            const currentValue = newSelections[filter.key];
            // Normalize both sides for comparison
            const isValidOption = filter.options?.some(opt => normalizeValue(opt.value) === currentValue);
            if (!isValidOption) {
              // If current value is no longer valid, set to default based on new options
              const defaultValue = getDefaultValue(filter);
              if (defaultValue) {
                newSelections[filter.key] = defaultValue;
              } else {
                delete newSelections[filter.key];
              }
            }
          }
        });
      return newSelections;
    });
    
    setIsInitialized(true);
  }, [filters]);

  // Notify parent of changes only after initialization
  useEffect(() => {
    if (isInitialized && onFilterChange) {
      // Filter out null/empty values before notifying
       const validFilters = getValidFilters(selectedFilters);
      onFilterChange(validFilters);
    }
  }, [selectedFilters, isInitialized]);

  const handleDropdownChange = useCallback((filterKey: string, value: string) => {
    // Prevent null/empty values
    if (!value || value === "" || value === "null" || value === null) {
      return;
    }
    
    setSelectedFilters(prev => {
      const newSelections = { ...prev, [filterKey]: value };
      
      // Handle cascading: when venue changes, dependent filters will be reset by the filters useEffect
      // when new options come from API. Just update the current filter value here.
      
      return newSelections;
    });
  }, []);

  // Render filter based on type with separator
  const renderFilter = (filter: FilterConfig, index: number, totalFilters: number) => {
    if (filter.type === "dropdown" && filter.filterable) {
      const filteredOptions = getFilteredOptions(filter);
      
      // Normalize options to have consistent string values
      const normalizedOptions = filteredOptions.map(opt => ({
        ...opt,
        value: normalizeValue(opt.value)
      }));
      
      const currentValue = selectedFilters[filter.key] || "";
      
      return (
        <div key={filter.key} className={styles.filterWithSeparator}>
          <CustomDropDown
            value={currentValue}
            onChange={(value) => handleDropdownChange(filter.key, value)}
            options={normalizedOptions}
            height={28}
            width="auto"
            className={styles.filterDropdown}
            placeholder={filter.label || "Select"}
          />
          {/* ADD: Separator after each dropdown except the last one */}
          {index < totalFilters - 1 && (
            <div className={styles.separator}></div>
          )}
        </div>
      );
    }
    return null;
  };

  const dropdownFilters = Array.isArray(filters)
    ? filters
        .filter((filter) => filter.type === FILTER_TYPES.DROPDOWN && filter.filterable)
        .sort((a, b) => a.order - b.order)
    : [];


  return (
    <>
      {dropdownFilters.length > 0 && (
        <div className={styles.dropdownFiltersContainer}>
          {dropdownFilters.map((filter, index) => 
            renderFilter(filter, index, dropdownFilters.length)
          )}
        </div>
      )}
    </>
  );
};

// Inside DragDropApp component
const DragDropApp = () => {
  const dispatch = useDispatch();
  // const
  const [rooms, setRooms] = useState<Room[]>([]);
  const [skipRoom, setSkipRoom] = useState(false);
const [kpivalue, setKpivalue] = useState<KPIData | null>(null);
  const [searchvalue, setSearchValue] = useState("");
  // ADD: Debounced search value
  const [reportOptions, setReportOptions] = useState<any[]>([]);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const reloadType = useSelector((state: any) => state.FilterData.reloadType);
  const [checkReload, setCheckReload] = useState(false);
  const [search, setSearch] = useState(false);
  // const [yetToAllocate, setYetToAllocate] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // ADD: Debounced search term for rooms
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [clear, setClear] = useState(false);
  const [checkedOccupants, setCheckedOccupants] = useState<User[]>([]);
  const [loader, setLoader] = useState(false);
  // const navigate = useNavigate();
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [dataLength, setDataLength] = useState(0);
  const [roomsDataLength, setRoomsDataLength] = useState(0);
  const [showDownloadReport, setShowDownloadReport] = useState(false);
  const [selectedMainFilter, setSelectedMainFilter] = useState("");
  const [toastState, setToastState] = useState({ message: "", open: false });
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    roomStatus: [],
  });
  const programEndsAt = useSelector(
    (state: RootState) => state.ProgramReducer.programEndsAt
  );
  // ADD: New state to store filter labels
  const [selectedFilterLabels, setSelectedFilterLabels] = useState<{
    [key: string]: string[];
  }>({});
  const [pairSeeker, setPairSeeker] = useState(false);
  const [selectedSeekers, setSelectedSeekers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [ruleEnginePopUpOpen, setRuleEnginePopUpOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  const [seekersFilters, setSeekersFilters] = useState<seekersFilters>({
    gender: [],
    age: [],
    location: [],
  });
  const { programId } = useParams<{ programId: string }>();
  const [roommateOverlay, setRoommateOverlay] = useState({
  isOpen: false,
  preferredName: "",
  seekerId: 0,
  user: {},
});
const handleDownload = async (reportName: string, selectedReport?: string) => {
  await handleReportDownload({
    reportName,
    selectedReport,
    selectedMainFilter,
    programId: programId!,
    subProgramId,
    selectedFilters,
    selectedDropdownFilters,
    kpivalue,
    debouncedSearchTerm,
    downloadEndpoint: endPoints.roomInventoryDownload,
    setToastState,
    onCloseModal: () => setShowDownloadReport(false),
    DOWNLOAD_ERRORS,
  });
};

const handleCloseOverlay = () => {
  setRoommateOverlay({
    isOpen: false,
    preferredName: "",
    seekerId: 0,
    user: {},
  });
};

const handleShowAllMatches = ( preferredName: string, seekerId: string | number, user?:User) => {
  setRoommateOverlay({
    isOpen: true,
    preferredName: preferredName,
    seekerId: Number(seekerId),
    user: user,
  });
};
  

  // ADD: State for filter data
  const [roomFilterData, setRoomFilterData] = useState<unknown[]>([]);


  const subProgramId = useSelector(
    (state: RootState) => state.ProgramReducer.subProgramId
  );

  const handleIconClick = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  // const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchTerm(e.target.value);
  // };
  const userListContainerRef = useRef<HTMLDivElement>(null);
  const [selectedDropdownFilters, setSelectedDropdownFilters] = useState<{
  [key: string]: string;
}>({});
  const [kpiData, setKpiData] = useState([]);
  const [allottedProgramRegIds, setAllottedProgramRegIds] = useState<Array<string>>([]);
  const [dropdownFilters, setDropdownFilters] = useState<unknown>([]);
  const [sortState, setSortState] = useState<{ key: string; order: "asc" | "desc" } | null>(null);
  const [seekerOffset, setSeekerOffset] = useState(0);
  const [roomOffset, setRoomOffset] = useState(0);
  

const tranformUsersData = (totalUsers:User) => {
    const transformedData = totalUsers.map((item) => {
      return {
        id: item?.programRegistrationId.toString(),
        name: item.user.fullName,
        age: calculateAge(item.user.userDetail.dob),
        gender:
          item.user.userDetail.gender.toLowerCase() === "male" ? "M" : "F",
        city: item.user?.userAddress?.address?.city,
        profile: item.user.userDetail.profilePicture || "",
        isPaired: item?.isPaired ? true : false,
        pairCode: item?.pairCode || null,
        registrationPairId: item?.registrationPairId || null,
        preferredRoomMate: item?.preferredRoomMate || null, 
        programRegistrationId: item?.programRegistrationId, 
        offsetNumber: item?.offsetNumber,
        noOfHDBs: item?.noOfHDBs || 0,
        departureDatetime: item?.departureDatetime || null,
        rmName: item?.rmName || null,
      };
    });
    return transformedData;
  };
 

  // ADD: Debounce effect for seeker search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchvalue);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchvalue]);

  // ADD: Debounce effect for room search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);



  const fetchApi = async (isLoader: boolean, overrideOffset?: number) => {
    try {
      if(!subProgramId || !programId){
        setDataLength(0);
        setUsers([]);
        return;
      }

      const effectiveOffset = overrideOffset ?? seekerOffset;
      // FIX: Use constant limit and variable offset
      let url = `${endPoints?.yetToAllocateList}?limit=20&offset=${effectiveOffset}&search=${debouncedSearchValue}`;
      
      if (programId) {
        url += `&programId=${programId}`;
      }
      
      // Build sort array in the required format
      if (sortState) {
        const sortParam = encodeURIComponent(JSON.stringify([{
          [sortState.key]: sortState.order
        }]));
        url += `&sort=${sortParam}`;
      }
      

      // FIX: Add safety check for seekersFilters
      const filtersToSend: any = {
        allocatedProgramId: subProgramId ? [subProgramId] : [],
      };
 

      // Only spread seekersFilters if it exists and has values
      if (seekersFilters && typeof seekersFilters === 'object') {
        Object.keys(seekersFilters).forEach(key => {
          if (seekersFilters[key] && seekersFilters[key].length > 0) {
            filtersToSend[key] = seekersFilters[key];
          }
        });
      }

      if (Object.values(filtersToSend).some((value) => Array.isArray(value) && value.length > 0)) {
        const filtersParam = encodeURIComponent(JSON.stringify(filtersToSend));
        url += `&filters=${filtersParam}`;
      }

      const response = await getCallWithLoader(url, undefined, PORTAL, textConstant.LARGE );
      
      // FIX: Add proper null/undefined checks
      if (!response || !response.data || !response.data.data) {
        setDataLength(0);
        setUsers([]);
        return;
      }

      const dataResp = response.data.data;
      
      // FIX: Check if data array exists before mapping
      if (!dataResp.data || !Array.isArray(dataResp.data)) {
        setDataLength(0);
        setUsers([]);
        return;
      }
      
      const transformedData = dataResp.data.map((item: any) => ({
        programRegistrationId: parseInt(item.id),
        isPaired: item?.pairCode ? true : false,
        pairCode: item?.pairCode || null,
        registrationPairId: item?.registrationPairId || null,
        preferredRoomMate: item?.preferredRoomMate || null, 
        user: {
          fullName: item.fullName || "",
          userDetail: {
            dob: item.dob || "",
            gender: item.gender?.toLowerCase() || "male",
            profilePicture: item?.profileUrl || "",
          },
          userAddress: {
            userAddressId: 0,
            address: {
              city: item.city === 'Other' ? item.otherCityName : item.city || ""
            }
          }
        },
        userPairMaps: [],
        offsetNumber: seekerOffset,
        noOfHDBs: item?.noOfHDBs || 0,
        departureDatetime: item?.departureDatetime || null,
        rmName: item?.rmName || null,
      }));
      
      setDataLength(dataResp?.total || 0);

      // FIX: Append new data instead of replacing
      const afterTranform = tranformUsersData(transformedData);
      if (effectiveOffset === 0) {
       setUsers(afterTranform);
      } else {
        setUsers(prev => {
          // If offset is beyond current array length, append new data
          if (seekerOffset >= prev.length) {
            return [...prev, ...afterTranform];
          }
          
          // Otherwise, replace items at specific offset positions
          const newData = [...prev];
          afterTranform.forEach((item, index) => {
            const targetIndex = seekerOffset + index;
            // Only replace if within bounds, otherwise append
            if (targetIndex < newData.length) {
              newData[targetIndex] = item;
            } else {
              newData.push(item);
            }
          });
          return newData;
        });
      }
      
    } catch (error) {
      console.error("Error in fetchApi:", error);
      setDataLength(0);
      setUsers([]);

    }
  };

  useEffect(() => {
    // Reset users and offset when subProgramId changes
    setUsers([]);
    setSeekerOffset(0);
    setCheckedOccupants([]);
    setSelectedSeekers([]);
    setClear(prev => !prev);
    setSortState(null);
  }, [subProgramId]);

  // UPDATE: useEffect to use seekerOffset
  useEffect(() => {
    setSelectedSeekers([]);
    if(seekerOffset === 0) {
      setUsers([]);
      fetchApi(true);
      return;
    }
    setUsers([]);
    setSeekerOffset(0)
  }, [debouncedSearchValue, seekersFilters, subProgramId, sortState]);

  useEffect(()=>{
    fetchApi(true);
  }, [seekerOffset])

      // ADD: Fetch room filter data
      useEffect(() => {
        const fetchRoomFilterData = async () => {
          try {
            if (!programId || !subProgramId) return;
            
            
            let url = `${endPoints.roomInventoryFilters}?programId=${programId}`;
            
            if (subProgramId) {
              url += `&subProgramId=${subProgramId}`;
            }
            
            url += '&type=all';
            
            const response = await getCallWithLoader(url, undefined, PORTAL, textConstant.LARGE );
            
            if (!response?.data?.data) {
              if (
                response?.data?.statusCode === ERROR_STATUS_CODES.BAD_REQUEST || response?.data?.statusCode === ERROR_STATUS_CODES.UNAUTHORIZED || response?.data?.statusCode === ERROR_STATUS_CODES.FORBIDDEN || response?.data?.statusCode === ERROR_STATUS_CODES.INTERNAL_SERVER_ERROR || response?.data?.success === false
              ) {
                const errorMessage = response.data.message || response.data.error ||  ERROR_MESSAGES.FETCH_FILTER_DATA;
                setToastState({
                  open: true,
                  message: errorMessage,
                });
              }
              setRoomFilterData([]);
              return;
            }

            const data = response.data.data;

            if (!data || !Array.isArray(data) || data.length === 0) {
              setRoomFilterData([]);
              return;
            }

            setRoomFilterData(data);
            
          } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || ERROR_MESSAGES.FETCH_FILTER_DATA;
            setToastState({
              open: true,
              message: errorMessage,
            });
            
            setRoomFilterData([]);
          }
        };
    
        fetchRoomFilterData();
      }, [programId, subProgramId]);
  

  const transformResponseToPreviousFormat = (newResponse: any) => {
    return newResponse.map((item: any) => ({
      roomInventoryId: item.id || "stubbed_roomInventoryId",
      propertyName: item.room?.floor?.block?.venue?.label || "stubbed_propertyName", 
      block: item.room?.floor?.block?.label || "stubbed_block",
      floor: item.room?.floor?.label || "stubbed_floor",
      room: item.room?.roomNumber || "stubbed_room",
      roomType: item.room?.roomType || "stubbed_roomType",
      occupancy: item.room?.occupancy || 0,
      roomStatus: item.roomStatus || "stubbed_roomStatus",
      venueId: item.room?.floor?.block?.venue?.address?.id || 0,
      roomCategory: item.roomCategory,
      remainingOccupancy: item.remainingOccupancy || 0,
      isReserved: item.isReserved,
      reservedFor: item.reservedFor,
      roomAllocations: item.roomAllocations ? item.roomAllocations.map((allocation: any) => ({
        roomAllocationId: allocation?.id,
        programRegistrationId: allocation.programRegistrationId,
        bedPosition: allocation.bedPosition?.toString() || allocation.bedPosition,
        registration: allocation.registration ? {
          programRegistrationId: allocation.registration.id || "stubbed_programRegistrationId",
          pairMaps: allocation?.registration?.registrationPairMaps,
          isPaired: allocation?.registration?.registrationPairMaps?.length > 0 || false,
          userId: "stubbed_userId",
          user: {
            fullName: allocation.registration.fullName || "stubbed_fullName",
            profilePicture: allocation.registration.profileUrl || "",
            userDetail: {
              gender: allocation.registration.gender || "stubbed_gender",
              dob: allocation?.registration?.dob || "",
              city: allocation.registration.city === "Other" ? allocation.registration.otherCityName : allocation.registration.city || "stubbed_city",
            },
            isPaired: allocation?.registration?.registrationPairMaps?.length > 0,
          },
          id: allocation.registration?.id,
              registrationSeqNumber: allocation.registration?.registrationSeqNumber,
              registrationStatus: allocation.registration?.registrationStatus,
              roomAllocationId: allocation?.id,
              countryName: allocation.registration?.countryName,
              emailAddress: allocation.registration?.emailAddress,
              mobileNumber: allocation.registration?.mobileNumber,
              preferredRoomMate: allocation.registration?.preferredRoomMate,
              registrationDate: allocation.registration?.registrationDate,
              rmContactUser: allocation.registration?.rmContactUser,
              departureDatetime: allocation.registration?.travelPlans?.[0]?.departureDatetime,
              noOfHDBs: allocation.registration?.noOfHDBs,
        } : null
      })) : [],
    }));
  };

  const fetchRoomData =async (isLoader: boolean, overrideOffset?: number) => {
    try {
      if(!subProgramId || !programId){
        setRooms([]);
        setKpiData([]);
        setRoomsDataLength(0);
        return;
      }

      const effectiveRoomOffset = overrideOffset ?? roomOffset;
      // FIX: Use constant limit and variable offset
      let url = `${endPoints?.roomInventoryListNew}?limit=20&offset=${effectiveRoomOffset}`;
      
      const filtersToSend: { [key: string]: any } = { ...selectedFilters };
      
      
      if (programId) {
        url += `&programId=${programId}`;
      }
      
      if (subProgramId) {
        url += `&subProgramId=${subProgramId}`;
      }
      
      // Add dropdown filter values to the request
      if (Object.keys(selectedDropdownFilters).length > 0) {
        Object.keys(selectedDropdownFilters).forEach((key) => {
          const value = selectedDropdownFilters[key];
          // Check for valid, non-null, non-empty values
          if (value && value !== "" && value !== "null" && value !== null && !isNaN(Number(value))) {
            filtersToSend[key] = [Number(value)];
          }
        });
      }
      if (kpivalue && kpivalue.type) {
        filtersToSend.roomStatus = kpivalue.type;
      } 
      
      if (Object.values(filtersToSend).some((value) => value.length > 0)) {
        const filtersParam = encodeURIComponent(JSON.stringify(filtersToSend));
        url += `&filters=${filtersParam}`;
      }
      
      // CHANGED: Use debouncedSearchTerm instead of searchTerm
      if (debouncedSearchTerm) {
        url += `&search=${debouncedSearchTerm}`;
      }

      const response = await getCallWithLoader(url, undefined, PORTAL, textConstant.LARGE  );
      
      if (!response?.data?.data) {
        if (
          response?.data?.statusCode === ERROR_STATUS_CODES.BAD_REQUEST || response?.data?.statusCode === ERROR_STATUS_CODES.UNAUTHORIZED || response?.data?.statusCode === ERROR_STATUS_CODES.FORBIDDEN ||response?.data?.statusCode === ERROR_STATUS_CODES.INTERNAL_SERVER_ERROR ||response?.data?.success === false
        ) {
          const errorMessage = response.data.message || response.data.error || ERROR_MESSAGES.FETCH_ROOM_INVENTORY_DATA;
          setToastState({
            open: true,
            message: errorMessage,
          });
        }
        setKpiData([]);
        setRooms([]);
        setRoomsDataLength(0);
        return;
      }

      const { kpis, data, filters, reports } = response.data.data;

       if (reports && Array.isArray(reports)) {
        setReportOptions(reports);
      }

      if (filters && Array.isArray(filters)) {
        const dropdownOnly = filters.filter(
          (filter: FilterConfig) => filter.type === "dropdown" && filter.filterable
        );
        
        setDropdownFilters(prev => {
          const hasChanged = JSON.stringify(prev) !== JSON.stringify(dropdownOnly);
          return hasChanged ? dropdownOnly : prev;
        });
      }
      const transformedApiData = transformResponseToPreviousFormat(data );
      const transformedKpiData = kpis.map((current: KPIData) => ({
        subheading: current.label,
        mainHeading: current.count.toString(),
        type: current.status,
        key: current.key,
      }));
    
      const transformedRoomData = transformedApiData.map((room) => {
        const capacity = room.occupancy;
        const occupants = [];
        const remainingOccupancy = room?.remainingOccupancy;

        for (let i = 1; i <= capacity; i++) {
          const allocation = room.roomAllocations?.find(
            (allocation) => allocation.bedPosition === `${i}`,
          );
          occupants.push({
            id: `${room.roomInventoryId}-${i}`,
            bedId: i,
            roomInventoryId: room.roomInventoryId,
            value: allocation ? allocation.registration : null,
          });
        }
        
        setRoomsDataLength(response.data.data.total);

        return {
          floor: room.floor,
          roomId: room.room,
          roomInventoryId: room.roomInventoryId,
          capacity,
          occupants,
          offsetNumber: roomOffset || 0,
          remainingOccupancy,
          roomCategory: room?.roomCategory,
          isReserved: room?.isReserved,
          roomStatus: room?.roomStatus,
          reservedFor: room?.reservedFor,
        };
      });

      setKpiData(transformedKpiData);
      // FIX: Append new data instead of replacing
      if (effectiveRoomOffset === 0) {
        setRooms(transformedRoomData);
      }
      else
      {
        setRooms(prev => {
          // If offset is beyond current array length, append new data
          if (effectiveRoomOffset >= prev.length) {
            return [...prev, ...transformedRoomData];
          }

          // Otherwise, replace items at specific offset positions
          const newData = [...prev];
          transformedRoomData.forEach((item, index) => {
            const targetIndex = effectiveRoomOffset + index;
            // Only replace if within bounds, otherwise append
            if (targetIndex < newData.length) {
              newData[targetIndex] = item;
            } else {
              newData.push(item);
            }
          });
          return newData;
        });
      }
   
      
      dispatch(UpdateReloadType());

      const allottedRegIds = transformedRoomData?.flatMap(
        (room: unknown) =>
          room?.occupants?.map(
            (item: unknown) => item?.value?.programRegistrationId,
          ) || [],
      );
      console.log("allottedRegIds", allottedRegIds);
      setAllottedProgramRegIds(allottedRegIds);
      setCheckReload(false);
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Error fetching room inventory data";
      setToastState({
        open: true,
        message: errorMessage,
      });
      
      setKpiData([]);
      setRooms([]);
      setRoomsDataLength(0);
      setCheckReload(false);
    }
  }
  // UPDATE: useEffect to use roomOffset
  useEffect(() => {
    // if(roomOffset === 0){
    //   fetchRoomData(true);
    // }
    setRoomOffset(0)
    console.log(selectedFilters, kpivalue, debouncedSearchTerm, programId, subProgramId, selectedDropdownFilters, "dependenciesss");
  }, [selectedFilters, kpivalue, debouncedSearchTerm, programId, subProgramId, selectedDropdownFilters]);


  // Separate useEffect for handling reload
  useEffect(() => {
    if (checkReload) {
      // Reset offsets first
      if(seekerOffset === 0){
        setUsers([]);
        fetchApi(true);
      }
      else{
        setUsers([]);
        setSeekerOffset(0);
      }
      // Generated by Copilot - Only update room if skipRoom is false
      if(!skipRoom){
        if(roomOffset === 0){
          fetchRoomData(true);
        }
        else{
          setRoomOffset(0);
        }
      }

      // Reset the reload flag
      setCheckReload(false);
      // Reset skipRoom flag after handling
      setSkipRoom(false);
    }
  }, [checkReload]);


  useEffect(()=>{
    fetchRoomData(true);
    setCheckReload(false);
  }, [roomOffset, programId, subProgramId]);
  useEffect(() => {
  if (kpiData && kpiData.length > 0) {
    setKpivalue(kpiData[0]);
  }
}, [subProgramId]); 
  function calculateAge(dob: string) {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  }

  const editRoomAllocation = (
    programRegistrationId: number,
    roomInventoryId: number,
    bedPosition: number,
    offsetNumber: number,
  ) => {
    const payload = {
      programId: Number(programId),
      subProgramId:subProgramId,
      updateAllocations: [
        {
          allocationId: programRegistrationId,
          newRoomInventoryId: roomInventoryId,
          bedPosition: bedPosition,
        },
      ],
    };
    putCallWithLoader(endPoints?.updateAllocations, payload, PORTAL, textConstant.LARGE )
      .then((response) => {
        console.log("Room allocation updated successfully", response);
      })
      .catch((error) => {
        console.error("Error updating room allocation", error);
      })
      .finally(() => {
        if(offsetNumber === roomOffset){
          fetchRoomData(true);
        }
        else{
          setRoomOffset(offsetNumber || 0);
        }
       fetchApi(true);
       
      });
  };

  const handleRoomAllocate = (
    programRegistrationId: number,
    roomInventoryId: number,
    bedPosition: number,
    offsetNumber: number,
    userOffsetNumber: number,
  ) => {
    const payload = {
      programId: Number(programId),
      subProgramId: subProgramId,
      registrations: [
        {
          registrationId: programRegistrationId,
          bedPosition: bedPosition,
        },
      ],
      roomInventoryId: roomInventoryId,

    };


    postCallWithLoader(endPoints?.roomAllocation, payload, PORTAL, textConstant.LARGE  )
      .then((response) => {
        if (response?.data?.statusCode && (response.data.statusCode == 400||response.data.statusCode == 404||response.data.statusCode == 409||response.data.statusCode == 422)) {
          const errorMessage = response.data.message || response.data.error || "Error allocating room";
          setToastState({
            open: true,
            message: errorMessage,
          });
          return;
        }

      })
      .catch((error) => {
        const errorMessage =error?.response?.data?.message ||error?.response?.data?.error ||error?.message ||"Error allocating room";
        setToastState({
          open: true,
          message: errorMessage,
        });
      })
      .finally(() => {
        if(offsetNumber === roomOffset){
          fetchRoomData(true);
        }
        else{
          setRoomOffset(offsetNumber || 0);
        }
        if(userOffsetNumber === seekerOffset){
          fetchApi(true);
        }
        else{
          setSeekerOffset(userOffsetNumber || 0);
        }
      });
  };
  // Generated by Copilot
function scrollToRoomIdBlock(roomId: string) {
    const roomBlocks = document.querySelectorAll(`.${styles.floorRoomsSub}`);
    for (const block of roomBlocks) {
        if (block.textContent?.includes(roomId)) {
            (block as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
            break;
        }
    }
}

  const handleRemoveFromRoom = () => {
    console.log("checkedOccupants", checkedOccupants);
    const checkedOccupantIds = checkedOccupants.map(
      (occ) => occ.roomAllocationId,
    );
    const userIds = checkedOccupants.map((occupant) => occupant.id);

    const hasMixedValues = (arr) =>
      arr.some((val) => val === undefined) &&
      arr.some((val) => val !== undefined);

    if (hasMixedValues(checkedOccupantIds) || hasMixedValues(userIds)) {
      console.error("seeker ids are undefined.");
      return;
    }

    const payloadIds =
      checkedOccupantIds.length > 0 && !checkedOccupantIds.includes(undefined)
        ? checkedOccupantIds
        : userIds;


    deleteCallWithLoader(endPoints?.clearRoom, {
      programId: Number(programId),
      allocationIds: payloadIds,
    },
    PORTAL,
    textConstant.LARGE
  )
      .then((response) => {
        setCheckedOccupants([]);
        setClear((prev) => !prev);
        dispatch(UpdateReloadType());
  const lowestRoomOccupant = checkedOccupants.reduce((minOcc, currentOcc) => {
  const currentRoomId = parseRoomId(currentOcc.roomId);
  const minRoomId = parseRoomId(minOcc.roomId);
  return currentRoomId < minRoomId ? currentOcc : minOcc;
}, checkedOccupants[0]);

const targetOffset = lowestRoomOccupant?.offsetNumber || 0;
  if (targetOffset === roomOffset || targetOffset === undefined) {
    fetchRoomData(true);
  } else {
    setRoomOffset(targetOffset);
   fetchRoomData(true);
    fetchApi(true);
    scrollToRoomIdBlock(lowestRoomOccupant?.roomId || "");

  }
      })
      .catch((error) => {
        console.error("Room unallocation failed!", error);
      })
  };

const handleDropUser = (user: User, newOccupantId: string | null, roomInfo?: Room) => {
  if (newOccupantId !== null && roomInfo) {
    const targetRoom = rooms?.find(room => 
      room?.occupants?.some(occupant => occupant.id === newOccupantId)
    );
    if (targetRoom?.isReserved === true || targetRoom?.roomStatus === RESERVED) {
      const reservedMessage = targetRoom?.reservedFor 
        ? `${ROOM_RESERVATION_MESSAGES.RESERVED_FOR} ${targetRoom?.reservedFor}`
        : ROOM_RESERVATION_MESSAGES.RESERVED_DEFAULT;
      
      notify(RESERVED, reservedMessage, WARNING);
      return;
    }
  }

    if (user?.isPaired) {
      const roomOccupied = checkRoomisOccupied(rooms, newOccupantId);

      if (newOccupantId === null && user.programRegistrationId) {
        // User is being dropped back to userlist
        
        const roommateIds = getOtherRoommateId(
          rooms,
          user?.roomAllocationId,
        );
        unallocateRoomForPair(roommateIds, programId, subProgramId, fetchRoomData, fetchApi, roomOffset, setRoomOffset, roomInfo?.offsetNumber);
        setClear((prev) => !prev);
        setSelectedSeekers([]);
        setCheckedOccupants([]);
      } else if (roomOccupied[1] === true && newOccupantId !== null) {
        setToastState({
          message: "Please choose another room that can accommodate two seekers",
          open: true,
        });
      } else if (newOccupantId !== null) {
        if (allottedProgramRegIds?.includes(user?.id)) {
          const newRoomInfo = roomInfo || rooms.find((room) =>
            room.occupants.some((occupant) => occupant.id === newOccupantId),
          );
          const roommateIds = getOtherRoommateId(
            rooms,
            user?.roomAllocationId,
          );
          editRoomAllocationForPair(
            roommateIds,
            newRoomInfo?.roomInventoryId,
            programId,
            subProgramId,
            fetchRoomData,
            fetchApi,
            roomOffset,
            setRoomOffset,
            newRoomInfo?.offsetNumber,
          );
          setClear((prev) => !prev);
          setSelectedSeekers([]);
          setCheckedOccupants([]);
        } else {
          const pairedIds = users
            .filter((item) => item?.pairCode === user?.pairCode)
            .map((item) => Number(item?.id));
            const newRoomInfo = roomInfo || rooms.find((room) =>
              room.occupants.some((occupant) => occupant.id === newOccupantId),
            );
          handleRoomAllocateForPair(
            pairedIds,
            newRoomInfo?.roomInventoryId,
            programId,
            subProgramId,
            fetchRoomData,
            fetchApi,
            roomOffset,
            setRoomOffset,
            newRoomInfo?.offsetNumber,
            user.offsetNumber,
            seekerOffset,
            setSeekerOffset,
          );
          setClear((prev) => !prev);
          setSelectedSeekers([]);
          setCheckedOccupants([]);
        }
      }
    } else {
      if(user.roomAllocationId === null) return ;
      if (newOccupantId === null && user.programRegistrationId ) {

        deleteCallWithLoader(endPoints?.clearRoom, {
          allocationIds: [user.roomAllocationId],
          programId: Number(programId),
          subProgramId: subProgramId,
        }, PORTAL, textConstant.LARGE)
          .then((response) => {
            console.log("API", response);
            setClear((prev) => !prev);
            setSelectedSeekers([]);
            dispatch(UpdateReloadType());

            // setUsers((prevUsers) => {
            //   const newUsers = [...prevUsers, ...checkedOccupants];
            //   newUsers.sort((a, b) => parseInt(a.id) - parseInt(b.id));
            //   return newUsers;
            // });

            setCheckedOccupants([]);
          })
          .catch((error) => {
            console.error("Room unallocation failed!", error);
          })
          .finally(() => {
            if(roomInfo?.offsetNumber === roomOffset || roomInfo?.offsetNumber === undefined){
            fetchRoomData(true);
            }
            else{
             setRoomOffset(roomInfo?.offsetNumber || 0);
             }
             fetchApi(true)
          });
      }

      if (newOccupantId !== null) {
        const newRoomInfo = roomInfo || rooms.find((room) =>
          room.occupants.some((occupant) => occupant.id === newOccupantId),
        );

        const bedId = newRoomInfo?.occupants.find(
          (occupant) => occupant.id === newOccupantId,
        );

        if (!newRoomInfo) {
          console.error("Room not found for occupantId:", newOccupantId);
          return;
        }

        if (!bedId) {
          console.error("Bed not found in room for occupantId:", newOccupantId);
          return;
        }

        if (user?.roomAllocationId) {
          
          editRoomAllocation(
            parseInt(user.roomAllocationId),
            newRoomInfo.roomInventoryId,
            bedId.bedId,
            newRoomInfo.offsetNumber,
          );
          
          setClear((prev) => !prev);
          setSelectedSeekers([]);
          setCheckedOccupants([]);
        }
        // If user is not allocated yet, create new allocation
        else if (user?.id) {
          setRooms((prevRooms: Room[]) =>
            prevRooms.map((room: Room) => ({
              ...room,
              occupants: room.occupants.map((occupant) =>
                occupant.id === newOccupantId
                  ? { ...occupant, value: user }
                  : occupant,
              ),
            })),
          );
          handleRoomAllocate(
            parseInt(user.id),
            newRoomInfo.roomInventoryId,
            bedId.bedId,
            newRoomInfo.offsetNumber,
            user.offsetNumber,
          );
          setClear((prev) => !prev);
          setSelectedSeekers([]);
          setCheckedOccupants([]);
        }
      } else {
        // Dropped back to user list
        setUsers((prevUsers) =>
          prevUsers.some((u) => u.id === user.id)
            ? prevUsers
            : [...prevUsers, user],
        );
      }
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const bottomReached = scrollTop + clientHeight >= scrollHeight;
    if (bottomReached) {
    }
  };

  const handleUserListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } =
      e.target as HTMLDivElement;
    
    // Check if scrolled to bottom
    if (scrollTop + clientHeight + 1 >= scrollHeight) {
      // Only load more if we haven't reached the total
      console.log("is seeker offset", seekerOffset, dataLength);
      if (seekerOffset+20 < dataLength) {
        setSeekerOffset(prev => prev + 20);
      }
    }
  };
  const handleRoomListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } =
      e.target as HTMLDivElement;
    
    // Check if scrolled to bottom
    if (scrollTop + clientHeight + 1 >= scrollHeight) {
      // Only load more if we haven't reached the total
      if (roomOffset+20 < roomsDataLength) {
        setRoomOffset(prev => prev + 20);
      }
    }
  };

  useEffect(() => {
    const scrollContainer = scrollableRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const [flattenedFilters, setFlattenedFilters] = useState<string[]>([]);

  const handleModal = () => {
    setShowModal(!showModal);
  };
  const handleRuleEngineModal = () => {
    setRuleEnginePopUpOpen(!ruleEnginePopUpOpen);
  };
  const handleApplyClick = (newFilters: SelectedFilters, filterLabels: { [key: string]: string[] }) => {
    setSelectedFilters(newFilters);
    setCheckedOccupants([]); // Clear checked occupants on filter apply
    setSelectedFilterLabels(filterLabels); // Store the labels
    handleModal();
  };

  // UPDATE: Use labels for display instead of values
  useEffect(() => {
    const flatFilters = Object.values(selectedFilterLabels)
      .flat()
      .filter(label => label); // Remove empty strings
    setFlattenedFilters(flatFilters);
  }, [selectedFilterLabels]);

  // UPDATE: Handle image click to remove filter by label
  const handleImageClick = (labelToRemove: string) => {
    const newSelectedFilters: SelectedFilters = { ...selectedFilters };
    const newSelectedLabels: { [key: string]: string[] } = { ...selectedFilterLabels };

    Object.keys(newSelectedFilters).forEach((key) => {
      if (!newSelectedLabels[key]) return;      
      // Find the index of the label to remove
      const labelIndex = newSelectedLabels[key]?.indexOf(labelToRemove);
      
      if (labelIndex !== -1 && labelIndex !== undefined) {
        // Check if this is a radio button (single value, not array)
        const isRadio = !Array.isArray(newSelectedFilters[key]) || 
                        (Array.isArray(newSelectedLabels[key]) && newSelectedLabels[key].length === 1);
        
        if (isRadio) {
          // For radio buttons, remove the entire filter
          delete newSelectedFilters[key];
          delete newSelectedLabels[key];
        } else {
          // For checkboxes/multi-select, remove the specific value
          if (Array.isArray(newSelectedFilters[key])) {
            (newSelectedFilters[key] as string[]).splice(labelIndex, 1);
          }
          // Remove the label
          newSelectedLabels[key]?.splice(labelIndex, 1);
          // Clean up empty arrays
          if (Array.isArray(newSelectedFilters[key]) && (newSelectedFilters[key] as string[]).length === 0) {
            delete newSelectedFilters[key];
            delete newSelectedLabels[key];
          }
        }
      }
    });

    setSelectedFilters(newSelectedFilters);
    setSelectedFilterLabels(newSelectedLabels);
  };

  const handleClearAll = () => {
    setSelectedFilters({
      floor: [],
      roomStatus: [],
      gender: [],
      age: [],
      location: [],
      roomType: [],
    });
    setSelectedFilterLabels({}); // Clear labels too
    if (kpiData && kpiData.length > 0) {
      setKpivalue(kpiData[0]);
    }
  };

  const handleCheckboxChange = (
    isChecked: boolean,
    occupant: User | null,
    roomId: string,
    offsetNumber:number
  ) => {
    if (isChecked) {
      setCheckedOccupants((prev) => [...prev, { ...occupant, roomId, offsetNumber }]);
    } else {
      setCheckedOccupants((prev) =>
        prev.filter((occ) => occ.id !== occupant?.id),
      );
    }
  };

  const renderButtons = () => {
    console.log("checkedOccupants in render", checkedOccupants);
    return (
      <div className={styles.clearAppliedContainer}>
        {checkedOccupants.length > 0 && (
          <BorderButton onClick={handleRemoveFromRoom} text={"clear room"} />
        )}
      </div>
    );
  };

  const autoAllocate = () => {
    const payload = {}
    postCallWithLoader(`${endPoints.autoAllocate}?programId=${programId}&subProgramId=${subProgramId}`, payload, PORTAL, textConstant.LARGE )
      .then((response) => {
        if(response){
          setCheckReload(true);
        }
      })
      .catch((error) => {
        console.error("Auto allocation failed", error);
      })
  };

 const handleDropdownFilterChange = useCallback((filters: { [key: string]: string }) => {
  setSelectedDropdownFilters(filters);
}, []); // Empty dependency array since it only updates state


  return (
    <>
     {<PairContext.Provider value={{ pairSeeker, setPairSeeker }}>
        <div className={styles.roomAllocation}>
          <DndProvider backend={HTML5Backend}>
            <div className={styles.backgroundImage}>
              <div className={styles.container}>
              <UsersList
                  userListRef={userListContainerRef}
                  users={users}
                  onDropUser={handleDropUser}
                  setSearchValue={setSearchValue}
                  handleUserListScroll={handleUserListScroll}
                  setCheckReload={setCheckReload}
                  selectedSeekers={selectedSeekers}
                  setSelectedSeekers={setSelectedSeekers}
                  setToastState={setToastState}
                  dataLength={dataLength}
                  seekersFilters={seekersFilters}
                  setSeekersFilters={setSeekersFilters}
                  subProgramId={subProgramId}
                  sortState={sortState}
                  setSortState={setSortState}
                  onShowAllMatches={handleShowAllMatches} 
                  isOverlayOpen={roommateOverlay.isOpen}
                  programEndsAt={programEndsAt}
                  setSkipRoom={setSkipRoom}
                />
                <div className={styles.leftRoomsContainer}>
                  <div className={styles.headingContainer}>
                    <div className={styles.resortContent}>
                      <FilterDropdowns
                          filters={dropdownFilters}
                          onFilterChange={handleDropdownFilterChange}
                        />
                      <div className={styles.resortContent}>
                      </div>
                    </div>
                    <div className={styles.filtersContainer}>
                      {search && (
                        <div className={styles.searchInputContainer}>
                          <input
                            type="text"
                            autoFocus
                            className={`${styles.searchInput} ${searchTerm ? styles.searchInputWithClear : ""}`}
                            data-testId="search-input"
                            placeholder={textConstant.SEARCH_TEXT}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          {searchTerm && (
                            <button
                              className={styles.clearIconButton}
                              onClick={() => {
                                setSearchTerm("");
                              }}
                            >
                              <img src={clearIcon} alt="clear" className={styles.clearIconImg} />
                            </button>
                          )}
                        </div>
                      )}
                      <Tooltip title="search" arrow>
                        <button className={styles.searchIconChange} data-testid="search-button">
                          <img
                            src={searchIcon}
                            alt="search"
                            data-testid="search-icon"
                            onClick={() => setSearch(!search)}
                          />
                        </button>
                      </Tooltip>
                      <Tooltip title="filters" arrow>
                        <div className={styles.filterIcon}>
                          <ImageAndText
                            handleContainerClick={handleModal}
                            image={filterIcon}
                            text={""}
                          />
                          {flattenedFilters.length > 0 && (
                            <div className={styles.grayRoundFilter}></div>
                          )}
                        </div>
                      </Tooltip>
                     <div className={styles.separator}></div>
                      <div
                        onClick={() => setShowDownloadReport(true)}
                        className={styles.downloadReportButton}
                      >
                        {textConstant.DOWNLOAD_REPORT}
                      </div>
                      <div className={styles.separator}></div>
                      <Tooltip title="Ask AI to allocate rooms" arrow>
                        <div
                          className={styles.askAiButton}
                          onClick={() => setIsAgentOpen(true)}
                        >
                          <img src={infiniAiIcon} alt="Ask AI" className={styles.askAiIcon} />
                          <span>Ask AI</span>
                        </div>
                      </Tooltip>
                      {/* <div className={styles.separator}></div> 
                      <div>
                        <Tooltip
                          title="auto allocate"
                          arrow
                          className={styles.refreshIcon}
                        >
                          <div>
                            <ImageAndText
                              handleContainerClick={autoAllocate}
                              image={autoAllocateIcon}
                              text={""}
                            />
                          </div>
                        </Tooltip>
                      </div>
                      <div>
                        <Tooltip
                          title="rules engine"
                          arrow
                          className={styles.refreshIcon}
                        >
                          <div>
                            <ImageAndText
                              handleContainerClick={handleRuleEngineModal}
                              image={rulesIcon}
                              text={""}
                            />
                          </div>
                        </Tooltip>
                      {/* </div> */}
                    </div>
                  </div>
                  
                  <div className={styles.roomAllocationContainer}>
                    <div className={styles.roomAllocationContainer}>
                      <div className={styles.roomsKPIContainer}>
                        {/* FilterDropdowns component - handles dropdown logic */}
                        {/* <FilterDropdowns
                          filters={dropdownFilters}
                          onFilterChange={handleDropdownFilterChange}
                        /> */}
                        <RoomAllocationKPI
                          handleKpiClick={(type) => {
                        setKpivalue(type);
                            setCheckedOccupants([]);
                            setClear((prev) => !prev);
                          }}
                          headingsData={kpiData}
                          activeKpi={kpivalue?.key || "ALL"}
                        />
                        <div
                          className={
                            checkedOccupants.length > 0 &&
                            flattenedFilters.length > 0
                              ? styles.filtersBlock
                              : styles.filterGap
                          }
                        >
                          {/* {checkedOccupants.length > 0 &&
                            flattenedFilters.length > 0 && (
                              <div className={styles.separator}></div>
                            )} */}
                    
                            <div className={styles.filterContainer}>
                             {flattenedFilters.length > 0 && ( <div className={styles.filterContainer}>
                                <div className={styles.filterAppliedContainer}>
                                  <p className={styles.filtersText}>
                                    Filters applied:
                                  </p>
                                  <div className={styles.filterChipsContainer}>
                                    {flattenedFilters
                                      .slice(0, 3)
                                      .map((filter, index) => (
                                        <ImageAndText
                                          additionalClassName={
                                            styles.filterChip
                                          }
                                          additionalTextClassName={
                                            styles.filterChipText
                                          }
                                          handleImageClick={() =>
                                            handleImageClick(filter)
                                          }
                                          key={index}
                                          image={crossIcon}
                                          hoverImage={crossHoverIcon}
                                          text={filter}
                                        />
                                      ))}

                                    {/* Show the "+X" for the remaining filters if there are more than 3 */}
                                    {flattenedFilters.length > 3 && (
                                      <div>
                                        <span className={styles.moreFiltersText}
                                        onClick={() => setShowModal(true)}
                                        >
                                          +{flattenedFilters.length - 3}
                                        </span>
                                      </div>
                                    )}
                               
                                  </div>
                                </div>
                                <p
                                  className={styles.clearAll}
                                  onClick={handleClearAll}
                                >
                                  clear all
                                </p>
                             
                              </div>)}
                           
                            </div>
                            <div className={styles.blockRoomsContainer}>
                       {renderButtons()}
                       </div>
                          {/* )} */}
                        </div>
                        <div className={styles.roomsContainer}>
                          <div
                            className={styles.floorsBlock}
                            ref={userListContainerRef}
                            onScroll={handleRoomListScroll}
                          >
                            {rooms?.length === 0 && (
                              <div className={styles.noRooms}> No rooms</div>
                            )}
                            {rooms?.map((room, index) => {
                              // CHANGE: Check if we should show the floor header
                              const showFloorHeader = index === 0 || rooms[index - 1]?.floor !== room.floor;
                              
                              return (
                                <div key={index}>
                                  {showFloorHeader && (
                                    <div className={styles.floorHeader}>
                                      <div className={styles.floorName}>{room.floor}</div>
                                    </div>
                                  )}
                                  <div className={styles.floorRooms}>
                                    <Room
                                      roomIndex={showFloorHeader}
                                      room={room}
                                      onDropUser={handleDropUser}
                                      onCheckboxChange={handleCheckboxChange}
                                      clear={clear}
                                      setClear={setClear}
                                      isChecked={checkedOccupants}
                                      setCheckReload={setCheckReload}
                                      setCheckedOccupants={setCheckedOccupants}
                                      checkedOccupants={checkedOccupants}
                                      programId={programId}
                                      subProgramId={subProgramId}
                                      setToastState={setToastState}
                                      onShowAllMatches={handleShowAllMatches} 
                                      isOverlayOpen={roommateOverlay.isOpen}
                                      setSelectedSeekers={setSelectedSeekers}
                                      fetchRoomData={fetchRoomData}
                                      fetchApi={fetchApi}
                                      setSeekerOffset={setSeekerOffset}
                                      setRoomOffset={setRoomOffset}
                                      roomOffset={roomOffset}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
             
              </div>
            </div>
          </DndProvider>
          <CustomModal open={showModal} handleClose={handleModal}>
            <CommonFilterPopUp
              selectedFilters={selectedFilters}
              selectedFilterLabels={selectedFilterLabels}
              onApplyClick={handleApplyClick}
              onClose={handleModal}
              filterData={roomFilterData}
              title="Filters"
              showLabels={true}
              programEndsAt={programEndsAt}
            />
          </CustomModal>
          {showDownloadReport && (
            <DownloadReport
              open={showDownloadReport}
              onClose={() => setShowDownloadReport(false)}
              valueSelected={dropDownnJSON.ALL.value}
              onContinue={(reportName: string, selectedReport?: string) => {
                handleDownload(reportName, selectedReport);
              }}
              totalRecords={roomsDataLength}
              reportOptions={reportOptions} 
            />
          )}
          <CustomModal
            open={ruleEnginePopUpOpen}
            handleClose={handleRuleEngineModal}
          >
            <RuleEnginePopUp onClose={handleRuleEngineModal} />
          </CustomModal>
        </div>
        <AlertDialog
          title={"Notification"}
          message={toastState.message}
          isOpen={toastState.open}
          setOpenToast={setToastState}
        />
        <PreferredRoommateOverlay
          isOpen={roommateOverlay.isOpen}
          onClose={handleCloseOverlay}
          preferredName={roommateOverlay.preferredName}
          seekerId={roommateOverlay.seekerId}
          programId={Number(programId)} 
          subProgramId={subProgramId ?? undefined} 
          setToastState={setToastState}
          roommateOverlayDetails={roommateOverlay}
          setCheckReload={setCheckReload}
        />
      </PairContext.Provider>}

      {/* Room Allocation AI Agent */}
      <AIOverlay
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        apiEndpoint={process.env.REACT_APP_ROOM_AGENT_URL}
        programId={programId}
        subProgramId={subProgramId}
        mode="room-agent"
        onAgentComplete={() => {
          fetchRoomData(true, 0);
          fetchApi(true, 0);
        }}
      />
    </>
  );
};

export default DragDropApp;
