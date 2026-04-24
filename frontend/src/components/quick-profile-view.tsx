
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import api from "@/utils/api"
import { useQuery } from "@tanstack/react-query"
import QueryWrapper from "./query-wrapper"
import { IconBrandFacebook, IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react"

  const educationLabel: Record<string, string> = {
    GRADE: "Grade School",
    JUNIOR: "Junior High",
    SENIOR: "Senior High",
    COLLEGE: "College",
    POSTGRAD: "Post Graduate",
  }

const getInitials = (name: string) =>
name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?" 


export const QuickProfileView = ({userId, open, onOpenChange}) => {

    const fetchProfile = async () => {
        const response = await api.get(`/user/${userId}/profile`)
        console.log(response.data)
        return response.data
    }

    const {data, isLoading, error} = useQuery({queryKey: ['user-profile', userId], queryFn:fetchProfile, enabled: !!userId})

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-3xl max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        Member Profile
                    </DialogTitle>
                    <DialogDescription>
                        Quick view of member's profile
                    </DialogDescription>
                </DialogHeader>

                <QueryWrapper
                data={data}
                isLoading={isLoading}
                error={error}
                >
                    {
                        data && (
                            <>
                                {/* BANNER */}
                                <div className="h-20 bg-muted border-b border-border" />

                                {/* avatar social row */}
                                <div className="px-7 pb-7 relative">
                                    <div className="flex items-end justify-between mb-5">

                                        <div className="-mt-10 shrink-0">
                                            {data.user.avatar ? (
                                            <img
                                                src={data.user.avatar}
                                                alt={data.user.name}
                                                className="w-20 h-20 rounded-full border-[3px] border-background object-cover"
                                            />
                                            ) : (
                                            <div className="w-20 h-20 rounded-full border-[3px] border-background bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center text-2xl font-medium">
                                                {getInitials(data.user.name)}
                                            </div>
                                            )}
                                        </div>

                                        {/* socials */}
                                        <div className="flex gap-2 pb-1">
                                            {
                                                data.facebook && (
                                                    <SocialLink
                                                    link={data.facebook}
                                                    label={'Facebook'}
                                                    icon={IconBrandFacebook}
                                                    />
                                                )
                                            }

                                            {
                                                data.github && (
                                                    <SocialLink
                                                    link={data.github}
                                                    label={'Github'}
                                                    icon={IconBrandGithub}
                                                    />
                                                )
                                            }

                                            {
                                                data.linkedin && (
                                                    <SocialLink
                                                    link={data.linkedin}
                                                    label={'Linkedin'}
                                                    icon={IconBrandLinkedin}
                                                    />
                                                )
                                            }
                                        </div>
                                    </div>

                                    {/* Name + email + education badge */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                            <h2 className="text-lg font-medium leading-tight">{data.user.name}</h2>
                                            {data.education_level && (
                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 font-medium">
                                                {educationLabel[data?.education_level]}
                                            </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{data.user.email}</p>
                                    </div>

                                    {/* Bio */}
                                    {data.bio && (
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 bg-muted px-3.5 py-3 rounded-lg border-l-2 border-border">
                                        {data.bio}
                                    </p>
                                    )}

                                </div>
                                
                                {data.subjects_of_interest_detail?.length > 0 && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
                                    Subjects of interest
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                    {data.subjects_of_interest_detail.map((subject) => (
                                        <span
                                        key={subject.id}
                                        className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border"
                                        >
                                        {subject.name}
                                        </span>
                                    ))}
                                    </div>
                                </div>
                                )}

                            </>
                        )
                    }
                </QueryWrapper>


            </DialogContent>
        </Dialog>
    )
}


const SocialLink = ({link, icon, label}) => {
    const Icon = icon
    return (
        <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
            <Icon size={13}/>
            {label}
        </a>
    )
}