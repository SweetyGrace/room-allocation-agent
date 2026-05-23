import React from 'react';
import ReactPlayer from 'react-player';
import styles from './index.module.scss';

interface VideoSectionProps {
  videoSrc: string;
  poster?: string; 
  className?: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({ videoSrc, className }) => {
  return (
    videoSrc ? (<div className={`${styles.videoContainer} ${className || ''}`}>
      <ReactPlayer
        url={videoSrc}
        width="100%"
        height="100%"
        controls={true}
        playIcon={<button className={styles.playButton}>Play</button>}
      />
    </div>) : null
  );
};

export default VideoSection;