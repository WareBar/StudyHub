import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

interface AvailabilityGridProps {
  availability: Record<string, string[]>;
  onToggle?: (day: string, time: string) => void;
  readonly?: boolean;
  compact?: boolean;
}

export function AvailabilityGrid({
  availability,
  onToggle,
  readonly = false,
  compact = false,
}: AvailabilityGridProps) {
  const isSelected = (day: string, time: string) => {
    return availability[day]?.includes(time) || false;
  };

  return (
    <Card
      variant={compact ? "default" : "elevated"}
      className={cn(compact && "border-0 shadow-none bg-transparent")}
    >
      {!compact && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Weekly Availability</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(compact && "p-0")}>
        <div className="grid grid-cols-8 gap-1 sm:gap-2">
          {/* Header row */}
          <div className="col-span-1" />
          {DAYS.map(day => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Time slots */}
          {TIME_SLOTS.map(time => (
            <>
              <div
                key={`label-${time}`}
                className="flex items-center text-xs sm:text-sm font-medium text-muted-foreground pr-2"
              >
                {time}
              </div>
              {DAYS.map(day => (
                <button
                  key={`${day}-${time}`}
                  onClick={() => !readonly && onToggle?.(day, time)}
                  disabled={readonly}
                  className={cn(
                    "aspect-square rounded-lg transition-all duration-200 text-xs font-medium",
                    isSelected(day, time)
                      ? "bg-primary text-primary-foreground shadow-soft-md"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground",
                    !readonly && "cursor-pointer hover:scale-105 active:scale-95",
                    readonly && "cursor-default",
                  )}
                />
              ))}
            </>
          ))}
        </div>

        {!readonly && !compact && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Click on time slots to toggle your availability
          </p>
        )}
      </CardContent>
    </Card>
  );
}
