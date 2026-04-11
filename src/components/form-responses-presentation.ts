import {
  AlignJustify,
  CircleDot,
  Hash,
  ListChecks,
  
  TextCursor
} from "lucide-react"
import type {LucideIcon} from "lucide-react";

import type { FormQuestion } from "@/lib/forms/types"

export function questionColumnPreset(question: FormQuestion): {
  widthClass: string
  cellWidthClass: string
  typeLabel: string
  Icon: LucideIcon
} {
  switch (question.type) {
    case "number":
      return {
        widthClass: "w-24 min-w-24 max-w-28",
        cellWidthClass: "w-24 min-w-24 max-w-28",
        typeLabel: "Number",
        Icon: Hash,
      }
    case "single_choice":
      return {
        widthClass: "w-28 min-w-28 max-w-32",
        cellWidthClass: "w-28 min-w-28 max-w-32",
        typeLabel: "Single choice",
        Icon: CircleDot,
      }
    case "multi_choice":
      return {
        widthClass: "w-32 min-w-32 max-w-36",
        cellWidthClass: "w-32 min-w-32 max-w-36",
        typeLabel: "Multiple choice",
        Icon: ListChecks,
      }
    case "short_text":
      return {
        widthClass: "w-40 min-w-36 max-w-52",
        cellWidthClass: "w-40 min-w-36 max-w-52",
        typeLabel: "Short text",
        Icon: TextCursor,
      }
    case "long_text":
      return {
        widthClass: "min-w-48 w-[1%]",
        cellWidthClass: "min-w-48 w-[1%]",
        typeLabel: "Long text",
        Icon: AlignJustify,
      }
    default:
      return {
        widthClass: "min-w-32 w-[1%]",
        cellWidthClass: "min-w-32 w-[1%]",
        typeLabel: "Question",
        Icon: TextCursor,
      }
  }
}
