"use client"

import * as React from "react"
import {
  AlignLeftIcon,
  ArrowDownUpIcon,
  CheckSquareIcon,
  CircleDotIcon,
  GripVerticalIcon,
  HashIcon,
  PlusIcon,
  TextCursorInputIcon,
  TrashIcon,
} from "lucide-react"
import { useDrag, useDragLayer, useDrop } from "react-dnd"
import { getEmptyImage } from "react-dnd-html5-backend"

import type { FormQuestionType } from "@/lib/forms/types"
import { cn } from "@/lib/utils"
import { useFormBuilder } from "@/components/forms/form-builder-context"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

const DND_TYPES = {
  newFormItem: "form/new-item",
  formQuestion: "form/question",
} as const

type NewFormItemDrag = { kind: "new"; questionType: FormQuestionType }
type FormQuestionDrag = { kind: "question"; questionId: string; index: number }

const addQuestionOptions: Array<{
  type: FormQuestionType
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { type: "short_text", label: "Short Text", icon: TextCursorInputIcon },
  { type: "long_text", label: "Long Text", icon: AlignLeftIcon },
  { type: "number", label: "Number", icon: HashIcon },
  { type: "single_choice", label: "Single Choice", icon: CircleDotIcon },
  { type: "multi_choice", label: "Multi Choice", icon: CheckSquareIcon },
]

function getQuestionMeta(type: FormQuestionType) {
  const meta = addQuestionOptions.find((o) => o.type === type)
  return {
    label: meta?.label ?? type,
    icon: meta?.icon ?? TextCursorInputIcon,
  }
}

function questionTypeLabel(type: FormQuestionType) {
  return addQuestionOptions.find((o) => o.type === type)?.label ?? type
}

export function FormBuilder({ className }: { className?: string }) {
  const { formApi, values, actions } = useFormBuilder()

  return (
    <div className={cn("grid gap-4 md:grid-cols-[16rem_1fr]", className)}>
      <FormBuilderDragLayer questions={values.questions} />
      <aside className="rounded-lg border bg-card p-3 text-card-foreground">
        <div className="text-sm font-medium">Add form items</div>
        <SidebarWithDeleteOverlay
          onRemoveQuestion={actions.removeQuestionById}
          className="mt-3"
        >
          <div className="flex flex-col gap-2">
            {addQuestionOptions.map((opt) => (
              <AddFormItemButton
                key={opt.type}
                icon={opt.icon}
                label={opt.label}
                questionType={opt.type}
                onClick={() => actions.addQuestion(opt.type)}
              />
            ))}
          </div>
        </SidebarWithDeleteOverlay>
      </aside>

      <section className="flex min-w-0 flex-col gap-4">
        <div className="mx-auto w-full max-w-2xl space-y-4">
          <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <div className="grid gap-3">
            <formApi.Field name="title">
              {(field: any) => (
                <div className="grid gap-1.5">
                  <Label htmlFor={field.name}>Title</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={String(field.state.value ?? "")}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              )}
            </formApi.Field>

            <formApi.Field name="description">
              {(field: any) => (
                <div className="grid gap-1.5">
                  <Label htmlFor={field.name}>Description</Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={String(field.state.value ?? "")}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </formApi.Field>
          </div>
          </div>

          <div className="flex flex-col gap-3">
            <FormCanvas
              formApi={formApi}
              questions={values.questions}
              removeQuestionAtIndex={actions.removeQuestionAtIndex}
              onAddQuestion={actions.addQuestion}
              onInsertQuestion={actions.insertQuestion}
              onMoveQuestion={actions.moveQuestion}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FormCanvas({
  formApi,
  questions,
  removeQuestionAtIndex,
  onAddQuestion,
  onInsertQuestion,
  onMoveQuestion,
}: {
  formApi: any
  questions: any[]
  removeQuestionAtIndex: (index: number) => void
  onAddQuestion: (type: FormQuestionType) => void
  onInsertQuestion: (index: number, type: FormQuestionType) => void
  onMoveQuestion: (fromIndex: number, toIndex: number) => void
}) {
  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: DND_TYPES.newFormItem,
      drop: (item: NewFormItemDrag, monitor) => {
        if (monitor.didDrop()) return
        onAddQuestion(item.questionType)
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onAddQuestion]
  )

  function moveQuestion(dragIndex: number, hoverIndex: number) {
    onMoveQuestion(dragIndex, hoverIndex)
  }

  function insertQuestion(atIndex: number, type: FormQuestionType) {
    onInsertQuestion(atIndex, type)
  }

  return (
    <div
      ref={dropRef as any}
      className={cn(
        "flex flex-col gap-3 rounded-lg",
        canDrop && "outline-2 outline-offset-4 outline-ring/30",
        isOver && "outline-ring/60"
      )}
    >
      {questions.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
          Drag a form item here, or click an item on the left to add it.
        </div>
      ) : null}

      {questions.map((q: any, index: number) => {
        const type = q?.type as FormQuestionType
        const labelFieldName = `questions[${index}].label`
        const placeholderFieldName = `questions[${index}].placeholder`
        const minFieldName = `questions[${index}].min`
        const maxFieldName = `questions[${index}].max`
        const requiredFieldName = `questions[${index}].required`
        const optionsFieldName = `questions[${index}].options`

        return (
          <QuestionCard
            key={q?.id ?? index}
            questionId={String(q?.id ?? index)}
            index={index}
            moveQuestion={moveQuestion}
            insertQuestion={insertQuestion}
            className="rounded-lg border bg-card p-4 text-card-foreground"
          >
            {({ dragRef }) => (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                    <span
                      ref={dragRef as any}
                      className="inline-flex shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
                      aria-label="Drag to reorder"
                    >
                      <GripVerticalIcon className="shrink-0" />
                    </span>
                    <span className="truncate">{questionTypeLabel(type)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeQuestionAtIndex(index)}
                    aria-label="Remove question"
                  >
                    <TrashIcon />
                  </Button>
                </div>

                <Separator className="my-3" />

                <div className="grid gap-3">
                  <formApi.Field name={labelFieldName as any}>
                    {(labelField: any) => (
                      <div className="grid gap-1.5">
                        <Label htmlFor={labelField.name}>Question</Label>
                        <Input
                          id={labelField.name}
                          name={labelField.name}
                          value={String(labelField.state.value ?? "")}
                          onBlur={labelField.handleBlur}
                          onChange={(e) => labelField.handleChange(e.target.value)}
                          autoComplete="off"
                        />
                      </div>
                    )}
                  </formApi.Field>

                  {type === "short_text" ||
                  type === "long_text" ||
                  type === "number" ? (
                    <formApi.Field name={placeholderFieldName as any}>
                      {(placeholderField: any) => (
                        <div className="grid gap-1.5">
                          <Label htmlFor={placeholderField.name}>Placeholder</Label>
                          <Input
                            id={placeholderField.name}
                            name={placeholderField.name}
                            value={String(placeholderField.state.value ?? "")}
                            onBlur={placeholderField.handleBlur}
                            onChange={(e) =>
                              placeholderField.handleChange(e.target.value)
                            }
                            autoComplete="off"
                          />
                        </div>
                      )}
                    </formApi.Field>
                  ) : null}

                  {type === "number" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <formApi.Field name={minFieldName as any}>
                        {(minField: any) => (
                          <div className="grid gap-1.5">
                            <Label htmlFor={minField.name}>Min</Label>
                            <Input
                              id={minField.name}
                              name={minField.name}
                              type="number"
                              value={
                                minField.state.value == null
                                  ? ""
                                  : String(minField.state.value)
                              }
                              onBlur={minField.handleBlur}
                              onChange={(e) => {
                                const raw = e.target.value
                                minField.handleChange(
                                  raw === "" ? undefined : Number(raw)
                                )
                              }}
                            />
                          </div>
                        )}
                      </formApi.Field>
                      <formApi.Field name={maxFieldName as any}>
                        {(maxField: any) => (
                          <div className="grid gap-1.5">
                            <Label htmlFor={maxField.name}>Max</Label>
                            <Input
                              id={maxField.name}
                              name={maxField.name}
                              type="number"
                              value={
                                maxField.state.value == null
                                  ? ""
                                  : String(maxField.state.value)
                              }
                              onBlur={maxField.handleBlur}
                              onChange={(e) => {
                                const raw = e.target.value
                                maxField.handleChange(
                                  raw === "" ? undefined : Number(raw)
                                )
                              }}
                            />
                          </div>
                        )}
                      </formApi.Field>
                    </div>
                  ) : null}

                  {type === "single_choice" || type === "multi_choice" ? (
                    <ChoiceOptionsEditor
                      formApi={formApi}
                      optionsFieldName={optionsFieldName}
                      questionIndex={index}
                    />
                  ) : null}

                  <formApi.Field name={requiredFieldName as any}>
                    {(requiredField: any) => (
                      <Field orientation="horizontal" className="items-center">
                        <Checkbox
                          id={requiredField.name}
                          name={requiredField.name}
                          checked={Boolean(requiredField.state.value)}
                          onCheckedChange={(next) =>
                            requiredField.handleChange(Boolean(next))
                          }
                        />
                        <FieldContent>
                          <FieldTitle>
                            <Label htmlFor={requiredField.name}>Required</Label>
                          </FieldTitle>
                          <FieldDescription className="text-xs">
                            Require an answer before submit.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    )}
                  </formApi.Field>
                </div>
              </>
            )}
          </QuestionCard>
        )
      })}
    </div>
  )
}

function AddFormItemButton({
  icon: Icon,
  label,
  questionType,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  questionType: FormQuestionType
  onClick: () => void
}) {
  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: DND_TYPES.newFormItem,
      item: { kind: "new", questionType } satisfies NewFormItemDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [questionType]
  )

  React.useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true })
  }, [previewRef])

  return (
    <Button
      ref={dragRef as any}
      variant="outline"
      className={cn("justify-start", isDragging && "opacity-70")}
      onClick={onClick}
    >
      <Icon />
      {label}
    </Button>
  )
}

function SidebarWithDeleteOverlay({
  onRemoveQuestion,
  className,
  children,
}: {
  onRemoveQuestion: (questionId: string) => void
  className?: string
  children: React.ReactNode
}) {
  const [{ canDrop, isOver }, dropRef] = useDrop(
    () => ({
      accept: DND_TYPES.formQuestion,
      drop: (item: FormQuestionDrag) => {
        onRemoveQuestion(item.questionId)
      },
      collect: (monitor) => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver({ shallow: true }),
      }),
    }),
    [onRemoveQuestion]
  )

  return (
    <div ref={dropRef as any} className={cn("relative", className)}>
      {children}
      {canDrop ? (
        <div
          className={cn(
            "absolute inset-0 grid place-items-center rounded-lg border border-dashed bg-background/80 p-3 text-center backdrop-blur-sm",
            isOver ? "border-destructive/60" : "border-ring/40"
          )}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowDownUpIcon className="shrink-0" />
            <span>Drop here to delete</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Drag a question back to remove it from the form.
          </div>
        </div>
      ) : null}
    </div>
  )
}

function QuestionCard({
  questionId,
  index,
  moveQuestion,
  insertQuestion,
  className,
  children,
}: {
  questionId: string
  index: number
  moveQuestion: (dragIndex: number, hoverIndex: number) => void
  insertQuestion: (atIndex: number, type: FormQuestionType) => void
  className?: string
  children: (ctx: { dragRef: unknown }) => React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement | null>(null)

  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: DND_TYPES.formQuestion,
      item: { kind: "question", questionId, index } satisfies FormQuestionDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [questionId, index]
  )

  React.useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true })
  }, [previewRef])

  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: [DND_TYPES.formQuestion, DND_TYPES.newFormItem],
      hover: (item: FormQuestionDrag | NewFormItemDrag) => {
        if (!ref.current) return
        if (item.kind !== "question") return
        if (item.index === index) return
        moveQuestion(item.index, index)
        item.index = index
      },
      drop: (item: FormQuestionDrag | NewFormItemDrag) => {
        if (item.kind !== "new") return
        insertQuestion(index, item.questionType)
        return { handled: true }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    }),
    [index, moveQuestion, insertQuestion]
  )

  const setNodeRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node
      dropRef(node)
    },
    [dropRef]
  )

  return (
    <div
      ref={setNodeRef}
      data-question-card
      className={cn(
        "relative",
        className,
        isDragging && "select-none"
      )}
    >
      {isOver || isDragging ? (
        <div className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-ring/80" />
      ) : null}
      <div className={cn((isDragging || isOver) && "opacity-10")}>
        {children({ dragRef })}
      </div>
    </div>
  )
}

function FormBuilderDragLayer({ questions }: { questions: any[] }) {
  const collected = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    itemType: monitor.getItemType(),
    item: monitor.getItem() as any,
    currentOffset: monitor.getSourceClientOffset(),
  }))

  if (!collected.isDragging || !collected.currentOffset) {
    return null
  }

  const style: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 100,
    left: 0,
    top: 0,
    transform: `translate(${collected.currentOffset.x}px, ${collected.currentOffset.y}px)`,
  }

  const item = collected.item as any

  let questionType: FormQuestionType | null = null

  if (collected.itemType === DND_TYPES.newFormItem && item.kind === "new") {
    questionType = item.questionType ?? null
  }

  if (
    collected.itemType === DND_TYPES.formQuestion &&
    item.kind === "question" &&
    item.questionId
  ) {
    const q = questions.find((q) => q?.id === item.questionId)
    questionType = (q?.type as FormQuestionType) ?? null
  }

  if (!questionType) return null

  const meta = getQuestionMeta(questionType)
  const Icon = meta.icon

  return (
    <div style={style}>
      <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-card-foreground shadow-sm">
        <Icon />
        <span className="max-w-48 truncate font-medium">{meta.label}</span>
      </div>
    </div>
  )
}

function ChoiceOptionsEditor({
  formApi,
  optionsFieldName,
  questionIndex,
}: {
  formApi: any
  optionsFieldName: string
  questionIndex: number
}) {
  const base = `questions[${questionIndex}].options`

  return (
    <formApi.Field name={optionsFieldName as any} mode="array">
      {(optionsField: any) => {
        const options = Array.isArray(optionsField.state.value)
          ? optionsField.state.value
          : []

        function addOption() {
          const count = options.length + 1
          const label = `Option ${count}`
          const value = label.toLowerCase().replaceAll(/\s+/g, "_")
          optionsField.pushValue({ label, value })
        }

        return (
          <div className="rounded-lg border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Options</div>
              <Button variant="outline" size="sm" onClick={addOption}>
                <PlusIcon />
                Add option
              </Button>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {options.map((opt: any, optionIndex: number) => {
                const labelName = `${base}[${optionIndex}].label`
                const valueName = `${base}[${optionIndex}].value`
                const removeDisabled = options.length <= 1

                return (
                  <div
                    key={`${opt?.value ?? "opt"}_${optionIndex}`}
                    className="flex items-center gap-2"
                  >
                    <formApi.Field name={labelName as any}>
                      {(labelField: any) => (
                        <Input
                          name={labelField.name}
                          value={String(labelField.state.value ?? "")}
                          onBlur={labelField.handleBlur}
                          onChange={(e) => {
                            const label = e.target.value
                            const value = label
                              .toLowerCase()
                              .replaceAll(/\s+/g, "_")
                            labelField.handleChange(label)
                            ;(formApi as any).setFieldValue(valueName, () => value)
                          }}
                          autoComplete="off"
                        />
                      )}
                    </formApi.Field>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => optionsField.removeValue(optionIndex)}
                      aria-label="Remove option"
                      disabled={removeDisabled}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }}
    </formApi.Field>
  )
}

