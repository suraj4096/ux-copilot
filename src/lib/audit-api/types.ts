import type { AuditAgentConfig, AuditScenario, AuditStep } from "@/components/ux-audit/data"

export type AuditRunStatus = "draft" | "indexing" | "running" | "generated" | "review"

export type AuditFileRecord = {
  id: string
  auditId: string
  name: string
  type: "PDF" | "Image"
  mimeType: string
  size: string
  status: "Uploaded" | "Indexing" | "Indexed" | "Failed"
  uploadedAt: string
  previewUrl?: string
  indexedChunks?: number
}

export type AuditSummary = {
  id: string
  client: string
  projectTitle: string
  title: string
  status: AuditRunStatus
  updatedAt: string
  createdAt: string
  fileCount: number
  stepCount: number
  completedSteps: number
  description: string
}

export type AuditSettings = AuditAgentConfig & {
  auditId: string
  scenarioId: string
  model: string
  temperature: number
}

export type AuditRun = AuditScenario & {
  id: string
  scenarioId: string
  status: AuditRunStatus
  createdAt: string
  updatedAt: string
  files: Array<AuditFileRecord>
  settings: AuditSettings
  steps: Array<AuditStep>
}

export type AuditApi = {
  listAudits: () => Promise<Array<AuditSummary>>
  getAudit: (id: string) => Promise<AuditRun>
  getAuditFiles: (id: string) => Promise<Array<AuditFileRecord>>
  getAuditSettings: (id: string) => Promise<AuditSettings>
  updateAuditSettings: (id: string, input: Partial<AuditSettings>) => Promise<AuditSettings>
  uploadAuditFiles: (id: string, files: Array<File>) => Promise<Array<AuditFileRecord>>
}
