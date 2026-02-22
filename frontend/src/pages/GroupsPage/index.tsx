import { useState } from "react";
import { Layout } from "@/components/Layout";
import { StudyGroupCard, type StudyGroup } from "@/components/StudyGroupCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus, SlidersHorizontal, X } from "lucide-react";
import { Link } from "react-router-dom";

const allGroups: StudyGroup[] = [
  {
    id: "1",
    name: "Calculus Study Crew",
    subject: "Mathematics",
    description:
      "Weekly problem-solving sessions for Calculus I and II. We focus on understanding concepts deeply and practice exam questions together.",
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
    description:
      "Deep dive into data structures and algorithms. Perfect for interview prep and competitive programming enthusiasts.",
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
  {
    id: "3",
    name: "Physics 101 Gang",
    subject: "Physics",
    description:
      "Collaborative study sessions for introductory physics. We tackle mechanics, thermodynamics, and waves together.",
    memberCount: 4,
    maxMembers: 8,
    schedule: "Wed, Fri 5-7 PM",
    isPrivate: false,
    matchPercentage: 78,
    nextSession: "Wednesday, 5 PM",
    members: [
      {
        id: "8",
        name: "Nina",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nina",
      },
      { id: "9", name: "Tom", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tom" },
    ],
  },
  {
    id: "4",
    name: "Organic Chemistry Help",
    subject: "Chemistry",
    description:
      "Struggling with organic chemistry? Join us for molecule building, reaction mechanisms, and exam prep.",
    memberCount: 7,
    maxMembers: 8,
    schedule: "Mon, Thu 4-6 PM",
    isPrivate: false,
    matchPercentage: 72,
    nextSession: "Monday, 4 PM",
    members: [
      { id: "10", name: "Amy", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amy" },
      { id: "11", name: "Ben", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ben" },
      {
        id: "12",
        name: "Carol",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
      },
    ],
  },
  {
    id: "5",
    name: "Economics Discussion",
    subject: "Economics",
    description:
      "Discuss macro and microeconomics concepts, case studies, and current economic events.",
    memberCount: 3,
    maxMembers: 6,
    schedule: "Tue 6-8 PM",
    isPrivate: false,
    matchPercentage: 65,
    members: [
      { id: "13", name: "Dan", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dan" },
      { id: "14", name: "Eve", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=eve" },
    ],
  },
  {
    id: "6",
    name: "Linear Algebra Lab",
    subject: "Mathematics",
    description:
      "Master vectors, matrices, and linear transformations through collaborative problem solving.",
    memberCount: 5,
    maxMembers: 8,
    schedule: "Sat 10 AM - 12 PM",
    isPrivate: false,
    matchPercentage: 91,
    nextSession: "Saturday, 10 AM",
    members: [
      {
        id: "15",
        name: "Frank",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=frank",
      },
      {
        id: "16",
        name: "Grace",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=grace",
      },
      {
        id: "17",
        name: "Henry",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=henry",
      },
    ],
  },
];

const subjects = [
  "All Subjects",
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Economics",
  "Biology",
  "English",
];

export default function GroupsFinderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("match");

  const filteredGroups = allGroups
    .filter(group => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject =
        selectedSubject === "All Subjects" || group.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      if (sortBy === "match") {
        return (b.matchPercentage || 0) - (a.matchPercentage || 0);
      }
      if (sortBy === "members") {
        return b.memberCount - a.memberCount;
      }
      return 0;
    });

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
            <Button asChild>
              <Link to="/groups/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Link>
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
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedSubject !== "All Subjects" || searchQuery) && (
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
              )}

              {/* Extended Filters */}
              {showFilters && (
                <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort by</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="match">Best Match</SelectItem>
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">Availability</label>
                    <Select defaultValue="any">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Time</SelectItem>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{filteredGroups.length}</span>{" "}
              groups
            </p>
          </div>

          {filteredGroups.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map(group => (
                <StudyGroupCard key={group.id} group={group} />
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
          )}
        </div>
      </div>
    </Layout>
  );
}
