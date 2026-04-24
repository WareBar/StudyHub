import { useState } from "react";
import { Layout } from "@/components/Layout";
import { StudyGroupCard, type StudyGroup } from "@/components/StudyGroupCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import { Search, Plus, SlidersHorizontal} from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import api from "@/utils/api";
import QueryWrapper from "@/components/query-wrapper";
import NoResult from "@/components/no-result";
import Choose from "@/components/ui/choose";
import { CreateStudyGroupDialog } from "@/components/create-group";


interface Subject {
  id:number
  name:string,
  created_at:string,
  updated_at:string
}

export default function GroupsFinderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectSubject, setSelectedSubject] = useState<Subject | null>()
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateStudyGroupDialog, setShowCreateStudyGroupDialog] = useState<boolean>(false)

  const fetchGroups = async (): Promise<{ results: StudyGroup[] }> => {
    const baseUrl = "/study-group/"
    const params = new URLSearchParams()
    if (searchQuery){
      params.set("search", searchQuery)
    }
    if (selectSubject){
      params.set("subject", String(selectSubject.id))
    }
    const separator = baseUrl.includes("?") ? "&" : "?"
    const response = await api.get(`${baseUrl}${separator}${params.toString()}`)
    console.log(response)
    return response.data;
  };

  const fetchSubjects = async () => {
    const response = await api.get("/subject/");
    console.log(response)
    return response.data
  }

  const results = useQueries({
    queries:[
      {queryKey: ['study-groups', searchQuery, selectSubject], queryFn: fetchGroups},
      {queryKey: ['subjects'], queryFn:fetchSubjects}
    ]
  })

  // deconstruct
  const [groups, subjects] = results
  

  return (
    <Layout isAuthenticated>
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Find Study Groups</h1>
              <p className="text-muted-foreground mt-1">
                Discover groups that match your subjects and schedule
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
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search groups by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-3">
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
                  <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {/* {(selectedSubject !== "All Subjects" || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {selectedSubject !== "All Subjects" && (
                    <Badge variant="soft" className="gap-1">
                      {selectedSubject}
                      <button onClick={() => setSelectedSubject("All Subjects")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="soft" className="gap-1">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )} */}

              {/* Active Filters */}


              {/* Extended Filters */}
              {/* {showFilters && (
                <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort by</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="members">Most Members</SelectItem>
                        <SelectItem value="recent">Recently Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Group Size</label>
                    <Select defaultValue="any">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Size</SelectItem>
                        <SelectItem value="small">Small (2-4)</SelectItem>
                        <SelectItem value="medium">Medium (5-8)</SelectItem>
                        <SelectItem value="large">Large (9+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )} */}
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
                description="No study groups found. Try to create a group"
                action={<Button>Create Group</Button>}
              />
            }
          >
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {groups.data?.total}
                  </span>{" "}
                  groups
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {groups.data?.results?.map((myGroup) => (
                  <StudyGroupCard key={myGroup.id} group={myGroup}/>
                ))}
              </div>

              {/* {filteredGroups.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGroups.map((group) => (
                    <StudyGroupCard
                      key={group.id}
                      group={group}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              ) : (
                <Card variant="elevated" className="text-center py-12">
                  <CardContent>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No groups found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or create a new group
                    </p>
                    <Button asChild>
                      <Link to="/groups/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Group
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )} */}
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