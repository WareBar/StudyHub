
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import api from "@/utils/api"
import QueryWrapper from "./query-wrapper"
import { useEffect, useState } from "react"
import { Input } from "./ui/input"
import { Search } from "lucide-react"
import { useInfiniteQuery } from "@tanstack/react-query";
import { useStudyGroup } from "@/hooks/useStudyGroup"
import { Button } from "./ui/button"

export const InviteUserDialog = ({groupId, open, onOpenChange}) => {
    const [searchQuery, setSearchQuery] = useState<string>("")
    const {inviteUser, isInviting} = useStudyGroup()


    const fetchUsers = async (searchQuery:string, page:number) => {
        const baseUrl = "user"
        const params = new URLSearchParams()
        if(searchQuery.length > 1) params.set("search", searchQuery)
        params.set("page",page.toString())
        params.set("page_size",String(3))
        const separator = baseUrl.includes("?") ? "&" : "?"
        const response = await api.get(`${baseUrl}${separator}${params.toString()}`)
        console.log(response.data)
        return response.data
    }

    
    const {
        data, isLoading, error,
        fetchNextPage, hasNextPage, isFetchingNextPage
    } = useInfiniteQuery({
        queryKey:['users',searchQuery],
        queryFn: ({pageParam = 1}) => 
            fetchUsers(searchQuery, pageParam),

        initialPageParam: 1,

        getNextPageParam: (lastPage) => {
        if (!lastPage.next) return undefined;

        // Extract page number from DRF next URL
        const url = new URL(lastPage.next);
        return Number(url.searchParams.get("page"));
        },

        enabled: !!groupId
    }) 


    const handleInviting = (groupId:number, invitedUserId:number) => {
        if (!groupId || !invitedUserId) return
        inviteUser({groupId, invitedUserId})
    }


    // const users = data?.pages.flatMap((page) => page.results)
    const users = data?.pages.flatMap((page) => page.results ?? []) ?? []
    


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-2xl max-2xl">
                <DialogHeader>
                    <DialogTitle>
                        Invite User
                    </DialogTitle>
                    <DialogDescription>
                        Invite and ask others to join your group
                    </DialogDescription>
                </DialogHeader>

                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search..."
                    className="pl-9"
                    onChange={(e)=>{setSearchQuery(e.target.value)}}
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <QueryWrapper
                    data={data}
                    isLoading={isLoading}
                    error={error}
                    >
                        {
                            users?.map((user)=>{
                                return (
                                    <UserCard
                                    key={user.id}
                                    user={user}
                                    action={
                                        <Button
                                        onClick={()=>handleInviting(groupId, user.id)}
                                        >Invite</Button>
                                    }
                                    />
                                )
                            })
                        }
                    </QueryWrapper>
                </div>

            </DialogContent>
        </Dialog>
    )
}


const UserCard = ({user, action}) => {
    return (
        <div className="flex items-center justify-between border rounded-sm p-2">
            {/* avatar and name*/}
            <div className="flex items-center gap-2">
                <div className="h-15 w-15 rounded-full overflow-hidden">
                    <img
                    className="h-full w-full object-center"
                    src={user.avatar} alt={user.email} />
                </div>

                <p className="flex flex-col">
                    <span className="font-semibold">{user.first_name} {user.last_name}</span>
                    <span>{user.email}</span>
                </p>
            </div>

            {action}

        </div>
    )
}