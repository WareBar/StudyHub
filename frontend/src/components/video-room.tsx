import { useVideoRoom } from "@/hooks/useVideoRoom"
import { CallConnecting } from "./call-connecting"
import { Button } from "./ui/button"
import { 
  MicOff, VideoOff,
  Mic, Video, Phone

} from "lucide-react"
import { useEffect, useState } from "react"

interface VideoRoomProps {
  groupId:string | undefined,
  sessionId:string | undefined,
  setPeopleInCall?:()=>void
}


const giveGridLayout = (count:number) => {
  if (count === 1) return "grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
  if (count === 2 || count === 3) return "grid-cols-2"
  if (count === 3) return "cols-span-2"

  // fallback
  return "grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
}


export const VideoRoom = ({groupId, sessionId, setPeopleInCall}:VideoRoomProps) => {
  const { participants, videoRefs, isConnected, error, toggleMic, toggleCamera, isMuted, isCameraOff } = useVideoRoom(groupId, sessionId)
  const [mutedUsers, setMutedUsers] = useState<string[]>([])


  console.log('people inside call')
  console.log(participants)

  useEffect(()=>{
    if (!participants) return;
    setPeopleInCall(participants)
  },[participants])

  if (error) return (
    <div className="flex flex-1 items-center justify-center h-full text-red-500">
      {error}
    </div>
  )

  if (isConnected){
    (
      <CallConnecting/>
    )
  }


  const handleMutingOthers = (userId: string) => {
    setMutedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)  // unmute
        : [...prev, userId]                  // mute
    )
  }

  const toggleLeaveCall = () =>{
    window.close()
  }

  
  return (
      <div className={`
      h-full
      grid 
      ${giveGridLayout(participants.length)}
      gap-2.5 relative
      `}>
        {/* {!isConnected && (
          <p className="text-sm text-muted-foreground">Connecting...</p>
        )} */}
        {participants.map(p => (

            <div key={p.id} className="group relative border-2 bg-orange-500 rounded-lg overflow-hidden">
              {/* show the user name or email */}
              <p className="absolute top-2 left-2 text-white font-semibold">
                {p.id === "me"? "You": p.email}
              </p>

              {/* avatar fallback — shown when camera is off for "me", always as overlay for others */}
              {(p.id === "me" && isCameraOff) && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                  {p.avatar ? (
                    <img
                      src={p.avatar}
                      alt={p.username ?? "User"}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-neutral-700 flex items-center justify-center text-2xl font-medium text-white">
                      {p.firstName?.[0] ?? p.username?.[0] ?? "?"}
                    </div>
                  )}
                  <p className="absolute bottom-3 left-3 text-sm text-white">
                    {p.firstName ?? p.username ?? "You"}
                  </p>
                </div>
              )}

              <video
                ref={el => (videoRefs.current[p.id] = el)}
                autoPlay
                playsInline
                muted={p.id === "me" || mutedUsers.includes(p.id)}
                className={`w-full h-full bg-black ${p.id === "me" && isCameraOff ? "invisible" : ""}`}
              />

              {p.id !== "me" && (
                <Button
                  onClick={() => handleMutingOthers(p.id)}
                  variant="outline"
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 invisible group-hover:visible"
                >
                  {mutedUsers.includes(p.id) ? <MicOff /> : <Mic />}
                </Button>
              )}
            </div>
        ))}



        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <CallControl
          toggleCamera={toggleCamera}
          toggleMic={toggleMic}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          toggleLeaveCall={toggleLeaveCall}
          />
        </div>

      </div>
  )
}





const CallControl = ({toggleMic, toggleCamera, isMuted, isCameraOff, toggleLeaveCall}) => {
  return (
    <div className="rounded-full overflow-hidden flex flex-row gap-2 bg-primary">
      <Button size={'lg'} onClick={toggleCamera}>
        {isCameraOff ? <VideoOff /> : <Video />}
      </Button>

      <Button size={'lg'} onClick={toggleMic}>
        {isMuted ? <MicOff /> : <Mic />}
      </Button>

      <Button size={'lg'} onClick={toggleLeaveCall}>
        <Phone/>
      </Button>
    </div>
  )
}