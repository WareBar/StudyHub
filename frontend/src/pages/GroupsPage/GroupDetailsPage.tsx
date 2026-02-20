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
  Globe,
  MessageCircle,
  Settings,
  UserPlus,
  ArrowLeft,
  Send,
  Crown,
  Shield,
  CheckCircle,
} from "lucide-react";

const groupData = {
  id: "1",
  name: "Calculus Study Crew",
  subject: "Mathematics",
  description:
    "Weekly problem-solving sessions for Calculus I and II. We focus on understanding concepts deeply and practice exam questions together. Whether you're struggling with derivatives or acing integrals, there's a place for you here!",
  memberCount: 6,
  maxMembers: 8,
  schedule: "Monday & Wednesday, 6-8 PM",
  isPrivate: false,
  matchPercentage: 95,
  createdAt: "2 months ago",
  members: [
    {
      id: "1",
      name: "Alex Johnson",
      role: "owner",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      course: "Mathematics",
      year: "Junior",
    },
    {
      id: "2",
      name: "Sarah Chen",
      role: "admin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      course: "Computer Science",
      year: "Sophomore",
    },
    {
      id: "3",
      name: "Mike Williams",
      role: "member",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      course: "Engineering",
      year: "Junior",
    },
    {
      id: "4",
      name: "Emma Davis",
      role: "member",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
      course: "Physics",
      year: "Freshman",
    },
    {
      id: "5",
      name: "James Brown",
      role: "member",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
      course: "Mathematics",
      year: "Senior",
    },
    {
      id: "6",
      name: "Lisa Anderson",
      role: "member",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
      course: "Statistics",
      year: "Junior",
    },
  ],
};

const upcomingSessions: Session[] = [
  {
    id: "1",
    groupName: "Calculus Study Crew",
    subject: "Mathematics",
    date: "Today",
    time: "6:00 PM",
    duration: "2 hours",
    location: "Zoom Meeting",
    isOnline: true,
    attendees: [
      {
        id: "1",
        name: "Alex",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        attending: true,
      },
      {
        id: "2",
        name: "Sarah",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        attending: true,
      },
      {
        id: "3",
        name: "Mike",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
        attending: false,
      },
      {
        id: "4",
        name: "Emma",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
        attending: true,
      },
    ],
  },
  {
    id: "2",
    groupName: "Calculus Study Crew",
    subject: "Mathematics",
    date: "Wednesday",
    time: "6:00 PM",
    duration: "2 hours",
    location: "Library Room 105",
    isOnline: false,
    attendees: [
      {
        id: "1",
        name: "Alex",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        attending: true,
      },
      {
        id: "5",
        name: "James",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
        attending: true,
      },
    ],
  },
];

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
  const [isJoined, setIsJoined] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <Badge variant="warning" className="gap-1">
            <Crown className="h-3 w-3" />
            Owner
          </Badge>
        );
      case "admin":
        return (
          <Badge variant="info" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        );
      default:
        return null;
    }
  };

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
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <Card variant="elevated" className="flex-1">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="soft">{groupData.subject}</Badge>
                      {groupData.isPrivate ? (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Private
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Globe className="h-3 w-3" />
                          Public
                        </Badge>
                      )}
                      <Badge variant="success">{groupData.matchPercentage}% match</Badge>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{groupData.name}</h1>
                    <p className="text-muted-foreground max-w-2xl">{groupData.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
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
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        {groupData.memberCount}/{groupData.maxMembers}
                      </div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{groupData.schedule}</div>
                      <div className="text-xs text-muted-foreground">Schedule</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{groupData.createdAt}</div>
                      <div className="text-xs text-muted-foreground">Created</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <div className="font-semibold">24</div>
                      <div className="text-xs text-muted-foreground">Sessions</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="sessions" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {upcomingSessions.map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Members ({groupData.members.length})</h2>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupData.members.map(member => (
                  <Card key={member.id} variant="default">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar size="lg">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold truncate">{member.name}</span>
                            {getRoleBadge(member.role)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.course} • {member.year}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Chat Tab */}
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

            {/* Attendance Tab */}
            <TabsContent value="attendance">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: "Dec 18", present: 5, total: 6 },
                      { date: "Dec 16", present: 6, total: 6 },
                      { date: "Dec 11", present: 4, total: 6 },
                      { date: "Dec 9", present: 5, total: 6 },
                    ].map((session, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      >
                        <div>
                          <div className="font-medium">{session.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {session.present}/{session.total} attended
                          </div>
                        </div>
                        <div className="flex -space-x-2">
                          {groupData.members.slice(0, session.present).map(member => (
                            <Avatar key={member.id} size="sm" className="border-2 border-card">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
