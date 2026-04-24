import { useState } from "react";
import { Layout } from "@/components/Layout";
import { StudyGroupCard, type StudyGroup } from "@/components/StudyGroupCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "@/utils/api";
import QueryWrapper from "@/components/query-wrapper";
import NoResult from "@/components/no-result";
import Choose from "@/components/ui/choose";
import { CreateStudyGroupDialog } from "@/components/create-group";
import { useAuth } from "@/context/AuthContext";

interface Subject {
  id:number
  name:string,
  created_at:string,
  updated_at:string
}


type GroupFilter = "all" | "creator" | "member" | "moderator";

const FILTER_OPTIONS: { label: string; value: GroupFilter }[] = [
  { label: "All Groups", value: "all" },
  { label: "Groups I Created", value: "creator" },
  { label: "Groups I Moderate", value: "moderator" },
  { label: "Groups I Joined", value: "member" },
];

export default function MyGroupsPage() {
  const {user} = useAuth()
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<GroupFilter>("all");
  const [selectSubject, setSelectedSubject] = useState<Subject | null>()
  const [showCreateStudyGroupDialog, setShowCreateStudyGroupDialog] = useState<boolean>(false)


  const fetchMyGroups = async (): Promise<{ results: StudyGroup[]; total: number }> => {
    const baseUrl = "/study-group/";
    const params = new URLSearchParams();
    params.set("type","my")
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    if (activeFilter !== "all") {
      params.set("memberships__role", activeFilter);
    }

    if (selectSubject){
      params.set("subject", String(selectSubject.id))
    }

    const separator = baseUrl.includes("?") ? "&" : "?";
    const response = await api.get(`${baseUrl}${separator}${params.toString()}`);
    console.log(response.data)
    return response.data;
  };


  const fetchSubjects = async () => {
    const response = await api.get("/subject/");
    console.log(response)
    return response.data
  }

  const results = useQueries({
    queries:[
      {queryKey: ['my-study-groups', searchQuery], queryFn: fetchMyGroups},
      {queryKey: ['subjects'], queryFn:fetchSubjects}
    ]
  })

  const [groups, subjects] = results
  


  return (
    <Layout isAuthenticated>
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">My Study Groups</h1>
              <p className="text-muted-foreground mt-1">
                Manage and access all the groups you've joined or created
              </p>
            </div>
            <Button
            onClick={()=>setShowCreateStudyGroupDialog(true)}
            >
                <Plus className="h-4 w-4 mr-2" />
                Create Group
            </Button>
          </div>

          {/* Search and Filters */}
          <Card variant="elevated" className="mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Role Filter Tabs */}
                <div className="flex gap-2">
                  {FILTER_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={activeFilter === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                <QueryWrapper
                data={subjects.data}
                isLoading={subjects.isLoading}
                error={subjects.error}
                >
                  <Choose
                  onValueChange={(val)=>setSelectedSubject(val)}
                  value={selectSubject}
                  labelKey="name"
                  choices={subjects.data?.results}
                  width="sm"/>
                </QueryWrapper>
              </div>

              {/* Active Filters */}
              {(searchQuery || activeFilter !== "all") && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {activeFilter !== "all" && (
                    <Badge variant="soft" className="gap-1">
                      {FILTER_OPTIONS.find((o) => o.value === activeFilter)?.label}
                      <button onClick={() => setActiveFilter("all")}>
                        <span className="ml-1 text-xs">✕</span>
                      </button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="soft" className="gap-1">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery("")}>
                        <span className="ml-1 text-xs">✕</span>
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <QueryWrapper
            data={groups.data}
            isLoading={groups.isLoading}
            error={groups.error}
            noResultsComponent={
              <NoResult
                label="Study Groups"
                description={
                  searchQuery
                    ? `No groups matched "${searchQuery}". Try a different search.`
                    : "You haven't joined any study groups yet. Find one or create your own!"
                }
                action={
                  <div className="flex gap-3">
                    <Button asChild variant="outline">
                      <Link to="/groups">Find Groups</Link>
                    </Button>
                    <Button
                    onClick={()=>setShowCreateStudyGroupDialog(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Group
                    </Button>
                  </div>
                }
              />
            }
          >
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">{groups.data?.total}</span>{" "}
                  {groups.data?.total === 1 ? "group" : "groups"}
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {groups.data?.results?.map((group) => (
                  <StudyGroupCard key={group.id} group={group} currentUserId={user.id}/>
                ))}
              </div>
            </>
          </QueryWrapper>
        </div>
      </div>


      <CreateStudyGroupDialog
      open={showCreateStudyGroupDialog}
      onOpenChange={setShowCreateStudyGroupDialog}
      />
    </Layout>
  );
}