import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Clock, Lock, Globe, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  schedule: string;
  isPrivate: boolean;
  matchPercentage?: number;
  members: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  nextSession?: string;
}

interface StudyGroupCardProps {
  group: StudyGroup;
  showMatch?: boolean;
}

export function StudyGroupCard({ group, showMatch = true }: StudyGroupCardProps) {
  const getMatchVariant = (percentage: number) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    return "destructive";
  };

  return (
    <Card variant="interactive" className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="soft" className="text-xs">
                {group.subject}
              </Badge>
              {group.isPrivate ? (
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
            <h3 className="font-semibold text-lg truncate">{group.name}</h3>
          </div>
          {showMatch && group.matchPercentage && (
            <Badge variant={getMatchVariant(group.matchPercentage)} className="shrink-0">
              {group.matchPercentage}% match
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{group.description}</p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{group.schedule}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>
              {group.memberCount}/{group.maxMembers} members
            </span>
          </div>
          {group.nextSession && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Next: {group.nextSession}</span>
            </div>
          )}
        </div>

        <div className="flex items-center mt-4">
          <div className="flex -space-x-2">
            {group.members.slice(0, 4).map(member => (
              <Avatar key={member.id} size="sm" className="border-2 border-card">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          {group.members.length > 4 && (
            <span className="ml-2 text-xs text-muted-foreground">
              +{group.members.length - 4} more
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <Button
          asChild
          className="w-full"
          variant={group.memberCount >= group.maxMembers ? "outline" : "default"}
        >
          <Link to={`/groups/${group.id}`}>
            {group.memberCount >= group.maxMembers ? "View Details" : "Join Group"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
