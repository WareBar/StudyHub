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
import Stats from "@/components/stats";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import QueryWrapper from "@/components/query-wrapper";
import NoResult from "@/components/no-result";
import { useAuth } from "@/context/AuthContext";
import { CreateStudyGroupDialog } from "@/components/create-group";
import { useState } from "react";


export default function DashboardPage() {
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState<boolean>(false)
  const {user} = useAuth()

  return (
    <Layout isAuthenticated>
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {user?.username}! 👋</h1>
              <p className="text-muted-foreground mt-1">
                You have 2 study sessions scheduled today
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Link to="/groups" className="flex h-full w-full items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Find Groups
                </Link>
              </Button>
              <Button
              onClick={()=>setShowCreateGroupDialog(!showCreateGroupDialog)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <Stats/>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Sessions */}
              <UpcomingSessions/>

              {/* My Groups */}
              <MyStudyGroups/>
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

          <CreateStudyGroupDialog
          open={showCreateGroupDialog}
          onOpenChange={setShowCreateGroupDialog}
          />
        </div>
      </div>
    </Layout>
  );
}



const UpcomingSessions = () => {
  const fetchUpcomingSessions = async (): Promise<{ results: Session[] }> => {
    const response = await api.get("/session/upcoming")
    console.log(response.data)
    return response.data
  }

  const {data, isLoading, error} = useQuery({
    queryKey: ["upcoming-sessions"],
    queryFn: fetchUpcomingSessions
  })

  return (
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

      <QueryWrapper
        data={data}
        isLoading={isLoading}
        error={error}
        noResultsComponent={
          <NoResult
            label="Upcoming Sessions"
            description="There are no upcoming sessions yet"
          />
        }
      >

        <div className="grid sm:grid-cols-2 gap-4">
          {data?.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
            />
          ))}
        </div>
      </QueryWrapper>
    </section>
  )
}


const MyStudyGroups = () => {
  const { user, isLoading: authLoading } = useAuth();

  const fetchMyStudyGroups = async (): Promise<{ results: StudyGroup[] }> => {
    const response = await api.get("/study-group/?type=my&page_size=2");
    return response.data;
  };
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-study-group"],
    queryFn: fetchMyStudyGroups,
    enabled: !!user, //dont fetch until user is loaded
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Study Groups</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/my-groups">
            View all
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
      <QueryWrapper
        data={data}
        isLoading={isLoading || authLoading}
        error={error}
        noResultsComponent={
          <NoResult
            label="My Study Groups"
            description="You are not part of any group yet"
          />
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {data?.results?.map((myGroup) => (
            <StudyGroupCard key={myGroup.id} group={myGroup} currentUserId={user?.id}/>
          ))}
        </div>
      </QueryWrapper>
    </section>
  );
};

