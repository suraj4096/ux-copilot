import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"

import { FormBuilder } from "@/components/forms/form-builder"
import { FormBuilderProvider, useFormBuilder } from "@/components/forms/form-builder-context"
import { FormRenderer } from "@/components/forms/form-renderer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <FormBuilderProvider>
      <FormKitPage />
    </FormBuilderProvider>
  )
}

function FormKitPage() {
  const [activeTab, setActiveTab] = React.useState("edit")
  const [saveCount, setSaveCount] = React.useState(0)
  const [savedFormId, setSavedFormId] = React.useState<string | null>(null)

  const { values, actions } = useFormBuilder()
  const formJson = values

  function onSave() {
    setSaveCount((c) => c + 1)
    setSavedFormId(formJson.id)
  }

  function onDiscard() {
    actions.reset()
    setActiveTab("edit")
    setSaveCount(0)
    setSavedFormId(null)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-24">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-base font-medium">FormKit</div>
          <div className="truncate text-sm text-muted-foreground">
            Build a form from JSON, then preview how it renders.
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="min-h-0 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="edit" className="h-full">
            <FormBuilder />
          </TabsContent>
          <TabsContent value="preview" className="h-full">
            <div className="mx-auto w-full max-w-2xl">
              <FormRenderer form={formJson} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-50">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border bg-background/80 p-2 shadow-sm backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
          <Separator orientation="vertical" className="h-8" />
          <div className="hidden text-sm text-muted-foreground md:block">
            {saveCount > 0 ? `Saved ${saveCount}x (dummy)` : "Not saved"}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onDiscard}>
              Discard
            </Button>
            <Button onClick={onSave}>Save</Button>
          </div>
          <div className="sr-only">{savedFormId ?? ""}</div>
        </div>
      </div>
    </div>
  )
}
