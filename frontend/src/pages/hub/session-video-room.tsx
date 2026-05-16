import { VideoRoom } from "@/components/video-room"
import { ChatBox } from "@/components/chat-box"
import { useParams } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState } from "react"
import { Layout } from "@/components/Layout"
import { capitalize } from "@/utils/word"


export const SessionVideoRoom = () => {
  const {groupId, sessionId} = useParams()
  const [peopleInCall, setPeopleInCall] = useState()
  return (
    <Layout isAuthenticated>
    <div className="flex flex-row gap-2 p-2.5 h-full">
      {/* room */}
      <div className="w-[75%]" style={{ height: "calc(80vh - 1.25rem)" }}>
        <VideoRoom groupId={groupId} sessionId={sessionId} setPeopleInCall={setPeopleInCall}/>
      </div>
      
      {/* side box with people list and chatbox*/}
      <div className="w-[25%] h-full" style={{ height: "calc(80vh - 1.25rem)" }}>
        <div className=" h-full">
          <Tabs defaultValue="chat" className="h-full">
            <TabsList className="bg-muted/50 w-full">
              {
                ['chat','people'].map((trigger)=>{
                  return (
                    <TabsTrigger value={trigger}>{capitalize(trigger)}</TabsTrigger>
                  )
                })
              }
            </TabsList>
            <TabsContent value="chat" className="h-full">
                <ChatBox groupId={undefined} sessionId={sessionId}/>
            </TabsContent>

            <TabsContent value="people">
                <PeopleInCallList
                participants={peopleInCall}
                />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
    </Layout> 
  )
}


const PeopleInCallList = ({participants}) => {
  return (
    <div className="p-5">
      <p className="mb-10 text-center font-semibold">People inside the session ({participants.length})</p>
      <div className="">
        {
          participants?.map((user, index)=>{
            return (
              <div 
              key={index}
              className="flex items-center gap-2">
                {/* avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img src={user.avatar} alt="" className="h-full w-full object-center"/>
                </div>

                <p>{user.email}</p>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}