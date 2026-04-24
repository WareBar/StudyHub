import { useAuth } from "@/context/AuthContext";
import { FormDialogControlled } from "./common/form-dialog";
import { useEffect, useState } from "react";
import { type SubjectProps } from "@/types/models";
import { useStudyGroup } from "@/hooks/useStudyGroup";
import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent } from "react"
import { useToast } from "@/hooks/useToast";
import QueryWrapper from "./query-wrapper";
import Choose from "./ui/choose";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";


interface CreateStudyGroupDialogProps {
    open: boolean;
    onOpenChange: (arg0:boolean)=>void
}


export const CreateStudyGroupDialog = ({open, onOpenChange}:CreateStudyGroupDialogProps) => {
    const { toast } = useToast()
    const {user} = useAuth()
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [selectedSubject, setSelectedSubject] = useState<SubjectProps | null>()
    const [maxMembers, setMaxMembers] = useState<number>()
    

    const {mutate: createStudyGroup, isMutating} = useStudyGroup(undefined, ()=>onOpenChange(false))

    const fetchSubjects = async () => {
        const response = await api.get("/subject/")
        console.log(response)
        return response.data
    }

    const {data, isLoading, error} = useQuery({
        queryKey:['subjects'],
        queryFn: fetchSubjects
    })


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if(!name){
            return toast.error('Study group name is required')
        }

        if(!description){
            return toast.error("Description is required")
        }

        if(!selectedSubject){
            return toast.error("Please select a subject")
        }

        if(!user){
            return toast.error("No User is logged in")
        }

        console.log(name)
        console.log(description)
        console.log(selectedSubject.id)
        console.log(maxMembers)
        createStudyGroup({
            "name":name,
            "description":description,
            "subject":selectedSubject.id,
            "max_members":maxMembers,
            "creator":user.id,
            
        })

    }

    useEffect(()=>{
        console.log(selectedSubject)
    },[selectedSubject])


    return (
        <>
        <FormDialogControlled
        open={open}
        onOpenChange={onOpenChange}
        title="Create Study Group"
        description="Create new group to lead"
        externalIsEditing={true} //force editing
        setExternalIsEditing={()=>{}}
        onSubmit={handleSubmit}
        confirm={{
            save: {
                enabled:true,
                title:"Create study group",
                description:"This action will create a new study group"
            },
            cancel:{
                enabled:true,

            }
        }}
        footer={({requestSave, requestCancel}) => (
            <>
                <Button
                type="button"
                variant={'outline'}
                onClick={requestCancel}
                >
                    Cancel
                </Button>

                <Button
                type="submit"
                variant="default"
                onClick={requestSave}
                >
                    {isMutating? "Creating...":"Create"}
                </Button>
            </>
        )}
        >
            <div className="grid gap-2">
                <Label>Group name</Label>
                <Input
                placeholder="e.g. Developer Team"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                />
            </div>

            <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                placeholder="What's this study group about, what do is your objective"
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
                />
            </div>

            <div className="grid gap-2">
                <Label>Max Members</Label>
                <Input
                type="number"
                min={1}
                value={maxMembers}
                onChange={(e)=>setMaxMembers(Number(e.target.value))}
                />
            </div>

            <div className="grid gap-2">
                <Label>Subject</Label>
                <QueryWrapper
                data={data}
                isLoading={isLoading}
                error={error}
                >
                    <Choose
                    onValueChange={(val)=>setSelectedSubject(val)}
                    value={selectedSubject}
                    labelKey="name"
                    choices={data?.results}
                    width="full"
                    />
                </QueryWrapper>
            </div>

        </FormDialogControlled>
        </>

    )

}