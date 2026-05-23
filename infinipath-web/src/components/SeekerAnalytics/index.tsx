import { useEffect, useState } from "react";
import Loader from "../../common/components/Loader";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import { getCall } from "../../services/apiService";
import { BehaviourGraph } from "../BehaviourGraph";
import SeekerBarChart from "../seekerBarChart";
import styles from "./index.module.scss"
import MeetingsList from "../../common/components/AttendedInfinipaths";
import SeekersCircle from "../../common/components/SeekersFriendsFamily";
import SeekerKpiList from "../../common/components/SeekerKpiList";
import SeekerProfileDetails from "../../common/components/SeekerProfileDetails";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs, IconButton, Typography } from "@mui/material";
import back from '../../assets/images/Back.svg';
import { calculateOffset } from "../../utils/commonFunctions";
import { colorizeMahatriaInfinitheism } from "../../common/components/ColorizeMahatriaInfinitheism";

const SeekerAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(3);
  const [page, setPage] = useState(1);
  const [update, setUpdate] = useState(false);
  const { userId } = useParams();
  const [userData, setUserData] = useState([]);
  //fetch join details data
  const fetchSeekerData = () => {
    setLoading(true);
    const userIdsParam = JSON.stringify([userId]);
    const offset = calculateOffset(page, limit);
    getCall(endPoints.analyticsUsers(userIdsParam, limit, offset), undefined, INFINIPATH)
      .then((response: unknown) => {
        if (response?.data?.statusCode === 200) {
          setLoading(false);
          setUserData(response?.data?.data);
        } else {
          setLoading(false);
        }
      })
      .catch((error: unknown) => {
        setLoading(false);
        console.error("Error fetching data:", error);
      });
  };
  useEffect(() => {
    fetchSeekerData();
  }, [limit, page, update, userId]);

  
  const handleMembersNavigation = (id: number) => {
    navigate(`${endPoints.seekerAnalytics}/${id}`);
    setLimit(3);
    setPage(1);
    setUpdate(prev =>!prev)
  };


  const navigate = useNavigate();
  const seekerName = userData?.userData?.[0]?.fullName;
    const handleSessionsClick = async() => {
        navigate(-1);
    };
  return (
    
    <div className={styles.seekerAnalytics} >
         <div className={styles.breadcrumb}>
        <IconButton className={styles.backButton} onClick={handleSessionsClick}>
          <img src={back} alt="back" />
        </IconButton>
        <Breadcrumbs aria-label="breadcrumb">
          <div
            className={styles.breadcrumbTitle}
          >
            {colorizeMahatriaInfinitheism(seekerName)}&apos;s details
          </div>
          
        </Breadcrumbs>
      </div>
      
      <SeekerProfileDetails seekerProfileData={userData?.userData} totalSpentDuration={userData?.kpiData?.totalDuration} />
      <div>
        {seekerName && <div className={styles.kpiTitle}>{colorizeMahatriaInfinitheism(seekerName)}&apos;s insights as infinipath Loyalist </div> }
        <SeekerKpiList seekerKpiData={userData?.kpiData} />
      </div>
      <div className={styles.subContainer3}>
        <SeekerBarChart kpiData={userData?.kpiData} />
        <div className={styles.box1}> <BehaviourGraph kpiData={userData?.kpiData} seekerName={seekerName} /></div>
      </div>
      <div className={styles.subContainer3}>
        <MeetingsList seekersAttendedInfinipath={userData?.seekerWebinarData} limit={limit} setLimit={setLimit} page={page} setPage={setPage}/>
        <SeekersCircle seekersDataList={userData?.membersData} seekerName={seekerName} handleMemberNaviagtion = {(id) =>{
          handleMembersNavigation(id);
        }}/>
      </div>
      {
      loading && 
      <Loader type="large" /> 
     }
    </div>
  );
}

export default SeekerAnalytics;