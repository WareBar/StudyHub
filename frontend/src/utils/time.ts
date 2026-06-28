
interface NextSession {
  id: number;
  start: string;
  end: string;
  status: string;
}

export const formatSession = (session: NextSession) => {
    const date = new Date(session.start);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };



export const formatTime = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const timeStr = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);
  const duration =
    diffHrs % 1 === 0 ? `${diffHrs}h` : `${Math.floor(diffHrs)}h ${Math.round((diffHrs % 1) * 60)}m`;

  return `${timeStr} (${duration})`;
};

export const formatSessionDate = (start: string): string => {
  const date = new Date(start);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const relativeTime = (isoString: string): string => {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime(); // difference in milliseconds

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};



export const formatDate = (timeDate:string) => {
    const date = new Date(timeDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };