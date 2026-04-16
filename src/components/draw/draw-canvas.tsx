"use client"

import * as React from "react"
import * as go from "gojs"
import type { ObjectData } from "gojs"
import { ReactDiagram } from "gojs-react"

function figureForKind(kind: unknown): string {
  switch (kind) {
    case "terminal":
      return "Capsule"
    case "decision":
      return "Diamond"
    case "input_output":
      return "Parallelogram"
    case "connector":
      return "Circle"
    case "document":
      return "Document"
    case "process":
    default:
      return "RoundedRectangle"
  }
}

function initDiagram() {
  const $ = go.GraphObject.make

  const diagram = $(
    go.Diagram,
    {
      "undoManager.isEnabled": true,
      layout: $(go.LayeredDigraphLayout, { direction: 0, layerSpacing: 42 }),
      "clickCreatingTool.archetypeNodeData": {
        text: "New node",
        color: "#E5E7EB",
        kind: "action",
      },
      model: $(go.GraphLinksModel, {
        linkKeyProperty: "key",
      }),
    },
  )

  diagram.nodeTemplate = $(
    go.Node,
    "Auto",
    { locationSpot: go.Spot.Center },
    $(
      go.Shape,
      "RoundedRectangle",
      {
        name: "SHAPE",
        fill: "#E5E7EB",
        stroke: "rgba(17,24,39,0.18)",
        strokeWidth: 1,
        portId: "",
        fromLinkable: true,
        toLinkable: true,
        cursor: "pointer",
      },
      new go.Binding("figure", "kind", figureForKind),
      new go.Binding("fill", "color"),
    ),
    $(
      go.TextBlock,
      {
        margin: 10,
        editable: true,
        font: "500 13px Inter, system-ui",
        stroke: "#111827",
        wrap: go.TextBlock.WrapFit,
        maxSize: new go.Size(200, NaN),
        textAlign: "center",
      },
      new go.Binding("text").makeTwoWay(),
    ),
  )

  diagram.linkTemplate = $(
    go.Link,
    { routing: go.Routing.AvoidsNodes, curve: go.Curve.JumpOver, corner: 12 },
    $(go.Shape, { stroke: "rgba(17,24,39,0.35)" }),
    $(go.Shape, {
      toArrow: "Standard",
      stroke: null,
      fill: "rgba(17,24,39,0.35)",
    }),
    $(
      go.TextBlock,
      {
        segmentOffset: new go.Point(0, -10),
        font: "500 11px Inter, system-ui",
        stroke: "rgba(17,24,39,0.8)",
      },
      new go.Binding("text", "text"),
    ),
  )

  return diagram
}

export function DrawCanvas({
  initialDiagram,
  diagramKey,
}: {
  initialDiagram: unknown | null
  diagramKey: string
}) {
  const [skipsDiagramUpdate, setSkipsDiagramUpdate] = React.useState(false)

  const [nodeDataArray, setNodeDataArray] = React.useState<Array<ObjectData>>([])
  const [linkDataArray, setLinkDataArray] = React.useState<Array<ObjectData>>([])
  const [modelData, setModelData] = React.useState<ObjectData>({})

  React.useEffect(() => {
    if (!initialDiagram || typeof initialDiagram !== "object") {
      setNodeDataArray([])
      setLinkDataArray([])
      setModelData({})
      return
    }
    const d = initialDiagram as any
    setNodeDataArray(Array.isArray(d.nodeDataArray) ? d.nodeDataArray : [])
    setLinkDataArray(Array.isArray(d.linkDataArray) ? d.linkDataArray : [])
    setModelData(d.modelData && typeof d.modelData === "object" ? d.modelData : {})
  }, [diagramKey, initialDiagram])

  const onModelChange = React.useCallback((obj: unknown) => {
    // eslint-disable-next-line no-console
    console.log("[Draw] model change", obj)
    setSkipsDiagramUpdate(true)

    const change = obj as any
    const modifiedNodeData = change?.modifiedNodeData as Array<ObjectData> | undefined
    const insertedNodeData = change?.insertedNodeData as Array<ObjectData> | undefined
    const removedNodeKeys = change?.removedNodeKeys as Array<any> | undefined
    const modifiedLinkData = change?.modifiedLinkData as Array<ObjectData> | undefined
    const insertedLinkData = change?.insertedLinkData as Array<ObjectData> | undefined
    const removedLinkKeys = change?.removedLinkKeys as Array<any> | undefined
    const nextModelData = change?.modelData as ObjectData | undefined

    if (Array.isArray(modifiedNodeData) && modifiedNodeData.length > 0) {
      setNodeDataArray((prev) => {
        const byKey = new Map(prev.map((n) => [n.key, n]))
        for (const nd of modifiedNodeData) {
          byKey.set(nd.key, { ...(byKey.get(nd.key) ?? {}), ...nd })
        }
        return Array.from(byKey.values())
      })
    }
    if (Array.isArray(insertedNodeData) && insertedNodeData.length > 0) {
      setNodeDataArray((prev) => [...prev, ...insertedNodeData])
    }
    if (Array.isArray(removedNodeKeys) && removedNodeKeys.length > 0) {
      const removed = new Set(removedNodeKeys)
      setNodeDataArray((prev) => prev.filter((n) => !removed.has(n.key)))
    }

    if (Array.isArray(modifiedLinkData) && modifiedLinkData.length > 0) {
      setLinkDataArray((prev) => {
        const byKey = new Map(prev.map((l) => [l.key, l]))
        for (const ld of modifiedLinkData) {
          byKey.set(ld.key, { ...(byKey.get(ld.key) ?? {}), ...ld })
        }
        return Array.from(byKey.values())
      })
    }
    if (Array.isArray(insertedLinkData) && insertedLinkData.length > 0) {
      setLinkDataArray((prev) => [...prev, ...insertedLinkData])
    }
    if (Array.isArray(removedLinkKeys) && removedLinkKeys.length > 0) {
      const removed = new Set(removedLinkKeys)
      setLinkDataArray((prev) => prev.filter((l) => !removed.has(l.key)))
    }

    if (nextModelData) {
      setModelData(nextModelData)
    }

    queueMicrotask(() => setSkipsDiagramUpdate(false))
  }, [])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-card">
      <ReactDiagram
        initDiagram={initDiagram}
        key={diagramKey}
        divClassName="gojs-diagram"
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
        modelData={modelData}
        onModelChange={onModelChange}
        skipsDiagramUpdate={skipsDiagramUpdate}
      />
      {nodeDataArray.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="max-w-md rounded-xl border bg-background/80 p-4 text-center text-sm text-muted-foreground shadow-sm backdrop-blur">
            No diagram loaded yet. Ask the agent in <span className="font-medium">Draw</span>{" "}
            mode to generate a user-flow diagram.
          </div>
        </div>
      ) : null}
    </div>
  )
}

