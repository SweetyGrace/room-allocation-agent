const parseTimeToDate = (time: string | Date | null): Date | null => {
    if (!time) return null;
    if (time instanceof Date) return time;
    const [hours, minutes, seconds] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, seconds || 0, 0);
    return date;
};

// Combine launchStartDate and launchStartTime into a single ISO string
export const getCombinedLaunchDateTime = (date: Date | null, time: string | Date | null): string | null => {
    if (!date || !time) return null;
    const timeObj = parseTimeToDate(time);
    const combined = new Date(date);
    combined.setHours(timeObj?.getHours() || 0, timeObj?.getMinutes() || 0, timeObj?.getSeconds() || 0, 0);
    return combined.toISOString();
};