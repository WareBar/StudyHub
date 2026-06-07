import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, BookOpen, DoorOpen, Eye, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { formatSession } from "@/utils/time";

interface Member {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

interface Membership {
  id: number;
  user: Member;
  role: string;
  status: string;
}

interface NextSession {
  id: number;
  start: string;
  end: string;
  status: string;
}

interface SubjectDetail {
  id: number;
  name: string;
}

export interface StudyGroup {
  id: number;
  name: string;
  description: string;
  max_members: number;
  subject_detail: SubjectDetail;
  memberships: Membership[];
  next_session: NextSession | null;
}

interface StudyGroupCardProps {
  group: StudyGroup;
  currentUserId?: number;
}

export function StudyGroupCard({ group, currentUserId }: StudyGroupCardProps) {
  const memberCount = group.memberships.length;
  const isFull = memberCount >= group.max_members;
  const isMember = group.memberships.some(({ user }) => user.id === Number(currentUserId));
  const capacityPct = Math.round((memberCount / group.max_members) * 100);

  return (
    <Card className="flex flex-col h-full rounded-2xl border border-border/80 bg-card shadow-none hover:border-border/70 transition-colors duration-200">
      {/* Header */}
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center gap-2 mb-2.5">
          <Badge
            variant="secondary"
            className="text-[11px] font-medium rounded-full px-2.5 py-0.5 flex items-center gap-1"
          >
            <BookOpen className="h-3 w-3" />
            {group.subject_detail.name}
          </Badge>
        </div>
        <h3 className="font-semibold text-base leading-snug text-foreground">
          {group.name}
        </h3>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 px-5 pt-3 pb-0">
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 min-h-[42px] mb-4">
          {group.description}
        </p>

        <div className="border-t border-border/40 pt-4 space-y-3">
          {/* Members + capacity bar */}
          <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
            <Users className="h-[15px] w-[15px] text-muted-foreground/60 shrink-0" />
            <span className="font-medium text-foreground">{memberCount}</span>
            <span>/ {group.max_members} members</span>
            <div className="flex-1 h-[3px] bg-border/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? "bg-destructive" : "bg-blue-500"}`}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>

          {/* Next session */}
          <div className="flex items-center gap-2.5 text-[13px]">
            <CalendarDays className="h-[15px] w-[15px] text-muted-foreground/60 shrink-0" />
            {group.next_session ? (
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {formatSession(group.next_session)}
              </span>
            ) : (
              <span className="italic text-muted-foreground/70">No upcoming sessions</span>
            )}
          </div>
        </div>

        {/* Avatar stack */}
        <div className="flex items-center justify-between mt-4 pb-4">
          <div className="flex items-center">
            <div className="flex -space-x-[7px]">
              {group.memberships.slice(0, 4).map(({ user, id }) => (
                <Avatar
                  key={id}
                  className="h-[26px] w-[26px] border-2 border-card text-[10px] font-semibold"
                >
                  <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                  <AvatarFallback className="text-[10px]">{user.first_name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            {group.memberships.length > 4 && (
              <span className="ml-2 text-[11px] text-muted-foreground/70">
                +{group.memberships.length - 4} more
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="px-5 pb-5 pt-0">
        <Button
          asChild
          className="w-full rounded-xl text-[13.5px] font-medium h-9 gap-1.5"
          variant={isMember ? "secondary" : isFull ? "outline" : "default"}
        >
          <Link to={`/groups/${group.id}`}>
            {isMember ? (
              <><LayoutDashboard className="h-4 w-4" /> View Group</>
            ) : isFull ? (
              <><Eye className="h-4 w-4" /> View Details</>
            ) : (
              <><DoorOpen className="h-4 w-4" /> Join Group</>
            )}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}