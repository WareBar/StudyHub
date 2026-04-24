import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionCard, type Session } from "@/components/SessionCard";
import {
  Users,
  Calendar,
  Clock,
  Lock,
  MessageCircle,
  XCircle,
  UserPlus,
  ArrowLeft,
  Send,
  CheckCircle,
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
import { getRoleBadge } from "@/components/get-role-badge";


type PendingMembershipRequestProps = {
  onCancel: () => void;
  isCancelling: boolean;
};



const chatMessages = [
  {
    id: "1",
    user: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    message: "Hey everyone! Ready for today's session?",
    time: "5:45 PM",
  },
  {
    id: "2",
    user: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    message: "Yes! I have some questions about integration by parts",
    time: "5:47 PM",
  },
  {
    id: "3",
    user: "Emma Davis",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    message: "Same here, chapter 7 was tough 😅",
    time: "5:48 PM",
  },
  {
    id: "4",
    user: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    message: "Perfect, we'll cover that today. See you all in 10 minutes!",
    time: "5:50 PM",
  },
];




export default function GroupDetailsPage() {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const { 
    joinRequest, isRequesting,
    cancelRequest, isCancellingRequest
  } = useStudyGroup()
  const {toast} = useToast()
  

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
  }


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
                    <TabsList className="bg-muted/50">
                      <TabsTrigger value="sessions">Sessions</TabsTrigger>
                      <TabsTrigger value="members">Members</TabsTrigger>
                      <TabsTrigger value="chat">Chat</TabsTrigger>
                      <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sessions">
                      <SessionsTab />
                    </TabsContent>

                    <TabsContent value="members" className="space-y-6">
                      <MembersTab 
                      members={data?.memberships} 
                      groupId={id}
                      />
                    </TabsContent>

                    <TabsContent value="chat">
                      <Card variant="elevated" className="h-[500px] flex flex-col">
                        <CardHeader className="border-b border-border py-4">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            Group Chat
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                          {chatMessages.map(msg => (
                            <div key={msg.id} className="flex items-start gap-3">
                              <Avatar size="sm">
                                <AvatarImage src={msg.avatar} alt={msg.user} />
                                <AvatarFallback>{msg.user[0]}</AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                  <span className="font-medium text-sm">{msg.user}</span>
                                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                                </div>
                                <p className="text-sm mt-1">{msg.message}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>

                        <div className="p-4 border-t border-border">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Type a message..."
                              value={message}
                              onChange={e => setMessage(e.target.value)}
                              className="flex-1"
                            />
                            <Button>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="attendance">
                      <AttendanceHistoryTab
                        groupId={id}
                        maxMembers={10}
                      />
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


const GroupPageHeader = ({detail}) => {
  return (
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <Card variant="elevated" className="flex-1">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="soft">{detail.subject_detail.name}</Badge>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{detail.name}</h1>
                    <p className="text-muted-foreground max-w-2xl">{detail.description}</p>
                  </div>
                  {/* <div className="flex gap-2 shrink-0">
                    {isJoined ? (
                      <>
                        <Button variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                        <Button variant="destructive" onClick={() => setIsJoined(false)}>
                          Leave Group
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsJoined(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Join Group
                      </Button>
                    )}
                  </div> */}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        {/* {groupData.memberCount}/{groupData.maxMembers} */}
                        {detail.memberships.length}/{detail.max_members}
                      </div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">Tuesday</div>
                      <div className="text-xs text-muted-foreground">Schedule</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{relativeTime(detail.created_at)}</div>
                      <div className="text-xs text-muted-foreground">Created</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <div className="font-semibold">{detail.total_sessions}</div>
                      <div className="text-xs text-muted-foreground">Sessions</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
  )

}

const SessionsTab = () =>{

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Sessions of the group</h2>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </div>
      {/* <div className="grid sm:grid-cols-2 gap-4">
        {upcomingSessions.map(session => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div> */}
      <div className="">
        <Tabs orientation="vertical" defaultValue="upcoming" className="space-y-6">
          <TabsList className="w-3xs text-center">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="on-going">On Going</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="finished">Finished</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}





const MembersTab = ({members, groupId}) => {
  const [showMemberManagementDialog, setShowMemberManagementDialog] = useState<boolean>(false)
  const [showInviteDialog, setShowInviteDialog] = useState<boolean>(false)


  return (
    <div className="">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">Members {members.length}</h2>
        <div className="flex gap-3">
          <Button variant="outline"
          onClick={()=>setShowInviteDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>

          <Button 
          variant="default"
          onClick={()=>setShowMemberManagementDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Manage memberships
          </Button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members?.map(member => (
          <Card key={member.id} variant="default">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar size="lg">
                  <AvatarImage src={member.user.avatar} alt={member.user.first_name} />
                  <AvatarFallback>{member.user.first_name}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold truncate">{member.user.username}</span>
                    {getRoleBadge(member.role)}
                  </div>
                  {/* <div className="text-sm text-muted-foreground">
                    {member.course} • {member.year}
                  </div> */}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
  )
}

const AttendanceHistoryTab = ({groupId, maxMembers}) => {

  const fetchGroupAttendanceHistory = async (groupId:number) => {
    const response = await api.get(`/study-group/${groupId}/attendance_history`)
    return response.data
  }

  const {data, isLoading, error} = useQuery({
    queryKey:["group-attendance-history", groupId],
    queryFn: ()=>fetchGroupAttendanceHistory(groupId),
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
              data?.map((attendance, index)=>{
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
                        attendance.users?.map(member => (
                        <Avatar key={member.id} size="sm" className="border-2 border-card">
                          <AvatarImage src={member.avatar} />
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


const NotAMemberBanner = ({onRequest, isRequesting}) => {
  return (
  <Card variant="elevated" className="text-center py-12">
    <CardContent className="space-y-4">
      <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
      <h2 className="text-xl font-semibold">Members Only</h2>
      <p className="text-muted-foreground">
        Join this group to view sessions, members, and chat.
      </p>
      <Button
      onClick={()=>onRequest()}
      disabled={isRequesting}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {isRequesting? "Sending join request": "Join group"}
      </Button>
    </CardContent>
  </Card>
  )
};

const PendingMembershipRequest = ({
  onCancel,
  isCancelling,
}: PendingMembershipRequestProps) => {
  return (
    <Card variant="elevated" className="text-center py-12">
      <CardContent className="space-y-4">
        <Clock className="h-12 w-12 text-yellow-500 mx-auto" />

        <h2 className="text-xl font-semibold">Request Pending</h2>

        <p className="text-muted-foreground">
          Your request to join this group is currently under review.
        </p>

        <div className="flex justify-center">
          <Button
            variant="destructive"
            onClick={onCancel}
            disabled={isCancelling}
          >
            <XCircle className="h-4 w-4 mr-2" />
            {isCancelling ? "Cancelling..." : "Cancel Request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};