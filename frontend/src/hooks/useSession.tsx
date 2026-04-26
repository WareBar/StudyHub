import api from "@/utils/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "./useToast";


type status = "finished" | "scheduled" | "on_going" | "cancelled"


type SessionPayload = {
    id?:number
    group?:number
    session_type?:string
    status?:status
    start?:string
    end?:string
    location?:string
    notes?:string
}

export function useSession(sessionId?:number, onSuccessCallback?:()=>void){
    const { toast } = useToast()
    const queryClient = useQueryClient();


    // fetch functionality
    const fetchSession = async () => {
        const response = await api.get(`/session/${sessionId}`)
        return response.data
    }

    // fetch the session if id is provided
    const { data, isLoading: isFetching } = useQuery({
        queryKey: sessionId ? ["session-details", sessionId] : ["session-details-temp"],
        queryFn: fetchSession,
        enabled: !!sessionId,
    })

    const cleanPayload = (payload: SessionPayload) => {
        const result: Record<string, any> = {}
        for (const key in payload) {
        if (payload[key as keyof SessionPayload] !== undefined) {
            result[key] = payload[key as keyof SessionPayload]
        }
        }
        return result
    }

    // create or update mutation
      const mutation = useMutation<SessionPayload, Error, SessionPayload>({
            mutationFn: async(payload:SessionPayload) => {

                // clean the payload
                const cleanedData = cleanPayload({
                    ...payload
                })

                if (payload.id){
                    // update existng study-group
                    const response = await api.patch(`/session/${payload.id}/`,cleanedData)
                    return response.data
                } else {
                    const response = await api.post("/session/", cleanedData)
                    return response.data
                }
            },

            onSuccess: (variables) => {
                if (variables.id){
                    queryClient.invalidateQueries({ queryKey: ["session-details", variables.id] })
                }
                queryClient.invalidateQueries({ queryKey: ["sessions"] })
                toast.success(`Session ${variables.id? "updated":"created"} successfully`, "Yey, let's go meet and learn")
                if (onSuccessCallback) onSuccessCallback()
            },

            onError: async (error: unknown, variables?: SessionPayload) => {
            toast.error(`Failed to ${variables?.id ? "update" : "create"} ${variables?.session_type} session`, "Please check all the required fields")
            console.error(error)
            }
      })


        const deleteMutation = useMutation<void, Error, number>({
            mutationFn: async (id:number) => {
            await api.delete(`/session/${id}/`)
            },

            onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["sessions"] })
            queryClient.removeQueries({ queryKey: ["session-details", id] })

            toast.info("Session deleted successfully")

            if (onSuccessCallback) onSuccessCallback()
            },

        })


    return {
        data,
        isMutating: mutation.isPending,
        isDeleting: mutation.isPending,
        mutate: mutation.mutate,
        deleteSession: deleteMutation.mutate
    }
        

}


