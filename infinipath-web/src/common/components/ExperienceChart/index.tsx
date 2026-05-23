import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import styles from "./index.module.scss";
import LegendItem from "../LegendItem";
import { baseColors } from "../../../constants";
import { getCall } from "../../../services/apiService";
import { endPoints, PORTAL } from "../../../constants/urlConstants";
import { NO_EXPERIENCE, OTHER_EXPERIENCES } from "../../../constants/textConstants";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";

const FIXED_Y_POSITION = 25;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_COLOR = "#16A34A";
const HOVER_TOLERANCE = 0.1; // Within ~1.2 months

interface TimelineResponse {
  data: {
    firstParticipationDate: string;
    latestParticipationDate: string;
    yearWiseParticipation: Array<{
      year: number;
      programsCount: number;
      programs: Array<{
        programId: string;
        programName: string;
        subProgramName: string | null;
        year: number;
      }>;
    }>;
    allPrograms: Array<{
      programId: string;
      programStartsAt: string | null;
      programEndsAt: string | null;
      subProgramName: string | null;
      programName: string;
      subProgramType?: string;
    }>;
    totalYearsParticipated: number;
    whichOfTheFollowingHaveYouExperienced?: string;
    userProgramExperiences?: any[];
    associationQuestions?: Array<{
      label: string;
      answer: string;
      order?: number;
      [key: string]: any;
    }>;
  };
}
const calculateLatestDate = (timelineResponse: TimelineResponse | null) => {
  if (!timelineResponse?.data?.allPrograms) return new Date();

  const allDates = timelineResponse.data.allPrograms.reduce(
    (dates: Date[], program) => {
      if (program?.programStartsAt) {
        dates.push(new Date(program.programStartsAt));
      }
      if (program?.programEndsAt) {
        dates.push(new Date(program.programEndsAt));
      }
      return dates;
    },
    [],
  );

  if (allDates.length === 0) return new Date();
  return new Date(Math.max(...allDates.map((date) => date.getTime())));
};

// Helper to format subProgramType for display (removes "PST_" prefix)
const formatProgramType = (type: string) => {
  if (!type) return "";
  const raw = type.replace(/^PST_/, "");
  if (raw.toLowerCase().startsWith("i")) {
    return raw.toLowerCase();
  }
  if (["HDB", "MSD", "TAT"].includes(raw.toUpperCase())) {
    return raw.toUpperCase();
  }
  if (raw.toUpperCase() === "MYZAXIS") {
    return "My Z Axis";
  }
  // For other names, capitalize first letter, rest lowercase
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

// Helper to format userProgramExperiences as comma separated labels
const formatUserProgramExperiences = (userProgramExperiences?: any[]): string => {
  if (!userProgramExperiences || userProgramExperiences.length === 0) return "";
  return userProgramExperiences
    .map((item: any) => item.lookupLabel)
    .filter(Boolean)
    .join(", ");
};

// Component for Association Questions - extracted to avoid duplication
const AssociationQuestionsSection = ({ associationQuestions }) => {
  if (!associationQuestions || associationQuestions.length === 0) {
    return null;
  }
  const sortedQuestions = [...associationQuestions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div style={{ marginTop: 16 }}>
      <div className={styles.associatedQuestionsContainer}>
        {sortedQuestions.map((q, idx) => {
          // Special format for compare-type questions
          const isCompare =
            q.key === "entrainment_programs_2024" ||
            q.key === "hdb_programs_since_association";
          let displayAnswer = q.answer;
          if (isCompare && (q.totalCount !== undefined || q.metadata?.total !== undefined)) {
            const total =
              typeof q.totalCount === "number"
                ? q.totalCount
                : q.metadata?.total;
            if (total === 0) {
              displayAnswer = "-";
            } else {
              displayAnswer = `${q.answer}/${total}`;
            }
          }
          return (
            <div key={idx} className={styles.associatedQuestions}>
              <p className={styles.associatedLabel}>
                {q.label}
              </p>
              <p className={styles.associatedAnswer}>
                {displayAnswer}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TimelineChart: React.FC<{
  seekerId: string | number;
  gender: string | null;
}> = ({ seekerId, gender }) => {
  const [timelineResponse, setTimelineResponse] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  useEffect(() => {
    const fetchTimelineData = async () => {
      setLoading(true);
      try {
        const response = await getCall(
          endPoints.getUserParticipationSummary(seekerId, true),
          undefined,
          PORTAL
        );
        if (response?.data?.statusCode === 200) {
          setTimelineResponse(response.data);
        } else {
          setTimelineResponse(null);
        }
      } catch (error) {
        console.error('Error fetching timeline data:', error);
        setTimelineResponse(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (seekerId) {
      fetchTimelineData();
    }
  }, [seekerId]);

  // Memoize formatted experiences for reuse
  const formattedExperiences =
    timelineResponse?.data?.userProgramExperiences &&
    formatUserProgramExperiences(timelineResponse?.data?.userProgramExperiences);

  if (loading) {
    return <div className={styles.regHeading}>Loading...</div>;
  }

  // Always show association questions if present, even if no experiences
  if (!timelineResponse?.data?.yearWiseParticipation?.length) {
    return (
      <div>
        <div className={styles.regHeading}>{NO_EXPERIENCE}</div>
        {/* Always show Other Experiences section */}
        {formattedExperiences && (
          <div className={styles.otherExperiencesContainer}>
            <p className={styles.otherExperiencesTitle}>{OTHER_EXPERIENCES}</p>
            <div className={styles.otherExperiences}>
              {formattedExperiences}
            </div>
          </div>
        )}
      
        {/* Show association questions if present */}
        <AssociationQuestionsSection associationQuestions={timelineResponse?.data?.associationQuestions} />
      </div>
    );
  }

  if (!timelineResponse?.data) {
    return null;
  }

  const latestDate = calculateLatestDate(timelineResponse);
  const startYear = timelineResponse?.data?.firstParticipationDate
    ? new Date(timelineResponse.data.firstParticipationDate).getFullYear()
    : new Date().getFullYear();
  const endYear = latestDate.getFullYear();
  const totalYears = timelineResponse.data.totalYearsParticipated;
  const pronoun = gender && gender.toLowerCase() === "male" ? "his" : "her";
  const yearLabel = totalYears === 1 ? "year" : "years";

  // Transform API data to line data
const transformLineData = () => {
  if (!timelineResponse?.data?.yearWiseParticipation) return [];

  return Array.from({ length: endYear - startYear + 1 }, (_, index) => {
    const year = startYear + index;
    const yearData = timelineResponse.data.yearWiseParticipation.find(
      (y) => y?.year === year,
    );
    return {
      year,
      value: yearData?.programsCount ? yearData.programsCount * 15 : 0,
    };
  });
};

  // Get unique program types from subProgramType
  const getUniqueProgramTypes = () => {
    const programs = timelineResponse?.data?.allPrograms || [];
    const uniqueTypes = new Set<string>();
    programs.forEach((program) => {
      if (program.subProgramType) {
        uniqueTypes.add(program.subProgramType);
      }
    });
    return Array.from(uniqueTypes).sort();
  };

  // Helper to get counts for each program type for legend
  const getProgramTypeCounts = () => {
    const allPrograms = timelineResponse?.data?.allPrograms || [];
    const counts: Record<string, number> = {};
    allPrograms.forEach((program) => {
      const type = program.subProgramType || "";
      if (type) {
        counts[type] = (counts[type] || 0) + 1;
      }
    });
    return counts;
  };

  // Assign colors based on subProgramType, auto-generating colors for new types
  const generateProgramTypeColors = () => {
    const uniqueTypes = getUniqueProgramTypes();

    const colors: Record<string, string> = {};
    uniqueTypes.forEach((type, index) => {
      // Assign color per type, fallback to baseColors or auto-generate if out of palette
      if (type === "PST_HDB") colors[type] = "#F59E0B";
      else if (type === "PST_MSD") colors[type] = "#06B6D4";
      else if (type === "PST_ENTRAINMENT") colors[type] = "#22C55E";
      else if (type === "PST_TAT") colors[type] = "#A21CAF";
      else colors[type] = baseColors[index % baseColors.length];
    });
    return colors;
  };

  const programTypeColors = generateProgramTypeColors();

// Utility function to calculate decimal year from date
const calculateDecimalYear = (dateString: string): number => {
  const startDate = new Date(dateString);
  const year = startDate.getFullYear();
  const dayOfYear = Math.floor(
    (startDate.getTime() - new Date(year, 0, 0).getTime()) / MILLISECONDS_PER_DAY
  );
  const totalDaysInYear = Math.floor(
    (new Date(year + 1, 0, 0).getTime() - new Date(year, 0, 0).getTime()) / MILLISECONDS_PER_DAY
  );
  return year + (dayOfYear / totalDaysInYear);
};

const transformEventDataByActualDate = () => {
  if (!timelineResponse?.data?.yearWiseParticipation) return [];

  const allPrograms = timelineResponse.data.allPrograms;

  return timelineResponse.data.yearWiseParticipation
    .flatMap((yearData) =>
      yearData?.programs?.map((program) => {
        const programDetails = allPrograms.find(p => p?.programId === program?.programId);
        const type = programDetails?.subProgramType || "";
        
        // Common return object properties
        const baseEventData = {
          value: FIXED_Y_POSITION,
          category: type,
          count: 1,
          color: programTypeColors[type] || DEFAULT_COLOR,
          project: type,
          programId: program?.programId,
          programName: programDetails?.subProgramName || programDetails?.programName,
        };

        // If no start date, use fallback year positioning
        if (!programDetails?.programStartsAt) {
          return {
            ...baseEventData,
            year: program?.year,
          };
        }

        // Use utility function for decimal year calculation
        const decimalYear = calculateDecimalYear(programDetails.programStartsAt);
        const startDate = new Date(programDetails.programStartsAt);

        return {
          ...baseEventData,
          year: decimalYear,
          programStartsAt: programDetails.programStartsAt,
          actualStartDate: startDate,
        };
      }) || []
    )
    .filter(Boolean);
};

  const lineData = transformLineData();
 const eventData = transformEventDataByActualDate();

  const CustomTooltip = ({ active, payload, label }) => {
  if (active && label !== undefined && label !== null) {
    const hoveredYear = Math.floor(label);
    const monthFraction = label - hoveredYear;
    const hoveredMonth = Math.floor(monthFraction * 12);
    
    // Find programs that started in the hovered time period (within same month)
    const monthPrograms = eventData.filter(event => {
      return Math.abs(event.year - label) < HOVER_TOLERANCE; // Within ~1.2 months
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Helper function to format date as "01 Dec 2022"
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };

    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipTimeline}>
          <span className={styles.timelineValue}>
            {monthNames[hoveredMonth]} {hoveredYear}: {monthPrograms.length} program(s)
          </span>
        </p>
        
        {monthPrograms.length > 0 ? (
          <div className={styles.eventsContainer}>
            {monthPrograms.map((event, index) => {
              return (
                <div key={index} className={styles.eventItem}>
                  <div 
                    className={styles.eventDot}
                    style={{
                      backgroundColor: event.color
                    }}
                  ></div>
                  <span className={styles.eventText}>
                    {event.programName}
                    {event.actualStartDate && (
                      <>
                        <br />
                        <small>{formatDate(event.actualStartDate)}</small>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.noEvents}>No programs in this period</p>
        )}
      </div>
    );
  }
  return null;
};

  // Legend
  const Legend = () => {
    const typeCounts = getProgramTypeCounts();
    const types = getUniqueProgramTypes();
    return (
      <div
        className={styles.legend}
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {types.map((type, idx) => (
          <React.Fragment key={type}>
            <LegendItem
              color={programTypeColors[type]}
              text={`${formatProgramType(type)}${typeCounts[type] ? ` - ${typeCounts[type]}` : ""}`}
            />
            {idx < types.length - 1 && (
              <span
                style={{
                  margin: "0 2px",
                  color: "#D1D5DB",
                  fontWeight: 600,
                  height: "20px",
                }}
              >
                |
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className={styles.infiniJourneyTitle}>
        Last {totalYears} {yearLabel} of seeker&apos;s HDB/MSD journey
      </div>
      <Legend />

      <div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={lineData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            onMouseMove={(e) => {
              if (e && e.activeLabel) {
                setHoveredYear(e.activeLabel);
              }
            }}
            onMouseLeave={() => setHoveredYear(null)}
          >
            <CartesianGrid
              strokeDasharray="2 2"
              stroke="#D1D5DB"
              horizontal={false}
              vertical={true}
            />
            <ReferenceLine
              y={FIXED_Y_POSITION}      // ← Single line at Y=25
              stroke="#D1D5DB"
              strokeWidth={1}
              strokeDasharray="2 2"
             />
             <XAxis
              dataKey="year"
              type="number"
              scale="linear"
              domain={[startYear, endYear]}
              tickFormatter={(value) => {
              // Show year labels only at the start of each year
              const year = Math.floor(value);
              if (value === year) {
              return year.toString();
            }
            return "";
          }}
            ticks={(() => {
            const ticks = [];
          // Add ONLY year ticks (remove monthly ticks)
           for (let year = startYear; year <= endYear; year++) {
          ticks.push(year); // Only year start, no monthly divisions
          }
          return ticks;
          })()}
          axisLine={{ stroke: "#9CA3AF" }}
          tickLine={{ stroke: "#9CA3AF" }}
          interval={0}
          tick={{ fontSize: 10 }}
          />

            <YAxis domain={[0, 60]} hide={true} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#3B82F6",
                strokeWidth: 2,
                strokeDasharray: "5 5",
              }}
              trigger="hover"
              allowEscapeViewBox={{ x: false, y: false }}
              filterNull={false}
              isAnimationActive={false}
              position={undefined}
            />

            {/* Hover reference line for the hovered year */}
            {hoveredYear && (
              <ReferenceLine
                x={hoveredYear}
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}
            {/* Invisible thick line for better hover detection */}
            <Line
              type="linear"
              dataKey="value"
              stroke="transparent"
              strokeWidth={40}
              dot={false}
              activeDot={false}
            />

            {/* Event dots */}
            {eventData?.map((event, index) => (
              <Line
                key={index}
                type="linear"
                dataKey={() => event.value}
                data={[{ year: event.year, value: event.value }]}
                stroke="transparent"
                dot={{
                  fill: event.color,
                  r: 6,
                  strokeWidth: 2,
                  stroke: "#fff",
                  cursor: "pointer",
                  onMouseOver: (e: any) => {
                    setHoveredYear(event.year);
                  },
                  onMouseOut: (e: any) => {
                    setHoveredYear(null);
                  },
                }}
                activeDot={{
                  r: 8,
                  fill: event.color,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        {/* Show association questions if present - ALWAYS show when data exists */}
        <AssociationQuestionsSection associationQuestions={timelineResponse?.data?.associationQuestions} />

           {/* Always show Other Experiences section */}
        {formattedExperiences && (
          <div className={styles.otherExperiencesContainer}>
            <p className={styles.otherExperiencesTitle}>{OTHER_EXPERIENCES}</p>
            <div className={styles.otherExperiences}>
              {colorizeMahatriaInfinitheism(formattedExperiences)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineChart;
