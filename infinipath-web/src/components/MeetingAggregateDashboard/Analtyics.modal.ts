
// Interface for a completed webinar
export interface CompletedWebinar {
  title: string;
  meetingDate: string;
  id: number;
}

// Interface for filter options
export interface FilterOption {
  id: number;
  name: string;
}

// Interface for the filters in the API response
export interface WebinarFilters {
  audienceTypes: FilterOption[];
  genders: FilterOption[];
  ageGroups: FilterOption[];
  locations: FilterOption[];
}

// Interface for the main webinar data
export interface WebinarData {
  // completedWebinars?: CompletedWebinar[];
  filters: WebinarFilters;
}

export interface PlatformsUsedByAudience {
  App: number;
  Browser: number;
  ThroughLink: number;
}

export interface LocationInsights {
  [location: string]: number;
}

export interface GenderDistribution {
  malePercentage?: number;
  femalePercentage?: number;
}

export interface AgeDistribution {
  AgeLessThan18?: number;
  AgeBetween19And29?: number;
  AgeBetween30And59?: number;
  AgeGreaterThan60?: number;
}

export interface TypeOfAudienceInsights {
  infinitheist?: number;
  nonInfinitheist?: number;
}


export interface TimeSlotDetails {
  attendees: number;
  lateComers: number;
  rejoins: number;
  dropOffs: number;
}

export interface TimeSlotAttendees {
  [time: string]: TimeSlotDetails;
}

export interface RegisteredDetails {
  registrations: number;
  downgrades: number;
  cancellations: number;
}

export interface AttendanceInsightsBase {
  absentees: number;
  attendees: number;
  lateComers: number;
  rejoins: number;
  dropOffs: number;
  hourlyStats: TimeSlotAttendees;
}


export interface DailyRegistrationStats {
  registrations: number;
  downgrades: number;
  cancellations: number;
}

export interface OverallRegistrationData {
  registrantCount: number;
  regDowngradedCount: number;
  regCancellationsCount: number;
  dailyStats: {
    [dayName: string]: DailyRegistrationStats;
  };
}

export interface RegisteredInsights {
  video: OverallRegistrationData | null;
  nonVideo: OverallRegistrationData | null;
  both: OverallRegistrationData | null;
}


export interface AttendedInsights {
  video: AttendanceInsightsBase | null;
  nonVideo: AttendanceInsightsBase | null;
  both: AttendanceInsightsBase | null;
}

export interface KPIData {
  verifiedSeekers: number;
  nonVerifiedSeekers: number;
  joinedAlone: number;
  joinedWithOthers: number;
  dropOff: number;
  totalNewUsers: number;
  totalRegistrations: number;
  lateComers: number;
  totalUsersPresent: number;
}

export interface AdminKPIDetails {
  platformUsage: PlatformsUsedByAudience;
  locationInsights: LocationInsights;
  genderDistribution: GenderDistribution;
  ageDistribution: AgeDistribution;
  kpiData: KPIData;
  totalSessions: number;
  graphData: MultiGraphData[]
}

export interface AdminKPIResponse {
  statusCode: number;
  message: string;
  data: AdminKPIDetails;
}

export interface MultiGraphData{
  dateLabel: string;
  registrationPercentage: number;
  attendancePercentage: number; 
}