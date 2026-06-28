import api from "@/utils/api";
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "./useToast";


type ResourcePayload = {
    id?:number
    name?:string
    description?:string
    url?:string
    resource_type?:string
    group?:number
    uploader?:number,
    file?:File
}


type ResourceInteractionPayload = {
    resourceId?:number
    groupId?:number
}

export function useResource(resourceId?:number, onSuccessCallback?:()=>void){
    const { toast } = useToast()
    const queryClient = useQueryClient();

    // fetch functionality
    const fetchResource = async () => {
        const response = await api.get(`/resource/${resourceId}`)
        return response.data
    }


    const fetchResourceViews = async () => {
            const response = await api.get(`/resource/${resourceId}/views/`)
            return response.data
    }

    const fetchResourceDownloads = async () => {
            const response = await api.get(`/resource/${resourceId}/downloads/`)
            return response.data
    }

    // fetching queries
    const [
        { data, isLoading: isFetching },
        { data: resourceViews, isLoading: isFetchingViews },
        { data: resourceDownloads, isLoading: isFetchingDownloads },
    ] = useQueries({
        queries: [
            {
                queryKey: resourceId ? ["resource-details", resourceId] : ["resource-details-temp"],
                queryFn: fetchResource,
                enabled: !!resourceId,
            },
            {
                queryKey: ["resource-views", resourceId],
                queryFn: fetchResourceViews,
                enabled: !!resourceId,
            },
            {
                queryKey: ["resource-downloads", resourceId],
                queryFn: fetchResourceDownloads,
                enabled: !!resourceId,
            },
        ]
    })

    const buildPayload = (payload: ResourcePayload) => {
        const formData = new FormData()
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined) {
                if (value instanceof File) {
                    formData.append(key, value)
                } else {
                    formData.append(key, String(value))
                }
            }
        })
        console.log(...formData.entries())
        return formData

    }
    // create or update mutation
      const mutation = useMutation<ResourcePayload, Error, ResourcePayload>({
            mutationFn: async(payload:ResourcePayload) => {

                // clean the payload
                const cleanedData = buildPayload({
                    ...payload
                })

                if (payload.id){
                    // update existng study-group
                    const response = await api.patch(`/resource/${payload.id}/`,cleanedData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    })
                    return response.data
                } else {
                    const response = await api.post("/resource/", cleanedData,{
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    })
                    return response.data
                }
            },

            onSuccess: (variables) => {
                if (variables.id){
                    queryClient.invalidateQueries({ queryKey: ["resource-details", variables.id] })
                }
                queryClient.invalidateQueries({ queryKey: ["resources"] })
                toast.success(`Resource ${variables.id? "updated":"created"} successfully`, "Yey, let's go and spread resources")
                if (onSuccessCallback) onSuccessCallback()
            },

            onError: async (error: unknown, variables?: ResourcePayload) => {
            toast.error(`Failed to ${variables?.id ? "update" : "create"} ${variables?.resource_type} resource`, "Please check all the required fields")
            console.error(error)
            }
      })


        const deleteMutation = useMutation<void, Error, number>({
            mutationFn: async (id:number) => {
            await api.delete(`/resource/${id}/`)
            },

            onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["resources"] })
            queryClient.removeQueries({ queryKey: ["resource-details", id] })

            toast.info("Resource deleted successfully")

            if (onSuccessCallback) onSuccessCallback()
            },

        })


        // recording resource download
        const recordDownload = useMutation({
            mutationFn: async ({resourceId, groupId}:ResourceInteractionPayload) => {
                const response = await api.post(`/resource/${resourceId}/record_download/`,{
                    "group_id":groupId
                })
                return response.data
            },


            onMutate: async ({ resourceId }) => {
                await queryClient.cancelQueries({ queryKey: ["resource-details", resourceId] })
                queryClient.invalidateQueries({ queryKey: ["resource-views", resourceId] })
                const previous = queryClient.getQueryData(["resource-details", resourceId])

                queryClient.setQueryData(["resource-details", resourceId], (old: any) => ({
                    ...old,
                    count: (old?.count ?? 0) + 1,
                }))

                return { previous }
            },

            onError: (error, { resourceId }, context) => {
                queryClient.setQueryData(["resource-details", resourceId], context?.previous)
                toast.error("Failed to record download", "Please try again")
                console.error(error)
            },


        })

        // recording resource views
        const recordView = useMutation({
            mutationFn: async ({resourceId, groupId}:ResourceInteractionPayload) => {
                const response = await api.post(`/resource/${resourceId}/record_view/`,{
                    "group_id":groupId
                })
                return response.data
            },

            // change the old.count based on the final depth level of resource or info
            onMutate: async ({ resourceId }) => {
                await queryClient.cancelQueries({ queryKey: ["resource-details", resourceId] })
                 queryClient.invalidateQueries({ queryKey: ["resource-downloads", resourceId] })
                const previous = queryClient.getQueryData(["resource-details", resourceId])

                queryClient.setQueryData(["resource-details", resourceId], (old: any) => ({
                    ...old,
                    count: (old?.count ?? 0) + 1,
                }))

                return { previous }
            },

            onError: (error, { resourceId }, context) => {
                queryClient.setQueryData(["resource-details", resourceId], context?.previous)
                toast.error("Failed to record view", "Please try again")
                console.error(error)
            },
        })


    return {
        data,
        isFetching,

        // views
        resourceViews,
        isFetchingViews,


        // downloads
        resourceDownloads,
        isFetchingDownloads,


        recordDownload: recordDownload.mutate,
        isRecordingDownload: recordDownload.isPending,

        recordView: recordView.mutate,
        isRecordingView: recordView.isPending,

        // mutate
        isMutating: mutation.isPending,
        isDeleting: deleteMutation.isPending,
        mutate: mutation.mutate,
        deleteResource: deleteMutation.mutate,

    }

}