// approve or manage group's user membership

import api from "@/utils/api"
import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input";
import { Search, Clock } from "lucide-react";
import QueryWrapper from "./query-wrapper";
import { formatSessionDate } from "@/utils/time";
import { Button } from "./ui/button";
import { getRoleBadge } from "./get-role-badge";
import { useEffect, useState } from "react";
import type { MembershipProps } from "@/types/models";
import { useMembership } from "@/hooks/useMembership";
import NoResult from "./no-result";
import { QuickProfileView } from "./quick-profile-view";

export interface GroupMembershipsDialogProps {
    groupId: string | undefined,
    open:boolean,
    onOpenChange:(arg0:boolean)=>void
}


interface ManageMembersProps {
    members: MembershipProps[]
    onUpdate: (arg0:number, arg1: string)=>void
    isUpdating: boolean
}


interface ControlAuthorityProps {
    members: MembershipProps[]
    onUpdate: (arg0:number, arg1: string)=>void
    isUpdating: boolean
}


interface MembershipStatsProps {
    groupId: string | undefined,
    setStatusLabels: (arg0:string[])=>void
}

interface StatsProps {
    label:string,
    value:MembershipStatus
}

interface FiltersProps {
    choices: string[]
    onSearch: (arg0:string)=>void
    onSelect: (arg0:string)=>void
}

interface MemberCardProps {
    user: MembershipProps,
    updated_at:string,
    role:string
    status:MembershipStatus
    onUpdate:(arg0:number, arg1:string)=>void
    isUpdating:boolean,
    ctaType: string
}


type MembershipStatus = "all" | "accepted" | "pending" | "rejected" | "cancelled"

export const GroupMembershipsDialog = ({groupId, open, onOpenChange}:GroupMembershipsDialogProps) => {
    const [searchQuery, setSearchQuery] = useState<string>()
    const [selectedStatus, setSelectedStatus] = useState<string>()
    const [selectedRole, setSelectedRole] = useState<string>()

    const {
        updateStatus, isUpdatingStatus,
        updateRole, isUpdatingRole
    } = useMembership()


    const [statusLabels, setStatusLabels] = useState<string[]>([])

    const fetchGroupMembership = async () => {
        const baseUrl = "/membership/";
        const params = new URLSearchParams();
        params.set("group", groupId)
        if (searchQuery){
            params.set("search", searchQuery)
        }
        if (selectedStatus && selectedStatus !== "all"){
            params.set("status", selectedStatus)
        }
        if (selectedRole && selectedRole !== "all"){
            params.set("role",selectedRole)
        }

        const separator = baseUrl.includes("?") ? "&" : "?";
        const response = await api.get(`${baseUrl}${separator}${params.toString()}`);
        return response.data
    }


    const {data, isLoading, error} = useQuery({
        queryKey:['group-membership',groupId, searchQuery, selectedStatus, selectedRole],
        queryFn: fetchGroupMembership,
        enabled: !!groupId
    })


    const handleStatusUpdate = async (memberId: number, newStatus:string) => {
        if (!newStatus || !memberId) return;
        updateStatus({memberId:memberId,groupId:Number(groupId), newStatus:newStatus})
    }

    const handleRoleUpdate = async (memberId: number, newRole:string) => {
        if (!newRole || !memberId) return;
        updateRole({memberId:memberId,groupId:Number(groupId), newRole:newRole})
    }
    

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-5xl max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        Membership overview
                    </DialogTitle>
                    <DialogDescription>
                        Manage member request, role and status in one dialog
                    </DialogDescription>
                </DialogHeader>

                <MembershipStats
                groupId={groupId}
                setStatusLabels={setStatusLabels}
                />
                
                <hr/>
                {/* tabs */}
                <Tabs defaultValue="manage" className="w-full">
                <TabsList className="flex w-full" variant={'line'}>
                    <TabsTrigger value="manage" className="flex-1">
                    Manage
                    </TabsTrigger>
                    <TabsTrigger value="control" className="flex-1">
                    Control
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="manage">

                    <Filters 
                    choices={statusLabels}
                    onSearch={setSearchQuery}
                    onSelect={setSelectedStatus}
                    />

                    <QueryWrapper
                    data={data}
                    isLoading={isLoading}
                    error={error}
                    noResultsComponent={
                        <NoResult
                            label="Users"
                            description="There are no users that match query"
                        />
                        }
                    >
                        {
                            data &&                         
                                <ManageMembers
                                members={data.results}
                                onUpdate={handleStatusUpdate}
                                isUpdating={isUpdatingStatus}
                                />
                        }
                    </QueryWrapper>
                </TabsContent>

                <TabsContent value="control">

                    <Filters 
                    choices={["all","moderator","member"]}
                    onSearch={setSearchQuery}
                    onSelect={setSelectedRole}
                    />
                    <ControlAuthority
                        members={data?.results.filter((member:MembershipProps) => member.status === "accepted" && member.role !== "creator")}
                        onUpdate={handleRoleUpdate}
                        isUpdating={isUpdatingRole}
                    />
                </TabsContent>
                </Tabs>

            </DialogContent>
        </Dialog>
    )
}



// for managing members
const ManageMembers = ({members, onUpdate, isUpdating}:ManageMembersProps) => {
    return (
        <div className="">
            <div className="flex flex-col gap-3 h-100 overflow-x-auto">
                {
                    members?.length > 0 && (
                        members.map((member:MemberCardProps, index)=>{
                            return (
                                <MemberCard
                                key={index}
                                user={member.user}
                                role={member.role}
                                updated_at={member.updated_at}
                                status={member.status}
                                onUpdate={onUpdate}
                                isUpdating={isUpdating}
                                ctaType="manage"
                                />
                            )
                        })
                    )
                }
            </div>
        </div>
    )
}

const ControlAuthority = ({members, onUpdate, isUpdating}:ControlAuthorityProps) => {
    return (
        <div className="">
            <div className="flex flex-col gap-3 h-100 overflow-x-auto">
                {
                    members?.length > 0 && (
                        members.map((member:MemberCardProps, index)=>{
                            return (
                                <MemberCard
                                key={index}
                                user={member.user}
                                role={member.role}
                                updated_at={member.updated_at}
                                status={member.status}
                                onUpdate={onUpdate}
                                isUpdating={isUpdating}
                                ctaType="control"
                                />
                            )
                        })
                    )
                }
            </div>
        </div>
    )


}


// MembershipStats
const MembershipStats = ({groupId, setStatusLabels}:MembershipStatsProps) => {

    const fetchMembershipStats = async () => {
        const response = await api.get(`/membership/stats?group_id=${groupId}`)
        console.log(response.data)
        return response.data
    }


    const {data, isLoading, error} = useQuery({
        queryKey:['membership-stats',groupId],
        queryFn: fetchMembershipStats,
        enabled: !!groupId
    })

    useEffect(()=>{
        if (error) return;
        setStatusLabels(
            data?.map(lbl => lbl.label.toLowerCase() === "total requests"? "all":lbl.label.toLowerCase())
        )
    },[data, error, setStatusLabels])

    return (
        <div className="flex items-center gap-3 justify-between">
            <QueryWrapper
            data={data}
            isLoading={isLoading}
            error={error}
            >
                {
                    data?.map((stat:StatsProps, index:number)=>{
                        return (
                            <p key={index}
                            className="flex flex-col items-center"
                            >
                                <span
                                className="text-lg font-semibold text-orange-500"
                                >{stat.value}</span>
                                <span>{stat.label}</span>
                            </p>
                        )
                    })
                }
            </QueryWrapper>
        </div>
    )

}



// filters
const Filters = ({choices, onSearch, onSelect}: FiltersProps) => {
    const [activeChoice, setActiveChoice] = useState<string>("all")

    return (
    <div className="">
        <div className="w-full flex flex-col sm:flex-row gap-3">
        
            {/* Search */}
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search..."
                className="pl-9"
                onChange={(e)=>{onSearch(e.target.value)}}
                />
            </div>

            {/* choices */}
            <div className="flex gap-3">
                {
                    choices?.map((choice:string, index:number)=>{
                        return (
                            <Button
                            onClick={()=>{
                                onSelect(choice)
                                setActiveChoice(choice)
                            }}
                            key={index}
                            variant={activeChoice === choice? 'default':'outline'}>{choice.charAt(0).toUpperCase() + choice.slice(1)}</Button>
                        )
                    })
                }
            </div>

        </div>
        <hr className="m-5"/>
    </div>
  );
};




const MemberCard = ({
    user,
    role,
    updated_at,
    status, 
    onUpdate,
    isUpdating, 
    ctaType
}:MemberCardProps) => {
    
    const { id, first_name = "", last_name = "", username, avatar, email } = user
    const [showQuickProfileView, setShowQuickProfileView] = useState<boolean>(false)

    const handleUpdate = (status:string) => {
        onUpdate(id, status)
    }

    return (
        <>
        
            <div className="border rounded-md p-2 flex items-center justify-between">
                <div className="flex gap-3 items-center">


                    {/* avatar */}
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                        <img 
                        className="w-full h-full object-center"
                        src={avatar} alt={username} />
                    </div>

                    {/* info */}
                    <div className="text-muted-foreground">
                        <div>{getRoleBadge(role)}</div>
                        <p
                        className="font-semibold text-black"
                        >{!first_name || !last_name? username:`${first_name} ${last_name}`}</p>
                        <p>{email}</p>
                        <p className="text-sm">
                            <span><Clock size={15} className="inline"/> Joined: </span>
                            <span>{formatSessionDate(updated_at)}</span>
                        </p>
                    </div>
                </div>

                {/* cta */}
                {
                    ctaType === "manage"? (
                        <>
                            <div className="flex flex-col gap-3">
                                <Button
                                variant={'outline'}
                                onClick={()=>setShowQuickProfileView(true)}
                                >Quick Profile View</Button>

                                {
                                    isUpdating ? (
                                        <Button disabled className="text-muted-foreground">
                                            Updating
                                        </Button>
                                    ) : (
                                        role !== "creator" && (() => {
                                            switch (status) {
                                                case "pending":
                                                    return (
                                                        <>
                                                            <Button onClick={() => handleUpdate('accepted')}>
                                                                Accept
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleUpdate('rejected')}
                                                                variant="destructive"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    );

                                                case "accepted":
                                                    return (
                                                        <Button onClick={() => handleUpdate("cancelled")}>
                                                            Remove
                                                        </Button>
                                                    );

                                                case "cancelled":
                                                    return <Button disabled>Cancelled</Button>;

                                                case "rejected":
                                                    return <>
                                                    <Button disabled>Rejected</Button>
                                                    <Button onClick={()=>handleUpdate('accepted')}>Bring back</Button>
                                                    </>;

                                                default:
                                                    return null;
                                            }
                                        })()
                                    )
                                }


                            </div>
                        </>
                    ) : (
                        <>
                            <div className="">
                                {
                                    role === "moderator"? <>
                                        <Button variant={'destructive'}
                                        onClick={()=>handleUpdate('member')}
                                        >Remove as moderator</Button>
                                    </>:<>
                                        <Button 
                                        onClick={()=>handleUpdate('moderator')}
                                        variant={'default'}>Make a moderator</Button>
                                    </>
                                }
                            </div>
                        </>
                    )
                }
            </div>
        

            {
                showQuickProfileView && (
                    <QuickProfileView
                    userId={id}
                    open={showQuickProfileView}
                    onOpenChange={setShowQuickProfileView}
                    />
                )
            }


        </>
    )
}
