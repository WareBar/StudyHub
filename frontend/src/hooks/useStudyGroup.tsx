import api from "@/utils/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "./useToast";


type StudyGroupPayload = {
    id?:number,
    name?:string,
    description?:string,
    subject?:number,
    max_members?:number,
    creator?:number
}

type JoinRequestPayload = {
    groupId: number
    invitedUserId?:number
}


export function useStudyGroup(studyGroupID?:number, onSuccessCallback?:()=>void){
    const { toast } = useToast()
    const queryClient = useQueryClient();
    // fetch functionality
    const fetchStudyGroup = async () => {
        const response = await api.get("/study-group")
        return response.data
    }

    // fetch the study-group if id is provided
    const { data, isLoading: isFetching } = useQuery({
        queryKey: studyGroupID ? ["study-group-details", studyGroupID] : ["study-group-details-temp"],
        queryFn: () => fetchStudyGroup,
        enabled: !!studyGroupID,
    })


    const cleanPayload = (payload: StudyGroupPayload) => {
        const result: Record<string, any> = {}
        for (const key in payload) {
        if (payload[key as keyof StudyGroupPayload] !== undefined) {
            result[key] = payload[key as keyof StudyGroupPayload]
        }
        }
        return result
    }


    // create or update mutation
      const mutation = useMutation<StudyGroupPayload, Error, StudyGroupPayload>({
            mutationFn: async(payload:StudyGroupPayload) => {

                // clean the payload
                const cleanedData = cleanPayload({
                    ...payload
                })

                if (payload.id){
                    // update existng study-group
                    const response = await api.patch(`/study-group/${payload.id}/`,cleanedData)
                    return response.data
                } else {
                    const response = await api.post("/study-group/", cleanedData)
                    return response.data
                }
            },

            onSuccess: (variables) => {
                if (variables.id){
                    queryClient.invalidateQueries({ queryKey: ["study-group-details", variables.id] })
                }
                queryClient.invalidateQueries({ queryKey: ["study-groups"] })
                toast.success(`Study group ${variables.id? "updated":"created"} successfully`, "Yohoo, let's go and spread awesomeness")
                if (onSuccessCallback) onSuccessCallback()
            },

            onError: async (error: unknown, variables?: StudyGroupPayload) => {
            toast.error(`Failed to ${variables?.id ? "update" : "create"} Study group: ${variables?.name}`, "Please check all the required fields")
            console.error(error)
            }
      })


    //   delete mutation
        const deleteMutation = useMutation<void, Error, number>({
            mutationFn: async (id:number) => {
            await api.delete(`/study-group/${id}/`)
            },

            onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["study-groups"] })
            queryClient.removeQueries({ queryKey: ["study-group-details", id] })

            toast.info("Study group deleted successfully")

            if (onSuccessCallback) onSuccessCallback()
            },

        })



    // joining request 
    const joinRequest = useMutation({
        mutationFn: async ({groupId}:JoinRequestPayload) => {
            const response = await api.post(`/study-group/${groupId}/join_request/`)
            return response.data
        },

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["study-groups"] })
            queryClient.invalidateQueries({ queryKey: ["study-group-details", variables.groupId] })
            toast.success("Join request sent","Please wait for the approval of join request")
        },

        onError: (error) => {
            toast.error(error.code, error.detail)
            console.error(error)
        }
    })

    const cancelRequest = useMutation({
        mutationFn: async ({groupId}:JoinRequestPayload) => {
            const response = await api.post(`/study-group/${groupId}/cancel_request/`)
            return response.data
        },

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["study-groups"] })
            queryClient.invalidateQueries({ queryKey: ["study-group-details", variables.groupId] })
            toast.success("Join request cancelled","Membership request cancelled, we wish you reconsider")
        },

        onError: (error) => {
            toast.error(error.code, error.detail)
            console.error(error)
        }
    })


    const inviteUser = useMutation({
        mutationFn: async ({groupId, invitedUserId}:JoinRequestPayload) => {
            const response = await api.post(`/study-group/invite/`,{
                "invited_user_id":invitedUserId,
                "group_id":groupId
            })
            return response.data
        },

        onSuccess: (_, variables) => {
            // queryClient.invalidateQueries({ queryKey: ["study-groups"] })
            // queryClient.invalidateQueries({ queryKey: ["study-group-details", variables.groupId] })
            toast.success("Invitation sent","Invitation sent to user, please wait for it to be reviewed")
        },

        onError: (error) => {
            toast.error(error.code, error.detail)
            console.error(error)
        }


    })


    return {
        studyGroup: data,
        isFetching: isFetching,
        isMutating: mutation.isPending,
        isDeleting: mutation.isPending,
        mutate: mutation.mutate,
        deleteStudyGroup: deleteMutation.mutate,

        joinRequest: joinRequest.mutate,
        isRequesting: joinRequest.isPending,

        cancelRequest: cancelRequest.mutate,
        isCancellingRequest: cancelRequest.isPending,

        inviteUser: inviteUser.mutate,
        isInviting: inviteUser.isPending
    }
}

