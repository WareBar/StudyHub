import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SessionCard, type Session } from "@/components/SessionCard";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video } from "lucide-react";

const sessions: Session[] = [
  {
    id: "1",
    groupName: "Calculus Study Crew",
    subject: "Mathematics",
    date: "Today",
    time: "6:00 PM",
    duration: "2 hours",
    location: "Zoom Meeting",
    isOnline: true,
    attendees: [
      {
        id: "1",
        name: "Alex",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        attending: true,
      },
      {
        id: "2",
        name: "Sarah",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        attending: true,
      },
    ],
  },
  {
    id: "2",
    groupName: "CS Algorithms Masters",
    subject: "Computer Science",
    date: "Tomorrow",
    time: "7:00 PM",
    duration: "2 hours",
    location: "Library Room 204",
    isOnline: false,
    attendees: [
      {
        id: "3",
        name: "Mike",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
        attending: true,
      },
      {
        id: "4",
        name: "Emma",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
        attending: true,
      },
    ],
  },
  {
    id: "3",
    groupName: "Calculus Study Crew",
    subject: "Mathematics",
    date: "Wednesday",
    time: "6:00 PM",
    duration: "2 hours",
    location: "Library Room 105",
    isOnline: false,
    attendees: [
      {
        id: "1",
        name: "Alex",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        attending: true,
      },
    ],
  },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const currentDate = new Date();

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [currentMonth, setCurrentMonth] = useState(currentDate);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const hasSession = (date: Date) => {
    // Simulate some days having sessions
    return [22, 23, 25, 27, 29].includes(date.getDate());
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === currentDate.getDate() &&
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <Layout isAuthenticated>
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Schedule</h1>
              <p className="text-muted-foreground mt-1">
                Manage your study sessions and availability
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-1">
              <Card variant="elevated">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {currentMonth.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => date && setSelectedDate(date)}
                        disabled={!date}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all relative
                          ${!date ? "invisible" : ""}
                          ${date && isSelected(date) ? "bg-primary text-primary-foreground shadow-soft-md" : ""}
                          ${date && isToday(date) && !isSelected(date) ? "bg-accent text-accent-foreground" : ""}
                          ${date && !isSelected(date) && !isToday(date) ? "hover:bg-muted" : ""}
                        `}
                      >
                        {date?.getDate()}
                        {date && hasSession(date) && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-secondary" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-secondary" />
                  <span>Has session</span>
                </div>
              </div>
            </div>

            {/* Sessions List */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
              <div className="space-y-4">
                {sessions.map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>

              {/* Quick View */}
              <Card variant="elevated" className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">This Week's Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { day: "Monday", sessions: 1, hours: 2 },
                      { day: "Tuesday", sessions: 1, hours: 2 },
                      { day: "Wednesday", sessions: 1, hours: 2 },
                      { day: "Thursday", sessions: 1, hours: 2 },
                      { day: "Friday", sessions: 0, hours: 0 },
                      { day: "Saturday", sessions: 1, hours: 3 },
                      { day: "Sunday", sessions: 0, hours: 0 },
                    ].map(day => (
                      <div
                        key={day.day}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                      >
                        <span className="font-medium">{day.day}</span>
                        <div className="flex items-center gap-4">
                          {day.sessions > 0 ? (
                            <>
                              <Badge variant="soft">
                                {day.sessions} session{day.sessions > 1 ? "s" : ""}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {day.hours} hours
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">No sessions</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
