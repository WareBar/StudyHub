import api from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "./useToast";


type MembershipUpdateProps = {
    groupId: number,
    memberId: number
    newStatus?:string
    newRole?:string
}



export function useMembership(){
    const { toast } = useToast()
    const queryClient = useQueryClient();

    // handle status update
    const updateStatus = useMutation({
        mutationFn: async ({memberId, groupId, newStatus}:MembershipUpdateProps) => {
            const response = await api.post(`/membership/update_member_status/`,{
                    "member_id":memberId,
                    "group_id":groupId,
                    "new_status":newStatus
                })
            return response.data
        },

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["group-membership"] })
            queryClient.invalidateQueries({ queryKey: ["membership-stats"] })
            queryClient.invalidateQueries({ queryKey: ["group-membership", variables.groupId] })
            queryClient.invalidateQueries({queryKey: ["study-group-details", variables.groupId]})
            toast.success("Updated membership status",`Successfully ${variables.newStatus} membership`)
        },

        onError: (error) => {
            toast.error(error.code, error.detail)
            console.error(error)
        }
    })

    // handle role update
    const updateRole = useMutation({
        mutationFn: async ({memberId, groupId, newRole}:MembershipUpdateProps) => {
            const response = await api.post(`/membership/update_member_role/`,{
                    "member_id":memberId,
                    "group_id":groupId,
                    "new_role":newRole
                })
            return response.data
        },

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["group-membership"] })
            queryClient.invalidateQueries({ queryKey: ["group-membership", variables.groupId] })
            toast.success("Updated membership role",`Successfully ${variables.newRole} membership`)
        },

        onError: (error) => {
            toast.error(error.code, error.detail)
            console.error(error)
        }
    })


    return {
        updateStatus: updateStatus.mutate,
        isUpdatingStatus: updateStatus.isPending,

        updateRole: updateRole.mutate,
        isUpdatingRole: updateRole.isPending
    }

}