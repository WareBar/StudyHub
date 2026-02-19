import VideoRoom from "@/components/video-room"
import { useParams } from 'react-router-dom';
import { toast } from "sonner";



const VideoCall = () => {
    const {id} = useParams;
    if (!id){
        return toast.error('Please provide a room id')
    }

    return (
        <div className="">
            <VideoRoom 
            roomId={id}
            />
        </div>
    )
}



export default VideoCallw