import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Calendar } from "lucide-react";
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

  console.log(isMember)
  console.log(currentUserId)
  console.log(group.memberships)
  return (
    <Card variant="interactive" className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="soft" className="text-xs">
                {group.subject_detail.name}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg truncate">{group.name}</h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-10">
          {group.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>
              {memberCount}/{group.max_members} members
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            {group.next_session ? (
              <span>Next: {formatSession(group.next_session)}</span>
            ) : (
              <span className="italic">No upcoming sessions yet</span>
            )}
          </div>
        </div>

        <div className="flex items-center mt-4">
          <div className="flex -space-x-2">
            {group.memberships.slice(0, 4).map(({ user, id }) => (
              <Avatar key={id} size="sm" className="border-2 border-card">
                <AvatarImage
                  src={user.avatar}
                  alt={`${user.first_name} ${user.last_name}`}
                />
                <AvatarFallback>{user.first_name[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          {group.memberships.length > 4 && (
            <span className="ml-2 text-xs text-muted-foreground">
              +{group.memberships.length - 4} more
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <Button
          asChild
          className="w-full"
          variant={isFull ? "outline" : "default"}
        >
          <Link to={`/groups/${group.id}`}>
            {isMember ? "View Group" : isFull ? "View Details" : "Join Group"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}