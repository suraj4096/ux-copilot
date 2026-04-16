import { z } from "zod"

import {
  validationFailure,
  validationOk,
  type ValidationResult,
} from "@/lib/forms/validator/result"

const allowedNodeKinds = [
  "terminal",
  "process",
  "decision",
  "input_output",
  "connector",
  "document",
  // legacy (accepted, normalized)
  "start",
  "end",
  "action",
] as const

export type DrawNodeKind =
  | "terminal"
  | "process"
  | "decision"
  | "input_output"
  | "connector"
  | "document"

const allowedPalette = [
  "#BBF7D0", // green (success)
  "#FECACA", // red (error)
  "#BFDBFE", // blue (neutral/system)
  "#E5E7EB", // gray (neutral/system)
  "#FDE68A", // yellow (warning/conditional)
  "#FED7AA", // orange (warning/conditional)
] as const

const allowedTones = ["success", "error", "neutral", "warning"] as const
export type DrawTone = (typeof allowedTones)[number]

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
  tone: z.enum(allowedTones).optional(),
  color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, "must be a hex color like #RRGGBB").optional(),
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
  nodeDataArray: Array<{
    key: number
    text: string
    color: string
    kind: DrawNodeKind
    tone?: DrawTone
  }>
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
    const normalizedKind = normalizeKind(n.kind, n.label)
    const fallbackColor = defaultColorForKind(normalizedKind, n.tone, id)
    const color =
      typeof n.color === "string" && n.color.trim() ? n.color.trim() : fallbackColor
    return {
      id,
      label: n.label.trim(),
      kind: normalizedKind,
      tone: n.tone,
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

  const startNode = nodes.find(
    (n) => n.kind === "terminal" && n.label.trim().toLowerCase() === "start",
  )
  const endNode = nodes.find(
    (n) => n.kind === "terminal" && n.label.trim().toLowerCase() === "end",
  )
  if (!startNode) {
    return validationFailure([
      `nodes: must include a terminal node labeled "Start".`,
    ])
  }
  if (!endNode) {
    return validationFailure([`nodes: must include a terminal node labeled "End".`])
  }

  const outgoingById = new Map<string, Array<{ label?: string }>>()
  for (const e of edges) {
    const arr = outgoingById.get(e.from) ?? []
    arr.push({ label: e.label })
    outgoingById.set(e.from, arr)
  }
  for (const n of nodes) {
    if (n.kind !== "decision") continue
    const outgoing = outgoingById.get(n.id) ?? []
    if (outgoing.length < 2) {
      return validationFailure([
        `decision "${n.label}": must have at least two outgoing edges.`,
      ])
    }
    const unlabeled = outgoing.find((o) => !(o.label && o.label.trim()))
    if (unlabeled) {
      return validationFailure([
        `decision "${n.label}": every outgoing edge must have a label (e.g. Yes/No).`,
      ])
    }
  }

  const nodeDataArray: NormalizedGojsDiagram["nodeDataArray"] = nodes.map((n) => ({
    key: keyById.get(n.id)!,
    text: n.label,
    color: n.color,
    kind: n.kind,
    tone: n.tone,
  }))

  return validationOk({
    nodeDataArray,
    linkDataArray,
    modelData: { title: raw.title?.trim() ? raw.title.trim() : undefined },
  })
}

function normalizeColor(input: string): string {
  if (allowedPalette.includes(input as any)) return input
  if (/^#[0-9A-Fa-f]{6}$/.test(input)) return input
  return "#E5E7EB"
}

function normalizeKind(rawKind: string, label: string): DrawNodeKind {
  if (rawKind === "start" || rawKind === "end") return "terminal"
  if (rawKind === "action") return "process"
  if (rawKind === "terminal") return "terminal"
  if (rawKind === "process") return "process"
  if (rawKind === "decision") return "decision"
  if (rawKind === "input_output") return "input_output"
  if (rawKind === "connector") return "connector"
  if (rawKind === "document") return "document"
  const l = label.trim().toLowerCase()
  if (l === "start" || l === "end") return "terminal"
  return "process"
}

function defaultColorForKind(
  kind: DrawNodeKind,
  tone: DrawTone | undefined,
  seed: string,
): string {
  if (tone) {
    switch (tone) {
      case "success":
        return "#BBF7D0"
      case "error":
        return "#FECACA"
      case "warning":
        return "#FDE68A"
      case "neutral":
        return "#BFDBFE"
    }
  }

  switch (kind) {
    case "terminal":
      return "#E5E7EB"
    case "decision":
      return "#FDE68A"
    case "input_output":
      return "#BFDBFE"
    case "document":
      return "#E5E7EB"
    case "connector":
      return "#E5E7EB"
    case "process":
      return allowedPalette[Math.abs(hashString(seed)) % allowedPalette.length]
  }
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return h
}

