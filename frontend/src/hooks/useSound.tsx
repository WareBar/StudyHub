import sent from "@/assets/sounds/sent.mp3"
import received from "@/assets/sounds/received.mp3"
import success from "@/assets/sounds/success.mp3"
import failed from "@/assets/sounds/failed.mp3"
import warning from "@/assets/sounds/warning.mp3"
import clicked from "@/assets/sounds/clicked.mp3"


type soundChoices = "sent" | "received" | "success" | "failed" | "warning" | "clicked"


export const useSound = () => {
    const play = (sound:soundChoices) => {
        let soundSrc: string

        switch (sound) {
            case "sent":
                soundSrc = sent;
                break;
            case "received":   
                soundSrc = received;
                break;
            case "success":
                soundSrc = success;
                break;
        
            case "failed":
                soundSrc = failed
                break;
                
            case "warning":
                soundSrc = warning
                break;
            case "clicked":
                soundSrc = clicked
                break;
            default:
                soundSrc = warning

        }
        const audio = new Audio(soundSrc)
        audio.volume = 0.6;
        audio.currentTime = 0;
        audio.play().catch(() => {
        // autoplay might be blocked
        });
    };
    return {play};    
};