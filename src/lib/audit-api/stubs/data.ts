import type { AuditRun } from "@/lib/audit-api/types"
import { uxAuditScenario } from "@/components/ux-audit/data"

const now = "2026-06-11T10:30:00.000Z"

export const indigoAuditId = "7f6a86a2-2f1d-4b46-b4a2-3e7a1fd6c201"
export const retailAuditId = "b21cbf9c-8a65-47d4-9ef8-7bd2aa10d4ef"

export const stubAudits: Array<AuditRun> = [
  {
    ...uxAuditScenario,
    id: indigoAuditId,
    scenarioId: "scenario-indigo-airlines",
    status: "generated",
    createdAt: "2026-06-09T08:15:00.000Z",
    updatedAt: now,
    files: [
      { id: "e1b86e62-68f2-45cf-b1c8-f0c1c7b23a01", auditId: indigoAuditId, name: "indigo-booking-flow-audit.pdf", type: "PDF", mimeType: "application/pdf", size: "3.2 MB", status: "Indexed", uploadedAt: "2026-06-09T08:17:00.000Z", indexedChunks: 84 },
      { id: "5f68af0e-04db-4a19-8422-593f15cf48da", auditId: indigoAuditId, name: "airline-persona-research.pdf", type: "PDF", mimeType: "application/pdf", size: "1.8 MB", status: "Indexed", uploadedAt: "2026-06-09T08:18:00.000Z", indexedChunks: 42 },
      { id: "bfcd7f43-2e44-498a-846d-6b0f9b567923", auditId: indigoAuditId, name: "booking-funnel-screens.png", type: "Image", mimeType: "image/png", size: "1.1 MB", status: "Indexed", uploadedAt: "2026-06-09T08:20:00.000Z", indexedChunks: 12 },
    ],
    settings: {
      ...uxAuditScenario.config,
      auditId: indigoAuditId,
      scenarioId: "scenario-indigo-airlines",
      model: "audit-orchestrator-v1",
      temperature: 0.2,
    },
  },
  {
    ...uxAuditScenario,
    id: retailAuditId,
    scenarioId: "scenario-aurora-retail",
    client: "Aurora Retail",
    projectTitle: "Aurora Retail Checkout UX Audit",
    reportDescription: "A UX audit of ecommerce discovery, product detail confidence, cart clarity, checkout conversion, returns trust, accessibility, and loyalty prompts.",
    title: "Retail Conversion UX Audit",
    subtitle: "Guided report generation for Aurora Retail against premium ecommerce competitors.",
    status: "review",
    createdAt: "2026-06-10T09:00:00.000Z",
    updatedAt: "2026-06-11T09:45:00.000Z",
    features: [
      { label: "Screenshots indexed", active: true, color: "chart1" },
      { label: "Competitor scan", active: true, color: "chart2" },
      { label: "Checkout heuristics", active: true, color: "chart4" },
    ],
    config: {
      webSearchEnabled: true,
      maskingRules: [
        { keyword: "Aurora Retail", replacement: "Premium fashion retailer" },
        { keyword: "Cart abandonment", replacement: "Checkout completion signal" },
      ],
      files: [
        { name: "aurora-checkout-analytics.pdf", type: "PDF", size: "2.6 MB", status: "Indexed" },
        { name: "mobile-pdp-screenshots.zip", type: "Images", size: "4.4 MB", status: "Indexed" },
      ],
      screenshots: [
        { name: "Product detail page", area: "Size, delivery, returns", status: "Indexed", color: "bg-chart-1/20" },
        { name: "Cart", area: "Promotion and delivery promise", status: "Indexed", color: "bg-chart-2/20" },
        { name: "Checkout", area: "Address to payment", status: "Indexed", color: "bg-chart-4/20" },
      ],
      customInstructions: "Prioritize mobile checkout conversion, delivery promise clarity, returns trust, accessibility, and loyalty enrollment friction. Compare against Myntra, Ajio, Nykaa Fashion, and Zara.",
    },
    settings: {
      auditId: retailAuditId,
      scenarioId: "scenario-aurora-retail",
      webSearchEnabled: true,
      maskingRules: [
        { keyword: "Aurora Retail", replacement: "Premium fashion retailer" },
        { keyword: "Cart abandonment", replacement: "Checkout completion signal" },
      ],
      files: [
        { name: "aurora-checkout-analytics.pdf", type: "PDF", size: "2.6 MB", status: "Indexed" },
        { name: "mobile-pdp-screenshots.zip", type: "Images", size: "4.4 MB", status: "Indexed" },
      ],
      screenshots: [
        { name: "Product detail page", area: "Size, delivery, returns", status: "Indexed", color: "bg-chart-1/20" },
        { name: "Cart", area: "Promotion and delivery promise", status: "Indexed", color: "bg-chart-2/20" },
        { name: "Checkout", area: "Address to payment", status: "Indexed", color: "bg-chart-4/20" },
      ],
      customInstructions: "Prioritize mobile checkout conversion, delivery promise clarity, returns trust, accessibility, and loyalty enrollment friction. Compare against Myntra, Ajio, Nykaa Fashion, and Zara.",
      model: "audit-orchestrator-v1",
      temperature: 0.25,
    },
    files: [
      { id: "4ea1e443-7d07-4b80-8e27-c83ac98b7db1", auditId: retailAuditId, name: "aurora-checkout-analytics.pdf", type: "PDF", mimeType: "application/pdf", size: "2.6 MB", status: "Indexed", uploadedAt: "2026-06-10T09:05:00.000Z", indexedChunks: 67 },
      { id: "62834d97-4659-447e-8833-ec5e817f438a", auditId: retailAuditId, name: "pdp-mobile.png", type: "Image", mimeType: "image/png", size: "880 KB", status: "Indexed", uploadedAt: "2026-06-10T09:06:00.000Z", indexedChunks: 9 },
      { id: "d83be28b-9383-4e2f-a170-03ee281e6e71", auditId: retailAuditId, name: "checkout-payment.png", type: "Image", mimeType: "image/png", size: "940 KB", status: "Indexed", uploadedAt: "2026-06-10T09:07:00.000Z", indexedChunks: 11 },
    ],
    steps: uxAuditScenario.steps.map((step) => {
      if (step.id === "discovery") {
        return {
          ...step,
          title: "Commerce Discovery",
          description: "Collect funnel goals, PDP evidence, checkout screens, and competitor signals.",
          artifact: {
            type: "brief",
            title: "Checkout opportunity brief",
            summary: "Aurora has strong merchandising, but mobile checkout loses confidence around delivery promise, promo application, and returns reassurance.",
            columns: 2,
            cards: [
              { label: "Mobile conversion", value: "At risk", detail: "Payment-stage confidence drops after promotion and address edits." },
              { label: "Returns trust", value: "Medium", detail: "Return policy appears late and feels detached from PDP decisions." },
              { label: "Delivery clarity", value: "High", detail: "Date and fee expectations shift across PDP, cart, and checkout." },
              { label: "Loyalty prompt", value: "Noisy", detail: "Rewards prompts compete with completion in checkout." },
            ],
          },
        }
      }
      if (step.id === "competitor") {
        return {
          ...step,
          title: "Retail Competitors",
          description: "Benchmark Aurora against premium ecommerce checkout patterns.",
          artifact: {
            type: "featureComparison",
            title: "Retail checkout feature coverage",
            entities: ["Aurora", "Myntra", "Ajio", "Nykaa Fashion", "Zara"],
            rows: [
              { feature: "Delivery promise on PDP", cells: ["Partial", true, true, true, "Partial"] },
              { feature: "One-tap promo recovery", cells: [false, true, "Partial", true, false] },
              { feature: "Returns reassurance", cells: ["Partial", true, true, "Partial", true] },
              { feature: "Guest checkout clarity", cells: [true, "Partial", true, true, true] },
              { feature: "Accessible size selector", cells: ["Needs work", "Partial", false, "Partial", true] },
            ],
          },
        }
      }
      return step
    }),
  },
]
