import { useAuth } from "@/context/AuthContext";
import { FormDialogControlled } from "./common/form-dialog";
import { useState } from "react";
import { type SubjectProps } from "@/types/models";
import { useStudyGroup } from "@/hooks/useStudyGroup";
import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent } from "react";
import { useToast } from "@/hooks/useToast";
import QueryWrapper from "./query-wrapper";
import Choose from "./ui/choose";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { BookOpen, Users, FileText, Hash, Loader2, Sparkles } from "lucide-react";

interface CreateStudyGroupDialogProps {
  open: boolean;
  onOpenChange: (arg0: boolean) => void;
}

export const CreateStudyGroupDialog = ({ open, onOpenChange }: CreateStudyGroupDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<SubjectProps | null>();
  const [maxMembers, setMaxMembers] = useState<number>();

  const { mutate: createStudyGroup, isMutating } = useStudyGroup(undefined, () => onOpenChange(false));

  const fetchSubjects = async () => {
    const response = await api.get("/subject/");
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !description || !selectedSubject || !user) {
      return toast.error("Missing fields", "Please fill in all required fields.");
    }

    createStudyGroup({
      name,
      description,
      subject: selectedSubject.id,
      max_members: maxMembers,
      creator: user.id,
    });
  };

  return (
    <FormDialogControlled
      open={open}
      onOpenChange={onOpenChange}
      title="Create Study Group"
      description="Create new group to lead"
      externalIsEditing={true}
      setExternalIsEditing={() => {}}
      onSubmit={handleSubmit}
      confirm={{
        save: { enabled: true, title: "Create study group", description: "This action will create a new study group" },
        cancel: { enabled: true },
      }}
      footer={({ requestSave, requestCancel }) => (
        <>
          <Button type="button" variant="outline" onClick={requestCancel} className="rounded-xl border-gray-200 text-gray-600">
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
                Creating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Create group
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
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">New study group</p>
            <p className="text-orange-100 text-xs mt-0.5">
              Fill in the details below and start collaborating with classmates.
            </p>
          </div>
        </div>
      </div>

      {/* ── Group name ── */}
      <div className="grid gap-1.5">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 text-orange-400" />
          Group name <span className="text-red-400">*</span>
        </Label>
        <Input
          placeholder="e.g. Calculus II Study Squad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-sm"
        />
        <p className="text-xs text-gray-400">Choose a clear, descriptive name for your group.</p>
      </div>

      {/* ── Description ── */}
      <div className="grid gap-1.5">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-orange-400" />
          Description <span className="text-red-400">*</span>
        </Label>
        <Textarea
          placeholder="What's this group about? What are your goals and study focus?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-sm resize-none min-h-[90px]"
        />
      </div>

      {/* ── Max members + Subject side by side ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-orange-400" />
            Max members
          </Label>
          <Input
            type="number"
            min={1}
            placeholder="e.g. 10"
            value={maxMembers ?? ""}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
            className="rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-sm"
          />
          <p className="text-xs text-gray-400">Leave blank for unlimited.</p>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-orange-400" />
            Subject <span className="text-red-400">*</span>
          </Label>
          <QueryWrapper data={data} isLoading={isLoading} error={error}>
            <Choose
              onValueChange={(val) => setSelectedSubject(val)}
              value={selectedSubject}
              labelKey="name"
              choices={data?.results}
              width="full"
            />
          </QueryWrapper>
        </div>
      </div>

      {/* ── Quick tips ── */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mt-1">
        <p className="text-xs font-medium text-orange-600 mb-1.5">Tips for a great study group</p>
        <ul className="space-y-1">
          {[
            "Be specific about topics you'll focus on",
            "Set clear expectations in the description",
            "Smaller groups (4–6) are often more productive",
          ].map((tip) => (
            <li key={tip} className="text-xs text-orange-500 flex items-start gap-1.5">
              <span className="mt-0.5 w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </FormDialogControlled>
  );
};