import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect, useRef } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Send, X, Loader2, Smile } from "lucide-react"
import api from "@/utils/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useInView } from "react-intersection-observer"
import QueryWrapper from "./query-wrapper"
import { type ChatProps } from "@/types/models"
import { extractLinks } from "@/utils/urls"
import EmojiPicker from 'emoji-picker-react';
import GifPicker from "./gif-picker"
import { IconGif } from "@tabler/icons-react"
import { ReactTinyLink } from 'react-tiny-link'
import { getExtension } from "@/utils/urls"
import { ViewAttachmentsDialog } from "./view-attachments"
import NoResult from "./no-result"

interface ChatBoxProps {
  groupId?: string;
  sessionId?: string;
}




// type ReplyTo = NonNullable<ChatProps["reply_to"]>;
type Sender = NonNullable<ChatProps["sender"]>;

// ── Mapper ────────────────────────────────────────────────────────────────────
function mapToChatProps(raw: ChatProps): ChatProps {
  return {
    ...raw,
    reply_to: raw.reply_to
      ? {
          id: raw.reply_to.id,
          message: raw.reply_to.message,
          attachments: raw.reply_to.attachments,
          sender: raw.reply_to.sender,
        }
      : null,
  };
}

// ── ChatItem
interface ChatItemProps {
  msg: ChatProps;
  isOwn: boolean;
  onReply: (msg: ChatProps) => void;
}

const MEDIA_EXTENSIONS = [
  // Photos
  "jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "tif",
  "svg", "ico", "heic", "heif", "raw", "cr2", "nef", "orf",
  "sr2", "arw", "dng", "rw2", "pef", "x3f", "raf", "3fr",
  "avif", "jxl", "psd", "ai", "eps", "exr", "hdr",

  // Videos
  "mp4", "mov", "avi", "mkv", "webm", "flv", "wmv", "m4v",
  "mpeg", "mpg", "3gp", "3g2", "ogv", "ts", "mts", "m2ts",
  "vob", "divx", "xvid", "rm", "rmvb", "asf", "f4v", "swf",
  "mxf", "roq", "nsv", "amv", "m2v", "svi", "yuv",
]


// ── ChatBox 
export const ChatBox = ({ groupId, sessionId }: ChatBoxProps) => {
  const { user } = useAuth();
  const { data: liveMessages, sendData } = useChat(groupId, sessionId);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([])
  const [allMessages, setAllMessages] = useState<ChatProps[]>([]);
  const [selectedMessageToReplyTo, setSelectedMessageToReplyTo] = useState<ChatProps | undefined>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false)
  const [showGifPicker, setShowGifPicker] = useState<boolean>(false)



  // sentinel at the "bottom" of the reversed flex = top of the visual list
  // when this comes into view, the user has scrolled up → load more
  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
    root: containerRef.current,
  });

  const fetchChats = async (page: number) => {
    const param = groupId ? `group=${groupId}` : `session=${sessionId}`;
    const response = await api.get(`chat/?${param}&page=${page}`);
    return response.data;
  };

  const {
    data: chats,
    isLoading: isFetchingChats,
    error: chatsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["chats", groupId, sessionId],
    queryFn: ({ pageParam = 1 }) => fetchChats(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      return Number(new URL(lastPage.next).searchParams.get("page"));
    },
    enabled: !!groupId || !!sessionId,
  });

  // fetch next page when sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // merge API history + live messages
  useEffect(() => {
    if (!chats) return;

    const apiMessages = chats.pages
      .flatMap((page) => page.results as ChatProps[])
      .map(mapToChatProps);

    const merged = [...(liveMessages ?? []).slice().reverse(), ...apiMessages];

    const seen = new Set<number>();
    setAllMessages(
      merged.filter((msg) => {
        if (seen.has(msg.id)) return false;
        seen.add(msg.id);
        return true;
      })
    );
  }, [chats, liveMessages]);

  // scroll to bottom when message count changes (new live message)
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [allMessages.length]);

  const handleSend = () => {
    if (!text.trim()) return;

    sendData({
      message: text,
      attachments: attachments.join(", "), //make the links plain text, ["links","links"] to links, links
      reply_to: Number(selectedMessageToReplyTo?.id),
    });
    setText("");
    setAttachments([])
    setSelectedMessageToReplyTo(undefined);
  };

  const handleMessage = (message:string) => {
    const {links, text:cleanedText} = extractLinks(message)
    // make the links plain text, ["links","links"] to links, links
    // const plainText = links.join(", ");

    setText(cleanedText)
    // merging the atttachments of recent and new
    addAttachment(links)


  }

  const handleRemoveAttachment = (url:string) => {
      console.log(`REMOVING ${url}`)
      setAttachments((prevAttachments) => 
      prevAttachments.filter(item => item !== url)
    );

  }

  // merging the atttachments of recent and new
  // check if duplicates 
  const addAttachment = (links: string[] | string) => {

    setAttachments((prevAttachments) => {
      // Combine old attachments and new links
      const combined = [...prevAttachments, ...links];
      
      // Create a map to filter by unique identifier (e.g., 'url')
      const uniqueAttachments = Array.from(
        new Map(combined.map((item) => [item, item])).values()
      );
      return uniqueAttachments;
    });
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOwnMessage = (msg: ChatProps) =>
    typeof msg.sender === "object" && (msg.sender as Sender).id === user?.id;

  return (
    <div className="border-2 h-full rounded-md flex flex-col overflow-hidden relative">

      {/* messages — flex-col-reverse so newest is at bottom, sentinel at DOM-bottom = visual top */}
      <div ref={containerRef} className="flex flex-col-reverse flex-1 overflow-y-auto p-3 space-y-4">
        <QueryWrapper data={allMessages} isLoading={isFetchingChats} error={chatsError}
        noResultsComponent={
          <NoResult
              label="Chats"
              description="Start the chats"
          />
        }
        >
          {allMessages.map((msg) => (
            <ChatItem
              key={msg.id}
              msg={msg}
              isOwn={isOwnMessage(msg)}
              onReply={setSelectedMessageToReplyTo}
            />
          ))}
        </QueryWrapper>

        {showEmojiPicker && (
          <div className="absolute z-1000 bottom-10 left-5">
            <EmojiPicker
            lazyLoadEmojis={true}
            onEmojiClick={(emojiObject)=>{
              setText(prev => prev + emojiObject.emoji);
            }}
            />
          </div>
        )}

      {
        showGifPicker && (
          <div className="absolute z-1000 bottom-10 left-5 bg-white">
            <GifPicker onSelect={(url)=>{
              // only allow one gif per message
              // check if the attachments list has gif already added, if yes, dont add another one, otherwise add
              const hasGifAlready = attachments.find(atch => getExtension(atch) === "gif")
              if (hasGifAlready) return
              addAttachment([url])
            }}/>
          </div>
        )
      }

        {/* sentinel — sits at DOM bottom (visual top due to col-reverse) */}
        <div ref={sentinelRef}>
          {isFetchingNextPage && (
            <p className="flex gap-1 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="animate-spin w-4 h-4" />
              <span>Loading...</span>
            </p>
          )}
        </div>
      </div>

      {/* reply banner */}
      {selectedMessageToReplyTo && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-muted border-t text-sm">
          <span className="text-muted-foreground truncate">
            Replying to{" "}
            <strong>
              {typeof selectedMessageToReplyTo.sender === "object"
                ? `${(selectedMessageToReplyTo.sender as Sender).first_name} ${(selectedMessageToReplyTo.sender as Sender).last_name}`
                : "Unknown"}
            </strong>
            : {selectedMessageToReplyTo.message?.slice(0, 60)}
          </span>
          <button onClick={() => setSelectedMessageToReplyTo(undefined)}>
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}

      {/* input */}
      <div className="">

        {/* then display the attachments here */}
        {attachments && attachments.length > 0 && (
          <div className="h-20 border-t p-1.5 flex flex-row gap-2">
            {attachments.map(attachment => (
              <div className="h-full w-20 rounded-sm overflow-hidden border border-muted-foreground relative">
                <img
                className="h-full w-full object-center"
                src={attachment} alt="" />
                {/* then x */}
                <Button
                variant={'outline'}
                size={'icon-sm'}
                className="absolute top-0 right-0 bg-black text-white"
                onClick={()=>handleRemoveAttachment(attachment)}
                >
                  <X/>
                </Button>
              </div>
            ))}
          </div>
        )}


        <div className="flex gap-2 p-2 border-t">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl shrink-0"
          onClick={()=>{
            setShowGifPicker(false)
            setShowEmojiPicker(!showEmojiPicker)
          }}
          ><Smile className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl shrink-0"
          onClick={()=>{
            setShowEmojiPicker(false)
            setShowGifPicker(!showGifPicker)
          }}
          ><IconGif className="w-4 h-4" /></Button>
          <Input
            placeholder="Type a message..."
            className="flex-1"
            value={text}
            onChange={(e) => handleMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSend} disabled={!text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>


      </div>
    </div>
  );
};

const ChatItem = ({ msg, isOwn, onReply }: ChatItemProps) => {
  const sender = typeof msg.sender === "object" ? msg.sender as Sender : null;
  const replySender = msg.reply_to && typeof msg.reply_to.sender === "object"
    ? msg.reply_to.sender as Sender
    : null;

  const [showViewAttachment, setShowViewAttachment] = useState<boolean>(false)

  const attachmentsArray = msg?.attachments?.replace(/[[\]]/g, "").split(",").map((url) => url.trim())

  const mediaAttachments = attachmentsArray?.filter(url => MEDIA_EXTENSIONS.includes(getExtension(url)))
  const genericAttachments = attachmentsArray?.filter(url => !MEDIA_EXTENSIONS.includes(getExtension(url)))

  return (
    <div className={`flex flex-col max-w-[70%] gap-0.5 ${isOwn ? "self-end items-end" : "self-start items-start"}`}>
      {!isOwn && sender && (
        <span className="text-xs text-muted-foreground px-1">
          {sender.first_name} {sender.last_name}
        </span>
      )}

      {msg.reply_to && (
        <div className="text-xs bg-muted px-2 py-1 rounded border-l-2 text-muted-foreground max-w-full truncate">
          <span className="font-medium">
            {replySender ? `${replySender.first_name} ${replySender.last_name}` : "Unknown"}
          </span>
          : {msg.reply_to.message?.slice(0, 80)}
        </div>
      )}

      <div className={`px-3 py-2 rounded-lg text-sm wrap-break-word flex flex-col ${isOwn? 'items-end':'items-start'}`}>

        <p className={`p-2.5 mb-2 rounded-xl bg-primary w-fit${isOwn? ' text-white rounded-br-none': 'text-foreground rounded-bl-none'}`}>{msg.message}</p>

        {/*attachments */}
        {msg.attachments && (() => {
          const urls = parseAttachmentUrls(mediaAttachments?? []);
          if (!urls.length) return null;

          return (
            <div className="">
              {/* media attachments */}
              <div className={`grid gap-1 ${gridClass[urls.length] ?? gridClass[4]}`} onClick={()=>setShowViewAttachment(true)}>
                {urls.map((url, index) => (
                  <div
                    key={url} // prefer stable key over index
                    className={`overflow-hidden rounded-lg w-40 h-40${
                      index === 0 && urls.length > 1
                        ? "col-span-1 row-span-2"
                        : "w-full"
                    }`}
                  >
                    <img
                      className="w-full h-full object-cover object-center"
                      src={url}
                      alt={`Attachment ${index + 1}`}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ))}

                {
                  urls.length > MAX_IMAGES && (
                    <div className="overflow-hidden rounded-lg w-40 h-40">
                      <img 
                      className="w-full h-full object-cover object-center"
                      src={urls[urls.length]} alt="" />
                    </div>
                  )
                }
              </div>

              {/* generic attachments */}
              <div className="mt-2">
                {
                  genericAttachments?.map((url) => {
                    return (
                      <div
                      key={url}
                      className="">
                        <ReactTinyLink
                          autoPlay={true}
                          cardSize="small"
                          showGraphic={true}
                          maxLine={2}
                          minLine={1}
                          url={url}
                        />
                      </div>
                    )
                  })
                }
              </div>

            </div>
          );
        })()}


        {/*  generic links */}
      </div>

      <div className="flex items-center gap-2 px-1">
        <span className="text-xs text-muted-foreground">
          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        <button onClick={() => onReply(msg)} className="text-xs text-muted-foreground hover:text-foreground">
          Reply
        </button>
      </div>
      {
        mediaAttachments && (
          <ViewAttachmentsDialog
          open={showViewAttachment}
          onOpenChange={setShowViewAttachment}
          attachments={mediaAttachments}
          
          />
        )
      }
    </div>
  );
};



// for grid style for multiple attachments

const MAX_IMAGES = 4;


const parseAttachmentUrls = (attachments: string[]): string[] =>
  attachments
    .filter(Boolean)
    .slice(0, MAX_IMAGES);

const gridClass: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-2 grid-rows-1",
  3: "grid-cols-2 grid-rows-2",
  4: "grid-cols-3 grid-rows-2",
};