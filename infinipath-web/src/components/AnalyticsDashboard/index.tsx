import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import HorizontalBarChart from "../HorizontalBarChart";
import VerticalBarChart from "../VerticalBarChart";
import PieChart from "../PieChart";
import PlatFormPieChart from "../PlatFormPieChart";
import AnalyticsDetailsContainer from "../AnalyticsDetailsContainer";
import AnalyticsBreadcrumb from "../AnalyticsBreadCrum";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import { getItemInLocalStorage } from "../../services/localStorage";
import { getCall } from "../../services/apiService";
import { useLocation } from "react-router-dom";
import {
  convertAgeDestribution,
  convertArrayToObject,
  customNumbersMethodOfAttendance,
  modifyAudienceDiscipline,
  modifyMethodOfAttendance,
} from "../../utils/commonFunctions";
// import JoinBar from '../JoinBar';
import Loader from "../../common/components/Loader";

const AnalyticsDashboard = () => {
  const location = useLocation();
  const meetingId = location?.state?.meetingId;
  const webinarTitle = location?.state?.webinarTitle;
  const [werbinarData, setWebinarData] = useState(null);
  const [loader, setLoader] = useState(false);
  
  const [webinarStartsAt, setWebinarStartsAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [kpiData, setKpiData] = useState();
  const [cityData, setCityData] = useState();
  const [agePercentages, setAgePercentages] = useState();
  const [audienceDisciplineData, setAudienceDisciplineData] = useState();
  const [methodOfAttendance, setMethodOfAttendance] = useState();
  const [customNumbers, setCustomNumbers] = useState();
  const [deviceData, setDeviceData] = useState();
  const fetchAnalyticsData = async () => {
    setLoader(true);
    const userData = getItemInLocalStorage("seekerDetails");
    const response = await getCall(
      `${endPoints.webinars}/${meetingId}/analytics?userId=${userData?.id}`,
      undefined,
      INFINIPATH
    )
      .then((response: unknown) => {
        if (response?.data?.statusCode === 200) {
          setWebinarData(response?.data?.data);
          setLoader(false);
        } else {
          console.error("Failed to fetch data");
          setLoader(false);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch data", error);
        setLoader(false);
      });
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (werbinarData !== null) {
      setWebinarStartsAt(werbinarData?.webinarData?.webinarStartAt);
      setDuration(werbinarData?.webinarData?.webinarDuration || 60);

      setKpiData(werbinarData?.kpiData);
      setCityData(werbinarData?.cityPercentages);
      const agesDestribution = convertAgeDestribution(
        werbinarData?.agePercentages,
      );
      setAgePercentages(agesDestribution);
      / setAudienceDisciplineData(werbinarData?.audienceDiscpline);
      const modifyMethodOfAttendanceData = modifyMethodOfAttendance(
        werbinarData?.methodOfAttendance,
      );
      const customNumbersData = customNumbersMethodOfAttendance(
        werbinarData?.methodOfAttendance,
      );
      setMethodOfAttendance(modifyMethodOfAttendanceData);
      setCustomNumbers(customNumbersData);

      const deviceDataReq = convertArrayToObject(werbinarData?.deviceKpiData);

      setDeviceData(deviceDataReq);

      const reqAudienceDiscipline = modifyAudienceDiscipline(
        werbinarData?.audienceDiscpline,
      );
      setAudienceDisciplineData(reqAudienceDiscipline);
    }
  }, [werbinarData]);

  return loader ? (
    <Loader type="large" />
  ) : werbinarData !== null ? (
    <div className={styles.dashboard}>
      <AnalyticsBreadcrumb
        webinarTitle={webinarTitle}
        webinarStartsAt={webinarStartsAt}
        duration={duration}
        data-testid="analytics-breadcrumb"
      />
      <AnalyticsDetailsContainer
        kpiData={kpiData}
        data-testid="kpi-container"
      />
      <>
        <HorizontalBarChart kpis={audienceDisciplineData} 
        data-testid="horizontal-bar-chart"
        />
        <VerticalBarChart
          joinArrays={methodOfAttendance}
          customNumbers={customNumbers}
          data-testid="vertical-bar-chart"
        />
      </>
      <>
        <PieChart cityData={cityData} agePercentagesData={agePercentages}
        data-testid="pie-chart"
        />
        <PlatFormPieChart deviceData={deviceData}
        data-testid="platform-pie-chart"
         />
      </>
    </div>
  ) : (
    <>
      <div className={styles.onlyBreadCrumb} data-testid="breadcrumb">
        <AnalyticsBreadcrumb webinarTitle={webinarTitle} data-testid="charts-container"  />
        <div data-testid="no-data">No analyitcs data found, please try again later</div>
      </div>
    </>
  );
};

export default AnalyticsDashboard;
