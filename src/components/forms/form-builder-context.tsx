"use client"

import * as React from "react"
import {
  useForm,
  useStore,
  type ReactFormExtendedApi,
} from "@tanstack/react-form"

import type { BuilderFormValues } from "@/lib/forms/builder-types"
import { createEmptyForm, createQuestion } from "@/lib/forms/defaults"
import type { FormQuestionType } from "@/lib/forms/types"

type FormBuilderActions = {
  reset: () => void
  addQuestion: (type: FormQuestionType) => void
  insertQuestion: (index: number, type: FormQuestionType) => void
  moveQuestion: (fromIndex: number, toIndex: number) => void
  removeQuestionAtIndex: (index: number) => void
  removeQuestionById: (questionId: string) => void
  setQuestions: (next: BuilderFormValues["questions"]) => void
}

type FormBuilderContextValue = {
  formApi: ReactFormExtendedApi<
    BuilderFormValues,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
  values: BuilderFormValues
  actions: FormBuilderActions
}

const FormBuilderContext = React.createContext<FormBuilderContextValue | null>(
  null
)

export function FormBuilderProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const initialValues = React.useMemo(() => createEmptyForm(), [])

  const formApi = useForm<
    BuilderFormValues,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >({
    defaultValues: initialValues,
    onSubmit: async () => {},
  })

  const values = useStore(formApi.store, (state) => state.values)

  const setQuestions = React.useCallback(
    (next: BuilderFormValues["questions"]) => {
      ;(formApi as any).setFieldValue("questions", () => next)
    },
    [formApi]
  )

  const reset = React.useCallback(() => {
    formApi.reset(createEmptyForm())
  }, [formApi])

  const addQuestion = React.useCallback(
    (type: FormQuestionType) => {
      formApi.pushFieldValue("questions", createQuestion(type))
    },
    [formApi]
  )

  const insertQuestion = React.useCallback(
    (index: number, type: FormQuestionType) => {
      ;(formApi as any).setFieldValue("questions", (prev: any[]) => {
        const list = Array.isArray(prev) ? prev : []
        return [
          ...list.slice(0, index),
          createQuestion(type),
          ...list.slice(index),
        ]
      })
    },
    [formApi]
  )

  const moveQuestion = React.useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return
      ;(formApi as any).setFieldValue("questions", (prev: any[]) => {
        const list = Array.isArray(prev) ? [...prev] : []
        const [moved] = list.splice(fromIndex, 1)
        list.splice(toIndex, 0, moved)
        return list
      })
    },
    [formApi]
  )

  const removeQuestionAtIndex = React.useCallback(
    (index: number) => {
      ;(formApi as any).setFieldValue("questions", (prev: any[]) =>
        Array.isArray(prev) ? prev.filter((_, i) => i !== index) : prev
      )
    },
    [formApi]
  )

  const removeQuestionById = React.useCallback(
    (questionId: string) => {
      ;(formApi as any).setFieldValue("questions", (prev: any[]) =>
        Array.isArray(prev) ? prev.filter((q) => q?.id !== questionId) : prev
      )
    },
    [formApi]
  )

  const actions = React.useMemo<FormBuilderActions>(
    () => ({
      reset,
      addQuestion,
      insertQuestion,
      moveQuestion,
      removeQuestionAtIndex,
      removeQuestionById,
      setQuestions,
    }),
    [
      reset,
      addQuestion,
      insertQuestion,
      moveQuestion,
      removeQuestionAtIndex,
      removeQuestionById,
      setQuestions,
    ]
  )

  const ctx: FormBuilderContextValue = React.useMemo(
    () => ({ formApi, values, actions }),
    [formApi, values, actions]
  )

  return (
    <FormBuilderContext.Provider value={ctx}>
      {children}
    </FormBuilderContext.Provider>
  )
}

export function useFormBuilder() {
  const ctx = React.useContext(FormBuilderContext)
  if (!ctx) {
    throw new Error("useFormBuilder must be used within FormBuilderProvider.")
  }
  return ctx
}

