import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SessionCard, type Session } from "@/components/SessionCard";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CreateSessionDialog } from "@/components/create-session-dialog";


/* =========================
   MOCK DATA (MATCHES SESSION CARD)
========================= */
const sessions: Session[] = [
  {
    id: 1,
    group_detail: {
      id: 1,
      name: "Calculus Study Crew",
      description: "Math group",
    },
    session_type: "online",
    status: "scheduled",
    start: "2026-04-24T18:00:00",
    end: "2026-04-24T20:00:00",
    location: "Zoom Meeting",
    notes: "Limits and derivatives",
    created_at: "2026-04-01T10:00:00",
    updated_at: "2026-04-01T10:00:00",
  },
  {
    id: 2,
    group_detail: {
      id: 2,
      name: "CS Algorithms Masters",
      description: "CS group",
    },
    session_type: "in_person",
    status: "scheduled",
    start: "2026-04-25T19:00:00",
    end: "2026-04-25T21:00:00",
    location: "Library Room 204",
    notes: "Graph algorithms",
    created_at: "2026-04-01T10:00:00",
    updated_at: "2026-04-01T10:00:00",
  },
];

/* =========================
   CALENDAR HELPERS
========================= */
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay.getDay(); i++) days.push(null);

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};

/* =========================
   PAGE
========================= */
export default function SchedulePage() {
  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false)



  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [currentMonth, setCurrentMonth] = useState(currentDate);

  const days = getDaysInMonth(currentMonth);

  /* =========================
     DATE HELPERS
  ========================= */
  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const hasSession = (date: Date) =>
    sessions.some((s) => isSameDay(new Date(s.start), date));

  const filteredSessions = sessions.filter((s) =>
    isSameDay(new Date(s.start), selectedDate)
  );

  const isToday = (date: Date) => isSameDay(date, currentDate);
  const isSelected = (date: Date) => isSameDay(date, selectedDate);

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <Layout isAuthenticated>
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Schedule</h1>
              <p className="text-muted-foreground">
                Manage your study sessions
              </p>
            </div>

            <Button
            onClick={()=>setShowScheduleDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* CALENDAR */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {currentMonth.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </CardTitle>

                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={prevMonth}>
                      <ChevronLeft />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={nextMonth}>
                      <ChevronRight />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* WEEK DAYS */}
                <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
                  {weekDays.map((d) => (
                    <div key={d} className="text-center py-2">
                      {d}
                    </div>
                  ))}
                </div>

                {/* DAYS */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, i) => (
                    <button
                      key={i}
                      disabled={!date}
                      onClick={() => date && setSelectedDate(date)}
                      className={`
                        aspect-square rounded-lg text-sm
                        ${!date ? "invisible" : ""}
                        ${date && isSelected(date) ? "bg-primary text-white" : ""}
                        ${date && isToday(date) && !isSelected(date) ? "bg-accent" : ""}
                        ${date && !isSelected(date) ? "hover:bg-muted" : ""}
                      `}
                    >
                      {date?.getDate()}

                      {date && hasSession(date) && (
                        <div className="w-1 h-1 bg-secondary rounded-full mx-auto mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SESSIONS */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">
                Sessions
              </h2>

              {filteredSessions.length === 0 ? (
                <p className="text-muted-foreground">
                  No sessions for this day.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <CreateSessionDialog
      open={showScheduleDialog}
      onOpenChange={setShowScheduleDialog}
      />
    </Layout>
  );
}