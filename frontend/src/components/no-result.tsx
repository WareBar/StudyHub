import { type ReactNode } from "react";
import { SearchX, type LucideIcon } from "lucide-react";

interface NoResultProps {
  label: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

const NoResult = ({
  label,
  description,
  icon: Icon = SearchX,
  action,
}: NoResultProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center w-full">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          No {label} Found
        </p>
        {description && (
          <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

export default NoResult;