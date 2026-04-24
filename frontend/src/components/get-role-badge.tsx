
import { Badge } from "@/components/ui/badge";
import {Crown, Shield} from "lucide-react";


export const getRoleBadge = (role: string) => {
  switch (role) {
    case "creator":
      return (
        <Badge variant="warning" className="gap-1">
          <Crown className="h-3 w-3" />
          Creator
        </Badge>
      );
    case "moderator":
      return (
        <Badge variant="info" className="gap-1">
          <Shield className="h-3 w-3" />
          Moderator
        </Badge>
      );
    default:
      return null;
  }
};