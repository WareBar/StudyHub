import VideoRoom from "@/components/video-room";


const ClassroomPage = () => {
    const roomID = "testing"
    return (
        <div>
        <VideoRoom 
        roomId={roomID}
        />
        </div>
    )
}

export default ClassroomPage;