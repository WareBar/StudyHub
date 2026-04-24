import {
  type ReactNode,
  type FormEvent,
  useState,
  useRef,
} from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

/* -------------------------------------------------------
   Types
------------------------------------------------------- */

/**
 * Actions exposed to the footer renderer.
 * Parent decides which buttons to show based on isEditing.
 */
type DialogFooterActions = {
  requestEdit: () => void
  requestSave: () => void
  requestCancel: () => void
  requestDelete: () => void
  isEditing: boolean
}

/** Types of confirmation dialogs */
type ConfirmType = "save" | "cancel" | "delete"

/** Configuration for confirmation dialogs */
interface ConfirmConfig {
  enabled?: boolean
  title?: string
  description?: string
}

/** Dialog width presets */
type DialogWidth = "sm" | "md" | "lg"

/**
 * Controlled form dialog props.
 * Editing state is handled internally.
 */
interface FormDialogControlledProps<
  T extends Element = HTMLFormElement
> {
  open: boolean
  onOpenChange: (open: boolean) => void

  title: string
  description?: string

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
   Component
------------------------------------------------------- */

export const FormDialogControlled = <
  T extends Element = HTMLFormElement
>({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  onDelete,
  onCancel,
  confirm,
  children,
  footer,
  className,
  width = "sm",

  // EXTERNAL editing state
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
    if (!value) setConfirmType(null) // reset confirm
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
    if (confirmType === "delete") {
      onDelete?.()
      closeConfirm()
    }
    if (confirmType === "cancel") {
      onCancel?.()
      stopEdit() // now stopEdit only happens after confirming cancel
      closeConfirm()
    }
  }

  const widthClass =
    width === "sm"
      ? "sm:max-w-lg"
      : width === "md"
      ? "sm:max-w-xl"
      : "sm:max-w-2xl"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`${widthClass} ${className ?? ""}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault()
            if (!isEditing) return
            if (!validateForm()) return
            confirm?.save?.enabled ? openConfirm("save") : performSubmit()
          }}
          className="space-y-4"
        >
          {children}

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
        </form>
      </DialogContent>

      {/* Confirmation dialog */}
      <AlertDialog open={!!confirmType} onOpenChange={closeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmType && confirm?.[confirmType]?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmType && confirm?.[confirmType]?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            {/* just closes the AlertDialog */}
            <AlertDialogCancel onClick={closeConfirm}>Cancel</AlertDialogCancel>
            
            {/* confirms the action */}
            <AlertDialogAction onClick={handleConfirm}>
              {confirmType === "save"
                ? "Continue"
                : confirmType === "cancel"
                ? "Discard"
                : confirmType === "delete"
                ? "Delete"
                : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Dialog>
  )
}



// USAGE EXAMPLE
// function ProfileDialogExample() {
//   const [open, setOpen] = useState(false)
//   const [isEditing, setIsEditing] = useState(false)

//   const handleSubmit = () => {
//     console.log("Saving data...")
//   }

//   const handleDelete = () => {
//     console.log("Deleting record...")
//   }

//   const handleCancel = () => {
//     console.log("Cancelled editing")
//   }

//   return (
//     <>
//       <button onClick={() => setOpen(true)}>Open Profile</button>

//       <FormDialogControlled
//         open={open}
//         onOpenChange={setOpen}
//         title="Profile"
//         description="Manage your profile information"

//         onSubmit={handleSubmit}
//         onDelete={handleDelete}
//         onCancel={handleCancel}

//         externalIsEditing={isEditing}
//         setExternalIsEditing={setIsEditing}

//         confirm={{
//           save: {
//             enabled: true,
//             title: "Save changes?",
//             description: "Your profile changes will be saved."
//           },
//           cancel: {
//             enabled: true,
//             title: "Discard changes?",
//             description: "All unsaved changes will be lost."
//           },
//           delete: {
//             enabled: true,
//             title: "Delete profile?",
//             description: "This action cannot be undone."
//           }
//         }}

//         footer={({ requestEdit, requestSave, requestCancel, requestDelete, isEditing }) => (
//           <>
//             {!isEditing && (
//               <>
//                 <button type="button" onClick={requestEdit}>
//                   Edit
//                 </button>

//                 <button type="button" onClick={requestDelete}>
//                   Delete
//                 </button>
//               </>
//             )}

//             {isEditing && (
//               <>
//                 <button type="button" onClick={requestCancel}>
//                   Cancel
//                 </button>

//                 <button type="button" onClick={requestSave}>
//                   Save
//                 </button>
//               </>
//             )}
//           </>
//         )}
//       >
//         {/* FORM CONTENT */}
//         <input
//           name="name"
//           placeholder="Name"
//           required
//           className="border p-2 w-full"
//         />

//         <input
//           name="email"
//           placeholder="Email"
//           type="email"
//           required
//           className="border p-2 w-full"
//         />
//       </FormDialogControlled>
//     </>
//   )
// }