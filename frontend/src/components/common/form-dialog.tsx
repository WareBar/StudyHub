import {
  type ReactNode,
  type FormEvent,
  useState,
  useRef,
} from "react"

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  BookOpen,
  Calendar,
  Settings,
  Users,
  FileText,
  Star,
} from "lucide-react"

/* -------------------------------------------------------
   Types
------------------------------------------------------- */

type DialogFooterActions = {
  requestEdit: () => void
  requestSave: () => void
  requestCancel: () => void
  requestDelete: () => void
  isEditing: boolean
}

type ConfirmType = "save" | "cancel" | "delete"

interface ConfirmConfig {
  enabled?: boolean
  title?: string
  description?: string
}

type DialogWidth = "sm" | "md" | "lg"

/** Icon key mapped to a lucide icon — extend as needed */
type DialogIconKey = "book" | "calendar" | "settings" | "users" | "file" | "star"

interface FormDialogControlledProps<T extends Element = HTMLFormElement> {
  open: boolean
  onOpenChange: (open: boolean) => void

  title: string
  description?: string

  /** Optional icon shown in the header strip. Defaults to "book". */
  icon?: DialogIconKey

  onSubmit: (e: FormEvent<T>) => void
  onDelete?: () => void
  onCancel?: () => void

  confirm?: {
    save?: ConfirmConfig
    cancel?: ConfirmConfig
    delete?: ConfirmConfig
  }

  children: ReactNode
  footer: (actions: DialogFooterActions) => ReactNode

  className?: string
  width?: DialogWidth
}

/* -------------------------------------------------------
   Icon map
------------------------------------------------------- */
const ICON_MAP: Record<DialogIconKey, React.ElementType> = {
  book: BookOpen,
  calendar: Calendar,
  settings: Settings,
  users: Users,
  file: FileText,
  star: Star,
}

/* -------------------------------------------------------
   Component
------------------------------------------------------- */
export const FormDialogControlled = <T extends Element = HTMLFormElement>({
  open,
  onOpenChange,
  title,
  description,
  icon = "book",
  onSubmit,
  onDelete,
  onCancel,
  confirm,
  children,
  footer,
  className,
  width = "sm",
  externalIsEditing,
  setExternalIsEditing,
}: FormDialogControlledProps<T> & {
  externalIsEditing: boolean
  setExternalIsEditing: (value: boolean) => void
}) => {
  const isEditing = externalIsEditing
  const setIsEditing = setExternalIsEditing

  const [confirmType, setConfirmType] = useState<ConfirmType | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const startEdit = () => setIsEditing(true)
  const stopEdit = () => setIsEditing(false)

  const handleOpenChange = (value: boolean) => {
    if (!value) setConfirmType(null)
    onOpenChange(value)
  }

  const validateForm = () => {
    if (!formRef.current) return false
    if (!formRef.current.checkValidity()) {
      formRef.current.reportValidity()
      return false
    }
    return true
  }

  const performSubmit = () => {
    if (!formRef.current) return
    onSubmit(new Event("submit") as unknown as FormEvent<T>)
    stopEdit()
    setConfirmType(null)
  }

  const openConfirm = (type: ConfirmType) => setConfirmType(type)
  const closeConfirm = () => setConfirmType(null)

  const handleConfirm = () => {
    if (confirmType === "save") performSubmit()
    if (confirmType === "delete") { onDelete?.(); closeConfirm() }
    if (confirmType === "cancel") { onCancel?.(); stopEdit(); closeConfirm() }
  }

  const widthClass =
    width === "sm" ? "sm:max-w-lg"
    : width === "md" ? "sm:max-w-xl"
    : "sm:max-w-2xl"

  const Icon = ICON_MAP[icon]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`${widthClass} ${className ?? ""} p-0 gap-0 overflow-hidden rounded-2xl`}>

        {/* ── Compact branded header strip ── */}
        <div className="relative bg-orange-500 px-6 py-4 overflow-hidden flex items-center gap-3.5">
          {/* decorative blobs */}
          <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-4 left-1/2 w-14 h-14 bg-white/10 rounded-full pointer-events-none" />

          {/* icon badge */}
          <div className="relative z-10 w-9 h-9 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="h-4.5 w-4.5 text-white h-[18px] w-[18px]" />
          </div>

          {/* text */}
          <div className="relative z-10 min-w-0">
            <h2 className="text-white font-semibold text-sm leading-tight truncate">{title}</h2>
            {description && (
              <p className="text-orange-100 text-xs mt-0.5 truncate">{description}</p>
            )}
          </div>
        </div>

        {/* ── Form body ── */}
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault()
            if (!isEditing) return
            if (!validateForm()) return
            confirm?.save?.enabled ? openConfirm("save") : performSubmit()
          }}
          className="flex flex-col"
        >
          {/* scrollable content area */}
          <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[65vh]">
            {children}
          </div>

          {/* sticky footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-white">
            <DialogFooter>
              {footer({
                requestEdit: startEdit,
                requestSave: () => {
                  if (!isEditing) return
                  if (!validateForm()) return
                  confirm?.save?.enabled ? openConfirm("save") : performSubmit()
                },
                requestCancel: () => {
                  if (!isEditing) return
                  if (confirm?.cancel?.enabled) openConfirm("cancel")
                  else stopEdit()
                },
                requestDelete: () => openConfirm("delete"),
                isEditing,
              })}
            </DialogFooter>
          </div>
        </form>

      </DialogContent>

      {/* Confirmation dialog */}
      <AlertDialog open={!!confirmType} onOpenChange={closeConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              {confirmType && confirm?.[confirmType]?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmType && confirm?.[confirmType]?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={closeConfirm}
              className="rounded-xl border-gray-200 text-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
            >
              {confirmType === "save" ? "Continue"
                : confirmType === "cancel" ? "Discard"
                : confirmType === "delete" ? "Delete"
                : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}