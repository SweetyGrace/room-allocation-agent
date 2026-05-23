
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
  iOS: number;
  Android: number;
  Portal: number;
  DirectLinks: number;
}

export interface LocationInsights {
  [location: string]: number;
}

export interface GenderDistribution {
  Male?: number;
  Female?: number;

}

export interface AgeDistribution {
  ageLessThan18?: number;
  ageBetween19And29?: number;
  ageBetween30And59?: number;
  ageGreaterThan60?: number;
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
  VerifiedSeekers: number;
  NotVerifiedSeekers: number;
  JoinedAlone: number;
  JoinedWithOthers: number;
  Absentees: number;
  DropOffs: number;
  Attended: number;
  NewSeekers: number;
  Registered: number;
}

export interface AdminKPIDetails {
  platformsUsedByAudience: PlatformsUsedByAudience;
  locationInsights: LocationInsights;
  genderDistribution: GenderDistribution;
  ageDistribution: AgeDistribution;
  typeOfAudienceInsights: TypeOfAudienceInsights;
  registeredInsights: RegisteredInsights;
  attendanceInsights: AttendedInsights;
  kpidata: KPIData;
}

export interface AdminKPIResponse {
  statusCode: number;
  message: string;
  data: AdminKPIDetails;
}

export interface MonthlyStats {
  registrations: number;
  attendance: number;
}

export interface MonthlyDataStats {
  [month: string]: MonthlyStats;
}