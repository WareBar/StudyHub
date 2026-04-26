import * as React from "react"
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns"
import { ChevronLeft, ChevronRight, ClockIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function toDjangoDatetime(date: string, time: string): string {
  if (!date || !time) return ""
  const seconds = time.length === 5 ? time + ":00" : time
  return `${date} ${seconds}`
}

function parseTime(django: string): string {
  const timePart = django.split(" ")[1] ?? ""
  return timePart.slice(0, 5)
}

function parseDatePart(django: string): string {
  return django.split(" ")[0] ?? ""
}

// ─── Inline Calendar ──────────────────────────────────────────────────────────

interface InlineCalendarProps {
  selectedDate: string
  onSelect: (date: string) => void
  minDate?: string
}

function InlineCalendar({ selectedDate, onSelect, minDate }: InlineCalendarProps) {
  const today = new Date()
  const initYear = selectedDate ? parseInt(selectedDate.split("-")[0]) : today.getFullYear()
  const initMonth = selectedDate ? parseInt(selectedDate.split("-")[1]) - 1 : today.getMonth()

  const [viewYear, setViewYear] = React.useState(initYear)
  const [viewMonth, setViewMonth] = React.useState(initMonth)

  const daysInMonth = getDaysInMonth(new Date(viewYear, viewMonth))
  const firstDayOfWeek = getDay(startOfMonth(new Date(viewYear, viewMonth)))
  const todayStr = format(today, "yyyy-MM-dd")

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1) }
    else setViewMonth(m => m + 1)
  }

  const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(new Date(viewYear, viewMonth), "MMMM yyyy")}
        </span>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center">
        {DAY_NAMES.map(d => (
          <span key={d} className="text-[11px] font-medium text-muted-foreground pb-1">{d}</span>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <span key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = toDateStr(viewYear, viewMonth, day)
          const isSelected = dateStr === selectedDate
          const isToday = dateStr === todayStr
          const isDisabled = minDate ? dateStr < minDate : false

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(dateStr)}
              className={cn(
                "aspect-square flex items-center justify-center rounded-md text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "disabled:pointer-events-none disabled:opacity-30",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isToday && !isSelected && "border border-primary/40 font-medium",
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Time Field ───────────────────────────────────────────────────────────────

interface TimeFieldProps {
  id: string
  label: string
  value: string
  onChange: (val: string) => void
  min?: string
  max?: string
}

function TimeField({ id, label, value, onChange, min, max }: TimeFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <ClockIcon className="h-3.5 w-3.5" />
        {label}
      </Label>
      <Input
        id={id}
        type="time"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(e.target.value)}
        className="h-9 text-sm"
      />
    </div>
  )
}

// ─── SchedulePicker ───────────────────────────────────────────────────────────

interface SchedulePickerProps {
  start?: string
  end?: string
  onStartChange?: (value: string) => void
  onEndChange?: (value: string) => void
  /** Earliest selectable date (YYYY-MM-DD), defaults to today */
  minDate?: string
  className?: string
}

export function SchedulePicker({
  start,
  end,
  onStartChange,
  onEndChange,
  minDate,
  className,
}: SchedulePickerProps) {
  const todayStr = format(new Date(), "yyyy-MM-dd")
  const effectiveMinDate = minDate ?? todayStr

  const selectedDate = start ? parseDatePart(start) : ""
  const startTime = start ? parseTime(start) : ""
  const endTime = end ? parseTime(end) : ""

  function handleDateSelect(date: string) {
    // preserve time if exists, otherwise just store date placeholder
    const newStart = startTime
      ? toDjangoDatetime(date, startTime)
      : `${date} 00:00:00`

    const newEnd = endTime
      ? toDjangoDatetime(date, endTime)
      : ""

    onStartChange?.(newStart)
    onEndChange?.(newEnd)
  }

  function handleStartTime(time: string) {
    if (!selectedDate) return
    onStartChange?.(toDjangoDatetime(selectedDate, time))

    // Auto-push end if it's now before or equal to new start
    if (endTime && time >= endTime) {
      const [h, m] = time.split(":").map(Number)
      const pushed = new Date(2000, 0, 1, h + 1, m)
      const newEnd = pushed.getDate() === 1
        ? `${String(pushed.getHours()).padStart(2, "0")}:${String(pushed.getMinutes()).padStart(2, "0")}`
        : "23:59"
      onEndChange?.(toDjangoDatetime(selectedDate, newEnd))
    }
  }

  function handleEndTime(time: string) {
    if (!selectedDate) return
    onEndChange?.(toDjangoDatetime(selectedDate, time))
  }

  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm grid grid-cols-3 gap-4", className)}>
      {/* Left: Calendar */}
      <div className="col-span-2 border-r pr-4">
        <InlineCalendar
          selectedDate={selectedDate}
          onSelect={handleDateSelect}
          minDate={effectiveMinDate}
        />
      </div>

      {/* Right: Time pickers */}
      <div className="flex flex-col gap-4 justify-center">
        <TimeField
          id="schedule-start"
          label="Start"
          value={startTime}
          onChange={handleStartTime}
          min={selectedDate === todayStr ? format(new Date(), "HH:mm") : undefined}
        />
        <TimeField
          id="schedule-end"
          label="End"
          value={endTime}
          onChange={handleEndTime}
          min={startTime || undefined}
          max="23:59"
        />
        {selectedDate && (
          <p className="text-[11px] text-muted-foreground text-center leading-snug">
            {format(new Date(selectedDate + "T00:00"), "EEE, MMM d yyyy")}
          </p>
        )}
      </div>
    </div>
  )
}