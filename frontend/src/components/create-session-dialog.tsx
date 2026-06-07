import { FormDialogControlled } from "./common/form-dialog";
import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { type FormEvent } from "react";
import { useToast } from "@/hooks/useToast";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import Choose from "./ui/choose";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import QueryWrapper from "./query-wrapper";
import { SchedulePicker } from "./ui/schedule-picker";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Calendar,
  MapPin,
  Monitor,
  Users,
  FileText,
  Loader2,
  Wifi,
  Building2,
} from "lucide-react";

interface CreateSessionDialogProps {
  groupId?: number;
  open: boolean;
  onOpenChange: (arg0: boolean) => void;
}

export const CreateSessionDialog = ({ groupId, open, onOpenChange }: CreateSessionDialogProps) => {
  const { toast } = useToast();

  const [selectedGroupId, setSelectedGroupId] = useState(groupId);
  const [sessionType, setSessionType] = useState<string>("online");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const { mutate: createSession, isMutating } = useSession(undefined, () => onOpenChange(false));

  const fetchGroups = async () => {
    const response = await api.get("study-group/?type=my");
    return response.data;
  };

  const fetchGroupById = async (id: number) => {
    const response = await api.get(`/study-group/${id}/`);
    return response.data;
  };

  const { data: groupDetail } = useQuery({
    queryKey: ["study-group", groupId],
    queryFn: () => fetchGroupById(groupId!),
    enabled: !!groupId,
  });

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ["study-groups"],
    queryFn: fetchGroups,
    enabled: !groupId,
  });

  useEffect(() => {
    if (groupDetail) setSelectedGroupId(groupDetail.id);
  }, [groupDetail]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const missingFields = [
      !selectedGroupId && "Group",
      !sessionType && "Session type",
      !start && "Start time",
      !end && "End time",
      !location && "Location",
      !notes && "Notes",
    ].filter(Boolean);

    if (missingFields.length > 0) {
      return toast.error("Missing fields", `Please fill in: ${missingFields.join(", ")}`);
    }

    createSession({
      group: selectedGroupId,
      session_type: sessionType,
      status: "scheduled",
      start,
      end,
      location,
      notes,
    });
  };

  const isOnline = sessionType === "online";

  return (
    <FormDialogControlled
      open={open}
      onOpenChange={onOpenChange}
      title="Schedule Session"
      description="Schedule a session for learning"
      width="lg"
      externalIsEditing={true}
      setExternalIsEditing={() => {}}
      onSubmit={handleSubmit}
      confirm={{
        save: { enabled: true, title: "Schedule the session", description: "This action will schedule a session" },
        cancel: { enabled: true },
      }}
      footer={({ requestSave, requestCancel }) => (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={requestCancel}
            className="rounded-xl border-gray-200 text-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={requestSave}
            disabled={isMutating}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 shadow-sm shadow-orange-100 gap-2"
          >
            {isMutating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scheduling…
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Schedule session
              </>
            )}
          </Button>
        </>
      )}
    >
      {/* ── Hero banner ── */}
      <div className="relative rounded-2xl bg-orange-500 overflow-hidden px-6 py-5 mb-2">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 shrink-0">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">New study session</p>
            <p className="text-orange-100 text-xs mt-0.5">
              Set a time, pick a format, and bring your group together.
            </p>
          </div>
        </div>
      </div>

      {/* ── Group selector (only when no groupId pre-set) ── */}
      {groups && (
        <div className="grid gap-1.5">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-orange-400" />
            Study group <span className="text-red-400">*</span>
          </Label>
          <QueryWrapper data={groups} isLoading={isLoading} error={error}>
            <Choose
              onValueChange={(val) => setSelectedGroupId(Number(val))}
              value={selectedGroupId?.toString()}
              labelKey="name"
              choices={groupId ? [groupDetail] : groups?.results}
              width="full"
            />
          </QueryWrapper>
        </div>
      )}

      {/* ── Session type toggle ── */}
      <div className="grid gap-1.5">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <Monitor className="h-3.5 w-3.5 text-orange-400" />
          Session type <span className="text-red-400">*</span>
        </Label>
        <RadioGroup
          defaultValue="online"
          className="grid grid-cols-2 gap-3"
          onValueChange={(value) => setSessionType(value)}
        >
          {[
            { value: "online", label: "Online", icon: Wifi, hint: "Virtual — video call or platform" },
            { value: "physical", label: "In-person", icon: Building2, hint: "Physical location meetup" },
          ].map(({ value, label, icon: Icon, hint }) => (
            <label
              key={value}
              htmlFor={value}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                sessionType === value
                  ? "border-orange-400 bg-orange-50 text-orange-600"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              <RadioGroupItem value={value} id={value} className="sr-only" />
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  sessionType === value ? "bg-orange-100" : "bg-gray-100"
                }`}
              >
                <Icon className={`h-4 w-4 ${sessionType === value ? "text-orange-500" : "text-gray-400"}`} />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{label}</p>
                <p className={`text-xs mt-0.5 ${sessionType === value ? "text-orange-400" : "text-gray-400"}`}>
                  {hint}
                </p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* ── Schedule picker ── */}
      <div className="grid gap-1.5">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-orange-400" />
          Date & time <span className="text-red-400">*</span>
        </Label>
        <SchedulePicker
          start={start}
          end={end}
          onStartChange={setStart}
          onEndChange={setEnd}
        />
      </div>

      <div className="flex gap-2">
            {/* ── Location ── */}
            <div className="grid gap-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                Location <span className="text-red-400">*</span>
                </Label>
                <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={
                    isOnline
                    ? "e.g. Google Meet, Zoom, Discord"
                    : "e.g. Library Room 3, Engineering Building"
                }
                className="rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-sm"
                />
                <p className="text-xs text-gray-400">
                {isOnline
                    ? "Enter the platform name or link where the session will be held."
                    : "Enter the physical address or room where you'll meet."}
                </p>
            </div>

            {/* ── Notes ── */}
            <div className="grid gap-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-orange-400" />
                Notes
                </Label>
                <Textarea
                placeholder={
                    isOnline
                    ? "e.g. Meeting link, agenda, topics to cover…"
                    : "e.g. What to bring, topics to discuss, preparation tips…"
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-sm resize-none min-h-20"
                />
            </div>
      </div>

    </FormDialogControlled>
  );
};