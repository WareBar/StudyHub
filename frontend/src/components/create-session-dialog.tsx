import { useAuth } from "@/context/AuthContext";
import { FormDialogControlled } from "./common/form-dialog";
import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { type FormEvent } from "react"
import { useToast } from "@/hooks/useToast";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import Choose from "./ui/choose";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import QueryWrapper from "./query-wrapper";
import { SchedulePicker } from "./ui/schedule-picker";
import { format } from "date-fns"
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";


interface CreateSessionDialogProps {
    groupId?:number,
    open: boolean;
    onOpenChange: (arg0:boolean)=>void
}


export const CreateSessionDialog = ({groupId, open, onOpenChange}:CreateSessionDialogProps) => {
    const {toast} = useToast()

    const [selectedGroupId, setSelectedGroupId] = useState(groupId)
    const [sessionType, setSessionType] = useState<string>()
    const [start, setStart] = useState<string>("")
    const [end, setEnd] = useState<string>("")
    const [location, setLocation] = useState<string>("")
    const [notes, setNotes] = useState<string>("")
    const {mutate: createSession, isMutating} = useSession(undefined, ()=>onOpenChange(false))

    const fetchGroups = async () => {
        const response = await api.get("study-group/?type=my")
        return response.data
    }

    const fetchGroupById = async (id: number) => {
    const response = await api.get(`/study-group/${id}/`)
    return response.data
    }

    const {
    data: groupDetail,
    isLoading: isGroupLoading
    } = useQuery({
    queryKey: ["study-group", groupId],
    queryFn: () => fetchGroupById(groupId!),
    enabled: !!groupId
    })


    const {
    data: groups,
    isLoading,
    error
    } = useQuery({
    queryKey: ["study-groups"],
    queryFn: fetchGroups,
    enabled: !groupId
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const missingFields = [
            !selectedGroupId && "Group id",
            !sessionType && "Session type",
            !start && "Start",
            !end && "End",
            !location && "Location",
            !notes && "Notes",
        ].filter(Boolean)

        if (missingFields.length > 0) {
            return toast.error("Missing fields",`Please fill in the following: ${missingFields.join(", ")}`)
        }


        createSession({
            "group":selectedGroupId,
            "session_type":sessionType,
            "status":"scheduled",
            "start":start,
            "end":end,
            "location":location,
            "notes":notes
        })

    }
    useEffect(() => {
    if (groupDetail) {
        setSelectedGroupId(groupDetail.id)
    }
    }, [groupDetail])

    return (
        <>
            <FormDialogControlled
            open={open}
            onOpenChange={onOpenChange}
            title="Schedule Session"
            description="Schedule a session for learning"
            width="lg"
            externalIsEditing={true} //force editing
            setExternalIsEditing={()=>{}}
            onSubmit={handleSubmit}
            confirm={{
                save: {
                    enabled:true,
                    title:"Schedule the session",
                    description:"This action will schedule a session"
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
                        {isMutating? "Scheduling...":"Schedule"}
                    </Button>
                </>
            )}
            >

                {
                    groups && (
                        <QueryWrapper
                        data={groups}
                        isLoading={isLoading}
                        error={error}
                        >
                            <Choose
                            onValueChange={(val)=>setSelectedGroupId(Number(val))}
                            value={(selectedGroupId)?.toString()}
                            labelKey="name"
                            choices={groupId ? [groupDetail] : groups?.results}
                            width="full"
                            />
                        </QueryWrapper>
                    )
                }


                <div className="flex gap-2">
                    <Label>Session Type:</Label>
                    {/* radios */}
                    <RadioGroup defaultValue="online" className="flex"
                        onValueChange={(value) => setSessionType(value)}
                    >
                        {['online', 'physical'].map((mode) => (
                            <div key={mode} className="flex items-center gap-3">
                                <RadioGroupItem value={mode} id={mode} />
                                <Label htmlFor={mode}
                                className={mode === sessionType? `text-black`:'text-muted-foreground'}
                                >{mode}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                {/* times */}
                <div className="">
                <SchedulePicker
                start={start}
                end={end}
                onStartChange={setStart}
                onEndChange={setEnd}
                />
                </div>

                <div className="grid gap-3">
                    <Label>Location</Label>
                    <Input
                    type="text"
                    value={location}
                    onChange={(e)=>setLocation(e.target.value)}
                    placeholder={sessionType === "online"? "Platform where session wild be held(In-app or third-party)":"Location where the session will be held"}
                    />
                </div>

                <div className="grid gap-3">
                    <Label>Notes</Label>
                    <Textarea
                    placeholder={sessionType === "online"? "You can put the link of the online session here if using third-party":"Topics or agenda you will discuss"}
                    value={notes}
                    onChange={(e)=>setNotes(e.target.value)}
                    />
                </div>
                

            </FormDialogControlled>
        </>
    )
}

