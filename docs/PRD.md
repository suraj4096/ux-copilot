## Form Primitives:

| Type          | HTML Element            | Use Case                                        |
| ------------- | ----------------------- | ----------------------------------------------- |
| Short Text    | <input type="text">     | Names, emails, one-line answers                 |
| Long Text     | <textarea>              | Feedback, comments, open-ended paragraphs       |
| Number        | <input type="number">   | Age, ratings (1–10), quantities                 |
| Single Choice | <input type="radio">    | Pick exactly one — "How did you hear about us?" |
| Multi Choice  | <input type="checkbox"> | Pick one or more — "Which features do you use?" |

## What Each Input Needs

These are the minimum properties each question needs to function properly:

Label — the question text displayed above the input

Required flag — whether the field must be filled before submit

Placeholder — a hint inside the empty field (type="text", number, textarea)

Options array — for single/multi choice, a list of selectable items

Validation — show an error message if a required field is left blank on submit

---


## Form Template

```json
{
  "id": "form_01J2K8X",
  "title": "Customer Feedback Survey",
  "description": "Help us improve by sharing your experience.",
  "questions": [
    {
      "id": "q_01",
      "type": "short_text",
      "label": "What is your name?",
      "required": true,
      "placeholder": "e.g. Jane Doe"
    },
    {
      "id": "q_02",
      "type": "number",
      "label": "How would you rate us?",
      "required": true,
      "placeholder": "Enter a number",
      "min": 1,
      "max": 10
    },
    {
      "id": "q_03",
      "type": "long_text",
      "label": "Any additional feedback?",
      "required": false,
      "placeholder": "Write your thoughts..."
    },
    {
      "id": "q_04",
      "type": "single_choice",
      "label": "How did you hear about us?",
      "required": true,
      "options": [
        { "value": "search",   "label": "Search engine" },
        { "value": "social",   "label": "Social media" },
        { "value": "referral", "label": "Friend / referral" }
      ]
    },
    {
      "id": "q_05",
      "type": "multi_choice",
      "label": "Which features do you use?",
      "required": false,
      "options": [
        { "value": "dashboard", "label": "Dashboard" },
        { "value": "reports",   "label": "Reports" },
        { "value": "api",       "label": "API" }
      ]
    }
  ]
}
```

***

## Response (Submission)

```json
{
  "id": "resp_09A3Z1",
  "form_id": "form_01J2K8X",
  "submitted_at": "2026-04-09T08:30:00Z",
  "answers": [
    { "question_id": "q_01", "value": "Jane Doe" },
    { "question_id": "q_02", "value": 8 },
    { "question_id": "q_03", "value": "Really smooth experience." },
    { "question_id": "q_04", "value": "referral" },
    { "question_id": "q_05", "value": ["dashboard", "api"] }
  ]
}
```

***

## Field Reference

### Question fields

| Field | Required | Notes |
|---|---|---|
| `id` | ✅ | Stable unique ID — never change after creation |
| `type` | ✅ | `short_text` `long_text` `number` `single_choice` `multi_choice` |
| `label` | ✅ | The question text shown to the user |
| `required` | ✅ | `true` / `false` |
| `placeholder` | ➖ | Optional hint text for text/number inputs |
| `options` | ➖ | Only on `single_choice` / `multi_choice` |