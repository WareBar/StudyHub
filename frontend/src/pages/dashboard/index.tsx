import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type StudyGroup, StudyGroupCard } from "@/components/StudyGroupCard";
import { SessionCard, type Session } from "@/components/SessionCard";
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Bell,
  Target,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import QueryWrapper from "@/components/query-wrapper";

// Mock data
const userGroups: StudyGroup[] = [
  {
    id: "1",
    name: "Calculus Study Crew",
    subject: "Mathematics",
    description: "Weekly problem-solving sessions for Calculus I and II",
    memberCount: 6,
    maxMembers: 8,
    schedule: "Mon, Wed 6-8 PM",
    isPrivate: false,
    matchPercentage: 95,
    nextSession: "Today, 6 PM",
    members: [
      {
        id: "1",
        name: "Alex",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      },
      {
        id: "2",
        name: "Sarah",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      },
      {
        id: "3",
        name: "Mike",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      },
      {
        id: "4",
        name: "Emma",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
      },
    ],
  },
  {
    id: "2",
    name: "CS Algorithms Masters",
    subject: "Computer Science",
    description: "Deep dive into data structures and algorithms",
    memberCount: 5,
    maxMembers: 6,
    schedule: "Tue, Thu 7-9 PM",
    isPrivate: true,
    matchPercentage: 88,
    nextSession: "Tomorrow, 7 PM",
    members: [
      {
        id: "5",
        name: "James",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
      },
      {
        id: "6",
        name: "Lisa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
      },
      {
        id: "7",
        name: "David",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
      },
    ],
  },
];

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
    ],
  },
  {
    id: "2",
    groupName: "CS Algorithms Masters",
    subject: "Computer Science",
    date: "Tomorrow",
    time: "7:00 PM",
    duration: "2 hours",
    location: "Library Room 204",
    isOnline: false,
    attendees: [
      {
        id: "5",
        name: "James",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
        attending: true,
      },
      {
        id: "6",
        name: "Lisa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
        attending: true,
      },
    ],
  },
];

const stats = [
  { label: "Study Groups", value: 3, icon: Users, trend: "+1 this week" },
  { label: "Sessions This Week", value: 5, icon: Calendar, trend: "2 more than last week" },
  { label: "Study Hours", value: 12, icon: Clock, trend: "+3 from last week" },
  { label: "Attendance Rate", value: "92%", icon: Target, trend: "Great job!" },
];

export default function DashboardPage() {
  return (
    <Layout isAuthenticated>
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, John! 👋</h1>
              <p className="text-muted-foreground mt-1">
                You have 2 study sessions scheduled today
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link to="/groups">
                  <Users className="h-4 w-4 mr-2" />
                  Find Groups
                </Link>
              </Button>
              <Button asChild>
                <Link to="/groups/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <Stats/>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Sessions */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/schedule">
                      View all
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {upcomingSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </section>

              {/* My Groups */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">My Study Groups</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/groups">
                      View all
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {userGroups.map(group => (
                    <StudyGroupCard key={group.id} group={group} showMatch={false} />
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="soft" className="w-full justify-start" asChild>
                    <Link to="/groups">
                      <Users className="h-4 w-4 mr-2" />
                      Find New Groups
                    </Link>
                  </Button>
                  <Button variant="soft" className="w-full justify-start" asChild>
                    <Link to="/schedule">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Session
                    </Link>
                  </Button>
                  <Button variant="soft" className="w-full justify-start" asChild>
                    <Link to="/profile">
                      <Clock className="h-4 w-4 mr-2" />
                      Update Availability
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      type: "message",
                      text: "New message in Calculus Study Crew",
                      time: "5 min ago",
                    },
                    {
                      type: "join",
                      text: "Emma joined CS Algorithms Masters",
                      time: "1 hour ago",
                    },
                    {
                      type: "session",
                      text: "Physics session completed",
                      time: "Yesterday",
                    },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Suggested Groups */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Suggested for You</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Physics 101 Study Group", match: 92, members: 4 },
                    { name: "Organic Chemistry Help", match: 85, members: 6 },
                  ].map((group, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-sm">{group.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.members} members
                        </p>
                      </div>
                      <Badge variant="success">{group.match}% match</Badge>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/groups">See more suggestions</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


const Stats = () => {
  const fetchStats = async () => {
    const response = await api.get("/user/stats")
    console.log(response.data)
    return response.data
  }

  const {data, isLoading, error} = useQuery({
    queryKey:["stats"],
    queryFn:fetchStats,
  })

  const icons = [Users, Calendar, Clock, Target]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <QueryWrapper
      data={data}
      isLoading={isLoading}
      error={error}
      >
        {
          data?.map((stats, idx)=>{
            const Icon = icons[idx % icons.length] // safe mapping
            return (
              <Card key={idx} variant="default">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">{stats.content}</div>
                  <div className="text-sm text-muted-foreground">{stats.title}</div>
                  {/* <div className="text-xs text-success mt-1">{stat.trend}</div> */}
                </CardContent>
              </Card>
            )
          })
        }
      {/* {data.map(stat => (
        <Card key={stat.label} variant="default">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="h-5 w-5 text-primary" />
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-xs text-success mt-1">{stat.trend}</div>
          </CardContent>
        </Card>
      ))}  */}
      </QueryWrapper>
    </div>
  )
}
