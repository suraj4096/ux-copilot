"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import type { VariantProps } from "class-variance-authority"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSurveyFn } from "@/lib/data.functions"
import { surveyDetailSearchDefaults } from "@/lib/router-search-defaults"
import { cn } from "@/lib/utils"

type ButtonVariantProps = VariantProps<typeof buttonVariants>

export function NewSurveyDialog({
  children,
  triggerVariant = "default",
  triggerSize = "default",
  triggerClassName,
}: {
  children: React.ReactNode
  triggerVariant?: ButtonVariantProps["variant"]
  triggerSize?: ButtonVariantProps["size"]
  triggerClassName?: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createSurvey = useServerFn(createSurveyFn)
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")

  const createMutation = useMutation({
    mutationFn: async (nextTitle: string) => {
      const res = await createSurvey({ data: { title: nextTitle } })
      if (!res.ok) throw new Error(res.errors.join(" "))
      return res
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["surveys", "list"] })
      setOpen(false)
      setTitle("")
      await navigate({
        to: "/surveys/$surveyId",
        params: { surveyId: res.survey.id },
        search: surveyDetailSearchDefaults,
      })
    },
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    createMutation.mutate(title)
  }

  const error =
    createMutation.isError && createMutation.error instanceof Error
      ? createMutation.error.message
      : null

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        className={cn(triggerClassName)}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>New survey</DialogTitle>
            <DialogDescription>
              Give your survey a title. You can add forms after it is created.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="survey-title">Title</Label>
              <Input
                id="survey-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Customer feedback"
                required
                autoComplete="off"
              />
            </div>
            {error ? (
              <div className="text-sm text-destructive" role="alert">
                {error}
              </div>
            ) : null}
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
