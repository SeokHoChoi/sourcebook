# React Hook Form Curriculum (Phase 1)

Last updated: 2026-04-17  
Track: `frontend/react-hook-form`

## Source of truth

- Official site: <https://react-hook-form.com/>
- Docs repository: <https://github.com/react-hook-form/documentation>
- Content root: `src/content/`
- API docs root: `src/content/docs/`

This curriculum separates RHF docs by reading purpose:

- `Get Started`: onboarding sections
- `API`: reference-first pages
- `TS`, `Advanced`, `FAQs`: lookup/reference pages

## Intake unit rules

1. API docs: ingest by page.
2. Get Started: ingest by section.
3. TS/Advanced/FAQs: ingest by section or question block.
4. Raw source stays verbatim in `source.md`.
5. Korean annotations are stored only in `overlay.ko.json`.

## Learning sequence

### Stage A: Onboarding

1. Installation + Example
2. Register fields
3. Apply validation
4. Integrating Controlled Inputs
5. Schema Validation

### Stage B: Core API

1. useForm
2. register
3. handleSubmit
4. formState
5. watch
6. setValue
7. reset

### Stage C: Control / Context

1. useController
2. Controller
3. FormProvider
4. useFormContext
5. useFormState
6. useWatch

### Stage D: Dynamic Form

1. useFieldArray

### Stage E: Support API

1. getValues
2. trigger
3. clearErrors
4. setError
5. resetField
6. setFocus
7. getFieldState
8. control
9. Form
10. subscribe

### Stage F: Reference Extensions

1. TS overview
2. Advanced usage
3. FAQs
4. createFormControl
5. useLens

## Sample completion target for MVP

- Completed sections:
  - Stage A #1 Installation + Example
  - Stage A #2 Register fields
  - Stage A #3 Apply validation
- Completed API pages:
  - Stage B #1 useForm
  - Stage B #2 register

These five entries are the baseline for validating:

- source/structure/overlay flow
- learner event logging
- review queue updates
