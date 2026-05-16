import { useEffect, useRef, useState } from "react";
import { type ChatProps } from "@/types/models";
import { useSound } from "./useSound";

const API_URL = import.meta.env.VITE_BACKEND_URL;

interface SendDataParams {
  message?: string;
  attachments?: string;
  reply_to?: number;  // ChatProps id is number, not string
}

export const useChat = (groupId?: string, sessionId?: string) => {
  const [data, setData] = useState<ChatProps[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const token = localStorage.getItem("accessToken");
  const {play} = useSound()

  useEffect(() => {
    if (!groupId && !sessionId) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const path = sessionId ? `session/${sessionId}/chat` : `group/${groupId}/chat`;
    const url = `${protocol}://${API_URL}/ws/${path}/?token=${token}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");

    ws.onmessage = (event) => {
      const msg: ChatProps & { type: string } = JSON.parse(event.data);

      if (msg.type === "message") {
        setData((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });


        const currentUserId = Number(localStorage.getItem("userId"));

        if (msg.sender.id !== currentUserId && document.hidden) {
          play("received");
        }
        else{
          play("sent")
        }

      }

      if (msg.type === "error") {
        console.error("WebSocket error from server:", msg);
      }
    };

    ws.onerror = (err) => {
        console.error("WebSocket error", err)
    };
    ws.onclose = () => console.log("WebSocket disconnected");

    return () => {
      ws.close();
      wsRef.current = null;
      setData([]);
    };
  }, [groupId, sessionId, token]);

  const sendData = ({ message, attachments, reply_to }: SendDataParams) => {
    console.log(message)
    console.log(attachments)
    console.log(reply_to)

    console.log("WS STATE:", wsRef.current?.readyState);

    if (!wsRef.current) {
      console.log("No WebSocket instance");
      return;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not connected");
      return;
    }
      wsRef.current.send(
        JSON.stringify({
          type: "message.send",
          message,
          attachments,
          reply_to,
        })
      );
      
  };

  return { data, sendData };
};