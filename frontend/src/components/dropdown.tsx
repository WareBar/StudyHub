import { type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";

interface DropdownProps {
  trigger: ReactNode; // What triggers the dropdown (button, avatar, etc.)
  children: ReactNode; // Dropdown content
  align?: "start" | "center" | "end"; // alignment
  className?: string; // additional class names for content
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  asChild?: boolean;
}

const Dropdown = ({ trigger, children, align = "end", className }: DropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={`glass-card-strong border border-border/40 shadow-lg p-0 ${className ?? ""}`}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DropdownItem = ({ children, onClick, asChild = false }: DropdownItemProps) => {
  return (
    <DropdownMenuItem asChild={asChild} onSelect={onClick}>
      {children}
    </DropdownMenuItem>
  );
};

export {Dropdown, DropdownItem};