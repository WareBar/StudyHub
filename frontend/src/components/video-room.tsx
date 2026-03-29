import Peer, { type MediaConnection } from "peerjs"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
// Props for the VideoRoom
interface VideoRoomProps {
  roomId: string
}

// Participant interface
interface Participant {
  id: string
  stream: MediaStream
}

const VideoRoom: React.FC<VideoRoomProps> = ({ roomId }) => {
  const peer = useRef<Peer | null>(null)
  const socket = useRef<WebSocket | null>(null)
  const peers = useRef<{ [key: string]: MediaConnection }>({})

  const localStreamRef = useRef<MediaStream | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})


  
  useEffect(() => {
    console.log("starting VideoRoom for room:", roomId)

    // setting the connection to the webscoket
    try {
      socket.current = new WebSocket(
        `wss://bmg8q0kw-8000.asse.devtunnels.ms/ws/video/${roomId}/`
      )

      socket.current.onopen = () => {
        console.log("conneted")
      }

      socket.current.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      socket.current.onclose = () => {
        console.log("socket closed")
      }

    } catch (err) {
      console.error("failed to connect to socket:", err)
    }

    // video room is need
    if (!roomId){
      return toast.error('Room ID is needed')
    }


    /* ----------------------------
       2️⃣ PeerJS Setup
    -----------------------------*/
    try {
      // peer.current = new Peer(undefined, {
      //   host: "localhost",      // the PeerJS server host
      //   port: 9000,             // the PeerJS server port
      //   path: "/",        // the same path you used when starting npx peerjs
      //   secure: false,          // false for localhost http
      //   debug: 3
      // });
      peer.current = new Peer(undefined, {
        debug: 3,
        secure:true
      });

      peer.current.on("open", (id) => {
        console.log("Peer connected with ID:", id)

        // Send peer ID to backend
        socket.current?.send(
          JSON.stringify({
            type: "user-connected",
            userId: id
          })
        )
      })

      peer.current.on("error", (err) => {
        console.error("❌ PeerJS error:", err)
      })

    } catch (err) {
      console.error("❌ Failed to initialize PeerJS:", err)
    }

    // get video and mic
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })

        console.log("Camera and Mic gots")

        localStreamRef.current = stream
        setParticipants([{ id: "me", stream }])

        // for incoming call
        peer.current?.on("call", (call: MediaConnection) => {
          console.log("Incoming call from:", call.peer)

          call.answer(stream)

          call.on("stream", (userStream: MediaStream) => {
            console.log("received remote stream from:", call.peer)
            addParticipant(call.peer, userStream)
          })

          call.on("error", (err) => {
            console.error(" Call error:", err)
          })

          call.on("close", () => {
            toast.info(`${call.peer} left`)
            console.log("Call closed:", call.peer)
            removeParticipant(call.peer)
          })
        })

      } catch (error: any) {
        console.error("Failed to get media devices:", error)

        switch (error.name) {
          case "NotReadableError":
            alert("Camera or microphone is already in use.")
            break
          case "NotAllowedError":
            alert("Permission denied for camera/microphone.")
            break
          case "NotFoundError":
            alert("No camera or microphone found.")
            break
          default:
            alert("Could not access media devices.")
        }
      }
    }

    getMedia()

    // socket message like using joining
    if (socket.current) {
      socket.current.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          console.log(" WebSocket message:", data)
          toast.success(`A user joined the classroom`)

          if (
            data.type === "user-connected" &&
            data.userId &&
            data.userId !== peer.current?.id
          ) {
            console.log("Connecting to new user:", data.userId)
            if (localStreamRef.current) {
              connectToNewUser(data.userId, localStreamRef.current)
            }
          }

        } catch (err) {
          console.error("Failed to parse WebSocket message:", err)
        }
      }
    }


    // clean up when unmount
    return () => {
      console.log("Cleaning up VideoRoom")

      socket.current?.close()
      peer.current?.destroy()

      Object.values(peers.current).forEach(call => call.close())

      localStreamRef.current?.getTracks().forEach(track => track.stop())
    }

  }, [roomId])

  /* ----------------------------
     Connect to new user
  -----------------------------*/
  const connectToNewUser = (userId: string, stream: MediaStream) => {
    if (!peer.current) return

    console.log("Calling user:", userId)

    const call = peer.current.call(userId, stream)

    call.on("stream", (userStream: MediaStream) => {
      console.log("Stream received from:", userId)
      addParticipant(userId, userStream)
    })

    call.on("error", (err) => {
      console.error("Outgoing call error:", err)
    })

    call.on("close", () => {
      console.log(" Call closed with:", userId)
      removeParticipant(userId)
    })

    peers.current[userId] = call
  }

  /* ----------------------------
     Add Participant
  -----------------------------*/
  const addParticipant = (id: string, stream: MediaStream) => {
    setParticipants(prev => {
      if (prev.find(p => p.id === id)) return prev
      return [...prev, { id, stream }]
    })
  }

  /* ----------------------------
     Remove Participant
  -----------------------------*/
  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id))
    delete peers.current[id]
  }

  /* ----------------------------
     Attach Streams to Videos
  -----------------------------*/
  useEffect(() => {
    participants.forEach(p => {
      const videoEl = videoRefs.current[p.id]
      if (videoEl && videoEl.srcObject !== p.stream) {
        videoEl.srcObject = p.stream
      }
    })
  }, [participants])

  return (
    <div style={styles.gridContainer}>
      {participants.map(p => (
        <video
          key={p.id}
          ref={el => (videoRefs.current[p.id] = el)}
          autoPlay
          playsInline
          muted={p.id === "me"}
          style={styles.video}
        />
      ))}
    </div>
  )
}

/* ----------------------------
   Styles
-----------------------------*/
const styles: { [key: string]: React.CSSProperties } = {
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
    padding: "10px",
  },
  video: {
    width: "100%",
    height: "auto",
    backgroundColor: "black",
    borderRadius: "8px",
  },
}

export default VideoRoom
