import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type ReactNode } from "react"

type Choice = string | Record<string, any>

interface ChooseProps {
  choices: Choice[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: Choice) => void
  placeholder?: string
  width?: "sm" | "md" | "lg" | "full"
  icon?: ReactNode
  labelKey?: string
}

const widthMap = {
  sm: "w-[180px]",
  md: "w-[240px]",
  lg: "w-[320px]",
  full: "w-full",
}

const getLabel = (choice: Choice, labelKey?: string) => {
  if (typeof choice === "string") return choice
  if (labelKey && choice[labelKey] !== undefined) {
    return String(choice[labelKey])
  }
  return String(Object.values(choice)[0])
}

const Choose = ({
  choices,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  width = "sm",
  icon,
  labelKey,
}: ChooseProps) => {
  if (!choices.length) return null

  // create internal values using index
  const parsed = choices.map((choice, index) => ({
    internalValue: String(index),
    label: getLabel(choice, labelKey),
    original: choice,
  }))

  const firstValue = parsed[0].internalValue
  const firstLabel = parsed[0].label

  const handleChange = (selected: string) => {
    const found = parsed.find(p => p.internalValue === selected)
    if (!found) return
    onValueChange?.(found.original)
  }

  return (
    <Select
      value={value}
      defaultValue={defaultValue ?? firstValue}
      onValueChange={handleChange}
    >
      <SelectTrigger className={widthMap[width]}>
        <SelectValue placeholder={placeholder ?? firstLabel} />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          {parsed.map(({ internalValue, label }) => (
            <SelectItem key={internalValue} value={internalValue}>
              <div className="flex items-center gap-2">
                {icon && <span className="shrink-0">{icon}</span>}
                <span>{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default Choose


