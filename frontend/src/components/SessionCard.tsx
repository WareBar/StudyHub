import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Session {
  id: string;
  groupName: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  isOnline: boolean;
  attendees: Array<{
    id: string;
    name: string;
    avatar: string;
    attending: boolean;
  }>;
}

interface SessionCardProps {
  session: Session;
  variant?: "upcoming" | "past";
  onJoin?: () => void;
}

export function SessionCard({ session, variant = "upcoming", onJoin }: SessionCardProps) {
  const isPast = variant === "past";

  return (
    <Card variant={isPast ? "default" : "interactive"} className={cn(isPast && "opacity-75")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="soft" className="text-xs mb-2">
              {session.subject}
            </Badge>
            <CardTitle className="text-lg">{session.groupName}</CardTitle>
          </div>
          {!isPast && (
            <Button size="sm" onClick={onJoin}>
              {session.isOnline ? (
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
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">{session.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {session.time} ({session.duration})
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {session.isOnline ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
            <span>{session.location}</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {session.attendees.slice(0, 5).map(attendee => (
                <Avatar
                  key={attendee.id}
                  size="sm"
                  className={cn("border-2 border-card", !attendee.attending && "opacity-50")}
                >
                  <AvatarImage src={attendee.avatar} alt={attendee.name} />
                  <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {session.attendees.filter(a => a.attending).length} attending
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
