import { AUDIT_API_MODE } from "@/lib/audit-api/config"
import { realAuditApi } from "@/lib/audit-api/real-client"
import { stubAuditApi } from "@/lib/audit-api/stub-client"

export const auditApi = AUDIT_API_MODE === "stub" ? stubAuditApi : realAuditApi
export type * from "@/lib/audit-api/types"
