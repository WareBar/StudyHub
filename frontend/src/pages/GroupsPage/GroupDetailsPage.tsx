import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionCard, type Session } from "@/components/SessionCard";
import {
  Users,
  Calendar,
  Clock, Settings2, Link2, ArrowRight ,
  Lock, Search,
  MessageCircle,
  XCircle,
  UserPlus, ArchiveRestore,
  ArrowLeft,
  List, ClipboardList, Paperclip, BookOpen, UserCircle, CalendarDays, BookMarked
} from "lucide-react";
import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import QueryWrapper from "@/components/query-wrapper";
import { relativeTime } from "@/utils/time";
import NoResult from "@/components/no-result";
import { useStudyGroup } from "@/hooks/useStudyGroup";
import { useToast } from "@/hooks/useToast";
import { GroupMembershipsDialog } from "@/components/group-memberships-dialog";
import { InviteUserDialog } from "@/components/invite-user";
import { ShareResourceDialog } from "@/components/share-resource-dialog";
import { getRoleBadge } from "@/components/get-role-badge";
import { CreateSessionDialog } from "@/components/create-session-dialog";
import { useAuth } from "@/context/AuthContext";
import type { StudyGroupProps, MembershipProps, UserProps } from "@/types/models";
import { capitalize } from "@/utils/word";
import { ChatBox } from "@/components/chat-box";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ResourceCard } from "@/components/resource-card";
import { BannerWrapper } from "@/components/ui/banner-wrapper";

interface GroupPageHeaderProps {
  detail: StudyGroupProps

}

interface SessionsTabProps {
  groupId: string | undefined,
  userRole: string
}

interface MembersTabProps {
  members: MembershipProps[]
  groupId: string | undefined,
}

interface AttendanceHistoryProps {
  groupId: string | undefined,
  maxMembers: number
}

interface NotAMemberBannerProps {
  onRequest: ()=>void,
  isRequesting: boolean
}


type PendingMembershipRequestProps = {
  onCancel: () => void;
  isCancelling: boolean;
};

type AttendanceProps = {
  date:string,
  users: UserProps[]
  
}


type ChatTabProps = {
  groupId: string | undefined,
}



const RESOURCE_TYPE_OPTIONS = [
  {
    "name":"all",
    "icon":null
  },
  {
    "name":"file",
    "icon":BookOpen
  },
  {
    "name":"link",
    "icon":Link2
  },
]

export default function GroupDetailsPage() {
  const { id } = useParams();
  const { 
    joinRequest, isRequesting,
    cancelRequest, isCancellingRequest
  } = useStudyGroup()
  const {toast} = useToast()
  const [userRoleInGroup, setUserRoleInGroup] = useState<string>("")
  const {user} = useAuth()



  const fetchStudyGroupDetails = async () => {
    const response = await api.get(`/study-group/${id}`)
    console.log(response.data)
    return response.data
  }

  const {data, isLoading, error} = useQuery({
    queryKey:['study-group-details',id],
    queryFn: fetchStudyGroupDetails,
    enabled: !!id
  })


  const handleJoinRequest = async () => {
    if (!id) return toast.error("Join request failed","The group id is missing")
    joinRequest({
      groupId:Number(id)
    })
  }

  const handleCancelRequest = async () => {
    if (!id) return toast.error("Cancellation request failed","The group id is missing")
    cancelRequest({
      groupId:Number(id)
    })
    console.log('request sent')
  }



  // determine the logged in user;s role in the group
  useEffect(()=>{
    if (!data || !user) return

    if (data?.membership_status !== 'accepted') return

    const userMembership = data?.memberships?.find((m:MembershipProps) => m.user.id === user?.id)
    console.log(userMembership.role)
    setUserRoleInGroup(userMembership.role)

  },[data, user])


  return (
    <Layout isAuthenticated>
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/groups">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Link>
          </Button>

          {/* Header */}
          <QueryWrapper
          data={data}
          isLoading={isLoading}
          error={error}
          >
            <GroupPageHeader
            detail={data}
            />
          </QueryWrapper>


          {data && (() => {
            switch (data.membership_status) {
              case "accepted":
                return (
                  <Tabs defaultValue="sessions" className="space-y-6">
                    <TabsList className="bg-muted/50 flex">
                      {
                        [{'name':"sessions", "icon":List},{"name":"members", "icon":Users},{"name":"chat", "icon":MessageCircle},{"name":"attendances", "icon":ClipboardList},{"name":"resources", "icon":Paperclip}].map((trigger)=>{
                          const Icon = trigger.icon
                          return (
                            <TabsTrigger 
                            className=""
                            value={trigger.name}><Icon className="text-primary"/> {capitalize(trigger.name)}</TabsTrigger>
                          )
                        })
                      }
                    </TabsList>
                    <TabsContent value="sessions">
                      <SessionsTab groupId={id} userRole={userRoleInGroup}/>
                    </TabsContent>

                    <TabsContent value="members" className="space-y-6">
                      <MembersTab 
                      members={data?.memberships} 
                      groupId={id}
                      />
                    </TabsContent>

                    <TabsContent value="chat">
                      <ChatTab
                      groupId={id}
                      />
                    </TabsContent>

                    <TabsContent value="attendances">
                      <AttendanceHistoryTab
                        groupId={id}
                        maxMembers={10}
                      />
                    </TabsContent>

                    <TabsContent value="resources">
                      <ResourcesTab groupId={id}/>
                    </TabsContent>
                  </Tabs>
                )

              case "pending":
                return (
                  <PendingMembershipRequest
                    onCancel={handleCancelRequest}
                    isCancelling={isCancellingRequest}
                  />
                )

              case "cancelled":
                return (
                  <CancelledMembership/>
                )

              case "none":
              default:
                return (
                  <NotAMemberBanner
                    onRequest={handleJoinRequest}
                    isRequesting={isRequesting}
                  />
                )
            }
          })()}
        </div>
      </div>
    </Layout>
  );
}


const GroupPageHeader = ({ detail }: GroupPageHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden">

        {/* Top section */}
        <div className="px-6 pt-5 pb-5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-2.5 py-1 mb-3">
            <BookOpen className="h-3 w-3" />
            {detail.subject_detail.name}
          </div>

          <h1 className="text-[22px] font-medium leading-tight mb-1.5">
            {detail.name}
          </h1>

          <p className="text-[13px] text-neutral-500 leading-relaxed max-w-2xl">
            {detail.description}
          </p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {/* <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-full px-2.5 py-1">
              <Globe className="h-3 w-3" />
              {detail.is_private ? "Private group" : "Public group"}
            </span> */}
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-full px-2.5 py-1">
              <UserCircle className="h-3 w-3" />
              {detail.creator_detail.email}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-100" />

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {[
            { icon: Users,       value: `${detail.memberships.length} / ${detail.max_members}`, label: "Members"   },
            { icon: CalendarDays, value: detail.total_sessions,                                  label: "Sessions"  },
            { icon: BookMarked,  value: detail.total_resources ?? "—",                           label: "Resources" },
            { icon: Clock,       value: relativeTime(detail.created_at),                         label: "Created"   },
          ].map(({ icon: Icon, value, label }, i, arr) => (
            <div
              key={label}
              className={`flex flex-col gap-0.5 px-5 py-3.5 ${i < arr.length - 1 ? "border-r border-neutral-100" : ""}`}
            >
              <Icon className="h-[15px] w-[15px] text-orange-500 mb-1" />
              <span className="text-[15px] font-medium truncate">{value}</span>
              <span className="text-[11px] text-neutral-400">{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}



const SessionsTab = ({groupId, userRole}:SessionsTabProps) =>{
  const [showScheduleSession, setShowScheduleSession] = useState<boolean>(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("scheduled")



  const fetchStudyGroupSessions = async () => {
    const baseUrl = `/study-group/${groupId}/sessions_list`
    const params = new URLSearchParams()
    if (selectedStatus){
      params.set("status",selectedStatus)
    }
    const separator = baseUrl.includes("?") ? "&" : "?";
    const response = await api.get(`${baseUrl}${separator}${params.toString()}`);
    console.log(response.data)
    return response.data
  }

  const {data, isLoading, error} = useQuery({
    queryKey:['sessions',selectedStatus],
    queryFn: fetchStudyGroupSessions,
    enabled: !!groupId
  })


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Sessions of the group</h2>
        {
          userRole !== "member" && (
            <Button
            onClick={()=>setShowScheduleSession(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          )
        }
      </div>
      <div className="">
        <Tabs orientation="vertical" defaultValue="scheduled" className="space-y-6">
          <TabsList className="w-3xs text-center">
            {/* upcoming == scheduled */}
            {
              ["scheduled","on-going", "finished","cancelled"].map((status, index)=>{
                return (
                  <TabsTrigger
                  key={index}
                  value={status}
                  onClick={()=>{setSelectedStatus(status)}}
                  >{capitalize(status)}</TabsTrigger>
                )
              })
            }
          </TabsList>

            {
              ["scheduled","on-going", "finished","cancelled"].map((status, index)=>{
                return (
                  <TabsContent
                  key={index}
                  value={status}>
                    <QueryWrapper
                    data={data}
                    isLoading={isLoading}
                    error={error}
                    noResultsComponent={
                      <NoResult
                        label={`${status} sessions`}
                        description={`There are no recorded ${status} sessions`}
                      />
                    }
                    >
                      <div className="flex flex-col gap-2">
                      {
                        data?.map((session:Session)=>{
                          return (
                            <SessionCard
                              key={session.id}
                              session={session}
                              showActions={userRole !== 'member'}
                            />
                          )
                        })
                      }
                      </div>
                    </QueryWrapper>
                  </TabsContent>
                )
              })
            }

        </Tabs>
      </div>
    
          <CreateSessionDialog
          groupId={Number(groupId)}
          open={showScheduleSession}
          onOpenChange={setShowScheduleSession}
          />

    </div>
  )
}



const MembersTab = ({ members, groupId }: MembersTabProps) => {
  const [showMemberManagementDialog, setShowMemberManagementDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
 
  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Members</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {members.length} {members.length === 1 ? "member" : "members"} in this group
          </p>
        </div>
 
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInviteDialog(true)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite
          </Button>
          <Button
            onClick={() => setShowMemberManagementDialog(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm gap-2 shadow-sm shadow-orange-100"
          >
            <Settings2 className="h-4 w-4" />
            Manage
          </Button>
        </div>
      </div>
 
      {/* ── Empty state ── */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No members yet</p>
          <p className="text-xs text-gray-400 mt-1">Invite someone to get started</p>
        </div>
      ) : (
        /* ── Grid ── */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 hover:border-orange-200 hover:shadow-sm transition-all"
            >
              <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-orange-100">
                <AvatarImage
                  src={member.user.avatar || ""}
                  alt={member.user.first_name}
                />
                <AvatarFallback className="bg-orange-50 text-orange-500 text-sm font-semibold">
                  {member.user.first_name?.[0]}{member.user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
 
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {member.user.username}
                  </span>
                  {getRoleBadge(member.role)}
                </div>
                {member.user.email && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{member.user.email}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
 
      {/* ── Dialogs ── */}
      <GroupMembershipsDialog
        groupId={groupId}
        open={showMemberManagementDialog}
        onOpenChange={setShowMemberManagementDialog}
      />
      <InviteUserDialog
        groupId={groupId}
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </div>
  );
};

const ChatTab = ({groupId}:ChatTabProps) => {


  return (
      <Card variant="elevated" className="h-[900px] flex flex-col">
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Group Chat
          </CardTitle>
        </CardHeader>

        <CardContent className=" overflow-y-auto p-4 space-y-4 h-full">
          <ChatBox
          groupId={groupId}
          />
        </CardContent>
      </Card>
  )
}


const AttendanceHistoryTab = ({groupId, maxMembers}:AttendanceHistoryProps) => {

  const fetchGroupAttendanceHistory = async (groupId:number) => {
    const response = await api.get(`/study-group/${groupId}/attendance_history`)
    return response.data
  }

  const {data, isLoading, error} = useQuery({
    queryKey:["group-attendance-history", groupId],
    queryFn: ()=>fetchGroupAttendanceHistory(Number(groupId)),
    enabled:!!groupId

  })


  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Attendance History</CardTitle>
      </CardHeader>
      <CardContent>
        <QueryWrapper
        data={data}
        isLoading={isLoading}
        error={error}
        noResultsComponent={
          <NoResult
            label="Attendance History"
            description="There are attendances records yet"
          />
        }
        >
          <div className="space-y-4">
            {
              data?.map((attendance:AttendanceProps, index:number)=>{
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                    <div>
                      <div className="font-medium">{attendance.date}</div>
                      <div className="text-sm text-muted-foreground">
                        {attendance.users?.length}/{maxMembers} attended
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {
                        attendance.users?.map((member:UserProps) => (
                        <Avatar key={member.id} size="sm" className="border-2 border-card">
                          <AvatarImage src={member.avatar || ""} />
                          <AvatarFallback>{member.first_name}</AvatarFallback>
                        </Avatar>
                        ))
                      }
                    </div>
                  </div>
                )
              })
            }
          </div>
        </QueryWrapper>
      </CardContent>
    </Card>
    )
}


const ResourcesTab = ({groupId}) => {
  const [showDialog, setShowDialog] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResourceType, setSelectedResourceType] = useState<string>("all");

  
  const fetchResources = async (groupId:number) => {
    const params = new URLSearchParams()
    params.set("group", groupId.toString());
    if (searchQuery) params.set("search", searchQuery);
    if (selectedResourceType && selectedResourceType !== "all") params.set("resource_type",selectedResourceType)

    const response = await api.get(`/resource/?${params.toString()}`)
    console.log(response)
    return response.data
  } 


  const {data, isLoading, error} = useQuery({
    queryKey:["resources", groupId, searchQuery, selectedResourceType],
    queryFn: ()=>fetchResources(Number(groupId)),
    enabled:!!groupId

  })


  return (
    <div className="">
      <div className="flex gap-2 items-center justify-between mb-5">

      {/* filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* resource type, document and link */}
        <div className="flex gap-2 flex-wrap sm:flex-nowrap overflow-x-auto sm:overflow-visible">
          {RESOURCE_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = selectedResourceType === option.name;
            return (
              <Button
                key={option.name}
                size="sm"
                onClick={() => setSelectedResourceType(option.name)}
                variant={isActive ? "default" : "outline"}
                className="shrink-0 gap-1.5"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {capitalize(option.name)}
              </Button>
            );
          })}
        </div>
      </div>

        <div className="flex gap-3">
          <Button 
          variant="default"
          onClick={()=>setShowDialog(true)}
          >
            <ArchiveRestore className="h-4 w-4 mr-2" />
            Share resources
          </Button>
        </div>
      </div>


      {/* displaying all resources */}

        <QueryWrapper
        data={data}
        isLoading={isLoading}
        error={error}
        noResultsComponent={
          <NoResult
            label="Resources"
            description="There are no shared resources yet"
          />
        }
        >
        
      <div className="grid grid-cols-3 gap-4">
          {
            data?.results?.map((data)=>{
              return (
                // <p>{data.url}</p>
                <ResourceCard
                key={data.id}
                id={data.id}
                name={data.name}
                description={data.description}
                resource_type={data.resource_type}
                url={data.url}
                uploader_detail={data.uploader_detail}
                group_detail={data.group_detail}

                />
              )
            })
          }
      </div>
        </QueryWrapper>

      {/* </div> */}

      <ShareResourceDialog
      open={showDialog}
      onOpenChange={setShowDialog}
      groupId={groupId}
      />
    </div>
  )
}



 
// ── NotAMemberBanner ───────────────────────────────────────────────────────
export const NotAMemberBanner = ({ onRequest, isRequesting }: NotAMemberBannerProps) => (
  <BannerWrapper>
    {/* Orange accent top bar */}
    <div className="h-1.5 w-full bg-orange-500" />
 
    <div className="flex flex-col items-center text-center px-8 py-12">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-5">
        <Lock className="h-7 w-7 text-orange-500" />
      </div>
 
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Members Only</h2>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
        Join this group to view sessions, members, and chat with your study partners.
      </p>
 
      <Button
        onClick={onRequest}
        disabled={isRequesting}
        className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium shadow-md shadow-orange-100 transition-all disabled:opacity-60"
      >
        {isRequesting ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin mr-2" />
            Sending request…
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Join group
            <ArrowRight className="h-4 w-4 ml-2 opacity-70" />
          </>
        )}
      </Button>
    </div>
  </BannerWrapper>
);
 
// ── PendingMembershipRequest ───────────────────────────────────────────────
export const PendingMembershipRequest = ({ onCancel, isCancelling }: PendingMembershipRequestProps) => (
  <BannerWrapper>
    {/* Amber accent top bar */}
    <div className="h-1.5 w-full bg-amber-400" />
 
    <div className="flex flex-col items-center text-center px-8 py-12">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-5">
        <Clock className="h-7 w-7 text-amber-500" />
      </div>
 
      {/* Status pill */}
      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-medium px-3 py-1 rounded-full mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Under review
      </div>
 
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Request Pending</h2>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
        Your request to join this group is currently under review. We'll notify you once it's approved.
      </p>
 
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isCancelling}
        className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-xl px-6 py-2.5 text-sm font-medium transition-all disabled:opacity-60"
      >
        {isCancelling ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-red-300 border-t-red-500 animate-spin mr-2" />
            Cancelling…
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 mr-2" />
            Cancel request
          </>
        )}
      </Button>
    </div>
  </BannerWrapper>
);
 
// ── CancelledMembership ────────────────────────────────────────────────────
export const CancelledMembership = () => (
  <BannerWrapper>
    {/* Red accent top bar */}
    <div className="h-1.5 w-full bg-red-400" />
 
    <div className="flex flex-col items-center text-center px-8 py-12">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
        <XCircle className="h-7 w-7 text-red-400" />
      </div>
 
      {/* Status pill */}
      <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-500 text-xs font-medium px-3 py-1 rounded-full mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Access revoked
      </div>
 
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Membership Cancelled</h2>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        Your membership in this group has been cancelled. You no longer have access to group sessions, chat, or resources.
      </p>
    </div>
  </BannerWrapper>
);
