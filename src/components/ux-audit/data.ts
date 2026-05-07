export type AuditToolStatus = "complete" | "running"

export type AuditToolCall = {
  id: string
  name: string
  label: string
  input: Record<string, unknown>
  output: string
  status: AuditToolStatus
}

export type AuditChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  files?: Array<{ name: string; type: string; size: string }>
  tools?: Array<AuditToolCall>
}

export type AuditProsConsArtifact = {
  type: "prosCons"
  title: string
  positiveHeader: string
  negativeHeader: string
  positiveRows: Array<string>
  negativeRows: Array<string>
}

export type AuditFeatureComparisonArtifact = {
  type: "featureComparison"
  title: string
  entities: Array<string>
  rows: Array<{ feature: string; cells: Array<string | boolean> }>
}

export type AuditBarChartArtifact = {
  type: "barChart"
  title: string
  xKey: string
  xAxisLabel: string
  yAxisLabel: string
  series: Array<{ key: string; label: string }>
  data: Array<Record<string, string | number>>
}

export type AuditFlowDiagramArtifact = {
  type: "flowDiagram"
  title: string
  orientation: "horizontal" | "vertical"
  nodes: Array<{ id: string; label: string; kind: "data" | "decision"; tone?: "neutral" | "success" | "warning" | "error" }>
  edges: Array<{ from: string; to: string; label?: string }>
}

export type AuditPieChartArtifact = {
  type: "pieChart"
  title: string
  data: Array<{ label: string; value: number; color?: string }>
}

export type AuditArtifact =
  | AuditFlowDiagramArtifact
  | AuditProsConsArtifact
  | AuditFeatureComparisonArtifact
  | AuditBarChartArtifact
  | AuditPieChartArtifact
  | {
      type: "brief"
      title: string
      summary: string
      cards: Array<{ label: string; value: string; detail: string; tag?: string }>
    columns?: 2 | 4
    }
  | {
      type: "persona"
      title: string
      personas: Array<{
        name: string
        segment: string
        goal: string
        pain: string
        opportunity: string
      }>
    }
  | {
      type: "journey"
      title: string
      stages: Array<{ name: string; emotion: number; issue: string; fix: string }>
    }
  | {
      type: "table"
      title: string
      columns: Array<string>
      rows: Array<Array<string>>
    }
  | {
      type: "swot"
      title: string
      strengths: Array<string>
      weaknesses: Array<string>
      opportunities: Array<string>
      threats: Array<string>
    }
  | {
      type: "benchmark"
      title: string
      competitors: Array<string>
      rows: Array<{ area: string; scores: Array<number>; note: string }>
    }
  | {
      type: "risk"
      title: string
      risks: Array<{ risk: string; impact: number; likelihood: number; mitigation: string }>
    }
  | {
      type: "summary"
      title: string
      recommendations: Array<{ title: string; priority: string; impact: string }>
    }

export type AuditSlideLayout = {
  mode: "grid" | "flex"
  rows?: number
  cols?: number
  gap?: "sm" | "md" | "lg"
}

export type AuditSlideSection = {
  title?: string
  description?: string
  artifact: AuditArtifact
}

export type AuditSlide = {
  title?: string
  layout: AuditSlideLayout
  sections: Array<AuditSlideSection>
}

export type AuditStep = {
  id: string
  number: number
  title: string
  description: string
  status: "ready" | "generated" | "review"
  progress: number
  artifact: AuditArtifact
  slide?: AuditSlide
  chat: Array<AuditChatMessage>
}

function stepUser(id: string, text: string): AuditChatMessage {
  return { id, role: "user", text }
}

function stepAssistant(
  id: string,
  text: string,
  tools: Array<AuditToolCall>,
): AuditChatMessage {
  return { id, role: "assistant", text, tools }
}

export type AuditAgentConfig = {
  webSearchEnabled: boolean
  maskingRules: Array<{ keyword: string; replacement: string }>
  files: Array<{ name: string; type: string; size: string; status: string }>
  screenshots: Array<{ name: string; area: string; status: string; color: string }>
  customInstructions: string
}

export type AuditScenario = {
  client: string
  projectTitle: string
  reportDescription: string
  title: string
  subtitle: string
  features: Array<{ label: string; active: boolean; color: "chart1" | "chart2" | "chart3" | "chart4" | "chart5" }>
  config: AuditAgentConfig
  steps: Array<AuditStep>
}

const baseUser: AuditChatMessage = {
  id: "u0",
  role: "user",
  text: "Audit Indigo Airlines digital booking, check-in, and support experience. Compare against Air India Express, Akasa Air, Vistara, and SpiceJet. I’ve added the existing UX PDFs and brand research notes.",
  files: [
    { name: "indigo-booking-flow-audit.pdf", type: "PDF", size: "3.2 MB" },
    { name: "airline-persona-research.pdf", type: "PDF", size: "1.8 MB" },
    { name: "competitor-screenshots-pack.pdf", type: "PDF", size: "5.6 MB" },
  ],
}

function tool(id: string, name: string, label: string, output: string): AuditToolCall {
  return {
    id,
    name,
    label,
    status: "complete",
    input: { client: "Indigo Airlines", market: "India domestic aviation", mode: "federated_ux_audit" },
    output,
  }
}

export const uxAuditScenario: AuditScenario = {
  client: "Indigo Airlines",
  projectTitle: "Indigo Airlines UX Audit",
  reportDescription: "A federated audit report covering discovery, traveler personas, journey confidence, accessibility readiness, SWOT framing, competitor coverage, risk prioritization, and executive recommendations.",
  title: "Federated UX Audit",
  subtitle: "Guided report generation for Indigo Airlines against Indian airline competitors.",
  features: [
    { label: "Documents indexed", active: true, color: "chart1" },
    { label: "Web search", active: true, color: "chart2" },
    { label: "Custom prompt", active: true, color: "chart4" },
  ],
  config: {
    webSearchEnabled: true,
    maskingRules: [
      { keyword: "Indigo Airlines", replacement: "Big 4 Airline Company in India" },
      { keyword: "Ancillary revenue", replacement: "Commercial add-on strategy" },
      { keyword: "Domestic route share", replacement: "Market coverage signal" },
    ],
    files: [
      { name: "indigo-booking-flow-audit.pdf", type: "PDF", size: "3.2 MB", status: "Indexed" },
      { name: "airline-persona-research.pdf", type: "PDF", size: "1.8 MB", status: "Indexed" },
      { name: "competitor-screenshots-pack.pdf", type: "PDF", size: "5.6 MB", status: "Indexed" },
    ],
    screenshots: [
      { name: "Booking funnel", area: "Search to payment", status: "Indexed", color: "bg-chart-1/20" },
      { name: "Seat map", area: "Ancillary selection", status: "Indexed", color: "bg-chart-2/20" },
      { name: "Check-in flow", area: "Pre-flight task", status: "Indexed", color: "bg-chart-4/20" },
    ],
    customInstructions: "Prioritize evidence-backed findings for booking, manage booking, check-in, accessibility, and disruption support. Compare Indigo against Air India Express, Akasa Air, Vistara, and SpiceJet. Keep recommendations executive-ready and map each issue to customer impact.",
  },
  steps: [
    {
      id: "discovery",
      number: 1,
      title: "Discovery",
      description: "Collect business goal, journeys, constraints, and evidence sources.",
      status: "generated",
      progress: 100,
      artifact: {
        type: "flowDiagram",
        title: "User flow",
        orientation: "vertical",
        nodes: [
          { id: "discover", label: "Discover fares", kind: "data", tone: "neutral" },
          { id: "decide", label: "Fare confidence", kind: "decision", tone: "warning" },
          { id: "pay", label: "Pay and confirm", kind: "data", tone: "success" },
          { id: "checkin", label: "Check-in", kind: "data", tone: "success" },
        ],
        edges: [
          { from: "discover", to: "decide" },
          { from: "decide", to: "pay" },
          { from: "pay", to: "checkin" },
        ],
      },
      slide: {
        title: "User Discovery",
        layout: { mode: "grid", cols: 2, rows: 1, gap: "md" },
        sections: [
          {
            title: "User flow",
            description: "Where purchase confidence is won or lost.",
            artifact: {
              type: "flowDiagram",
              title: "User flow",
              orientation: "vertical",
              nodes: [
                { id: "discover", label: "Discover fares", kind: "data", tone: "neutral" },
                { id: "decide", label: "Fare confidence", kind: "decision", tone: "warning" },
                { id: "pay", label: "Pay and confirm", kind: "data", tone: "success" },
                { id: "checkin", label: "Check-in", kind: "data", tone: "success" },
              ],
              edges: [
                { from: "discover", to: "decide" },
                { from: "decide", to: "pay" },
                { from: "pay", to: "checkin" },
              ],
            },
          },
          {
            title: "Problems Identified",
            description: "Commercial blockers surfaced from discovery.",
            artifact: {
              type: "brief",
              title: "Problems Identified",
              summary: "• Fare and add-on decisions create avoidable hesitation.\n• Check-in guidance shifts effort to support channels.\n• Competitors are making trust feel simpler at the same price point.",
              columns: 2,
              cards: [
                { label: "Conversion leakage", value: "High", detail: "Unclear totals can interrupt purchase momentum." },
                { label: "Ancillary trust", value: "At risk", detail: "Add-ons need to feel helpful, not forced." },
                { label: "Support load", value: "Reducible", detail: "Better pre-flight clarity can deflect repeat questions." },
                { label: "Revenue upside", value: "+8–12%", detail: "Clearer decisions can lift completion and attach rate." },
              ],
            },
          },
        ],
      },
      chat: [
        baseUser,
        stepAssistant("a1", "I’ll create the audit workspace, index the uploaded evidence, enrich it with market signals, and draft the first discovery slide.", [
          tool("t1", "index_uploaded_documents", "Index Uploaded Documents", "3 PDFs parsed. Extracted booking, check-in, support, persona, and competitor screenshot evidence."),
          tool("t2", "web_search", "Search Airline UX Signals", "Collected market signals for Indigo, Air India Express, Akasa Air, Vistara, and SpiceJet."),
          tool("t3", "generate_discovery_graph", "Generate Discovery Graph", "Created source-to-insight graph with 18 evidence nodes and 6 opportunity clusters."),
        ]),
      ],
    },
    {
      id: "persona",
      number: 2,
      title: "Persona Synthesis",
      description: "Generate target traveler personas and intent clusters.",
      status: "generated",
      progress: 100,
      artifact: {
        type: "persona",
        title: "Traveler personas",
        personas: [
          { name: "Aarav", segment: "Budget business commuter", goal: "Book fast and expense cleanly", pain: "Add-ons feel interruptive when running late", opportunity: "One-screen repeat booking and invoice-first flow" },
          { name: "Meera", segment: "Family trip planner", goal: "Avoid surprises for baggage and seats", pain: "Total price confidence drops mid-flow", opportunity: "Family fare explanation and bundled seat clarity" },
          { name: "Nisha", segment: "First-time flyer", goal: "Know exactly what to do at airport", pain: "Check-in and baggage rules feel fragmented", opportunity: "Plain-language journey checklist" },
        ],
      },
      slide: {
        title: "Persona Synthesis",
        layout: { mode: "grid", cols: 1, rows: 2, gap: "md" },
        sections: [
          {
            title: "Pain points",
            artifact: {
              type: "brief",
              title: "Persona pain highlights",
              summary: "",
              columns: 4,
              cards: [
                { label: "Price anxiety", value: "", detail: "", tag: "Critical" },
                { label: "Add-on fatigue", value: "", detail: "", tag: "Medium" },
                { label: "Rule confusion", value: "", detail: "", tag: "Critical" },
                { label: "Support dependency", value: "", detail: "", tag: "Medium" },
              ],
            },
          },
          {
            title: "Evidence by traveler segment",
            description: "Persona table supporting the prioritized pain points.",
            artifact: {
              type: "persona",
              title: "Traveler personas",
              personas: [
                { name: "Aarav", segment: "Budget business commuter", goal: "Book fast and expense cleanly", pain: "Add-ons feel interruptive when running late", opportunity: "One-screen repeat booking and invoice-first flow" },
                { name: "Meera", segment: "Family trip planner", goal: "Avoid surprises for baggage and seats", pain: "Total price confidence drops mid-flow", opportunity: "Family fare explanation and bundled seat clarity" },
                { name: "Nisha", segment: "First-time flyer", goal: "Know exactly what to do at airport", pain: "Check-in and baggage rules feel fragmented", opportunity: "Plain-language journey checklist" },
              ],
            },
          },
        ],
      },
      chat: [],
    },
    {
      id: "journey",
      number: 3,
      title: "Journey Review",
      description: "Map booking, manage booking, check-in, and disruption touchpoints.",
      status: "review",
      progress: 88,
      artifact: {
        type: "barChart",
        title: "Journey confidence by stage",
        xKey: "stage",
        xAxisLabel: "Journey stage",
        yAxisLabel: "Score",
        series: [
          { key: "confidence", label: "Confidence" },
          { key: "friction", label: "Friction" },
        ],
        data: [
          { stage: "Search", confidence: 76, friction: 24 },
          { stage: "Fare", confidence: 58, friction: 42 },
          { stage: "Add-ons", confidence: 42, friction: 58 },
          { stage: "Payment", confidence: 64, friction: 36 },
          { stage: "Check-in", confidence: 69, friction: 31 },
        ],
      },
      chat: [],
    },
    {
      id: "wcag",
      number: 4,
      title: "WCAG Checks",
      description: "Run accessibility checklist against critical screens.",
      status: "generated",
      progress: 92,
      artifact: {
        type: "prosCons",
        title: "Accessibility readiness",
        positiveHeader: "Working well",
        negativeHeader: "Needs attention",
        positiveRows: [
          "Core booking forms use predictable labels and familiar field grouping",
          "Payment path has stable visual hierarchy and recognizable trust signals",
          "Check-in task structure is understandable for repeat travelers",
        ],
        negativeRows: [
          "Fare calendar states may rely heavily on color without enough text support",
          "Seat-map interactions need stronger keyboard and screen-reader affordance",
          "Error recovery should move closer to affected fields with summary anchors",
        ],
      },
      chat: [],
    },
    {
      id: "swot",
      number: 5,
      title: "SWOT Analysis",
      description: "Summarize internal UX strengths and external market threats.",
      status: "generated",
      progress: 100,
      artifact: {
        type: "swot",
        title: "Indigo digital UX SWOT",
        strengths: ["Fast utilitarian booking flow", "Strong brand recall", "Clear operational orientation", "Broad route inventory"],
        weaknesses: ["Ancillary add-ons can reduce trust", "Disruption support feels transactional", "Accessibility proof points are not visible", "Fare comparison cognitive load"],
        opportunities: ["Persona-specific booking shortcuts", "Transparent bundle education", "Accessible seat-map redesign", "AI support summaries for delays"],
        threats: ["Akasa’s warmer experience", "Vistara premium expectations", "Aggregator price comparison", "Support complaints during disruption peaks"],
      },
      chat: [],
    },
    {
      id: "competitor",
      number: 6,
      title: "Competitor Analysis",
      description: "Benchmark Indigo against similar airlines and digital patterns.",
      status: "review",
      progress: 86,
      artifact: {
        type: "featureComparison",
        title: "Competitor feature coverage",
        entities: ["Indigo", "Air India Express", "Akasa", "Vistara", "SpiceJet"],
        rows: [
          { feature: "Fast repeat booking", cells: [true, "Partial", true, "Partial", false] },
          { feature: "Transparent fare bundles", cells: ["Partial", "Partial", true, true, false] },
          { feature: "Accessible seat map", cells: ["Needs work", false, "Partial", "Partial", false] },
          { feature: "Delay recovery assistant", cells: [false, false, "Partial", true, false] },
          { feature: "Family trip guidance", cells: ["Partial", false, true, true, false] },
        ],
      },
      chat: [],
    },
    {
      id: "risk",
      number: 7,
      title: "UX Risk Matrix",
      description: "Prioritize issues by customer impact and likelihood.",
      status: "generated",
      progress: 94,
      artifact: {
        type: "pieChart",
        title: "Risk concentration by theme",
        data: [
          { label: "Price confidence", value: 34, color: "var(--chart-1)" },
          { label: "Accessibility", value: 25, color: "var(--chart-2)" },
          { label: "Disruption support", value: 23, color: "var(--chart-4)" },
          { label: "First-time flyer clarity", value: 18, color: "var(--chart-5)" },
        ],
      },
      chat: [],
    },
    {
      id: "summary",
      number: 8,
      title: "Executive Summary",
      description: "Generate final slide narrative and recommendations.",
      status: "ready",
      progress: 78,
      artifact: {
        type: "summary",
        title: "Executive recommendations",
        recommendations: [
          { title: "Make price confidence a product principle", priority: "P0", impact: "Reduce abandonment in fare and add-on stages" },
          { title: "Redesign add-ons as transparent bundles", priority: "P0", impact: "Improve trust while preserving ancillary revenue" },
          { title: "Ship accessible seat map and fare calendar", priority: "P1", impact: "Reduce compliance and usability risk" },
          { title: "Create AI-guided disruption support", priority: "P1", impact: "Differentiate during emotionally intense journeys" },
        ],
      },
      chat: [],
    },
  ],
}

const auditConversationTimeline: Array<AuditChatMessage> = [
  baseUser,
  stepAssistant("a1", "I’ll create the audit workspace, index the uploaded evidence, enrich it with market signals, and draft the first discovery slide.", [
    tool("t1", "index_uploaded_documents", "Index Uploaded Documents", "3 PDFs parsed. Extracted booking, check-in, support, persona, and competitor screenshot evidence."),
    tool("t2", "web_search", "Search Airline UX Signals", "Collected market signals for Indigo, Air India Express, Akasa Air, Vistara, and SpiceJet."),
    tool("t3", "generate_discovery_graph", "Generate Discovery Graph", "Created source-to-insight graph with 18 evidence nodes and 6 opportunity clusters."),
  ]),
  stepUser("u2", "Great. Next, synthesize the core traveler personas from the uploaded research and keep the output slide-ready."),
  stepAssistant("a2", "I found three primary traveler clusters and converted them into persona cards with goals, anxieties, and design opportunities.", [
    tool("t4", "extract_persona_signals", "Extract Persona Signals", "Found 42 persona cues across uploaded research and public review themes."),
    tool("t5", "generate_persona_cards", "Generate Persona Cards", "Created 3 primary personas with goals, anxieties, and audit implications."),
  ]),
  stepUser("u3", "Now map the booking journey and show where confidence drops during the flow."),
  stepAssistant("a3", "The biggest emotional dip appears in fare selection and add-ons. I generated a confidence-versus-friction chart for the slide.", [
    tool("t6", "generate_journey_diagram", "Generate Journey Diagram", "Mapped 5 journey stages with emotion, friction, and recommended interventions."),
  ]),
  stepUser("u4", "Run the WCAG-style checks on the critical screens and separate what works from what needs attention."),
  stepAssistant("a4", "I applied the accessibility checklist to search, fare calendar, passenger details, seat map, payment, and check-in screens.", [
    tool("t7", "run_wcag_template", "Run WCAG Template", "Checked 24 criteria. 4 priority remediation themes generated."),
    tool("t8", "generate_accessibility_table", "Generate Accessibility Table", "Created severity-ranked accessibility report table."),
  ]),
  stepUser("u5", "Turn the findings into a SWOT frame for leadership."),
  stepAssistant("a5", "The SWOT converts discovery, persona, journey, and accessibility evidence into a concise strategy frame.", [
    tool("t9", "generate_swot_matrix", "Generate SWOT Matrix", "Created 4x4 SWOT matrix connected to evidence citations."),
  ]),
  stepUser("u6", "Compare Indigo against similar Indian airline competitors and show feature coverage."),
  stepAssistant("a6", "I compared Indigo against Air India Express, Akasa Air, Vistara, and SpiceJet using a feature coverage matrix.", [
    tool("t10", "web_search", "Search Competitor UX", "Fetched competitor patterns and public digital experience signals."),
    tool("t11", "generate_benchmark_table", "Generate Benchmark Table", "Scored 5 airlines across 4 UX dimensions."),
  ]),
  stepUser("u7", "Prioritize risks by impact and likelihood so we can tell the roadmap story."),
  stepAssistant("a7", "Price confidence and disruption recovery are the strongest leadership stories. I grouped risk concentration by theme.", [
    tool("t12", "generate_risk_matrix", "Generate Risk Matrix", "Ranked 4 risks by likelihood x impact and generated mitigations."),
  ]),
  stepUser("u8", "Finalize the executive summary and assemble the report."),
  stepAssistant("a8", "I assembled the report storyline: Indigo is operationally strong, and the next UX advantage is trust, accessibility, and support confidence.", [
    tool("t13", "generate_report_slides", "Generate Report Slides", "Generated 8 executive-ready report sections from federated audit artifacts."),
  ]),
]

uxAuditScenario.steps.forEach((step, index) => {
  step.chat = auditConversationTimeline.slice(0, Math.min(auditConversationTimeline.length, 2 + index * 2))
})

export async function fetchUxAuditScenario(): Promise<AuditScenario> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return uxAuditScenario
}

export async function fetchAuditStep(stepId: string): Promise<AuditStep> {
  await new Promise((resolve) => setTimeout(resolve, 520))
  const step = uxAuditScenario.steps.find((item) => item.id === stepId)
  if (!step) throw new Error("Audit step not found")
  return step
}
