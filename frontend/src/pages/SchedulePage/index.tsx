import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SessionCard, type Session } from "@/components/SessionCard";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CreateSessionDialog } from "@/components/create-session-dialog";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import QueryWrapper from "@/components/query-wrapper";
import { BannerWrapper } from "@/components/ui/banner-wrapper";



interface CalendarComponentProps {
  currentMonth: Date
  setCurrentMonth: (args1:Date)=>void
  setSelectedDate: (args1:Date)=>void
  selectedDate: Date
  sessions: Session[]
}

interface NoSessionsProps {
  label:string
  setShowScheduleDialog: (args1: boolean)=>void
}

// backend filter for session is like 
// http://127.0.0.1:8000/session/?start=2026-06-07
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];




export default function SchedulePage() {

  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false)

  // get the currentDate and the Current Month and set as default selected date
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [currentMonth, setCurrentMonth] = useState<Date>(currentDate);


  // storing the selected day's scheduled session
  const [sessionsThisDate, setSessionsThisDate] = useState<Session[]>()


  // forr getting the month range, like the first and last day of mnth
  const { start_date, end_date } = getMonthRange(currentMonth);

  const fetchSession = async (start_date: string, end_date:string) => {
    const params = new URLSearchParams({ start_date, end_date });


    const newUrl = `session/?type=my`
    const separator = newUrl.includes("?") ? "&" : "?"
    const response = await api.get(`${newUrl}${separator}${params.toString()}`)
    console.log(response.data)
    return response.data
  }



  const { data, isLoading, error } = useQuery({
    queryKey: ["session", currentMonth],
    queryFn: ()=> fetchSession(start_date, end_date),
    enabled: !!currentMonth,
  });


    useEffect(()=>{
      if (!data) return;

      // filter and get the sessions scheduled for this date
      const filteredSessions = data.results.filter((s:Session) =>
        isSameDay(new Date(s.start), selectedDate)
      );
      console.log(filteredSessions)
      setSessionsThisDate(filteredSessions)

    },[selectedDate, data])

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
            <CalendarComponent
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            setSelectedDate={setSelectedDate}
            selectedDate={selectedDate}
            sessions={data?.results}
            />

            {/* SESSIONS */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">
                Sessions
              </h2>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <QueryWrapper
                data={data}
                isLoading={isLoading}
                error={error}
                noResultsComponent={
                  <NoSessions
                  label={'Month'}
                  setShowScheduleDialog={setShowScheduleDialog}
                  />
                }
                >
                  {
                    sessionsThisDate?.length?? 0 > 0 ?
                    (
                      sessionsThisDate?.map((session)=>{
                        return (
                          <SessionCard
                          key={session.id}
                          session={session}
                          showActions={false}
                          />
                        )
                      })
                    )
                    :
                    <NoSessions
                    label={'Day'}
                    setShowScheduleDialog={setShowScheduleDialog}
                    />
                  }
                </QueryWrapper>
              </div>

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



const CalendarComponent = ({currentMonth, setCurrentMonth, setSelectedDate, selectedDate, sessions}:CalendarComponentProps) => {

  const isToday = (date: Date) => isSameDay(date, currentMonth);
  const isSelected = (date: Date) => isSameDay(date, selectedDate);

  const days = getDaysInMonth(currentMonth)

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));


  return (
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

       {/* weekdays */}
       {/* acts the column title */}
        <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center py-2">
              {d}
            </div>
          ))}
        </div>

        
        {/* DAYS */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i)=>{

            
            const scheduledSessions = !date || !sessions?.length
            ? []
            : sessions?.filter((s:Session) => isSameDay(new Date(s.start), date));
            console.log(scheduledSessions)

            return (
              <button
                key={i}
                disabled={!date}
                onClick={() => date && setSelectedDate(date)}
                className={`
                  aspect-square rounded-lg text-sm relative
                  ${!date ? "invisible" : ""}
                  ${date && isSelected(date) ? "bg-primary text-white" : ""}
                  ${date && isToday(date) && !isSelected(date) ? "bg-accent" : ""}
                  ${date && !isSelected(date) ? "hover:bg-muted" : ""}
                  ${date && scheduledSessions.length? `font-bold text-red-500`:""}
                `}
              >
                <p 
                className={`
                  absolute text-sm top-0 right-2 text-secondary-foreground
                  ${scheduledSessions.length > 0? 'visible':'invisible'}
                  `}
                >
                  {scheduledSessions.length}
                </p>
                {date?.getDate()}
              </button>
            )
          })}

        </div>
      </CardContent>
    </Card>
  )
}


const NoSessions = ({label, setShowScheduleDialog}:NoSessionsProps) => {
  return (
    <BannerWrapper>
      {/* primary color accent top bar */}
      <div className="h-1.5 w-full bg-primary" />

      <div className="flex flex-col items-center text-center px-8 py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No Session for the {label}</h2>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          You don't have any scheduled sessions for the {label}. Please schedule one 
        </p>

        <Button
        onClick={()=>setShowScheduleDialog(true)}
        >Schedule a Session</Button>
      </div>
    </BannerWrapper>
  )
}

// helpder
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

function getMonthRange(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0); // last day of month

  const fmt = (d: Date) => d.toLocaleDateString('en-CA'); // YYYY-MM-DD

  return { start_date: fmt(start), end_date: fmt(end) };
}

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();


