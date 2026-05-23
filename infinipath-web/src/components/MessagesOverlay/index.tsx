import { useNavigate, useParams } from "react-router-dom";
import { colorizeMahatriaInfinitheism } from "../../common/components/ColorizeMahatriaInfinitheism";
import SideDrawerOverlay from "../SideOverLay";
import styles from './index.module.scss';
import defaultProfile from "../../assets/images/default-profile.svg";
import { useEffect, useState } from "react";
import { getCall } from "../../services/apiService";
import { endPoints, PORTAL } from "../../constants/urlConstants";

const MessageOverlay = ({onClose}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
     const { programId } = useParams<{ programId: string }>();

 useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await getCall(
          endPoints?.message + `?program=${programId}&sort=DESC`,
          undefined,
          PORTAL
        );
        if (response?.status !== 200) {
          throw new Error("Failed to fetch messages");
        }
        setMessages(response.data.data.data); 
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    if (programId) fetchMessages();
  }, [programId]);
     
    const handleNavigate = (params)=>{
          if (params.registrationId && programId) {
              navigate(
                `/admin/action-cards/registered/seeker-details/${params.registrationId}/${programId}`,
                { state: { purpose: "messages" } }

              );
            } else {
              alert("Unable to navigate");
            }
    }
  return (
    <div>
        <SideDrawerOverlay
        open={true}
        headerText="Messages"
        grayLine= {true}
        onClose={onClose}
        >
            <div className={styles.messageList}>
            {messages.map((msg:any) => (
              <div className={styles.messageContainer}>
                    <div className={styles.imageContainer}><img src={msg.receiver.profileUrl ? msg.receiver.profileUrl : defaultProfile} className={styles.image} /></div>
                    <div className={styles.messageContent}>
                        <div className={styles.name}><span>{colorizeMahatriaInfinitheism(msg.seeker.legalFullName)}</span>
                        <span className={styles.message}> "{msg.content}"</span>
                        </div>
                        <div className={styles.senderNameReply}>
                        <div className={styles.sender}>{ colorizeMahatriaInfinitheism(msg.sender.legalFullName)}</div>
                        <div className={styles.verticalLine}></div>
                        <div className={styles.reply} onClick={()=>handleNavigate(msg)} >reply</div>
                        </div>
                    </div>
            </div>
            ))}
            </div>
        </SideDrawerOverlay>
       
        
      
    </div>
  )
}

export default MessageOverlay
