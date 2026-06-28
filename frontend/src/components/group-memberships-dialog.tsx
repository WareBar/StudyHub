// approve or manage group's user membership

import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Search,
  Clock,
  UserCheck,
  UserX,
  UserMinus,
  RotateCcw,
  Shield,
  ShieldOff,
  Eye,
  Loader2,
} from "lucide-react";
import QueryWrapper from "./query-wrapper";
import { formatSessionDate } from "@/utils/time";
import { Button } from "./ui/button";
import { getRoleBadge } from "./get-role-badge";
import { useEffect, useState } from "react";
import type { MembershipProps } from "@/types/models";
import { useMembership } from "@/hooks/useMembership";
import NoResult from "./no-result";
import { QuickProfileView } from "./quick-profile-view";
import { motion } from "framer-motion";

export interface GroupMembershipsDialogProps {
  groupId: string | undefined;
  open: boolean;
  onOpenChange: (arg0: boolean) => void;
}

interface ManageMembersProps {
  members: MembershipProps[];
  onUpdate: (id: number, status: string) => void;
  isUpdating: boolean;
}

interface ControlAuthorityProps {
  members: MembershipProps[];
  onUpdate: (id: number, role: string) => void;
  isUpdating: boolean;
}

interface MembershipStatsProps {
  groupId: string | undefined;
  setStatusLabels: (labels: string[]) => void;
}

interface StatsProps {
  label: string;
  value: MembershipStatus;
}

interface FiltersProps {
  choices: string[];
  onSearch: (q: string) => void;
  onSelect: (s: string) => void;
}

interface MemberCardProps {
  user: MembershipProps;
  updated_at: string;
  role: string;
  status: MembershipStatus;
  onUpdate: (id: number, value: string) => void;
  isUpdating: boolean;
  ctaType: string;
}

type MembershipStatus = "all" | "accepted" | "pending" | "rejected" | "cancelled";

// ── Main Dialog ──────────────────────────────────────────────────────────────
export const GroupMembershipsDialog = ({ groupId, open, onOpenChange }: GroupMembershipsDialogProps) => {
  const [searchQuery, setSearchQuery] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [selectedRole, setSelectedRole] = useState<string>();
  const [statusLabels, setStatusLabels] = useState<string[]>([]);

  const { updateStatus, isUpdatingStatus, updateRole, isUpdatingRole } = useMembership();

  const fetchGroupMembership = async () => {
    const params = new URLSearchParams();
    params.set("group", groupId!);
    if (searchQuery) params.set("search", searchQuery);
    if (selectedStatus && selectedStatus !== "all") params.set("status", selectedStatus);
    if (selectedRole && selectedRole !== "all") params.set("role", selectedRole);
    const response = await api.get(`/membership/?${params.toString()}`);
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["group-membership", groupId, searchQuery, selectedStatus, selectedRole],
    queryFn: fetchGroupMembership,
    enabled: !!groupId,
  });

  const handleStatusUpdate = (memberId: number, newStatus: string) => {
    if (!newStatus || !memberId) return;
    updateStatus({ memberId, groupId: Number(groupId), newStatus });
  };

  const handleRoleUpdate = (memberId: number, newRole: string) => {
    if (!newRole || !memberId) return;
    updateRole({ memberId, groupId: Number(groupId), newRole });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl max-w-5xl p-0 gap-0 overflow-hidden rounded-2xl">
        {/* ── Header ── */}
        <div className="px-7 pt-7 pb-5 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 tracking-tight">
              Membership overview
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400">
              Manage member requests, roles, and status in one place.
            </DialogDescription>
          </DialogHeader>

          {/* Stats */}
          <div className="mt-5">
            <MembershipStats groupId={groupId} setStatusLabels={setStatusLabels} />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="px-7 py-5">
          <Tabs defaultValue="manage" className="w-full">
            <TabsList className="flex w-full mb-5" variant="line">
              <TabsTrigger value="manage" className="flex-1">Manage requests</TabsTrigger>
              <TabsTrigger value="control" className="flex-1">Control roles</TabsTrigger>
            </TabsList>

            <TabsContent value="manage">
              <Filters choices={statusLabels} onSearch={setSearchQuery} onSelect={setSelectedStatus} />
              <QueryWrapper
                data={data}
                isLoading={isLoading}
                error={error}
                noResultsComponent={
                  <NoResult label="Users" description="No users match your query" />
                }
              >
                {data && (
                  <ManageMembers
                    members={data.results}
                    onUpdate={handleStatusUpdate}
                    isUpdating={isUpdatingStatus}
                  />
                )}
              </QueryWrapper>
            </TabsContent>

            <TabsContent value="control">
              <Filters choices={["all", "moderator", "member"]} onSearch={setSearchQuery} onSelect={setSelectedRole} />
              <ControlAuthority
                members={data?.results.filter(
                  (m: MembershipProps) => m.status === "accepted" && m.role !== "creator"
                )}
                onUpdate={handleRoleUpdate}
                isUpdating={isUpdatingRole}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── MembershipStats ──────────────────────────────────────────────────────────
const MembershipStats = ({ groupId, setStatusLabels }: MembershipStatsProps) => {
  const fetchMembershipStats = async () => {
    const response = await api.get(`/membership/stats?group_id=${groupId}`);
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["membership-stats", groupId],
    queryFn: fetchMembershipStats,
    enabled: !!groupId,
  });

  useEffect(() => {
    if (error || !data) return;
    setStatusLabels(
      data.map((lbl: StatsProps) =>
        lbl.label.toLowerCase() === "total requests" ? "all" : lbl.label.toLowerCase()
      )
    );
  }, [data, error, setStatusLabels]);

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 h-14 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {data?.map((stat: StatsProps, i: number) => (
        <div
          key={i}
          className={`rounded-xl border px-4 py-3 text-center ${
            i === 0
              ? "bg-orange-500 border-transparent text-white"
              : "bg-white border-gray-100"
          }`}
        >
          <div className={`text-xl font-bold ${i === 0 ? "text-white" : "text-orange-500"}`}>
            {stat.value}
          </div>
          <div className={`text-xs mt-0.5 ${i === 0 ? "text-orange-100" : "text-gray-400"}`}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Filters ──────────────────────────────────────────────────────────────────
const Filters = ({ choices, onSearch, onSelect }: FiltersProps) => {
  const [activeChoice, setActiveChoice] = useState<string>("all");

  return (
    <div className="mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search members…"
            className="pl-9 rounded-xl border-gray-200 text-sm"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {choices?.map((choice: string, i: number) => (
            <button
              key={i}
              onClick={() => {
                onSelect(choice);
                setActiveChoice(choice);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeChoice === choice
                  ? "bg-orange-500 text-white border-transparent shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {choice.charAt(0).toUpperCase() + choice.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100 mt-4" />
    </div>
  );
};

// ── ManageMembers ─────────────────────────────────────────────────────────────
const ManageMembers = ({ members, onUpdate, isUpdating }: ManageMembersProps) => (
  <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
    {members?.length > 0 ? (
      members.map((member: any, i: number) => (
        <MemberCard
          key={i}
          user={member.user}
          role={member.role}
          updated_at={member.updated_at}
          status={member.status}
          onUpdate={onUpdate}
          isUpdating={isUpdating}
          ctaType="manage"
        />
      ))
    ) : (
      <NoResult label="Members" description="No members match your filters" />
    )}
  </div>
);

// ── ControlAuthority ──────────────────────────────────────────────────────────
const ControlAuthority = ({ members, onUpdate, isUpdating }: ControlAuthorityProps) => (
  <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
    {members?.length > 0 ? (
      members.map((member: any, i: number) => (
        <MemberCard
          key={i}
          user={member.user}
          role={member.role}
          updated_at={member.updated_at}
          status={member.status}
          onUpdate={onUpdate}
          isUpdating={isUpdating}
          ctaType="control"
        />
      ))
    ) : (
      <NoResult label="Members" description="No accepted members to manage" />
    )}
  </div>
);

// ── MemberCard ────────────────────────────────────────────────────────────────
const MemberCard = ({ user, role, updated_at, status, onUpdate, isUpdating, ctaType }: MemberCardProps) => {
  const { id, first_name = "", last_name = "", username, avatar, email } = user as any;
  const [showQuickProfileView, setShowQuickProfileView] = useState(false);

  const displayName = first_name && last_name ? `${first_name} ${last_name}` : username;

  const ManageCTA = () => {
    if (isUpdating) {
      return (
        <Button disabled size="sm" className="rounded-xl text-xs">
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          Updating…
        </Button>
      );
    }
    if (role === "creator") return null;

    switch (status) {
      case "pending":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onUpdate(id, "accepted")}
              className="bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs gap-1.5"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onUpdate(id, "rejected")}
              className="rounded-xl text-xs gap-1.5"
            >
              <UserX className="h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        );
      case "accepted":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdate(id, "cancelled")}
            className="border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs gap-1.5"
          >
            <UserMinus className="h-3.5 w-3.5" />
            Remove
          </Button>
        );
      case "cancelled":
        return (
          <span className="text-xs text-gray-400 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
            Cancelled
          </span>
        );
      case "rejected":
        return (
          <div className="flex gap-2">
            <span className="text-xs text-gray-400 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
              Rejected
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate(id, "accepted")}
              className="rounded-xl text-xs gap-1.5 border-orange-200 text-orange-500 hover:bg-orange-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restore
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const ControlCTA = () => (
    role === "moderator" ? (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onUpdate(id, "member")}
        className="border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs gap-1.5"
        disabled={isUpdating}
      >
        <ShieldOff className="h-3.5 w-3.5" />
        Remove moderator
      </Button>
    ) : (
      <Button
        size="sm"
        onClick={() => onUpdate(id, "moderator")}
        className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs gap-1.5"
        disabled={isUpdating}
      >
        <Shield className="h-3.5 w-3.5" />
        Make moderator
      </Button>
    )
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:border-orange-100 hover:shadow-sm transition-all"
      >
        {/* Left: avatar + info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-orange-100 flex-shrink-0 bg-orange-50">
            {avatar ? (
              <img src={avatar} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-orange-500 text-sm font-semibold">
                {first_name?.[0]}{last_name?.[0]}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900 truncate">{displayName}</span>
              {getRoleBadge(role)}
            </div>
            <p className="text-xs text-gray-400 truncate">{email}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {formatSessionDate(updated_at)}
            </p>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowQuickProfileView(true)}
            className="rounded-xl text-xs border-gray-200 text-gray-500 hover:border-gray-300 gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            Profile
          </Button>

          {ctaType === "manage" ? <ManageCTA /> : <ControlCTA />}
        </div>
      </motion.div>

      {showQuickProfileView && (
        <QuickProfileView
          userId={id}
          open={showQuickProfileView}
          onOpenChange={setShowQuickProfileView}
        />
      )}
    </>
  );
};