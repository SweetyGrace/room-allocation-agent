import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.scss";
import pillars from "../../assets/images/pillers.png";
import infiniprayer from "../../assets/images/infini-prayer.png";
import mySpaceSvg from "../../assets/images/my-space-svg.svg";
import { Button } from "../../common/components/Button";
import hdbImg from "../../assets/images/hdb-img.png";
import infinipathImg from "../../assets/images/infinipath-img.png";
import entrainmentImg from "../../assets/images/entrainment-img.png";
import infiniprayeraudio from "../../assets/images/Infiniprayer.mp3"; // Adjust the path as necessary
import { fetchProgramsData, getStatusOfProgram } from "../../utils/dataMapper";
import { getItemInLocalStorage } from "../../services/localStorage";
import { useNavigate } from "react-router-dom";
import Loader from "../../common/components/Loader";
import { formatDatewithYear } from "../../utils/commonFunctions";

const InfiniPrayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const [programs, setPrograms] = useState<Array<any>>([]);
  const [loader, setLoader] = useState(false);
  const seekerDetails = getItemInLocalStorage("seekerDetails") || {};

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoader(true);
        const { programs, registrations } = await fetchProgramsData(
          seekerDetails.id,
        );
        const programRegsitrationStatus = getStatusOfProgram(
          programs,
          registrations,
        );
        setPrograms(programRegsitrationStatus);
        // setPrograms(programs);
        // setRegistrations(registrations);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
         setLoader(false);
      }
    };
   
    loadData();
  }, [seekerDetails.id]);

  // Parse your LRC format lyrics
  const [lyrics] = useState([
    { time: 4.81, text: "Feeling Thy presence" },
    { time: 9.02, text: "Feeling Thy grace" },
    { time: 13.58, text: "Feeling Thy radiance" },
    { time: 18.14, text: "You are my source of faith and strength" },
    { time: 22.17, text: "You are my path and destination" },
    { time: 27.16, text: "And i am always connected to You" },
    { time: 35.31, text: "Nothing of me and everything of You" },
    { time: 44.03, text: "Lead me higher..." },
    { time: 48.58, text: "Lead me deeper..." },
    { time: 53.21, text: "Lead me beyond..." },
    { time: 57.1, text: "Lead me to You." },
  ]);

  // Audio event listeners
  useEffect(() => {

    if (loader) return;
    const audio = audioRef.current;

    if (!audio) return;




    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentLyricIndex(-1);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", () => {
      updateTime();
    });
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [loader]);

  // Update current lyric based on audio time
  useEffect(() => {
    if (!isPlaying) return;
    const currentIndex = lyrics.findIndex((lyric, index) => {
      const nextLyric = lyrics[index + 1];
      return (
        currentTime >= lyric.time &&
        (!nextLyric || currentTime < nextLyric.time)
      );
    });

    setCurrentLyricIndex(currentIndex);
  }, [currentTime, isPlaying, lyrics]);

  const handleStart = async () => {
    
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const handleApproveSeekers = (id: unknown) => {
    navigate(`/admin/seat-allocations/${id}`);
  };

  const renderPillars = () => (
    <div className={styles.pillars_container}>
      <img src={pillars} alt="Three Pillars" className={styles.pillars_image} />
      <div className={styles.greeting_section}>
        <div className={styles.nameDiv}>Hi Venkat Tammareddy,</div>
        <div className={styles.nameDiv}>
          please pray and select your program to register
        </div>
      </div>
      <img
        src={infiniprayer}
        alt="Infinipath Prayer"
        className={styles.infiniprayer}
      />
    </div>
  );
  if (loader) {
    return <Loader type="large" />;
  }

  return (
    <div className={styles.main_view}>
      <div className={styles.main_content}>
        <div className={styles.user_section}>
          <img
            src={mySpaceSvg}
            alt="My Space"
            className={styles.my_space_icon}
          />
          <span className={styles.my_space}>my space</span>
        </div>

        {renderPillars()}

        <div className={styles.infiniprayer_section}>
          {!isPlaying && (
            <Button
              onClick={handleStart}
              buttonClassName={styles.startButton}
              buttonTextClassName={styles.confirmText}
            >
              start
            </Button>
          )}

          {/* Audio Lyrics Display */}
          {/* Audio Lyrics Display */}
          {isPlaying && (
            <div className={styles.prayer_text}>
              {Array.from({ length: 4 }, (_, i) => {
                const lyricIndex = Math.max(0, currentLyricIndex - 1) + i;
                const lyric = lyrics[lyricIndex];

                if (!lyric) return null;

                const isActive =
                  lyricIndex === currentLyricIndex ||
                  lyricIndex === currentLyricIndex + 1;
                const isCurrent = lyricIndex === currentLyricIndex;

                return (
                  <p
                    key={`${lyricIndex}-${lyric.time}`}
                    className={`${styles.prayer_line} ${isActive
                      ? isCurrent
                        ? styles.current_line
                        : styles.next_line
                      : styles.inactive_line
                      }`}
                  >
                    {lyric.text}
                  </p>
                );
              })}
            </div>
          )}


          {/* Hidden Audio Element */}
          <audio ref={audioRef} preload="metadata">
            <source src={infiniprayeraudio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
        {programs.length === 1 ? (
          <div className={`${styles.programs_grid} ${styles.one_card}`}>
            <div className={styles.program_card_one}>
              <img
                src={
                  infinipathImg
                }
                alt={programs[0].title}
                className={styles.program_icon_image_one}
              />
              {/* </div> */}
              <div className={styles.program_content_one}>
                <div className={styles.program_row}>
                  <p className={styles.program_subtitle_one}>
                    {programs[0].name}
                  </p>
                </div>

                <div className={styles.program_row}>
                  <p className={styles.program_subtitle_one}>
                    {programs[0].description}
                  </p>
                </div>

                <div className={styles.program_row}>
                  {programs[0].startDate && (
                    <p className={styles.program_subtitle_one}>
                      {formatDatewithYear(programs[0].startDate)} -{" "}
                      {formatDatewithYear(programs[0].endDate)}
                    </p>
                  )}
                </div>
              </div>
              <div className={styles.program_button_one}>
                <Button
                  onClick={() => handleApproveSeekers(program.id)}
                  buttonClassName={styles.confirmButton}
                  buttonTextClassName={styles.confirmText}
                >
                  approve seekers
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`${styles.programs_grid} ${programs.length === 2 ? styles.two_cards : styles.more_cards}`}
          >
            {programs
              .filter((program) => program.requiresApproval === true)
              .map((program) => (
                <div key={program.id} className={styles.program_card}>
                  <div className={styles.program_icon}>
                    <img
                      src={
                        infinipathImg
                      }
                      alt={program.title}
                      className={styles.program_icon_image}
                    />
                  </div>
                  <div className={styles.program_content}>
                    <p className={styles.program_subtitle}>{program.name}</p>
                    <p className={styles.program_subtitle}>
                      {program.description}
                    </p>
                    {program.startDate && (
                      <p className={styles.program_subtitle}>
                        {formatDatewithYear(program.startDate)} -{" "}
                        {formatDatewithYear(program.endDate)}
                      </p>
                    )}
                    <Button
                      onClick={() => handleApproveSeekers(program.id)}
                      buttonClassName={styles.confirmButton}
                      buttonTextClassName={styles.confirmText}
                    >
                      approve seekers
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniPrayer;
