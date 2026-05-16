import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download } from "lucide-react"

interface ViewAttachmentsDialogProps {
  attachments: string[]
  active?: string
  open: boolean
  onOpenChange: (args1:boolean) => void
}

export const ViewAttachmentsDialog = ({
  attachments,
  active,
  open,
  onOpenChange,
}: ViewAttachmentsDialogProps) => {
  const initialIndex = active ? attachments.indexOf(active) : 0
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0)
  const [zoomed, setZoomed] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)

  useEffect(() => {
    if (open) {
      const idx = active ? attachments.indexOf(active) : 0
      setCurrentIndex(idx >= 0 ? idx : 0)
      setZoomed(false)
    }
  }, [open, active, attachments])

  const navigate = useCallback(
    (dir: "prev" | "next") => {
      if (isTransitioning || attachments.length <= 1) return
      setDirection(dir === "prev" ? "left" : "right")
      setIsTransitioning(true)
      setZoomed(false)

      setTimeout(() => {
        setCurrentIndex((prev) =>
          dir === "prev"
            ? (prev - 1 + attachments.length) % attachments.length
            : (prev + 1) % attachments.length
        )
        setIsTransitioning(false)
        setDirection(null)
      }, 220)
    },
    [isTransitioning, attachments.length]
  )

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigate("prev")
      if (e.key === "ArrowRight") navigate("next")
      if (e.key === "Escape") onOpenChange()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, navigate, onOpenChange])

  const currentSrc = attachments[currentIndex]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-7xl max-w-7xl p-0 bg-black/85 border-white/10 overflow-hidden">
        {/* Hidden but accessible header */}
        <DialogHeader className="sr-only">
          <DialogTitle>Attachments View Dialog</DialogTitle>
          <DialogDescription>{attachments.length} media</DialogDescription>
        </DialogHeader>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 bg-linear-to-b from-black/70 to-transparent">
          <span className="text-white/70 text-sm font-medium tracking-wide">
            {currentIndex + 1} / {attachments.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomed((z) => !z)}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title={zoomed ? "Zoom out" : "Zoom in"}
            >
              {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            </button>
            <a
              href={currentSrc}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Download"
            >
              <Download size={18} />
            </a>
            <button
              onClick={()=>onOpenChange(false)}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main image area */}
        <div className="relative flex items-center justify-center w-full h-[72vh] overflow-hidden select-none">
          {/* Prev button */}
          {attachments.length > 1 && (
            <button
              onClick={() => navigate("prev")}
              className="absolute left-3 z-10 p-2 rounded-full bg-black/40 text-white/80 hover:bg-black/70 hover:text-white border border-white/10 hover:border-white/30 transition-all backdrop-blur-sm"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* Image */}
          <div
            className="w-full h-full flex items-center justify-center px-16"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning
                ? `translateX(${direction === "right" ? "-40px" : "40px"})`
                : "translateX(0)",
              transition: "opacity 0.22s ease, transform 0.22s ease",
            }}
          >
            <img
              key={currentSrc}
              src={currentSrc}
              alt={`Attachment ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-md shadow-2xl"
              style={{
                cursor: zoomed ? "zoom-out" : "zoom-in",
                transform: zoomed ? "scale(1.6)" : "scale(1)",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onClick={() => setZoomed((z) => !z)}
              draggable={false}
            />
          </div>

          {/* Next button */}
          {attachments.length > 1    && (
            <button
              onClick={() => navigate("next")}
              className="absolute right-3 z-10 p-2 rounded-full bg-black/40 text-white/80 hover:bg-black/70 hover:text-white border border-white/10 hover:border-white/30 transition-all backdrop-blur-sm"
            >
              <ChevronRight size={26} />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {attachments.length > 1 && (
          <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto bg-black/60 border-t border-white/10 scrollbar-thin scrollbar-thumb-white/20">
            {attachments.map((src, i) => (
              <button
                key={src}
                onClick={() => {
                  if (i === currentIndex) return
                  setDirection(i > currentIndex ? "right" : "left")
                  setIsTransitioning(true)
                  setZoomed(false)
                  setTimeout(() => {
                    setCurrentIndex(i)
                    setIsTransitioning(false)
                    setDirection(null)
                  }, 220)
                }}
                className={`shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-all ${
                  i === currentIndex
                    ? "border-white scale-105"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}