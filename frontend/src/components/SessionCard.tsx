import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Video, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime, formatSessionDate } from "@/utils/time";


interface GroupDetail {
  id: number;
  name: string;
  description: string;
}

export interface Session {
  id: number;
  group_detail: GroupDetail;
  start: string;
  end: string;
  location: string;
  notes: string;
  session_type: "online" | "in_person";
  status: string;
  created_at: string;
  updated_at: string;
}

interface SessionCardProps {
  session: Session;
  variant?: "upcoming" | "past";
  onJoin?: () => void;
}


export function SessionCard({ session, variant = "upcoming", onJoin }: SessionCardProps) {
  const isPast = variant === "past";
  const isOnline = session.session_type === "online";

  return (
    <Card variant={isPast ? "default" : "interactive"} className={cn(isPast && "opacity-75")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="soft" className="text-xs mb-2">
              {session.group_detail.name}
            </Badge>
            <CardTitle className="text-base">{formatSessionDate(session.start)}</CardTitle>
          </div>
          {!isPast && (
            <Button size="sm" onClick={onJoin}>
              {isOnline ? (
                <>
                  <Video className="h-4 w-4 mr-1" />
                  Join
                </>
              ) : (
                "View"
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{formatTime(session.start, session.end)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isOnline ? (
              <Video className="h-4 w-4 text-primary" />
            ) : (
              <MapPin className="h-4 w-4 text-primary" />
            )}
            <span>{session.location}</span>
          </div>

          {session.notes && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className="line-clamp-2">{session.notes}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}