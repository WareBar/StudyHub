import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvailabilityGrid } from "@/components/AvailabilityGrid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Calendar,
  Camera,
  Save,
  X,
  Plus,
} from "lucide-react";

const subjectOptions = [
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "English",
  "History",
  "Psychology",
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Smith",
    email: "john.smith@university.edu",
    course: "Computer Science",
    year: "Junior",
    bio: "Passionate learner interested in algorithms and data structures. Always looking for study partners!",
    subjects: ["Computer Science", "Mathematics", "Physics"],
  });

  const [availability, setAvailability] = useState<Record<string, string[]>>({
    Mon: ["Evening"],
    Tue: ["Afternoon", "Evening"],
    Wed: ["Evening"],
    Thu: ["Afternoon", "Evening"],
    Fri: ["Morning", "Afternoon"],
    Sat: ["Morning", "Afternoon"],
    Sun: [],
  });

  const toggleAvailability = (day: string, time: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const newSlots = daySlots.includes(time)
        ? daySlots.filter(t => t !== time)
        : [...daySlots, time];
      return { ...prev, [day]: newSlots };
    });
  };

  const removeSubject = (subject: string) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject),
    }));
  };

  const addSubject = (subject: string) => {
    if (!profile.subjects.includes(subject)) {
      setProfile(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject],
      }));
    }
  };

  return (
    <Layout isAuthenticated>
      <div className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=john" />
                      <AvatarFallback className="text-2xl">JS</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                        <Camera className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <Badge variant="soft" className="mt-2">
                      {profile.course} • {profile.year}
                    </Badge>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" value={profile.email} disabled className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course / Major</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="course"
                        value={profile.course}
                        onChange={e => setProfile({ ...profile, course: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={profile.year}
                      onValueChange={value => setProfile({ ...profile, year: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Freshman">Freshman</SelectItem>
                        <SelectItem value="Sophomore">Sophomore</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Subjects */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Subjects of Interest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.subjects.map(subject => (
                    <Badge key={subject} variant="soft" className="gap-1 text-sm py-1.5">
                      {subject}
                      {isEditing && (
                        <button onClick={() => removeSubject(subject)}>
                          <X className="h-3 w-3 ml-1" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <Select onValueChange={addSubject}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <Plus className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Add subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions
                        .filter(s => !profile.subjects.includes(s))
                        .map(subject => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Weekly Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AvailabilityGrid
                  availability={availability}
                  onToggle={toggleAvailability}
                  readonly={!isEditing}
                  compact
                />
              </CardContent>
            </Card>

            {/* Stats */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Study Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Groups Joined", value: 3 },
                    { label: "Sessions Attended", value: 24 },
                    { label: "Study Hours", value: 48 },
                    { label: "Attendance Rate", value: "92%" },
                  ].map(stat => (
                    <div key={stat.label} className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
