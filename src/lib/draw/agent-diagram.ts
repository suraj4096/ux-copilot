import { z } from "zod"

import {
  validationFailure,
  validationOk,
  type ValidationResult,
} from "@/lib/forms/validator/result"

const allowedNodeKinds = ["start", "action", "decision", "end"] as const
export type DrawNodeKind = (typeof allowedNodeKinds)[number]

const allowedPalette = [
  "#0f766e", // teal
  "#0891b2", // cyan
  "#2563eb", // blue
  "#7c3aed", // violet
  "#db2777", // pink
  "#111827", // gray-900
] as const

function generateId(prefix: string): string {
  const uuid =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}_${uuid}`
}

const agentNodeSchema = z.object({
  id: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).max(80),
  kind: z.enum(allowedNodeKinds),
  color: z.string().trim().optional(),
})

const agentEdgeSchema = z.object({
  from: z.string().trim().min(1),
  to: z.string().trim().min(1),
  label: z.string().trim().max(40).optional(),
})

const agentDiagramSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  nodes: z.array(agentNodeSchema).min(1).max(60),
  edges: z.array(agentEdgeSchema).max(120).default([]),
})

export type NormalizedGojsDiagram = {
  nodeDataArray: Array<{ key: number; text: string; color: string; kind: DrawNodeKind }>
  linkDataArray: Array<{ key: number; from: number; to: number; text?: string }>
  modelData: { title?: string }
}

export function validateAndNormalizeDrawDiagram(
  input: unknown,
): ValidationResult<NormalizedGojsDiagram> {
  const parsed = agentDiagramSchema.safeParse(input)
  if (!parsed.success) {
    return validationFailure(
      parsed.error.issues.map((iss) => {
        const p = iss.path.length ? `${iss.path.join(".")}: ` : ""
        return `${p}${iss.message}`
      }),
    )
  }

  const raw = parsed.data

  const idToNodeId = new Map<string, string>()
  const nodes = raw.nodes.map((n) => {
    const id = n.id?.trim() ? n.id.trim() : generateId("n")
    idToNodeId.set(id, id)
    const color =
      typeof n.color === "string" && n.color.trim()
        ? n.color.trim()
        : allowedPalette[Math.abs(hashString(id)) % allowedPalette.length]
    return {
      id,
      label: n.label.trim(),
      kind: n.kind,
      color: normalizeColor(color),
    }
  })

  const ids = nodes.map((n) => n.id)
  if (new Set(ids).size !== ids.length) {
    return validationFailure(["nodes: duplicate node ids are not allowed."])
  }

  const keyById = new Map<string, number>()
  nodes.forEach((n, idx) => keyById.set(n.id, idx + 1))

  const edges = raw.edges ?? []
  const linkDataArray: NormalizedGojsDiagram["linkDataArray"] = []
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i]
    const fromKey = keyById.get(e.from)
    const toKey = keyById.get(e.to)
    if (!fromKey) {
      return validationFailure([`edges[${i}].from: unknown node id "${e.from}".`])
    }
    if (!toKey) {
      return validationFailure([`edges[${i}].to: unknown node id "${e.to}".`])
    }
    linkDataArray.push({
      key: -(i + 1),
      from: fromKey,
      to: toKey,
      text: e.label?.trim() ? e.label.trim() : undefined,
    })
  }

  const nodeDataArray: NormalizedGojsDiagram["nodeDataArray"] = nodes.map((n) => ({
    key: keyById.get(n.id)!,
    text: n.label,
    color: n.color,
    kind: n.kind,
  }))

  return validationOk({
    nodeDataArray,
    linkDataArray,
    modelData: { title: raw.title?.trim() ? raw.title.trim() : undefined },
  })
}

function normalizeColor(input: string): string {
  if (allowedPalette.includes(input as any)) return input
  return allowedPalette[0]
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return h
}

