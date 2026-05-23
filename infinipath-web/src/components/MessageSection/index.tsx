import { useEffect, useState } from "react";
import caretRight from "../../assets/images/caret-right.svg";
import caretDown from "../../assets/images/caret-down.svg";
import sendButtonBg from "../../assets/images/send-button-bg.svg";
import paperPlane from "../../assets/images/paper-plane-right.svg";
import styles from "./index.module.scss";
import UserCard from "../SeatApprovalFlow/SeekerDetailsOverlay/Common/UserCards";
import {  useParams } from "react-router-dom";
import CustomDropDown from "../../common/components/CustomDropDown";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import { getCall, postCall } from "../../services/apiService";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import { calculateAge } from "../../utils/commonFunctions";
import { useLocation, useNavigate } from "react-router-dom";
import { colorizeMahatriaInfinitheism } from "../../common/components/ColorizeMahatriaInfinitheism";
interface messageSectionProps {
    data: any,
    messageSectionClass?: any,
    defaultOpen?: boolean,
    isRequiredHeader?: boolean,
}

const MessageSection: React.FC<messageSectionProps> = ({ data, messageSectionClass, defaultOpen, isRequiredHeader = true }: any) => {
    const location = useLocation();
    const navigate = useNavigate();
    const purpose = location?.state?.purpose;
     const { programId } = useParams<{ programId: string }>();

    // Clear location state on mount
    useEffect(() => {
        if (location.state) {
            navigate(location.pathname, { replace: true });
        }
    }, []);

    const [openMessage, setOpenMessage] = useState(
        purpose === "messages" ? true : (defaultOpen || false)
    );
    const [userId, setUserId] = useState(0);
    const [postMessageVal, setPostMessageVal] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [messages, setMessages] = useState<any>();
    const [seekerData, setSeekerData] = useState({
        'age': calculateAge(data?.dob),
        'averageRating': "0",
        'blessedWith': "",
        'emailAddress': data?.emailAddress,
        'gender': data?.gender,
        'id': data?.id,
        'location': data?.city,
        'mobileNumber': data?.mobileNumber,
        'numberOfHDBs': data?.noOfHDBs,
        'paymentStatus': data?.paymentDetails ? data?.paymentDetails?.count > 0 ? data?.paymentDetails[0]?.paymentStatus : "" : "",
        'programId': data?.program?.id,
        'ratings': data?.ratings,
        'registrationStatus': data?.registrationStatus,
        'rmComments': "",
        'seekerName': data?.fullName,
        'travelPlanStatus': "",
        'createdAt': data?.registrationDate,
    });
    useEffect(() => {
        const userData = localStorage.getItem("seekerDetails");
        if (userData) {
            const data = JSON.parse(userData);
            setUserId(data.id);
        }
        getMessages();
        getUsers();
    }, []);
    useEffect(() => {
        setSeekerData({
            'age': calculateAge(data?.dob),
            'averageRating': "0",
            'blessedWith': "",
            'emailAddress': data?.emailAddress,
            'gender': data?.gender,
            'id': data?.id,
            'location': data?.city,
            'mobileNumber': data?.mobileNumber,
            'numberOfHDBs': data?.noOfHDBs,
            'paymentStatus': data?.paymentDetails ? data?.paymentDetails?.count > 0 ? data?.paymentDetails[0]?.paymentStatus : "" : "",
            'programId': data?.program?.id,
            'ratings': data?.ratings,
            'registrationStatus': data?.registrationStatus,
            'rmComments': "",
            'seekerName': data?.fullName,
            'travelPlanStatus': "",
            'createdAt': data?.registrationDate,
        });
        if (openMessage) {
            getUsers();
            getMessages();
        }
    }, [openMessage, data]);

    /**
     * Posts a message to the API with the selected user and message content.
     */
    const postMessage = async () => {
        const payload = {
            "programId": programId,
            "receiverId": selectedUser,
            "content": postMessageVal,
        };
        if (data?.userId) {
            payload.seekerId = data?.userId
        }
        try {
            const postResponse = await postCall(
                endPoints?.message,
                payload,
                PORTAL
            );
            if (postResponse?.status !== 201) {
                throw new Error("Failed to send the message");
            }
            setPostMessageVal("");
            getMessages();
        } catch (error) {
            console.error("Error sending the message:", error);
        }
    }

    /**
     * Fetches messages for the current program and seeker from the API.
     */
    const getMessages = async () => {
        try {
            if (data?.userId) {
                const response = await getCall(
                    endPoints?.message + `?program=${programId}&seeker=${data?.userId}&sort=ASC&offset=0&limit=50`,
                    undefined,
                    PORTAL
                );
                if (response?.status !== 200) {
                    throw new Error("Failed to fetch messages");
                }
                setMessages(response.data.data);
            } else {
            }

        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };
    const getUserId = () => {
        const userData = localStorage.getItem("seekerDetails");
        if (userData) {
            const data = JSON.parse(userData);
            setUserId(data.id);
            return data.id;
        }
        return 0;
    };

    /**
     * Fetches the list of users from the API and formats them for the dropdown.
     */
    const getUsers = async () => {

        const seekerId = getUserId();

        try {
            const response = await getCall(
                endPoints?.userList,
                undefined,
                PORTAL
            );
            if (response?.status !== 200) {
                throw new Error("Failed to fetch users");
            }
            const userList = response.data.data.map((user: any) => ({
                value: user.id,
                label: user.fullName,
            }));
            const updatedUserList = userList.filter((user: any) => user.value !== seekerId);
            const users = updatedUserList;
            setUsers(users);
            
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    return (
        <>
            {!openMessage && (
                <div className={styles.messageButtonSection} onClick={() => setOpenMessage(!openMessage)}>
                    <div className={styles.labelSection}>
                        <div className={styles.label}>Discussion on {seekerData?.seekerName}</div>
                        <img src={caretRight} alt="" />
                    </div>
                </div>
            )}
            {openMessage && (
                <div className={messageSectionClass ? `${styles.messageSectionOpen} ${messageSectionClass}` : `${styles.messageSectionOpen}`}>
                    {isRequiredHeader == true ? (
                        <>
                            <div className={styles.headerSection} onClick={() => setOpenMessage(!openMessage)}>
                                <div className={styles.label}>Discussion on {seekerData?.seekerName}</div>
                                <img src={caretDown} alt="" />
                            </div>
                        </>) : <></>
                    }

                    <div className={styles.messagesSection}>
                        {messages?.data?.map((message: any) => {
                            return (
                                message?.sender?.id === userId ?
                                    <div key={message.id} className={`${styles.messageCard} ${styles.sentCard}`}>
                                        <img
                                            src={message?.sender?.profileUrl || defaultProfileIcon}
                                            alt={message?.sender?.fullName}
                                            className={styles.senderAvatar}
                                        />
                                        <div className={styles.messageContentSection}>
                                            <div className={styles.messageHeader}>

                                                <div className={styles.senderName}>
                                                    {"You"}
                                                </div>
                                                <div className={styles.messageTime}>
                                                    {new Date(message.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className={styles.messageContent}>
                                                {colorizeMahatriaInfinitheism(message.content)}
                                            </div>
                                        </div>
                                    </div> :
                                    <div key={message.id} className={styles.messageCard}>
                                        <img
                                            src={message.sender.profileUrl || defaultProfileIcon}
                                            alt={message.sender.fullName}
                                            className={styles.senderAvatar}
                                        />
                                        <div className={styles.messageContentSection}>
                                            <div className={styles.messageHeader}>

                                                <div className={`${styles.senderName} ${message.sender.fullName === "Mahatria" ? styles.mahatria : ''}`} title={message.sender.fullName}>
                                                   {colorizeMahatriaInfinitheism(message.sender.fullName)}
                                                </div>
                                                <div className={styles.messageTime}>
                                                    {new Date(message.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className={styles.messageContent}>
                                                {colorizeMahatriaInfinitheism(message.content)}
                                            </div>
                                        </div>
                                    </div>
                            );
                        })}
                    </div>
                    <div className={styles.messageSendSection}>
                        <div className={styles.formGroup}>
                            <CustomDropDown
                                value={selectedUser}
                                onChange={(val: string) => setSelectedUser(val)}
                                options={users.map((items)=>({
                                    ...items,
                                    label : colorizeMahatriaInfinitheism(items.label)
                                }))}
                            
                                placeholder="Send to"
                                menuTop="100px"
                                width={355}
                                height={40}
                                isCustomed={true}
                                menuHeight="200px"
                              
                                menuSx={{
                                    position: 'fixed !important',
                                    top: "calc(100vh - 335px) !important",
                                    
                                    
                                }}
                               
                              

                                className={styles.selectField}
                            />
                        </div>
                        <div className={styles.sendMessage}>
                            <input
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPostMessageVal(value);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && postMessageVal.trim()) {
                                        postMessage();
                                    }
                                }}
                                value={postMessageVal}
                                id="message"
                                type="text"
                                className={styles.inputField}
                                placeholder="Type message"
                            />
                            <div className={styles.sendButton} onClick={postMessage}>
                                <img src={sendButtonBg} alt="" />
                                <img className={styles.sendButtonIcon} src={paperPlane} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
};

export default MessageSection;