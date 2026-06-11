import type { AuditApi } from "@/lib/audit-api/types"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/audits${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })
  if (!response.ok) throw new Error(`Audit API failed: ${response.status}`)
  return response.json() as Promise<T>
}

export const realAuditApi: AuditApi = {
  listAudits: () => request(""),
  getAudit: (id) => request(`/${id}`),
  getAuditFiles: (id) => request(`/${id}/files`),
  getAuditSettings: (id) => request(`/${id}/settings`),
  updateAuditSettings: (id, input) => request(`/${id}/settings`, { method: "PATCH", body: JSON.stringify(input) }),
  async uploadAuditFiles(id, files) {
    const form = new FormData()
    files.forEach((file) => form.append("files", file))
    const response = await fetch(`/api/audits/${id}/files`, { method: "POST", body: form })
    if (!response.ok) throw new Error(`Audit upload failed: ${response.status}`)
    return response.json()
  },
}
