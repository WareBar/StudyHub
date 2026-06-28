import { FormDialogControlled } from "./common/form-dialog";
import { useAuth } from "@/context/AuthContext";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/useToast";
import { useRef, useState } from "react";
import { useResource } from "@/hooks/useResource";
import { type FormEvent } from "react";
import { Button } from "./ui/button";
import { File as FileIcon, Link2, Loader2, Upload, X, FileText } from "lucide-react";
import { Label } from "./ui/label";

interface ShareResourceDialogProps {
  groupId?: number;
  resourceId?: number;
  open: boolean;
  onOpenChange: (arg0: boolean) => void;
}

const RESOURCES_OPTION = [
  {
    title: "file",
    icon: FileIcon,
    hint: "Upload a document or file",
  },
  {
    title: "link",
    icon: Link2,
    hint: "Share a URL or website",
  },
];

export const ShareResourceDialog = ({
  groupId,
  open,
  onOpenChange,
}: ShareResourceDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [resourceType, setResourceType] = useState<"file" | "link" | "">("file");
  const [file, setFile] = useState<File | null>(null);

  const { mutate: shareResource, isMutating } = useResource(undefined, () =>
    onOpenChange(false)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0] ?? null;
    setFile(dropped);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const missingFields = [
      !name && "Name",
      !resourceType && "Resource type",
      !url && resourceType === "link" && "URL",
      !groupId && "Group",
    ].filter(Boolean);

    if (missingFields.length > 0) {
      return toast.error("Missing fields", `Please fill in: ${missingFields.join(", ")}`);
    }

    shareResource({
      name,
      description,
      resource_type: resourceType,
      url: resourceType === "link" ? url : undefined,
      file: resourceType === "file" ? file : undefined,
      group: groupId,
      uploader: user?.id,
    });
  };

  const isLink = resourceType === "link";
  const isFile = resourceType === "file";

  return (
    <FormDialogControlled
      open={open}
      onOpenChange={onOpenChange}
      title="Share Resource"
      description="Share helpful materials with your study group"
      icon="file"
      externalIsEditing={true}
      setExternalIsEditing={() => {}}
      onSubmit={handleSubmit}
      confirm={{
        save: { enabled: true, title: "Share resource", description: "This will be visible to your group" },
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
                <Loader2 className="w-4 h-4 animate-spin" />
                Sharing…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Share
              </>
            )}
          </Button>
        </>
      )}
    >
      {/* ── Resource type toggle ── */}
      <div className="grid gap-1.5">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-orange-400" />
          Resource type <span className="text-red-400">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {RESOURCES_OPTION.map(({ title, icon: Icon, hint }) => {
            const isSelected = resourceType === title;
            return (
              <label
                key={title}
                htmlFor={title}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-orange-400 bg-orange-50 text-orange-600"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  id={title}
                  name="resourceType"
                  value={title}
                  checked={isSelected}
                  onChange={() => setResourceType(title as "file" | "link")}
                  className="sr-only"
                />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-orange-100" : "bg-gray-100"}`}>
                  <Icon className={`h-4 w-4 ${isSelected ? "text-orange-500" : "text-gray-400"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none capitalize">{title}</p>
                  <p className={`text-xs mt-0.5 ${isSelected ? "text-orange-400" : "text-gray-400"}`}>{hint}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Name ── */}
      <div className="grid gap-1.5">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-orange-400" />
          Resource name <span className="text-red-400">*</span>
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. React Cheat Sheet"
          className="rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-sm"
        />
      </div>

      {/* ── URL or File upload ── */}
      {resourceType !== "" && (
        <div className="grid gap-1.5">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            {isLink ? <Link2 className="h-3.5 w-3.5 text-orange-400" /> : <Upload className="h-3.5 w-3.5 text-orange-400" />}
            {isLink ? "URL" : "File"} <span className="text-red-400">*</span>
          </Label>

          {isLink ? (
            <>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-sm"
              />
              <p className="text-xs text-gray-400">Paste the full URL of the resource.</p>
            </>
          ) : (
            <>
              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-6 py-6 cursor-pointer transition-all ${
                  file
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {file ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[220px]">{file.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-red-300 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        Click to upload <span className="text-orange-500">or drag & drop</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Max file size: 50MB</p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Description ── */}
      <div className="grid gap-1.5">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-orange-400" />
          Description
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly describe this resource…"
          rows={2}
          className="rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-sm resize-none"
        />
      </div>
    </FormDialogControlled>
  );
};