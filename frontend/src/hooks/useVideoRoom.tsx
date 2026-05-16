import Peer, { type MediaConnection } from "peerjs"
import { useEffect, useRef, useState, useCallback } from "react"
import { useToast } from "./useToast"
import { useSound } from "./useSound"

interface UserMeta {
  userId?: string
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  avatar?: string
}

interface Participant {
  id: string
  stream: MediaStream
  userId?: string
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  avatar?: string
}

interface UseVideoRoomReturn {
  participants: Participant[]
  videoRefs: React.MutableRefObject<{ [key: string]: HTMLVideoElement | null }>
  isConnected: boolean
  isMuted: boolean
  isCameraOff: boolean
  error: string | null
  toggleMic: () => void
  toggleCamera: () => void
}
const API_URL = import.meta.env.VITE_BACKEND_URL;



export const useVideoRoom = (groupId: string, sessionId: string): UseVideoRoomReturn => {
  const peerRef = useRef<Peer | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const peersRef = useRef<{ [key: string]: MediaConnection }>({})
  const localStreamRef = useRef<MediaStream | null>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({}) //video references
  const pendingMetaRef = useRef<{ [userId: string]: UserMeta }>({})

  const [participants, setParticipants] = useState<Participant[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const token = localStorage.getItem("accessToken")

  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

  const {play} = useSound()

  const stopLocalStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(track => track.stop())
    localStreamRef.current = null
  }, [])

  const handleError = useCallback((message: string, code?: string) => {
    setError(message)
    play("failed")
    stopLocalStream()
    toast.error(code ?? "Error", message)
  }, [stopLocalStream])

  const addParticipant = useCallback((
    id: string,
    stream: MediaStream,
    meta?: UserMeta
  ) => {
    setParticipants(prev => {
      const alreadyExists = prev.find(p =>
        p.id === id || (meta?.userId && p.userId === meta.userId)
      )
      if (alreadyExists) return prev
      return [...prev, { id, stream, ...meta }]
    })
  }, [])

  const updateParticipant = useCallback((id: string, meta: UserMeta) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...meta } : p))
  }, [])

  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id))
    peersRef.current[id]?.close()
    delete peersRef.current[id]
  }, [])

  const connectToNewUser = useCallback((
    userId: string,
    stream: MediaStream,
    meta?: UserMeta
  ) => {
    if (!peerRef.current) return

    pendingMetaRef.current[userId] = meta ?? {}

    const call = peerRef.current.call(userId, stream)

    call.on("stream", (userStream: MediaStream) => {
      addParticipant(userId, userStream, meta)
      toast.success("User joined", `${meta?.firstName ?? meta?.username ?? "A user"} joined the session.`)
    })
    call.on("close", () => {
      removeParticipant(userId)
      delete pendingMetaRef.current[userId]
      toast.info("User left", `${meta?.firstName ?? meta?.username ?? "A user"} left the session.`)
    })
    call.on("error", (err) => console.error("Outgoing call error:", err))

    peersRef.current[userId] = call
  }, [addParticipant, removeParticipant])


  const toggleMic = useCallback(() => {
    const audio = localStreamRef.current?.getAudioTracks()[0]
    if (!audio) return
    audio.enabled = !audio.enabled
    setIsMuted(!audio.enabled)
  }, [])

  const toggleCamera = useCallback(() => {
    const video = localStreamRef.current?.getVideoTracks()[0]
    if (!video) return
    video.enabled = !video.enabled
    setIsCameraOff(!video.enabled)
  }, [])


  // update all peers connection when participants avariable changes(such as when a new person joined)
  useEffect(() => {
    participants.forEach(p => {
      const videoEl = videoRefs.current[p.id]
      if (videoEl && videoEl.srcObject !== p.stream) {
        videoEl.srcObject = p.stream
      }
    })
  }, [participants])

  useEffect(() => {
    if (!sessionId || !groupId) {
      handleError(!sessionId ? "Session ID is required" : "Group ID is required")
      return
    }

    let cleanedUp = false

    // setting up, getting medias
    const setup = async () => {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        localStreamRef.current = stream
        addParticipant("me", stream)
      } catch (err: any) {
        const messages: Record<string, string> = {
          NotReadableError: "Camera or microphone is already in use.",
          NotAllowedError: "Permission denied for camera/microphone.",
          NotFoundError: "No camera or microphone found.",
        }
        handleError(messages[err.name] ?? "Could not access media devices.")
        return
      }

      if (cleanedUp) return
      const backendHost = API_URL;
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const url = `${protocol}://${backendHost}/ws/video/${groupId}/${sessionId}/?token=${token}`;
      
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true)
        toast.success("Connected", "You have joined the session.")
      }
      ws.onerror = () => handleError("WebSocket connection failed.")
      ws.onclose = () => {
        setIsConnected(false)
        toast.info("Disconnected", "You have left the session.")
      }

      const peer = new Peer(undefined as any, { debug: 3, secure: true })
      peerRef.current = peer

      peer.on("open", (id) => {
        ws.send(JSON.stringify({ type: "user-connected", userId: id }))
      })

      peer.on("error", (err) => {
        console.error("PeerJS error:", err)
        handleError("Peer connection failed.", "PEER_ERROR")
      })

      peer.on("call", (call: MediaConnection) => {
        call.answer(stream)
        call.on("stream", (userStream) => {
          const meta = pendingMetaRef.current[call.peer]
          addParticipant(call.peer, userStream, meta)
          toast.success("User joined", `${meta?.firstName ?? meta?.username ?? "A user"} joined the session.`)
        })
        call.on("close", () => {
          removeParticipant(call.peer)
          delete pendingMetaRef.current[call.peer]
          toast.info("User left", "A participant left the session.")
        })
        call.on("error", (err) => console.error("Incoming call error:", err))
      })

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "error") {
            handleError(data.detail, data.code)
            return
          }

          // backend sends current user's info after successful join
          if (data.type === "self-info") {
            updateParticipant("me", {
              userId: data.user.id,
              username: data.user.username,
              email: data.user.email,
              firstName: data.user.first_name,
              lastName: data.user.last_name,
              avatar: data.user.avatar,
            })
            return
          }

          if (data.type === "user-connected" && data.userId && data.userId !== peer.id) {
            const meta: UserMeta = {
              userId: data.user?.id,
              username: data.user?.username,
              email: data.user?.email,
              firstName: data.user?.first_name,
              lastName: data.user?.last_name,
              avatar: data.user?.avatar,
            }
            pendingMetaRef.current[data.userId] = meta
            connectToNewUser(data.userId, stream, meta)
          }
        } catch {
          console.error("Failed to parse WebSocket message")
        }
      }
    }

    setup()

    return () => {
      cleanedUp = true
      socketRef.current?.close()
      peerRef.current?.destroy()
      Object.values(peersRef.current).forEach(call => call.close())
      stopLocalStream()
      setParticipants([])
      setIsConnected(false)
    }
  }, [sessionId, groupId, addParticipant, removeParticipant, connectToNewUser, updateParticipant])

  return { participants, videoRefs, isConnected, error, isMuted, isCameraOff, toggleMic, toggleCamera }
}