import { File, ExternalLink } from "lucide-react";
import type { UserProps, StudyGroupProps } from "@/types/models";
import { getExtension } from "@/utils/urls";
import { Badge } from "./ui/badge";
import { capitalize } from "@/utils/word";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface ResourseCardProps {
  id: string,
  name: string;
  description: string;
  resource_type: string;
  url: string;
  uploader_detail: UserProps;
  group_detail: StudyGroupProps;
}

export const ResourceCard = ({
  id,
  name,
  description,
  resource_type,
  url,
  uploader_detail,
  group_detail,
}: ResourseCardProps) => {
  return (
    <div className="rounded-md bg-white border border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-md transition-all group cursor-pointer flex flex-col">
      {/* banner/url */}
      <div className="h-40 relative bg-gray-100">
        {MEDIA_EXTENSION.includes(getExtension(url)) ? (
          <img
            src={url}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <File className="h-10 w-10 text-gray-400" />
          </div>
        )}
        <Badge className="absolute bottom-2 right-2">
          {capitalize(resource_type)}
        </Badge>
      </div>

      {/* information */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex-1">
          <span className="block font-medium truncate">{name}</span>
          <span className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </span>
        </div>

        <hr className="my-2" />

        <div className="flex items-center justify-between gap-2">
          {/* uploader info */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
              <img
                className="h-full w-full object-cover"
                src={uploader_detail.avatar}
                alt={uploader_detail.email}
              />
            </div>
            <p className="text-sm truncate">
              {uploader_detail.first_name} {uploader_detail.last_name}
            </p>
          </div>

          {/* action button */}
          <Button variant="outline" size="sm" className="shrink-0">
            <Link
            className="flex items-center"
            to={`resource/${id}/${group_detail.id}`} target="_blank" rel="noopener noreferrer"
            >
              View <ExternalLink className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const MEDIA_EXTENSION = ["jpeg", "png", "webp", "gif"];