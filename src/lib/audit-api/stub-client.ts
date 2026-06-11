import type { AuditApi, AuditFileRecord, AuditSettings } from "@/lib/audit-api/types"
import { stubAudits } from "@/lib/audit-api/stubs/data"

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

function findAudit(id: string) {
  const audit = stubAudits.find((item) => item.id === id)
  if (!audit) throw new Error("Audit not found")
  return audit
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export const stubAuditApi: AuditApi = {
  async listAudits() {
    await delay()
    return stubAudits.map((audit) => ({
      id: audit.id,
      client: audit.client,
      projectTitle: audit.projectTitle,
      title: audit.title,
      status: audit.status,
      updatedAt: audit.updatedAt,
      createdAt: audit.createdAt,
      fileCount: audit.files.length,
      stepCount: audit.steps.length,
      completedSteps: audit.steps.filter((step) => step.status === "generated").length,
      description: audit.reportDescription,
    }))
  },

  async getAudit(id) {
    await delay()
    return findAudit(id)
  },

  async getAuditFiles(id) {
    await delay()
    return findAudit(id).files
  },

  async getAuditSettings(id) {
    await delay()
    return findAudit(id).settings
  },

  async updateAuditSettings(id, input) {
    await delay(250)
    const audit = findAudit(id)
    audit.settings = { ...audit.settings, ...input } as AuditSettings
    audit.config = audit.settings
    audit.updatedAt = new Date().toISOString()
    return audit.settings
  },

  async uploadAuditFiles(id, files) {
    await delay(500)
    const audit = findAudit(id)
    const records: Array<AuditFileRecord> = files.map((file) => ({
      id: crypto.randomUUID(),
      auditId: id,
      name: file.name,
      type: file.type === "application/pdf" ? "PDF" : "Image",
      mimeType: file.type,
      size: formatBytes(file.size),
      status: "Indexed",
      uploadedAt: new Date().toISOString(),
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      indexedChunks: Math.max(4, Math.round(file.size / 75_000)),
    }))
    audit.files = [...records, ...audit.files]
    audit.updatedAt = new Date().toISOString()
    return records
  },
}
