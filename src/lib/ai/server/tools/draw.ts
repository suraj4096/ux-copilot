import { tool } from "ai"
import { z } from "zod"

import { validateAndNormalizeDrawDiagram } from "@/lib/draw/agent-diagram"

export const drawToolNames = ["validate_draw_json", "open_draw_editor"] as const

export function createDrawTools(_ownerEmail: string) {
  return {
    validate_draw_json: tool({
      description:
        "Validate and normalize a draw diagram draft. Input must be a JSON object (not YAML). Do NOT include GoJS keys/positions; just provide a DSL with nodes/edges. Returns a GoJS-ready model if ok: true.",
      inputSchema: z.object({ payload: z.unknown() }),
      execute: ({ payload }) => {
        const parsed = validateAndNormalizeDrawDiagram(payload)
        if (!parsed.ok) return { ok: false as const, errors: parsed.errors }
        return { ok: true as const, diagram: parsed.value }
      },
    }),

    open_draw_editor: tool({
      description:
        "Open the draw screen and stage a validated diagram. Input must be a JSON object (not YAML). Always call validate_draw_json first; pass the same payload here.",
      inputSchema: z.object({ payload: z.unknown() }),
      execute: ({ payload }) => {
        const parsed = validateAndNormalizeDrawDiagram(payload)
        if (!parsed.ok) {
          return { ok: false as const, errors: parsed.errors }
        }
        return { ok: true as const, stagedDiagram: parsed.value }
      },
    }),
  }
}

