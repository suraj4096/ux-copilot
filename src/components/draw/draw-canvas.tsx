"use client"

import * as React from "react"
import * as go from "gojs"
import type { ObjectData } from "gojs"
import { ReactDiagram } from "gojs-react"

function initDiagram() {
  const $ = go.GraphObject.make

  const diagram = $(
    go.Diagram,
    {
      "undoManager.isEnabled": true,
      layout: $(go.LayeredDigraphLayout, { direction: 0, layerSpacing: 42 }),
      "clickCreatingTool.archetypeNodeData": {
        text: "New node",
        color: "oklch(0.97 0 0)",
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
        fill: "white",
        stroke: "rgba(0,0,0,0.15)",
        strokeWidth: 1,
        portId: "",
        fromLinkable: true,
        toLinkable: true,
        cursor: "pointer",
      },
      new go.Binding("fill", "color"),
    ),
    $(
      go.TextBlock,
      { margin: 10, editable: true, font: "500 13px Inter, system-ui" },
      new go.Binding("text").makeTwoWay(),
    ),
  )

  diagram.linkTemplate = $(
    go.Link,
    { routing: go.Routing.AvoidsNodes, curve: go.Curve.JumpOver },
    $(go.Shape, { stroke: "rgba(0,0,0,0.35)" }),
    $(go.Shape, { toArrow: "Standard", stroke: null, fill: "rgba(0,0,0,0.35)" }),
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

  React.useEffect(() => {
    if (!initialDiagram || typeof initialDiagram !== "object") return
    const d = initialDiagram as any
    if (Array.isArray(d.nodeDataArray)) setNodeDataArray(d.nodeDataArray)
    if (Array.isArray(d.linkDataArray)) setLinkDataArray(d.linkDataArray)
    if (d.modelData && typeof d.modelData === "object") setModelData(d.modelData)
  }, [diagramKey, initialDiagram])

  const [nodeDataArray, setNodeDataArray] = React.useState<Array<ObjectData>>([
    { key: 0, text: "Idea", color: "oklch(0.97 0 0)", loc: "0 0" },
    { key: 1, text: "Flow", color: "oklch(0.97 0 0)", loc: "180 0" },
    { key: 2, text: "UI", color: "oklch(0.97 0 0)", loc: "0 140" },
    { key: 3, text: "Ship", color: "oklch(0.97 0 0)", loc: "180 140" },
  ])

  const [linkDataArray, setLinkDataArray] = React.useState<Array<ObjectData>>([
    { key: -1, from: 0, to: 1 },
    { key: -2, from: 0, to: 2 },
    { key: -3, from: 2, to: 3 },
  ])

  const [modelData, setModelData] = React.useState<ObjectData>({
    canRelink: true,
  })

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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card">
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
    </div>
  )
}

