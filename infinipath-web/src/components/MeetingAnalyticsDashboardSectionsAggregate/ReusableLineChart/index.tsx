import React, { useRef, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import styles from './index.module.scss';
import toggleOff from '../../../assets/images/toggle-off.svg';
import toggleOn from '../../../assets/images/toggle-on.svg';
import { setTotalAudience,setSessionType } from '../../../reducers/AnalyticsReducer';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { endPoints } from '../../../constants/urlConstants';
import { formatSingleDigit } from '../../../utils/commonFunctions';
import { VideoAttendanceDetails } from '../../MeetingAnalyticsDashboard/Analtyics.modal';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface RegisteredData {
  [day: string]: {
    registrations: number;
    downgrades: number;
    cancellations: number;
  };
}

interface VideoData {
  absentees: number;
  attendees: number;
  lateComers: number;
  rejoins: number;
  disabledVideo: number;
  dropOffs: number;
  downgrades: number;
  registrations: number;  
  cancellations: number;
  attendee: VideoAttendanceDetails[];
  registered: RegisteredData | null;
  [x: string]: number | string | VideoAttendanceDetails[] | RegisteredData | null;
}

interface NonVideoData {
  [x: string]: number | string | VideoAttendanceDetails[] | RegisteredData | null;
  absentees: number;
  attendees: number;
  lateComers: number;
  rejoins: number;
  disabledVideo: number;
  dropOffs: number;
  cancellations: number;
  registrations: number;
  attendee: VideoAttendanceDetails[];
  registered: RegisteredData | null;
}

interface DataProps {
  video: VideoData;
  nonVideo: NonVideoData;
}

interface LineChartProps {
  data: DataProps;
  title: string;
}

const ReusableLineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const chartRef = useRef<ChartJS<'line'> | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [selectedButton, setSelectedButton] = useState('attendees');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Process the data structure
  const currentData = isVideoEnabled ? data.video : data.nonVideo;  
  
  // Extract time labels from the first attendee/attended entry
  const timeLabels = isVideoEnabled 
    ? Object.keys(data.video.attendee[0] || {})
    : Object.keys(data.nonVideo.attendee[0] || {});
  
  // Extract day labels for registered data
    // Extract day labels for registered data
  const dayLabels = isVideoEnabled
    ? Object.keys(data.video.registered || {}) // Handle null case
    : Object.keys(data.nonVideo.registered || {}); // Handle null case

  // Process attendee/attended data for chart
  const getAttendanceValues = () => {
    if (isVideoEnabled) {
      return timeLabels.map(time => data.video.attendee[0][time]?.attendees || 0);
    } else {
      return timeLabels.map(time => data.nonVideo.attendee[0][time]?.attendees || 0);
    }
  };

  // Process registration data for chart
   const getRegistrationValues = () => {
    if (isVideoEnabled) {
      return dayLabels.map((day) => data.video.registered?.[day]?.registrations || 0);
    } else {
      return dayLabels.map((day) => data.nonVideo.registered?.[day]?.registrations || 0);
    }
  };

  // Set initial chart data
  const [chartData, setChartData] = useState({
    labels: selectedButton === 'attendees' ? timeLabels : dayLabels,
    datasets: [
      {
        label: 'Attendees',
        data: getAttendanceValues(),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(171, 219, 251, 0.2)',
        fill: true,
      },
    ],
  });

  // Update chart when data source changes
  useEffect(() => {
    if (selectedButton === 'attendees') {
      setChartData({
        labels: timeLabels,
        datasets: [
          {
            label: 'Attendees',
            data: getAttendanceValues(),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(171, 219, 251, 0.01)',
            fill: true,
          },
        ],
      });
    } else {
      setChartData({
        labels: dayLabels,
        datasets: [
          {
            label: 'Registered',
            data: getRegistrationValues(),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(171, 219, 251, 0.01)',
            fill: true,
          },
        ],
      });
    }
  }, [isVideoEnabled, selectedButton]);

  // Create gradient fill on chart render
   useEffect(() => {
    const chart = chartRef.current;
  
    if (chart) {
      const ctx = chart.ctx;
      const gradient = ctx.createLinearGradient(0, 0, chart.width, 0); // Horizontal gradient
      gradient.addColorStop(0, '#EAEBFF'); // Start color
      gradient.addColorStop(1, '#2F73F1'); // End color
  
      // Update the dataset's borderColor with the gradient
      chart.data.datasets[0].borderColor = gradient;
  
      // Ensure the line width is 2px
      chart.data.datasets[0].borderWidth = 2;
  
      chart.update();
    }
  }, [chartRef, chartData]);

  // Calculate totals
  const totalAbsentees = currentData.absentees;
  const totalLateComers = currentData.lateComers;
  const totalRejoins = currentData.rejoins;
  const totalDropoffs = currentData.dropOffs;
  const totalAttendees = isVideoEnabled ? currentData.attendees : currentData.attendees;
  const totalDowngrades = isVideoEnabled ? currentData.downgrades : 0;
  const totalCancellations = currentData.cancellations;
  const totalRegistrations = currentData.registrations;

  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
  
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: title,
      },
      tooltip: {
        enabled: true, // Enable tooltip
        mode: 'nearest' as const, // Show tooltip for the nearest data point
        intersect: false, // Show tooltip even if not directly over a point
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // White background
        titleBackgroundColor: "gray",
        titleAlign: "center" as const, // Center title
        titleColor: 'rgba(5, 27, 70, 1)', // Title color
        bodyColor: 'rgba(0, 0, 0, 0.87)', // Body color
        titleFont: {
          size: 16, // Title font size
        },
        bodyFont: {
          size: 14, // Body font size
        },
        padding: 10, // Padding
        callbacks: {
          title: (tooltipItems: {dataIndex: number}[]) => {
            const index = tooltipItems[0].dataIndex;
            const labels = chartData.labels;
            const currentLabel = labels[index];
            return `${currentLabel}`;
          },
          label: (tooltipItem: {dataIndex: number}) => {
            const index = tooltipItem.dataIndex;
            if (selectedButton === 'attendees') {
              return [
                `${isVideoEnabled?data.video.attendee[0][timeLabels[index]]?.absentees || 0 : data.nonVideo.attendee[0][timeLabels[index]]?.absentees || 0} Absentees`,
                `${isVideoEnabled?data.video.attendee[0][timeLabels[index]]?.dropOffs || 0 : data.nonVideo.attendee[0][timeLabels[index]]?.dropOffs || 0} Dropped off`,
                `${isVideoEnabled?data.video.attendee[0][timeLabels[index]]?.rejoins || 0 : data.nonVideo.attendee[0][timeLabels[index]]?.rejoins || 0} Rejoin(s)`,
                `${isVideoEnabled?data.video.attendee[0][timeLabels[index]]?.lateComers || 0 : data.nonVideo.attendee[0][timeLabels[index]]?.lateComers || 0} Late Comers`,
                // `${isVideoEnabled?data.video.attendee[0][timeLabels[index]]?.disabledVideo || 0 : data.nonVideo.attendee[0][timeLabels[index]]?.disabledVideo || 0} Disabled Video`,
              ];
            } else {
              const registeredData = isVideoEnabled ? data.video.registered : data.nonVideo.registered;
              const day = dayLabels[index];
              return [
                `${registeredData?.[day]?.registrations || 0} Registrations`,
                isVideoEnabled ? `${registeredData?.[day]?.downgrades || 0} Video downgrades` : '',
                `${registeredData?.[day]?.cancellations || 0} Cancellations`,
              ];
            }
          },
        },
        displayColors: false, // Hide the color box
      },
    },
    scales: {
      x: {
        grid: {
            display: true,
            borderDash: [10, 10],
            borderDashOffset: 0,
            color: 'rgba(0, 0, 0, 0.1)',
            drawTicks: true,  // This can help in some cases
            tickLength: 0,
        },
        border: {
          dash: [5, 5],
          display: true,
        },
        ticks: {
          display: true,
          
        },
        
      },
      y: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
      }
    },
  };

  const handleAttendeesClick = () => {
    setChartData({
      labels: timeLabels,
      datasets: [
        {
          label: 'Attendees',
          data: getAttendanceValues(),
          borderColor: 'rgba(47, 115, 241, 1)',
          backgroundColor: 'rgba(171, 219, 251, 0.1)',
          fill: true,
        },
      ],
    });
    setSelectedButton('attendees');
  };

  const handleRegisteredClick = () => {
    setChartData({
      labels: dayLabels,
      datasets: [
        {
          label: 'Registered',
          data: getRegistrationValues(),
          borderColor: 'rgba(47, 115, 241, 1)',
          backgroundColor: 'rgba(171, 219, 251, 0.1)',
          fill: true,
        },
      ],
    });
    setSelectedButton('registered');
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleAttendeesLabelClick = (label: string,value:number) => {
    const type = (isVideoEnabled ? 'panelist' : 'attendee')+ " - " + label;
    dispatch(setTotalAudience(value));
    dispatch(setSessionType(type));
    navigate(endPoints.analyticsSeekerDetails);
  }

  const handleRegisteredLabelClick = (label: string,value:number) => {
    const type = (isVideoEnabled ? 'panelist' : 'attendee')+ " - " + label;
    dispatch(setTotalAudience(value));
    dispatch(setSessionType(type));
    navigate(endPoints.analyticsSeekerDetails);
  }
  return (
    <div className={styles.lineChartContainer}>
      <div className={styles.chartInfo}>
        <div className={styles.chartTitle}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.toggleVideo}>
               <span style={{ fontWeight: isVideoEnabled ? 800 : 400 }}>video</span>
                <span className={styles.toggleVideo}>
                {isVideoEnabled ?
                <img src={toggleOff} alt="toggleOff" onClick={toggleVideo} /> :
                 <img src={toggleOn} alt="toggleOn" onClick={toggleVideo} /> }
                </span>
                <span style={{ fontWeight: !isVideoEnabled ? 800 : 400 }}>non-video</span>
            </div> 
        </div>
        {selectedButton === 'attendees' ? (
        <div className={styles.counts}>
            <div className={styles.countItems} onClick={()=> handleAttendeesLabelClick("Absentees",totalAbsentees)}><span className= {styles.countLabelRegistered}>{formatSingleDigit(totalAbsentees)}</span> <span className= {styles.labelTextlRegistered}> Absentees </span></div>
            <div className={styles.verticalLine}></div>
            <div className={styles.countItems} onClick={()=> handleAttendeesLabelClick("Drop off(s)",totalDropoffs)} ><span className= {styles.countLabelRegistered}>{formatSingleDigit(totalDropoffs)}</span><span className= {styles.labelTextlRegistered}> Drop off(s)</span></div>
            <div className={styles.verticalLine}></div>
            <div className={styles.countItems} onClick={()=> handleAttendeesLabelClick("Rejoin(s)",totalRejoins)} ><span className= {styles.countLabelRegistered}>{formatSingleDigit(totalRejoins)}</span> <span className= {styles.labelTextlRegistered}>Rejoin(s)</span></div>
            <div className={styles.verticalLine}></div>
            <div className={styles.countItems} onClick={()=> handleAttendeesLabelClick("Late comers",totalLateComers)}><span className= {styles.countLabelRegistered}>{formatSingleDigit(totalLateComers)}</span> <span className= {styles.labelTextlRegistered}>Late comers</span></div>
            {/* <div className={styles.verticalLine}></div> */}
            {/* <div className={styles.countItems} onClick={()=> handleAttendeesLabelClick("Disabled video",totalDisabledVideo)}><span className= {styles.countLabelRegistered}>{formatSingleDigit(totalDisabledVideo)}</span> <span className= {styles.labelTextlRegistered}>Disabled video</span></div> */}
            
        </div> ) : (
        <div className={styles.counts}>
            { isVideoEnabled ? (<div className={styles.countItems} onClick={()=> handleRegisteredLabelClick("Video downgrades",totalDowngrades as number)}> 
            <span className= {styles.countLabelRegistered}>{
              formatSingleDigit(totalDowngrades as number)
              } </span>
              <span className= {styles.labelTextlRegistered}>Video downgrades</span>
            </div>): null}
            {isVideoEnabled ? (<div className={styles.verticalLine}></div>):null}
            <div className={styles.countItems} onClick={()=> handleRegisteredLabelClick("Cancellations",totalCancellations)}>
            <span className= {styles.countLabelRegistered}> {
              formatSingleDigit(totalCancellations)
            } </span>
            <span className= {styles.labelTextlRegistered}>Cancellations</span>
            </div>
        </div>
        )}
      </div>
      
      <div className={styles.linehorizontalline}></div>
        <div className={((selectedButton === 'attendees' && totalAttendees > 0) || 
                    (selectedButton === 'registered' && totalRegistrations > 0)) 
                    ? styles.lineChartDetails 
                    : styles.noDataDetails}>
        <div className={styles.lineChartDetailsColumn}>
          <button 
            className={`${styles.chartButton} ${selectedButton === 'attendees' ? styles.selected : ''}`} 
            onClick={handleAttendeesClick}
            disabled={totalAttendees === 0}
          >
            <span className={styles.countlabel}>{formatSingleDigit(totalAttendees)}</span> Attended
          </button>
          <button 
            className={`${styles.chartButton} ${selectedButton === 'registered' ? styles.selected : ''}`} 
            onClick={handleRegisteredClick}
            disabled={totalRegistrations === 0}
          >
            <span className={styles.countlabel}>{formatSingleDigit(totalRegistrations)}</span> Registered
          </button>
        </div>
        {((selectedButton === 'attendees' && totalAttendees > 0) ||
          (selectedButton === 'registered' && totalRegistrations > 0)) ? (
          <div className={styles.lineChart}>
            <Line ref={chartRef} data={chartData} options={options} />
          </div>
        ) : (
          <div className={styles.noData}>No data available</div>
        )}
      </div>
    </div>
  );
};

export default ReusableLineChart;